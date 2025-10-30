"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function SelectionEditButton() {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && selection && selection.rangeCount > 0) {
        // Get the position of the selection
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          if (rect) {
            setSelectedText(text);
            setPosition({
              top: rect.bottom + window.scrollY + 5,
              left: rect.left + window.scrollX + rect.width / 2,
            });
          }
        } catch (e) {
          // Ignore errors when selection is cleared
          setSelectedText("");
          setPosition(null);
        }
      } else {
        setSelectedText("");
        setPosition(null);
      }
    };

    // Listen for mouseup to detect selections
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, []);

  const handleEditClick = () => {
    console.log('[SelectionEditButton] Button clicked with text:', selectedText.substring(0, 50));
    console.log('[SelectionEditButton] openChatWithSelection exists?', !!(window as any).openChatWithSelection);

    if ((window as any).openChatWithSelection) {
      (window as any).openChatWithSelection(selectedText);
      console.log('[SelectionEditButton] Called openChatWithSelection');
    } else {
      console.error('[SelectionEditButton] openChatWithSelection not found on window');
    }

    // Clear selection
    window.getSelection()?.removeAllRanges();
    setSelectedText("");
    setPosition(null);
  };

  if (!selectedText || !position) return null;

  return (
    <button
      onClick={handleEditClick}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <Sparkles className="h-4 w-4" />
      Edit with AI
    </button>
  );
}
