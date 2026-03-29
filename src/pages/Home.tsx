import { motion } from "framer-motion";
import { Zap, Plus, ArrowRight, Settings, History } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useGame } from "@/store/GameContext";
import { useSavedMatches } from "@/hooks/useSavedMatches";

interface HomeProps {
  onNavigate: (page: "match" | "settings" | "saved-matches") => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { t } = useI18n();
  const { match, createMatch } = useGame();
  const { savedMatches } = useSavedMatches();

  const handleCreate = () => {
    createMatch();
    onNavigate("match");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
          className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <Zap className="text-primary" size={36} />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground text-glow mb-2">
          {t.home.title}
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          {t.home.subtitle}
        </p>

        <div className="space-y-3">
          {match && match.isActive && match.players.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("match")}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-lg flex items-center justify-center gap-2 transition-colors hover:bg-primary/90"
            >
              {match.name ? `${t.home.continueGame} en ${match.name}` : t.home.continueGame}
              <ArrowRight size={20} />
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            className={`w-full py-4 px-6 rounded-2xl font-display font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
              match
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Plus size={20} />
            {t.home.createGame}
          </motion.button>

          {savedMatches.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("saved-matches")}
              className="w-full py-4 px-6 rounded-2xl bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 font-display font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <History size={20} />
              {t.saved?.viewMatches || "Saved Matches"}
              {savedMatches.length > 0 && (
                <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {savedMatches.length}
                </span>
              )}
            </motion.button>
          )}
        </div>

        {!match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
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
        transition={{ delay: 0.8 }}
        onClick={() => onNavigate("settings")}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings size={20} />
      </motion.button>
    </div>
  );
}
