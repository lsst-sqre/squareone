---
'@lsst-sqre/squared': minor
---

Add Checkbox and CheckboxGroup components with comprehensive accessibility features

Introduces new form input components that extend the squared design system:

- **Checkbox**: Accessible checkbox input with multiple size variants (sm, md, lg), disabled states, and error handling. Features WCAG 2.5.5 compliant touch targets with visual appearance that scales independently of the minimum touch area.

- **CheckboxGroup**: Fieldset-based container for multiple checkboxes with proper legend semantics, orientation options (horizontal/vertical), and FormField integration. Uses the polymorphic Label component for consistent legend styling with support for required indicators and descriptions.

Both components integrate seamlessly with React Hook Form and provide comprehensive Storybook stories for documentation and testing. The implementation follows the established patterns from RadioGroup and other form components in the library.