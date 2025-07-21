import { Editor, EditorContent } from "@tiptap/react";

export const TextEditor = ({
  editor,
}: {
  editor: Editor | null | undefined;
}) => {
  if (!editor) return null;
  return <EditorContent editor={editor} className="w-full h-full" />;
};
