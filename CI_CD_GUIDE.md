# CI/CD and Version Management Guide

## Overview

Game Points has a **fully automated** CI/CD pipeline with **simple, automatic version bumping**. No manual version editing required!

---

## The System - Super Simple ✨

### 🌿 Two Branch Types

```
feature/*              → PR to develop   → Auto-bump +1 PATCH (third number)
release/YYYY-MM-DD     → PR to main      → Auto-bump +1 MINOR (second number)
```

### How Versioning Works

**On `develop` (development cycle):**
- Each merge from `feature/*` increments the third number (patch)
- Example: `1.0.0` → `1.0.1` → `1.0.2` → `1.0.3`
- Appears instantly in About section

**On `main` (production releases):**
- Each merge from `release/YYYY-MM-DD` increments the second number (minor)
- Third number resets to 0
- Example: `1.0.3` → `1.1.0` → `1.2.0` → `1.3.0`
- Automatically creates git tag and GitHub Release

---

## Components

### 1. Unit Tests

**Location:** `src/lib/storageService.test.ts`, `src/hooks/useSavedMatches.test.ts`

**Coverage:**
- ✅ Storage service: save, retrieve, update, delete
- ✅ Data validation and corruption detection
- ✅ SavedMatches hook: initialization, CRUD, error handling

**Run tests:**
```bash
npm test              # Run once
npm run test:watch   # Watch mode during development
```

**Framework:** Vitest + React Testing Library

### 2. Version Management

**Version File:** `version.json`
```json
{
  "version": "1.0.0",
  "releaseType": "stable"
}
```

**Version Utility:** `src/lib/version.ts`
- `getVersionString()` → Returns current version
- Used automatically in Settings > About

**In the UI:** Settings > About displays the version dynamically

### 3. GitHub Actions Workflows

#### CI Workflow (`.github/workflows/ci.yml`)

Runs on: **Every PR to `main` and `develop`**

Steps:
1. Install dependencies (`npm ci`)
2. Run unit tests (`npm test`)
3. Build project (`npm run build`)

Fails PR if tests or build fail ✓

#### Auto Version Workflow (`.github/workflows/auto-version.yml`) - THE MAGIC ⭐

Runs on: **Every PR opened/updated to develop or main**

**What it does:**

1. **For `feature/*` → `develop` PRs:**
   - Reads version.json (e.g., 1.0.0)
   - Increments third number: `1.0.0` → `1.0.1`
   - Updates version.json
   - Auto-commits and pushes
   - Shows comment: "✅ Version will be bumped to: **1.0.1** (patch increment)"

2. **For `release/YYYY-MM-DD` → `main` PRs:**
   - Reads version.json (e.g., 1.0.3)
   - Increments second number, reset third: `1.0.3` → `1.1.0`
   - Updates version.json
   - Auto-commits and pushes
   - Shows comment: "✅ Version will be bumped to: **1.1.0** (minor increment)"

#### Release Workflow (`.github/workflows/release.yml`)

Runs on: **Push to `main` when `version.json` changes**

Steps:
1. Detects version change
2. Creates git tag `v{version}` (e.g., `v1.1.0`)
3. Creates GitHub Release

---

## Daily Workflow

### Step 1: Feature Development

```bash
# Create feature branch
git checkout -b feature/dark-mode

# Develop normally (commit messages don't matter)
git add .
git commit -m "Add dark mode"

# Push
git push origin feature/dark-mode
```

### Step 2: Create PR to develop

- Go to GitHub
- Create PR: `feature/dark-mode` → `develop`
- GitHub Actions runs CI + auto-bump
- Comment shows: "✅ Version will be bumped to: **1.0.1**"

### Step 3: Merge to develop (when ready)

```bash
# CI passed ✓
# Merge PR
```

Status:
- Version is now `1.0.1` in About section
- Ready for more development

### Step 4: When ready for production release

```bash
# Create release branch with TODAY'S DATE
git checkout -b release/2025-03-29

# No changes, just push
git push origin release/2025-03-29
```

### Step 5: Create PR to main

- Go to GitHub
- Create PR: `release/2025-03-29` → `main`
- GitHub Actions runs CI + auto-bump
- Comment shows: "✅ Version will be bumped to: **1.1.0**"

### Step 6: Merge to main (when ready)

```bash
# CI passed ✓
# Merge PR
```

Production status:
- 🤖 `release.yml` automatically:
  - Creates git tag `v1.1.0`
  - Creates GitHub Release
  - Ready for deployment ✅

---

## Branch Naming - IMPORTANT

### ✅ Valid Branches

```bash
# Features (any name after feature/)
git checkout -b feature/dark-mode
git checkout -b feature/add-language
git checkout -b feature/fix-storage-bug

# Releases (DATE FORMAT YYYY-MM-DD)
git checkout -b release/2025-03-29
git checkout -b release/2025-04-15
git checkout -b release/2025-12-31
```

### ❌ Invalid Branches

```bash
git checkout -b dark-mode                        # Missing feature/
git checkout -b feature                          # Incomplete
git checkout -b release/v1.0.0                   # Has "v"
git checkout -b release/1.0.0                    # Should be date
git checkout -b release/2025-3-29                # Wrong date format
git checkout -b release/29-03-2025               # Wrong date format
```

---

## Commit Messages

**Don't matter!** Any message works:

```bash
git commit -m "Add dark mode"           ✅
git commit -m "fix"                      ✅
git commit -m "Update"                   ✅
git commit -m "TODO"                     ✅
```

---

## Version in the UI

The About section shows:
- Current version (from `version.json`)
- Release type (Stable or Dev)
- Creator info
- Social links

Updates automatically when version changes!

---

## Testing Before Release

```bash
# Local testing before creating PR
npm test              # All tests pass?
npm run build        # Build succeeds?
```

If both pass locally → GitHub will also pass ✓

---

## Troubleshooting

### PR Shows: "⚠️ This PR does not follow the branch naming convention"

**Fix:** Branch must follow naming:
- For features: `feature/xxx`
- For releases: `release/YYYY-MM-DD`

Rename the branch:
```bash
git branch -m feature/correct-name
git push -u origin feature/correct-name
```

### Version not bumping on PR

**Check:**
1. Branch name correct? (`feature/*` or `release/YYYY-MM-DD`)
2. PR to correct branch? (`develop` or `main`)
3. Wait a moment - workflows take a few seconds

### Release workflow not creating tags

**Check:**
1. Did you merge to `main`?
2. Check GitHub Actions logs for errors
3. Verify the tag format: `v1.1.0`

### About section shows wrong version

- Clear browser cache and refresh
- Build locally: `npm run build`
- Version loads from `version.json`

---

## Complete Example: Your First Release

```bash
# 1. Feature development
git checkout -b feature/dark-mode
git commit -m "Add dark mode"
git push origin feature/dark-mode

# 2. Create PR: feature/dark-mode → develop
# GitHub auto-bumps to 1.0.1
# Tests pass ✓
# Merge to develop

# 3. More features...
git checkout -b feature/new-settings
git commit -m "Add settings"
git push origin feature/new-settings

# Create PR → develop
# GitHub auto-bumps to 1.0.2
# Merge

# 4. Ready for production! Create release
git checkout -b release/2025-03-29
git push origin release/2025-03-29

# 5. Create PR: release/2025-03-29 → main
# GitHub auto-bumps to 1.1.0
# Tests pass ✓
# Merge to main

# 6. Automatic magic! ✨
#   - Git tag created: v1.1.0
#   - GitHub Release created
#   - Production ready!

# 7. Settings > About now shows:
#   Version: 1.1.0 (Stable)
```

---

## Key Takeaways

✅ **Branch names determine everything**
- `feature/*` → incrementa patch (tercer número)
- `release/YYYY-MM-DD` → incrementa minor (segundo número)

✅ **Commit messages don't matter**
- Any message works
- System only looks at branch names

✅ **Everything is automatic**
- No manual version editing
- No manual tag creation
- No manual release management

✅ **About section is dynamic**
- Shows version from `version.json`
- Updates instantly when version changes

---

## Files

**New files:**
- `version.json` - Version configuration
- `src/lib/version.ts` - Version utilities
- `.github/workflows/ci.yml` - CI tests & build
- `.github/workflows/auto-version.yml` - Automatic version bumping
- `.github/workflows/release.yml` - Automatic releases
- `src/lib/storageService.test.ts` - Storage tests
- `src/hooks/useSavedMatches.test.ts` - Hook tests

**Modified files:**
- `src/i18n/translations.ts` - Version and creator fields
- `src/pages/Settings.tsx` - Enhanced About section
- `package.json` - Version updated to 0.1.0


---

## Components

### 1. Unit Tests

**Location:** `src/lib/storageService.test.ts`, `src/hooks/useSavedMatches.test.ts`

**Coverage:**
- ✅ Storage service: save, retrieve, update, delete matches
- ✅ Data validation and corruption detection
- ✅ SavedMatches hook: initialization, CRUD, error handling

**Run tests:**
```bash
npm test              # Run once
npm run test:watch   # Watch mode during development
```

**Framework:** Vitest + React Testing Library

### 2. Version Management

**Version File:** `version.json`
```json
{
  "version": "0.1.0",
  "releaseType": "dev"
}
```

**Version Utility:** `src/lib/version.ts`

Functions:
- `getAppVersion()` → Returns full version info
- `getVersionString()` → Returns formatted version (e.g., "1.0.0" or "1.0.0-dev.1")
- `getReleaseType()` → Returns "Stable" or "Development"

**In the UI:** Settings > About displays the version dynamically

### 3. GitHub Actions Workflows

#### CI Workflow (`.github/workflows/ci.yml`)

Runs on: **Pull Requests to `main` and `develop`**

Steps:
1. Install dependencies (`npm ci`)
2. Run unit tests (`npm test`)
3. Build project (`npm run build`)

**Status:** PR will fail if tests or build fail ✓

#### Auto Version Workflow (`.github/workflows/auto-version.yml`) - THE MAGIC ⭐

Runs on: **Every PR opened/updated to develop or main**

**What it does:**

1. **For `feature/*` → `develop` PRs:**
   - Increments dev version: `1.0.0-dev.1` → `1.0.0-dev.2`
   - Commits automatically
   - Shows comment: "✅ Version will be bumped to: **1.0.0-dev.2**"

2. **For `release/YYYY-MM-DD` → `main` PRs:**
   - Analyzes commits since last release tag
   - Reads commit prefixes to calculate bump:
     - `feat:` → MINOR bump
     - `fix:` → PATCH bump
     - `BREAKING:` → MAJOR bump
   - Updates version to calculated number
   - Commits automatically
   - Shows comment: "✅ Version will be bumped to: **1.1.0** (MINOR based on commits)"

#### Release Workflow (`.github/workflows/release.yml`)

Runs on: **Push to `main` when `version.json` changes**

Steps:
1. Detects version change in `version.json`
2. Creates git tag `v{version}` (e.g., `v1.0.0`)
3. Creates GitHub Release

---

## Daily Workflow

### Step 1: Feature Development

```bash
# Create feature branch
git checkout -b feature/dark-mode

# Develop normally
git add .
git commit -m "Add dark mode toggle"

# Push
git push origin feature/dark-mode
```

### Step 2: Create PR to develop

- Go to GitHub
- Create PR: `feature/dark-mode` → `develop`
- GitHub Actions runs CI checks
- 🤖 Auto-version bumps dev version automatically
- Comment shows: "✅ Version will be bumped to: **1.0.0-dev.2**"

### Step 3: Merge to develop (when ready)

```bash
# CI passed ✓
# Merge PR
```

Development status:
- App version shows `1.0.0-dev.2` in Settings > About
- Ready for more development

### Step 4: When ready for production release

```bash
# Create release branch with TODAY'S DATE
git checkout -b release/2025-03-29

# No changes needed, just push
git push origin release/2025-03-29
```

### Step 5: Create PR to main

- Go to GitHub
- Create PR: `release/2025-03-29` → `main`
- GitHub Actions runs CI checks
- 🤖 Auto-version analyzes commits and calculates bump
- Comment shows: "✅ Version will be bumped to: **1.1.0** (MINOR bump based on commits)"

### Step 6: Merge to main (when ready)

```bash
# CI passed ✓
# Merge PR
```

Production status:
- 🤖 `release.yml` automatically:
  - Creates git tag `v1.1.0`
  - Creates GitHub Release
  - Ready for deployment ✅

---

## Branch Naming - IMPORTANT

### ✅ Valid Branches

```bash
# Features
git checkout -b feature/dark-mode
git checkout -b feature/add-language
git checkout -b feature/fix-storage-bug

# Releases (DATE FORMAT ONLY!)
git checkout -b release/2025-03-29
git checkout -b release/2025-04-15
git checkout -b release/2025-12-31
```

### ❌ Invalid Branches

```bash
git checkout -b dark-mode                        # Missing feature/
git checkout -b feature                          # Incomplete
git checkout -b release/v1.0.0                   # No version numbers
git checkout -b release/1.0.0                    # No version numbers
git checkout -b release/2025-3-29                # Wrong date format
git checkout -b release/29-03-2025               # Wrong date format
```

---

## Commit Message Format (Controls Bump Type)

Your commits determine the version bump type:

```bash
# ✨ NEW FEATURE (→ MINOR: 1.0.0 → 1.1.0)
git commit -m "feat: add dark mode"
git commit -m "feat(ui): improve layout"

# 🐛 BUG FIX (→ PATCH: 1.0.0 → 1.0.1)
git commit -m "fix: correct calculation"
git commit -m "fix(storage): handle edge case"

# ⚠️ BREAKING CHANGE (→ MAJOR: 1.0.0 → 2.0.0)
git commit -m "BREAKING: remove old API"
git commit -m "feat!: redesign interface"

# 🧹 MAINTENANCE (→ no bump)
git commit -m "chore: update dependencies"
git commit -m "docs: add documentation"
git commit -m "style: format code"
```

| Prefix | Bump Type | Example |
|--------|-----------|---------|
| `feat:` | MINOR | 1.0.0 → 1.1.0 |
| `fix:` | PATCH | 1.0.0 → 1.0.1 |
| `BREAKING:` or `feat!:` | MAJOR | 1.0.0 → 2.0.0 |
| Others | None | No change |

---

## Version in the UI

The About section automatically shows:
- Current version (from `version.json`)
- Release type (stable or dev)
- Creator info
- Social links

No need to do anything - it's automatic!

---

## Testing Before Release

```bash
# Local testing before creating PR
npm test              # All tests pass?
npm run build        # Build succeeds?
```

If both pass locally → GitHub will also pass ✓

---

## Troubleshooting

### PR Shows: "⚠️ This PR does not follow the branch naming convention"

**Fix:**
- For features: Branch must start with `feature/`
- For releases: Branch must start with `release/` and use date format `YYYY-MM-DD`

Rename the branch:
```bash
git branch -m feature/correct-name
git push -u origin feature/correct-name
```

### Version not bumping on PR

**Check:**
1. Is the branch name correct? (`feature/*` or `release/YYYY-MM-DD`)
2. Is it a PR to the right branch? (`develop` or `main`)
3. Wait a moment - workflows take a few seconds to run

### Release workflow not creating tags

**Check:**
1. Is `version.json` actually different from the last tag version?
2. Is the PR merged to `main`?
3. Check GitHub Actions logs for errors

### About section shows wrong version

- Clear browser cache and refresh
- Rebuild the app locally: `npm run build`
- Version should update from `version.json`

---

## Complete Example: Your First Release

```bash
# 1. You've been developing with feature branches
git checkout feature/dark-mode
npm run test:watch
# ... tests pass
git push origin feature/dark-mode

# 2. Create PR: feature/dark-mode → develop
# GitHub auto-bumps to 1.0.0-dev.2
# Tests pass ✓
# Merge to develop

# 3. More features...
git checkout -b feature/new-settings
# ... develop
git push origin feature/new-settings
# Create PR → develops
# GitHub auto-bumps to 1.0.0-dev.3
# Merge to develop

# 4. Ready for production! Create release branch with DATE
git checkout -b release/2025-03-29
git push origin release/2025-03-29

# 5. Create PR: release/2025-03-29 → main
# GitHub analyzes commits:
#   - Found 2 "feat:" commits
#   - Calculates: 1.0.0-dev.3 → 1.1.0 (MINOR)
# Tests pass ✓
# Merge to main

# 6. Automatic magic! ✨
#   - Git tag created: v1.1.0
#   - GitHub Release created
#   - Production ready!

# 7. Settings > About now shows:
#   Version: 1.1.0
#   Release type: Stable
```

---

## Key Takeaways

✅ **Branch names determine everything**
- `feature/*` → develop increases dev version
- `release/YYYY-MM-DD` → main auto-calculates stable version

✅ **Commit prefixes control bump type on main**
- `feat:` → MINOR bump
- `fix:` → PATCH bump
- `BREAKING:` → MAJOR bump

✅ **Everything is automatic**
- No manual version editing
- No manual tag creation
- No manual release management

✅ **About section is dynamic**
- Shows version from `version.json`
- Updates instantly when version changes

---

## Files

**New files:**
- `version.json` - Version configuration
- `src/lib/version.ts` - Version utilities
- `.github/workflows/ci.yml` - CI tests & build
- `.github/workflows/auto-version.yml` - Automatic version bumping
- `.github/workflows/release.yml` - Automatic releases
- `src/lib/storageService.test.ts` - Storage tests
- `src/hooks/useSavedMatches.test.ts` - Hook tests

**Modified files:**
- `src/i18n/translations.ts` - Version and creator fields
- `src/pages/Settings.tsx` - Enhanced About section
- `package.json` - Version updated to 0.1.0


---

## Components

### 1. Unit Tests

**Location:** `src/lib/storageService.test.ts`, `src/hooks/useSavedMatches.test.ts`

**Coverage:**
- ✅ Storage service: save, retrieve, update, delete matches
- ✅ Data validation and corruption detection
- ✅ SavedMatches hook: initialization, CRUD operations, error handling

**Run tests:**
```bash
npm test              # Run once
npm run test:watch   # Watch mode during development
```

**Framework:** Vitest + React Testing Library

### 2. Version Management

**Version File:** `version.json`
```json
{
  "version": "0.1.0",
  "releaseType": "dev"
}
```

**Version Utility:** `src/lib/version.ts`

Functions:
- `getAppVersion()` → Returns full version info
- `getVersionString()` → Returns formatted version (e.g., "1.0.0" or "1.0.0-dev.1")
- `getReleaseType()` → Returns "Stable" or "Development"

**In the UI:** Settings > About now displays the version dynamically

**Auto-Bump Script:** `scripts/bump-version.js`
- Analyzes commits using Conventional Commits format
- Automatically increments version based on commit types
- Runs on every push to `develop` and `main`
- **You never have to manually edit `version.json`**

### 3. GitHub Actions Workflows

#### CI Workflow (`.github/workflows/ci.yml`)

Runs on: **Pull Requests to `main` and `develop`**

Steps:
1. Install dependencies (`npm ci`)
2. Run unit tests (`npm test`)
3. Build project (`npm run build`)

**Status:** PR will fail if tests or build fail ✓

#### Auto Version Workflow (`.github/workflows/auto-version.yml`) - NEW ⭐

Runs on: **Push to `develop` and `main`** (when you merge a PR)

**Smart version bumping:**
- **On `develop`:** Increments `-dev.1` → `-dev.2` → `-dev.3` etc.
- **On `main`:** Analyzes commits and auto-bumps:
  - `feat:` commits → MINOR version bump
  - `fix:` commits → PATCH version bump
  - `BREAKING:` commits → MAJOR version bump

**What it does:**
1. Reads git history since last tag
2. Analyzes commit messages
3. Calculates next version
4. Updates `version.json`
5. Commits and pushes automatically

**Cost to you:** ZERO! It's fully automatic.

#### Release Workflow (`.github/workflows/release.yml`)

Runs on: **Push to `main` when `version.json` changes**

Steps:
1. Detects version change in `version.json`
2. Creates git tag `v{version}` (e.g., `v1.0.0`)
3. Creates GitHub Release

---

## Workflow: How the Magic Happens

### The Automatic Flow

```
1️⃣ Feature Development
   feature/ → npm run test:watch (local)

2️⃣ Create PR
   git push origin feature/
   → GitHub opens PR to develop

3️⃣ CI Checks (Automatic)
   ✓ npm test
   ✓ npm run build

4️⃣ Merge to develop
   Merge PR → develop

5️⃣ Auto-Version on develop (Automatic!)
   auto-version.yml runs
   Updates: 1.0.0-dev.1 → 1.0.0-dev.2
   Shows in About section instantly ✨

6️⃣ When ready for production
   Create PR: develop → main

7️⃣ CI Checks (Automatic)
   ✓ npm test
   ✓ npm run build

8️⃣ Merge to main
   Merge PR → main

9️⃣ Auto-Version on main (Automatic!)
   auto-version.yml analyzes commits
   If commits have "feat:" → 1.0.0-dev.2 → 1.1.0
   If commits have "fix:" → 1.0.0-dev.2 → 1.0.1
   Updates version.json

🔟 Create Release (Automatic!)
    release.yml runs
    Creates git tag: v1.1.0
    Creates GitHub Release
    ✅ READY FOR DEPLOYMENT
```

---

## Making Commits (How to trigger automatic bumps)

### Conventional Commits Format

Just write commits normally, but use the right prefix:

```bash
# Feature (bumps MINOR version)
git commit -m "feat: add dark mode toggle"
git commit -m "feat(settings): add new language"

# Bug fix (bumps PATCH version)
git commit -m "fix: correct score calculation"
git commit -m "fix(storage): handle corrupted data"

# Breaking change (bumps MAJOR version)
git commit -m "BREAKING: remove deprecated API"
git commit -m "feat!: redesign user interface"

# Chore / other (no version bump)
git commit -m "chore: update dependencies"
git commit -m "docs: update README"
```

### What Triggers Bumps

| Prefix | Version Bump | Type |
|--------|--------------|------|
| `feat:` | MINOR (1.0.0 → 1.1.0) | New feature |
| `fix:` | PATCH (1.0.0 → 1.0.1) | Bug fix |
| `BREAKING:` or `feat!:` | MAJOR (1.0.0 → 2.0.0) | Breaking change |
| `chore:`, `docs:`, `style:`, etc. | None | Maintenance |

---

## Workflow: How to Release

## Development

### Adding Tests

1. Create `.test.ts` or `.test.tsx` file next to the module
2. Run `npm run test:watch` during development
3. Import from `vitest` and use standard assertions

Example:
```typescript
import { describe, it, expect } from "vitest";

describe("myFeature", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### Local Testing Before PR

```bash
# Run tests
npm test

# Run build
npm run build

# Both together
npm test && npm run build
```

### Accessing Version in Components

```typescript
import { getVersionString } from "@/lib/version";

export function MyComponent() {
  const version = getVersionString();
  return <p>Version: {version}</p>;
}
```

## Branch Strategy

```
main (production, stable versions only)
  ↑
  └── develop (integration, pre-release versions)
        ↑
        └── feature/* (development branches)
```

- **feature/** → PR to develop
- **develop** → PR to main (for releases)
- **main** → Stable releases only

## First Release

The first release happens automatically when you merge to `main`:

1. Ensure tests pass: `npm test`
2. Ensure build works: `npm run build`
3. Merge to `main` with features (e.g., `feat:` commits)
4. **Auto-bump workflow triggers** → calculates next version
5. **Release workflow triggers** → creates tag `v1.0.0` and Release
6. **Done!** ✨ No manual version editing needed

## Troubleshooting

### Tests are failing locally but pass in CI
- Run `npm ci` instead of `npm install` to match CI environment
- Check Node version: `node --version` (should be 20.x)

### Build fails on CI but works locally
- Ensure no uncommitted files are interfering
- Check `.gitignore` is correct
- Build in clean environment: `rm -rf node_modules dist && npm ci && npm run build`

### Release workflow isn't creating tags
- Ensure version in `version.json` has actually changed from the last tag
- Check GitHub Actions logs for errors
- Verify GitHub token permissions (should be automatic for public repos)

## ✨ Auto-Version Workflow Details

### How It Works

The `scripts/bump-version.js` script runs automatically and:

1. **Reads your git history** since the last version tag
2. **Analyzes commit messages** using Conventional Commits format
3. **Decides the version bump:**
   - `feat:` prefix → MINOR version (1.0.0 → 1.1.0)
   - `fix:` prefix → PATCH version (1.0.0 → 1.0.1)
   - `BREAKING:` prefix → MAJOR version (1.0.0 → 2.0.0)
4. **Updates `version.json`** automatically
5. **Commits the change** with git user "🤖 GitHub Actions"
6. **Pushes the commit** which triggers the Release workflow

### On develop branch
- The dev version is incremented: `1.0.0-dev.1` → `1.0.0-dev.2`
- These are pre-release versions for testing
- They appear in the About section so you know what's next

### On main branch
- The stable version is calculated from commits since last tag
- If you have 2 features and 1 fix since v1.0.0 → bumps to v1.1.0
- The release.yml workflow automatically creates the git tag and GitHub Release

### No manual intervention needed!

You just:
1. Write commits with proper prefixes (`feat:`, `fix:`, etc.)
2. Create PRs and merge
3. GitHub Actions does the rest ✨

## Files Changed/Added

**New files:**
- `version.json` - Version configuration
- `src/lib/version.ts` - Version utilities
- `.github/workflows/ci.yml` - CI tests & build
- `.github/workflows/release.yml` - Automatic versioning and releases
- `src/lib/storageService.test.ts` - Storage tests
- `src/hooks/useSavedMatches.test.ts` - Hook tests

**Modified files:**
- `src/i18n/translations.ts` - Updated version strings and added creator/social fields
- `src/pages/Settings.tsx` - Enhanced About section with links and dynamic version
- `package.json` - Updated version to 0.1.0

**NO breaking changes to app functionality** ✓
