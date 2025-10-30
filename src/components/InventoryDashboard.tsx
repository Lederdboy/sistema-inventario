import { useState, useEffect } from 'react';
import {
  Product, Category, Supplier,
  productsAPI, categoriesAPI, suppliersAPI, stockMovementsAPI
} from '../lib/api';
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle } from 'lucide-react';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    sku: '', name: '', description: '', category_id: '', supplier_id: '',
    unit_price: 0, cost_price: 0, current_stock: 0, min_stock: 0,
    max_stock: 1000, reorder_point: 0, location: ''
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [supplierForm, setSupplierForm] = useState({
    code: '', name: '', contact_name: '', email: '', phone: '',
    address: '', city: '', country: ''
  });

  const [stockForm, setStockForm] = useState({
    movement_type: 'IN' as 'IN' | 'OUT',
    quantity: 0,
    unit_cost: 0,
    reason: '',
    reference: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData, suppliersData] = await Promise.all([
        productsAPI.getAll({
          search: searchTerm || undefined,
          category_id: selectedCategory || undefined,
          low_stock: showLowStock || undefined
        }),
        categoriesAPI.getAll(),
        suppliersAPI.getAll()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, showLowStock]);

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productForm);
      } else {
        await productsAPI.create(productForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar producto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productsAPI.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar producto');
    }
  };

  const handleSaveCategory = async () => {
    try {
      await categoriesAPI.create(categoryForm);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar categoría');
    }
  };

  const handleSaveSupplier = async () => {
    try {
      await suppliersAPI.create(supplierForm);
      setShowSupplierModal(false);
      setSupplierForm({
        code: '', name: '', contact_name: '', email: '', phone: '',
        address: '', city: '', country: ''
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar proveedor');
    }
  };

  const handleStockMovement = async () => {
    if (!selectedProduct) return;
    try {
      await stockMovementsAPI.create({
        product_id: selectedProduct.id,
        movement_type: stockForm.movement_type,
        quantity: stockForm.movement_type === 'OUT' ? -Math.abs(stockForm.quantity) : Math.abs(stockForm.quantity),
        unit_cost: stockForm.unit_cost || undefined,
        reason: stockForm.reason,
        reference: stockForm.reference
      });
      setShowStockModal(false);
      setSelectedProduct(null);
      setStockForm({ movement_type: 'IN', quantity: 0, unit_cost: 0, reason: '', reference: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al registrar movimiento');
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
      unit_price: product.unit_price,
      cost_price: product.cost_price,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      reorder_point: product.reorder_point,
      location: product.location || ''
    });
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setProductForm({
      sku: '', name: '', description: '', category_id: '', supplier_id: '',
      unit_price: 0, cost_price: 0, current_stock: 0, min_stock: 0,
      max_stock: 1000, reorder_point: 0, location: ''
    });
  };

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-center mb-2 text-slate-800 dark:text-white">Error de Conexión</h3>
          <p className="text-slate-600 dark:text-gray-400 text-center mb-4">{error}</p>
          <button
            onClick={loadData}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const lowStockCount = products.filter(p => p.current_stock <= p.reorder_point).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Gestión de Inventario</h1>
          <p className="text-slate-600 dark:text-gray-400">Administra productos, categorías y stock</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { resetProductForm(); setShowProductModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
          <button
            onClick={() => setShowSupplierModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Proveedor
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700 dark:text-gray-300">Solo stock bajo ({lowStockCount})</span>
            </label>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">SKU</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Producto</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Categoría</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Precio</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Valor</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {products.map((product) => {
                  const isLowStock = product.current_stock <= product.reorder_point;
                  const isOutOfStock = product.current_stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-gray-200">{product.sku}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-gray-200">{product.name}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400">{product.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-gray-400">{product.category_name || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-gray-200'
                            }`}>
                            {product.current_stock}
                          </span>
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-gray-400">S/{product.unit_price}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-gray-200">
                        S/{(product.current_stock * product.unit_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openStockModal(product)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="Movimiento de stock"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditProduct(product)}
                            className="p-1 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 transition-colors duration-200">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Completa la información del producto. Los campos con * son obligatorios.
                </p>
              </div>

              {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs">1</span>
                  Información Básica
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      SKU / Código *
                    </label>
                    <input
                      placeholder="Ej: PROD-001"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      placeholder="Ej: Laptop Dell Inspiron 15"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      placeholder="Descripción detallada del producto..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      rows={2}
                      autoComplete="off"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Proveedor */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Proveedor
                    </label>
                    <select
                      value={productForm.supplier_id}
                      onChange={(e) => setProductForm({ ...productForm, supplier_id: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    >
                      <option value="">Seleccionar proveedor</option>
                      {suppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ubicación */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ubicación en Almacén
                    </label>
                    <input
                      placeholder="Ej: Pasillo A, Estante 3, Nivel 2"
                      value={productForm.location}
                      onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: PRECIOS */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs">2</span>
                  Información de Precios
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Precio de Venta */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Precio de Venta (S/)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={productForm.unit_price || ''}
                      onChange={(e) => setProductForm({ ...productForm, unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Precio al que vendes</p>
                  </div>

                  {/* Precio de Costo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Precio de Costo (S/)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={productForm.cost_price || ''}
                      onChange={(e) => setProductForm({ ...productForm, cost_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lo que te cuesta</p>
                  </div>

                  {/* Margen de Ganancia (calculado) */}
                  {productForm.unit_price > 0 && productForm.cost_price > 0 && (
                    <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Margen de Ganancia:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          S/ {(productForm.unit_price - productForm.cost_price).toFixed(2)}
                          ({(((productForm.unit_price - productForm.cost_price) / productForm.cost_price) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN 3: STOCK E INVENTARIO */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs">3</span>
                  Control de Stock
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Stock Actual */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={productForm.current_stock || ''}
                      onChange={(e) => setProductForm({ ...productForm, current_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cantidad actual</p>
                  </div>

                  {/* Stock Mínimo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={productForm.min_stock || ''}
                      onChange={(e) => setProductForm({ ...productForm, min_stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nivel mínimo</p>
                  </div>

                  {/* Punto de Reorden */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Punto de Reorden
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={productForm.reorder_point || ''}
                      onChange={(e) => setProductForm({ ...productForm, reorder_point: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      autoComplete="off"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Para alertas</p>
                  </div>

                  {/* Explicación */}
                  <div className="col-span-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>💡 Tip:</strong> El <strong>Punto de Reorden</strong> te alertará cuando necesites reponer stock antes de llegar al mínimo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
                <button
                  onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Movement Modal */}
        {showStockModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Movimiento de Stock</h2>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                Producto: <strong className="text-slate-800 dark:text-white">{selectedProduct.name}</strong><br />
                Stock actual: <strong className="text-slate-800 dark:text-white">{selectedProduct.current_stock}</strong>
              </p>
              <div className="space-y-4">
                <select
                  value={stockForm.movement_type}
                  onChange={(e) => setStockForm({ ...stockForm, movement_type: e.target.value as 'IN' | 'OUT' })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                >
                  <option value="IN">Entrada</option>
                  <option value="OUT">Salida</option>
                </select>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                {stockForm.movement_type === 'IN' && (
                  <input
                    type="number"
                    placeholder="Costo unitario (opcional)"
                    value={stockForm.unit_cost}
                    onChange={(e) => setStockForm({ ...stockForm, unit_cost: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                  />
                )}
                <input
                  placeholder="Razón"
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="Referencia (ej: PO-2025-00001)"
                  value={stockForm.reference}
                  onChange={(e) => setStockForm({ ...stockForm, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleStockMovement}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Registrar
                </button>
                <button
                  onClick={() => { setShowStockModal(false); setSelectedProduct(null); }}
                  className="flex-1 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Nueva Categoría</h2>
              <div className="space-y-4">
                <input
                  placeholder="Nombre *"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <textarea
                  placeholder="Descripción"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Modal */}
        {showSupplierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Nuevo Proveedor</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Código *"
                  value={supplierForm.code}
                  onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="Nombre *"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="Contacto"
                  value={supplierForm.contact_name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="Email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="Teléfono"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="Ciudad"
                  value={supplierForm.city}
                  onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <input
                  placeholder="País"
                  value={supplierForm.country}
                  onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg col-span-2 bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                />
                <textarea
                  placeholder="Dirección"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg col-span-2 bg-white dark:bg-gray-700 text-slate-800 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveSupplier}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}