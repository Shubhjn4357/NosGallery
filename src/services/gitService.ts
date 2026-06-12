import fallbackGitInfo from './git_info.json';

export interface GitCommitInfo {
  branch: string;
  commit: string;
  author: string;
  message: string;
  date: string;
}

export function getGitStats(): GitCommitInfo {
  try {
    return fallbackGitInfo as GitCommitInfo;
  } catch {
    return {
      branch: 'main',
      commit: 'unknown',
      author: 'Shubh',
      message: 'NOS Studio active dev',
      date: new Date().toISOString(),
    };
  }
}
