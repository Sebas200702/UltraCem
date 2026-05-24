export interface StaleProductSummary {
  id: string;
  sku: string;
  name: string;
  updated_at: Date;
  price_per_bag_cop: number;
}

export interface AdminDashboardStats {
  activeProductsCount: number;
  totalCalculationsCount: number;
  staleProductsCount: number;
  staleProducts: StaleProductSummary[];
}
