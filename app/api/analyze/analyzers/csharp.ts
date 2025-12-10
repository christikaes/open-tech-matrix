import { LanguageAnalyzer } from "./types";

/**
 * C# analyzer - reads .csproj files
 */
export const csharpAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["*.csproj", "packages.config"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps: string[] = [];
    
    try {
      if (filePath.endsWith(".csproj")) {
        // Extract PackageReference from .csproj
        const packageMatches = content.matchAll(/<PackageReference\s+Include="([^"]+)"/g);
        for (const match of packageMatches) {
          deps.push(match[1]);
        }
      } else if (filePath.endsWith("packages.config")) {
        // Extract from packages.config
        const packageMatches = content.matchAll(/<package\s+id="([^"]+)"/g);
        for (const match of packageMatches) {
          deps.push(match[1]);
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return deps;
  }
};
