import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nContext";

interface MultiplierControlProps {
  currentMultiplier: number;
  onChange: (multiplier: number) => void;
}

const MULTIPLIER_OPTIONS = [1, 2, 3, 5];

/**
 * MultiplierControl - Compact horizontal button group for score multipliers
 * Shows quick buttons for common multipliers (1x, 2x, 3x, 5x)
 * Active multiplier is highlighted with a badge
 */
export function MultiplierControl({ currentMultiplier, onChange }: MultiplierControlProps) {
  const { t } = useI18n();
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleCustomApply = () => {
    const num = parseInt(customValue, 10);
    if (!isNaN(num) && num > 0) {
      onChange(num);
      setCustomValue("");
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t.match?.multiplier || "Multiplicador"}
      </div>

      {/* Quick multiplier buttons */}
      <div className="flex gap-1.5">
        {MULTIPLIER_OPTIONS.map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(m)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              currentMultiplier === m
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            ×{m}
          </motion.button>
        ))}

        {/* Custom multiplier button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustom(!showCustom)}
          className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            showCustom
              ? "bg-primary/20 text-primary ring-2 ring-primary/40"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          title="Custom multiplier"
        >
          +
        </motion.button>
      </div>

      {/* Custom input */}
      {showCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex gap-1.5"
        >
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={t.match?.enterMultiplier || "×value"}
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm font-bold text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCustomApply()}
          />
          <button
            onClick={handleCustomApply}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm transition-colors hover:bg-primary/90 active:scale-95"
          >
            {t.match?.apply || "OK"}
          </button>
        </motion.div>
      )}

      {/* Active badge indicator */}
      {currentMultiplier > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 border border-primary/30 rounded-lg"
        >
          <span className="text-xs font-semibold text-primary">
            Multiplicador activo: ×{currentMultiplier}
          </span>
        </motion.div>
      )}
    </div>
  );
}
