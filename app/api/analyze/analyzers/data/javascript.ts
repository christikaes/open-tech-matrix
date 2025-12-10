import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const javascriptMapping = {
  "Frontend Frameworks": {
    "React": ["react", "react-dom", "react-is", "react-refresh"],
    "Vue": ["vue", "vue-router", "vue-loader", "vuex", "pinia"],
    "Angular": ["@angular/*"],
    "Svelte": ["svelte", "svelte-loader"],
  },
  "Meta-Frameworks": {
    "Next.js": ["next"],
  },
  "Component Libraries": {
    "Material-UI": ["@mui/*", "@emotion/react", "@emotion/styled"],
    "Ant Design": ["antd", "@ant-design/*"],
    "Chakra UI": ["@chakra-ui/*"],
    "Bootstrap": ["bootstrap", "react-bootstrap"],
  },
  "State Management": {
    "Redux": ["redux", "react-redux", "@reduxjs/toolkit", "redux-thunk", "redux-saga"],
    "MobX": ["mobx", "mobx-react", "mobx-react-lite"],
    "Zustand": ["zustand"],
    "Recoil": ["recoil"],
  },
  "Build Tools": {
    "Webpack": ["webpack", "webpack-cli", "webpack-dev-server", "webpack-merge"],
    "Vite": ["vite", "@vitejs/*"],
    "Rollup": ["rollup", "@rollup/*"],
    "Parcel": ["parcel", "parcel-bundler"],
    "esbuild": ["esbuild"],
  },
  "Languages": {
    "TypeScript": ["typescript", "ts-node", "ts-loader", "tsx"],
    "Babel": ["@babel/*", "babel-*"],
  },
  "Testing": {
    "Jest": ["jest", "@jest/*", "jest-environment-jsdom", "ts-jest", "babel-jest"],
    "Vitest": ["vitest", "@vitest/*"],
    "Mocha": ["mocha", "chai", "chai-http"],
    "Jasmine": ["jasmine", "jasmine-core"],
    "Cypress": ["cypress"],
    "Playwright": ["@playwright/*", "playwright"],
    "Testing Library": ["@testing-library/*"],
  },
  "Linting & Formatting": {
    "ESLint": ["eslint", "eslint-config-*", "eslint-plugin-*"],
    "Prettier": ["prettier"],
    "Stylelint": ["stylelint"],
  },
  "Styling": {
    "Tailwind CSS": ["tailwindcss", "@tailwindcss/*"],
    "Sass": ["sass", "node-sass", "sass-loader"],
    "PostCSS": ["postcss", "autoprefixer", "postcss-loader"],
    "Styled Components": ["styled-components"],
  },
  "HTTP/API": {
    "Axios": ["axios"],
    "GraphQL": ["graphql", "@apollo/*", "apollo-server", "graphql-request"],
    "tRPC": ["@trpc/*"],
    "React Query": ["@tanstack/react-query", "react-query"],
  },
  "Backend Frameworks": {
    "Express": ["express", "express-validator"],
    "Fastify": ["fastify"],
    "Koa": ["koa", "koa-router"],
    "NestJS": ["@nestjs/*"],
  },
  "Database & ORM": {
    "Prisma": ["prisma", "@prisma/*"],
    "TypeORM": ["typeorm"],
    "Sequelize": ["sequelize"],
    "Mongoose": ["mongoose"],
    "Drizzle ORM": ["drizzle-orm"],
  },
  "Utilities": {
    "Lodash": ["lodash", "lodash-es"],
    "Ramda": ["ramda"],
    "Day.js": ["dayjs"],
    "Moment.js": ["moment"],
    "date-fns": ["date-fns"],
    "Zod": ["zod"],
    "Yup": ["yup"],
  },
  "Animation": {
    "Framer Motion": ["framer-motion"],
    "React Spring": ["react-spring"],
    "GSAP": ["gsap"],
  },
  "Forms": {
    "React Hook Form": ["react-hook-form"],
    "Formik": ["formik"],
  },
  "Routing": {
    "React Router": ["react-router", "react-router-dom"],
    "TanStack Router": ["@tanstack/react-router"],
  },
};

// Flatten technology mapping for getTechnologyName function
const javascriptTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(javascriptMapping)) {
  Object.assign(javascriptTechnologyMapping, technologies);
}

// Extract category mapping
export const javascriptCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(javascriptMapping)) {
  javascriptCategoryMapping[category] = Object.keys(technologies);
}

/**
 * Get the technology name for a given package name
 * @param packageName - The npm package name
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string | null {
  // Skip @types packages
  if (packageName.startsWith("@types/")) {
    return null;
  }
  
  return getTech(packageName, javascriptTechnologyMapping);
}
