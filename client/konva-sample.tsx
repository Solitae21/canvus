"use client";

import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Text } from "react-konva";

const KonvaSample = () => {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (stageSize.width === 0 || stageSize.height === 0) {
    return null;
  }

  return (
    <Stage width={stageSize.width} height={stageSize.height}>
      <Layer>
        <Text text="Try to drag shapes" fontSize={15} />
        <Rect
          x={20}
          y={50}
          width={100}
          height={100}
          fill="red"
          shadowBlur={10}
          draggable
        />
        <Circle x={200} y={100} radius={50} fill="green" draggable />
      </Layer>
    </Stage>
  );
};

export default KonvaSample;
