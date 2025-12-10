export interface TechnologyItem {
  name: string; // Technology name (e.g., "React", "Spring Boot")
  category: string; // Category from category mapping (e.g., "Frontend Frameworks")
  dependencies: string[]; // Actual package names used (e.g., ["react", "react-dom"])
}

export interface TechMatrixData {
  assess: TechnologyItem[];
  trial: TechnologyItem[];
  adopt: TechnologyItem[];
  hold: TechnologyItem[];
  remove: TechnologyItem[];
  branch?: string;
}
