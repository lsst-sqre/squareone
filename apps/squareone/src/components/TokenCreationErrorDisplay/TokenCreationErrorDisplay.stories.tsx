import type { TokenCreationError } from '../../hooks/useTokenCreation';
import TokenCreationErrorDisplay from './TokenCreationErrorDisplay';

export default {
  title: 'Components/TokenCreationErrorDisplay',
  component: TokenCreationErrorDisplay,
};

// Single error message
export const SingleError = () => {
  const error: TokenCreationError = {
    status: 400,
    message: 'Token name already exists',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Multiple validation errors formatted by the formatErrorDetail function
export const MultipleValidationErrors = () => {
  const error: TokenCreationError = {
    status: 422,
    message:
      'token_name: Token name already exists; scopes: At least one scope is required; expires: Expiration date must be in the future',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Two validation errors
export const TwoValidationErrors = () => {
  const error: TokenCreationError = {
    status: 422,
    message:
      'token_name: Token name must not contain special characters; scopes: Invalid scope "admin:all"',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Network error (no status code)
export const NetworkError = () => {
  const error: TokenCreationError = {
    status: 0,
    message: 'Network error. Please check your connection and try again.',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Server error
export const ServerError = () => {
  const error: TokenCreationError = {
    status: 500,
    message: 'Internal server error. Please try again later.',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Unauthorized error
export const UnauthorizedError = () => {
  const error: TokenCreationError = {
    status: 401,
    message: 'You are not authorized to create tokens. Please log in again.',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Generic error with fallback message
export const GenericError = () => {
  const error: TokenCreationError = {
    status: 400,
    message: 'An error occurred while creating the token.',
  };

  return <TokenCreationErrorDisplay error={error} />;
};

// Field-specific validation error
export const FieldSpecificError = () => {
  const error: TokenCreationError = {
    status: 422,
    message: 'token_name: Token name must be between 1 and 64 characters',
  };

  return <TokenCreationErrorDisplay error={error} />;
};
