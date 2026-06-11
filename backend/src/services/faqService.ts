import { supabase } from "../lib/supabase";
import type { FaqNode } from "../types/faq";

export async function getChildren(parentId: string | null): Promise<FaqNode[]> {
  let query = supabase
    .from("faq_nodes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (parentId === null) {
    query = query.is("parent_id", null);
  } else {
    query = query.eq("parent_id", parentId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FaqNode[];
}

export async function getNodeById(id: string): Promise<FaqNode | null> {
  const { data, error } = await supabase
    .from("faq_nodes")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as FaqNode | null) ?? null;
}
