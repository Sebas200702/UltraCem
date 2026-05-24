export interface InputBarProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  liveState?: 'disconnected' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'error';
  interimText?: string;
  onVoiceToggle?: () => void;
}