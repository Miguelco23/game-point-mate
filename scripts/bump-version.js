#!/usr/bin/env node

/**
 * Auto-bump version based on branch name, not commit messages
 *
 * Branch naming strategy:
 * - feature/* → merge to develop → increment minor dev version
 * - release/* → merge to main → use version from branch name or increment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionPath = path.join(__dirname, '..', 'version.json');
const currentBranch = process.env.GITHUB_REF_NAME || execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

/**
 * Parse semantic version
 */
function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) throw new Error(`Invalid version format: ${versionString}`);

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
  };
}

/**
 * Get the next dev version
 * 1.0.0-dev.1 → 1.0.0-dev.2
 */
function getNextDevVersion(version) {
  const parsed = parseVersion(version);
  let devNumber = 1;

  if (parsed.prerelease && parsed.prerelease.startsWith('dev.')) {
    devNumber = parseInt(parsed.prerelease.split('.')[1]) + 1;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch}-dev.${devNumber}`;
}

/**
 * Extract version from release branch name
 * Examples: release/1.1.0, release/1.0.1, release/2.0.0
 */
function getVersionFromBranchName(branchName) {
  const match = branchName.match(/^release\/(\d+\.\d+\.\d+)$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Main logic
 */
async function main() {
  try {
    // Read current version
    const versionContent = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    const currentVersion = versionContent.version;

    console.log(`📦 Current version: ${currentVersion}`);
    console.log(`🌿 Branch: ${currentBranch}`);

    let nextVersion;
    let releaseType;

    if (currentBranch === 'develop') {
      // On develop: increment dev version (for feature merges)
      nextVersion = getNextDevVersion(currentVersion);
      releaseType = 'dev';
      console.log(`✨ Develop branch: auto-bumping dev version (from feature/* PR)`);
    } else if (currentBranch === 'main') {
      // On main: extract version from branch name or use current
      // Note: At this point we're already on main, so we need to detect
      // what branch was merged. We can check the last commit message.

      // Try to extract version from recent commit info or use parent
      let branchInfo = null;

      try {
        // Try to find merge commit info
        const mergeMessage = execSync('git log -1 --format=%B').toString().trim();
        // Extract branch name from merge commit message
        // GitHub format: Merge pull request #123 from user/release/1.1.0 into main
        const branchMatch = mergeMessage.match(/from\s+[\w-]+\/(release\/[\d.]+)/);
        if (branchMatch) {
          branchInfo = branchMatch[1];
        }
      } catch (e) {
        console.log('Could not extract branch from merge commit');
      }

      if (branchInfo) {
        const extractedVersion = getVersionFromBranchName(branchInfo);
        if (extractedVersion) {
          nextVersion = extractedVersion;
          releaseType = 'stable';
          console.log(`🚀 Release branch detected: ${branchInfo}`);
          console.log(`   Using version: ${nextVersion}`);
        } else {
          console.log(`⚠️  Could not parse version from branch: ${branchInfo}`);
          process.exit(0);
        }
      } else {
        console.log(`⚠️  Main branch but no release/* branch detected`);
        console.log(`   Skipping auto-bump. Use release/* branches for releases.`);
        process.exit(0);
      }
    } else {
      console.log(`⏭️  Branch not recognized for auto-bump: ${currentBranch}`);
      console.log(`   Use feature/* or release/* branches.`);
      process.exit(0);
    }

    // Only update if version actually changed
    if (nextVersion === currentVersion) {
      console.log(`✅ No changes needed, version already: ${nextVersion}`);
      process.exit(0);
    }

    console.log(`\n🔄 Updating version: ${currentVersion} → ${nextVersion}`);

    // Update version.json
    const newVersion = {
      version: nextVersion,
      releaseType: releaseType,
    };

    fs.writeFileSync(versionPath, JSON.stringify(newVersion, null, 2) + '\n');

    // Configure git
    execSync('git config user.name "🤖 GitHub Actions"');
    execSync('git config user.email "actions@github.com"');

    // Commit and push
    execSync('git add version.json');
    execSync(`git commit -m "chore: bump version to ${nextVersion}"`);
    execSync('git push origin HEAD');

    console.log(`\n✅ Version bumped successfully to ${nextVersion}`);
    console.log(`📌 Release type: ${releaseType}`);
  } catch (error) {
    console.error(`❌ Error bumping version:`, error.message);
    process.exit(1);
  }
}

main();
