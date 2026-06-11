"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNodes } from "@/lib/api";
import { getRedirectLabel } from "@/lib/redirectLabel";
import type { FaqNode } from "@/lib/types";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [nodes, setNodes] = useState<FaqNode[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<FaqNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentParentId = history[history.length - 1] ?? null;

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

  useEffect(() => {
    if (isOpen) {
      loadNodes(currentParentId);
    }
  }, [isOpen, currentParentId, loadNodes]);

  const openChat = () => {
    setIsOpen(true);
    setHistory([null]);
    setSelectedQuestion(null);
  };

  const closeChat = () => {
    setIsOpen(false);
    setHistory([null]);
    setSelectedQuestion(null);
    setNodes([]);
    setError(null);
  };

  const handleNodeClick = (node: FaqNode) => {
    if (node.node_type === "question") {
      setSelectedQuestion(node);
      return;
    }
    setSelectedQuestion(null);
    setHistory((prev) => [...prev, node.id]);
  };

  const handleBack = () => {
    if (selectedQuestion) {
      setSelectedQuestion(null);
      return;
    }
    if (history.length <= 1) return;
    setHistory((prev) => prev.slice(0, -1));
    setSelectedQuestion(null);
  };

  const showBack = selectedQuestion !== null || history.length > 1;
  const isRoot = history.length === 1 && !selectedQuestion;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open MoodScale Assistant"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ms-navy)] text-white shadow-lg transition hover:bg-[var(--ms-navy-dark)] hover:shadow-xl"
        >
          <ChatIcon />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[380px]">
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

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
            {isRoot && !selectedQuestion && (
              <p className="mb-4 text-sm text-slate-600">
                Welcome to MoodScale. How can we help you today?
              </p>
            )}

            {selectedQuestion && (
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
                      selectedQuestion.redirect_url
                    )}
                  </a>
                )}
              </div>
            )}

            {loading && (
              <p className="text-sm text-slate-500">Loading...</p>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {!loading && !error && nodes.length > 0 && (
              <div className="space-y-2">
                {selectedQuestion && (
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    More questions
                  </p>
                )}
                {nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleNodeClick(node)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selectedQuestion?.id === node.id
                        ? "border-[var(--ms-navy)] bg-blue-50 font-medium text-[var(--ms-navy)]"
                        : "border-slate-200 bg-white text-slate-800 hover:border-[var(--ms-navy)] hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {node.title}
                      {node.node_type !== "question" && (
                        <ChevronIcon />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!loading && !error && nodes.length === 0 && !selectedQuestion && (
              <p className="text-sm text-slate-500">No options available.</p>
            )}
          </div>

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

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
