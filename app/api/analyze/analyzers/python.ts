import { LanguageAnalyzer } from "./types";

/**
 * Python analyzer - reads requirements.txt, setup.py, pyproject.toml
 */
export const pythonAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["requirements.txt", "setup.py", "pyproject.toml", "Pipfile"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps: string[] = [];
    
    try {
      if (filePath.endsWith("requirements.txt") || filePath.endsWith("Pipfile")) {
        // Parse requirements.txt format: package==version or package>=version
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            // Extract package name (before ==, >=, <=, etc.)
            const match = trimmed.match(/^([a-zA-Z0-9_-]+)/);
            if (match) {
              deps.push(match[1]);
            }
          }
        }
      } else if (filePath.endsWith("setup.py")) {
        // Extract from install_requires
        const match = content.match(/install_requires\s*=\s*\[([\s\S]*?)\]/);
        if (match) {
          const requirements = match[1];
          const packageMatches = requirements.matchAll(/['"]([a-zA-Z0-9_-]+)/g);
          for (const m of packageMatches) {
            deps.push(m[1]);
          }
        }
      } else if (filePath.endsWith("pyproject.toml")) {
        // Extract from dependencies array
        const match = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
        if (match) {
          const requirements = match[1];
          const packageMatches = requirements.matchAll(/['"]([a-zA-Z0-9_-]+)/g);
          for (const m of packageMatches) {
            deps.push(m[1]);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return deps;
  }
};
