# Delega Sync Action

Sync `.delega/tasks.jsonl` from a repository into hosted Delega during CI.

This action runs `delega sync push` by default. Put it on merges to your main
branch so task edits made in Git converge back to Delega, and Delega can attach
the merge commit or branch as task links.

## Usage

```yaml
name: Delega sync

on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: delega-dev/sync-action@v1
        with:
          api-key: ${{ secrets.DELEGA_API_KEY }}
```

## Inputs

| Input | Default | Description |
|---|---:|---|
| `api-key` | required | Delega agent API key. Store this as `DELEGA_API_KEY` in repository or organization secrets. |
| `api-url` | `https://api.delega.dev` | Delega API base URL. |
| `command` | `push` | Sync command to run: `pull`, `push`, or `status`. |
| `working-directory` | `.` | Directory containing `.delega/config.json`. |
| `cli-version` | `1.7.1` | Version of `@delega-dev/cli` to run. Override deliberately after testing a newer CLI release. |
| `no-auto-link` | `false` | Set to `true` to disable branch/HEAD auto-linking on `push`. |
| `json` | `false` | Set to `true` to pass `--json` to the CLI. |

## Setup

Run this once in the repository and commit the generated files:

```bash
delega sync init --repo owner/name
delega sync pull
git add .delega/config.json .delega/tasks.jsonl
git commit -m "Add Delega task mirror"
```

Then add `DELEGA_API_KEY` as a GitHub Actions secret. Use an agent key with
permission to read and mutate the tasks you want CI to sync.
For PR close automation, configure the Delega GitHub webhook for `push` and
`pull_request` events with the same repository.

## Merge Flow

1. Agents and humans edit `.delega/tasks.jsonl` in a branch.
2. The PR text can include `delega:#<task-id>` to link work, or
   `Closes-Delega: #<task-id>` to complete on merge through the GitHub webhook.
3. After merge to `main`, this action runs `delega sync push`.
4. If hosted context changed after the local mirror was read, the CLI exits
   non-zero and prints an explicit conflict with local and hosted versions.

## Security

- Store `api-key` only in GitHub Actions secrets.
- Prefer a dedicated Delega agent key for CI.
- Keep `permissions: contents: read` unless your workflow has a separate reason
  to write to the repository.
- The default `cli-version` is pinned, not `latest`, so CI does not run newly
  published npm code with `DELEGA_API_KEY` without an explicit action update.

## Updating the CLI

When releasing a new compatible `@delega-dev/cli`, test this action against that
version, update the `cli-version` default in `action.yml`, update the input table
above, and cut a new action tag.
