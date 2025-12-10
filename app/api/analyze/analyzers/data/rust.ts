import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const rustMapping = {
  "Web Frameworks": {
    "Actix": ["actix", "actix-*"],
    "Rocket": ["rocket", "rocket_*"],
    "Axum": ["axum"],
    "Warp": ["warp"],
    "Tide": ["tide"],
  },
  "Async Runtime": {
    "Tokio": ["tokio", "tokio-*"],
    "async-std": ["async-std"],
  },
  "Serialization": {
    "Serde": ["serde", "serde_*"],
    "bincode": ["bincode"],
  },
  "HTTP": {
    "reqwest": ["reqwest"],
    "hyper": ["hyper"],
  },
  "Database/ORM": {
    "Diesel": ["diesel", "diesel_*"],
    "SQLx": ["sqlx", "sqlx-*"],
    "SeaORM": ["sea-orm", "sea-orm-*"],
  },
  "Testing": {
    "criterion": ["criterion"],
    "mockall": ["mockall"],
    "proptest": ["proptest"],
  },
  "CLI": {
    "clap": ["clap"],
    "structopt": ["structopt"],
  },
  "Logging": {
    "log": ["log"],
    "env_logger": ["env_logger"],
    "tracing": ["tracing", "tracing-*"],
  },
  "Error Handling": {
    "anyhow": ["anyhow"],
    "thiserror": ["thiserror"],
  },
  "Date/Time": {
    "chrono": ["chrono"],
    "time": ["time"],
  },
  "Utilities": {
    "uuid": ["uuid"],
    "regex": ["regex"],
    "rand": ["rand", "rand_*"],
  },
  "GraphQL": {
    "juniper": ["juniper", "juniper-*"],
    "async-graphql": ["async-graphql", "async-graphql-*"],
  },
  "Template Engines": {
    "tera": ["tera"],
    "handlebars": ["handlebars"],
  },
  "Config": {
    "config": ["config"],
    "dotenv": ["dotenv"],
  },
  "Compression": {
    "flate2": ["flate2"],
  },
  "Image Processing": {
    "image": ["image"],
  },
  "WebAssembly": {
    "wasm-bindgen": ["wasm-bindgen", "wasm-bindgen-*"],
  },
  "Crypto": {
    "ring": ["ring"],
    "rustls": ["rustls"],
  },
  "Data Processing": {
    "arrow": ["arrow", "arrow-*"],
    "parquet": ["parquet"],
  },
};

// Flatten technology mapping for getTechnologyName function
const rustTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(rustMapping)) {
  Object.assign(rustTechnologyMapping, technologies);
}

// Extract category mapping
export const rustCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(rustMapping)) {
  rustCategoryMapping[category] = Object.keys(technologies);
};

/**
 * Get the technology name for a given package name
 * @param packageName - The Rust crate name
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string {
  return getTech(packageName, rustTechnologyMapping, true);
}
