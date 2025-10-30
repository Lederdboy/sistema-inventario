import { useState, useEffect } from 'react';
import {
  Requirement, Product,
  requirementsAPI, productsAPI
} from '../lib/api';
import { Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function RequirementsDashboard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [reqForm, setReqForm] = useState({
    product_id: '',
    quantity_needed: 0,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    requested_by: '',
    department: '',
    reason: '',
    expected_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reqData, prodData] = await Promise.all([
        requirementsAPI.getAll(),
        productsAPI.getAll()
      ]);

      setRequirements(reqData);
      setProducts(prodData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await requirementsAPI.create(reqForm);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar requerimiento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este requerimiento?')) return;
    try {
      await requirementsAPI.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleUpdateStatus = async (
    id: string, 
    status: Requirement['status']  
  ) => {
    try {
      await requirementsAPI.update(id, { status });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  const resetForm = () => {
    setReqForm({
      product_id: '',
      quantity_needed: 0,
      priority: 'MEDIUM',
      requested_by: '',
      department: '',
      reason: '',
      expected_date: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando requerimientos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-center mb-2 text-slate-800 dark:text-white">Error</h3>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-4">{error}</p>
          <button
            onClick={loadData}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = requirements.filter(r => r.status === 'PENDING').length;
  const urgentCount = requirements.filter(r => r.priority === 'URGENT').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Requerimientos</h1>
            <p className="text-slate-600 dark:text-slate-400">Gestión de solicitudes de productos</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Requerimiento
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm transition-colors duration-200">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm transition-colors duration-200">
            <p className="text-sm text-slate-600 dark:text-slate-400">Urgentes</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{urgentCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm transition-colors duration-200">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{requirements.length}</p>
          </div>
        </div>

        {/* Requirements Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Número</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Producto</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Cantidad</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Prioridad</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Solicitante</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha Esperada</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {requirements.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {req.requirement_number}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{req.product_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{req.sku}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{req.quantity_needed}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        req.priority === 'URGENT' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        req.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        req.priority === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        req.status === 'APPROVED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        req.status === 'ORDERED' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                        req.status === 'RECEIVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{req.requested_by}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{req.department}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {req.expected_date ? new Date(req.expected_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full p-6 transition-colors duration-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Nuevo Requerimiento</h2>
              <div className="space-y-4">
                <select
                  value={reqForm.product_id}
                  onChange={(e) => setReqForm({...reqForm, product_id: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  autoComplete="off"
                >
                  <option value="">Seleccionar producto *</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.sku}) - Stock: {prod.current_stock}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Cantidad necesaria *"
                    value={reqForm.quantity_needed}
                    onChange={(e) => setReqForm({...reqForm, quantity_needed: parseInt(e.target.value)})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    autoComplete="off"
                  />
                  <select
                    value={reqForm.priority}
                    onChange={(e) => setReqForm({...reqForm, priority: e.target.value as any})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    autoComplete="off"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Solicitado por *"
                    value={reqForm.requested_by}
                    onChange={(e) => setReqForm({...reqForm, requested_by: e.target.value})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    autoComplete="off"
                  />
                  <input
                    placeholder="Departamento"
                    value={reqForm.department}
                    onChange={(e) => setReqForm({...reqForm, department: e.target.value})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    autoComplete="off"
                  />
                </div>

                <input
                  type="date"
                  placeholder="Fecha esperada"
                  value={reqForm.expected_date}
                  onChange={(e) => setReqForm({...reqForm, expected_date: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  autoComplete="off"
                />

                <textarea
                  placeholder="Razón / Justificación"
                  value={reqForm.reason}
                  onChange={(e) => setReqForm({...reqForm, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  rows={3}
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
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