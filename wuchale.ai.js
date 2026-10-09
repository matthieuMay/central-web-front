// @ts-check
import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

/**
 * OpenRouter-backed AI translation provider for wuchale.
 *
 * wuchale's built-in provider only supports Gemini, so this implements the
 * `AI` contract against OpenRouter through the Vercel AI SDK. The key is read
 * from `OPENROUTER_API_KEY` (the provider also defaults to that variable) and
 * is never written to a file. When no key is present the provider returns
 * `null`, which disables AI translation and leaves untranslated Messages to
 * fall back to the Source Locale.
 *
 * @param {{
 *   apiKey?: string,
 *   model?: string,
 *   batchSize?: number,
 *   parallel?: number,
 * }} [options]
 */
export function openrouterAi(options = {}) {
  const {
    apiKey = process.env.OPENROUTER_API_KEY ?? '',
    model = process.env.WUCHALE_AI_MODEL ?? DEFAULT_MODEL,
    batchSize = 25,
    parallel = 2,
  } = options

  if (!apiKey) return null

  const client = createOpenRouter({ apiKey })

  return {
    name: 'OpenRouter',
    batchSize,
    parallel,
    group: {},
    /**
     * @param {string} content
     * @param {string} instruction
     */
    translate: async (content, instruction) => {
      const { text } = await generateText({
        model: client.chat(model),
        system: instruction,
        prompt: content,
      })
      return text
    },
  }
}
