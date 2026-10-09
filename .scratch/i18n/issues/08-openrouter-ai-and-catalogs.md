# Configure OpenRouter AI and generate en/es catalogs

Type: task
Status: open
Blocked by: 02, 05

## Question

Using ticket 02's findings:

- Implement `ai.translate` against OpenRouter via the Vercel AI SDK provider, reading `OPENROUTER_API_KEY` from the environment (never committed), with a cheap multilingual default model and conservative `batchSize`/`parallel`.
- Generate the `en` and `es` Catalogues from the extracted Messages; confirm AI-drafted entries carry the review flag and that re-running never re-translates existing entries.
- Confirm French remains the fallback for any untranslated `en`/`es` Message.

Answer records the provider/model configured, where the key is expected, and the number of Messages drafted per Locale.

## Note

Open: awaiting `OPENROUTER_API_KEY` from the user. The provider is wired in `wuchale.ai.js`; once the key is exported, run `npm run i18n` to draft the `en`/`es` Catalogs (flagged for review), then re-run `npm run i18n` / build to compile them.
