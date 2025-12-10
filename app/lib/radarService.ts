import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { TechMatrixData } from '../types/techMatrix';

export interface SavedRadarData extends TechMatrixData {
  savedAt: Date;
  repoUrl: string;
}

/**
 * Generate a consistent document ID from a repository URL
 */
export function getRepoDocId(repoUrl: string): string {
  // Normalize the URL to create a consistent ID
  // e.g., "https://github.com/user/repo" -> "github_user_repo"
  const normalized = repoUrl
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\.git$/, '')
    .replace(/[^a-z0-9]/g, '_');
  return normalized;
}

/**
 * Save radar data to Firebase
 */
export async function saveRadarData(
  repoUrl: string,
  data: TechMatrixData
): Promise<void> {
  if (!db) {
    throw new Error('Firebase is not initialized');
  }

  const docId = getRepoDocId(repoUrl);
  console.log(`💾 Saving to Firebase with docId: ${docId}`);
  console.log(`   Original URL: ${repoUrl}`);
  const radarRef = doc(db, 'radars', docId);

  await setDoc(radarRef, {
    ...data,
    repoUrl,
    savedAt: serverTimestamp(),
  });
  console.log('✅ Successfully saved to Firebase');
}

/**
 * Load radar data from Firebase with timeout
 */
export async function loadRadarData(
  repoUrl: string
): Promise<SavedRadarData | null> {
  if (!db) {
    console.warn('Firebase is not initialized');
    return null;
  }

  try {
    const docId = getRepoDocId(repoUrl);
    console.log(`🔍 Loading from Firebase with docId: ${docId}`);
    console.log(`   Original URL: ${repoUrl}`);
    const radarRef = doc(db, 'radars', docId);
    
    // Add timeout to prevent hanging (reduced to 2 seconds)
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => {
        console.warn('Firebase load timed out after 2 seconds. This usually means:');
        console.warn('1. Firestore security rules are blocking reads (most common)');
        console.warn('2. Network connectivity issues');
        console.warn('3. Firestore is not enabled in your Firebase project');
        console.warn('Visit: https://console.firebase.google.com/project/open-tech-radar/firestore');
        resolve(null);
      }, 2000)
    );
    
    const loadPromise = getDoc(radarRef).then(docSnap => {
      if (docSnap.exists()) {
        console.log('✅ Successfully loaded data from Firebase');
        const data = docSnap.data();
        return {
          ...data,
          savedAt: data.savedAt?.toDate() || new Date(),
        } as SavedRadarData;
      }
      console.log('No saved data found in Firebase');
      return null;
    });

    return await Promise.race([loadPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return null;
  }
}
