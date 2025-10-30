"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, Check, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  appliedChanges?: string[];
  preview?: string;
}

interface PlanChatEditorProps {
  planId: string;
  orgId: string;
  onOpenWithSelection?: (selectedText: string) => void;
}

export function PlanChatEditor({ planId, orgId, onOpenWithSelection }: PlanChatEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I can help you edit your emergency plan. Try asking me to:\n\n• Remove a contact (e.g., 'Remove John Doe as a contact')\n• Change text (e.g., 'Change all instances of abc to xyz')\n• Add a section (e.g., 'Add a section about fire safety')\n• Update a section (e.g., 'Update the procedures section with...')\n\nWhat would you like to change?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expose method to open chat with selected text
  const openWithSelection = (text: string) => {
    console.log('[PlanChatEditor] openWithSelection called with:', text.substring(0, 50));
    setSelectedContext(text);
    setIsOpen(true);
    setIsMinimized(false);
    const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text;
    setInput(`Edit the selected text: "${truncated}" - `);
    console.log('[PlanChatEditor] State updated - isOpen:', true, 'input:', `Edit the selected text: "${truncated}" - `);
  };

  // Make this function available globally
  useEffect(() => {
    (window as any).openChatWithSelection = openWithSelection;

    return () => {
      delete (window as any).openChatWithSelection;
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/plans/${planId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          appliedChanges: data.appliedChanges,
          preview: data.preview,
        },
      ]);

      // Refresh the page if changes were applied
      if (data.applied) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="AI Plan Editor"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-40 w-96 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-lg shadow-2xl flex flex-col transition-all ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Plan Editor</h3>
                <p className="text-xs text-muted-foreground">Edit with natural language</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Show applied changes */}
                  {message.appliedChanges && message.appliedChanges.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
                      <p className="text-xs font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Changes Applied:
                      </p>
                      {message.appliedChanges.map((change, i) => (
                        <p key={i} className="text-xs opacity-90">
                          • {change}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Show preview */}
                  {message.preview && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-xs opacity-75">{message.preview}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {!isMinimized && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to edit your plan..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
