import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Play, Clock, Users, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useGame } from "@/store/GameContext";
import { useSavedMatches } from "@/hooks/useSavedMatches";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { GameMatch } from "@/store/gameTypes";

interface SavedMatchesProps {
  onNavigate: (page: "home" | "match") => void;
}

export function SavedMatches({ onNavigate }: SavedMatchesProps) {
  const { t } = useI18n();
  const { loadMatch: loadMatchToContext } = useGame();
  const { savedMatches, isLoading, error, deleteMatch, loadMatch } = useSavedMatches();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading_, setIsLoading] = useState(false);

  const handleContinueMatch = async (match: GameMatch) => {
    setIsLoading(true);
    try {
      const loadedMatch = await loadMatch(match.id);
      if (loadedMatch) {
        // Load the match into context
        loadMatchToContext(loadedMatch);
        // Navigate directly to match screen
        onNavigate("match");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await deleteMatch(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => onNavigate("home")}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <h2 className="font-display font-bold text-foreground text-lg">
            {t.saved?.title || "Saved Matches"}
          </h2>

          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-muted-foreground">{t.saved?.loading || "Loading..."}</div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="text-xs text-destructive/80 mt-1">
                {t.saved?.errorHint || "You can start a new game."}
              </p>
            </div>
          </motion.div>
        )}

        {!isLoading && savedMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">
              {t.saved?.noMatches || "No saved matches"}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {t.saved?.noMatchesHint || "Start a new game and save it to see it here."}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {savedMatches.map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {match.name || `Match ${new Date(match.createdAt).toLocaleDateString()}`}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatDate(match.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>
                          {match.players.length} {t.saved?.players || "players"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleContinueMatch(match)}
                      disabled={isLoading_}
                      className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      title={t.saved?.continue || "Continue"}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(match.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                      title={t.saved?.delete || "Delete"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        title={t.saved?.deleteTitle || "Delete Match"}
        message={t.saved?.deleteMessage || "Are you sure? This action cannot be undone."}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
        destructive
      />
    </div>
  );
}
