import { z } from "zod";

export const PINGXD_LOCATIONS = ["in", "sg", "us", "jp", "de", "uk", "br", "au", "ca", "fr"];

const location = z.enum(PINGXD_LOCATIONS).describe("PingXD test location code");
const url = z.string().min(1).max(2048).describe("Public HTTP or HTTPS URL to test");

const tools = [
  {
    name: "pingxd_ping_test",
    description: "Run a PingXD ICMP/network ping test and return the raw result.",
    schema: { url, location },
    path: "/test/ping_test",
    body: (input) => input,
  },
  {
    name: "pingxd_web_speed_test",
    description: "Run a PingXD website speed test and return the raw result.",
    schema: { url, location, device: z.enum(["desktop", "mobile"]).default("desktop") },
    path: "/test/web_speed",
    body: (input) => input,
  },
  {
    name: "pingxd_api_speed_test",
    description: "Run a PingXD API speed test and return the raw result. headers and body are JSON strings describing the target request.",
    schema: {
      url,
      location,
      device: z.enum(["desktop", "mobile"]).default("desktop"),
      method: z.string().min(1).max(20).default("GET"),
      headers: z.string().default("[]").describe("JSON array of {key,value} target headers"),
      body: z.string().default("").describe("Optional target request body"),
    },
    path: "/test/api_speed",
    body: (input) => input,
  },
  {
    name: "pingxd_ssl_test",
    description: "Run a PingXD SSL certificate test and return the raw result.",
    schema: { url, location },
    path: "/test/ssl_test",
    body: (input) => input,
  },
  {
    name: "pingxd_traceroute_test",
    description: "Run a PingXD traceroute test and return the raw result.",
    schema: { url, location },
    path: "/test/traceroute_test",
    body: (input) => input,
  },
  {
    name: "pingxd_mtr_test",
    description: "Run a PingXD MTR network path test and return the raw result.",
    schema: { url, location, cycles: z.number().int().min(1).max(10).default(5) },
    path: "/test/mtr_test",
    body: (input) => input,
  },
  {
    name: "pingxd_performance_test",
    description: "Run a PingXD Lighthouse performance test and return the raw result or report identifier.",
    schema: { url, location, device: z.enum(["desktop", "mobile"]).default("desktop") },
    path: "/test/perf_test",
    body: (input) => input,
  },
  {
    name: "pingxd_dns_test",
    description: "Run a PingXD DNS lookup test and return the raw result.",
    schema: { url, location, recordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA"]).default("A") },
    path: "/test/dns_test",
    body: (input) => input,
  },
  {
    name: "pingxd_mx_test",
    description: "Run a PingXD MX record test and return the raw result.",
    schema: { url, location },
    path: "/test/mx_test",
    body: (input) => input,
  },
  {
    name: "pingxd_port_check",
    description: "Run a PingXD TCP or UDP port check and return the raw result.",
    schema: {
      url,
      location,
      port: z.number().int().min(1).max(65535),
      protocol: z.enum(["tcp", "udp"]).default("tcp"),
      timeout: z.number().int().min(100).max(30000).default(5000),
    },
    path: "/test/port_check_test",
    body: (input) => input,
  },
  {
    name: "pingxd_whois_test",
    description: "Run a PingXD WHOIS/RDAP domain lookup. Accepts a domain or URL (subdomains are reduced to the registrable domain). Returns registrar, dates, status, nameservers, DNSSEC and the raw registry data.",
    schema: { url: z.string().min(1).max(2048).describe("Domain name or URL, for example example.com") },
    path: "/test/whois_test",
    body: (input) => input,
  },
  {
    name: "pingxd_nmap_scan",
    description: "Run a PingXD Nmap security scan and return the raw result.",
    schema: {
      target: z.string().min(1).max(255),
      scanType: z.string().max(30).default("default"),
      customPorts: z.string().max(200).optional(),
    },
    path: "/test/nmap_scan",
    body: (input) => input,
  },
  {
    name: "pingxd_screenshot",
    description: "Capture a website screenshot with PingXD and return the raw result.",
    schema: {
      url,
      device: z.enum(["desktop", "mobile"]).default("desktop"),
      fullPage: z.boolean().default(false),
      format: z.enum(["webp", "png", "jpeg"]).default("webp"),
    },
    path: "/test/screenshot",
    body: (input) => input,
  },
];

function asToolResult(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (typeof value === "string") return { content: [{ type: "text", text }] };
  return {
    content: [{ type: "text", text }],
    structuredContent: value,
  };
}

export function registerPingxdTools(server, request) {
  for (const tool of tools) {
    server.registerTool(tool.name, {
      description: tool.description,
      inputSchema: tool.schema,
    }, async (input) => asToolResult(await request(tool.path, tool.body(input))));
  }

  server.registerTool("pingxd_get_quota", {
    description: "Read the authenticated PingXD user's current shared daily quota.",
    inputSchema: {},
  }, async () => asToolResult(await request("/user/quota", undefined, "GET")));

  server.registerTool("pingxd_get_history", {
    description: "Read the authenticated PingXD user's raw test history.",
    inputSchema: {
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(10),
    },
  }, async ({ page = 1, limit = 10 }) => asToolResult(
    await request(`/user/history?page=${page}&limit=${limit}`, undefined, "GET")
  ));

  server.registerTool("pingxd_get_performance_report", {
    description: "Read a raw HTML Lighthouse performance report by test result id.",
    inputSchema: { id: z.string().regex(/^[\w-]+$/) },
  }, async ({ id }) => asToolResult(await request(`/test/get_perf_report?id=${encodeURIComponent(id)}`, undefined, "GET", "text")));

  server.registerTool("pingxd_get_screenshot", {
    description: "Read the raw presigned screenshot URL and metadata by test result id.",
    inputSchema: { id: z.string().regex(/^[\w-]+$/) },
  }, async ({ id }) => asToolResult(await request(`/test/get_screenshot?id=${encodeURIComponent(id)}&json=true`, undefined, "GET")));
}

export function getPingxdToolNames() {
  return tools.map(({ name }) => name).concat([
    "pingxd_get_quota",
    "pingxd_get_history",
    "pingxd_get_performance_report",
    "pingxd_get_screenshot",
  ]);
}
