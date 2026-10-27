export function normalizeExternalLink(value) {
  const link = String(value ?? '').trim()
  try {
    const url = new URL(link)
    return ['http:', 'https:'].includes(url.protocol) ? link : ''
  } catch (error) {
    return ''
  }
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
  const safeLink = normalizeExternalLink(link)
  if (!safeLink) {
    return
  }

  window.open(safeLink, '_blank', 'noopener,noreferrer')
}
