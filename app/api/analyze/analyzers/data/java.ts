import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const javaMapping = {
  "Frameworks": {
    "Spring Boot": ["org.springframework.boot:*"],
    "Spring": ["org.springframework:*"],
  },
  "Testing": {
    "JUnit": ["junit:junit", "org.junit.jupiter:*"],
    "Mockito": ["org.mockito:*"],
    "TestNG": ["org.testng:*"],
  },
  "Database": {
    "Hibernate": ["org.hibernate:*"],
    "MyBatis": ["org.mybatis:*"],
    "JDBC": ["mysql:mysql-connector-java", "org.postgresql:postgresql"],
  },
  "Logging": {
    "SLF4J": ["org.slf4j:*"],
    "Logback": ["ch.qos.logback:*"],
    "Log4j": ["org.apache.logging.log4j:*"],
  },
  "Utilities": {
    "Apache Commons": ["org.apache.commons:*", "commons-io:*"],
    "Guava": ["com.google.guava:*"],
    "Jackson": ["com.fasterxml.jackson.core:*"],
    "Gson": ["com.google.code.gson:*"],
  },
  "Build Tools": {
    "Maven": ["org.apache.maven*"],
    "Gradle": ["gradle"],
  },
};

// Flatten technology mapping for getTechnologyName function
const javaTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(javaMapping)) {
  Object.assign(javaTechnologyMapping, technologies);
}

// Extract category mapping
export const javaCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(javaMapping)) {
  javaCategoryMapping[category] = Object.keys(technologies);
}

/**
 * Get the technology name for a given package name
 * @param packageName - The Java package name (groupId:artifactId format)
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string {
  return getTech(packageName, javaTechnologyMapping);
}
