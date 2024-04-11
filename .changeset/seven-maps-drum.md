---
'squareone': minor
---

New `TimesSquareUrlParametersProvider` component. This React context provides the URL-based state to Times Square components, such as the page being viewed, its notebook parameters values, and the display settings. This change simplifies the structure of the React pages by refactoring all of the URL parsing into a common component. As well, this context eliminates "prop drilling" to provide this URL-based state to all components in the Times Square application.
