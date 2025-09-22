---
'@lsst-sqre/squared': minor
---

Add polymorphic support to Label component for legend elements

Enhances the Label component with polymorphic functionality to support both label and legend elements:

- **Polymorphic "as" prop**: Supports `as="label"` (default) and `as="legend"` for semantic flexibility
- **Description support**: New optional `description` prop for legend use cases
- **Consistent styling**: Ensures identical visual appearance between form labels and fieldset legends
- **Enhanced RadioGroup integration**: RadioGroup now uses polymorphic Label for legends with size variants
- **Improved spacing**: Better vertical separation between legends and form elements
- **Type safety**: Full TypeScript support with proper type inference for both element types

This change enables consistent typography and styling across all label and legend elements in the design system while maintaining semantic HTML correctness.