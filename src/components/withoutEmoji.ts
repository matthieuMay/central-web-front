// Pictographs plus the invisible pieces emoji are built from: variation selector,
// zero-width joiner, keycap mark, skin-tone modifiers and flag letters.
const emoji = /\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|\u{FE0F}|\u{200D}|\u{20E3}/gu

// Board data may contain emoji; the UI shows text only.
export function withoutEmoji(text: string) {
  return text.replace(emoji, '').replace(/\s{2,}/g, ' ').trim()
}
