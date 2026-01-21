/**
 * Test utilities for Times Square client testing.
 *
 * Provides random data generators using @anatine/zod-mock.
 */
import { generateMock } from '@anatine/zod-mock';

import {
  type GitHubCheckRunSummary,
  GitHubCheckRunSummarySchema,
  type GitHubPr,
  GitHubPrSchema,
  type HtmlEvent,
  HtmlEventSchema,
  type HtmlStatus,
  HtmlStatusSchema,
  type Page,
  PageSchema,
  type PageSummary,
  PageSummarySchema,
  type Person,
  PersonSchema,
} from './schemas';

/**
 * Generate random page metadata.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomPage(seed?: number): Page {
  return generateMock(PageSchema, { seed });
}

/**
 * Generate random page summary.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomPageSummary(seed?: number): PageSummary {
  return generateMock(PageSummarySchema, { seed });
}

/**
 * Generate random HTML status.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomHtmlStatus(seed?: number): HtmlStatus {
  return generateMock(HtmlStatusSchema, { seed });
}

/**
 * Generate random HTML event.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomHtmlEvent(seed?: number): HtmlEvent {
  return generateMock(HtmlEventSchema, { seed });
}

/**
 * Generate random person (author).
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomPerson(seed?: number): Person {
  return generateMock(PersonSchema, { seed });
}

/**
 * Generate random GitHub check run summary.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomGitHubCheck(
  seed?: number
): GitHubCheckRunSummary {
  return generateMock(GitHubCheckRunSummarySchema, { seed });
}

/**
 * Generate random GitHub pull request.
 *
 * @param seed - Optional seed for reproducible generation
 */
export function generateRandomGitHubPr(seed?: number): GitHubPr {
  return generateMock(GitHubPrSchema, { seed });
}

/**
 * Collection of generator functions for all Times Square types.
 */
export const generators = {
  page: generateRandomPage,
  pageSummary: generateRandomPageSummary,
  htmlStatus: generateRandomHtmlStatus,
  htmlEvent: generateRandomHtmlEvent,
  person: generateRandomPerson,
  githubCheck: generateRandomGitHubCheck,
  githubPr: generateRandomGitHubPr,
};
