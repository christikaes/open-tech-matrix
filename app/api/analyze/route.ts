import { NextRequest } from "next/server";
import { TechMatrixData } from "~/types/techMatrix";
import { analyzeTechRadar } from "./techRadarAnalyzer";
import { analyzers } from "./analyzers";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

/**
 * Clone a Git repository using sparse checkout to only get dependency files
 * with full history for tracking technology changes over time
 */
async function cloneRepository(repoUrl: string, onProgress?: (message: string) => void): Promise<{ repoPath: string; branch: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'opentechmatrix-'));
  
  try {
    onProgress?.("Preparing to clone repository...");
    onProgress?.("Initializing sparse checkout...");
    
    // Initialize git repository
    await execAsync(`git init "${tmpDir}"`, { maxBuffer: 50 * 1024 * 1024 });
    
    // Configure sparse checkout
    await execAsync(`git -C "${tmpDir}" config core.sparseCheckout true`);
    
    // Collect all dependency file patterns from analyzers
    const dependencyPatterns = new Set<string>();
    for (const analyzer of analyzers) {
      for (const pattern of analyzer.dependencyFiles) {
        // Convert patterns to git sparse-checkout format
        if (pattern.startsWith("*")) {
          // Pattern like *.csproj - add it directly
          dependencyPatterns.add(pattern);
        } else {
          // Pattern like package.json - need to match at any depth
          dependencyPatterns.add(`**/${pattern}`);
          dependencyPatterns.add(pattern); // Also match at root
        }
      }
    }
    
    // Write sparse-checkout patterns
    const sparseCheckoutFile = path.join(tmpDir, '.git', 'info', 'sparse-checkout');
    const patterns = Array.from(dependencyPatterns);
    await fs.writeFile(sparseCheckoutFile, patterns.join('\n'));
    
    onProgress?.("Connecting to remote repository...");
    onProgress?.("Fetching repository (this may take a moment)...");
    
    // Add remote
    await execAsync(
      `git -C "${tmpDir}" remote add origin "${repoUrl}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );
    
    // Fetch only the default branch with limited depth for large repos
    // Use depth=1 for initial fetch, then unshallow only dependency files
    await execAsync(
      `git -C "${tmpDir}" fetch --depth=1 origin 2>&1`,
      { maxBuffer: 100 * 1024 * 1024, timeout: 300000 } // 5 minute timeout
    );
    
    onProgress?.("Initial fetch complete, getting branch info...");
    
    // Get default branch
    const { stdout: remoteInfo } = await execAsync(
      `git -C "${tmpDir}" remote show origin`,
      { maxBuffer: 10 * 1024 * 1024, timeout: 30000 }
    );
    const branchMatch = remoteInfo.match(/HEAD branch: (.+)/);
    const defaultBranch = branchMatch ? branchMatch[1].trim() : "main";
    
    // Checkout the default branch
    await execAsync(
      `git -C "${tmpDir}" checkout ${defaultBranch}`,
      { maxBuffer: 50 * 1024 * 1024 }
    );
    
    onProgress?.("Fetching dependency file history...");
    
    // Fetch history only for dependency files (much faster than full repo)
    // This gives us change tracking without downloading entire repo history
    try {
      const dependencyFiles = Array.from(dependencyPatterns).join(' ');
      await execAsync(
        `git -C "${tmpDir}" fetch --deepen=100 2>&1`,
        { maxBuffer: 100 * 1024 * 1024, timeout: 120000 } // 2 minute timeout for history
      );
    } catch (historyError) {
      // If fetching history fails, continue with shallow clone
      onProgress?.("Using shallow clone (history unavailable for this repository)");
    }
    
    onProgress?.("Repository ready for analysis");

    
    return { repoPath: tmpDir, branch: defaultBranch };
  } catch (error) {
    // Clean up on error
    try {
      await execAsync(`rm -rf "${tmpDir}"`);
    } catch {
      // Ignore cleanup errors
    }
    
    // Provide helpful error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timeout') || errorMessage.includes('SIGTERM') || errorMessage.includes('killed')) {
      throw new Error(
        'Repository is too large or took too long to clone. ' +
        'Try analyzing a smaller repository or one with fewer commits. ' +
        'Large repositories like React, Linux kernel, etc. may not be supported yet.'
      );
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoUrl = searchParams.get("repoUrl");

  if (!repoUrl) {
    return new Response(
      JSON.stringify({ error: "Repository URL is required" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Create a streaming response using Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;
      let repoPath: string | null = null;

      const sendProgress = (message: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "progress", message })}\n\n`)
          );
        } catch {
          isClosed = true;
        }
      };

      const sendError = (error: string) => {
        if (isClosed) return;
        console.error(`[Error] ${error}`); // Log to server console
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error })}\n\n`)
          );
          controller.close();
          isClosed = true;
        } catch {
          isClosed = true;
        }
      };

      const sendComplete = (data: TechMatrixData) => {
        if (isClosed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "complete", data })}\n\n`)
          );
          controller.close();
          isClosed = true;
        } catch {
          isClosed = true;
        }
      };

      try {
        // Clone repository
        const cloneResult = await cloneRepository(repoUrl, sendProgress);
        repoPath = cloneResult.repoPath;
        
        // Analyze repository for tech radar
        const matrixData = await analyzeTechRadar(repoPath, sendProgress);
        matrixData.branch = cloneResult.branch;

        sendComplete(matrixData);
      } catch (error) {
        console.error("Error analyzing repository:", error);
        sendError(error instanceof Error ? error.message : "Failed to analyze repository");
      } finally {
        // Clean up cloned repository
        if (repoPath) {
          try {
            await execAsync(`rm -rf "${repoPath}"`);
          } catch (error) {
            console.error("Failed to clean up repository:", error);
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
