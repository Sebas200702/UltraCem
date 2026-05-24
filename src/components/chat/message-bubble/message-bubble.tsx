"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { type MessageBubbleProps } from '@/components/chat/message-bubble/message-bubble-types';

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Renderiza markdown básico de forma segura sin librerías externas.
 * Soporta: negritas, bullets, enlaces, divisores y saltos de línea.
 */
function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-1.5 ml-4 list-disc space-y-0.5 text-body-sm">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // link [text](url)
      const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/);
      if (linkMatch) {
        if (linkMatch[1]) parts.push(<span key={key++}>{linkMatch[1]}</span>);
        parts.push(
          <a
            key={key++}
            href={linkMatch[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ultracem-blue underline hover:text-ultracem-blue/80"
            onClick={(e) => e.stopPropagation()}
          >
            {linkMatch[2]}
          </a>
        );
        remaining = linkMatch[4];
        continue;
      }

      // bold **text**
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
        parts.push(<strong key={key++} className="font-semibold">{boldMatch[2]}</strong>);
        remaining = boldMatch[3];
        continue;
      }

      // italic *text* (single asterisk, not bullet)
      const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)$/);
      if (italicMatch) {
        if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
        parts.push(<em key={key++} className="italic">{italicMatch[2]}</em>);
        remaining = italicMatch[3];
        continue;
      }

      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // divider *** or ---
    if (/^\s*(\*{3,}|-{3,})\s*$/.test(line)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-2 border-ultracem-gray-200" />);
      continue;
    }

    // bullet
    if (/^\s*[-*]\s+/.test(line)) {
      inList = true;
      const text = line.replace(/^\s*[-*]\s+/, '');
      listItems.push(<li key={`li-${i}`}>{parseInline(text)}</li>);
      continue;
    }

    // empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-body-sm leading-relaxed">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  return elements;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const [copied, setCopied] = useState(false);

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[80%] rounded-full bg-red-50 px-4 py-2 text-center text-caption text-red-700 animate-fade-in-up">
          {message.content}
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: isUser ? "Mi mensaje - UltraCem" : "Mensaje de Vanesa - UltraCem",
          text: message.content,
        });
      }
    } catch {
      // User cancelled or share failed silently
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Copy failed silently
    }
  };

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
          <div className="relative z-10 space-y-1">
            {renderMarkdown(message.content)}
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

          <button
            onClick={handleShare}
            className="ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium text-ultracem-gray-500 transition-colors hover:bg-ultracem-gray-100 hover:text-ultracem-gray-900"
            title="Compartir mensaje"
            aria-label="Compartir mensaje"
          >
            <Share2 className="h-3 w-3" />
            <span>Compartir</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium text-ultracem-gray-500 transition-colors hover:bg-ultracem-gray-100 hover:text-ultracem-gray-900"
            title={copied ? "Copiado" : "Copiar mensaje"}
            aria-label={copied ? "Copiado al portapapeles" : "Copiar mensaje"}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
