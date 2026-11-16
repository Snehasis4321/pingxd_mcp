# PingXD MCP server

Connect PingXD to Claude, Cursor, Kiro, and other MCP-compatible AI agents. The agent can run PingXD diagnostics, inspect raw results, and explain performance, DNS, SSL, WHOIS, API, and network issues.

- Public setup guide: https://pingxd.com/mcp
- Remote MCP endpoint: `https://api.pingxd.com/mcp`
- Local package: `@pingxd/mcp`

## Authentication and API keys

Create a named key from [PingXD API key settings](https://pingxd.com/profile/api-keys). The full key is shown only once. Store it as a secret and revoke it if an agent or device is no longer trusted.

The remote server accepts either:

```text
Authorization: Bearer pxd_live_your_key
```

or:

```text
X-API-Key: pxd_live_your_key
```

## Remote HTTP setup

Use the MCP endpoint:

```text
https://api.pingxd.com/mcp
```

Authenticate with the API key as either `X-API-Key: pxd_live_...` or `Authorization: Bearer pxd_live_...`.

## Local stdio setup

The package is designed for MCP clients that launch local servers:

```json
{
  "mcpServers": {
    "pingxd": {
      "command": "npx",
      "args": ["-y", "@pingxd/mcp"],
      "env": {
        "PINGXD_API_KEY": "pxd_live_your_key",
        "PINGXD_API_URL": "https://api.pingxd.com"
      }
    }
  }
}
```

For development, run `pnpm install` and then:

```bash
PINGXD_API_KEY=pxd_live_your_key PINGXD_API_URL=http://localhost:3500 pnpm start
```

## Tools

The server exposes PingXD tests for ping, web speed, API speed, SSL, traceroute, MTR, Lighthouse performance, DNS, MX, port checks, WHOIS, Nmap, and screenshots. It also exposes raw quota, history, performance report, and screenshot retrieval tools.

All tests consume the same daily credits as the PingXD web application. API keys are created and revoked from `/profile/api-keys` and the full secret is shown only at creation time.
## Direct REST calls

The same key can call the diagnostic REST endpoints directly when an MCP client needs more control:

```bash
curl -X POST https://api.pingxd.com/test/ping_test \
  -H 'Authorization: Bearer pxd_live_your_key' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","location":"us"}'
```

The authenticated account owns the request and its quota. Do not put a PingXD API key in a target API header or commit it to a client configuration file that is shared with others.
