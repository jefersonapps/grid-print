import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DuplicateItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  itemName: string;
}

export const DuplicateItemDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DuplicateItemDialogProps) => {
  const [inputValue, setInputValue] = useState("1");

  useEffect(() => {
    if (isOpen) {
      setInputValue("1");
    }
  }, [isOpen]);

  const handleConfirmClick = () => {
    const quantity = parseInt(inputValue, 10);

    if (isNaN(quantity) || quantity < 1) {
      toast.error("A quantidade deve ser um número maior ou igual a 1.");
      return;
    }
    onConfirm(quantity);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Cópias</DialogTitle>
          <DialogDescription>
            Quantas cópias de "{itemName}" você deseja criar?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantidade
            </Label>
            <Input
              id="quantity"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="col-span-3 [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              onFocus={(e) => e.target.select()}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmClick}>Criar Cópias</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
