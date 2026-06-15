"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function EcoCoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI Eco-Coach. Ask me for personalized sustainability tips based on your logs!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Oops, something went wrong on my end." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full max-w-md bg-zinc-950/50 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-indigo-600 p-4 flex items-center gap-2 text-white shadow-md z-10">
        <Sparkles className="h-5 w-5 text-yellow-300" />
        <h3 className="font-bold">Eco-Coach AI</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === "user" 
                ? "bg-emerald-500 text-white rounded-br-none" 
                : "bg-zinc-800 text-zinc-200 rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span className="text-xs text-zinc-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-900 border-t border-zinc-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about reducing emissions..."
            className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-zinc-500 transition-all"
          />
          <Button type="submit" disabled={!input.trim() || loading} className="rounded-xl px-3 bg-indigo-600 hover:bg-indigo-500">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
