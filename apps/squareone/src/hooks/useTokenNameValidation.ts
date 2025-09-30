import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

type ValidationState = {
  isValidating: boolean;
  isValid: boolean;
  errorMessage: string | null;
};

type UseTokenNameValidationOptions = {
  debounceMs?: number;
  validateOnChange?: boolean;
};

type UseTokenNameValidationReturn = ValidationState & {
  validateImmediately: () => void;
  reset: () => void;
};

/**
 * Hook for validating token names against existing token names with debouncing
 *
 * @param tokenName - The token name to validate
 * @param existingTokenNames - Array of existing token names to check against
 * @param options - Configuration options for validation behavior
 * @returns Validation state and control functions
 */
export default function useTokenNameValidation(
  tokenName: string,
  existingTokenNames: string[],
  options: UseTokenNameValidationOptions = {}
): UseTokenNameValidationReturn {
  const { debounceMs = 300, validateOnChange = true } = options;

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: true,
    errorMessage: null,
  });

  // Use a ref to track current state without affecting dependencies
  const validationStateRef = useRef(validationState);
  validationStateRef.current = validationState;

  // Track previous token name to prevent unnecessary effects
  const prevTokenNameRef = useRef<string>('');
  const prevExistingNamesRef = useRef<string[]>([]);

  // Memoize the existing names set for efficient lookups
  const existingNamesSet = useMemo(
    () =>
      new Set(
        existingTokenNames
          .filter((name): name is string => name != null)
          .map((name) => name.trim().toLowerCase())
      ),
    [existingTokenNames]
  );

  // Core validation logic
  const validateTokenName = useCallback(
    (name: string): ValidationState => {
      const trimmedName = name.trim();

      // Empty names are handled by form validation, so we don't need to check here
      if (trimmedName === '') {
        return {
          isValidating: false,
          isValid: true,
          errorMessage: null,
        };
      }

      // Check for duplicate names (case-insensitive)
      const isDuplicate = existingNamesSet.has(trimmedName.toLowerCase());

      if (isDuplicate) {
        return {
          isValidating: false,
          isValid: false,
          errorMessage: 'A token with this name already exists.',
        };
      }

      return {
        isValidating: false,
        isValid: true,
        errorMessage: null,
      };
    },
    [existingNamesSet]
  );

  // Immediate validation function (for onBlur)
  const validateImmediately = useCallback(() => {
    const result = validateTokenName(tokenName);
    setValidationState(result);
  }, [tokenName, validateTokenName]);

  // Reset validation state
  const reset = useCallback(() => {
    setValidationState({
      isValidating: false,
      isValid: true,
      errorMessage: null,
    });
  }, []);

  // Debounced validation effect (for onChange)
  useEffect(() => {
    if (!validateOnChange) return undefined;

    // Check if token name or existing names actually changed
    const hasTokenNameChanged = tokenName !== prevTokenNameRef.current;
    const hasExistingNamesChanged =
      existingTokenNames.length !== prevExistingNamesRef.current.length ||
      existingTokenNames.some(
        (name, index) => name !== prevExistingNamesRef.current[index]
      );

    if (!hasTokenNameChanged && !hasExistingNamesChanged) {
      return undefined;
    }

    // Update refs with current values
    prevTokenNameRef.current = tokenName;
    prevExistingNamesRef.current = [...existingTokenNames];

    // Don't validate empty names during typing
    if (tokenName.trim() === '') {
      // Only reset if we're not already in the default valid state
      const currentState = validationStateRef.current;
      if (
        !currentState.isValid ||
        currentState.errorMessage ||
        currentState.isValidating
      ) {
        reset();
      }
      return undefined;
    }

    setValidationState((prev) => ({ ...prev, isValidating: true }));

    const timeoutId = setTimeout(() => {
      const result = validateTokenName(tokenName);
      setValidationState(result);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    tokenName,
    validateTokenName,
    debounceMs,
    validateOnChange,
    existingTokenNames,
    reset,
  ]);

  return {
    ...validationState,
    validateImmediately,
    reset,
  };
}
