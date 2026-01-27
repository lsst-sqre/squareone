/**
 * React hooks for Times Square API interactions.
 *
 * All hooks support repertoire service discovery for dynamic URL resolution.
 */

export {
  type UseGitHubContentsOptions,
  type UseGitHubContentsReturn,
  useGitHubContents,
} from './useGitHubContents';

export {
  type UseGitHubPrContentsOptions,
  type UseGitHubPrContentsReturn,
  useGitHubPrContents,
} from './useGitHubPrContents';

export {
  type UseHtmlStatusOptions,
  type UseHtmlStatusReturn,
  useHtmlStatus,
} from './useHtmlStatus';

export {
  type UseTimesSquarePageOptions,
  type UseTimesSquarePageReturn,
  useTimesSquarePage,
} from './useTimesSquarePage';

export { useTimesSquareUrl } from './useTimesSquareUrl';
