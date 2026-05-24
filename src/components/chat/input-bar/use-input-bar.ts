import { type FormEvent, type KeyboardEvent, useState } from "react";
import { type InputBarProps } from '@/components/chat/input-bar/input-bar-types';

export function useInputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return {
    handleKeyDown,
    handleSubmit,
    setValue,
    value,
  };
}
