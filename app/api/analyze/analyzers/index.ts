export type { LanguageAnalyzer } from "./types";
export { jsAnalyzer } from "./javascript";
export { pythonAnalyzer } from "./python";
export { cppAnalyzer } from "./cpp";
export { javaAnalyzer } from "./java";
export { csharpAnalyzer } from "./csharp";
export { goAnalyzer } from "./go";
export { rustAnalyzer } from "./rust";

import { LanguageAnalyzer } from "./types";
import { jsAnalyzer } from "./javascript";
import { pythonAnalyzer } from "./python";
import { cppAnalyzer } from "./cpp";
import { javaAnalyzer } from "./java";
import { csharpAnalyzer } from "./csharp";
import { goAnalyzer } from "./go";
import { rustAnalyzer } from "./rust";

// Analyzer registry
export const analyzers: LanguageAnalyzer[] = [
  jsAnalyzer,
  pythonAnalyzer,
  javaAnalyzer,
  cppAnalyzer,
  goAnalyzer,
  rustAnalyzer,
  csharpAnalyzer
];

// Get analyzer for a dependency file
export function getAnalyzer(filePath: string): LanguageAnalyzer | null {
  for (const analyzer of analyzers) {
    for (const pattern of analyzer.dependencyFiles) {
      // Simple pattern matching (supports exact match and *.ext patterns)
      if (pattern.startsWith("*")) {
        const ext = pattern.substring(1);
        if (filePath.endsWith(ext)) {
          return analyzer;
        }
      } else if (filePath.endsWith(pattern) || filePath.includes("/" + pattern)) {
        return analyzer;
      }
    }
  }
  return null;
}
