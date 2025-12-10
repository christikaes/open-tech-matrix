/**
 * Loader for technology mapping data from JSON files
 */
import javascriptData from "./javascript.json";
import pythonData from "./python.json";
import javaData from "./java.json";
import goData from "./go.json";
import csharpData from "./csharp.json";
import cppData from "./cpp.json";
import rustData from "./rust.json";

type NestedMapping = Record<string, Record<string, string[]>>;

/**
 * Flatten nested mapping to technology -> packages
 */
function flattenMapping(nestedMapping: NestedMapping): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const technologies of Object.values(nestedMapping)) {
    Object.assign(result, technologies);
  }
  return result;
}

/**
 * Extract category mapping from nested structure
 */
function extractCategoryMapping(nestedMapping: NestedMapping): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [category, technologies] of Object.entries(nestedMapping)) {
    result[category] = Object.keys(technologies);
  }
  return result;
}

/**
 * Merge multiple category mappings, combining arrays for duplicate categories
 */
function mergeCategoryMappings(...mappings: Record<string, string[]>[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const mapping of mappings) {
    for (const [category, technologies] of Object.entries(mapping)) {
      if (result[category]) {
        // Category exists - merge the arrays
        result[category] = [...result[category], ...technologies];
      } else {
        // New category - add it
        result[category] = [...technologies];
      }
    }
  }
  return result;
}

// JavaScript
export const javascriptMapping = javascriptData as NestedMapping;
export const javascriptTechnologyMapping = flattenMapping(javascriptData as NestedMapping);
export const javascriptCategoryMapping = extractCategoryMapping(javascriptData as NestedMapping);

// Python
export const pythonMapping = pythonData as NestedMapping;
export const pythonTechnologyMapping = flattenMapping(pythonData as NestedMapping);
export const pythonCategoryMapping = extractCategoryMapping(pythonData as NestedMapping);

// Java
export const javaMapping = javaData as NestedMapping;
export const javaTechnologyMapping = flattenMapping(javaData as NestedMapping);
export const javaCategoryMapping = extractCategoryMapping(javaData as NestedMapping);

// Go
export const goMapping = goData as NestedMapping;
export const goTechnologyMapping = flattenMapping(goData as NestedMapping);
export const goCategoryMapping = extractCategoryMapping(goData as NestedMapping);

// C#
export const csharpMapping = csharpData as NestedMapping;
export const csharpTechnologyMapping = flattenMapping(csharpData as NestedMapping);
export const csharpCategoryMapping = extractCategoryMapping(csharpData as NestedMapping);

// C++
export const cppMapping = cppData as NestedMapping;
export const cppTechnologyMapping = flattenMapping(cppData as NestedMapping);
export const cppCategoryMapping = extractCategoryMapping(cppData as NestedMapping);

// Rust
export const rustMapping = rustData as NestedMapping;
export const rustTechnologyMapping = flattenMapping(rustData as NestedMapping);
export const rustCategoryMapping = extractCategoryMapping(rustData as NestedMapping);

// Combined mappings (merge all languages)
export const allCategoryMappings = mergeCategoryMappings(
  javascriptCategoryMapping,
  pythonCategoryMapping,
  javaCategoryMapping,
  goCategoryMapping,
  csharpCategoryMapping,
  cppCategoryMapping,
  rustCategoryMapping
);

export const allTechnologyMappings = {
  ...javascriptTechnologyMapping,
  ...pythonTechnologyMapping,
  ...javaTechnologyMapping,
  ...goTechnologyMapping,
  ...csharpTechnologyMapping,
  ...cppTechnologyMapping,
  ...rustTechnologyMapping,
};
