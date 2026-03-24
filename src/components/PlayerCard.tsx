import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Player } from "@/store/gameTypes";
import { useGame } from "@/store/GameContext";
import { useI18n } from "@/i18n/I18nContext";
import { CustomScoreModal } from "./CustomScoreModal";

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
}

const QUICK_VALUES = [1, 5];

export function PlayerCard({ player, onEdit }: PlayerCardProps) {
  const { updateScore, removePlayer } = useGame();
  const { t } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);

  const handleScore = (delta: number) => {
    updateScore(player.id, delta);
    setScoreKey((k) => k + 1);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative rounded-lg bg-card p-4 card-glow"
        style={{ borderLeft: `4px solid hsl(${player.color})` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: `hsl(${player.color})` }}
            >
              {player.name[0]?.toUpperCase()}
            </div>
            <span className="font-display font-semibold text-foreground truncate">
              {player.name}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 z-10 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => { onEdit(player); setShowMenu(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted w-full text-foreground"
                  >
                    <Pencil size={14} /> {t.player.edit}
                  </button>
                  <button
                    onClick={() => { removePlayer(player.id); setShowMenu(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-destructive/20 w-full text-destructive"
                  >
                    <Trash2 size={14} /> {t.player.delete}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Score */}
        <motion.div
          key={scoreKey}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.25 }}
          className="text-center mb-3"
        >
          <span className="text-4xl font-display font-bold text-foreground text-glow">
            {player.score}
          </span>
          <span className="text-xs text-muted-foreground ml-1">{t.match.points}</span>
        </motion.div>

        {/* Score buttons */}
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK_VALUES.map((v) => (
            <button
              key={`minus-${v}`}
              onClick={() => handleScore(-v)}
              className="flex items-center justify-center gap-0.5 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-sm transition-colors active:scale-95"
            >
              <Minus size={12} />{v}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className="py-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground font-medium text-xs transition-colors active:scale-95"
          >
            ±
          </button>
          {QUICK_VALUES.map((v) => (
            <button
              key={`plus-${v}`}
              onClick={() => handleScore(v)}
              className="flex items-center justify-center gap-0.5 py-2 rounded-md bg-primary/20 hover:bg-primary/30 text-primary font-semibold text-sm transition-colors active:scale-95"
            >
              <Plus size={12} />{v}
            </button>
          ))}
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
