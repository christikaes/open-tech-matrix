import { LanguageAnalyzer } from "./types";
import { getTechnologyName } from "./data/rust";

/**
 * Rust analyzer - reads Cargo.toml
 */
export const rustAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["Cargo.toml"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps = new Set<string>();
    
    try {
      // Extract dependencies from [dependencies] section
      const lines = content.split("\n");
      let inDependenciesSection = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith("[dependencies]")) {
          inDependenciesSection = true;
          continue;
        }
        
        if (trimmed.startsWith("[") && inDependenciesSection) {
          inDependenciesSection = false;
          continue;
        }
        
        if (inDependenciesSection && trimmed) {
          const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=/);
          if (match) {
            const techName = getTechnologyName(match[1]);
            deps.add(techName);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return Array.from(deps);
  }
};
