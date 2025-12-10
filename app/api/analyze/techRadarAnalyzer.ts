import { TechMatrixData, TechnologyItem } from "~/types/techMatrix";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { getAnalyzer } from "./analyzers";
import {
  allCategoryMappings,
  allTechnologyMappings,
} from "./analyzers/data";
import { getTechnologyName as getSharedTechName } from "./analyzers/data/shared";

export const ADOPTION_STAGES = ["Assess", "Trial", "Adopt", "Hold", "Remove"];

/**
 * Get technology name for a package across all language analyzers
 */
function getTechnologyNameForPackage(packageName: string): string {
  // Skip @types packages
  if (packageName.startsWith("@types/")) {
    return packageName; // Return as-is, will be filtered later if needed
  }
  
  // Use shared getTechnologyName with combined mappings
  return getSharedTechName(packageName, allTechnologyMappings);
}

/**
 * Get category for a technology name (case-insensitive)
 */
function getCategoryForTechnology(techName: string): string {
  const techNameLower = techName.toLowerCase();
  for (const [category, technologies] of Object.entries(allCategoryMappings)) {
    if (technologies.some(tech => tech.toLowerCase() === techNameLower)) {
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
  const currentPackages = new Set<string>();
  const historicalPackages = new Set<string>();

  try {
    // Scan for dependency files
    const allFiles = getAllFiles(repoPath);
    const dependencyFiles = allFiles.filter(file => getAnalyzer(file) !== null);
    
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
          
          onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: ${deps.length} dependencies`);
          deps.forEach(dep => {
            if (dep) { // Skip null values from @types filtering
              currentPackages.add(dep);
            }
          });

          // Extract historical dependencies
          onProgress?.(`Analyzing history of ${file}...`);
          const history = await extractTechnologyHistory(repoPath, file, onProgress);
          
          // Collect all historical dependencies
          history.forEach(snapshot => {
            snapshot.dependencies.forEach(dep => {
              if (dep) {
                historicalPackages.add(dep);
              }
            });
          });
        } catch (error) {
          onProgress?.(`[${filesProcessed}/${dependencyFiles.length}] ${file}: error - ${error}`);
          console.error(`Error analyzing ${file}:`, error);
        }
      }
    }

    onProgress?.(`Identified ${currentPackages.size} technologies in use`);

    // Find removed dependencies (in history but not current)
    const removedPackages = Array.from(historicalPackages).filter(
      dep => !currentPackages.has(dep)
    );

    onProgress?.(`Found ${removedPackages.length} removed dependencies`);
    
    // Group dependencies by technology
    const adoptTechnologies = groupDependenciesByTechnology(Array.from(currentPackages), getTechnologyNameForPackage);
    const removeTechnologies = groupDependenciesByTechnology(removedPackages, getTechnologyNameForPackage);

    // Merge: if a technology appears in both adopt and remove, add it only to adopt
    // but include the removed dependencies in removedDependencies field
    const adoptTechMap = new Map(adoptTechnologies.map(t => [t.name, t]));
    const finalRemove: TechnologyItem[] = [];
    
    for (const removedTech of removeTechnologies) {
      const adoptTech = adoptTechMap.get(removedTech.name);
      if (adoptTech) {
        // Technology exists in both - add removed deps to adopt card
        adoptTech.removedDependencies = removedTech.dependencies;
      } else {
        // Technology only in remove
        finalRemove.push(removedTech);
      }
    }
    
    onProgress?.("Analysis complete");

    return {
      assess: [],
      trial: [],
      adopt: adoptTechnologies,
      hold: [],
      remove: finalRemove,
      branch: "main",
    };
  } catch (error) {
    console.error("Error in tech radar analysis:", error);
    throw error;
  }
}

/**
 * Group dependencies by their technology name and assign categories
 * @param dependencies - Array of package names (e.g., ["react", "react-dom", "webpack"])
 * @param getTechName - Function to map package name to technology name
 */
function groupDependenciesByTechnology(
  dependencies: string[], 
  getTechName: (packageName: string) => string
): TechnologyItem[] {
  // Group package names by their technology
  const technologyMap = new Map<string, Set<string>>();
  
  for (const packageName of dependencies) {
    const techName = getTechName(packageName);
    if (!technologyMap.has(techName)) {
      technologyMap.set(techName, new Set());
    }
    technologyMap.get(techName)!.add(packageName);
  }
  
  // Convert to TechnologyItem array
  const items: TechnologyItem[] = [];
  for (const [techName, packagesSet] of technologyMap.entries()) {
    items.push({
      name: techName,
      category: getCategoryForTechnology(techName),
      dependencies: Array.from(packagesSet),
    });
  }
  
  // Sort by category (with 'Other' at the end), then by name
  return items.sort((a, b) => {
    // Always put 'Other' category at the end
    if (a.category === "Other" && b.category !== "Other") return 1;
    if (a.category !== "Other" && b.category === "Other") return -1;
    
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
    
    // Get all commits that modified this file - use --all to search all refs
    const gitLog = execSync(
      `git -C "${repoPath}" log --all --follow --format="%H|%ai" -- "${dependencyFile}" 2>/dev/null || echo ""`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    if (!gitLog.trim()) {
      return [];
    }

    // Parse commits - each commit is on a single line with format "hash|date"
    const commitLines = gitLog.trim().split('\n').filter(Boolean);
    
    const history: Array<{ date: string; dependencies: string[] }> = [];
    const totalCommits = commitLines.length;

    for (let i = 0; i < commitLines.length; i++) {
      const line = commitLines[i];
      if (!line.includes('|')) continue;
      
      const [hash, date] = line.split("|");
      
      // Skip commits we don't have locally (shallow clone limitation)
      if (!availableSet.has(hash)) {
        continue;
      }
      
      // Progress indicator
      const percent = Math.round(((i + 1) / totalCommits) * 100);
      onProgress?.(`${dependencyFile}: ${percent}% (${i + 1}/${totalCommits} commits)`);
      
      
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
        }
      } catch {
        // File might not exist in this commit or commit not available (sparse checkout limitation)
        continue;
      }
    }
    
    return history.reverse(); // Oldest first
  } catch (error) {
    onProgress?.(`Error extracting history for ${dependencyFile}: ${error}`);
    console.error(`Error extracting history for ${dependencyFile}:`, error);
    return [];
  }
}
