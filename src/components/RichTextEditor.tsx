import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (content: string, delta: any, source: any, editor: any) => {
    setEditorValue(content);
    onChange(content);
  };

  // Define toolbar options with more formatting options
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
      // Allow all formats to be pasted
      allowed: {
        tags: [
          'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'hr'
        ],
        attributes: [
          'class', 'id', 'href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'align'
        ]
      }
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
    "blockquote",
    "code",
    "code-block",
    "hr"
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
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;