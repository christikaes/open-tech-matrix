import { LanguageAnalyzer } from "./types";
import { getTechnologyName } from "./data/cpp";

/**
 * C++ analyzer - reads CMakeLists.txt, conanfile.txt, vcpkg.json
 */
export const cppAnalyzer: LanguageAnalyzer = {
  dependencyFiles: ["CMakeLists.txt", "conanfile.txt", "conanfile.py", "vcpkg.json"],
  
  extractDependencies(filePath: string, content: string): string[] {
    const deps = new Set<string>();
    
    try {
      if (filePath.endsWith("CMakeLists.txt")) {
        // Extract find_package and target_link_libraries
        const packageMatches = content.matchAll(/find_package\s*\(\s*([a-zA-Z0-9_]+)/g);
        for (const match of packageMatches) {
          const techName = getTechnologyName(match[1]);
          deps.add(techName);
        }
      } else if (filePath.includes("conanfile")) {
        // Extract Conan dependencies
        const requireMatches = content.matchAll(/["']([a-zA-Z0-9_-]+)\//g);
        for (const match of requireMatches) {
          const techName = getTechnologyName(match[1]);
          deps.add(techName);
        }
      } else if (filePath.endsWith("vcpkg.json")) {
        // Extract vcpkg dependencies
        const pkg = JSON.parse(content);
        if (pkg.dependencies && Array.isArray(pkg.dependencies)) {
          for (const d of pkg.dependencies) {
            const depName = typeof d === "string" ? d : d.name;
            const techName = getTechnologyName(depName);
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
