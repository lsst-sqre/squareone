declare module 'react-a11y-disclosure' {
  export interface UseDisclosureOptions {
    id?: string;
    isExpanded?: boolean;
  }

  export interface UseDisclosureResult {
    toggleProps: {
      id: string;
      'aria-expanded': boolean;
      'aria-controls': string;
      onClick: () => void;
    };
    contentProps: {
      id: string;
      'aria-labelledby': string;
      hidden?: boolean;
    };
    isExpanded: boolean;
  }

  declare function useDisclosure(
    options?: UseDisclosureOptions
  ): UseDisclosureResult;
  export default useDisclosure;
}
