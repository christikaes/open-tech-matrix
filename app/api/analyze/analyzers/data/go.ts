import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const goMapping = {
  "Web Frameworks": {
    "Gin": ["github.com/gin-gonic/gin"],
    "Echo": ["github.com/labstack/echo", "github.com/labstack/echo/*"],
    "Fiber": ["github.com/gofiber/fiber", "github.com/gofiber/fiber/*"],
    "Chi": ["github.com/go-chi/chi", "github.com/go-chi/chi/*"],
    "Gorilla Mux": ["github.com/gorilla/mux"],
    "Beego": ["github.com/beego/beego", "github.com/beego/beego/*"],
  },
  "Database & ORM": {
    "GORM": ["gorm.io/gorm", "gorm.io/driver/*"],
    "pgx": ["github.com/jackc/pgx", "github.com/jackc/pgx/*"],
    "sqlx": ["github.com/jmoiron/sqlx"],
    "go-sql-driver": ["github.com/go-sql-driver/mysql"],
    "mongo-go-driver": ["go.mongodb.org/mongo-driver", "go.mongodb.org/mongo-driver/*"],
    "go-redis": ["github.com/go-redis/redis", "github.com/go-redis/redis/*"],
  },
  "Testing": {
    "Testify": ["github.com/stretchr/testify", "github.com/stretchr/testify/*"],
    "Ginkgo": ["github.com/onsi/ginkgo", "github.com/onsi/ginkgo/*"],
    "Gomega": ["github.com/onsi/gomega", "github.com/onsi/gomega/*"],
    "GoMock": ["github.com/golang/mock", "github.com/golang/mock/*"],
  },
  "Logging": {
    "Logrus": ["github.com/sirupsen/logrus"],
    "Zap": ["go.uber.org/zap", "go.uber.org/zap/*"],
    "Zerolog": ["github.com/rs/zerolog", "github.com/rs/zerolog/*"],
  },
  "HTTP/API": {
    "Resty": ["github.com/go-resty/resty", "github.com/go-resty/resty/*"],
    "Cobra": ["github.com/spf13/cobra"],
    "Viper": ["github.com/spf13/viper"],
    "gRPC": ["google.golang.org/grpc", "google.golang.org/grpc/*"],
    "protobuf": ["google.golang.org/protobuf", "google.golang.org/protobuf/*"],
  },
  "Utilities": {
    "UUID": ["github.com/google/uuid"],
    "Cast": ["github.com/spf123/cast"],
    "Validator": ["github.com/go-playground/validator", "github.com/go-playground/validator/*"],
  },
  "Cloud & Infrastructure": {
    "AWS SDK": ["github.com/aws/aws-sdk-go", "github.com/aws/aws-sdk-go/*"],
    "Kubernetes": ["k8s.io/client-go", "k8s.io/api", "k8s.io/apimachinery", "k8s.io/*"],
    "Docker": ["github.com/docker/docker", "github.com/docker/docker/*"],
  },
};

// Flatten technology mapping for getTechnologyName function
const goTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(goMapping)) {
  Object.assign(goTechnologyMapping, technologies);
}

// Extract category mapping
export const goCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(goMapping)) {
  goCategoryMapping[category] = Object.keys(technologies);
};

/**
 * Get the technology name for a given package name
 * @param packageName - The Go package name
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string {
  return getTech(packageName, goTechnologyMapping);
}
