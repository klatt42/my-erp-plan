"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  editable = true,
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  // Update content when it changes from outside
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      {editable && (
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r pr-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("strike") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("code") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r pr-1 mr-1">
            <Button
              type="button"
              variant={
                editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r pr-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r pr-1 mr-1">
            <Button
              type="button"
              variant={
                editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Block Types */}
          <div className="flex gap-1 border-r pr-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          {/* History */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
