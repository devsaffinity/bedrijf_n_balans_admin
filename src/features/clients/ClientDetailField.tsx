export function ClientDetailField({ label, value }: { label: string; value?: string }) {
  return <div className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-6"><dt className="text-[var(--color-muted)]">{label}</dt><dd className="whitespace-pre-wrap break-words font-medium">{value?.trim() ? value : 'Not provided'}</dd></div>
}
