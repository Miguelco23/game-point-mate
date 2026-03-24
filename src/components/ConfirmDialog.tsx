import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, destructive,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-xl p-6 w-full max-w-sm border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium transition-colors hover:bg-secondary/80"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                  destructive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
