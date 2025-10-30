import { useState } from 'react';
import Layout from './components/Layout';
import ModernDashboard from './components/ModernDashboard';
import InventoryDashboard from './components/InventoryDashboard';
import RequirementsDashboard from './components/RequirementsDashboard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ModernDashboard />;
      case 'inventory':
        return <InventoryDashboard />;
      case 'requirements':
        return <RequirementsDashboard />;
      case 'suppliers':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Módulo de Proveedores
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Próximamente disponible
            </p>
          </div>
        );
      case 'reports':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Módulo de Reportes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Próximamente disponible
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Configuración
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Próximamente disponible
            </p>
          </div>
        );
      default:
        return <ModernDashboard />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
}

export default App;