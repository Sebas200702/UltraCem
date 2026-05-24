export interface LiveButtonProps {
  state: 'disconnected' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'error';
  interimText?: string;
  onToggle: () => void;
  disabled?: boolean;
}