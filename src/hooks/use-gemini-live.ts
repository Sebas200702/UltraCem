'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type LiveState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error';

interface UseGeminiLiveOptions {
  wsUrl?: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string, parsed: Record<string, unknown> | null) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: LiveState) => void;
}

interface LiveResponse {
  reply: string;
  intent: string;
  extractedData?: Record<string, unknown>;
  isReadyForCalculation: boolean;
}

const INPUT_SAMPLE_RATE = 16_000;
const OUTPUT_SAMPLE_RATE = 24_000;

const WS_URL = typeof window !== 'undefined'
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/chat/live`
  : 'ws://localhost:3000/api/chat/live';

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize)),
    );
  }
  return btoa(binary);
}

function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
}

export function useGeminiLive({
  wsUrl,
  onTranscript,
  onResponse,
  onError,
  onStateChange,
}: UseGeminiLiveOptions = {}) {
  const [state, setState] = useState<LiveState>('disconnected');
  const [inputTranscript, setInputTranscript] = useState('');
  const [outputTranscript, setOutputTranscript] = useState('');

  const stateRef = useRef<LiveState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  // separate audio contexts: input mic context @16kHz, output playback @24kHz
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micEnabledRef = useRef(false);

  // playback scheduling: each chunk starts where the previous one ended
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const url = wsUrl ?? WS_URL;

  const updateState = useCallback(
    (newState: LiveState) => {
      stateRef.current = newState;
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  const stopPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.onended = null;
        source.stop();
      } catch {}
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const playAudioChunk = useCallback(
    (pcmBase64: string, mimeType: string) => {
      let ac = outputContextRef.current;
      if (!ac) {
        const sampleRate = mimeType.includes('rate=24000')
          ? 24_000
          : mimeType.includes('rate=16000')
            ? 16_000
            : OUTPUT_SAMPLE_RATE;
        ac = new AudioContext({ sampleRate });
        outputContextRef.current = ac;
      }

      if (ac.state === 'suspended') {
        void ac.resume();
      }

      try {
        const int16 = base64ToInt16Array(pcmBase64);
        if (int16.length === 0) return;

        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
        }

        const audioBuffer = ac.createBuffer(1, float32.length, ac.sampleRate);
        audioBuffer.copyToChannel(float32, 0);

        const source = ac.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ac.destination);

        const now = ac.currentTime;
        // schedule sequentially. add a tiny safety margin on the very first chunk.
        const startAt = Math.max(now + 0.02, nextStartTimeRef.current);
        source.start(startAt);
        nextStartTimeRef.current = startAt + audioBuffer.duration;

        activeSourcesRef.current.add(source);

        if (stateRef.current !== 'speaking') {
          updateState('speaking');
        }

        source.onended = () => {
          activeSourcesRef.current.delete(source);
          // when no more chunks are queued, transition back to connected/listening
          if (
            activeSourcesRef.current.size === 0 &&
            stateRef.current === 'speaking'
          ) {
            // give the queue a brief moment to receive the next chunk
            setTimeout(() => {
              if (
                activeSourcesRef.current.size === 0 &&
                stateRef.current === 'speaking'
              ) {
                updateState(micEnabledRef.current ? 'listening' : 'connected');
              }
            }, 80);
          }
        };
      } catch (err) {
        console.error('[live] Audio playback error:', err);
      }
    },
    [updateState],
  );

  const stopMicrophone = useCallback(() => {
    micEnabledRef.current = false;
    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.disconnect();
      } catch {}
      workletNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startMicrophone = useCallback(async () => {
    if (micEnabledRef.current && workletNodeRef.current) {
      return;
    }

    try {
      let ac = inputContextRef.current;
      if (!ac) {
        ac = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
        inputContextRef.current = ac;
        await ac.audioWorklet.addModule('/audio-processor.js');
      } else if (ac.state === 'suspended') {
        await ac.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const source = ac.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(ac, 'pcm-processor');

      workletNode.port.onmessage = (event: MessageEvent) => {
        // skip sending audio while assistant is speaking to avoid feedback / barge-in confusion
        if (stateRef.current === 'speaking') return;

        const float32Data = event.data as Float32Array;
        const int16Data = float32ToInt16(float32Data);
        const base64 = arrayBufferToBase64(int16Data.buffer as ArrayBuffer);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'audio',
              data: base64,
              mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
            }),
          );
        }
      };

      source.connect(workletNode);
      workletNodeRef.current = workletNode;
      micEnabledRef.current = true;

      updateState('listening');
    } catch (err) {
      console.error('[live] Microphone error:', err);
      updateState('error');
      onError?.(err instanceof Error ? err.message : 'No se pudo acceder al micrófono');
      setTimeout(() => updateState('disconnected'), 2000);
    }
  }, [updateState, onError]);

  const connect = useCallback(async () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    updateState('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[live] WebSocket connected');
        ws.send(JSON.stringify({ type: 'start' }));
      };

      ws.onmessage = (event: MessageEvent) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(event.data as string) as Record<string, unknown>;
        } catch {
          return;
        }

        switch (msg.type) {
          case 'ready': {
            updateState('connected');
            void startMicrophone();
            break;
          }
          case 'audio': {
            const data = msg.data as string;
            const mimeType = (msg.mimeType as string) ?? 'audio/pcm;rate=24000';
            playAudioChunk(data, mimeType);
            break;
          }
          case 'input_transcription': {
            const text = (msg.text as string) ?? '';
            const finished = msg.finished as boolean;
            setInputTranscript(text);
            if (finished) {
              onTranscript?.(text);
            }
            break;
          }
          case 'output_transcription': {
            const text = (msg.text as string) ?? '';
            setOutputTranscript(text);
            break;
          }
          case 'turn_complete': {
            const text = (msg.text as string) ?? '';
            const parsed = msg.parsed as Record<string, unknown> | null;
            setOutputTranscript('');
            setInputTranscript('');

            if (text) {
              onResponse?.(text, parsed);
            }
            // do NOT restart the session — Gemini Live keeps the connection open.
            // the mic is already running; just let VAD pick up the next user turn.
            break;
          }
          case 'session_ended': {
            stopMicrophone();
            stopPlayback();
            updateState('disconnected');
            break;
          }
          case 'error': {
            const message = (msg.message as string) ?? 'Unknown error';
            console.error('[live] Server error:', message);
            onError?.(message);
            updateState('error');
            stopMicrophone();
            stopPlayback();
            setTimeout(() => updateState('disconnected'), 3000);
            break;
          }
        }
      };

      ws.onerror = (err) => {
        console.error('[live] WebSocket error:', err);
        updateState('error');
        onError?.('Error de conexión');
        setTimeout(() => updateState('disconnected'), 3000);
      };

      ws.onclose = () => {
        console.log('[live] WebSocket closed');
        stopMicrophone();
        stopPlayback();
        if (stateRef.current !== 'error') {
          updateState('disconnected');
        }
      };
    } catch (err) {
      console.error('[live] Connect error:', err);
      updateState('error');
      onError?.(err instanceof Error ? err.message : 'Conexión fallida');
    }
  }, [
    url,
    updateState,
    startMicrophone,
    playAudioChunk,
    stopMicrophone,
    stopPlayback,
    onTranscript,
    onResponse,
    onError,
  ]);

  const disconnect = useCallback(() => {
    stopMicrophone();
    stopPlayback();

    if (wsRef.current) {
      const ws = wsRef.current;
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'end' }));
        } catch {}
      }
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    }

    setInputTranscript('');
    setOutputTranscript('');
    updateState('disconnected');
  }, [stopMicrophone, stopPlayback, updateState]);

  const toggleConnection = useCallback(() => {
    const s = stateRef.current;
    if (s === 'disconnected' || s === 'error') {
      void connect();
    } else {
      disconnect();
    }
  }, [connect, disconnect]);

  const endTurn = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_turn' }));
      updateState('thinking');
    }
  }, [updateState]);

  const sendText = useCallback(
    (text: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'text', data: text }));
        updateState('thinking');
      }
    },
    [updateState],
  );

  useEffect(() => {
    return () => {
      stopMicrophone();
      stopPlayback();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      if (inputContextRef.current) {
        void inputContextRef.current.close();
        inputContextRef.current = null;
      }
      if (outputContextRef.current) {
        void outputContextRef.current.close();
        outputContextRef.current = null;
      }
    };
  }, [stopMicrophone, stopPlayback]);

  return {
    state,
    inputTranscript,
    outputTranscript,
    connect,
    disconnect,
    toggleConnection,
    endTurn,
    sendText,
    startMicrophone,
    stopMicrophone,
  };
}

export function parseLiveResponse(text: string): LiveResponse | null {
  try {
    const jsonMatch = /\{[\s\S]*\}/.exec(text);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    return {
      reply: (parsed.reply as string) ?? text,
      intent: (parsed.intent as string) ?? 'unknown',
      extractedData: (parsed.extractedData as Record<string, unknown>) ?? {},
      isReadyForCalculation: Boolean(parsed.isReadyForCalculation),
    };
  } catch {
    return null;
  }
}
