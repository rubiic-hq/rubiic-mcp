// Downloads the MP4 of your most recently updated Rubiic project, if one has
// finished rendering. Spends nothing: it only calls read tools.
//
//   RUBIIC_TOKEN=rbc_... npm start
import { writeFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const token = process.env.RUBIIC_TOKEN;
if (!token) throw new Error("Set RUBIIC_TOKEN to a token from rubiic.com/account.");

const client = new Client({ name: "rubiic-example", version: "0.1.0" });
await client.connect(
  new StreamableHTTPClientTransport(new URL("https://rubiic.com/api/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  }),
);

async function call<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    const text = (result.content as { type: string; text?: string }[]).map((c) => c.text ?? "").join(" ");
    throw new Error(`${name}: ${text}`);
  }
  return result.structuredContent as T;
}

type Render = { renderId: string; sceneId: string; status: string };

const { projects } = await call<{ projects: { projectId: string; title: string }[] }>("list_projects");
const latest = projects[0];
if (!latest) throw new Error("No projects yet. Make one at rubiic.com or with agent_start.");

const project = await call<{ renders: Render[] }>("get_project", { projectId: latest.projectId });
const done = project.renders.find((r) => r.status === "succeeded");
if (!done) {
  console.log(`"${latest.title}" has no finished render yet.`);
  await client.close();
  process.exit(0);
}

// Download URLs expire, so fetch straight away.
const { url, name } = await call<{ url: string; name: string }>("get_download_url", {
  projectId: latest.projectId,
  kind: "render",
  id: done.renderId,
});
const response = await fetch(url);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
await writeFile(name, Buffer.from(await response.arrayBuffer()));
console.log(`Saved ${name} from "${latest.title}".`);
await client.close();
