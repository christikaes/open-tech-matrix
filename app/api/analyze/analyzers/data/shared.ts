/**
 * Shared utility functions for technology mapping
 */

/**
 * Check if a package name matches a pattern (supports wildcards)
 * @param packageName - The package/module name to check
 * @param pattern - The pattern to match against (can include * wildcards)
 * @param caseSensitive - Whether the match should be case-sensitive (default: false)
 * @returns True if the package name matches the pattern
 */
export function matchesPattern(packageName: string, pattern: string, caseSensitive = false): boolean {
  if (pattern.includes("*")) {
    // Convert wildcard pattern to regex
    const regexPattern = pattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`, caseSensitive ? "" : "i");
    return regex.test(packageName);
  }
  return caseSensitive 
    ? packageName === pattern 
    : packageName.toLowerCase() === pattern.toLowerCase();
}

/**
 * Get the technology name for a given package name using a mapping
 * Prioritizes exact matches over wildcard patterns to avoid false positives
 * @param packageName - The package/module name
 * @param mapping - The technology mapping object
 * @param caseSensitive - Whether pattern matching should be case-sensitive (default: false)
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(
  packageName: string, 
  mapping: Record<string, string[]>,
  caseSensitive = false
): string {
  // First pass: check for exact matches (no wildcards)
  for (const [tech, patterns] of Object.entries(mapping)) {
    const exactMatch = patterns.find(pattern => !pattern.includes("*") && matchesPattern(packageName, pattern, caseSensitive));
    if (exactMatch) {
      return tech;
    }
  }
  
  // Second pass: check wildcard patterns
  for (const [tech, patterns] of Object.entries(mapping)) {
    const wildcardMatch = patterns.find(pattern => pattern.includes("*") && matchesPattern(packageName, pattern, caseSensitive));
    if (wildcardMatch) {
      return tech;
    }
  }
  
  // Return original package name if no mapping found
  return packageName;
}
