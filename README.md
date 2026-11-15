# PingXD MCP server

PingXD exposes network and web diagnostics to MCP-compatible agents. Tools return the raw PingXD response so the connected agent can inspect and explain it.

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
