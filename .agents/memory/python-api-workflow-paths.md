---
name: Python API workflow paths
description: Managed API artifact path conventions for Python services in this workspace.
---

Managed API development commands run with `artifacts/api-server` as their working directory, while the Replit-managed Python environment is at the workspace root.

**Why:** The first workflow launch doubled the path to the Python entrypoint when the command assumed the workspace root.

**How to apply:** In development, reference the root Python environment with `../../.pythonlibs/bin/python` and the entrypoint relative to the artifact directory. Production service commands run from the workspace root and can use `.pythonlibs/bin/python artifacts/api-server/...`.
