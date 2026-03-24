import { motion } from "framer-motion";
import { Zap, Plus, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useGame } from "@/store/GameContext";

interface HomeProps {
  onNavigate: (page: "match" | "settings") => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { t } = useI18n();
  const { match, createMatch } = useGame();

  const handleCreate = () => {
    createMatch();
    onNavigate("match");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <Zap className="text-primary" size={36} />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground text-glow mb-3">
          {t.home.title}
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          {t.home.subtitle}
        </p>

        <div className="space-y-3">
          {match && match.isActive ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("match")}
              className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg flex items-center justify-center gap-2 transition-colors hover:bg-primary/90"
            >
              {t.home.continueGame}
              <ArrowRight size={20} />
            </motion.button>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className={`w-full py-4 px-6 rounded-xl font-display font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
              match
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Plus size={20} />
            {t.home.createGame}
          </motion.button>
        </div>

        {!match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground/60 text-sm">{t.home.noGames}</p>
            <p className="text-muted-foreground/40 text-xs mt-1">{t.home.noGamesHint}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Settings link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => onNavigate("settings")}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </motion.button>
    </div>
  );
}
