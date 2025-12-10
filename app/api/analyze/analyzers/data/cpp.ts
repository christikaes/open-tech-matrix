import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const cppMapping = {
  "Standard Library Extensions": {
    "Boost": ["boost", "boost-*", "libboost*"],
  },
  "Testing": {
    "Google Test": ["gtest", "googletest", "google-test"],
    "Catch2": ["catch2"],
    "doctest": ["doctest"],
    "CppUnit": ["cppunit"],
  },
  "Logging": {
    "spdlog": ["spdlog"],
    "glog": ["glog", "google-glog"],
    "log4cpp": ["log4cpp"],
  },
  "Serialization": {
    "nlohmann/json": ["nlohmann-json", "nlohmann_json", "json"],
    "RapidJSON": ["rapidjson"],
    "jsoncpp": ["jsoncpp"],
    "Protobuf": ["protobuf", "libprotobuf"],
    "FlatBuffers": ["flatbuffers"],
    "Cereal": ["cereal"],
  },
  "HTTP/Networking": {
    "cURL": ["curl", "libcurl"],
    "cpp-httplib": ["cpp-httplib", "httplib"],
    "Poco": ["poco", "poco-*"],
    "Boost.Asio": ["boost-asio"],
  },
  "Database": {
    "SQLite": ["sqlite3", "sqlite"],
    "MySQL Connector": ["mysqlclient", "mysql-connector-cpp"],
    "PostgreSQL": ["libpq", "pqxx"],
    "MongoDB C++ Driver": ["mongocxx", "bsoncxx"],
  },
  "GUI": {
    "Qt": ["qt5", "qt6", "qt5-*", "qt6-*"],
    "wxWidgets": ["wxwidgets"],
    "GTK": ["gtk", "gtk-*", "gtkmm"],
    "Dear ImGui": ["imgui"],
  },
  "Graphics": {
    "OpenGL": ["opengl", "glew", "glfw", "glfw3"],
    "Vulkan": ["vulkan"],
    "SDL": ["sdl2", "sdl2-*"],
  },
  "Math/Linear Algebra": {
    "Eigen": ["eigen", "eigen3"],
    "Armadillo": ["armadillo"],
    "GLM": ["glm"],
  },
  "Threading/Concurrency": {
    "Intel TBB": ["tbb", "intel-tbb"],
    "OpenMP": ["openmp"],
  },
  "Compression": {
    "zlib": ["zlib"],
    "Bzip2": ["bzip2"],
  },
  "Crypto": {
    "OpenSSL": ["openssl", "libssl"],
    "Crypto++": ["cryptopp", "crypto++"],
  },
  "Build Tools": {
    "CMake": ["cmake"],
  },
  "Package Managers": {
    "Conan": ["conan"],
    "vcpkg": ["vcpkg"],
  },
};

// Flatten technology mapping for getTechnologyName function
const cppTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(cppMapping)) {
  Object.assign(cppTechnologyMapping, technologies);
}

// Extract category mapping
export const cppCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(cppMapping)) {
  cppCategoryMapping[category] = Object.keys(technologies);
};

/**
 * Get the technology name for a given package name
 * @param packageName - The C++ package name
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string {
  return getTech(packageName, cppTechnologyMapping);
}
