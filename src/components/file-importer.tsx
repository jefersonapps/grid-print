import { useHotkeys } from "react-hotkeys-hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  ImageIcon as ImageIconLucide,
  Type,
  Database,
} from "lucide-react";

interface FileImporterProps {
  onFileProcessing: (files: FileList | File[]) => void;
  onAddTextBlock: () => void;
  onGenerateFromDataClick: () => void;
}

export const FileImporter = ({
  onFileProcessing,
  onAddTextBlock,
  onGenerateFromDataClick,
}: FileImporterProps) => {
  useHotkeys("ctrl+v", async (e) => {
    e.preventDefault();
    const clipboardItems = await navigator.clipboard.read();
    const imageFiles: File[] = [];

    for (const item of clipboardItems) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          const file = new File([blob], "clipboard-image.png", {
            type: blob.type,
          });
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      onFileProcessing(imageFiles);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar e Criar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          htmlFor="file-upload"
          className="group flex flex-col items-center justify-center w-full p-4 sm:py-6 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer dark:bg-card dark:border-border hover:border-primary focus:outline-none"
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files) onFileProcessing(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex items-center">
            <ImageIconLucide className="h-10 w-10 text-muted-foreground z-10 transition-transform duration-300 ease-in-out group-hover:-rotate-[25deg] origin-bottom-right" />
            <FileText className="h-10 w-10 text-muted-foreground transition-transform duration-300 ease-in-out group-hover:rotate-[25deg] origin-bottom-left" />
          </div>
          <span className="mt-3 font-medium text-muted-foreground">
            Arraste imagens/PDF ou{" "}
            <span className="text-primary underline">
              clique para selecionar
            </span>
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            PDF, PNG, JPG
          </span>
        </label>
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files) {
              onFileProcessing(e.target.files);

              e.currentTarget.value = "";
            }
          }}
        />
        <Button variant="outline" className="w-full" onClick={onAddTextBlock}>
          <Type className="mr-2 h-4 w-4" />
          Adicionar Bloco de Texto
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onGenerateFromDataClick}
        >
          <Database className="mr-2 h-4 w-4" />
          Gerar a partir de Dados
        </Button>
      </CardContent>
    </Card>
  );
};
