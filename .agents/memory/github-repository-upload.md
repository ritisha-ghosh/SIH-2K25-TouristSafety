---
name: GitHub repository upload
description: Recovery pattern for pushing a project to an empty private GitHub repository through the Replit GitHub connector.
---

When the Replit Git transport helper cannot obtain a usable GitHub credential, the standard GitHub connector can still upload the project through the authenticated Git data API. An empty GitHub repository must first receive one Contents API commit; only then will GitHub accept Git blob creation. After that bootstrap commit, create the complete blob tree, create a commit with the bootstrap commit as its parent, and update the default branch ref.

**Why:** The GitHub App transport may report an invalid token or time out even when the GitHub API connector is healthy, and GitHub returns 409 for blob creation against a completely empty repository.

**How to apply:** Prefer the standard `github` connector for authenticated REST operations, verify the remote repository is empty before bootstrapping, and never force-update a non-empty branch without checking its existing history.