import { createServer } from 'http';
import { parse } from 'url';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import next from 'next';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  GoogleGenAI,
  MediaResolution,
  Modality,
  type Session,
  type LiveServerMessage,
} from '@google/genai';

// load .env files manually so the server works the same with `node`, `tsx`, or `bun`.
// next.js will also load them during app.prepare(), but the websocket handler may read
// process.env before that finishes, so we load eagerly here.
function loadEnvFile(filename: string) {
  const p = resolve(process.cwd(), filename);
  if (!existsSync(p)) return;
  const content = readFileSync(p, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

const LIVE_SYSTEM_PROMPT = `Eres Vanesa, la asistente de voz de UltraCem. Hablas en español colombiano de forma clara, breve y natural, como si hablaras por teléfono con un maestro de obra.

CONTEXTO:
- Usuario típico: maestro de obra colombiano con años de experiencia
- Acepta términos coloquiales: "fundir" (vaciar concreto), "bulto" (saco 50kg), "bloque de 15" (0.15m), "pañetar" (revoque)
- Responde de forma BREVE (2-3 frases). No leas listas largas — esto es audio, no texto.

ESTRUCTURAS SOPORTADAS:
1. PLACA/LOSA: largo × ancho × espesor
2. MURO: largo × alto × espesor
3. COLUMNA: base × altura
4. REVOQUE: área × espesor

REGLAS:
- Responde SOLO con frases naturales para el usuario. No respondas en JSON, XML, markdown ni bloques de código.
- Nunca leas nombres de campos como "reply", "intent", "extractedData" o "isReadyForCalculation".
- Convierte a metros: "bloque de 15" = 0.15m, "bulto" = bolsa 50kg
- Si falta algo, pregunta de forma breve
- No más de 2 preguntas antes de calcular
- Si tienes TODA la info, confirma con una frase clara y breve
- Habla de forma natural, nunca digas "en formato JSON"`;

interface ClientSession {
  geminiSession: Session | null;
  extractedData: Record<string, unknown>;
  inputTranscriptBuffer: string;
  textBuffer: string;
  outputTranscriptBuffer: string;
}

function handleGeminiMessage(
  msg: LiveServerMessage,
  ws: WebSocket,
  clientSession: ClientSession,
) {
  if (msg.serverContent) {
    const content = msg.serverContent;

    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if ('text' in part && part.text) {
          clientSession.textBuffer += part.text;
        }
        if ('inlineData' in part && part.inlineData) {
          ws.send(
            JSON.stringify({
              type: 'audio',
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType,
            }),
          );
        }
      }
    }

    if (content.inputTranscription?.text) {
      clientSession.inputTranscriptBuffer += content.inputTranscription.text;
      const finished = content.inputTranscription.finished ?? false;
      const text = finished
        ? clientSession.inputTranscriptBuffer.trim()
        : clientSession.inputTranscriptBuffer;

      ws.send(
        JSON.stringify({
          type: 'input_transcription',
          text,
          finished,
        }),
      );

      if (finished) {
        clientSession.inputTranscriptBuffer = '';
      }
    }

    if (content.outputTranscription?.text) {
      clientSession.outputTranscriptBuffer += content.outputTranscription.text;
      ws.send(
        JSON.stringify({
          type: 'output_transcription',
          text: content.outputTranscription.text,
          finished: content.outputTranscription.finished ?? false,
        }),
      );
    }

    if (content.turnComplete) {
      const fullText = (clientSession.textBuffer || clientSession.outputTranscriptBuffer).trim();
      clientSession.inputTranscriptBuffer = '';
      clientSession.textBuffer = '';
      clientSession.outputTranscriptBuffer = '';

      let parsed: Record<string, unknown> | null = null;
      try {
        const jsonMatch = /\{[\s\S]*\}/.exec(fullText);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        }
      } catch {}

      const responseText = typeof parsed?.reply === 'string' ? parsed.reply : fullText;

      ws.send(
        JSON.stringify({
          type: 'turn_complete',
          text: responseText,
          parsed,
        }),
      );
    }
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url ?? '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const wss = new WebSocketServer({ server, path: '/api/chat/live' });

  wss.on('connection', async (ws: WebSocket) => {
    const clientSession: ClientSession = {
      geminiSession: null,
      extractedData: {},
      inputTranscriptBuffer: '',
      textBuffer: '',
      outputTranscriptBuffer: '',
    };

    console.log('[live] Client connected');

    ws.on('message', async (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        return;
      }

      switch (msg.type) {
        case 'start': {
          // if a session is already alive, keep using it instead of restarting.
          // this prevents losing context between turns.
          if (clientSession.geminiSession) {
            ws.send(JSON.stringify({ type: 'ready' }));
            return;
          }

          const extractedData = (msg.extractedData as Record<string, unknown>) ?? {};
          clientSession.extractedData = extractedData;
          clientSession.inputTranscriptBuffer = '';
          clientSession.textBuffer = '';
          clientSession.outputTranscriptBuffer = '';

          try {
            const apiKey = process.env.GEMINI_API_KEY ?? '';
            if (!apiKey) {
              console.error('[live] GEMINI_API_KEY not configured');
              ws.send(JSON.stringify({ type: 'error', message: 'GEMINI_API_KEY no configurada en el servidor' }));
              return;
            }

            const ai = new GoogleGenAI({ apiKey });

            clientSession.geminiSession = await ai.live.connect({
              model: 'models/gemini-3.1-flash-live-preview',
              callbacks: {
                onopen: () => {
                  console.log('[live] Gemini session opened');
                  ws.send(JSON.stringify({ type: 'ready' }));
                },
                onmessage: (msg: LiveServerMessage) => {
                  handleGeminiMessage(msg, ws, clientSession);
                },
                onerror: (err: ErrorEvent) => {
                  console.error('[live] Gemini error:', err);
                  ws.send(JSON.stringify({ type: 'error', message: String(err.message ?? err) }));
                },
                onclose: (evt: CloseEvent) => {
                  console.log('[live] Gemini session closed:', evt.code, evt.reason);
                  ws.send(JSON.stringify({ type: 'session_ended' }));
                  clientSession.geminiSession = null;
                },
              },
              config: {
                systemInstruction: LIVE_SYSTEM_PROMPT,
                responseModalities: [Modality.AUDIO, Modality.TEXT],
                mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: 'Zephyr',
                    },
                  },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                contextWindowCompression: {
                  triggerTokens: '104857',
                  slidingWindow: { targetTokens: '52428' },
                },
              },
            });
          } catch (err) {
            console.error('[live] Failed to start Gemini session:', err);
            ws.send(
              JSON.stringify({
                type: 'error',
                message: err instanceof Error ? err.message : 'Failed to start session',
              }),
            );
          }
          break;
        }

        case 'audio': {
          const audioData = msg.data as string;
          const mimeType = (msg.mimeType as string) ?? 'audio/pcm;rate=16000';

          if (clientSession.geminiSession) {
            clientSession.geminiSession.sendRealtimeInput({
              audio: {
                data: audioData,
                mimeType,
              },
            });
          }
          break;
        }

        case 'text': {
          const textData = msg.data as string;
          if (clientSession.geminiSession) {
            clientSession.geminiSession.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: textData }] }],
            });
          }
          break;
        }

        case 'end_turn': {
          if (clientSession.geminiSession) {
            clientSession.geminiSession.sendClientContent({
              turnComplete: true,
            });
          }
          break;
        }

        case 'end': {
          if (clientSession.geminiSession) {
            clientSession.geminiSession.close();
            clientSession.geminiSession = null;
          }
          clientSession.inputTranscriptBuffer = '';
          clientSession.textBuffer = '';
          clientSession.outputTranscriptBuffer = '';
          ws.send(JSON.stringify({ type: 'session_ended' }));
          break;
        }
      }
    });

    ws.on('close', () => {
      if (clientSession.geminiSession) {
        clientSession.geminiSession.close();
      }
      console.log('[live] Client disconnected');
    });

    ws.on('error', (err) => {
      console.error('[live] WebSocket error:', err);
      if (clientSession.geminiSession) {
        clientSession.geminiSession.close();
      }
    });
  });

  server.listen(port, () => {
    console.log(`[ultracem] Ready on http://${hostname}:${port}`);
    console.log(`[ultracem] Live WebSocket on ws://${hostname}:${port}/api/chat/live`);
  });
});
