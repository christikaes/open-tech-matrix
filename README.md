# OpenTechMatrix 🎯

A technology radar visualization tool to help you assess and track technology adoption in your projects.

## What is OpenTechMatrix?

OpenTechMatrix provides an interactive tech radar matrix to visualize technology decisions across different categories, making it easy to:
- Track technology adoption stages (Assess, Trial, Adopt, Hold, Remove)
- Understand technology choices across different areas
- Make informed decisions about technology stack
- Visualize your technology landscape
- Plan technology evolution

## Features

- **Tech Radar Matrix**: Interactive matrix with technology adoption stages
- **Five Stage Model**: Assess, Trial, Adopt, Hold, and Remove categories
- **Technology Categories**: Organize technologies by type (Language, Testing, State Management, etc.)
- **Repository Analysis**: Analyze GitHub repositories to populate the radar
- **Teal Theme**: Modern, professional interface
- **Interactive Visualization**: Easy-to-read matrix format

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Usage

1. Enter a GitHub repository URL on the home page
2. Click "Analyze"
3. View the tech radar matrix:
   - **Rows**: Technology categories (Language, Unit Testing, State Management, etc.)
   - **Columns**: Adoption stages (Assess, Trial, Adopt, Hold, Remove)
   - **Matrix**: Shows which technologies fall into which adoption stage

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with hooks
- **TypeScript 5**
- **Tailwind CSS 4**

## Project Structure

```
app/
  ├── page.tsx              # Landing page with repo input
  ├── analyze/page.tsx      # Tech radar matrix visualization page
  └── api/
      └── analyze/
          ├── route.ts              # API endpoint
          └── techRadarAnalyzer.ts  # Tech radar analysis logic
```

## Technology Categories

Currently configured categories (can be modified in `techRadarAnalyzer.ts`):
- Language
- Unit Testing
- State Management

## Adoption Stages

- **Assess**: Worth exploring to understand potential impact
- **Trial**: Worth pursuing in non-critical projects
- **Adopt**: Proven and mature, ready for production use
- **Hold**: Proceed with caution, not recommended for new projects
- **Remove**: Phase out from existing projects

## Future Enhancements

- Actual repository analysis to detect technologies
- Interactive matrix cells with technology details
- Custom category configuration UI
- Export/share functionality
- Historical tracking of technology evolution

## License

MIT

