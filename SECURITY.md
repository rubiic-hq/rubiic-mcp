# Security

## Reporting a vulnerability

Please report it privately through GitHub:
**Security → Report a vulnerability** on this repository. Don't open a
public issue.

That covers the MCP servers themselves (`rubiic.com/api/mcp` and
`rubiic.com/eve/.../mcp`), token handling, and anything in this repository.
Include the endpoint, the tool you called, and what you saw. Never include a
working token.

## Your token

- A token can do everything your account can, including spending credits.
- It is shown once. Store it in your client's secret store or an environment
  variable, never in a committed file.
- If a token leaks, revoke it at **rubiic.com → Account → API tokens**.
  It stops working immediately.
