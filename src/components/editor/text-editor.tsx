import { Editor, EditorContent } from "@tiptap/react";

export const TextEditor = ({ editor }: { editor: Editor | null }) => {
  return <EditorContent editor={editor} className="w-full h-full" />;
};
