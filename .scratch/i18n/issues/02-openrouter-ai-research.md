# OpenRouter + wuchale AI translation specifics

Type: research
Status: resolved

## Question

How is wuchale's `ai.translate` configured against **OpenRouter**? wuchale's built-in `ai` only ships Gemini, so this needs a custom config object. Confirm:

- The exact `ai` config type wuchale expects, in particular the `translate(messages, instruction)` signature, its return type, and how `batchSize`, `parallel`, and `group` interact.
- That OpenRouter is reachable via the Vercel AI SDK's OpenRouter provider (`@openrouter/ai-sdk-provider`) used with `generateText`, and the exact package name and current version.
- That the key is read from **`OPENROUTER_API_KEY`** (or how to wire that env var explicitly), and that the key is never written to any committed file.
- How the `ai` review flag is emitted into the PO Catalogue and how a human removes it after review.
- Whether wuchale only translates Messages with empty `msgstr`, and that it never re-translates an existing translation.
- A sensible default OpenRouter model for `fr → en/es` UI strings (cheap, multilingual), plus conservative `batchSize`/`parallel` values.

Return: the concrete `ai` config shape and package facts, verified against wuchale docs (`wuchale.dev/guides/ai`) and the AI SDK / OpenRouter provider docs — not memory. Note any version pitfalls.

## Answer

wuchale built-in `ai` is Gemini-only, so `wuchale.ai.js` implements the `AI` contract (`name`, `batchSize`, `parallel`, `group`, `translate(body, instruction)`). It uses the Vercel AI SDK (`ai` v7) with `@openrouter/ai-sdk-provider` v3: `createOpenRouter({ apiKey })` + `generateText({ model: client.chat(model), system: instruction, prompt: content })`. Key from `OPENROUTER_API_KEY`; model overridable via `WUCHALE_AI_MODEL` (default `openai/gpt-4o-mini`). Returns `null` when no key, which leaves `en`/`es` to fall back to `fr`. AI output carries the `ai` review flag.
