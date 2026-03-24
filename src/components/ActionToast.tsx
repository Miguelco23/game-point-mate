import { motion, AnimatePresence } from "framer-motion";
import { ScoreAction } from "@/store/gameTypes";

interface ActionToastProps {
  action: ScoreAction | null;
}

export function ActionToast({ action }: ActionToastProps) {
  return (
    <AnimatePresence>
      {action && (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className={`px-4 py-2 rounded-full font-display font-bold text-sm shadow-xl backdrop-blur-md ${
            action.delta > 0
              ? "bg-success/90 text-success-foreground"
              : "bg-destructive/90 text-destructive-foreground"
          }`}>
            {action.delta > 0 ? "+" : ""}{action.delta} → {action.playerName}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
