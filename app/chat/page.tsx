import { Metadata } from "next";
import { ChatContainer } from "@/components/chat/ChatContainer";

export const metadata: Metadata = {
  title: "UltraCem | Chat — Calculadora de materiales",
  description:
    "Calcula cemento, arena y materiales de construcción con el asistente UltraCem. Resultados en menos de 90 segundos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChatPage() {
  return <ChatContainer />;
}
