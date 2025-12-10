// Language-specific analyzer interface for dependency files
export interface LanguageAnalyzer {
  // Dependency file patterns (e.g., package.json, requirements.txt)
  dependencyFiles: string[];
  // Extract dependencies from the dependency file
  extractDependencies(filePath: string, content: string): string[];
}
