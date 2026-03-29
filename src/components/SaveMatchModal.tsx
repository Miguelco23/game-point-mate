import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nContext";

interface SaveMatchModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<boolean>;
  defaultName?: string;
  isLoading?: boolean;
}

export function SaveMatchModal({
  open,
  onClose,
  onSave,
  defaultName = "",
  isLoading = false,
}: SaveMatchModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t.saved?.nameRequired || "Match name is required");
      return;
    }

    const success = await onSave(name.trim());
    if (success) {
      setName("");
      setError(null);
      onClose();
    } else {
      setError(t.saved?.saveFailed || "Failed to save match");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {t.saved?.modalTitle || "Save Match"}
          </DialogTitle>
          <DialogDescription>
            {t.saved?.modalDescription || "Give your match a name to save it"}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <Input
              type="text"
              placeholder={t.saved?.matchNamePlaceholder || "e.g., Board Game Night"}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              className="rounded-lg"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-destructive mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? (t.saved?.saving || "Saving...") : t.saved?.save || "Save"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
