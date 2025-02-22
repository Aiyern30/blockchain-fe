"use client";

import type React from "react";
import { useState } from "react";
import { MessageSquare, Maximize2, Minimize2, X } from "lucide-react";
import { Button, Input, ScrollArea } from "./ui";
import { chatWithAI } from "@/utils/chat";

interface Message {
  text: string;
  isUser: boolean;
  isError?: boolean;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleEnlarge = () => setIsEnlarged(!isEnlarged);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    const aiResponse = await chatWithAI(input);

    const isError =
      aiResponse.toLowerCase().includes("error") ||
      aiResponse.toLowerCase().includes("failed") ||
      aiResponse.toLowerCase().includes("limit");

    setMessages((prev) => [
      ...prev,
      { text: aiResponse, isUser: false, isError },
    ]);
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
            ${isEnlarged ? "fixed inset-4" : "w-96 h-[500px] max-h-[80vh]"}`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">Chat AI</h2>
            <div className="flex gap-2">
              <Button variant="default" size="icon" onClick={toggleEnlarge}>
                {isEnlarged ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button variant="default" size="icon" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-grow p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                } mt-2`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-xl text-sm whitespace-pre-wrap break-words max-w-[75%] shadow-md
                  ${
                    msg.isUser
                      ? "bg-primary text-white"
                      : msg.isError
                      ? "bg-red-100 text-red-500 border border-red-400"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
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
