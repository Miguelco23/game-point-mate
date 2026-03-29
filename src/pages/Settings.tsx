import { motion } from "framer-motion";
import { ArrowLeft, Globe, Info, Github, Linkedin, Instagram, ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Language } from "@/i18n/translations";
import { getVersionString } from "@/lib/version";

interface SettingsProps {
  onNavigate: (page: "home") => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export function Settings({ onNavigate }: SettingsProps) {
  const { t, lang, setLang } = useI18n();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => onNavigate("home")}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-display font-bold text-foreground text-lg">{t.settings.title}</h2>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">{t.settings.language}</h3>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                  lang === l.code
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 border border-border space-y-4"
        >
          <div className="flex items-center gap-2">
            <Info size={18} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">{t.settings.about}</h3>
          </div>

          <p className="text-sm text-muted-foreground">{t.settings.description}</p>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground/60">
              {t.settings.version}: <span className="font-mono font-semibold text-foreground">{getVersionString()}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">
              {t.settings.creator} <span className="text-foreground font-medium">{t.settings.creatorName}</span>
            </p>

            <div className="flex flex-wrap gap-2">
              <a
                href="https://github.com/Miguelco23"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                <Github size={14} />
                <span>GitHub</span>
                <ExternalLink size={12} className="opacity-60" />
              </a>
              <a
                href="https://www.linkedin.com/in/miguelco23/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                <Linkedin size={14} />
                <span>LinkedIn</span>
                <ExternalLink size={12} className="opacity-60" />
              </a>
              <a
                href="https://www.instagram.com/miguelco314/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                <Instagram size={14} />
                <span>Instagram</span>
                <ExternalLink size={12} className="opacity-60" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
