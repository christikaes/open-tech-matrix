import { getTechnologyName as getTech } from "./shared";

/**
 * Nested mapping of categories -> technologies -> packages
 * This structure ensures category and technology names are always in sync
 */
export const csharpMapping = {
  "Web Frameworks": {
    "ASP.NET Core": [
      "Microsoft.AspNetCore.*",
      "Microsoft.AspNetCore.App",
      "Microsoft.AspNetCore.All",
    ],
  },
  "Database & ORM": {
    "Entity Framework Core": [
      "Microsoft.EntityFrameworkCore",
      "Microsoft.EntityFrameworkCore.*",
    ],
    "Entity Framework": ["EntityFramework"],
    "Dapper": ["Dapper", "Dapper.*"],
    "Npgsql": ["Npgsql", "Npgsql.*"],
    "MySql.Data": ["MySql.Data", "MySqlConnector"],
    "MongoDB.Driver": ["MongoDB.Driver", "MongoDB.Driver.*"],
  },
  ".NET Core": {
    ".NET": [
      "Microsoft.NETCore.*",
      "Microsoft.Extensions.*",
    ],
  },
  "Testing": {
    "xUnit": ["xunit", "xunit.*"],
    "NUnit": ["NUnit", "NUnit.*"],
    "MSTest": ["MSTest.TestFramework", "MSTest.TestAdapter"],
    "Moq": ["Moq"],
    "FluentAssertions": ["FluentAssertions"],
  },
  "Logging": {
    "Serilog": ["Serilog", "Serilog.*"],
    "NLog": ["NLog", "NLog.*"],
    "log4net": ["log4net"],
  },
  "Serialization": {
    "Newtonsoft.Json": ["Newtonsoft.Json"],
    "System.Text.Json": ["System.Text.Json"],
  },
  "HTTP/API": {
    "RestSharp": ["RestSharp"],
    "Refit": ["Refit", "Refit.*"],
    "Polly": ["Polly", "Polly.*"],
  },
  "Utilities": {
    "AutoMapper": ["AutoMapper", "AutoMapper.*"],
    "Autofac": ["Autofac", "Autofac.*"],
  },
  "Real-time Communication": {
    "SignalR": ["Microsoft.AspNetCore.SignalR", "Microsoft.AspNetCore.SignalR.*"],
  },
  "UI Frameworks": {
    "Blazor": ["Microsoft.AspNetCore.Components.WebAssembly", "Microsoft.AspNetCore.Components.*"],
  },
  "Auth": {
    "Identity": ["Microsoft.AspNetCore.Identity", "Microsoft.AspNetCore.Identity.*"],
  },
  "API Documentation": {
    "Swagger": ["Swashbuckle.AspNetCore", "Swashbuckle.AspNetCore.*", "NSwag.*"],
  },
  "CQRS": {
    "MediatR": ["MediatR", "MediatR.*"],
  },
  "Validation": {
    "FluentValidation": ["FluentValidation", "FluentValidation.*"],
  },
  "Cloud": {
    "Azure SDK": ["Azure.*", "Microsoft.Azure.*"],
    "AWS SDK": ["AWSSDK.*"],
  },
};

// Flatten technology mapping for getTechnologyName function
const csharpTechnologyMapping: Record<string, string[]> = {};
for (const technologies of Object.values(csharpMapping)) {
  Object.assign(csharpTechnologyMapping, technologies);
}

// Extract category mapping
export const csharpCategoryMapping: Record<string, string[]> = {};
for (const [category, technologies] of Object.entries(csharpMapping)) {
  csharpCategoryMapping[category] = Object.keys(technologies);
};

/**
 * Get the technology name for a given package name
 * @param packageName - The C# package name
 * @returns The technology/framework name, or the original package name if no mapping exists
 */
export function getTechnologyName(packageName: string): string {
  return getTech(packageName, csharpTechnologyMapping);
}
