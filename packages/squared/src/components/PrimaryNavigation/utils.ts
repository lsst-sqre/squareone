// Part of solution for locating menu content under the trigger:
// https://github.com/radix-ui/primitives/issues/1462#issuecomment-2275683692
export function mergeReferences<T = unknown>(
  references: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return (value) => {
    for (const reference of references) {
      if (typeof reference === 'function') {
        reference(value);
      } else if (reference != null) {
        (reference as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}
