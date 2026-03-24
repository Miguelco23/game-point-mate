import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, X } from "lucide-react";
import { Player, PLAYER_COLORS } from "@/store/gameTypes";
import { useI18n } from "@/i18n/I18nContext";

interface PlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  onBulkSave?: (names: string[]) => void;
  onDelete?: () => void;
  player?: Player | null;
  defaultColor: string;
  usedColors?: string[];
}

export function PlayerModal({ open, onClose, onSave, onBulkSave, onDelete, player, defaultColor, usedColors = [] }: PlayerModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkNames, setBulkNames] = useState<string[]>([""]);

  useEffect(() => {
    if (open) {
      setName(player?.name ?? "");
      setColor(player?.color ?? defaultColor);
      setBulkMode(false);
      setBulkNames([""]);
    }
  }, [open, player, defaultColor]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
    setName("");
  };

  const handleBulkSave = () => {
    const validNames = bulkNames.map(n => n.trim()).filter(n => n.length > 0);
    if (validNames.length === 0) return;
    onBulkSave?.(validNames);
  };

  const addBulkField = () => {
    if (bulkNames.length < 12) {
      setBulkNames([...bulkNames, ""]);
    }
  };

  const updateBulkName = (index: number, value: string) => {
    const updated = [...bulkNames];
    updated[index] = value;
    setBulkNames(updated);
  };

  const removeBulkField = (index: number) => {
    if (bulkNames.length <= 1) return;
    setBulkNames(bulkNames.filter((_, i) => i !== index));
  };

  const validBulkCount = bulkNames.filter(n => n.trim().length > 0).length;

  // Preview which colors will be assigned
  const getPreviewColor = (index: number) => {
    const available = PLAYER_COLORS.filter(c => !usedColors.includes(c));
    return available[index % available.length] ?? PLAYER_COLORS[index % PLAYER_COLORS.length];
  };

  const isEditing = !!player;

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
            className="bg-card rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md border border-border max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              {isEditing ? t.player.edit : t.player.add}
            </h3>

            {/* Toggle between single and bulk mode (only when adding) */}
            {!isEditing && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    !bulkMode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t.player.add}
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    bulkMode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Users size={14} />
                  {t.player.bulkAdd}
                </button>
              </div>
            )}

            {/* Single player mode */}
            {!bulkMode && (
              <>
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
              </>
            )}

            {/* Bulk mode */}
            {bulkMode && (
              <>
                <label className="text-sm text-muted-foreground mb-2 block">{t.player.bulkHint}</label>
                <div className="space-y-2 mb-4">
                  {bulkNames.map((bName, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: `hsl(${getPreviewColor(index)})` }}
                      />
                      <input
                        type="text"
                        value={bName}
                        onChange={(e) => updateBulkName(index, e.target.value)}
                        placeholder={`${t.player.playerLabel} ${index + 1}`}
                        className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={20}
                        autoFocus={index === 0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (index === bulkNames.length - 1) {
                              addBulkField();
                            }
                          }
                        }}
                      />
                      {bulkNames.length > 1 && (
                        <button
                          onClick={() => removeBulkField(index)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addBulkField}
                  disabled={bulkNames.length >= 12}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-40 mb-6"
                >
                  <Plus size={14} />
                  {t.player.addAnother}
                </button>
              </>
            )}

            <div className="flex gap-2">
              {isEditing && onDelete && (
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
              {bulkMode ? (
                <button
                  onClick={handleBulkSave}
                  disabled={validBulkCount === 0}
                  className="py-2.5 px-6 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {t.player.addCount?.replace("{count}", String(validBulkCount)) ?? `Add ${validBulkCount}`}
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="py-2.5 px-6 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90"
                >
                  {t.player.save}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
