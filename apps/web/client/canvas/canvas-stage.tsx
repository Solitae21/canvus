"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Stage, Layer, Transformer, Group, Rect, Arrow } from "react-konva";
import type Konva from "konva";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectShape,
  setTool,
  addConnection,
  setPendingFromId,
  selectConnection,
  setMultiSelection,
  updateConnection,
  setShapes,
  type Shape,
  type ShapeType,
  type ConnectionPort,
} from "@/redux/slice/canvas/canvas-slice";
import { setPanel, setViewport, panViewport } from "@/redux/slice/ui/ui-slice";

import { useCanvasKeyboard } from "./use-canvas-keyboard";
import { useYjs } from "./use-yjs";
import {
  defaultsFor,
  isPlaceable,
  newId,
  GRID_OFFSET,
  GRID_SIZE,
  type PlaceableShapeType,
} from "./canvas-defaults";
import CanvasShape, { CanvasShapeLabel } from "./canvas-shape";
import CanvasImageShape from "./canvas-image-shape";
import CanvasConnection from "./canvas-connection";
import {
  buildOrthogonalPoints,
  buildOrthogonalPointsToPos,
  getPathMidpoint,
} from "./canvas-connection";
import CanvasLabelEditor from "./canvas-label-editor";
import CanvasConnectionLabelEditor from "./canvas-connection-label-editor";
import CanvasShapeConnectors from "./canvas-shape-connectors";
import ShapePickerPopup from "./shape-picker-popup";

export interface CanvasStageProps {
  className?: string;
}

const CanvasStage = ({ className }: CanvasStageProps) => {
  const dispatch = useAppDispatch();

  const { doc, shapes: yjsShapes } = useYjs("default");
  const yjsShapesRef = useRef(yjsShapes);
  yjsShapesRef.current = yjsShapes;
  useEffect(() => {
    const handler = () => {
      dispatch(setShapes(Array.from(yjsShapes.values())));
    };
    yjsShapes.observe(handler);
    return () => yjsShapes.unobserve(handler);
  }, [dispatch, yjsShapes]);

  useCanvasKeyboard(yjsShapes);
  const shapes = useAppSelector((s) => s.canvas.shapes);
  const connections = useAppSelector((s) => s.canvas.connections);
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const selectedConnectionId = useAppSelector((s) => s.canvas.selectedConnectionId);
  const selectedIds = useAppSelector((s) => s.canvas.selectedIds);
  const selectedConnectionIds = useAppSelector((s) => s.canvas.selectedConnectionIds);
  const tool = useAppSelector((s) => s.canvas.tool);
  const pendingFromId = useAppSelector((s) => s.canvas.pendingFromId);
  const viewport = useAppSelector((s) => s.ui.viewport);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [draggingTip, setDraggingTip] = useState<{
    connId: string;
    pos: { x: number; y: number };
  } | null>(null);
  const [tipDragTargetId, setTipDragTargetId] = useState<string | null>(null);
  const tipDragTargetIdRef = useRef<string | null>(null);
  tipDragTargetIdRef.current = tipDragTargetId;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingFromPort, setPendingFromPort] = useState<ConnectionPort | null>(null);
  const [connectorDrag, setConnectorDrag] = useState<{
    fromId: string;
    fromPort: ConnectionPort;
    pos: { x: number; y: number };
  } | null>(null);
  const [draggingPositions, setDraggingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [connectorDragTargetId, setConnectorDragTargetId] = useState<string | null>(null);
  const [shapePickerPopup, setShapePickerPopup] = useState<{
    fromId: string;
    fromPort: ConnectionPort;
    pos: { x: number; y: number };
    relX: number;
    relY: number;
  } | null>(null);

  // Rubber-band selection
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const selectionRectRef = useRef(selectionRect);
  selectionRectRef.current = selectionRect;
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const didRubberBandRef = useRef(false);

  // Group drag
  const groupDragStartRef = useRef<Map<string, { x: number; y: number }> | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shapeRefs = useRef<Map<string, Konva.Group>>(new Map());
  const transformerRef = useRef<Konva.Transformer>(null);
  const prevScaleRef = useRef(viewport.scale);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs for selectors used in closures
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  // Middle-mouse-button pan state
  const isMMBPanningRef = useRef(false);
  const mmbLastPosRef = useRef({ x: 0, y: 0 });

  // Size the Stage to its container — works in fullscreen pages, sidebars, modals, etc.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () =>
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const el = new window.Image();
      el.onload = () => {
        const maxW = 600;
        const scale = el.naturalWidth > maxW ? maxW / el.naturalWidth : 1;
        const w = Math.round(el.naturalWidth * scale);
        const h = Math.round(el.naturalHeight * scale);
        const { x, y, scale: vScale } = viewportRef.current;
        const cx = (stageSize.width / 2 - x) / vScale;
        const cy = (stageSize.height / 2 - y) / vScale;
        const imageId = newId();
        yjsShapesRef.current.set(imageId, {
          id: imageId,
          type: "image",
          x: cx - w / 2,
          y: cy - h / 2,
          w,
          h,
          label: "",
          fill: "transparent",
          strokeColor: "transparent",
          src,
        });
        dispatch(setTool("select"));
      };
      el.src = src;
    };
    reader.readAsDataURL(file);
  }, [dispatch, stageSize]);

  // Open file picker when image tool is activated
  useEffect(() => {
    if (tool === "image") {
      fileInputRef.current?.click();
    }
  }, [tool]);

  // Clipboard paste — place any pasted image on canvas
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleImageFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleImageFile]);

  // Wheel: Ctrl+Wheel = zoom centered on cursor, plain/Shift+Wheel = pan
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y, scale } = viewportRef.current;

      if (e.ctrlKey || e.metaKey) {
        // Zoom anchored to cursor position
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - x) / scale;
        const worldY = (mouseY - y) / scale;
        const newScale = Math.min(4, Math.max(0.1, scale * factor));
        const newX = mouseX - worldX * newScale;
        const newY = mouseY - worldY * newScale;
        // Prevent the "keep screen-center stable" effect from overriding our cursor-anchored zoom
        prevScaleRef.current = newScale;
        dispatch(setViewport({ x: newX, y: newY, scale: newScale }));
        // sync background grid
        if (wrapperRef.current) {
          const off = GRID_OFFSET * newScale;
          wrapperRef.current.style.backgroundPosition = `${newX + off}px ${newY + off}px`;
          wrapperRef.current.style.backgroundSize = `${GRID_SIZE * newScale}px ${GRID_SIZE * newScale}px`;
        }
      } else {
        // Pan (Shift+Wheel = horizontal, plain = vertical)
        const dx = e.shiftKey ? -e.deltaY : -e.deltaX;
        const dy = e.shiftKey ? 0 : -e.deltaY;
        dispatch(panViewport({ dx, dy }));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dispatch]);

  // When scale changes (via header zoom buttons), keep the screen-center stable
  // by adjusting viewport translation around the previous scale.
  useEffect(() => {
    const prev = prevScaleRef.current;
    const next = viewport.scale;
    if (prev === next) return;
    if (stageSize.width === 0 || stageSize.height === 0) {
      prevScaleRef.current = next;
      return;
    }
    const { x: px, y: py } = viewportRef.current;
    const cx = stageSize.width / 2;
    const cy = stageSize.height / 2;
    const worldX = (cx - px) / prev;
    const worldY = (cy - py) / prev;
    prevScaleRef.current = next;
    dispatch(
      setViewport({
        x: cx - worldX * next,
        y: cy - worldY * next,
        scale: next,
      }),
    );
  }, [viewport.scale, stageSize.width, stageSize.height, dispatch]);

  // Attach transformer to all selected shape nodes
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const nodes: Konva.Node[] = [];
    if (selectedId) {
      const node = shapeRefs.current.get(selectedId);
      if (node) nodes.push(node);
    }
    for (const id of selectedIds) {
      const node = shapeRefs.current.get(id);
      if (node) nodes.push(node);
    }
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedId, selectedIds, shapes]);

  const shapeMap = useMemo(() => {
    const m = new Map<string, Shape>();
    for (const s of shapes) m.set(s.id, s);
    return m;
  }, [shapes]);

  const liveShapeMap = useMemo(() => {
    if (draggingPositions.size === 0) return shapeMap;
    const live = new Map(shapeMap);
    for (const [id, pos] of draggingPositions) {
      const s = live.get(id);
      if (s) live.set(id, { ...s, ...pos });
    }
    return live;
  }, [shapeMap, draggingPositions]);

  const editingShape = editingId ? shapeMap.get(editingId) ?? null : null;

  const placeShape = (type: PlaceableShapeType, x: number, y: number) => {
    const defs = defaultsFor(type);
    const id = newId();
    yjsShapes.set(id, {
      id,
      type,
      x: x - defs.w / 2,
      y: y - defs.h / 2,
      w: defs.w,
      h: defs.h,
      label: defs.label,
      fill: defs.fill,
      strokeColor: defs.strokeColor,
    });
    dispatch(setTool("select"));
  };

  const handleShapeClick = (
    shape: Shape,
    e: Konva.KonvaEventObject<MouseEvent>,
  ) => {
    e.cancelBubble = true;
    if (tool === "hand") return;

    if (tool === "arrow") {
      if (pendingFromId == null) {
        dispatch(setPendingFromId(shape.id));
      } else if (pendingFromId !== shape.id) {
        dispatch(
          addConnection({
            id: newId(),
            fromId: pendingFromId,
            toId: shape.id,
            ...(pendingFromPort ? { fromPort: pendingFromPort } : {}),
          }),
        );
        dispatch(setPendingFromId(null));
        dispatch(setTool("select"));
      }
      return;
    }

    if (tool === "select") {
      if (e.evt.shiftKey) {
        // Combine selectedId + selectedIds into one array, then toggle this shape
        const all = [...(selectedId ? [selectedId] : []), ...selectedIds];
        const next = all.includes(shape.id)
          ? all.filter((id) => id !== shape.id)
          : [...all, shape.id];
        dispatch(setMultiSelection({ shapeIds: next, connectionIds: selectedConnectionIds }));
      } else {
        dispatch(selectShape(shape.id));
        dispatch(setPanel({ panel: "right", open: true }));
      }
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Skip deselect if this click was the end of a rubber-band drag
    if (didRubberBandRef.current) {
      didRubberBandRef.current = false;
      return;
    }

    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    if (tool === "hand") return;

    const pointer = stage.getRelativePointerPosition();
    if (!pointer) return;

    if (tool === "image") return;

    if (isPlaceable(tool)) {
      placeShape(tool, pointer.x, pointer.y);
      return;
    }

    if (tool === "arrow") {
      if (pendingFromId) dispatch(setPendingFromId(null));
      return;
    }

    dispatch(selectShape(null));
    dispatch(setPanel({ panel: "right", open: false }));
  };

  // ── Rubber-band selection ──────────────────────────────────────────────────

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== "select") return;
    if (e.evt.button !== 0) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    // Don't start rubber-band when the click lands on a user shape
    const hitShape = shapesRef.current.find(
      (s) => pos.x >= s.x && pos.x <= s.x + s.w && pos.y >= s.y && pos.y <= s.y + s.h,
    );
    if (hitShape) return;
    selectionStartRef.current = pos;
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!selectionStartRef.current) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const domRect = wrapper.getBoundingClientRect();
    const screenX = e.clientX - domRect.left;
    const screenY = e.clientY - domRect.top;
    const vp = viewportRef.current;
    const worldX = (screenX - vp.x) / vp.scale;
    const worldY = (screenY - vp.y) / vp.scale;
    const start = selectionStartRef.current;
    const x = Math.min(worldX, start.x);
    const y = Math.min(worldY, start.y);
    const w = Math.abs(worldX - start.x);
    const h = Math.abs(worldY - start.y);
    if (w > 3 || h > 3) {
      setSelectionRect({ x, y, w, h });
    }
  }, []);

  const handleStageMouseUp = useCallback(() => {
    const rect = selectionRectRef.current;
    if (selectionStartRef.current && rect && (rect.w > 3 || rect.h > 3)) {
      const selectedShapeIds = shapesRef.current
        .filter(
          (s) =>
            s.x < rect.x + rect.w &&
            s.x + s.w > rect.x &&
            s.y < rect.y + rect.h &&
            s.y + s.h > rect.y,
        )
        .map((s) => s.id);

      const selectedShapeIdSet = new Set(selectedShapeIds);
      const selectedConnIds = connections
        .filter((c) => selectedShapeIdSet.has(c.fromId) && selectedShapeIdSet.has(c.toId))
        .map((c) => c.id);

      dispatch(setMultiSelection({ shapeIds: selectedShapeIds, connectionIds: selectedConnIds }));
      didRubberBandRef.current = true;
    }
    selectionStartRef.current = null;
    setSelectionRect(null);
  }, [connections, dispatch]);

  // Global listeners catch events outside the Konva canvas during rubber-band
  useEffect(() => {
    window.addEventListener("mouseup", handleStageMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleStageMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [handleStageMouseUp, handleGlobalMouseMove]);

  // ── Shape drag (single and group) ─────────────────────────────────────────

  const handleShapeDragStart = useCallback(
    (shape: Shape) => {
      if (selectedIdsRef.current.includes(shape.id)) {
        // Record initial world positions of all shapes in the multi-select group
        const starts = new Map<string, { x: number; y: number }>();
        for (const id of selectedIdsRef.current) {
          const s = shapesRef.current.find((sh) => sh.id === id);
          if (s) starts.set(id, { x: s.x, y: s.y });
        }
        groupDragStartRef.current = starts;
      } else {
        groupDragStartRef.current = null;
      }
    },
    [],
  );

  const handleShapeDragMove = useCallback(
    (shape: Shape, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const groupStart = groupDragStartRef.current;
      if (groupStart && selectedIdsRef.current.includes(shape.id)) {
        const startPos = groupStart.get(shape.id);
        if (!startPos) return;
        const dx = node.x() - startPos.x;
        const dy = node.y() - startPos.y;
        setDraggingPositions(() => {
          const next = new Map<string, { x: number; y: number }>();
          for (const [id, start] of groupStart) {
            next.set(id, { x: start.x + dx, y: start.y + dy });
          }
          return next;
        });
      } else {
        setDraggingPositions((prev) => new Map(prev).set(shape.id, { x: node.x(), y: node.y() }));
      }
    },
    [],
  );

  const handleShapeDragEnd = useCallback(
    (shape: Shape, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const groupStart = groupDragStartRef.current;
      if (groupStart && selectedIdsRef.current.includes(shape.id)) {
        const startPos = groupStart.get(shape.id)!;
        const dx = node.x() - startPos.x;
        const dy = node.y() - startPos.y;
        const updates = [...groupStart.entries()].map(([id, start]) => ({
          id,
          x: start.x + dx,
          y: start.y + dy,
        }));
        setDraggingPositions((prev) => {
          const next = new Map(prev);
          for (const id of groupStart.keys()) next.delete(id);
          return next;
        });
        groupDragStartRef.current = null;
        const yjs = yjsShapesRef.current;
        doc.transact(() => {
          for (const { id, x, y } of updates) {
            const existing = yjs.get(id) ?? shapesRef.current.find(s => s.id === id);
            if (existing) yjs.set(id, { ...existing, x, y });
          }
        });
      } else {
        setDraggingPositions((prev) => {
          const next = new Map(prev);
          next.delete(shape.id);
          return next;
        });
        const yjs = yjsShapesRef.current;
        const existing = yjs.get(shape.id) ?? shapesRef.current.find(s => s.id === shape.id);
        if (existing) yjs.set(shape.id, { ...existing, x: node.x(), y: node.y() });
      }
    },
    [dispatch, doc],
  );

  const handleStageDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (tool !== "hand") return;
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    if (wrapperRef.current) {
      const off = GRID_OFFSET * viewport.scale;
      wrapperRef.current.style.backgroundPosition = `${stage.x() + off}px ${stage.y() + off}px`;
    }
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (tool !== "hand") return;
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    dispatch(
      setViewport({
        x: stage.x(),
        y: stage.y(),
        scale: viewport.scale,
      }),
    );
  };

  // Clear pendingFromPort whenever the Redux pending connection is cancelled
  useEffect(() => {
    if (pendingFromId === null) setPendingFromPort(null);
  }, [pendingFromId]);

  const handleShapeMouseEnter = useCallback((shapeId: string) => {
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
    setHoveredId(shapeId);
  }, []);

  const handleShapeMouseLeave = useCallback(() => {
    hoverLeaveTimerRef.current = setTimeout(() => setHoveredId(null), 60);
  }, []);

  const handlePortClick = useCallback((shapeId: string, port: ConnectionPort) => {
    dispatch(setPendingFromId(shapeId));
    setPendingFromPort(port);
    dispatch(setTool("arrow"));
  }, [dispatch]);

  const getShapeAtPoint = useCallback((pos: { x: number; y: number }, sourceId: string) => (
    shapes.find(
      (s) =>
        s.id !== sourceId &&
        pos.x >= s.x && pos.x <= s.x + s.w &&
        pos.y >= s.y && pos.y <= s.y + s.h,
    ) ?? null
  ), [shapes]);

  const getNearestPort = (shape: Shape, pos: { x: number; y: number }): ConnectionPort => {
    const distances: Array<{ port: ConnectionPort; distance: number }> = [
      { port: "top", distance: Math.abs(pos.y - shape.y) },
      { port: "right", distance: Math.abs(pos.x - (shape.x + shape.w)) },
      { port: "bottom", distance: Math.abs(pos.y - (shape.y + shape.h)) },
      { port: "left", distance: Math.abs(pos.x - shape.x) },
    ];
    distances.sort((a, b) => a.distance - b.distance);
    return distances[0].port;
  };

  const updateConnectorDrag = useCallback((
    fromId: string,
    fromPort: ConnectionPort,
    pos: { x: number; y: number },
  ) => {
    setConnectorDrag({ fromId, fromPort, pos });
    setConnectorDragTargetId(getShapeAtPoint(pos, fromId)?.id ?? null);
  }, [getShapeAtPoint]);

  const handlePortDragStart = useCallback((
    shapeId: string,
    port: ConnectionPort,
    pos: { x: number; y: number },
  ) => {
    dispatch(selectShape(null));
    dispatch(selectConnection(null));
    updateConnectorDrag(shapeId, port, pos);
  }, [dispatch, updateConnectorDrag]);

  const handlePortDragEnd = useCallback((
    shapeId: string,
    port: ConnectionPort,
    pos: { x: number; y: number },
  ) => {
    const target = getShapeAtPoint(pos, shapeId);
    if (target) {
      dispatch(
        addConnection({
          id: newId(),
          fromId: shapeId,
          toId: target.id,
          fromPort: port,
          toPort: getNearestPort(target, pos),
        }),
      );
      setConnectorDrag(null);
      setConnectorDragTargetId(null);
    } else {
      // Released on empty canvas — show shape picker popup
      const vp = viewportRef.current;
      const relX = pos.x * vp.scale + vp.x;
      const relY = pos.y * vp.scale + vp.y;
      setShapePickerPopup({ fromId: shapeId, fromPort: port, pos, relX, relY });
      setConnectorDragTargetId(null);
      // Keep connectorDrag so the dashed arrow stays visible while popup is open
    }
  }, [dispatch, getShapeAtPoint]);

  const dismissShapePicker = useCallback(() => {
    setShapePickerPopup(null);
    setConnectorDrag(null);
  }, []);

  const handleShapePickerSelect = useCallback((type: ShapeType) => {
    if (!shapePickerPopup) return;
    const { fromId, fromPort, pos } = shapePickerPopup;
    const defs = defaultsFor(type as PlaceableShapeType);
    const newShapeId = newId();

    const oppositePort = (p: ConnectionPort): ConnectionPort => {
      if (p === "top") return "bottom";
      if (p === "bottom") return "top";
      if (p === "left") return "right";
      return "left";
    };

    yjsShapesRef.current.set(newShapeId, {
      id: newShapeId,
      type,
      x: pos.x - defs.w / 2,
      y: pos.y - defs.h / 2,
      w: defs.w,
      h: defs.h,
      label: defs.label,
      fill: defs.fill,
      strokeColor: defs.strokeColor,
    });
    dispatch(
      addConnection({
        id: newId(),
        fromId,
        toId: newShapeId,
        fromPort,
        toPort: oppositePort(fromPort),
      }),
    );
    dispatch(selectShape(newShapeId));
    setShapePickerPopup(null);
    setConnectorDrag(null);
  }, [dispatch, shapePickerPopup]);

  const handleConnectionClick = useCallback((connectionId: string) => {
    dispatch(selectConnection(connectionId));
    dispatch(setPanel({ panel: "right", open: true }));
  }, [dispatch]);

  const handleConnectionDoubleClick = useCallback((connectionId: string) => {
    dispatch(selectConnection(connectionId));
    setEditingConnectionId(connectionId);
  }, [dispatch]);

  const handleTransformEnd = () => {
    const tr = transformerRef.current;
    if (!tr) return;
    const nodes = tr.nodes();
    if (nodes.length === 0) return;
    for (const node of nodes) {
      const shapeId = [...shapeRefs.current.entries()].find(
        ([, n]) => n === node,
      )?.[0];
      if (!shapeId) continue;
      const shape = shapeMap.get(shapeId);
      if (!shape) continue;
      const newW = Math.max(20, node.scaleX() * shape.w);
      const newH = Math.max(20, node.scaleY() * shape.h);
      node.scaleX(1);
      node.scaleY(1);
      const existing = yjsShapes.get(shapeId) ?? shape;
      yjsShapes.set(shapeId, { ...existing, x: node.x(), y: node.y(), w: newW, h: newH });
    }
  };

  const commitLabel = (value: string) => {
    if (editingId) {
      const existing = yjsShapes.get(editingId) ?? shapeMap.get(editingId);
      if (existing) yjsShapes.set(editingId, { ...existing, label: value });
      setEditingId(null);
    }
  };

  const draggableShapes = tool === "select";

  const handleWrapperMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) {
      e.preventDefault();
      isMMBPanningRef.current = true;
      mmbLastPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleWrapperMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMMBPanningRef.current) return;
    const dx = e.clientX - mmbLastPosRef.current.x;
    const dy = e.clientY - mmbLastPosRef.current.y;
    mmbLastPosRef.current = { x: e.clientX, y: e.clientY };
    dispatch(panViewport({ dx, dy }));
  };

  const stopMMBPan = () => {
    isMMBPanningRef.current = false;
  };

  // Suppress Konva's default context menu so right-click doesn't break things
  const isMultiSelectActive = selectedIds.length > 0;

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full ${className ?? ""}`.trim()}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE * viewport.scale}px ${GRID_SIZE * viewport.scale}px`,
        backgroundPosition: `${viewport.x + GRID_OFFSET * viewport.scale}px ${viewport.y + GRID_OFFSET * viewport.scale}px`,
        cursor: tool === "hand" ? "grab" : isMMBPanningRef.current ? "grabbing" : (selectionRect ? "crosshair" : "default"),
      }}
      onMouseDown={handleWrapperMouseDown}
      onMouseMove={handleWrapperMouseMove}
      onMouseUp={stopMMBPan}
      onMouseLeave={stopMMBPan}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageFile(file);
          } else {
            dispatch(setTool("select"));
          }
          e.target.value = "";
        }}
      />

      {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          x={viewport.x}
          y={viewport.y}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          draggable={tool === "hand"}
          onClick={handleStageClick}
          onMouseDown={handleStageMouseDown}
          onDragMove={handleStageDragMove}
          onDragEnd={handleStageDragEnd}
        >
          <Layer>
            {connections.map((c) => (
              <CanvasConnection
                key={c.id}
                connection={c}
                shapeMap={liveShapeMap}
                isSelected={c.id === selectedConnectionId || selectedConnectionIds.includes(c.id)}
                editingLabel={c.id === editingConnectionId}
                draggingTipPos={draggingTip?.connId === c.id ? draggingTip.pos : undefined}
                onSelect={() => handleConnectionClick(c.id)}
                onDoubleClick={() => handleConnectionDoubleClick(c.id)}
                onTipDragMove={(pos) => {
                  setDraggingTip({ connId: c.id, pos });
                  const target = shapes.find(
                    (s) =>
                      s.id !== c.fromId &&
                      pos.x >= s.x && pos.x <= s.x + s.w &&
                      pos.y >= s.y && pos.y <= s.y + s.h,
                  );
                  setTipDragTargetId(target?.id ?? null);
                }}
                onTipDragEnd={() => {
                  if (tipDragTargetIdRef.current) {
                    dispatch(updateConnection({
                      id: c.id,
                      toId: tipDragTargetIdRef.current,
                      toPort: undefined,
                    }));
                  }
                  setDraggingTip(null);
                  setTipDragTargetId(null);
                }}
              />
            ))}

            {/* Drop target highlight during connector drag */}
            {(tipDragTargetId ?? connectorDragTargetId) && (() => {
              const s = shapeMap.get((tipDragTargetId ?? connectorDragTargetId)!);
              if (!s) return null;
              return (
                <Rect
                  x={s.x - 3}
                  y={s.y - 3}
                  width={s.w + 6}
                  height={s.h + 6}
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="transparent"
                  listening={false}
                  cornerRadius={4}
                />
              );
            })()}

            {connectorDrag && (() => {
              const from = shapeMap.get(connectorDrag.fromId);
              if (!from) return null;
              return (
                <Arrow
                  points={buildOrthogonalPointsToPos(
                    from,
                    connectorDrag.pos.x,
                    connectorDrag.pos.y,
                    connectorDrag.fromPort,
                  )}
                  stroke="#ffffff"
                  fill="#ffffff"
                  pointerLength={10}
                  pointerWidth={10}
                  strokeWidth={2}
                  dash={[8, 6]}
                  listening={false}
                />
              );
            })()}

            {shapes.map((shape) => (
              <Group
                key={shape.id}
                ref={(node) => {
                  if (node) shapeRefs.current.set(shape.id, node);
                  else shapeRefs.current.delete(shape.id);
                }}
                x={draggingPositions.get(shape.id)?.x ?? shape.x}
                y={draggingPositions.get(shape.id)?.y ?? shape.y}
                draggable={draggableShapes}
                onClick={(e) => handleShapeClick(shape, e)}
                onDblClick={() => setEditingId(shape.id)}
                onDragStart={() => handleShapeDragStart(shape)}
                onDragMove={(e) => handleShapeDragMove(shape, e)}
                onDragEnd={(e) => handleShapeDragEnd(shape, e)}
                onMouseEnter={() => handleShapeMouseEnter(shape.id)}
                onMouseLeave={handleShapeMouseLeave}
              >
                {shape.type === "image" ? (
                  <CanvasImageShape shape={shape} />
                ) : (
                  <>
                    <CanvasShape
                      shape={shape}
                      pendingArrow={pendingFromId === shape.id}
                    />
                    {editingId !== shape.id && (
                      <CanvasShapeLabel shape={shape} />
                    )}
                  </>
                )}
              </Group>
            ))}

            {shapes.map((shape) => {
              const show =
                tool === "select" &&
                !draggingTip &&
                !selectedConnectionId &&
                selectedConnectionIds.length === 0 &&
                !isMultiSelectActive &&
                (hoveredId === shape.id || selectedId === shape.id) &&
                pendingFromId !== shape.id;
              return show ? (
                <Group
                  key={`conn-${shape.id}`}
                  x={(draggingPositions.get(shape.id) ?? shape).x}
                  y={(draggingPositions.get(shape.id) ?? shape).y}
                  onMouseEnter={() => handleShapeMouseEnter(shape.id)}
                  onMouseLeave={handleShapeMouseLeave}
                >
                  <CanvasShapeConnectors
                    shape={shape}
                    onPortClick={(port) => handlePortClick(shape.id, port)}
                    onPortDragStart={(port, pos) => handlePortDragStart(shape.id, port, pos)}
                    onPortDragMove={(port, pos) => updateConnectorDrag(shape.id, port, pos)}
                    onPortDragEnd={(port, pos) => handlePortDragEnd(shape.id, port, pos)}
                  />
                </Group>
              ) : null;
            })}

            {/* Rubber-band selection rectangle */}
            {selectionRect && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.w}
                height={selectionRect.h}
                fill="rgba(96,165,250,0.08)"
                stroke="#60a5fa"
                strokeWidth={1 / viewport.scale}
                dash={[5 / viewport.scale, 4 / viewport.scale]}
                listening={false}
              />
            )}

            <Transformer ref={transformerRef} onTransformEnd={handleTransformEnd} rotateEnabled={false} />
          </Layer>
        </Stage>
      )}

      {editingShape && (
        <CanvasLabelEditor
          key={editingShape.id}
          shape={editingShape}
          offsetX={viewport.x}
          offsetY={viewport.y}
          scale={viewport.scale}
          onCommit={commitLabel}
          onCancel={() => setEditingId(null)}
        />
      )}

      {shapePickerPopup && (
        <ShapePickerPopup
          relX={shapePickerPopup.relX}
          relY={shapePickerPopup.relY}
          onSelect={handleShapePickerSelect}
          onDismiss={dismissShapePicker}
        />
      )}

      {editingConnectionId && (() => {
        const conn = connections.find((c) => c.id === editingConnectionId);
        if (!conn) return null;
        const from = shapeMap.get(conn.fromId);
        const to = shapeMap.get(conn.toId);
        if (!from || !to) return null;
        const pts = buildOrthogonalPoints(from, to);
        const mid = getPathMidpoint(pts);
        return (
          <CanvasConnectionLabelEditor
            key={editingConnectionId}
            connection={conn}
            midX={mid.x}
            midY={mid.y}
            offsetX={viewport.x}
            offsetY={viewport.y}
            scale={viewport.scale}
            onCommit={(value) => {
              dispatch(updateConnection({ id: editingConnectionId, label: value }));
              setEditingConnectionId(null);
            }}
            onCancel={() => setEditingConnectionId(null)}
          />
        );
      })()}
    </div>
  );
};

export default CanvasStage;
