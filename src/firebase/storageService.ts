import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/** Upload an exported match report (e.g. JSON or text scorecard) and return its public URL. */
export async function uploadMatchReport(matchId: string, contents: string, contentType: 'application/json' | 'text/plain' = 'application/json'): Promise<string> {
  const path = `match-reports/${matchId}-${Date.now()}.${contentType === 'application/json' ? 'json' : 'txt'}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, contents, 'raw', { contentType });
  return getDownloadURL(storageRef);
}
