# Mozilla Otari GitHub Issue / Feedback Report

**Target Repo:** `mozilla-ai/otari`  
**Submission Category:** Developer Experience, Documentation & Control Plane API  

---

## Recommended issue (reproduced live on hosted otari.ai, 2026-11-09)

### Title
`[BUG] google/gemma-3-12b-it and gemma-3-27b-it answer otari_web_fetch requests with tool_code text instead of a tool call`

### Description
On hosted Otari (served by Bedrock), a chat completion that declares `{"type": "otari_web_fetch"}` with `google/gemma-3-12b-it` or `google/gemma-3-27b-it` never produces a gateway tool call. The model replies with plain text such as:

```
```tool_code
print(web_fetch(url='https://www.sqlite.org/lang_select.html'))
```
```

`otari_tool_calls` is absent, so no fetch runs. The same request with `meta/llama-3.1-70b-instruct` returns `otari_tool_calls: [{"type": "web_fetch", "status": "completed", "url": "https://www.sqlite.org/lang_select.html"}]`.

### Steps to reproduce
1. POST `/api/v1/chat/completions` with `model: google/gemma-3-12b-it`, `tools: [{"type": "otari_web_fetch"}]`, and the message "Use web fetch on https://www.sqlite.org/lang_select.html and quote its first heading."
2. Observe the `tool_code` text reply and no `otari_tool_calls`.
3. Repeat with `meta/llama-3.1-70b-instruct`; the fetch completes.

### Expected
Either the catalog marks Gemma 3 offerings as not supporting tool calls (so a policy or the caller can avoid them), or the gateway rejects the tool declaration with a clear 400, rather than returning a 200 where the tool silently never runs.

### Workaround in DB Explorer
Gemma explains without tools; a second call to `meta/llama-3.1-70b-instruct` with `otari_web_fetch` fetches the official doc page for the citation chip.

---

## Issue 1: Expose remaining user budget and reset headers directly on Chat Completion responses

### Title
`[Feature Request]: Include Otari-Budget-Remaining and Otari-Budget-Reset headers on /v1/chat/completions responses`

### Description
When building multi-tenant applications using virtual service keys with end-user budgets (e.g. `$0.05/learner/day` via the `user` parameter), client frontends need to display remaining credits to users.

Currently, retrieving a learner's remaining spend requires making an out-of-band HTTP request to `GET /api/v1/end-users?external_id={user_id}` before or after each completion. This introduces:
1. Extra network roundtrips between the application server and the gateway.
2. Potential race conditions between asynchronous usage reconciliation and client polling.

### Proposed Solution
Include two lightweight headers in successful `/v1/chat/completions` responses when a user budget is active on the virtual key:
- `Otari-Budget-Remaining: 0.042` (Float, USD remaining)
- `Otari-Budget-Reset: 2026-11-04T00:00:00Z` (ISO-8601 timestamp of reset)

When a request exceeds the budget (HTTP 403), Otari already provides error payloads, but standardizing `Retry-After: <seconds>` on the 403 response would allow standard HTTP clients to automatically handle backoff and countdown timers.

### Environment
- Otari Gateway (Hosted / v0.4+)
- Node.js `openai` SDK v4.x
- Target: Educational sandboxes / anonymous learner rate-limiting

---

## Issue 2: Documentation Gap for `otari_tool_calls` in OpenAI Node SDK streaming responses

### Title
`[Docs Gap]: Document structure of gateway-managed tools (otari_code_execution, otari_web_fetch) in OpenAI JS/TS SDK`

### Description
In the current documentation, tool use examples focus predominantly on Python SDK examples (`chat.completions.create`). When integrating using the official `openai` npm package in Node.js/TypeScript:
- Standard OpenAI tools expect `tool_calls: [{ function: { name, arguments } }]`.
- Otari's server-side tool execution passes `otari_tool_calls: [...]` on choice objects containing `request` and `response` metadata (e.g. for container execution outputs and fetched URLs).
- In TypeScript, strict OpenAI SDK types omit `otari_tool_calls`, requiring developers to cast responses or access untyped properties.

### Proposed Improvement
Add a dedicated "Node.js & TypeScript SDK Guide" to the Otari docs (`docs/integrations/nodejs.md`) illustrating:
1. How to declare `otari_code_execution` and `otari_web_fetch` with domain whitelists.
2. How to extract `response.headers.get('otari-model')` and `response.headers.get('otari-fallback')` using `.withResponse()`.
3. Extended type definitions for `otari_tool_calls`.
