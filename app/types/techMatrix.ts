export interface TechnologyItem {
  name: string; // Technology name (e.g., "React", "Spring Boot")
  category: string; // Category from category mapping (e.g., "Frontend Frameworks")
  dependencies: string[]; // Actual package names currently used (e.g., ["react", "react-dom"])
  removedDependencies?: string[]; // Package names that were removed (only for technologies in adopt that also have removed deps)
}

export interface TechMatrixData {
  assess: TechnologyItem[];
  trial: TechnologyItem[];
  adopt: TechnologyItem[];
  hold: TechnologyItem[];
  remove: TechnologyItem[];
  branch?: string;
}
