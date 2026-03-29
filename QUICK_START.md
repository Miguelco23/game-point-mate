# Quick Reference: Simple Auto Versioning

## 🚀 ULTRA SIMPLE: Solo números automáticos!

**Los números se incrementan automáticamente basado en la rama:**

```bash
feature/*              → develop   → Incrementa tercer número: 1.0.0 → 1.0.1
release/YYYY-MM-DD     → main      → Incrementa segundo número: 1.0.0 → 1.1.0
```

---

## Daily Development

```bash
# Run tests
npm run test:watch

# Create feature branch
git checkout -b feature/dark-mode

# Normal commits (mensaje es irrelevante)
git commit -m "Add feature"
git push origin feature/dark-mode

# Create PR on GitHub: feature/* → develop
# 🤖 Auto-bump: 1.0.0 → 1.0.1
# Merge when ready
```

---

## Production Release

```bash
# Create release branch with today's date
git checkout -b release/2025-03-29
git push origin release/2025-03-29

# Create PR on GitHub: release/YYYY-MM-DD → main
# 🤖 Auto-bump: 1.0.0 → 1.1.0
# Merge when ready
# 🤖 Auto-create tag v1.1.0 + GitHub Release
```

---

## How It Works

### On develop (feature/* PRs):
```
1.0.0 → PR → 1.0.1 → PR → 1.0.2 → PR → 1.0.3
(incrementa el tercer número)
```

### On main (release/YYYY-MM-DD PRs):
```
1.0.3 → PR → 1.1.0 → PR → 1.2.0 → PR → 1.3.0
(incrementa el segundo número, reset tercero a 0)
```

---

## Branch Names - IMPORTANTE

### ✅ VÁLIDOS:
```bash
feature/anything
feature/dark-mode
feature/new-feature

release/2025-03-29
release/2025-04-15
```

### ❌ INVÁLIDOS:
```bash
dark-mode                    # Falta feature/
release/1.0.0               # No usar versiones
release/2025-3-29           # Formato de fecha malo
```

---

## Commit Messages

**NO IMPORTAN:**
```bash
"Add feature"  ✅
"fix"          ✅
"TODO"         ✅
```

Cualquier mensaje funciona.

---

## Workflow Completo

```
                DEVELOPMENT (develop)
┌─────────────────────────────────┐
│ git checkout -b feature/xxx     │
│         ↓                        │
│ Commits normales (cualquier msg) │
│         ↓                        │
│ git push + PR to develop        │
│         ↓                        │
│ 🤖 Auto-bump +1 patch (tercero) │
│         ↓                        │
│ Tests pasan ✓                   │
│         ↓                        │
│ Merge a develop                 │
└─────────────────────────────────┘
         (versión mostrada en About)


                PRODUCTION (main)
┌─────────────────────────────────┐
│ git checkout -b release/YYYY-MM-DD
│         ↓                        │
│ git push + PR to main           │
│         ↓                        │
│ 🤖 Auto-bump +1 minor (segundo) │
│         ↓                        │
│ Tests pasan ✓                   │
│         ↓                        │
│ Merge a main                    │
│         ↓                        │
│ 🤖 Auto-create tag v1.1.0       │
│ 🤖 Auto-create GitHub Release   │
│         ↓                        │
│ ✅ PRODUCTION READY!            │
└─────────────────────────────────┘
```

---

## Examples

**Desarrollo normal:**
```
Rama: feature/dark-mode
PR a develop
1.2.3 → 1.2.4

Rama: feature/settings
PR a develop
1.2.4 → 1.2.5

Rama: feature/storage
PR a develop
1.2.5 → 1.2.6
```

**Release a producción:**
```
Rama: release/2025-03-29
PR a main
1.2.6 (dev) → 1.3.0 (stable)

Después, siguientes features:
1.3.0 → 1.3.1 → 1.3.2 → ...
```

---

## About Section (Automático!)

Settings → About muestra:
- Version: 1.3.0 (actualizado automáticamente)
- Release type: Stable/Dev
- Creator info
- Social links

**TODO se actualiza automáticamente cuando version.json cambia.**

---

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
```

---

## That's It! 🎉

```
feature/* → develop → patch +1 (1.0.0 → 1.0.1)
release/YYYY-MM-DD → main → minor +1 (1.0.0 → 1.1.0)
```

Sin pensar en commits, sin análisis, solo números que suben.

✨ **Simple és hermoso.**
