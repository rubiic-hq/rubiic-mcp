# Changelog

Changes to the public contract of the two servers (tools, inputs, outputs,
what costs credits) and to this repository.

## 0.3.0 — 2026-10-03

- **`connection_status`.** A new free, read-only tool that reports which
  account this client reached and whether the agent service accepts the same
  credential. Call it after connecting; an OAuth approval page alone doesn't
  prove the client works.
- **Find a new project from its invocation.** `get_project` takes an
  `invocationId` from `agent_start` in place of a `projectId` and returns the
  canonical `projectId`. Comparing `list_projects` before and after, which the
  skill used to tell agents to do, is no longer needed.
- **Artifact manifest.** `get_project` also returns `projectId`,
  `manifestVersion: 1` and `artifacts`: every saved scene, still and image with
  its version history, hashes, saved dimensions, a signed-in preview link and
  ready-made download references. The existing `scenes`, `renders` and
  `exports` fields are unchanged.
- **Download saved stills and images.** `get_download_url` accepts `kind:
  "still"` and `"image"`. It reads the saved file without generating anything
  and reports its SHA-256, decoded size and transparency. Export downloads also
  return `sha256`, and `file` can be left out for a single-file export.
- **Download errors say what to do.** A failed `get_download_url` returns
  `{ code, message, retryable }`.
- **PDF references** (live since 2026-09-27, documented here now):
  `begin_pdf_upload`, `upload_pdf_chunk` and `complete_pdf_upload`, and
  `agent_start`'s `uploadTokens`. Up to six PDFs, 25 MB and 50 pages each.
- The skill is refreshed from rubiic.com. The Registry entry is unchanged: the
  server URL and transport are the same.

## 0.2.1 — 2026-09-27

- **Pick a model team.** `agent_start` takes an optional `modelTeam`:
  `economy` (the default), `balanced` or `premium`. Before this, every video
  started over MCP ran on Economy, whatever the account had paid for. Balanced
  and Premium need bought credits or a plan; a free account gets a tool error
  and nothing starts. The skill says to ask for Premium only when the user
  wants top quality.

## 0.2.0 — 2026-09-27

- **One server.** `https://rubiic.com/api/mcp` now serves all eleven tools,
  including `agent_start`, `agent_get`, `agent_update` and `agent_cancel`. The
  plugin, the client configs and the skill use only `rubiic`. The old
  `rubiic-agent` URL keeps working, but it is no longer configured or
  advertised, and `com.rubiic/rubiic-agent` is deprecated on the MCP Registry.
- **Sign in from Claude.** The server supports MCP authorization (OAuth), so
  Claude Desktop, claude.ai and mobile can add Rubiic as a custom connector
  with no token. Connected apps are listed, and can be disconnected, on
  rubiic.com/account.
- The token header is now optional in the Registry entry.
- Removed `clients/claude-desktop.json` (the `mcp-remote` workaround). Use the
  connector instead.
- A 60-second explainer video at the top of the README (`media/`), made with
  Rubiic, with SRT captions.

## 0.1.0 — 2026-09-26

- First public release.
- `rubiic-agent`: `agent_start`, `agent_get`, `agent_update`, `agent_cancel`.
- `rubiic`: `list_projects`, `get_project`, `render_status`, `export_status`,
  `get_download_url`, `start_render`, `start_export`.
- Claude Code plugin and marketplace, the `rubiic` skill, MCP Registry entries,
  and configs for Cursor, VS Code, Codex CLI and Claude Desktop.
