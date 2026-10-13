export const formatNumber = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
export const formatPercent = (value: number | null) => value === null ? 'Non applicable' : `${formatNumber(value)} %`
