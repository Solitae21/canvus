"use client";

import { Layer, Group, Path, Label, Tag, Text, Circle } from "react-konva";
import { useAppSelector } from "@/redux/hooks";
import { selectRemoteCursors } from "@/redux/slice/presence/presence-slice";

const CURSOR_PATH = "M0 0 L0 13 L3.5 9.5 L6 16.5 L8 15.5 L5.5 8.5 L10 8.5 Z";

interface CursorLayerProps {
  viewportScale: number;
}

export default function CursorLayer({ viewportScale }: CursorLayerProps) {
  const cursors = useAppSelector(selectRemoteCursors);
  const invScale = 1 / viewportScale;

  return (
    <Layer listening={false}>
      {Object.entries(cursors).map(([uid, pos]) =>
        pos.laser ? (
          <Group key={uid} x={pos.x} y={pos.y} scaleX={invScale} scaleY={invScale}>
            <Circle radius={14} fill="#ef4444" opacity={0.25} shadowBlur={24} shadowColor="#ef4444" />
            <Circle radius={6} fill="#ef4444" shadowBlur={12} shadowColor="#ef4444" />
            <Label x={10} y={10}>
              <Tag fill={pos.color} cornerRadius={3} />
              <Text text={pos.name} fontSize={11} fill="#000" padding={2} />
            </Label>
          </Group>
        ) : (
          <Group key={uid} x={pos.x} y={pos.y} scaleX={invScale} scaleY={invScale}>
            <Path data={CURSOR_PATH} fill={pos.color} />
            <Label x={0} y={18}>
              <Tag fill={pos.color} cornerRadius={3} />
              <Text text={pos.name} fontSize={11} fill="#000" padding={2} />
            </Label>
          </Group>
        ),
      )}
    </Layer>
  );
}
