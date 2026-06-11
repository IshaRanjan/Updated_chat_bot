import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

interface JsonNode {
  id: string;
  type?: string;
  label?: string;
  title?: string;
  message?: string;
  redirectUrl?: string;
  children?: JsonNode[];
}

interface KnowledgeBase {
  children: JsonNode[];
}

const idMap = new Map<string, string>();

function stableUuid(seed: string): string {
  if (!idMap.has(seed)) {
    const hash = createHash("sha256").update(`moodscale-faq-${seed}`).digest("hex");
    idMap.set(
      seed,
      `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
    );
  }
  return idMap.get(seed)!;
}

function resolveNodeType(
  parentId: string | null,
  node: JsonNode
): "category" | "subcategory" | "question" {
  const isQuestion = node.type === "faq" || !node.children?.length;
  if (isQuestion) return "question";
  if (parentId === null) return "category";
  return "subcategory";
}

type Row = {
  id: string;
  parent_id: string | null;
  node_type: "category" | "subcategory" | "question";
  title: string;
  answer: string | null;
  redirect_url: string | null;
  sort_order: number;
  is_active: boolean;
};

const rows: Row[] = [];

function walk(nodes: JsonNode[], parentId: string | null) {
  nodes.forEach((node, index) => {
    const id = stableUuid(node.id);
    const nodeType = resolveNodeType(parentId, node);
    const title = node.title || node.label || "Untitled";

    rows.push({
      id,
      parent_id: parentId,
      node_type: nodeType,
      title,
      answer: nodeType === "question" ? node.message || null : null,
      redirect_url: node.redirectUrl || null,
      sort_order: index,
      is_active: true,
    });

    if (node.children?.length) {
      walk(node.children, id);
    }
  });
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const kbPath = path.join(__dirname, "../../data/knowledge-base.json");
  const kb = JSON.parse(fs.readFileSync(kbPath, "utf8")) as KnowledgeBase;
  walk(kb.children, null);

  const supabase = createClient(url, key);

  const { error: deleteError } = await supabase
    .from("faq_nodes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("faq_nodes").insert(batch);
    if (error) {
      throw new Error(error.message);
    }
  }

  console.log(`Seeded ${rows.length} FAQ nodes into Supabase`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
