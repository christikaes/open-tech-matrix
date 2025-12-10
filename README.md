# OpenTechMatrix 🎯

A technology radar visualization tool that analyzes Git repositories to automatically detect and track technology adoption across your projects.

## What is OpenTechMatrix?

OpenTechMatrix analyzes any Git repository to automatically detect technologies used in your codebase and visualizes them in a tech radar matrix. It helps teams:

- **Automatically detect technologies** from dependency files (package.json, requirements.txt, pom.xml, etc.)
- **Track technology adoption** across different stages (Adopt, Remove)
- **Visualize your tech stack** organized by category (Web Frameworks, Testing, Database & ORM, etc.)
- **Monitor technology changes** by analyzing git history to show added/removed dependencies
- **Make informed decisions** about technology stack evolution

## Features

- 🔍 **Automatic Repository Analysis**: Analyzes 7+ languages (JavaScript/TypeScript, Python, Java, C#, Go, C++, Rust)
- 📊 **Comprehensive Library Detection**: 2,800+ library mappings across 200+ technology categories
- 🎯 **Tech Radar Matrix**: Interactive visualization with Adopt/Remove stages
- 📈 **Git History Analysis**: Tracks technology evolution by analyzing dependency file history
- 🚀 **Real-time Progress**: Live progress indicators during repository analysis
- 🎨 **Modern UI**: Clean, responsive interface with Tailwind CSS
- 🔗 **Sample Projects**: Pre-configured examples for popular frameworks
- 💾 **Firebase Persistence**: Save and load radar data instead of recomputing
- ✏️ **Interactive Editing**: Drag-and-drop technologies between stages and categories
- 🏷️ **Category Management**: Rename, delete, or reorder categories
- ➕ **Manual Technology Addition**: Add technologies not detected automatically
- 📦 **Package Management**: Add/remove individual package names from technologies

## Supported Languages & Ecosystems

- **JavaScript/TypeScript**: npm packages (package.json)
- **Python**: pip packages (requirements.txt, setup.py, pyproject.toml)
- **Java**: Maven/Gradle dependencies (pom.xml, build.gradle)
- **C#**: NuGet packages (*.csproj, packages.config)
- **Go**: Go modules (go.mod)
- **C++**: Various package managers (CMakeLists.txt, vcpkg.json, conanfile.txt)
- **Rust**: Cargo crates (Cargo.toml)

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t opentechmatrix .
docker run -p 3000:3000 opentechmatrix
```

### Firebase Configuration (Optional)

To enable data persistence and avoid recomputing analyses:

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Copy `.env.local.example` to `.env.local`
4. Add your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Without Firebase**: The app still works normally but will recompute the analysis each time.

### Usage

1. **Enter a Git repository URL** on the home page (GitHub, GitLab, Bitbucket, or any Git URL)
2. **Click "Analyze"** or try one of the sample projects
3. **Watch real-time progress** as the repository is cloned and analyzed (first time only)
4. **View the tech radar matrix**:
   - Technologies organized by category (Web Frameworks, Testing, Database, etc.)
   - **Adopt column**: Technologies currently in use with their package names
   - **Remove column**: Technologies that were removed from the project
   - Toggle "Show/Hide Details" to see individual package names
5. **Enable Edit Mode** to make changes:
   - **Drag cards** between stages (Assess, Trial, Adopt, Hold, Remove)
   - **Drag cards** between categories to recategorize technologies
   - **Rename categories** by clicking the ✏️ icon
   - **Delete categories** by clicking the 🗑️ icon (technologies move to "Other")
   - **Add technologies** manually using the "+ Add Technology" button
   - **Edit packages** by clicking package names in detail view to remove them
6. **Save changes** to Firebase to persist your customizations
7. **Future loads** will use saved data instead of recomputing

## Tech Stack

- **Next.js 16** with App Router & Turbopack
- **React 19** with Server Components
- **TypeScript 5**
- **Tailwind CSS 4**
- **Firebase Firestore** for data persistence
- **@hello-pangea/dnd** for drag-and-drop interactions
- **Server-Sent Events** for real-time progress streaming
- **Git sparse-checkout** for efficient repository analysis

## Project Structure

```
app/
  ├── page.tsx                      # Landing page with repo input & sample projects
  ├── analyze/page.tsx              # Tech radar matrix visualization
  ├── api/analyze/
  │   ├── route.ts                  # API endpoint with SSE streaming
  │   ├── techRadarAnalyzer.ts      # Main analysis orchestration
  │   └── analyzers/
  │       ├── index.ts              # Analyzer loader & exports
  │       ├── types.ts              # Shared analyzer types
  │       ├── constants.ts          # Configuration constants
  │       ├── javascript.ts         # JavaScript/TypeScript analyzer
  │       ├── python.ts             # Python analyzer
  │       ├── java.ts               # Java analyzer
  │       ├── csharp.ts             # C# analyzer
  │       ├── go.ts                 # Go analyzer
  │       ├── cpp.ts                # C++ analyzer
  │       ├── rust.ts               # Rust analyzer
  │       └── data/
  │           ├── index.ts          # JSON loader & mapping generator
  │           ├── javascript.json   # 700+ JS/TS library mappings
  │           ├── python.json       # 500+ Python library mappings
  │           ├── java.json         # 400+ Java library mappings
  │           ├── csharp.json       # 400+ .NET library mappings
  │           ├── go.json           # 300+ Go library mappings
  │           ├── cpp.json          # 300+ C++ library mappings
  │           └── rust.json         # 400+ Rust library mappings
  └── types/
      └── techMatrix.ts             # TypeScript type definitions
```

## Technology Categories

The system automatically categorizes detected libraries into 200+ categories including:

**Web Development**: Web Frameworks, Frontend Frameworks, Meta-Frameworks, UI Component Libraries, CSS Frameworks

**Testing & Quality**: Testing Frameworks, Mocking, Assertions, E2E Testing, Performance Testing

**Data Layer**: Database Drivers, ORM, Query Builders, Caching, Serialization

**Backend Services**: API Development, GraphQL, gRPC, Authentication, Background Jobs

**DevOps & Tools**: Build Tools, CLI Tools, Logging, Monitoring, Deployment

**And many more...** (View the JSON files in `app/api/analyze/analyzers/data/` for complete lists)

## Adoption Stages

- **Adopt**: Technologies currently used in the project (detected from dependency files)
- **Remove**: Technologies that were removed from the project (detected via git history)

Future stages (not yet implemented):
- **Assess**: Worth exploring to understand potential impact
- **Trial**: Worth pursuing in non-critical projects  
- **Hold**: Proceed with caution, not recommended for new projects

## How It Works

1. **Repository Cloning**: Uses Git sparse-checkout to efficiently clone only dependency files
2. **File Detection**: Scans for dependency files across all supported languages
3. **Dependency Extraction**: Parses dependency files to extract package names and versions
4. **Technology Mapping**: Maps packages to technology names using curated JSON mappings
5. **Category Assignment**: Assigns technologies to categories based on their ecosystem
6. **Git History Analysis**: Analyzes commit history to detect removed dependencies
7. **Visualization**: Generates an interactive tech radar matrix grouped by category

## Adding New Libraries

To add support for new libraries, edit the JSON files in `app/api/analyze/analyzers/data/`:

```json
{
  "Category Name": {
    "Technology Name": ["package-name", "package-name-*", "org.example:*"]
  }
}
```

Supports wildcard patterns for package prefixes and scopes.

## Environment Variables

```bash
# Firebase Configuration (optional - enables data persistence)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Repository Analysis (optional)
CLONE_DEPTH=10              # Git clone depth (default: 10)
MAX_REPO_SIZE_MB=500        # Max repository size in MB (default: 500)
```

## Performance

- **Sparse checkout**: Only clones dependency files, not entire source code
- **Shallow clone**: Configurable depth for faster cloning
- **Parallel processing**: Analyzes multiple languages concurrently
- **Repository size limit**: Prevents timeout on extremely large repositories
- **Progress streaming**: Real-time feedback via Server-Sent Events

## Contributing

Contributions welcome! Areas of interest:

- Adding more library mappings to JSON files
- Supporting additional package managers
- Improving technology categorization
- Adding historical tracking features
- UI/UX enhancements

## License

MIT

## Credits

Made with ♥ by [@christikaes](https://github.com/christikaes)

