---
"squareone": minor
"@lsst-sqre/repertoire-client": minor
---

New `@lsst-sqre/repertoire-client` package for Rubin Science Platform service discovery

This package provides a reusable client for the Repertoire API, enabling dynamic service discovery across monorepo apps:

- **Zod schemas** for runtime validation of API responses
- **ServiceDiscoveryQuery** class with convenience methods for querying applications, services, and datasets
- **TanStack Query integration** with `discoveryQueryOptions()` for server prefetching and client-side caching
- **useServiceDiscovery hook** for client components with automatic hydration support
- **Mock data** for development and testing

Integrated into squareone:

- Added TanStack Query providers with server-side prefetching in root layout
- Components can now use `useServiceDiscovery()` to check service availability
- Service URLs dynamically discovered instead of hard-coded in configuration
