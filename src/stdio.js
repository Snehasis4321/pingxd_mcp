#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPingxdTools } from "./tools.js";

const apiKey = process.env.PINGXD_API_KEY;
const baseUrl = (process.env.PINGXD_API_URL || "https://api.pingxd.com").replace(/\/$/, "");

if (!apiKey) {
  console.error("PINGXD_API_KEY is required");
  process.exit(1);
}

const server = new McpServer({
  name: "pingxd",
  version: "0.1.0",
});

async function request(path, body, method = "POST", responseType = "json") {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: responseType === "text" ? "text/html, text/plain" : "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      "X-API-Key": apiKey,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = responseType === "text" ? await response.text() : await response.json();
  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.message || data?.error;
    throw new Error(message || `PingXD request failed with HTTP ${response.status}`);
  }
  return data;
}

registerPingxdTools(server, request);
const transport = new StdioServerTransport();
await server.connect(transport);
