const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatCLP(amount: number | string | null | undefined): string {
  return clpFormatter.format(Number(amount) || 0);
}
