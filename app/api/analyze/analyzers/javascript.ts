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
      
      return deps;
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return [];
    }
  }
};
