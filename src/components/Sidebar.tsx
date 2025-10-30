import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  TrendingUp,
  Settings,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

function Sidebar({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  darkMode,
  setDarkMode
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'requirements', label: 'Requerimientos', icon: FileText },
    { id: 'suppliers', label: 'Proveedores', icon: Users },
    { id: 'reports', label: 'Reportes', icon: TrendingUp },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } border-r transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Package className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Inventario
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                isActive
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : darkMode
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
            darkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {darkMode ? (
            <>
              <Sun className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Modo Claro</span>}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Modo Oscuro</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;