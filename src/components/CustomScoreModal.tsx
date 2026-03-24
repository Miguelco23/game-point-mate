import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

interface CustomScoreModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
}

const PRESET_VALUES = [1, 2, 3, 5, 10, 15, 20, 25, 50];

export function CustomScoreModal({ open, onClose, onApply }: CustomScoreModalProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [isNegative, setIsNegative] = useState(false);

  const handleApply = () => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num !== 0) {
      onApply(isNegative ? -Math.abs(num) : Math.abs(num));
      setValue("");
      setIsNegative(false);
    }
  };

  const handlePreset = (v: number) => {
    onApply(isNegative ? -v : v);
    setValue("");
    setIsNegative(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-card rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-sm border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              {t.match.customValue}
            </h3>

            {/* +/- toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsNegative(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                  !isNegative
                    ? "bg-success/20 text-success ring-2 ring-success/40"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Plus size={16} strokeWidth={3} /> Add
              </button>
              <button
                onClick={() => setIsNegative(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                  isNegative
                    ? "bg-destructive/20 text-destructive ring-2 ring-destructive/40"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Minus size={16} strokeWidth={3} /> Subtract
              </button>
            </div>

            {/* Presets grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESET_VALUES.map((v) => (
                <button
                  key={v}
                  onClick={() => handlePreset(v)}
                  className={`py-3 rounded-xl font-display font-bold text-base transition-all active:scale-90 ${
                    isNegative
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : "bg-success/10 text-success hover:bg-success/20"
                  }`}
                >
                  {isNegative ? "-" : "+"}{v}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.match.enterValue}
                className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-center text-xl font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
              />
              <button
                onClick={handleApply}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold transition-colors hover:bg-primary/90 active:scale-95"
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
