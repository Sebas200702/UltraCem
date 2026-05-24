"use client";

import { type MessageBubbleProps } from '@/components/chat/message-bubble/message-bubble-types';

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function renderContent(content: string) {
  const parts = content.split(/(\*\*.*?\*\*|\n)/);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part === "\n") {
      return <br key={i} />;
    }

    return <span key={i}>{part}</span>;
  });
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[80%] rounded-full bg-red-50 px-4 py-2 text-center text-caption text-red-700 animate-fade-in-up">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] ${
          isUser ? "animate-slide-in-right" : "animate-slide-in-left"
        }`}
      >
        {!isUser && (
          <div className="absolute -left-2 top-4 h-8 w-1 rounded-full bg-ultracem-yellow" />
        )}

        <div
          className={`relative overflow-hidden px-4 py-3 ${
            isUser
              ? "rounded-2xl rounded-br-sm bg-ultracem-blue text-white"
              : "rounded-2xl rounded-bl-sm border border-ultracem-gray-100 bg-ultracem-surface text-ultracem-gray-900 shadow-sm"
          }`}
        >
          <div className="relative z-10">
            <p className="text-body-sm leading-relaxed">
              {renderContent(message.content)}
            </p>
          </div>
        </div>

        <div
          className={`mt-1 flex items-center gap-1 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-caption uppercase tracking-wider text-ultracem-gray-600">
            {formatTime(message.timestamp)}
          </span>
          {isUser && (
            <svg
              className="h-3 w-3 text-ultracem-blue"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
