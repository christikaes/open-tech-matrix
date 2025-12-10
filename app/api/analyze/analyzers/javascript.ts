import { LanguageAnalyzer } from "./types";
import { getTechnologyName } from "./data/javascript";

/**
 * JavaScript/TypeScript analyzer - reads package.json
 */
export const jsAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["package.json"],
  
  extractDependencies(filePath: string, content: string): string[] {
    try {
      const pkg = JSON.parse(content);
      const deps: string[] = [];
      
      // Extract all types of dependencies
      if (pkg.dependencies) {
        deps.push(...Object.keys(pkg.dependencies));
      }
      if (pkg.devDependencies) {
        deps.push(...Object.keys(pkg.devDependencies));
      }
      if (pkg.peerDependencies) {
        deps.push(...Object.keys(pkg.peerDependencies));
      }
      
      // Map to technology names and filter out nulls (@types packages)
      const technologies = deps
        .map(dep => getTechnologyName(dep))
        .filter((tech): tech is string => tech !== null);
      
      // Return unique technologies
      return Array.from(new Set(technologies));
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return [];
    }
  }
};
