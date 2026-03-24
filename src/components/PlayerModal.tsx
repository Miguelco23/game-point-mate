import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, PLAYER_COLORS } from "@/store/gameTypes";
import { useI18n } from "@/i18n/I18nContext";

interface PlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  onDelete?: () => void;
  player?: Player | null;
  defaultColor: string;
}

export function PlayerModal({ open, onClose, onSave, onDelete, player, defaultColor }: PlayerModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);

  useEffect(() => {
    if (open) {
      setName(player?.name ?? "");
      setColor(player?.color ?? defaultColor);
    }
  }, [open, player, defaultColor]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
    setName("");
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
            className="bg-card rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              {player ? t.player.edit : t.player.add}
            </h3>

            <label className="text-sm text-muted-foreground mb-1.5 block">{t.player.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.player.namePlaceholder}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />

            <label className="text-sm text-muted-foreground mb-2 block">{t.player.color}</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {PLAYER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: `hsl(${c})` }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {player && onDelete && (
                <button
                  onClick={onDelete}
                  className="py-2.5 px-4 rounded-lg bg-destructive/20 text-destructive font-medium transition-colors hover:bg-destructive/30"
                >
                  {t.player.delete}
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-lg bg-secondary text-secondary-foreground font-medium transition-colors hover:bg-secondary/80"
              >
                {t.match.cancel}
              </button>
              <button
                onClick={handleSave}
                className="py-2.5 px-6 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90"
              >
                {t.player.save}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
