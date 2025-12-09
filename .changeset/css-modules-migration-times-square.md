---
"squareone": minor
---

Migrate Times Square components from styled-components to CSS Modules

This change completes the CSS Modules migration for all Times Square notebook execution components, replacing styled-components with CSS Modules and design tokens.

**Times Square App Layout**

- `TimesSquareApp` - Main app layout wrapper
- `Sidebar` - Times Square sidebar with navigation

**GitHub Navigation Components**

- `TimesSquareGitHubNav` - File tree navigation
- `Directory` - Directory entries with expandable folders
- `Page` - Notebook page entries with current state highlighting
- `TimesSquareMainGitHubNavClient` - Main branch navigation container
- `TimesSquarePrGitHubNavClient` - PR preview navigation container

**GitHub PR Badge Components**

- `GitHubPrBadge` - PR state badges with dynamic colors
- `GitHubPrTitle` - PR header with title and subtitle
- `GitHubCheckBadge` - CI check status badges

**Notebook Viewer Components**

- `TimesSquareNotebookViewerClient` - Notebook iframe viewer
- `ParameterInput` - Form input wrapper with labels
- `StringInput` - Text input with error state styling
- `TimesSquareParametersClient` - Parameter form container

**Page Panel Components**

- `TimesSquareGitHubPagePanel` - Page info container
- `TimesSquareGitHubPagePanelClient` - Client-side page panel
- `ExecStats` - Execution statistics and recompute button
- `GitHubEditLink` - Link to edit notebook on GitHub
- `IpynbDownloadLink` - Notebook download link

**Page Files**

- GitHub PR landing page (`[commit].tsx`)

**Button Migration**

Replaced the custom `Button` component with `@lsst-sqre/squared` Button component, using appropriate variants (`appearance="outline"`, `tone="danger"`, `size="sm"`). The old `Button/` component directory has been deleted.

**Dynamic Styling Patterns**

- Uses `clsx` for conditional classes (current page highlighting, error states)
- Uses CSS custom properties for dynamic colors (PR state colors)
- Uses inline styles for computed color values (check badge colors)
