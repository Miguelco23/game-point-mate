import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Undo2, RotateCcw, History, X, LogOut, Eye, EyeOff } from "lucide-react";
import { useGame } from "@/store/GameContext";
import { useI18n } from "@/i18n/I18nContext";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerModal } from "@/components/PlayerModal";
import { ActionLog } from "@/components/ActionLog";
import { Scoreboard } from "@/components/Scoreboard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ActionToast } from "@/components/ActionToast";
import { Player, ScoreAction, PLAYER_COLORS } from "@/store/gameTypes";

interface MatchScreenProps {
  onNavigate: (page: "home") => void;
}

export function MatchScreen({ onNavigate }: MatchScreenProps) {
  const { match, addPlayer, editPlayer, removePlayer, undo, resetScores, endMatch, getNextColor } = useGame();
  const { t } = useI18n();

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [lastAction, setLastAction] = useState<ScoreAction | null>(null);

  useEffect(() => {
    if (!match || match.actions.length === 0) return;
    const latest = match.actions[match.actions.length - 1];
    setLastAction(latest);
    const timer = setTimeout(() => setLastAction(null), 1500);
    return () => clearTimeout(timer);
  }, [match?.actions.length]);

  const rankedPlayers = useMemo(() => {
    if (!match) return [];
    return [...match.players].sort((a, b) => b.score - a.score);
  }, [match?.players]);

  const leaderId = useMemo(() => {
    if (rankedPlayers.length > 1 && rankedPlayers[0]?.score > rankedPlayers[1]?.score) {
      return rankedPlayers[0]?.id;
    }
    return null;
  }, [rankedPlayers]);

  if (!match) {
    onNavigate("home");
    return null;
  }

  const handleSavePlayer = (name: string, color: string) => {
    if (editingPlayer) {
      editPlayer(editingPlayer.id, name, color);
    } else {
      addPlayer(name, color);
    }
    setShowPlayerModal(false);
    setEditingPlayer(null);
  };

  const handleBulkSave = (names: string[]) => {
    const usedColors = match.players.map(p => p.color);
    const available = PLAYER_COLORS.filter(c => !usedColors.includes(c));
    names.forEach((n, i) => {
      const color = available[i % available.length] ?? PLAYER_COLORS[i % PLAYER_COLORS.length];
      addPlayer(n, color);
    });
    setShowPlayerModal(false);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowPlayerModal(true);
  };

  const handleDeletePlayer = () => {
    if (editingPlayer) {
      removePlayer(editingPlayer.id);
      setShowPlayerModal(false);
      setEditingPlayer(null);
    }
  };

  const handleEndGame = () => {
    endMatch();
    onNavigate("home");
  };

  const canAddPlayer = match.players.length < 12;
  const canUndo = match.actions.length > 0;
  const leaderId = rankedPlayers.length > 1 && rankedPlayers[0]?.score > rankedPlayers[1]?.score
    ? rankedPlayers[0]?.id : null;

  return (
    <div className="min-h-screen flex flex-col">
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
            {t.appName}
          </h2>

          <div className="flex items-center gap-1">
            {match.players.length >= 2 && (
              <button
                onClick={() => setShowScoreboard(!showScoreboard)}
                className={`p-2 rounded-lg transition-colors ${showScoreboard ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}`}
                title={showScoreboard ? "Hide scoreboard" : "Show scoreboard"}
              >
                {showScoreboard ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )}
            <button
              onClick={() => setShowLog(!showLog)}
              className={`p-2 rounded-lg transition-colors ${showLog ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}`}
            >
              <History size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Action Log Panel */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-foreground">{t.match.actionLog}</h3>
                  <button onClick={() => setShowLog(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
                <ActionLog actions={match.actions} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scoreboard */}
        <AnimatePresence>
          {showScoreboard && match.players.length >= 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Scoreboard players={match.players} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players */}
        {match.players.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">{t.match.noPlayers}</p>
            <p className="text-muted-foreground/60 text-sm mt-1">{t.match.noPlayersHint}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {rankedPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onEdit={handleEditPlayer}
                  rank={match.players.length >= 2 ? index + 1 : undefined}
                  isLeader={player.id === leaderId}
                  focusMode={false}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action toast */}
      <ActionToast action={lastAction} />

      {/* Bottom bar */}
      <div className="sticky bottom-0 z-20 bg-background/90 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto gap-2">
          <button
            onClick={() => setShowEndConfirm(true)}
            className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={t.match.endGame}
          >
            <LogOut size={18} />
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={t.match.resetScores}
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => canUndo && undo()}
            disabled={!canUndo}
            className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={t.match.undo}
          >
            <Undo2 size={18} />
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (canAddPlayer) {
                setEditingPlayer(null);
                setShowPlayerModal(true);
              }
            }}
            disabled={!canAddPlayer}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-primary/90 disabled:opacity-50 text-base"
          >
            <Plus size={18} />
            {t.match.addPlayer}
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <PlayerModal
        open={showPlayerModal}
        onClose={() => { setShowPlayerModal(false); setEditingPlayer(null); }}
        onSave={handleSavePlayer}
        onBulkSave={handleBulkSave}
        onDelete={editingPlayer ? handleDeletePlayer : undefined}
        player={editingPlayer}
        defaultColor={getNextColor()}
        usedColors={match.players.map(p => p.color)}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title={t.match.resetScores}
        message={t.match.resetConfirm}
        confirmLabel={t.match.resetConfirmAction}
        cancelLabel={t.match.cancel}
        onConfirm={() => { resetScores(); setShowResetConfirm(false); }}
        onCancel={() => setShowResetConfirm(false)}
        destructive
      />

      <ConfirmDialog
        open={showEndConfirm}
        title={t.match.endGame}
        message={t.match.endGameConfirm}
        confirmLabel={t.common.confirm}
        cancelLabel={t.match.cancel}
        onConfirm={handleEndGame}
        onCancel={() => setShowEndConfirm(false)}
        destructive
      />
    </div>
  );
}
