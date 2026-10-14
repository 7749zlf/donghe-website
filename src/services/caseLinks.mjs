export function normalizeExternalLink(value) {
  return String(value ?? '').trim()
}

export function normalizeCaseLinks(caseItem = {}) {
  const url = normalizeExternalLink(caseItem.url)
  const blueprintUrl = normalizeExternalLink(caseItem.blueprintUrl ?? caseItem.blueprint_url)

  return {
    url,
    blueprintUrl
  }
}

export function openExternalLink(link) {
  if (!link) {
    return
  }

  window.open(link, '_blank')
}
