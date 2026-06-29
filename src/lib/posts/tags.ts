export function parseTagsInput(input: string) {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function formatTagsInput(tags: string[]) {
  return tags.join(', ')
}
