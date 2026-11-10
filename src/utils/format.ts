export const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : '—'

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)

// Saved currency is data, not an assumed EUR amount. Invalid/missing codes
// remain displayable without throwing during rendering.
export const formatPaymentAmount = (value: number, currency?: string) => {
  const amount = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  return currency ? `${amount} ${currency}` : amount
}
