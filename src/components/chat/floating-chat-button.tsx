"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { ChatBox } from "./chat-box";
import { useState } from "react";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0">
          <ChatBox onClose={() => setIsOpen(false)} />
        </div>
      )}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
} 