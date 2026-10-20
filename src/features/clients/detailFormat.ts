export const displayYesNo = (value?: boolean) => value === undefined ? 'Not provided' : value ? 'Yes' : 'No'
export const displayDate = (value?: string) => value ? value.split('T')[0].split('-').reverse().join('/') : 'Not provided'
export const displayEuro = (value?: number) => value !== undefined && Number.isFinite(value)
  ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', currencyDisplay: 'code' }).format(value)
  : 'Not provided'
