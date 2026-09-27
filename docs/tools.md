# Tool reference

Rubiic exposes two MCP servers. Both are remote, stateless Streamable HTTP, and
both take the same bearer token.

| Server | URL | What it does |
| --- | --- | --- |
| `rubiic-agent` | `https://rubiic.com/eve/agents/rubiic/eve/v1/mcp` | Starts a **new** video from a brief and carries the conversation to done. |
| `rubiic` | `https://rubiic.com/api/mcp` | Reads and drives **existing** projects: scenes, renders, exports, downloads. |

Every `agent_start` creates a new project. To check on, render or download
something that already exists, use `rubiic`, never `rubiic-agent`.

## `rubiic-agent`

| Tool | Input | Returns |
| --- | --- | --- |
| `agent_start` | `{ message }` | `{ invocationId, status, pollAfterMs, … }` |
| `agent_get` | `{ invocationId }` | the invocation's current state |
| `agent_update` | `{ invocationId, responses }` | the invocation after your answers |
| `agent_cancel` | `{ invocationId }` | the cancellation request |

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

## `rubiic`

All tools except `list_projects` take a `projectId`. Take every id from these
tools' own responses. Never parse one out of the agent's chat text.

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
