# Changelog

Changes to the public contract of the two servers (tools, inputs, outputs,
what costs credits) and to this repository.

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
