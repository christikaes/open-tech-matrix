import { TechMatrixData } from "~/types/techMatrix";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { getAnalyzer } from "./analyzers";

export const ADOPTION_STAGES = ["Assess", "Trial", "Adopt", "Hold", "Remove"];

/**
 * Analyzes a Git repository and creates a tech radar matrix
 */
export async function analyzeTechRadar(
  repoPath: string,
  onProgress?: (message: string) => void
): Promise<TechMatrixData> {
  onProgress?.("Scanning repository for dependency files...");

  const currentDependencies = new Set<string>();

  try {
    // Scan for dependency files
    const allFiles = getAllFiles(repoPath);
    const dependencyFiles = allFiles.filter(file => getAnalyzer(file) !== null);
    
    onProgress?.(`Found ${allFiles.length} total files`);
    onProgress?.(`Analyzing ${dependencyFiles.length} dependency files...`);

    // Extract current dependencies
    let filesProcessed = 0;
    for (const file of dependencyFiles) {
      const analyzer = getAnalyzer(file);
      if (analyzer) {
        try {
          filesProcessed++;
          const fullPath = path.join(repoPath, file);
          const content = fs.readFileSync(fullPath, "utf-8");
          const deps = analyzer.extractDependencies(file, content);
          
          if (deps.length > 0) {
            onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: ${deps.length} dependencies`);
            deps.forEach(dep => currentDependencies.add(dep));
          } else {
            onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: no dependencies`);
          }

          // Skip historical analysis for now - it's too slow
          // TODO: Implement background job for historical analysis
          // const history = await extractTechnologyHistory(repoPath, file, onProgress);
          // history.forEach(snapshot => {
          //   snapshot.dependencies.forEach(dep => historicalDependencies.add(dep));
          // });
        } catch (error) {
          onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: error - ${error}`);
          console.error(`Error analyzing ${file}:`, error);
        }
      }
    }

    onProgress?.(`Identified ${currentDependencies.size} technologies in use`);

    // Find removed dependencies (in history but not current)
    // Skipping for now since historical analysis is disabled
    const removedDependencies: string[] = [];

    onProgress?.("Tech radar analysis complete");

    return {
      assess: [],
      trial: [],
      adopt: Array.from(currentDependencies),
      hold: [],
      remove: removedDependencies,
      branch: "main",
    };
  } catch (error) {
    console.error("Error in tech radar analysis:", error);
    throw error;
  }
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], baseDir: string = dirPath): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    
    // Skip node_modules, .git, and other common directories
    if (file === "node_modules" || file === ".git" || file === "dist" || file === "build") {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles, baseDir);
    } else {
      const relativePath = path.relative(baseDir, filePath);
      arrayOfFiles.push(relativePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Extract git history for dependency files to track technology changes over time
 */
export async function extractTechnologyHistory(
  repoPath: string,
  dependencyFile: string,
  onProgress?: (message: string) => void
): Promise<Array<{ date: string; dependencies: string[] }>> {
  try {
    onProgress?.(`Extracting history for ${dependencyFile}...`);

    // Get all commits that modified this file
    const gitLog = execSync(
      `git log --follow --format="%H|%ai" --name-only -- "${dependencyFile}"`,
      { cwd: repoPath, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    const commits = gitLog.trim().split("\n\n").filter(Boolean);
    const history: Array<{ date: string; dependencies: string[] }> = [];

    for (const commitBlock of commits) {
      const lines = commitBlock.split("\n").filter(Boolean);
      if (lines.length < 2) continue;

      const [hash, date] = lines[0].split("|");
      
      try {
        // Get file content at this commit
        const content = execSync(
          `git show ${hash}:${dependencyFile}`,
          { cwd: repoPath, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
        );

        const analyzer = getAnalyzer(dependencyFile);
        if (analyzer) {
          const deps = analyzer.extractDependencies(dependencyFile, content);
          history.push({
            date: date.split(" ")[0], // Just the date part
            dependencies: deps,
          });
        }
      } catch {
        // File might not exist in this commit, skip
        continue;
      }
    }

    onProgress?.(`Found ${history.length} historical snapshots for ${dependencyFile}`);
    return history.reverse(); // Oldest first
  } catch (error) {
    console.error(`Error extracting history for ${dependencyFile}:`, error);
    return [];
  }
}
