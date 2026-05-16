import { getAccessToken, isAccessTokenExpired, refreshTokens, clearTokens, saveTokens } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  if (typeof window !== "undefined" && isAccessTokenExpired()) {
    const ok = await refreshTokens();
    if (!ok) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

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

// ── Auth ───────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token);
}

export async function signup(
  email: string,
  password: string,
  fullName: string,
  orgName: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName, org_name: orgName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Signup failed" }));
    throw new Error(err.detail || "Signup failed");
  }
  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token);
}

export function logout(): void {
  clearTokens();
  window.location.href = "/login";
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity_in_stock: number;
  reorder_level: number;
  warehouse_name: string | null;
}

export interface DashboardStats {
  total_products: number;
  total_warehouses: number;
  total_suppliers: number;
  total_inventory_value: number;
  low_stock_count: number;
  low_stock_products: LowStockProduct[];
}

export interface ReorderForecastItem {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  daily_burn: number;
  days_until_reorder: number | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchJson<DashboardStats>("/api/v1/dashboard/");
}

export async function getReorderForecast(): Promise<ReorderForecastItem[]> {
  return fetchJson<ReorderForecastItem[]>("/api/v1/dashboard/reorder-forecast");
}

// ── Products ───────────────────────────────────────────────────────────────

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

export async function listProducts(
  search?: string,
  category?: ProductCategory,
  warehouse_id?: string,
  low_stock?: boolean,
) {
  const params = new URLSearchParams();
  params.set("limit", "10000");
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (warehouse_id) params.set("warehouse_id", warehouse_id);
  if (low_stock) params.set("low_stock", "true");
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

export function exportProductsUrl(): string {
  return `${API_BASE}/api/v1/products/export`;
}

export async function suggestCategory(name: string): Promise<{ category: ProductCategory; confidence: number }> {
  return fetchJson(`/api/v1/products/suggest-category`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function importProductsCsv(file: File): Promise<{ created: number; errors: { row: number; reason: string }[] }> {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const formData = new FormData();
  formData.append("file", file);
  const url = `${API_BASE}/api/v1/products/import`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  return response.json();
}

// ── Stock Movements ────────────────────────────────────────────────────────

export type MovementType = "restock" | "sale" | "adjustment" | "transfer_in" | "transfer_out";

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string | null;
  movement_type: MovementType;
  quantity_delta: number;
  note: string | null;
  created_at: string;
}

export async function listProductMovements(productId: string, limit = 50): Promise<StockMovement[]> {
  return fetchJson<StockMovement[]>(`/api/v1/products/${productId}/movements?limit=${limit}`);
}

export async function recordMovement(
  productId: string,
  data: { movement_type: MovementType; quantity_delta: number; warehouse_id?: string; note?: string },
): Promise<StockMovement> {
  return fetchJson<StockMovement>(`/api/v1/products/${productId}/movements`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function transferStock(
  productId: string,
  data: { from_warehouse_id: string; to_warehouse_id: string; quantity: number },
): Promise<StockMovement[]> {
  return fetchJson<StockMovement[]>(`/api/v1/products/${productId}/transfer`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listAllMovements(
  limit = 50,
  movement_type?: MovementType,
  warehouse_id?: string,
): Promise<StockMovement[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (movement_type) params.set("movement_type", movement_type);
  if (warehouse_id) params.set("warehouse_id", warehouse_id);
  return fetchJson<StockMovement[]>(`/api/v1/movements/?${params.toString()}`);
}

export function exportMovementsUrl(): string {
  return `${API_BASE}/api/v1/movements/export`;
}

// ── Warehouses ─────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number | null;
}

export interface WarehouseStats {
  product_count: number;
  total_units: number;
  capacity_used_pct: number | null;
}

export async function listWarehouses() {
  return fetchJson<Warehouse[]>("/api/v1/warehouses/?limit=10000");
}

export async function getWarehouse(id: string) {
  return fetchJson<Warehouse>(`/api/v1/warehouses/${id}`);
}

export async function getWarehouseStats(id: string) {
  return fetchJson<WarehouseStats>(`/api/v1/warehouses/${id}/stats`);
}

export async function getWarehouseProducts(id: string) {
  return fetchJson<Product[]>(`/api/v1/warehouses/${id}/products?limit=10000`);
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

// ── Suppliers ──────────────────────────────────────────────────────────────

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

export async function getSupplierProducts(id: string) {
  return fetchJson<Product[]>(`/api/v1/suppliers/${id}/products?limit=10000`);
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
