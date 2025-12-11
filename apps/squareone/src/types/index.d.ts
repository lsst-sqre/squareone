// Main type definitions index file

// Re-export all type declarations
export * from './config';
export * from './images';
export * from './mdx';

// Global type definitions for the application

// Common utility types for the application
export type Maybe<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Event handler types
export type EventHandler<T = Element> = (
  event: React.SyntheticEvent<T>
) => void;
export type ChangeHandler<T = HTMLInputElement> = (
  event: React.ChangeEvent<T>
) => void;
export type ClickHandler<T = HTMLButtonElement> = (
  event: React.MouseEvent<T>
) => void;
export type SubmitHandler<T = HTMLFormElement> = (
  event: React.FormEvent<T>
) => void;

// Common component prop types
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface ChildrenProps {
  children?: React.ReactNode;
}

// API response wrapper types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}
