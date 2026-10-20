# Documentation builds

Install the pinned package manager and locked dependencies before building:

```sh
corepack enable
pnpm install --frozen-lockfile
```

`pnpm dev` previews the current source and Less styles. `pnpm run build:docs`
builds production examples with the published `rsuite-table-docs` package alias
from package.json, including its matching Less styles. Update that exact alias
and the lockfile after a new table version is published.

To check unreleased examples with an optimized source build:

```sh
RSUITE_TABLE_DOCS_SOURCE=true pnpm run build:docs
```

Pull requests build both production documentation and the source preview. Main
deployments build the published package; the source preview is not deployed.
