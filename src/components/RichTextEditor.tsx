import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Enter content here...",
  label,
  required = false,
  className = "",
}: RichTextEditorProps) => {
  const [editorValue, setEditorValue] = useState(value);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  // Handle paste events to preserve formatting
  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    
    // Add paste event listener
    quill.root.addEventListener('paste', (event) => {
      // Prevent default paste behavior
      event.preventDefault();
      
      // Get pasted data via clipboard API
      const clipboardData = event.clipboardData || (window as any).clipboardData;
      const pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
      
      // If HTML data is available, paste it as HTML to preserve formatting
      if (clipboardData.getData('text/html')) {
        const selection = quill.getSelection();
        if (selection) {
          quill.clipboard.dangerouslyPasteHTML(selection.index, pastedData);
        }
      } else {
        // If only plain text, paste as plain text
        const plainText = clipboardData.getData('text/plain');
        const selection = quill.getSelection();
        if (selection) {
          quill.insertText(selection.index, plainText);
          quill.setSelection(selection.index + plainText.length);
        }
      }
    });

    return () => {
      // Clean up event listener
      quill.root.removeEventListener('paste', () => {});
    };
  }, []);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  // Define toolbar options
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    clipboard: {
      // Preserve formatting on paste
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="rounded-md border border-input bg-background">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="min-h-[200px]"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: To preserve formatting when pasting, use Ctrl+V (Windows) or Cmd+V (Mac). 
        For best results with complex formatting, paste into the editor first, then adjust as needed.
      </p>
    </div>
  );
};

export default RichTextEditor;