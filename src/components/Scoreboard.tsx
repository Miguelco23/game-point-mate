import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { Player } from "@/store/gameTypes";
import { useI18n } from "@/i18n/I18nContext";

interface ScoreboardProps {
  players: Player[];
}

export function Scoreboard({ players }: ScoreboardProps) {
  const { t } = useI18n();

  const sorted = [...players].sort((a, b) => b.score - a.score);

  if (sorted.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden mb-4">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Trophy size={16} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground">{t.match.scoreboard}</h3>
      </div>
      <div className="divide-y divide-border">
        {sorted.map((player, index) => {
          const position = index + 1;
          const isLeader = index === 0 && player.score > (sorted[1]?.score ?? -Infinity);

          return (
            <motion.div
              key={player.id}
              layout
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  position === 1
                    ? "bg-primary/20 text-primary"
                    : position === 2
                    ? "bg-muted text-muted-foreground"
                    : position === 3
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {position === 1 && isLeader ? (
                  <Medal size={14} />
                ) : (
                  position
                )}
              </span>

              <div
                className="w-6 h-6 rounded-full shrink-0"
                style={{ backgroundColor: `hsl(${player.color})` }}
              />

              <span className="font-display font-medium text-foreground truncate flex-1">
                {player.name}
              </span>

              <span className={`font-display font-bold text-lg tabular-nums ${
                isLeader ? "text-primary text-glow" : "text-foreground"
              }`}>
                {player.score}
              </span>
              <span className="text-xs text-muted-foreground">{t.match.points}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
