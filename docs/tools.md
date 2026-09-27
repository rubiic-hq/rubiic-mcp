# Tool reference

One remote MCP server, stateless Streamable HTTP:

```
https://rubiic.com/api/mcp
```

It accepts either credential:

- **Sign-in (OAuth).** An unauthenticated request gets a `401` whose
  `WWW-Authenticate` names the protected-resource metadata at
  `/.well-known/oauth-protected-resource/api/mcp`. A client that implements MCP
  authorization signs the person in through rubiic.com and gets its own token.
  This is how Claude's connectors connect.
- **A personal access token** (`rbc_…`, from rubiic.com/account) as
  `Authorization: Bearer`.

Both act as the account that granted them, and both reach the same eleven
tools. The server's `instructions` summarise the workflow for clients that
haven't loaded the skill.

Every `agent_start` creates a new project. To check on, render or download
something that already exists, use the project tools, never `agent_start`.

## Starting a video: `agent_*`

| Tool | Input | Returns |
| --- | --- | --- |
| `agent_start` | `{ message, modelTeam? }` | `{ invocationId, status, pollAfterMs, … }` |
| `agent_get` | `{ invocationId }` | the invocation's current state |
| `agent_update` | `{ invocationId, responses }` | the invocation after your answers |
| `agent_cancel` | `{ invocationId }` | the cancellation request |

`modelTeam` picks the models that make the video: `economy` (the default when
it's left out, and the cheapest), `balanced`, or `premium` (the best writing and
animation, at several times the cost). It's fixed for the project once it
starts. Balanced and Premium need an account that has bought credits or has a
plan. A free account that asks for one gets a tool error saying so, and nothing
starts or is billed. An unknown value is a tool error too.

`status` is one of:

- `working`, `authorization_required`: wait `pollAfterMs`, then `agent_get` again.
- `input_required`: the response carries `inputRequests` keyed by request id.
  These are the review steps (narration, music, export). Answer each one with
  `agent_update`, where `responses` is an array of `{ requestId, optionId }` or,
  when the request allows free text, `{ requestId, text }`. Answer each request
  id **once**. `agent_get` can keep listing an answered request until the next
  turn completes, so track which requests you have already answered.
- `completed`: the final message is in the response.
- `failed`: the response carries an `error`.
- `cancelled`: the invocation was cancelled.

The last three are terminal. Stop polling when you reach one.

## Projects, renders and exports

All tools except `list_projects` take a `projectId`. Take every id from these
tools' own responses. Never parse one out of the agent's chat text.

### What costs credits

`agent_start` (the agent's model usage while it builds the video), plus:

| Tool | Input | Costs credits |
| --- | --- | --- |
| `list_projects` | `{}` | no |
| `get_project` | `{ projectId }` | no |
| `render_status` | `{ projectId, renderId }` | no |
| `export_status` | `{ projectId, exportId }` | no |
| `get_download_url` | `{ projectId, kind: "render" \| "export", id, file? }` | no |
| `start_render` | `{ projectId, sceneId, retryFailed? }` | **yes**, unless the scene already has a non-failed render; then that render is returned for free |
| `start_export` | `{ projectId, sceneId, options, retry? }` | **yes** for `gif`, `png`, `jpeg`, `webp` and `carousel`; free for `srt` and `vtt` |

### Shapes

```ts
// list_projects
{ projects: { projectId: string; title: string; updatedAt: string }[] }

// get_project
{
  title: string;
  scenes: { sceneId: string; title: string; fps: number; durationInFrames: number;
            width: number; height: number; hasNarration: boolean }[];
  renders: Render[];
  exports: Export[];
}

// start_render, render_status
type Render = { renderId: string; sceneId: string; status: string; progress: number;
                sizeInBytes?: number; error?: string };

// start_export, export_status
type Export = { exportId: string; sceneId: string; format: string; status: string;
                error?: string; files: { name: string; bytes: number; mimeType: string }[] };

// get_download_url
{ url: string; expiresInSeconds: number; name: string; bytes?: number; mimeType: string }
```

- A render's `status` ends at `succeeded`, `failed` or `uncertain`. On
  `uncertain`, the render may or may not have been submitted. Report it; do
  not resubmit, because a resubmission risks a second charge.
- An export's `status` goes from `running` to `succeeded` or `failed`.
- Download URLs expire: after 3600 s for a render's MP4, and after 60 s for an
  export file. Fetch the file right away, and ask for a new URL each time.

### `start_export` options

| Format | Options | Limits |
| --- | --- | --- |
| GIF | `{ format: "gif", startFrame, endFrame, fps?: 5 \| 10, maxWidth?: 320 \| 640, loop?: boolean }` | ≤ 10 s, ≤ 25 MB |
| Still | `{ format: "png" \| "jpeg" \| "webp", frame }` | ≤ 3840 px a side, ≤ 8.3 MP, ≤ 20 MB |
| Carousel | `{ format: "carousel", pages: { frame, label }[] }` | 1–12 pages, labels ≤ 80 chars, ≤ 64 MB total |
| Captions | `{ format: "srt" }` or `{ format: "vtt" }` | scene must have `hasNarration: true`, ≤ 5 MB |

Frame numbers must fall inside the scene's own `durationInFrames`, so read it
from `get_project` first.

## Errors

A tool that fails returns `isError: true` with a message meant to be shown to
a person. A missing token or a revoked one is rejected with HTTP 401 before any
tool runs. A project that isn't yours looks exactly like a project that
doesn't exist.

## Older URL

0.1 served the four `agent_*` tools from a second server at
`https://rubiic.com/eve/agents/rubiic/eve/v1/mcp` (`rubiic-agent`). It still
works with a personal access token, but everything is on `/api/mcp` now, and
new setups should use only that.
