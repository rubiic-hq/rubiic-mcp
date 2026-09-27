# Rubiic MCP

Make videos with [Rubiic](https://rubiic.com) from Claude and any other MCP
client. Describe a video in plain language, answer the agent's review
questions, then render it to MP4. From any scene you can also export a GIF,
still images, a carousel or captions.



https://github.com/user-attachments/assets/c3945c16-6663-488c-9518-151e29e27e33



<sub>Made with Rubiic. Captions: [media/rubiic-mcp-explainer.srt](media/rubiic-mcp-explainer.srt).</sub>

One MCP server does everything:

```
https://rubiic.com/api/mcp
```

This repository holds no server code. Rubiic runs the server, and this repo is
how you connect to it:

- a Claude Code plugin with the server and the `rubiic` skill
- copy-paste configs for other clients
- the tool reference
- a small scripted example

You need a Rubiic account. Everything you do over MCP is billed to it, the same
as in the app. See [what costs credits](docs/tools.md#what-costs-credits).

## Claude (Desktop, claude.ai, mobile)

1. Open **Settings → Connectors → Add custom connector**.
2. Name it `Rubiic` and paste `https://rubiic.com/api/mcp`, then click
   **Add** and **Connect**.
3. rubiic.com opens. Sign in if you need to, check that the page names
   `claude.ai` as where it will send you back, and click **Allow access**.

That's it. There's no token to copy. To disconnect, remove the connector in
Claude or click **Disconnect** under **Connected apps** on
[rubiic.com/account](https://rubiic.com/account). Disconnecting takes effect
within the hour.

## Claude Code

```
/plugin marketplace add rubiic-hq/rubiic-mcp
/plugin install rubiic@rubiic
```

Claude Code asks for a personal access token once and keeps it in your
system's secure credential store. Create one under **Account → API tokens** on
[rubiic.com](https://rubiic.com/account). It starts with `rbc_` and is
**shown once**, so copy it right away. The plugin adds the server and the
`rubiic` skill, which teaches the agent how to poll, when a call spends
credits, and how to handle downloads.

If you'd rather not use the plugin, see [clients/claude-code.md](clients/claude-code.md).

## Other clients

| Client | Config |
| --- | --- |
| Cursor | [clients/cursor.json](clients/cursor.json) |
| VS Code | [clients/vscode.json](clients/vscode.json) |
| Codex CLI | [clients/codex.toml](clients/codex.toml) |

These use a personal access token as a bearer. The server also supports MCP
sign-in (OAuth), so a client that implements it can leave the header out and
sign in through rubiic.com instead. That path has been verified with Claude's
connectors; other clients vary.

To teach any other agent how to use Rubiic, point it at the skill:
<https://rubiic.com/skills/rubiic/SKILL.md>.

## Make a video

Ask Claude something like:

> Make a 30-second vertical video explaining how a heat pump works, then render
> it and give me the MP4.

It starts the video with `agent_start` and answers the review questions (it may
pass them to you). It then finds the new project with `list_projects`, renders
it, and hands you the download. Full reference: [docs/tools.md](docs/tools.md).

## Known limits

- **Every `agent_start` is a new project.** You can't continue or revise an
  existing video over MCP yet. To revise one, use the app.
- **Access is account-wide.** A connected app or a token can do everything your
  account can over MCP, including spending credits. There are no read-only or
  spend-limited grants yet.

## Upgrading from 0.1

0.1 used two servers: `rubiic-agent` for the `agent_*` tools and `rubiic` for
the rest. Everything is on `rubiic` now. `/plugin update rubiic@rubiic` picks it
up; if you added the servers by hand, remove `rubiic-agent`. Its URL keeps
working for anything still pointed at it.

## Repository layout

```
.claude-plugin/   Claude Code plugin + marketplace manifests
.mcp.json         the plugin's server
skills/rubiic/    the agent skill (mirrors https://rubiic.com/skills/rubiic/SKILL.md)
registry/         the MCP Registry entry
clients/          configs for other MCP clients
docs/             tool reference
examples/         a scripted client
media/            the explainer video, its poster and captions
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
