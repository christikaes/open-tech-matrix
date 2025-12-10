"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SAMPLE_PROJECTS = [
  { name: "JS | Redux", url: "https://github.com/reduxjs/redux" }, 
  { name: "PY | Flask", url: "https://github.com/pallets/flask.git" },
  { name: "Java | SpringPetclinic", url: "https://github.com/spring-projects/spring-petclinic" },
  { name: "C# | eShopOnWeb", url: "https://github.com/dotnet-architecture/eShopOnWeb" },
  { name: "Go | Gorilla Mux", url: "https://github.com/gorilla/mux" },
  { name: "C++ | SFML", url: "https://github.com/SFML/SFML" },
];

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const router = useRouter();

  const handleAnalyze = () => {
    if (repoUrl.trim()) {
      router.push(`/analyze?repo=${encodeURIComponent(repoUrl)}`);
    }
  };

  const handleSampleProject = (url: string) => {
    if (url) {
      router.push(`/analyze?repo=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100">
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-8 py-16 text-center">
        <div className="flex flex-col items-center justify-center">
        {/* Logo/Icon */}
        <div className="mb-8" aria-label="OpenTechMatrix Logo">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-6xl shadow-xl">
            🎯
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-7xl font-bold text-teal-600">
          OpenTechMatrix
        </h1>

        {/* Tagline */}
        <p className="mb-6 max-w-2xl text-xl font-medium text-teal-700">
          Visualize and track your technology adoption with an interactive tech radar matrix
        </p>

        {/* Sample Projects - Badge Style */}
        <div className="mb-4 w-full max-w-2xl">
          <p className="mb-2 text-sm text-gray-600">Try a sample project:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SAMPLE_PROJECTS.map((project) => (
              <button
                key={project.name}
                onClick={() => handleSampleProject(project.url)}
                className="rounded-full bg-teal-200 px-3 py-1 text-xs font-medium text-teal-900 transition-all hover:bg-teal-300 active:scale-95"
                title={`Analyze ${project.name} sample project`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

         {/* Input and Button */}
        <div className="mb-12 w-full max-w-2xl">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Enter repository URL..."
              className="flex-1 rounded-lg border-2 border-teal-400 bg-white px-6 py-4 text-lg text-gray-800 placeholder-gray-400 shadow-md transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-200"
            />
            <button
              onClick={handleAnalyze}
              className="rounded-lg bg-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-teal-600 hover:shadow-xl active:scale-95"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Tech Radar Stages */}
        <div className="mb-12 w-full max-w-4xl">
          <h2 className="mb-6 text-l font-bold text-teal-600">
            Tech Radar Adoption Stages
          </h2>
          <div className="overflow-hidden rounded-lg border-2 border-teal-400 bg-white shadow-lg">
            <table className="w-full">
              <thead className="bg-teal-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-teal-900">Stage</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-teal-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-200">
                <tr className="hover:bg-teal-50">
                  <td className="px-6 py-4 text-left">
                    <span className="font-semibold text-gray-900">Assess</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Worth exploring to understand potential impact</td>
                </tr>
                <tr className="hover:bg-teal-50">
                  <td className="px-6 py-4 text-left">
                    <span className="font-semibold text-gray-900">Trial</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Worth pursuing in non-critical projects</td>
                </tr>
                <tr className="hover:bg-teal-50">
                  <td className="px-6 py-4 text-left">
                    <span className="font-semibold text-gray-900">Adopt</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Proven and mature, ready for production use</td>
                </tr>
                <tr className="hover:bg-teal-50">
                  <td className="px-6 py-4 text-left">
                    <span className="font-semibold text-gray-900">Hold</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Proceed with caution, not recommended for new projects</td>
                </tr>
                <tr className="hover:bg-teal-50">
                  <td className="px-6 py-4 text-left">
                    <span className="font-semibold text-gray-900">Remove</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Phase out from existing projects</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* What is this section */}
        <div className="mt-16 w-full max-w-3xl rounded-lg border-2 border-teal-400 bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-teal-600">
            What&apos;s this all about?
          </h2>
          <div className="space-y-4 text-left text-gray-700">
            <p>
              <strong>OpenTechMatrix</strong> helps you visualize and track technology decisions 
              across your projects using a tech radar approach.
            </p>
            <p>
              Enter a Git repository URL, and the tool will analyze your codebase to generate 
              a technology matrix. The matrix shows different technology categories (like languages, 
              testing frameworks, state management) mapped against adoption stages.
            </p>
            <p>
              <strong>The goal?</strong> Make informed decisions about technology adoption, understand 
              your current tech landscape, and plan your technology evolution strategically.
            </p>
            <p>
              The five adoption stages — <em>Assess</em>, <em>Trial</em>, <em>Adopt</em>, 
              <em>Hold</em>, and <em>Remove</em> — help you categorize technologies based on 
              their maturity and suitability for your needs.
            </p>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-teal-300 bg-teal-100 py-6 text-center">
        <p className="text-gray-700">
          Made with <span className="text-red-500">♥</span> by{" "}
          <a 
            href="https://github.com/christikaes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-teal-600 transition-colors hover:text-teal-700 hover:underline"
          >
            @christikaes
          </a>
        </p>
      </footer>
    </div>
  );
}
