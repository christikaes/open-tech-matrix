import { LanguageAnalyzer } from "./types";
import { getTechnologyName } from "./data/go";

/**
 * Go analyzer - reads go.mod
 */
export const goAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["go.mod"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps = new Set<string>();
    
    try {
      // Extract Go module dependencies
      const lines = content.split("\n");
      let inRequireBlock = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith("require (")) {
          inRequireBlock = true;
          continue;
        }
        
        if (inRequireBlock && trimmed === ")") {
          inRequireBlock = false;
          continue;
        }
        
        if (inRequireBlock || trimmed.startsWith("require ")) {
          const match = trimmed.match(/^\s*([a-zA-Z0-9._/-]+)/);
          if (match && !match[1].startsWith("//")) {
            // Use full module path for technology mapping
            const modulePath = match[1];
            const techName = getTechnologyName(modulePath);
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
