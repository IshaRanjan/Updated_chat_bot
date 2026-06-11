import fs from "fs";
import path from "path";
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

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
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

const rows: string[] = [];

function walk(nodes: JsonNode[], parentId: string | null) {
  nodes.forEach((node, index) => {
    const id = stableUuid(node.id);
    const nodeType = resolveNodeType(parentId, node);
    const title = node.title || node.label || "Untitled";
    const answer = nodeType === "question" ? node.message || null : null;
    const redirectUrl = node.redirectUrl || null;
    const parentSql = parentId ? `'${parentId}'` : "null";

    rows.push(
      `('${id}', ${parentSql}, '${nodeType}', '${escapeSql(title)}', ${
        answer ? `'${escapeSql(answer)}'` : "null"
      }, ${redirectUrl ? `'${escapeSql(redirectUrl)}'` : "null"}, ${index}, true)`
    );

    if (node.children?.length) {
      walk(node.children, id);
    }
  });
}

const kbPath = path.join(__dirname, "../../data/knowledge-base.json");
const kb = JSON.parse(fs.readFileSync(kbPath, "utf8")) as KnowledgeBase;

walk(kb.children, null);

const sql = `-- Auto-generated from data/knowledge-base.json
-- Run after schema.sql

truncate table faq_nodes cascade;

insert into faq_nodes (id, parent_id, node_type, title, answer, redirect_url, sort_order, is_active)
values
${rows.join(",\n")};
`;

const outPath = path.join(__dirname, "../../supabase/seed.sql");
fs.writeFileSync(outPath, sql);
console.log(`Generated ${rows.length} rows -> ${outPath}`);
