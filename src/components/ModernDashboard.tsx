import { useState, useEffect } from 'react';
import { 
  Product, StockMovement, Category,
  productsAPI, stockMovementsAPI, categoriesAPI
} from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { 
  TrendingUp, TrendingDown, Package, AlertCircle, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, ShoppingCart, Box, Boxes, Archive
} from 'lucide-react';

export default function ModernDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // Observer para detectar cambios en el modo oscuro
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, movementsData, categoriesData] = await Promise.all([
        productsAPI.getAll(),
        stockMovementsAPI.getAll({ limit: 100 }),
        categoriesAPI.getAll()
      ]);

      setProducts(productsData);
      setMovements(movementsData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`max-w-md w-full rounded-lg border p-8 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="text-center">
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Error de Conexión
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={loadData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cálculos
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.current_stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);
  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock);
  const outOfStockProducts = products.filter(p => p.current_stock === 0);

  const recentMovements = movements.slice(0, 8);
  const movementsIn = movements.filter(m => m.movement_type === 'IN');
  const movementsOut = movements.filter(m => m.movement_type === 'OUT');
  const totalIn = movementsIn.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  const totalOut = movementsOut.reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  const categoryStats = categories.map(cat => {
    const categoryProducts = products.filter(p => p.category_id === cat.id);
    const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);
    return {
      ...cat,
      productCount: categoryProducts.length,
      totalValue: categoryValue
    };
  }).filter(c => c.productCount > 0).sort((a, b) => b.totalValue - a.totalValue);

  const stockHealth = {
    healthy: products.filter(p => p.current_stock > p.min_stock * 2).length,
    warning: products.filter(p => p.current_stock > p.min_stock && p.current_stock <= p.min_stock * 2).length,
    critical: lowStockProducts.length,
    outOfStock: outOfStockProducts.length
  };

  // Calcular cambios (simulado)
  const valueChange = 5.3;
  const stockChange = -2.1;

  const kpiCards = [
    {
      title: 'Total Productos',
      value: formatNumber(totalProducts),
      icon: Package,
      change: '+12%',
      positive: true,
      color: 'blue'
    },
    {
      title: 'Stock Total',
      value: formatNumber(totalStock),
      icon: Archive,
      change: stockChange < 0 ? `${stockChange}%` : `+${stockChange}%`,
      positive: stockChange >= 0,
      color: 'green'
    },
    {
      title: 'Valor Inventario',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      change: `+${valueChange}%`,
      positive: true,
      color: 'purple'
    },
    {
      title: 'Alertas Stock Bajo',
      value: formatNumber(lowStockProducts.length),
      icon: AlertCircle,
      change: '-5%',
      positive: true,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard de Inventario
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Vista general del sistema de inventario
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Activity className="w-5 h-5" />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`rounded-lg border p-6 transition-all hover:shadow-lg ${
                darkMode
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    kpi.color === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : kpi.color === 'green'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : kpi.color === 'purple'
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      kpi.color === 'blue'
                        ? 'text-blue-600 dark:text-blue-400'
                        : kpi.color === 'green'
                        ? 'text-green-600 dark:text-green-400'
                        : kpi.color === 'purple'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  />
                </div>
                <span
                  className={`flex items-center text-sm font-medium ${
                    kpi.positive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {kpi.positive ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {kpi.change}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {kpi.title}
                </p>
                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado del Inventario - Usando icono Box */}
        <div
          className={`rounded-lg border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Estado del Inventario
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stock Saludable
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stockHealth.healthy}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stockHealth.healthy / totalProducts) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Advertencia
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stockHealth.warning}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stockHealth.warning / totalProducts) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stock Crítico
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stockHealth.critical}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stockHealth.critical / totalProducts) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sin Stock
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stockHealth.outOfStock}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stockHealth.outOfStock / totalProducts) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Movimientos de Stock - Usando icono ShoppingCart */}
        <div
          className={`rounded-lg border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Movimientos de Stock
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Entradas
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {movementsIn.length} operaciones
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(totalIn)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Salidas
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {movementsOut.length} operaciones
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatNumber(totalOut)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Categorías - Usando icono Boxes */}
        <div
          className={`rounded-lg border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Top Categorías
            </h3>
          </div>
          <div className="space-y-3">
            {categoryStats.slice(0, 5).map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {category.name}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatCurrency(category.totalValue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(category.totalValue / categoryStats[0].totalValue) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div
        className={`rounded-lg border ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Movimientos Recientes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Producto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Tipo
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Cantidad
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {recentMovements.map((movement) => (
                <tr key={movement.id} className={`hover:${darkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {movement.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        movement.movement_type === 'IN'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {movement.movement_type === 'IN' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {formatNumber(Math.abs(movement.quantity))}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(movement.created_at).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}