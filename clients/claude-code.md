# Claude Code without the plugin

The plugin is the easier route (see the README). To add the server by hand
instead:

```bash
export RUBIIC_TOKEN=rbc_...

claude mcp add --transport http rubiic \
  https://rubiic.com/api/mcp \
  --header "Authorization: Bearer $RUBIIC_TOKEN"
```

Add `--scope user` to make it available in every project. Doing it by hand
leaves out the skill. To add that too:

```bash
mkdir -p ~/.claude/skills/rubiic
curl -fsSL https://rubiic.com/skills/rubiic/SKILL.md -o ~/.claude/skills/rubiic/SKILL.md
```

Don't put the token in a project's `.mcp.json`, since that file is usually
committed.

If you added `rubiic-agent` for 0.1, remove it: `claude mcp remove rubiic-agent`.
Its tools are on `rubiic` now.
