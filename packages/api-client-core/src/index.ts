// Shared logger type

// Error classification
export type { ClassifyErrorOptions, ErrorClassification } from './errors';
export { classifyError, QueryTimeoutError } from './errors';
export type { Logger } from './logger';
export { defaultLogger } from './logger';
// Reporting query-function wrapper
export type {
  ReportContext,
  ReportError,
  ReportingQueryFnOptions,
} from './reporting-query-fn';
export {
  DEFAULT_SERVER_TIMEOUT_MS,
  reportingQueryFn,
} from './reporting-query-fn';
