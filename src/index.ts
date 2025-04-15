#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./rollbar.js";

async function main() {
  const { server } = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("Rollbar MCP Server running on stdio");

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
