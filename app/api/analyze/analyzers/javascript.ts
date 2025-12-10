import { LanguageAnalyzer } from "./types";

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
      
      // Filter out @types packages but keep original package names
      const filtered = deps.filter(dep => !dep.startsWith('@types/'));
      
      // Return unique package names
      return Array.from(new Set(filtered));
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return [];
    }
  }
};
