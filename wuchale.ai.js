// @ts-check
import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

// wuchale reinforces "respond with a JSON array" but models tend to echo the
// input item's `id` field for single-item batches. This contract makes the
// expected shape unambiguous.
const OUTPUT_CONTRACT =
  '\n\nEach array element MUST be a JSON object whose keys are locale codes ' +
  '(e.g. {"en": "..."}) and whose values are the translations. Do NOT include ' +
  'id, context, or references fields in the output.'

/**
 * Coerces the model output into the JSON array of locale-keyed objects that
 * wuchale parses, tolerating markdown fences, a bare object instead of an
 * array, and non-string values (which would otherwise crash wuchale).
 *
 * @param {string} text
 */
function normalizeTranslationOutput(text) {
  let cleaned = text.trim()
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) cleaned = fenced[1].trim()

  const firstBracket = cleaned.indexOf('[')
  const lastBracket = cleaned.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1)
  } else {
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = `[${cleaned.slice(firstBrace, lastBrace + 1)}]`
    }
  }

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return text
  }

  const entries = Array.isArray(parsed) ? parsed : [parsed]
  const normalized = entries.map((entry) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return {}
    const out = {}
    for (const [locale, value] of Object.entries(entry)) {
      if (typeof value === 'string') out[locale] = value
      else if (Array.isArray(value) && value.every((form) => typeof form === 'string')) {
        out[locale] = value
      }
    }
    return out
  })

  return JSON.stringify(normalized)
}

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
        system: instruction + OUTPUT_CONTRACT,
        prompt: content,
        temperature: 0,
      })
      return normalizeTranslationOutput(text)
    },
  }
}
