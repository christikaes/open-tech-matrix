import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const pythonMapping = {
  "Web Frameworks": {
    "Django": ["django", "django-*", "djangorestframework"],
    "Flask": ["flask", "flask-*"],
    "FastAPI": ["fastapi", "fastapi-*"],
    "Tornado": ["tornado"],
    "Pyramid": ["pyramid"],
  },
  "Data Science & ML": {
    "NumPy": ["numpy"],
    "Pandas": ["pandas"],
    "Matplotlib": ["matplotlib"],
    "Seaborn": ["seaborn"],
    "SciPy": ["scipy"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "TensorFlow": ["tensorflow", "tensorflow-*"],
    "PyTorch": ["torch", "torchvision", "torchaudio"],
    "Keras": ["keras"],
    "XGBoost": ["xgboost"],
    "LightGBM": ["lightgbm"],
  },
  "Database & ORM": {
    "SQLAlchemy": ["sqlalchemy"],
    "Alembic": ["alembic"],
    "Psycopg": ["psycopg2", "psycopg2-*"],
    "PyMongo": ["pymongo"],
    "Redis": ["redis"],
  },
  "HTTP/API": {
    "Requests": ["requests"],
    "HTTPX": ["httpx"],
    "aiohttp": ["aiohttp"],
    "urllib3": ["urllib3"],
  },
  "Testing": {
    "pytest": ["pytest", "pytest-*"],
    "unittest": ["unittest2"],
    "Mock": ["mock"],
  },
  "Async": {
    "asyncio": ["asyncio"],
    "Celery": ["celery"],
  },
  "Utilities": {
    "Pillow": ["pillow"],
    "Beautiful Soup": ["beautifulsoup4", "bs4"],
    "lxml": ["lxml"],
    "PyYAML": ["pyyaml"],
    "python-dotenv": ["python-dotenv"],
    "Click": ["click"],
  },
  "Type Checking & Linting": {
    "mypy": ["mypy"],
    "black": ["black"],
    "flake8": ["flake8"],
    "pylint": ["pylint"],
    "isort": ["isort"],
  },
  "Auth": {
    "PyJWT": ["pyjwt"],
    "python-jose": ["python-jose"],
    "passlib": ["passlib"],
  },
};

// Flatten technology mapping for getTechnologyName function
const pythonTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(pythonMapping)) {
  Object.assign(pythonTechnologyMapping, technologies);
}

// Extract category mapping
export const pythonCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(pythonMapping)) {
  pythonCategoryMapping[category] = Object.keys(technologies);
}

/**
 * Get the technology name for a given package name
 * @param packageName - The Python package name
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string {
  return getTech(packageName, pythonTechnologyMapping);
}
