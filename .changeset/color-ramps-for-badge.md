---
'@lsst-sqre/rubin-style-dictionary': minor
---

Add complete color ramps (100-800) for semantic colors

Implements full color ramps for all semantic colors to support the Badge component and future UI components:

- **Blue**: Complete 100-800 ramp with HSL-based color calculations
- **Green**: Complete 100-800 ramp with HSL-based color calculations
- **Orange**: Complete 100-800 ramp with HSL-based color calculations
- **Purple**: Complete 100-800 ramp with HSL-based color calculations
- **Red**: Complete 100-800 ramp with HSL-based color calculations
- **Yellow**: Complete 100-800 ramp with HSL-based color calculations

Each color ramp includes:
- Shade 100-200: Light tints for soft variant backgrounds
- Shade 300-500: Medium shades and base colors
- Shade 600: Dark shade optimized for solid backgrounds and text (WCAG AA compliant)
- Shade 700-800: Darker shades for depth and contrast

All color combinations have been tested and verified to meet WCAG AA contrast requirements (4.5:1 minimum) for:
- Solid variant: 600 shade on white background
- Soft variant: 600 shade text on 200 shade background
- Outline variant: 600 shade on page background

These tokens are ready for use in Badge component variants and other UI elements requiring semantic color theming.
