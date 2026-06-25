"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNodes } from "@/lib/api";
import { getRedirectLabel } from "@/lib/redirectLabel";
import type { FaqNode } from "@/lib/types";

// ─── State ───────────────────────────────────────────────────────────────────
//
// history   : stack of parent IDs visited, always starts with [null]
// nodes     : children of the current parent (shown as the menu list)
// selected  : the single question node the user clicked on, or null
//
// Transitions:
//   open widget      → history=[null], selected=null, load root nodes
//   click category   → push id onto history, selected=null, load children
//   click question   → selected=node  (nodes list is hidden until Back)
//   Back (on answer) → selected=null  (sibling list reappears, no reload)
//   Back (on list)   → pop history, selected=null, load parent's children
//   close widget     → reset everything

export default function ChatWidget() {
  const [isOpen, setIsOpen]                         = useState(false);
  const [history, setHistory]                       = useState<(string | null)[]>([null]);
  const [nodes, setNodes]                           = useState<FaqNode[]>([]);
  const [selectedQuestion, setSelectedQuestion]     = useState<FaqNode | null>(null);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState<string | null>(null);

  // The parent whose children fill the current menu list
  const currentParentId = history[history.length - 1] ?? null;

  // ── Data fetching ──────────────────────────────────────────────────────────
  const loadNodes = useCallback(async (parentId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNodes(parentId);
      setNodes(data);
    } catch {
      setError("Unable to load options. Please try again.");
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the widget opens or the user navigates deeper
  useEffect(() => {
    if (isOpen && selectedQuestion === null) {
      loadNodes(currentParentId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentParentId]);

  // ── Widget lifecycle ───────────────────────────────────────────────────────
  const openChat = () => {
    setIsOpen(true);
    setHistory([null]);
    setSelectedQuestion(null);
    setNodes([]);
    setError(null);
  };

  const closeChat = () => {
    setIsOpen(false);
    setHistory([null]);
    setSelectedQuestion(null);
    setNodes([]);
    setError(null);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNodeClick = (node: FaqNode) => {
    if (node.node_type === "question") {
      // Show answer screen; do NOT reload or change history
      setSelectedQuestion(node);
      return;
    }
    // Navigate into a category / subcategory
    setSelectedQuestion(null);
    setHistory((prev) => [...prev, node.id]);
  };

  const handleBack = () => {
    if (selectedQuestion !== null) {
      // Dismiss answer → sibling list is already in `nodes`, just un-select
      setSelectedQuestion(null);
      return;
    }
    if (history.length <= 1) return;
    // Pop one level up → useEffect will reload nodes for the new parent
    setHistory((prev) => prev.slice(0, -1));
  };

  // ── Derived booleans ───────────────────────────────────────────────────────
  const isRoot   = history.length === 1 && selectedQuestion === null;
  const showBack = selectedQuestion !== null || history.length > 1;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Launcher bubble */}
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open MoodScale Assistant"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ms-navy)] text-white shadow-lg transition hover:bg-[var(--ms-navy-dark)] hover:shadow-xl"        >
          <ChatIcon />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 z-50 flex h-[70vh] max-h-[520px] w-auto max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-6 md:right-6 md:left-auto md:h-[520px] md:w-[380px] ">

          {/* Header */}
          <header className="flex items-center justify-between bg-[var(--ms-navy)] px-4 py-3 text-white">
            <div>
              <h2 className="text-sm font-semibold">MoodScale Assistant</h2>
              <p className="text-xs text-slate-200">Browse help topics</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Close chat"
              className="rounded-lg p-1 transition hover:bg-white/10"
            >
              <CloseIcon />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">

            {/* Root welcome message */}
            {isRoot && (
              <p className="mb-4 text-sm text-slate-600">
                Welcome to MoodScale. How can we help you today?
              </p>
            )}

            {/* ── QUESTION / ANSWER VIEW ── */}
            {selectedQuestion !== null && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  {selectedQuestion.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selectedQuestion.answer}
                </p>
                {selectedQuestion.redirect_url && (
                  <a
                    href={selectedQuestion.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex rounded-lg bg-[var(--ms-navy)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--ms-navy-dark)]"
                  >
                    {getRedirectLabel(
                      selectedQuestion.title,
                      selectedQuestion.redirect_url,
                    )}
                  </a>
                )}
              </div>
            )}

            {/* ── NODE LIST VIEW (hidden while a question is selected) ── */}
            {selectedQuestion === null && (
              <>
                {loading && (
                  <p className="text-sm text-slate-500">Loading…</p>
                )}

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {!loading && !error && nodes.length > 0 && (
                  <div className="space-y-2">
                    {nodes.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => handleNodeClick(node)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 transition hover:border-[var(--ms-navy)] hover:bg-slate-50"
                      >
                        <span className="flex items-center justify-between gap-2">
                          {node.title}
                          {node.node_type !== "question" && <ChevronIcon />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {!loading && !error && nodes.length === 0 && (
                  <p className="text-sm text-slate-500">No options available.</p>
                )}
              </>
            )}
          </div>

          {/* Footer — Back button */}
          {showBack && (
            <footer className="border-t border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <BackIcon />
                Back
              </button>
            </footer>
          )}
        </div>
      )}
    </>
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}