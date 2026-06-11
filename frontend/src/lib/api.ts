import type { FaqNode, NodesResponse } from "./types";

export async function fetchNodes(parentId: string | null): Promise<FaqNode[]> {
  const query = parentId ? `?parentId=${parentId}` : "";
  const res = await fetch(`/api/nodes${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load FAQ nodes");
  }

  const data = (await res.json()) as NodesResponse;
  return data.nodes;
}

export async function fetchNode(id: string): Promise<FaqNode> {
  const res = await fetch(`/api/nodes/${id}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to load FAQ node");
  }

  const data = (await res.json()) as { node: FaqNode };
  return data.node;
}
