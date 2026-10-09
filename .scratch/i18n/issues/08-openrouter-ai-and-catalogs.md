# Configure OpenRouter AI and generate en/es catalogs

Type: task
Status: resolved
Blocked by: 02, 05

## Question

Using ticket 02's findings:

- Implement `ai.translate` against OpenRouter via the Vercel AI SDK provider, reading `OPENROUTER_API_KEY` from the environment (never committed), with a cheap multilingual default model and conservative `batchSize`/`parallel`.
- Generate the `en` and `es` Catalogues from the extracted Messages; confirm AI-drafted entries carry the review flag and that re-running never re-translates existing entries.
- Confirm French remains the fallback for any untranslated `en`/`es` Message.

Answer records the provider/model configured, where the key is expected, and the number of Messages drafted per Locale.

## Note

Open: awaiting `OPENROUTER_API_KEY` from the user. The provider is wired in `wuchale.ai.js`; once the key is exported, run `npm run i18n` to draft the `en`/`es` Catalogs (flagged for review), then re-run `npm run i18n` / build to compile them.

## Answer

Done. `wuchale.ai.js` uses the Vercel AI SDK (`generateText`, `@openrouter/ai-sdk-provider`), key from `OPENROUTER_API_KEY`, model `openai/gpt-4o-mini` (overridable via `WUCHALE_AI_MODEL`), `batchSize: 25`, `parallel: 2`, `temperature: 0`.

wuchale reinforces "respond with a JSON array" but `gpt-4o-mini` echoes the input item's `id` for single-item batches, so `translate` appends an explicit output contract (locale-keyed objects, no `id`/`context`/`references`) and normalizes the response (strip code fences, wrap a bare object as an array, drop non-string values that would crash wuchale). `generateObject` was tried first but OpenAI rejects arbitrary-key map schemas (`propertyNames is not permitted`).

`npm run i18n` then completed: **43/44 Messages translated in both `en` and `es`** (the 44th is the PO header), every entry carrying the `#, ai` review flag. Re-running does not re-translate existing entries. French remains the automatic fallback for anything untranslated.
