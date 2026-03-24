import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, MoreVertical, Pencil, Trash2, Hash } from "lucide-react";
import { Player } from "@/store/gameTypes";
import { useGame } from "@/store/GameContext";
import { useI18n } from "@/i18n/I18nContext";
import { CustomScoreModal } from "./CustomScoreModal";

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  rank?: number;
  isLeader?: boolean;
  focusMode?: boolean;
}

const QUICK_VALUES = [1, 5, 10];

export function PlayerCard({ player, onEdit, rank, isLeader, focusMode }: PlayerCardProps) {
  const { updateScore, removePlayer } = useGame();
  const { t } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);
  const [flashColor, setFlashColor] = useState<"positive" | "negative" | null>(null);

  const handleScore = (delta: number) => {
    updateScore(player.id, delta);
    setScoreKey((k) => k + 1);
    setFlashColor(delta > 0 ? "positive" : "negative");
    setTimeout(() => setFlashColor(null), 400);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative rounded-2xl overflow-hidden transition-shadow ${
          isLeader ? "ring-2 ring-primary/40 shadow-lg shadow-primary/10" : ""
        }`}
        style={{ borderLeft: `4px solid hsl(${player.color})` }}
      >
        {/* Flash overlay */}
        <AnimatePresence>
          {flashColor && (
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 z-10 pointer-events-none rounded-2xl ${
                flashColor === "positive"
                  ? "bg-success/20"
                  : "bg-destructive/20"
              }`}
            />
          )}
        </AnimatePresence>

        <div className="bg-card p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {rank !== undefined && (
                <span className={`text-xs font-bold font-display shrink-0 w-5 text-center ${
                  rank === 1 ? "text-primary" : "text-muted-foreground"
                }`}>
                  #{rank}
                </span>
              )}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-md"
                style={{ backgroundColor: `hsl(${player.color})` }}
              >
                {player.name[0]?.toUpperCase()}
              </div>
              <span className="font-display font-semibold text-foreground truncate text-base">
                {player.name}
              </span>
            </div>

            {!focusMode && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-0 top-10 z-20 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                      >
                        <button
                          onClick={() => { onEdit(player); setShowMenu(false); }}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-muted w-full text-foreground"
                        >
                          <Pencil size={14} /> {t.player.edit}
                        </button>
                        <button
                          onClick={() => { removePlayer(player.id); setShowMenu(false); }}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-destructive/20 w-full text-destructive"
                        >
                          <Trash2 size={14} /> {t.player.delete}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Score */}
          <motion.div
            key={scoreKey}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.2 }}
            className="text-center py-3"
          >
            <span className={`text-5xl font-display font-bold tabular-nums ${
              isLeader ? "text-primary text-glow" : "text-foreground"
            }`}>
              {player.score}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">{t.match.points}</span>
          </motion.div>

          {/* Score buttons - thumb-friendly */}
          <div className="flex gap-1.5">
            {/* Minus buttons */}
            {QUICK_VALUES.map((v) => (
              <button
                key={`minus-${v}`}
                onClick={() => handleScore(-v)}
                className="flex-1 flex items-center justify-center gap-0.5 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold text-sm transition-all active:scale-90 active:bg-destructive/30"
              >
                <Minus size={12} strokeWidth={3} />{v}
              </button>
            ))}

            {/* Custom */}
            <button
              onClick={() => setShowCustom(true)}
              className="flex-1 py-3 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-sm transition-all active:scale-90 flex items-center justify-center"
            >
              <Hash size={14} />
            </button>

            {/* Plus buttons */}
            {QUICK_VALUES.map((v) => (
              <button
                key={`plus-${v}`}
                onClick={() => handleScore(v)}
                className="flex-1 flex items-center justify-center gap-0.5 py-3 rounded-xl bg-success/10 hover:bg-success/20 text-success font-bold text-sm transition-all active:scale-90 active:bg-success/30"
              >
                <Plus size={12} strokeWidth={3} />{v}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <CustomScoreModal
        open={showCustom}
        onClose={() => setShowCustom(false)}
        onApply={(val) => { handleScore(val); setShowCustom(false); }}
      />
    </>
  );
}
