export type NodeType = "category" | "subcategory" | "question";

export interface FaqNode {
  id: string;
  parent_id: string | null;
  node_type: NodeType;
  title: string;
  answer: string | null;
  redirect_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
