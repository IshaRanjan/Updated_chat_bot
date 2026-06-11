import { Router } from "express";
import { getChildren, getNodeById } from "../services/faqService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const parentId = (req.query.parentId as string | undefined) ?? null;
    const normalizedParentId =
      parentId === "null" || parentId === "" ? null : parentId;

    const nodes = await getChildren(normalizedParentId);
    res.json({ nodes });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch nodes",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const node = await getNodeById(req.params.id);

    if (!node) {
      res.status(404).json({ error: "Node not found" });
      return;
    }

    res.json({ node });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch node",
    });
  }
});

export default router;
