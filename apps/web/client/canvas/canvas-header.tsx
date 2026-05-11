"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Grid3x3,
  Magnet,
  Maximize,
  Copy,
  Download,
  ChevronRight,
  ChevronLeft,
  Check,
  Trash2,
  FileImage,
  FileText,
  FileJson,
  MoreHorizontal,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  zoomIn,
  zoomOut,
  setCanvasName,
  selectCanvasName,
  selectGridVisible,
  selectSnapToGrid,
  toggleGrid,
  toggleSnapToGrid,
  resetViewport,
  addToast,
} from "@/redux/slice/ui/ui-slice";
import {
  getGuestIdentity,
  addGuestCanvas,
  removeGuestCanvas,
  type GuestIdentity,
} from "@/lib/guest";
import { getInitials } from "@/lib/random-name";
import {
  getCanvas,
  renameCanvas,
  createCanvas,
  saveCanvas,
  deleteCanvas,
} from "@/lib/api";
import {
  exportJson,
  exportPng,
  exportJpeg,
  exportPdf,
} from "@/lib/canvas-export";
import { useCanvasWsContext } from "./canvas-ws-context";
import { useCanvasExportContext } from "./canvas-export-context";
import { useYjsCanvas } from "./use-yjs";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Canvas-mode header — minimal overlay that sits on top of the canvas.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const IconBtn = ({
  children,
  label,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`group relative flex items-center justify-center
                w-9 h-9 rounded-xl
                text-on-surface-variant hover:text-on-surface
                hover:bg-white/[0.06] transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
                ${className}`}
  >
    {children}
    <span
      className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                  px-2 py-1 text-[11px] font-medium tracking-wide
                  bg-surface-container-highest text-on-surface
                  rounded-md shadow-lg whitespace-nowrap
                  opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-150"
    >
      {label}
    </span>
  </button>
);

/* ── Zoom controls ── */
const ZoomControls = () => {
  const dispatch = useAppDispatch();
  const scale = useAppSelector((s) => s.ui.viewport.scale);

  return (
    <div
      className="flex items-center gap-0.5 px-1 py-0.5
                  bg-surface-container/70 backdrop-blur-[16px]
                  border border-white/[0.06] rounded-xl"
    >
      <button
        onClick={() => dispatch(zoomOut())}
        title="Zoom out"
        className="flex items-center justify-center w-7 h-7 rounded-lg
                   text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                   transition-all duration-150 text-sm"
      >
        −
      </button>
      <span className="w-12 text-center text-[12px] font-medium tracking-wide text-on-surface-variant tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => dispatch(zoomIn())}
        title="Zoom in"
        className="flex items-center justify-center w-7 h-7 rounded-lg
                   text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                   transition-all duration-150 text-sm"
      >
        +
      </button>
    </div>
  );
};

/* ── Share modal ── */
const ShareModal = ({ canvasId, onClose }: { canvasId: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Safe: ShareModal only mounts after `mounted` is true (client-only)
  const shareUrl = useMemo(
    () => `${window.location.origin}/canvas/${canvasId}`,
    [canvasId],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      inputRef.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,13,31,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(180deg,#191f31 0%,#151b2d 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(176,198,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg
                     text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                     transition-all duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
               style={{ background: "rgba(86,141,255,0.15)", border: "1px solid rgba(86,141,255,0.25)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0c6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-on-surface tracking-tight">Share this canvas</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Anyone with the link can join and collaborate in real time.</p>
          </div>
        </div>

        <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Link row */}
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
          Shareable link
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            readOnly
            value={shareUrl}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl text-[12px] font-mono text-on-surface-variant
                       outline-none select-all cursor-text"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                       transition-all duration-150 active:scale-[0.97]"
            style={
              copied
                ? { background: "rgba(125,211,164,0.18)", color: "#7dd3a4", border: "1px solid rgba(125,211,164,0.3)" }
                : { background: "rgba(176,198,255,0.12)", color: "#b0c6ff", border: "1px solid rgba(176,198,255,0.2)" }
            }
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy link
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-[11.5px] text-on-surface-variant" style={{ color: "rgba(194,198,216,0.5)" }}>
          No account required to join — guests enter with a randomly assigned name and color.
        </p>
      </div>
    </div>
  );
};

/* ── More-options menu ── */
type ExportKind = "png" | "jpeg" | "pdf" | "json";

const HeaderMenu = ({
  canvasId,
  canvasName,
  onRename,
}: {
  canvasId: string;
  canvasName: string | null;
  onRename: () => void;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const gridVisible = useAppSelector(selectGridVisible);
  const snapToGrid = useAppSelector(selectSnapToGrid);
  const { shapes: yjsShapes, connections: yjsConnections } = useYjsCanvas();
  const { stageRef } = useCanvasExportContext();

  const [open, setOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeAll = useCallback(() => {
    setOpen(false);
    setExportOpen(false);
    setDeleteConfirm(false);
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeAll]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeAll]);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  const displayName = canvasName ?? "Untitled";
  const getShapesArr = () => Array.from(yjsShapes.values());
  const getConnsArr = () => Array.from(yjsConnections.values());

  const handleRename = () => {
    closeAll();
    onRename();
  };

  const handleResetZoom = () => {
    dispatch(resetViewport());
    closeAll();
  };

  const handleExport = (kind: ExportKind) => {
    if (kind === "json") {
      exportJson(displayName, getShapesArr(), getConnsArr());
      closeAll();
      return;
    }
    const stage = stageRef.current;
    if (!stage) {
      dispatch(addToast({ message: "Canvas not ready yet", type: "error" }));
      closeAll();
      return;
    }
    const shapes = getShapesArr();
    if (shapes.length === 0) {
      dispatch(addToast({ message: "Canvas is empty — nothing to export", type: "warning" }));
      closeAll();
      return;
    }
    if (kind === "png") exportPng(stage, shapes, displayName);
    else if (kind === "jpeg") exportJpeg(stage, shapes, displayName);
    else void exportPdf(stage, shapes, displayName);
    closeAll();
  };

  const handleDuplicate = async () => {
    closeAll();
    try {
      const newName = `${displayName} (copy)`;
      const created = await createCanvas(newName);
      await saveCanvas(created.id, {
        name: newName,
        shapes: getShapesArr(),
        connections: getConnsArr(),
      });
      addGuestCanvas(created.id);
      router.push(`/canvas/${created.id}`);
    } catch {
      dispatch(addToast({ message: "Couldn't duplicate canvas", type: "error" }));
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteTimerRef.current = setTimeout(() => setDeleteConfirm(false), 5000);
  };

  const handleConfirmDelete = async () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    try {
      await deleteCanvas(canvasId);
      removeGuestCanvas(canvasId);
      router.push("/dashboard");
    } catch {
      dispatch(addToast({ message: "Couldn't delete canvas", type: "error" }));
      setDeleteConfirm(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="More options"
        className="group relative flex items-center justify-center
                    w-9 h-9 rounded-xl
                    text-on-surface-variant hover:text-on-surface
                    hover:bg-white/[0.06] transition-all duration-150"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-60 p-1.5
                     bg-surface-container/90 backdrop-blur-[24px]
                     border border-white/[0.07] rounded-xl
                     shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]
                     text-[13px] text-on-surface"
        >
          {deleteConfirm ? (
            <div className="p-2 space-y-2">
              <div className="px-1.5 text-[12px] text-on-surface-variant">
                Delete this canvas?
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    if (deleteTimerRef.current) {
                      clearTimeout(deleteTimerRef.current);
                      deleteTimerRef.current = null;
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
                             bg-white/[0.06] hover:bg-white/[0.1] transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold
                             bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-150"
                >
                  Confirm delete
                </button>
              </div>
            </div>
          ) : exportOpen ? (
            <>
              <button
                onClick={() => setExportOpen(false)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                           text-on-surface-variant hover:text-on-surface
                           hover:bg-white/[0.06] transition-all duration-150"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
              <div className="my-1 mx-1 h-px bg-white/[0.06]" />
              <MenuItem icon={<FileImage size={14} />} onClick={() => handleExport("png")}>
                PNG
              </MenuItem>
              <MenuItem icon={<FileImage size={14} />} onClick={() => handleExport("jpeg")}>
                JPEG
              </MenuItem>
              <MenuItem icon={<FileText size={14} />} onClick={() => handleExport("pdf")}>
                PDF
              </MenuItem>
              <MenuItem icon={<FileJson size={14} />} onClick={() => handleExport("json")}>
                JSON
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem icon={<Pencil size={14} />} onClick={handleRename}>
                Rename canvas
              </MenuItem>
              <div className="my-1 mx-1 h-px bg-white/[0.06]" />
              <MenuItem
                icon={<Grid3x3 size={14} />}
                onClick={() => dispatch(toggleGrid())}
                trailing={gridVisible ? <Check size={14} className="text-primary" /> : null}
              >
                Show grid
              </MenuItem>
              <MenuItem
                icon={<Magnet size={14} />}
                onClick={() => dispatch(toggleSnapToGrid())}
                trailing={snapToGrid ? <Check size={14} className="text-primary" /> : null}
              >
                Snap to grid
              </MenuItem>
              <MenuItem icon={<Maximize size={14} />} onClick={handleResetZoom}>
                Reset zoom & pan
              </MenuItem>
              <div className="my-1 mx-1 h-px bg-white/[0.06]" />
              <MenuItem icon={<Copy size={14} />} onClick={handleDuplicate}>
                Duplicate canvas
              </MenuItem>
              <MenuItem
                icon={<Download size={14} />}
                onClick={() => setExportOpen(true)}
                trailing={<ChevronRight size={14} className="text-on-surface-variant/60" />}
              >
                Export
              </MenuItem>
              <div className="my-1 mx-1 h-px bg-white/[0.06]" />
              <MenuItem
                icon={<Trash2 size={14} />}
                onClick={handleDeleteClick}
                variant="danger"
              >
                Delete canvas
              </MenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const MenuItem = ({
  icon,
  trailing,
  onClick,
  children,
  variant = "default",
}: {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger";
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                transition-all duration-150 text-left
                ${
                  variant === "danger"
                    ? "text-red-300 hover:bg-red-500/15"
                    : "text-on-surface hover:bg-white/[0.06]"
                }`}
  >
    {icon ? (
      <span
        className={
          variant === "danger" ? "text-red-300/80" : "text-on-surface-variant"
        }
      >
        {icon}
      </span>
    ) : (
      <span className="w-[14px]" />
    )}
    <span className="flex-1 text-[12.5px]">{children}</span>
    {trailing}
  </button>
);

const subscribeIdentity = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === null || (typeof e.key === "string" && e.key.startsWith("canvus.guest"))) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

/* ── Main canvas header ── */
const CanvasHeader = ({ canvasId }: { canvasId: string }) => {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const identity = useSyncExternalStore<GuestIdentity | null>(
    subscribeIdentity,
    () => getGuestIdentity(),
    () => null,
  );
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const canvasName = useAppSelector(selectCanvasName);
  const { subscribe } = useCanvasWsContext();

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    addGuestCanvas(canvasId);
  }, [canvasId]);

  // Fetch canvas name on mount
  useEffect(() => {
    let cancelled = false;
    getCanvas(canvasId)
      .then((c) => {
        if (!cancelled) dispatch(setCanvasName(c.name));
      })
      .catch(() => {
        if (!cancelled) dispatch(setCanvasName("Untitled"));
      });
    return () => {
      cancelled = true;
    };
  }, [canvasId, dispatch]);

  // Listen for remote rename broadcasts
  useEffect(() => {
    return subscribe((envelope) => {
      if (envelope.type === "canvas:renamed") {
        const p = envelope.payload as { id: string; name: string };
        if (p?.id === canvasId && typeof p.name === "string") {
          dispatch(setCanvasName(p.name));
        }
      }
    });
  }, [subscribe, canvasId, dispatch]);

  const beginRename = useCallback(() => {
    setNameDraft(canvasName ?? "");
    setEditingName(true);
  }, [canvasName]);

  const cancelRename = useCallback(() => {
    setEditingName(false);
  }, []);

  const commitRename = useCallback(async () => {
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (!trimmed || trimmed === canvasName) return;
    const previous = canvasName;
    dispatch(setCanvasName(trimmed));
    try {
      await renameCanvas(canvasId, trimmed);
    } catch {
      dispatch(setCanvasName(previous ?? "Untitled"));
      dispatch(addToast({ message: "Couldn't rename canvas", type: "error" }));
    }
  }, [canvasId, canvasName, nameDraft, dispatch]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const { undoManager, canUndo: canUndoYjs, canRedo: canRedoYjs } = useYjsCanvas();

  // Gate on `mounted` to keep SSR markup consistent with the first client paint
  const canUndo = mounted && canUndoYjs;
  const canRedo = mounted && canRedoYjs;

  return (
  <>
    <div className="absolute top-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-3 mt-3 flex items-center justify-between pointer-events-auto">
        {/* ── Left cluster ── */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5
                      bg-surface-container/70 backdrop-blur-[24px]
                      border border-white/[0.07] rounded-2xl
                      shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       hover:bg-white/[0.06] transition-colors duration-150"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-on-surface-variant"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="w-px h-5 bg-white/[0.08]" />

          {/* Project name */}
          <div className="flex items-center gap-2 px-2">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded bg-primary-container/80 rotate-6 scale-90" />
              <div className="absolute inset-0 rounded bg-gradient-to-br from-primary-container to-primary" />
            </div>
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    nameInputRef.current?.blur();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
                maxLength={120}
                className="text-[13px] font-semibold text-on-surface tracking-tight
                           bg-white/[0.06] outline-none rounded px-1.5 py-0.5
                           border border-white/[0.1] focus:border-primary/60
                           min-w-[140px] max-w-[280px]"
              />
            ) : (
              <span
                onDoubleClick={beginRename}
                title="Double-click to rename"
                className="text-[13px] font-semibold text-on-surface tracking-tight cursor-text select-none"
              >
                {canvasName ?? "Untitled project"}
              </span>
            )}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-on-surface-variant/50"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ── Center: zoom ── */}
        <ZoomControls />

        {/* ── Right cluster ── */}
        <div
          className="flex items-center gap-1 px-2 py-1.5
                      bg-surface-container/70 backdrop-blur-[24px]
                      border border-white/[0.07] rounded-2xl
                      shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          {/* Undo / Redo */}
          <IconBtn label="Undo (Ctrl+Z)" onClick={() => undoManager.undo()} disabled={!canUndo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.96" />
            </svg>
          </IconBtn>
          <IconBtn label="Redo (Ctrl+Shift+Z)" onClick={() => undoManager.redo()} disabled={!canRedo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-.49-3.96" />
            </svg>
          </IconBtn>

          <div className="w-px h-5 bg-white/[0.08] mx-0.5" />

          {/* Collaborators indicator */}
          <div className="flex items-center -space-x-1.5 mx-1">
            <div
              className="group relative w-7 h-7 rounded-full ring-2 ring-surface-container
                         flex items-center justify-center text-[10px] font-bold text-on-primary"
              style={{
                background: identity?.color ?? "linear-gradient(135deg,#568dff,#b0c6ff)",
              }}
            >
              {identity ? getInitials(identity.name) : ""}
              <span
                className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                           px-2 py-1 text-[11px] font-medium tracking-wide
                           bg-surface-container-highest text-on-surface
                           rounded-md shadow-lg whitespace-nowrap
                           opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                           transition-all duration-150"
              >
                {identity?.name ?? "Guest"}
              </span>
            </div>
          </div>

          <div className="w-px h-5 bg-white/[0.08] mx-0.5" />

          {/* Share button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5
                       bg-primary-container text-on-primary
                       text-[12px] font-semibold tracking-wide
                       rounded-xl
                       hover:brightness-110 hover:shadow-[0_0_16px_rgba(86,141,255,0.3)]
                       active:scale-[0.97] transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v13" />
            </svg>
            Share
          </button>

          {/* More menu */}
          <HeaderMenu
            canvasId={canvasId}
            canvasName={canvasName}
            onRename={beginRename}
          />
        </div>
      </div>
    </div>

    {mounted && shareOpen && (
      <ShareModal canvasId={canvasId} onClose={() => setShareOpen(false)} />
    )}
  </>
  );
};

export default CanvasHeader;
