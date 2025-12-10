import { LanguageAnalyzer } from "./types";
import { getTechnologyName } from "./data/java";

/**
 * Java analyzer - reads pom.xml, build.gradle
 */
export const javaAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["pom.xml", "build.gradle", "build.gradle.kts"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps = new Set<string>();
    
    try {
      if (filePath.endsWith("pom.xml")) {
        // Extract Maven dependencies (groupId:artifactId)
        const groupIdMatches = Array.from(content.matchAll(/<groupId>(.*?)<\/groupId>/g));
        const artifactIdMatches = Array.from(content.matchAll(/<artifactId>(.*?)<\/artifactId>/g));
        
        // Match groupId with artifactId
        for (let i = 0; i < Math.min(groupIdMatches.length, artifactIdMatches.length); i++) {
          const fullName = `${groupIdMatches[i][1]}:${artifactIdMatches[i][1]}`;
          const techName = getTechnologyName(fullName);
          deps.add(techName);
        }
      } else if (filePath.includes("build.gradle")) {
        // Extract Gradle dependencies
        const dependencyMatches = content.matchAll(/['"]([a-zA-Z0-9_.-]+:[a-zA-Z0-9_.-]+)/g);
        for (const match of dependencyMatches) {
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
