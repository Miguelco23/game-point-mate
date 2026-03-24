import { motion, AnimatePresence } from "framer-motion";
import { ScoreAction } from "@/store/gameTypes";
import { useI18n } from "@/i18n/I18nContext";

interface ActionLogProps {
  actions: ScoreAction[];
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
            <span
              className={`font-display font-bold ml-auto shrink-0 ${
                action.delta > 0 ? "text-success" : "text-destructive"
              }`}
            >
              {action.delta > 0 ? "+" : ""}
              {action.delta}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              → {action.resultingScore}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
