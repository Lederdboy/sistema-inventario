// Utilidades de formateo para la aplicación

/**
 * Formatea un número a moneda peruana (Soles)
 */
export const formatCurrency = (amount: number): string => {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('es-PE');
};

/**
 * Formatea porcentaje
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Calcula el cambio porcentual entre dos valores
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Obtiene el color según el estado del stock
 */
export const getStockStatusColor = (currentStock: number, minStock: number): string => {
  if (currentStock === 0) return 'bg-red-100 text-red-700';
  if (currentStock <= minStock) return 'bg-orange-100 text-orange-700';
  if (currentStock <= minStock * 2) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

/**
 * Obtiene el texto del estado del stock
 */
export const getStockStatusText = (currentStock: number, minStock: number): string => {
  if (currentStock === 0) return 'Sin stock';
  if (currentStock <= minStock) return 'Crítico';
  if (currentStock <= minStock * 2) return 'Bajo';
  return 'Normal';
};