"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, BotMessageSquare, X, RotateCcw } from "lucide-react";
import { faqCategories, faqData } from "../data/faqData";

type ChatMessage = {
  id: string;
  type: "bot" | "user";
  text?: string;
  options?: { id: string; label: string; action: "category" | "question" }[];
  showWhatsApp?: boolean;
};

export function AIChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("sai_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("sai_chat_history", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const addMessage = (msg: Omit<ChatMessage, "id">) => {
    const newMessage = { ...msg, id: Date.now().toString() + Math.random().toString() };
    setMessages((prev) => [...prev, newMessage as ChatMessage]);
  };

  const showMainMenu = () => {
    addMessage({
      type: "bot",
      text: "How can I help you today? Select a topic below:",
      options: faqCategories.map((c) => ({ id: c.id, label: c.label, action: "category" })),
    });
  };

  // Initialize chat if opening for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      showMainMenu();
    }
  }, [isOpen, messages.length]);

  const handleOptionClick = (option: { id: string; label: string; action: "category" | "question" }) => {
    // Add user message
    addMessage({ type: "user", text: option.label });

    setTimeout(() => {
      if (option.action === "category") {
        const categoryQuestions = faqData.filter((q) => q.category === option.id);
        if (categoryQuestions.length > 0) {
          addMessage({
            type: "bot",
            text: `Here are some common questions about ${option.label}:`,
            options: categoryQuestions.map((q) => ({ id: q.id, label: q.question, action: "question" })),
          });
        } else {
          addMessage({
            type: "bot",
            text: "I couldn't find any specific questions for this category.",
            showWhatsApp: true,
          });
        }
      } else if (option.action === "question") {
        const question = faqData.find((q) => q.id === option.id);
        if (question) {
          const followUpOptions = question.followUps
            ?.map((id) => faqData.find((q) => q.id === id))
            .filter(Boolean)
            .map((q) => ({ id: q!.id, label: q!.question, action: "question" as const })) || [];

          addMessage({
            type: "bot",
            text: question.answer,
            options: followUpOptions.length > 0 ? followUpOptions : undefined,
            showWhatsApp: true, // Show WhatsApp handoff after every answer per user request
          });
        }
      }
    }, 500); // Small delay to feel conversational
  };

  const handleReset = () => {
    setMessages([]);
    sessionStorage.removeItem("sai_chat_history");
    setTimeout(() => {
      showMainMenu();
    }, 50);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-50 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 ${
          isOpen ? "bottom-[5.5rem] right-6 opacity-0 pointer-events-none scale-0" : "bottom-[5.5rem] right-6 opacity-100 scale-100"
        } duration-300`}
        aria-label="Sai Support"
      >
        <BotMessageSquare className="w-6 h-6" />
        <span className="absolute -inset-1 rounded-full border border-blue-600 animate-ping opacity-20 pointer-events-none"></span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[580px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-gray-100 dark:border-slate-800 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <BotMessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Sai Support</h3>
              <p className="text-blue-100 text-xs">Automated Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
              title="Main Menu"
              aria-label="Main Menu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 dark:bg-slate-950 relative">
          {messages.map((msg, index) => {
            const isBot = msg.type === "bot";
            // Check if this message is the last one in the array
            const isLast = index === messages.length - 1;

            return (
              <div key={msg.id} className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
                {msg.text && (
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      isBot
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm"
                        : "bg-blue-600 text-white rounded-tr-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Options (Buttons) */}
                {msg.options && msg.options.length > 0 && (
                  <div className={`mt-3 flex flex-col gap-2 w-full max-w-[85%] ${isLast ? "" : "opacity-50 pointer-events-none"}`}>
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionClick(opt)}
                        className={`text-left px-4 py-3 rounded-xl text-sm border transition-colors shadow-sm ${
                          isLast
                            ? "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
                            : "bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* WhatsApp Handoff */}
                {msg.showWhatsApp && (
                  <div className={`mt-3 w-full max-w-[85%] ${isLast ? "" : "opacity-50 pointer-events-none"}`}>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 px-1">Still have questions?</div>
                    <a
                      href={`https://wa.me/919148600888?text=${encodeURIComponent("Hi, I need some help.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#20bd59] transition-colors shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                      </svg>
                      Chat with us on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>
    </>
  );
}
