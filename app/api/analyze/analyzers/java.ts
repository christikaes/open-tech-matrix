import { LanguageAnalyzer } from "./types";

/**
 * Java analyzer - reads pom.xml, build.gradle
 */
export const javaAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["pom.xml", "build.gradle", "build.gradle.kts"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps: string[] = [];
    
    try {
      if (filePath.endsWith("pom.xml")) {
        // Extract Maven dependencies
        const dependencyMatches = content.matchAll(/<artifactId>(.*?)<\/artifactId>/g);
        for (const match of dependencyMatches) {
          deps.push(match[1]);
        }
      } else if (filePath.includes("build.gradle")) {
        // Extract Gradle dependencies
        const dependencyMatches = content.matchAll(/['"]([a-zA-Z0-9_.-]+:[a-zA-Z0-9_.-]+)/g);
        for (const match of dependencyMatches) {
          const parts = match[1].split(":");
          if (parts.length >= 2) {
            deps.push(parts[1]); // artifact name
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return deps;
  }
};
