# Releasing

## MCP Registry

The server is listed on registry.modelcontextprotocol.io as
`com.rubiic/rubiic`. (`com.rubiic/rubiic-agent`, the 0.1 second server, is
deprecated there and has no file here any more.) The `com.rubiic` namespace
is proven by a TXT record on the apex of rubiic.com (DNS is at GoDaddy):

    v=MCPv1; k=ed25519; p=9xbjGaniAh2XsPj2hn0/5n8WcruJFLue2TqSoLSd+jQ=

The matching private key is never in this repository. It lives with the
maintainer at `~/.config/rubiic-mcp/registry-key.pem` and in the password
manager. If you rotate the key, **remove the old TXT record**: the registry
tries a stale record first and fails with a generic signature error.

To publish a change:

1. Bump `version` in `registry/rubiic/server.json`. The registry
   refuses to republish a version it already has. Add a `CHANGELOG.md` entry.
2. Validate, log in and publish. `mcp-publisher` comes from the
   modelcontextprotocol/registry releases. Ed25519 needs OpenSSL 3, and
   macOS's LibreSSL won't do.

   ```bash
   KEY_HEX="$(openssl pkey -in ~/.config/rubiic-mcp/registry-key.pem -noout -text \
     | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
   mcp-publisher login dns --domain rubiic.com --private-key "$KEY_HEX"
   (cd registry/rubiic && mcp-publisher validate && mcp-publisher publish)
   ```

## Claude Code plugin

Users get whatever is on `main`. Bump `version` in `.claude-plugin/plugin.json`
so `/plugin update` notices a change, and run `claude plugin validate .` first.

## The skill

Never edit `skills/rubiic/SKILL.md` here. Change it in the Rubiic codebase,
deploy, then run `scripts/check-skill.sh --write` and commit. The daily CI
run fails until you do.
