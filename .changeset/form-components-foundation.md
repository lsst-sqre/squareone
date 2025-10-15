---
'@lsst-sqre/squared': minor
---

Add comprehensive form input component library

Introduces a complete set of foundational form components to the squared design system:

- **Label**: Polymorphic label component supporting both `<label>` and `<legend>` elements with `as` prop for semantic flexibility. Features include required indicator support, optional description text, multiple sizing variants (sm, md, lg), and consistent styling across form labels and fieldset legends. Full TypeScript support with proper type inference for element types.
- **ErrorMessage**: Consistent error messaging component with accessibility features
- **TextInput**: Full-featured text input with validation states, sizing variants, and accessibility
- **FormField**: Compound component that provides context and orchestrates label, input, and error message relationships
