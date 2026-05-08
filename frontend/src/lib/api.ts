const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// Dashboard
export async function getDashboardStats() {
  const [products, lowStock, warehouses] = await Promise.all([
    fetchJson<{ id: string; unit_price: number; quantity_in_stock: number }[]>("/api/v1/products/?limit=10000"),
    fetchJson<{ id: string }[]>("/api/v1/products/low-stock?limit=10000"),
    fetchJson<{ id: string }[]>("/api/v1/warehouses/?limit=10000"),
  ]);
  const totalProducts = products.length;
  const lowStockCount = lowStock.length;
  const inventoryValue = products.reduce((sum, p) => sum + p.unit_price * p.quantity_in_stock, 0);
  const warehouseCount = warehouses.length;
  return { totalProducts, lowStockCount, inventoryValue, warehouseCount };
}

// Products
export type ProductCategory = "electronics" | "furniture" | "clothing" | "food" | "raw_materials" | "other";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category: ProductCategory;
  unit_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  warehouse_id: string | null;
  supplier_id: string | null;
}

export interface ProductDetail extends Product {
  warehouse: Warehouse | null;
  supplier: Supplier | null;
}

export async function listProducts(search?: string, category?: ProductCategory) {
  const params = new URLSearchParams();
  params.set("limit", "10000");
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  return fetchJson<Product[]>(`/api/v1/products/?${params.toString()}`);
}

export async function getProduct(id: string) {
  return fetchJson<ProductDetail>(`/api/v1/products/${id}`);
}

export async function createProduct(data: Omit<Product, "id">) {
  return fetchJson<Product>("/api/v1/products/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id">>) {
  return fetchJson<Product>(`/api/v1/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteProduct(id: string) {
  return fetchJson<void>(`/api/v1/products/${id}`, { method: "DELETE" });
}

// Warehouses
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number | null;
}

export async function listWarehouses() {
  return fetchJson<Warehouse[]>("/api/v1/warehouses/?limit=10000");
}

export async function getWarehouse(id: string) {
  return fetchJson<Warehouse>(`/api/v1/warehouses/${id}`);
}

export async function createWarehouse(data: Omit<Warehouse, "id">) {
  return fetchJson<Warehouse>("/api/v1/warehouses/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateWarehouse(id: string, data: Partial<Omit<Warehouse, "id">>) {
  return fetchJson<Warehouse>(`/api/v1/warehouses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteWarehouse(id: string) {
  return fetchJson<void>(`/api/v1/warehouses/${id}`, { method: "DELETE" });
}

// Suppliers
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export async function listSuppliers() {
  return fetchJson<Supplier[]>("/api/v1/suppliers/?limit=10000");
}

export async function getSupplier(id: string) {
  return fetchJson<Supplier>(`/api/v1/suppliers/${id}`);
}

export async function createSupplier(data: Omit<Supplier, "id">) {
  return fetchJson<Supplier>("/api/v1/suppliers/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateSupplier(id: string, data: Partial<Omit<Supplier, "id">>) {
  return fetchJson<Supplier>(`/api/v1/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteSupplier(id: string) {
  return fetchJson<void>(`/api/v1/suppliers/${id}`, { method: "DELETE" });
}
