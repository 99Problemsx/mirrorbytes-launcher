/**
 * Delta Patcher Service
 * Downloads only changed/new files between game versions using GitHub API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class DeltaPatcherService {
  constructor() {
    this.abortController = null;
  }

  /**
   * Get file changes between two versions using GitHub Compare API
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} baseVersion - Current installed version (e.g., "v1.0.0")
   * @param {string} targetVersion - Target version to update to (e.g., "v1.0.1")
   * @returns {Promise<Object>} - { added: [], modified: [], removed: [] }
   */
  async getFileChanges(owner, repo, baseVersion, targetVersion) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/compare/${baseVersion}...${targetVersion}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mirrorbytes-Studio-Launcher',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      https.get(options, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const comparison = JSON.parse(data);
              const changes = this.categorizeChanges(comparison.files || []);
              resolve(changes);
            } catch (err) {
              reject(new Error(`Failed to parse comparison: ${err.message}`));
            }
          } else {
            reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`));
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Categorize file changes by status
   */
  categorizeChanges(files) {
    const changes = {
      added: [],
      modified: [],
      removed: [],
      totalSize: 0
    };

    files.forEach(file => {
      const fileInfo = {
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch
      };

      if (file.status === 'added') {
        changes.added.push(fileInfo);
      } else if (file.status === 'modified') {
        changes.modified.push(fileInfo);
      } else if (file.status === 'removed') {
        changes.removed.push(fileInfo);
      }

      // Estimate size (GitHub API doesn't provide file sizes in compare)
      changes.totalSize += file.additions + file.deletions;
    });

    return changes;
  }

  /**
   * Download a single file from GitHub
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name (usually matches version tag)
   * @param {string} filepath - File path in repository
   * @param {string} destPath - Destination path on local filesystem
   * @param {Function} onProgress - Progress callback
   */
  async downloadFile(owner, repo, branch, filepath, destPath, onProgress) {
    return new Promise((resolve, reject) => {
      // Use raw.githubusercontent.com for file downloads
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
      
      https.get(url, (res) => {
        if (res.statusCode === 200) {
          // Ensure directory exists
          const dir = path.dirname(destPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          const fileStream = fs.createWriteStream(destPath);
          let downloaded = 0;
          const totalSize = parseInt(res.headers['content-length'] || 0);

          res.on('data', (chunk) => {
            downloaded += chunk.length;
            if (onProgress) {
              onProgress({
                file: filepath,
                downloaded,
                total: totalSize,
                percentage: totalSize > 0 ? (downloaded / totalSize * 100).toFixed(1) : 0
              });
            }
          });

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve({ success: true, file: filepath, size: downloaded });
          });

          fileStream.on('error', (err) => {
            fs.unlinkSync(destPath);
            reject(err);
          });
        } else if (res.statusCode === 404) {
          reject(new Error(`File not found: ${filepath}`));
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${filepath}`));
        }
      }).on('error', reject);
    });
  }

  /**
   * Apply delta patch - download changed files, remove deleted files
   * @param {Object} options - { owner, repo, baseVersion, targetVersion, installPath, onProgress }
   */
  async applyDeltaPatch(options) {
    const { owner, repo, baseVersion, targetVersion, installPath, onProgress } = options;

    try {
      // Step 1: Get file changes
      onProgress?.({ step: 'analyzing', message: 'Analyzing changes...' });
      const changes = await this.getFileChanges(owner, repo, baseVersion, targetVersion);

      const totalFiles = changes.added.length + changes.modified.length + changes.removed.length;
      
      if (totalFiles === 0) {
        return {
          success: true,
          message: 'No changes detected',
          stats: { added: 0, modified: 0, removed: 0 }
        };
      }

      onProgress?.({
        step: 'summary',
        message: `Found ${totalFiles} changed files`,
        changes: {
          added: changes.added.length,
          modified: changes.modified.length,
          removed: changes.removed.length
        }
      });

      let processedFiles = 0;

      // Step 2: Download new/modified files
      const filesToDownload = [...changes.added, ...changes.modified];
      
      for (const file of filesToDownload) {
        const destPath = path.join(installPath, file.filename);
        
        onProgress?.({
          step: 'downloading',
          message: `Downloading ${file.filename}...`,
          current: processedFiles + 1,
          total: totalFiles
        });

        try {
          await this.downloadFile(
            owner,
            repo,
            targetVersion,
            file.filename,
            destPath,
            (progress) => {
              onProgress?.({
                step: 'downloading',
                message: `Downloading ${file.filename}...`,
                current: processedFiles + 1,
                total: totalFiles,
                fileProgress: progress
              });
            }
          );
          processedFiles++;
        } catch (err) {
          console.error(`Failed to download ${file.filename}:`, err);
          throw new Error(`Failed to download ${file.filename}: ${err.message}`);
        }
      }

      // Step 3: Remove deleted files
      for (const file of changes.removed) {
        const filePath = path.join(installPath, file.filename);
        
        onProgress?.({
          step: 'removing',
          message: `Removing ${file.filename}...`,
          current: processedFiles + 1,
          total: totalFiles
        });

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          processedFiles++;
        } catch (err) {
          console.error(`Failed to remove ${file.filename}:`, err);
          // Continue even if removal fails
        }
      }

      // Step 4: Update VERSION.txt
      const versionFile = path.join(installPath, 'VERSION.txt');
      fs.writeFileSync(versionFile, targetVersion.replace(/^v/, ''));

      return {
        success: true,
        message: 'Patch applied successfully',
        stats: {
          added: changes.added.length,
          modified: changes.modified.length,
          removed: changes.removed.length,
          totalFiles: processedFiles
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current installed version from VERSION.txt
   */
  getInstalledVersion(installPath) {
    const versionFile = path.join(installPath, 'VERSION.txt');
    
    if (fs.existsSync(versionFile)) {
      try {
        const version = fs.readFileSync(versionFile, 'utf8').trim();
        return version.startsWith('v') ? version : `v${version}`;
      } catch (err) {
        console.error('Failed to read VERSION.txt:', err);
      }
    }
    
    return null;
  }

  /**
   * Check if game needs update
   */
  async checkForUpdates(owner, repo, installPath, currentVersion) {
    try {
      // Get latest release
      const latestRelease = await this.getLatestRelease(owner, repo);
      
      if (!latestRelease) {
        return { hasUpdate: false, message: 'No releases available' };
      }

      const latestVersion = latestRelease.tag_name;
      const installedVersion = currentVersion || this.getInstalledVersion(installPath);

      if (!installedVersion) {
        return {
          hasUpdate: true,
          isNewInstall: true,
          latestVersion,
          message: 'Fresh install required'
        };
      }

      // Compare versions
      const needsUpdate = this.compareVersions(latestVersion, installedVersion) > 0;

      return {
        hasUpdate: needsUpdate,
        currentVersion: installedVersion,
        latestVersion,
        message: needsUpdate ? `Update available: ${latestVersion}` : 'Up to date'
      };

    } catch (error) {
      return {
        hasUpdate: false,
        error: error.message
      };
    }
  }

  /**
   * Get latest release info
   */
  async getLatestRelease(owner, repo) {
    return new Promise((resolve, reject) => {
      https.get({
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/releases/latest`,
        headers: {
          'User-Agent': 'Mirrorbytes-Studio-Launcher'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Simple version comparison (semantic versioning)
   */
  compareVersions(v1, v2) {
    const clean1 = v1.replace(/^v/, '').split('.').map(Number);
    const clean2 = v2.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < Math.max(clean1.length, clean2.length); i++) {
      const num1 = clean1[i] || 0;
      const num2 = clean2[i] || 0;
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }
}

module.exports = new DeltaPatcherService();
