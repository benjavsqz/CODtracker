export function formatKD(kd: number) {
  return kd.toFixed(2)
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

export function getPlacementLabel(n: number) {
  if (n === 1) return '#1 ★'
  return `#${n}`
}

export function tierColor(tier: string) {
  switch (tier) {
    case 'S': return 'text-yellow-400'
    case 'A': return 'text-green-400'
    case 'B': return 'text-blue-400'
    case 'C': return 'text-gray-400'
    default:  return 'text-white'
  }
}
