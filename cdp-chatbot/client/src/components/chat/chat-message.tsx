import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Split message content into lines for better formatting
  const lines = message.content.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-2",
        message.isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          message.isBot ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.isBot ? <Bot size={20} /> : <User size={20} />}
      </div>

      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          message.isBot
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {lines.map((line, index) => (
          <div 
            key={index}
            className={cn(
              "whitespace-pre-wrap",
              // Add margin between paragraphs
              index > 0 && line.trim() !== "" && "mt-2"
            )}
          >
            {line}
          </div>
        ))}
      </div>
    </motion.div>
  );
}