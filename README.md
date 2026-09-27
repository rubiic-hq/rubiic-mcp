# Rubiic MCP

Make videos with [Rubiic](https://rubiic.com) from Claude Code, Cursor, VS Code,
Codex or any MCP client. Describe a video in plain language, answer the agent's
review questions, then render it to MP4. From any scene you can also export a
GIF, still images, a carousel or captions.

This repository holds no server code. Rubiic runs the MCP servers, and this
repo is how you connect to them:

- a Claude Code plugin with the skill and both servers
- copy-paste configs for other clients
- the tool reference
- a small scripted example

## 1. Get a token

Sign in at [rubiic.com](https://rubiic.com), open **Account → API tokens**, and
create a token. It starts with `rbc_` and is **shown once**, so copy it right
away. You can revoke it from the same page at any time.

Everything you do over MCP is billed to your account, the same as in the app.
See [what costs credits](docs/tools.md#rubiic).

## 2. Connect

### Claude Code (recommended)

```
/plugin marketplace add rubiic-hq/rubiic-mcp
/plugin install rubiic@rubiic
```

Claude Code asks for your token once and keeps it in your system's secure
credential store. The plugin adds both servers and the `rubiic` skill, which
teaches the agent how to poll, when a call spends credits, and how to handle
downloads.

If you'd rather not use the plugin, see [clients/claude-code.md](clients/claude-code.md).

### Other clients

| Client | Config |
| --- | --- |
| Cursor | [clients/cursor.json](clients/cursor.json) |
| VS Code | [clients/vscode.json](clients/vscode.json) |
| Codex CLI | [clients/codex.toml](clients/codex.toml) |
| Claude Desktop | [clients/claude-desktop.json](clients/claude-desktop.json) |

To teach any other agent how to use Rubiic, point it at the skill:
<https://rubiic.com/skills/rubiic/SKILL.md>.

## 3. Make a video

Ask your agent something like:

> Make a 30-second vertical video explaining how a heat pump works, then render
> it and give me the MP4.

The agent starts the video with `rubiic-agent` and answers the review
questions (it may pass them to you). It then finds the new project with
`rubiic`, renders it, and downloads the result.

## Two servers, and why

| Server | URL | Use it to |
| --- | --- | --- |
| `rubiic-agent` | `https://rubiic.com/eve/agents/rubiic/eve/v1/mcp` | start a **new** video from a brief |
| `rubiic` | `https://rubiic.com/api/mcp` | read, render, export and download **existing** projects |

`agent_start` always creates a new project. Name the two servers differently
so their tool names never collide. Full reference: [docs/tools.md](docs/tools.md).

## Known limits

- **Static token only.** There is no OAuth discovery yet, so a client that
  can't send an `Authorization` header can't connect directly. Claude.ai web
  connectors are one example. Claude Desktop works through `mcp-remote`
  (see its config).
- **No continuing a conversation.** Each `agent_start` is a new project. To
  revise an existing video, use the app.
- **Tokens are account-wide.** A token can do everything your account can,
  including spending credits.

## Repository layout

```
.claude-plugin/   Claude Code plugin + marketplace manifests
.mcp.json         the plugin's two servers
skills/rubiic/    the agent skill (mirrors https://rubiic.com/skills/rubiic/SKILL.md)
registry/         MCP Registry entries, one per server
clients/          configs for other MCP clients
docs/             tool reference
examples/         a scripted client
```

`skills/rubiic/SKILL.md` is published from Rubiic's own codebase. Edits made
here are overwritten. Open an issue instead, and CI checks that this copy
matches what rubiic.com serves.

## Support

- Bugs and questions: [open an issue](https://github.com/rubiic-hq/rubiic-mcp/issues)
- Security: see [SECURITY.md](SECURITY.md). Please don't file those publicly.

## License

[MIT](LICENSE). The license covers this repository only; your use of the
Rubiic service is governed by the [terms](https://rubiic.com/terms).
