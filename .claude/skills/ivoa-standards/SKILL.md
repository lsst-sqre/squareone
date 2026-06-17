---
name: ivoa-standards
description: Reference for IVOA (International Virtual Observatory Alliance) standards relevant to the Rubin Science Platform — TAP, SIA, SODA, DataLink, ObsCore, VOTable, UWS, VOSI, SSO/GMS, HiPS, and registry standards — with canonical documentation links and how each maps to RSP services. Use when working on the /api-aspect page, labeling or linking API endpoints, interpreting Repertoire service discovery, curating the api-aspect presentation map, or when the user mentions IVOA, VO standards, the Virtual Observatory, or a protocol acronym (TAP, SIA, SSA, SCS, SODA, DataLink, DALI, ObsCore, ADQL, VOTable, UWS, VOSI, SSO, GMS, HiPS, MOC).
---

# IVOA standards (RSP context)

The **International Virtual Observatory Alliance (IVOA)** publishes the
interoperability standards that astronomy data services implement so tools like
TOPCAT, pyvo, and Aladin can talk to any compliant archive. The Rubin Science
Platform (RSP) exposes catalog and image data through these standards, so the
squareone `/api-aspect` page labels and links its endpoints by IVOA standard.

**Use this skill to:** pick the right human label and documentation link for an
endpoint, understand what a discovered service does, and curate the
`/api-aspect` presentation map.

## RSP service → IVOA standard map

These are the standards RSP actually surfaces. Service keys are the raw
[Repertoire](#repertoire-vs-the-ivoa-registry) discovery names; labels/links
come from `apps/squareone/src/lib/apiEndpoints/presentation.ts`.

| Discovery key | Standard | What it does on RSP |
|---|---|---|
| `tap` | **TAP** (+ ADQL, VOTable) | ADQL queries over catalogs (ObsTAP, PPDB, consdb) |
| `sia` | **SIA v2** | Find images by position/footprint (`sia-query-2.0` → `/query`) |
| `cutout` | **SODA** | Server-side image cutouts |
| `datalink` | **DataLink** | Links a dataset row to its files/services |
| `hips` | **HiPS** | Tiled all-sky image/catalog progressive surveys (`hips-list-1.0` → `/list`) |
| `gms` | **GMS** | Group-membership lookups for authorization |

Notes:
- `tap` carries one generic label because the same key serves different datasets
  at different base URLs; the dataset section header supplies the context.
- Authentication uses RSP access tokens (bearer tokens), which implement the
  IVOA **SSO** profile. Gafaelfawr is the RSP identity service.

## Standards reference

For the full RSP-relevant catalog — names, acronyms, one-line descriptions, and
canonical documentation links, grouped by category — see
[standards.md](standards.md). Use the landing-page links of the form
`https://www.ivoa.net/documents/<Acronym>/`; they redirect to the current
Recommendation and are stabler than dated links.

## Repertoire vs. the IVOA Registry

RSP service discovery uses **Repertoire** (an lsst-sqre service), not the IVOA
Registry. Repertoire returns a per-environment JSON document of services and
datasets (`@lsst-sqre/repertoire-client`). It is conceptually analogous to the
IVOA registry standards (VOResource / VODataService / RegTAP) but is RSP-local
and not VO-standard. Don't conflate the two.

## Key cross-cutting standards

- **DALI** — the shared foundation (sync/async patterns, parameters, error
  formats) that TAP, SIA, SODA, etc. build on.
- **UWS** — the async job model (job lists, phases, results) used by TAP async
  queries and SODA.
- **VOSI** — service-introspection endpoints (`/availability`,
  `/capabilities`, `/tables`) exposed by DAL services.
- **VOTable** — the XML table format most DAL services return.
