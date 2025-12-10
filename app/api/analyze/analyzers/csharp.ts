import { LanguageAnalyzer } from "./types";
import { getTechnologyName } from "./data/csharp";

/**
 * C# analyzer - reads .csproj files
 */
export const csharpAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["*.csproj", "packages.config"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps = new Set<string>();
    
    try {
      if (filePath.endsWith(".csproj")) {
        // Extract PackageReference from .csproj
        const packageMatches = content.matchAll(/<PackageReference\s+Include="([^"]+)"/g);
        for (const match of packageMatches) {
          const techName = getTechnologyName(match[1]);
          deps.add(techName);
        }
      } else if (filePath.endsWith("packages.config")) {
        // Extract from packages.config
        const packageMatches = content.matchAll(/<package\s+id="([^"]+)"/g);
        for (const match of packageMatches) {
          const techName = getTechnologyName(match[1]);
          deps.add(techName);
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return Array.from(deps);
  }
};
