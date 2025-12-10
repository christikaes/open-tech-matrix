"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TechMatrixData } from "~/types/techMatrix";
import Link from "next/link";

// Simple TechRadarMatrix component for now
function TechRadarMatrix({ data, repoUrl }: { data: TechMatrixData; repoUrl?: string }) {
  return (
    <div className="p-8">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-teal-600">Tech Radar Matrix</h2>
        <p className="mb-4 text-gray-600">Repository: {repoUrl}</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-teal-100">
                <th className="border border-teal-300 px-4 py-2 text-left font-bold text-teal-900">
                  Technology
                </th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Assess</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Trial</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Adopt</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Hold</th>
                <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-teal-50">
                <td className="border border-teal-200 px-4 py-3 font-medium text-gray-900">
                  Dependencies
                </td>
                <td className="border border-teal-200 px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {data.assess.length > 0 ? (
                      data.assess.map((tech, idx) => (
                        <span key={idx} className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="border border-teal-200 px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {data.trial.length > 0 ? (
                      data.trial.map((tech, idx) => (
                        <span key={idx} className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="border border-teal-200 px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {data.adopt.length > 0 ? (
                      data.adopt.map((tech, idx) => (
                        <span key={idx} className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="border border-teal-200 px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {data.hold.length > 0 ? (
                      data.hold.map((tech, idx) => (
                        <span key={idx} className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="border border-teal-200 px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {data.remove.length > 0 ? (
                      data.remove.map((tech, idx) => (
                        <span key={idx} className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Current Dependencies: {data.adopt.length}</p>
            <p className="font-semibold text-gray-700">Removed Dependencies: {data.remove.length}</p>
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
      setProgressMessages([]);

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
            <div className="mb-4 text-6xl">🎯</div>
            <p className="text-xl font-semibold text-gray-700">
              Analyzing repository...
            </p>
            {progressMessages.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {progressMessages.map((msg, idx) => (
                  <p 
                    key={idx} 
                    className="text-sm text-teal-600 font-medium"
                    style={{ opacity: 0.5 + (idx / progressMessages.length) * 0.5 }}
                  >
                    {msg}
                  </p>
                ))}
              </div>
            )}
            <p className="mt-2 text-gray-500">
              Building tech radar matrix...
            </p>
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
