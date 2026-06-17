# IVOA standards reference (RSP-relevant subset)

The standards an RSP developer is most likely to need, grouped by role. Links
are IVOA landing pages (`https://www.ivoa.net/documents/<Acronym>/`), which
redirect to the current Recommendation — prefer these over dated URLs.

Full index of every IVOA standard: <https://www.ivoa.net/documents/>

**Legend:** ✅ = RSP surfaces this on `/api-aspect`; ⚙️ = used by RSP under the
hood (not a top-level endpoint); 📖 = context/background.

## Data Access Layer (DAL) protocols

| Standard | Acronym | RSP | Summary | Docs |
|---|---|---|---|---|
| Table Access Protocol | TAP | ✅ | Query tabular catalog data with ADQL, sync or async (UWS). | <https://www.ivoa.net/documents/TAP/> |
| Simple Image Access | SIA | ✅ | Discover images overlapping a position/region; RSP uses v2. | <https://www.ivoa.net/documents/SIA/> |
| Server-side Operations for Data Access | SODA | ✅ | Server-side cutouts/transforms on data products. | <https://www.ivoa.net/documents/SODA/> |
| DataLink | DataLink | ✅ | Link a result row to its files, services, and related products. | <https://www.ivoa.net/documents/DataLink/> |
| Simple Spectral Access | SSA | 📖 | Discover spectra by position; spectral analogue of SIA. | <https://www.ivoa.net/documents/SSA/> |
| Simple Cone Search | SCS | 📖 | Minimal positional catalog query (RA/Dec/radius). | <https://www.ivoa.net/documents/ConeSearch/> |
| Data Access Layer Interface | DALI | ⚙️ | Shared base: sync/async, parameters, error responses for DAL services. | <https://www.ivoa.net/documents/DALI/> |

## Query language & data models

| Standard | Acronym | RSP | Summary | Docs |
|---|---|---|---|---|
| Astronomical Data Query Language | ADQL | ⚙️ | SQL-like language TAP queries are written in. | <https://www.ivoa.net/documents/ADQL/> |
| Observation Data Model Core | ObsCore | ⚙️ | Standard table model for describing observations (the ObsTAP schema). | <https://www.ivoa.net/documents/ObsCore/> |

## Data formats

| Standard | Acronym | RSP | Summary | Docs |
|---|---|---|---|---|
| VOTable | VOTable | ⚙️ | XML table format DAL services return; carries metadata + UCDs. | <https://www.ivoa.net/documents/VOTable/> |
| Hierarchical Progressive Survey | HiPS | ✅ | Tiled, multi-resolution all-sky image/catalog surveys (Aladin). | <https://www.ivoa.net/documents/HiPS/> |
| Multi-Order Coverage map | MOC | 📖 | Compact HEALPix-based sky-region description. | <https://www.ivoa.net/documents/MOC/> |

## Web service patterns

| Standard | Acronym | RSP | Summary | Docs |
|---|---|---|---|---|
| Universal Worker Service | UWS | ⚙️ | Async job model (job list, phases, results) behind TAP async & SODA. | <https://www.ivoa.net/documents/UWS/> |
| IVOA Support Interfaces | VOSI | ⚙️ | Introspection endpoints: `/availability`, `/capabilities`, `/tables`. | <https://www.ivoa.net/documents/VOSI/> |

## Authentication & authorization

| Standard | Acronym | RSP | Summary | Docs |
|---|---|---|---|---|
| Single-Sign-On Profile | SSO | ⚙️ | Auth profiles for VO services; RSP uses bearer access tokens (Gafaelfawr). | <https://www.ivoa.net/documents/SSO/> |
| Group Membership Service | GMS | ✅ | Query a user's group memberships for authorization decisions. | <https://www.ivoa.net/documents/GMS/> |

## Registry standards (analogues to Repertoire)

RSP discovery uses Repertoire, not the IVOA Registry — these are background for
understanding how the wider VO advertises services.

| Standard | Acronym | RSP | Summary | Docs |
|---|---|---|---|---|
| VOResource | VOResource | 📖 | XML schema describing a VO resource/service. | <https://www.ivoa.net/documents/VOResource/> |
| VODataService | VODataService | 📖 | VOResource extension for data collections & tables. | <https://www.ivoa.net/documents/VODataService/> |
| Registry Relational Schema | RegTAP | 📖 | Query the registry of services via TAP. | <https://www.ivoa.net/documents/RegTAP/> |

## Related / occasionally relevant

| Standard | Acronym | Summary | Docs |
|---|---|---|---|
| VOSpace | VOSpace | VO distributed-storage interface (RSP uses its own user-file storage). | <https://www.ivoa.net/documents/VOSpace/> |
| Units in the VO | VOUnits | Controlled syntax for physical units in VO data. | <https://www.ivoa.net/documents/VOUnits/> |
| Simple Application Messaging Protocol | SAMP | Desktop-tool interop messaging (e.g. TOPCAT ↔ Aladin). | <https://www.ivoa.net/documents/SAMP/> |
