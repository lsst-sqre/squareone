---
'@lsst-sqre/squared': minor
---

Add TextArea component with auto-resize and accessibility features

Introduces a new TextArea component to complement the existing form input library:

- **Multiple sizing variants** (sm, md, lg) for different UI contexts
- **Visual state indicators** (default, error, success) for form validation feedback
- **Auto-resize functionality** with configurable min/max rows for dynamic content
- **Full accessibility compliance** with proper ARIA attributes and semantic markup
- **FormField integration** works seamlessly with the form system for labels and error messages
- **Full-width layout option** for responsive form layouts
- **Flexible row configuration** with sensible defaults for different use cases

The component supports both controlled and uncontrolled usage patterns and integrates with React Hook Form validation. Auto-resize feature intelligently calculates height based on content while respecting min/max constraints.