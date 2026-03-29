import { motion, AnimatePresence } from "framer-motion";
import { ScoreAction } from "@/store/gameTypes";
import { useI18n } from "@/i18n/I18nContext";

interface ActionLogProps {
  actions: ScoreAction[];
}

function formatTime(ts: number) {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return time;
  } else if (isYesterday) {
    return `Yesterday ${time}`;
  } else {
    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dateStr} ${time}`;
  }
}

export function ActionLog({ actions }: ActionLogProps) {
  const { t } = useI18n();
  const reversed = [...actions].reverse();

  if (actions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">{t.match.noActions}</p>
        <p className="text-muted-foreground/60 text-xs mt-1">{t.match.noActionsHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-60 overflow-y-auto">
      <AnimatePresence initial={false}>
        {reversed.map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-sm py-2 px-3 rounded-md bg-secondary/50"
          >
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTime(action.timestamp)}
            </span>
            <span className="font-medium text-foreground truncate">
              {action.playerName}
            </span>
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              {/* Base and multiplier info */}
              <span
                className={`font-display font-bold ${
                  action.delta > 0 ? "text-success" : "text-destructive"
                }`}
              >
                {action.basePoints !== undefined 
                  ? `${action.basePoints > 0 ? "+" : ""}${action.basePoints}`
                  : `${action.delta > 0 ? "+" : ""}${action.delta}`
                }
              </span>
              
              {/* Multiplier badge */}
              {action.multiplier && action.multiplier > 1 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary">
                  ×{action.multiplier}
                </span>
              )}

              {/* Final points */}
              <span className="text-xs text-muted-foreground">
                → {action.resultingScore}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
