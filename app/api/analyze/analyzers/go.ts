import { LanguageAnalyzer } from "./types";

/**
 * Go analyzer - reads go.mod
 */
export const goAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["go.mod"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps: string[] = [];
    
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
            // Extract last part of module path as dependency name
            const parts = match[1].split("/");
            deps.push(parts[parts.length - 1]);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return deps;
  }
};
