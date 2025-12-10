import { LanguageAnalyzer } from "./types";

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
            // Use full module path
            deps.add(match[1]);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return Array.from(deps);
  }
};
