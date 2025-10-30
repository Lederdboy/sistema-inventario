const API_URL = '/api';
// Tipos
export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  unit_price: number;
  cost_price: number;
  currency: string;
  unit_of_measure: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  location?: string;
  warehouse?: string;
  is_active: boolean;
  category_name?: string;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  sort_order: number;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  rating: number;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number;
  total_value?: number;
  reason?: string;
  reference?: string;
  product_name?: string;
  sku?: string;
  created_at: string;
}

export interface Requirement {
  id: string;
  requirement_number: string;
  product_id: string;
  quantity_needed: number;
  quantity_approved: number;
  quantity_received: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  requested_by: string;
  department?: string;
  reason?: string;
  expected_date?: string;
  product_name?: string;
  sku?: string;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  inventoryValue: number;
  pendingRequirements: number;
}

// Helper para hacer peticiones
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============================================
// API Functions - Products
// ============================================

export const productsAPI = {
  getAll: (params?: { search?: string; category_id?: string; low_stock?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.low_stock) queryParams.append('low_stock', 'true');
    
    const query = queryParams.toString();
    return fetchAPI<Product[]>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => fetchAPI<Product>(`/products/${id}`),

  create: (data: Partial<Product>) =>
    fetchAPI<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Product>) =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// API Functions - Categories
// ============================================

export const categoriesAPI = {
  getAll: () => fetchAPI<Category[]>('/categories'),

  create: (data: Partial<Category>) =>
    fetchAPI<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Category>) =>
    fetchAPI<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// API Functions - Suppliers
// ============================================

export const suppliersAPI = {
  getAll: () => fetchAPI<Supplier[]>('/suppliers'),

  getById: (id: string) => fetchAPI<Supplier>(`/suppliers/${id}`),

  create: (data: Partial<Supplier>) =>
    fetchAPI<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Supplier>) =>
    fetchAPI<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/suppliers/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// API Functions - Stock Movements
// ============================================

export const stockMovementsAPI = {
  getAll: (params?: { product_id?: string; movement_type?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.movement_type) queryParams.append('movement_type', params.movement_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return fetchAPI<StockMovement[]>(`/stock-movements${query ? `?${query}` : ''}`);
  },

  create: (data: {
    product_id: string;
    movement_type: 'IN' | 'OUT';
    quantity: number;
    unit_cost?: number;
    reason?: string;
    reference?: string;
  }) =>
    fetchAPI<{ message: string }>('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// API Functions - Requirements
// ============================================

export const requirementsAPI = {
  getAll: (params?: { status?: string; priority?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    
    const query = queryParams.toString();
    return fetchAPI<Requirement[]>(`/requirements${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => fetchAPI<Requirement>(`/requirements/${id}`),

  create: (data: Partial<Requirement>) =>
    fetchAPI<Requirement>('/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Requirement>) =>
    fetchAPI<{ message: string }>(`/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/requirements/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// API Functions - Dashboard
// ============================================

export const dashboardAPI = {
  getStats: () => fetchAPI<DashboardStats>('/dashboard/stats'),

  getLowStockProducts: () => fetchAPI<Product[]>('/dashboard/low-stock'),

  getRecentMovements: () => fetchAPI<StockMovement[]>('/dashboard/recent-movements'),
};