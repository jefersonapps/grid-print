import { Editor } from "@tiptap/react";
import { TextSelection } from "prosemirror-state";
import { toast } from "sonner";
import { getEditorExtensions } from "./extensions";
import { readFileAsDataURL } from "@/lib/utils";

export const createNewEditor = (
  content: string,
  onFocus: ({ editor }: { editor: Editor }) => void,
  onBlur: ({ editor }: { editor: Editor }) => void
): Editor => {
  return new Editor({
    extensions: getEditorExtensions(),
    content: content,
    editorProps: {
      attributes: { class: "ProseMirror" },
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.items || [])
          .find((item) => item.type.startsWith("image/"))
          ?.getAsFile();
        if (file) {
          event.preventDefault();
          toast.info("Processando imagem colada...");
          readFileAsDataURL(file)
            .then((url) => {
              const { state } = view;
              const { schema } = state;
              const node = schema.nodes.image.create({ src: url });
              const transaction = state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
              toast.success("Imagem colada com sucesso!");
            })
            .catch((err) => {
              console.error(err);
              toast.error("Falha ao colar imagem.");
            });
          return true;
        }
        return false;
      },
      handleClick(view, pos, event) {
        if (event.target === view.dom && !view.state.selection.empty) {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.tr.doc, pos)
            )
          );
          return true;
        }
        return false;
      },
    },
    onFocus,
    onBlur,
  });
};
