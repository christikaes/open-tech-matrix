import { TechMatrixData, TechnologyItem } from "~/types/techMatrix";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { getAnalyzer } from "./analyzers";
import { javascriptCategoryMapping } from "./analyzers/data/javascript";
import { pythonCategoryMapping } from "./analyzers/data/python";
import { javaCategoryMapping } from "./analyzers/data/java";
import { goCategoryMapping } from "./analyzers/data/go";
import { csharpCategoryMapping } from "./analyzers/data/csharp";
import { cppCategoryMapping } from "./analyzers/data/cpp";
import { rustCategoryMapping } from "./analyzers/data/rust";

export const ADOPTION_STAGES = ["Assess", "Trial", "Adopt", "Hold", "Remove"];

// Combine all category mappings
const allCategoryMappings = {
  ...javascriptCategoryMapping,
  ...pythonCategoryMapping,
  ...javaCategoryMapping,
  ...goCategoryMapping,
  ...csharpCategoryMapping,
  ...cppCategoryMapping,
  ...rustCategoryMapping,
};

/**
 * Get category for a technology name
 */
function getCategoryForTechnology(techName: string): string {
  for (const [category, technologies] of Object.entries(allCategoryMappings)) {
    if (technologies.includes(techName)) {
      return category;
    }
  }
  return "Other";
}

/**
 * Analyzes a Git repository and creates a tech radar matrix
 */
export async function analyzeTechRadar(
  repoPath: string,
  onProgress?: (message: string) => void
): Promise<TechMatrixData> {
  onProgress?.("Scanning repository for dependency files...");

  // Track both package names and their mapped technology names
  const packageToTech = new Map<string, string>(); // package -> technology name
  const currentPackages = new Set<string>();
  const historicalPackages = new Set<string>();

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
            deps.forEach(dep => {
              if (dep) { // Skip null values from @types filtering
                currentPackages.add(dep);
              }
            });
          } else {
            onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: no dependencies`);
          }

          // Extract historical dependencies
          onProgress?.(`Analyzing history of ${file}...`);
          const history = await extractTechnologyHistory(repoPath, file, onProgress);
          
          if (history.length > 0) {
            onProgress?.(`${file} has ${history.length} historical versions`);
            
            // Log first and last snapshot for debugging
            if (history.length > 0) {
              const oldest = history[0];
              const newest = history[history.length - 1];
              onProgress?.(`  Oldest (${oldest.date}): ${oldest.dependencies.length} deps`);
              onProgress?.(`  Newest (${newest.date}): ${newest.dependencies.length} deps`);
            }
            
            // Collect all historical dependencies
            history.forEach(snapshot => {
              snapshot.dependencies.forEach(dep => {
                if (dep) {
                  historicalPackages.add(dep);
                }
              });
            });
          } else {
            onProgress?.(`${file} has no git history`);
          }
        } catch (error) {
          onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: error - ${error}`);
          console.error(`Error analyzing ${file}:`, error);
        }
      }
    }

    onProgress?.(`Identified ${currentPackages.size} technologies in use`);
    onProgress?.(`Found ${historicalPackages.size} total historical dependencies`);

    // Find removed dependencies (in history but not current)
    const removedPackages = Array.from(historicalPackages).filter(
      dep => !currentPackages.has(dep)
    );

    onProgress?.(`Found ${removedPackages.length} removed dependencies`);
    
    if (removedPackages.length > 0) {
      onProgress?.(`Removed deps: ${removedPackages.slice(0, 5).join(", ")}${removedPackages.length > 5 ? "..." : ""}`);
    }
    
    // Group dependencies by technology
    const adoptTechnologies = groupDependenciesByTechnology(Array.from(currentPackages));
    const removeTechnologies = groupDependenciesByTechnology(removedPackages);
    
    onProgress?.(`Grouped into ${adoptTechnologies.length} active technologies`);
    onProgress?.(`Grouped into ${removeTechnologies.length} removed technologies`);
    onProgress?.("Tech radar analysis complete");

    return {
      assess: [],
      trial: [],
      adopt: adoptTechnologies,
      hold: [],
      remove: removeTechnologies,
      branch: "main",
    };
  } catch (error) {
    console.error("Error in tech radar analysis:", error);
    throw error;
  }
}

/**
 * Group dependencies by their technology name and assign categories
 */
function groupDependenciesByTechnology(dependencies: string[]): TechnologyItem[] {
  // Group dependencies by technology name
  // Dependencies are already technology names (e.g., "React", "Spring Boot")
  // We treat each as its own technology for now
  const technologyMap = new Map<string, Set<string>>();
  
  for (const techName of dependencies) {
    if (!technologyMap.has(techName)) {
      technologyMap.set(techName, new Set());
    }
    // For now, the technology name is the same as the dependency
    // In the future, we could track original package names if needed
    technologyMap.get(techName)!.add(techName);
  }
  
  // Convert to TechnologyItem array
  const items: TechnologyItem[] = [];
  for (const [techName, depsSet] of technologyMap.entries()) {
    items.push({
      name: techName,
      category: getCategoryForTechnology(techName),
      dependencies: Array.from(depsSet),
    });
  }
  
  // Sort by category, then by name
  return items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
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
    // First, check what commits we actually have locally
    const availableCommits = execSync(
      `git -C "${repoPath}" log --format="%H" --all 2>/dev/null || echo ""`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
    
    const availableSet = new Set(availableCommits.trim().split('\n').filter(Boolean));
    console.log(`[History] Total commits available locally: ${availableSet.size}`);
    
    // Get all commits that modified this file - use --all to search all refs
    const gitLog = execSync(
      `git -C "${repoPath}" log --all --follow --format="%H|%ai" -- "${dependencyFile}" 2>/dev/null || echo ""`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    if (!gitLog.trim()) {
      onProgress?.(`No git history found for ${dependencyFile}`);
      console.log(`[History] No git log output for ${dependencyFile}`);
      return [];
    }

    // Parse commits - each commit is on a single line with format "hash|date"
    const commitLines = gitLog.trim().split('\n').filter(Boolean);
    console.log(`[History] Raw git log returned ${commitLines.length} lines for ${dependencyFile}`);
    
    const history: Array<{ date: string; dependencies: string[] }> = [];
    let successCount = 0;
    let skippedCount = 0;

    for (const line of commitLines) {
      if (!line.includes('|')) continue;
      
      const [hash, date] = line.split("|");
      
      // Skip commits we don't have locally (shallow clone limitation)
      if (!availableSet.has(hash)) {
        skippedCount++;
        continue;
      }
      
      try {
        // Get file content at this commit
        const content = execSync(
          `git -C "${repoPath}" show ${hash}:${dependencyFile} 2>/dev/null`,
          { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
        );

        const analyzer = getAnalyzer(dependencyFile);
        if (analyzer) {
          const deps = analyzer.extractDependencies(dependencyFile, content);
          history.push({
            date: date.split(" ")[0], // Just the date part
            dependencies: deps,
          });
          successCount++;
        }
      } catch (err) {
        // File might not exist in this commit or commit not available (sparse checkout limitation)
        // Only log if we have very few failures (likely a real issue)
        skippedCount++;
        if (skippedCount <= 3) {
          console.log(`[History] Could not access ${dependencyFile} at commit ${hash.substring(0, 8)} (sparse checkout)`);
        }
        continue;
      }
    }

    // Only log summary if there were any successes or if debugging is needed
    if (successCount > 0 || commitLines.length <= 10) {
      console.log(`[History] ${dependencyFile}: ${successCount} analyzed, ${skippedCount} unavailable (${commitLines.length} total commits)`);
    }
    
    if (skippedCount > 0 && successCount > 0) {
      onProgress?.(`${dependencyFile}: analyzed ${successCount}/${commitLines.length} commits`);
    } else if (successCount > 0) {
      onProgress?.(`${dependencyFile}: analyzed ${successCount} commit${successCount > 1 ? 's' : ''}`);
    }
    
    return history.reverse(); // Oldest first
  } catch (error) {
    onProgress?.(`Error extracting history for ${dependencyFile}: ${error}`);
    console.error(`Error extracting history for ${dependencyFile}:`, error);
    return [];
  }
}
