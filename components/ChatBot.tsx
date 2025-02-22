"use client";

import type React from "react";
import { useState } from "react";
import { MessageSquare, Maximize2, Minimize2, X } from "lucide-react";
import { Button, Input, ScrollArea } from "./ui";

interface Message {
  text: string;
  isUser: boolean;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleEnlarge = () => setIsEnlarged(!isEnlarged);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      // Here you would typically send the message to your AI backend
      // and then add the AI's response to the messages
      setMessages((prev) => [
        ...prev,
        { text: "AI response placeholder", isUser: false },
      ]);
      setInput("");
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${isOpen ? "flex flex-col" : ""}`}
    >
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="rounded-full w-12 h-12 bg-primary text-primary-foreground shadow-lg"
        >
          <MessageSquare />
        </Button>
      )}
      {isOpen && (
        <div
          className={`bg-background border rounded-lg shadow-xl flex flex-col
            ${isEnlarged ? "fixed inset-4" : "w-80 h-96"}`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">Chat AI</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={toggleEnlarge}>
                {isEnlarged ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-grow p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg ${
                  msg.isUser
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                } max-w-[80%]`}
              >
                {msg.text}
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
