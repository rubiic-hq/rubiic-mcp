---
name: rubiic
description: Use when asked to make, export, or fetch a video, GIF, image, still, carousel, PDF, or captions with Rubiic over MCP.
---

# Rubiic over MCP

Rubiic turns a brief into a rendered MP4 (and, from any scene, a GIF, still
image, carousel, or caption file). One MCP server does all of it: it starts
new videos by conversation with Rubiic's agent, and it reads and drives
existing projects' renders and exports.

## 1. Connect

The server is `https://rubiic.com/api/mcp`.

- **Claude apps (Desktop, claude.ai, mobile):** add it as a custom connector
  (Settings → Connectors → Add custom connector) and sign in to Rubiic when
  asked.
- **Claude Code and other clients:** use a personal access token, minted
  under **API tokens** on https://rubiic.com/account. It is shown exactly
  once — copy it immediately — and can be revoked from the same page.

```bash
claude mcp add --transport http rubiic \
  https://rubiic.com/api/mcp \
  --header "Authorization: Bearer <token>"
```

(An older setup may also have `rubiic-agent` at
`https://rubiic.com/eve/agents/rubiic/eve/v1/mcp`. It still works and serves
the same four `agent_*` tools; you do not need it.)

`agent_start` always creates a *new* project. For anything about a project
that already exists — status, scenes, renders, exports, downloads — use the
project tools below, never `agent_start`, even if you only meant to check on
an old one.

## 2. The invocation rhythm (`agent_*`)

1. `agent_start({message, modelTeam?})` — one new project per call. Returns
   an `invocationId` and a `status`. `modelTeam` picks the models that make
   the video: `economy` (the default when it is left out, and the cheapest),
   `balanced`, or `premium` (the best writing and animation, several times
   the cost). Name `premium` only when the user asks for top quality or for
   Premium by name. Balanced and Premium need an account that has bought
   credits or has a plan; a free account asking for one gets a tool error
   saying so, and nothing starts or is billed. The team is fixed for the
   whole project once it starts.
2. While `status` is `working` (or `authorization_required`), wait at least
   `pollAfterMs` (from the last response) before calling
   `agent_get({invocationId})` again. Do not poll faster.
3. When `status` is `input_required`, the response carries `inputRequests`
   keyed by request id. Answer with
   `agent_update({invocationId, responses})`, where `responses` is an array
   of either `{requestId, optionId}` (picking one of the request's offered
   options) or `{requestId, text}` (a freeform answer, only when the request
   allows it). Known eve wart (0.39.3): `agent_get` can keep listing a
   request you already answered until the next turn completes. Track which
   request ids you have answered yourself, and never send another
   `agent_update` for one you've already answered — resending does not help
   and can double-submit.
4. Terminal states: `completed` (final message, done), `failed` (an `error`
   object), `cancelled`. Stop polling on any of these.

`agent_cancel({invocationId})` requests cancellation; read the invocation
again afterward to see it take effect.

`agent_start` always makes a new project — there is no "continue this
project" call. Once a project exists (from `agent_start`, or from the app
itself), everything about it goes through the project tools below.

## 3. Recipes (project tools)

All control tools take a `projectId`. Get one from `list_projects` or from
the `chatId`/`projectId` you tracked after `agent_start`.

**MP4 render:**
1. `get_project({projectId})` — read `scenes` (each with `sceneId`).
2. `start_render({projectId, sceneId})` — returns a `rendering` job with a
   `renderId`. If the scene already has a non-failed render, this returns
   that render as-is instead of billing a new one.
3. Poll `render_status({projectId, renderId})` until `status` is terminal:
   `succeeded`, `failed`, or `uncertain`. Download only on `succeeded`. On
   `uncertain` the submission may or may not have reached the renderer — stop
   and report it; do not blindly resubmit (that risks a second charge). On
   `failed`, report it; a retry is `start_render` again once the scene is
   fixed.
4. `get_download_url({projectId, kind: "render", id: renderId})` — fetch the
   `url` immediately.

**GIF, still image, carousel, or captions:**
1. `get_project({projectId})` — for captions, check the scene's
   `hasNarration` first; only scenes with `hasNarration: true` support
   caption export.
2. `start_export({projectId, sceneId, options})` — returns immediately with
   a `running` job and an `exportId`. It does not return the file inline.
3. Poll `export_status({projectId, exportId})` until `status` is
   `succeeded` or `failed`. A succeeded export's `files` array names each
   output file.
4. `get_download_url({projectId, kind: "export", id: exportId, file: <name
   from export_status>})` — fetch the `url` immediately.

**Starting from a chat brief, end to end:**
1. `list_projects({})` FIRST and remember the set of `projectId`s.
2. `agent_start({message: "<brief, naming the format you want>"})`, poll per
   §2 to `completed`.
3. `list_projects({})` again. The new project is the `projectId` that was not
   in the set from step 1 — do NOT assume the newest row is yours, since
   another session may have created a project meanwhile. If more than one is
   new, disambiguate by `title` (it matches your brief) before doing anything
   that spends credits; if you cannot tell, ask the user rather than guess.
4. `get_project({projectId})` to find the scene, and any render/export the
   conversation already produced — or drive the render/export recipes above
   yourself.
5. `get_download_url(...)` to fetch it.

Always resolve `renderId`/`exportId`/`sceneId` from the project tools'
own responses (`get_project`, `start_render`, `start_export`,
`render_status`, `export_status`). Never parse an id out of the agent's chat
prose — the agent's own message is not a source of truth for ids.

## 4. `start_export` format options

- GIF: `{format: "gif", startFrame, endFrame, fps: 5 | 10, maxWidth: 320 |
  640, loop}`
- Still image: `{format: "png" | "jpeg" | "webp", frame}`
- Carousel: `{format: "carousel", pages: [{frame, label}, ...]}` — up to 12
  pages
- Captions: `{format: "srt"}` or `{format: "vtt"}`

`frame`/`startFrame`/`endFrame` are frame numbers inside the scene's own
`durationInFrames` (from `get_project`) — never guess one; read it off the
scene first.

## 5. Retrieval

`get_download_url` URLs expire: 3600 seconds for a render, 60 seconds for an
export file. Fetch the file immediately after asking for the URL. Never
store a download URL, print it for later, or reuse one across calls — ask
for a fresh one each time you need the file. Never guess a `renderId`,
`exportId`, or file name; always take it from a control-endpoint response.

## 6. What costs credits

- Costs credits: `start_render`, and `start_export` for `gif`, `png`,
  `jpeg`, `webp`, or `carousel`.
- Free: `list_projects`, `get_project`, `render_status`, `export_status`,
  `get_download_url`, and `start_export` for `srt`/`vtt` captions.
- Never call `start_render` unless the user actually asked for the video —
  a scene that already has a non-failed render is returned for free, but a
  new render is a real charge.

## 7. Limits

- GIF: up to 10 seconds, up to 25 MB. Over budget: shorten the clip, or drop
  to 320 px / 5 fps, or export the MP4 for the full video instead.
- Images (png/jpeg/webp) and carousel pages: up to 3840 px on a side, up to
  8.3 megapixels, up to 20 MB per image. Over budget: use a smaller scene
  size, or try JPEG/WebP instead of PNG.
- Carousel: up to 12 pages, up to 24 MB across all page images combined, up
  to 64 MB total. Over budget: remove pages or use a smaller scene size.
- Captions (srt/vtt): up to 5 MB. Over budget: split the narration into
  shorter scenes.

## 8. Do not

- Do not invent a `sceneId`, `renderId`, `exportId`, or frame number — read
  every id and every `durationInFrames` from a control-endpoint response
  first.
- Do not poll `agent_get` faster than the `pollAfterMs` the last response
  gave you.
- Do not send `agent_update` for an `inputRequests` id you have already
  answered.
- Do not store, print for later, or reuse a `get_download_url` URL — it
  expires and must be fetched immediately.
- Do not call `start_render` unless the user asked for the rendered video —
  it can spend credits.
