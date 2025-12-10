"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TechMatrixData } from "~/types/techMatrix";
import Link from "next/link";

// Simple TechRadarMatrix component for now
function TechRadarMatrix({ data, repoUrl }: { data: TechMatrixData; repoUrl?: string }) {
  const [showDetails, setShowDetails] = useState(false);

  // Group technologies by category
  const groupByCategory = (items: typeof data.adopt) => {
    const grouped = new Map<string, typeof data.adopt>();
    items.forEach(item => {
      if (!grouped.has(item.category)) {
        grouped.set(item.category, []);
      }
      grouped.get(item.category)!.push(item);
    });
    return grouped;
  };

  const adoptByCategory = groupByCategory(data.adopt);
  const removeByCategory = groupByCategory(data.remove);

  return (
    <div className="p-8">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-teal-600">Tech Radar Matrix</h2>
            <p className="mt-1 text-gray-600">Repository: {repoUrl}</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-teal-100">
                <th className="border border-teal-300 px-4 py-2 text-left font-bold text-teal-900">
                  Category
                </th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Assess</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Trial</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Adopt</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Hold</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Remove</th>
              </tr>
            </thead>
            <tbody>
              {/* Collect all unique categories */}
              {Array.from(new Set([...adoptByCategory.keys(), ...removeByCategory.keys()]))
                .sort((a, b) => {
                  // Always put 'Other' at the bottom
                  if (a === "Other" && b !== "Other") return 1;
                  if (a !== "Other" && b === "Other") return -1;
                  return a.localeCompare(b);
                })
                .map((category) => (
                <tr key={category} className="hover:bg-teal-50">
                  <td className="border border-teal-200 px-4 py-3 font-medium text-gray-900">
                    {category}
                  </td>
                  <td className="border border-teal-200 px-4 py-3 align-top">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="border border-teal-200 px-4 py-3 align-top">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="border border-teal-200 px-4 py-3 align-top">
                    {category === "Other" ? (
                      <div className="flex flex-wrap gap-1">
                        {adoptByCategory.get(category)?.flatMap(tech => tech.dependencies).map((dep, idx) => (
                          <span key={idx} className="rounded bg-green-200 px-1.5 py-0.5 text-xs text-green-800">
                            {dep}
                          </span>
                        )) || <span className="text-gray-400">-</span>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {adoptByCategory.get(category)?.map((tech, idx) => (
                          <div key={idx} className="rounded-lg border border-green-300 bg-green-50 p-2">
                            <div className="mb-1 font-semibold text-green-900">{tech.name}</div>
                            {showDetails && (
                              <div className="flex flex-wrap gap-1">
                                {tech.dependencies.map((dep, depIdx) => (
                                  <span key={depIdx} className="rounded bg-green-200 px-1.5 py-0.5 text-xs text-green-800">
                                    {dep}
                                  </span>
                                ))}
                                {tech.removedDependencies?.map((dep, depIdx) => (
                                  <span key={`removed-${depIdx}`} className="rounded bg-red-200 px-1.5 py-0.5 text-xs text-red-800">
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )) || <span className="text-gray-400">-</span>}
                      </div>
                    )}
                  </td>
                  <td className="border border-teal-200 px-4 py-3 align-top">
                    <span className="text-gray-400">-</span>
                  </td>
                  <td className="border border-teal-200 px-4 py-3 align-top">
                    {category === "Other" ? (
                      <div className="flex flex-wrap gap-1">
                        {removeByCategory.get(category)?.flatMap(tech => tech.dependencies).map((dep, idx) => (
                          <span key={idx} className="rounded bg-red-200 px-1.5 py-0.5 text-xs text-red-800">
                            {dep}
                          </span>
                        )) || <span className="text-gray-400">-</span>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {removeByCategory.get(category)?.map((tech, idx) => (
                          <div key={idx} className="rounded-lg border border-red-300 bg-red-50 p-2">
                            <div className="mb-1 font-semibold text-red-900">{tech.name}</div>
                            {showDetails && (
                              <div className="flex flex-wrap gap-1">
                                {tech.dependencies.map((dep, depIdx) => (
                                  <span key={depIdx} className="rounded bg-red-200 px-1.5 py-0.5 text-xs text-red-800">
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )) || <span className="text-gray-400">-</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Current Technologies: {data.adopt.length}</p>
            <p className="font-semibold text-gray-700">Removed Technologies: {data.remove.length}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Branch: {data.branch || 'main'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const [radarData, setRadarData] = useState<TechMatrixData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!repoUrl) return;

    const fetchRadarData = () => {
      setLoading(true);
      setError(null);
      setProgressMessages(["Connecting to repository...", "Preparing to fetch..."]);

      // Show initial progress before EventSource connects
      setTimeout(() => {
        setProgressMessages(prev => [...prev, "Fetching repository..."]);
      }, 500);

      const eventSource = new EventSource(`/api/analyze?repoUrl=${encodeURIComponent(repoUrl)}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setProgressMessages(prev => {
            const newMessages = [...prev, data.message];
            return newMessages.slice(-5);
          });
        } else if (data.type === "complete") {
          setRadarData(data.data);
          setLoading(false);
          eventSource.close();
        } else if (data.type === "error") {
          setError(data.error);
          setLoading(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setError("Connection error occurred");
        setLoading(false);
        eventSource.close();
      };
    };

    fetchRadarData();
  }, [repoUrl]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between px-8 pt-6">
          <div className="flex-1">
            <Link
              href="/"
              className="mb-4 inline-flex items-center text-sm text-teal-400 hover:text-teal-300"
            >
              OpenTechMatrix
            </Link>
            <h1 className="text-4xl font-bold text-teal-400">
              {repoUrl ? repoUrl.split('/').pop()?.replace('.git', '') || repoUrl : 'Repository'}
            </h1>
            {repoUrl && (
              <p className="mt-2 text-sm text-gray-400">
                Analyzing: <span className="font-medium">{repoUrl}</span>
              </p>
            )}
          </div>
        </div>

        {!repoUrl && (
          <div className="rounded-lg bg-white p-8 text-center shadow-md mx-8">
            <p className="text-lg text-gray-600">
              No repository URL provided. Please go back to the home page and
              enter a repository URL.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-teal-600"
            >
              Go to Home
            </Link>
          </div>
        )}

        {loading && (
          <div className="rounded-lg bg-white p-12 text-center shadow-md mx-8">
            <div className="mb-4 text-6xl animate-pulse">🎯</div>
            <p className="text-xl font-semibold text-gray-700">
              Analyzing repository...
            </p>
            {progressMessages.length > 0 && (
              <div className="mt-6 space-y-2 max-h-40 overflow-y-auto">
                {progressMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <p 
                      className="text-sm text-gray-700 font-medium"
                      style={{ opacity: 0.4 + (idx / progressMessages.length) * 0.6 }}
                    >
                      {msg}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border-2 border-red-300 p-8 shadow-md mx-8">
            <p className="text-lg font-semibold text-red-700">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-500 px-6 py-2 font-semibold text-white transition-all hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {radarData && !loading && !error && (
          <TechRadarMatrix data={radarData} repoUrl={repoUrl || undefined} />
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎯</div>
          <p className="text-xl font-semibold text-teal-400">Loading...</p>
        </div>
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}
