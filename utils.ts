
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-EG').format(value);
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};
