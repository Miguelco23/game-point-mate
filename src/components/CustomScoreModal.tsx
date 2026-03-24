import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/I18nContext";

interface CustomScoreModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
}

export function CustomScoreModal({ open, onClose, onApply }: CustomScoreModalProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  const handleApply = () => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num !== 0) {
      onApply(num);
      setValue("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-xl p-6 w-full max-w-xs border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              {t.match.customValue}
            </h3>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.match.enterValue}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-center text-2xl font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium transition-colors hover:bg-secondary/80"
              >
                {t.match.cancel}
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90"
              >
                {t.match.apply}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
