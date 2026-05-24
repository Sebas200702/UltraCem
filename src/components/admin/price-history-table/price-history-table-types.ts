export interface PriceHistoryEntry {
  id: string;
  old_price: number | null;
  new_price: number;
  changed_by: string | null;
  created_at: string;
}

export interface PriceHistoryTableProps {
  data: PriceHistoryEntry[];
  isLoading?: boolean;
}
