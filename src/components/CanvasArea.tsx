import React, { useState, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Ellipse,
  Arrow,
  Text,
} from "react-konva";
import { Tool, Shape } from "../types";

interface CanvasAreaProps {
  tool: Tool;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ tool }) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState<Shape | null>(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(
    null
  );
  const stageRef = useRef<any>(null);

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();

    if (tool === "select") {
      // Find the shape under the cursor
      const clickedShapeIndex = shapes.findIndex((shape) => {
        if (shape.type === "rect") {
          return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
          );
        } else if (shape.type === "circle") {
          const dx = x - shape.x;
          const dy = y - shape.y;
          return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
        } else if (shape.type === "ellipse") {
          const dx = (x - shape.x) / shape.radiusX;
          const dy = (y - shape.y) / shape.radiusY;
          return dx * dx + dy * dy <= 1;
        } else if (shape.type === "line" || shape.type === "arrow") {
          const [x1, y1, x2, y2] = shape.points;
          const distance = pointToLineDistance(x, y, x1, y1, x2, y2);
          return distance < 5; // Tolerance for clicking near the line
        } else if (shape.type === "text") {
          // Approximate text bounds (simplified)
          return (
            x >= shape.x &&
            x <= shape.x + shape.text.length * shape.fontSize * 0.6 &&
            y >= shape.y - shape.fontSize &&
            y <= shape.y
          );
        }
        return false;
      });

      setSelectedShapeIndex(
        clickedShapeIndex !== -1 ? clickedShapeIndex : null
      );
    } else {
      setIsDrawing(true);
      setSelectedShapeIndex(null); // Deselect when starting to draw
      if (tool === "line" || tool === "arrow") {
        setNewShape({ type: tool, points: [x, y, x, y] });
      } else if (tool === "circle") {
        setNewShape({ type: "circle", x, y, radius: 0 });
      } else if (tool === "ellipse") {
        setNewShape({ type: "ellipse", x, y, radiusX: 0, radiusY: 0 });
      } else if (tool === "rectangle") {
        setNewShape({ type: "rect", x, y, width: 0, height: 0 });
      } else if (tool === "text") {
        const text = prompt("Enter text:") || "";
        if (text) {
          const textShape = { type: "text", x, y, text, fontSize: 20 } as const;
          setShapes((prev) => [...prev, textShape]);
        }
      }
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();

    if (tool === "select" && isDrawing && selectedShapeIndex !== null) {
      setShapes((prevShapes) => {
        const newShapes = [...prevShapes];
        const shape = newShapes[selectedShapeIndex];
        if (
          shape.type === "rect" ||
          shape.type === "circle" ||
          shape.type === "ellipse" ||
          shape.type === "text"
        ) {
          newShapes[selectedShapeIndex] = { ...shape, x, y };
        } else if (shape.type === "line" || shape.type === "arrow") {
          const [x1, y1, x2, y2] = shape.points;
          const dx = x - x1;
          const dy = y - y1;
          newShapes[selectedShapeIndex] = {
            ...shape,
            points: [x, y, x2 + dx, y2 + dy],
          };
        }
        return newShapes;
      });
    } else if (isDrawing && newShape) {
      if (newShape.type === "line" || newShape.type === "arrow") {
        const newPoints = [newShape.points[0], newShape.points[1], x, y];
        setNewShape({ ...newShape, points: newPoints });
      } else if (newShape.type === "circle") {
        const dx = x - newShape.x;
        const dy = y - newShape.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        setNewShape({ ...newShape, radius });
      } else if (newShape.type === "ellipse") {
        const radiusX = Math.abs(x - newShape.x);
        const radiusY = Math.abs(y - newShape.y);
        setNewShape({ ...newShape, radiusX, radiusY });
      } else if (newShape.type === "rect") {
        // Changed from "rectangle" to "rect"
        setNewShape({
          ...newShape,
          width: x - newShape.x,
          height: y - newShape.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && newShape) {
      setShapes((prev) => [...prev, newShape]);
      setNewShape(null);
    }
    setIsDrawing(false);
  };

  // Helper function to calculate distance from a point to a line
  const pointToLineDistance = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    const t = Math.max(
      0,
      Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / length ** 2)
    );
    const projectionX = x1 + t * (x2 - x1);
    const projectionY = y1 + t * (y2 - y1);
    return Math.sqrt((px - projectionX) ** 2 + (py - projectionY) ** 2);
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ background: "#f0f0f0" }}
      ref={stageRef}
    >
      <Layer>
        {shapes.map((shape, i) => {
          const isSelected = i === selectedShapeIndex;
          switch (shape.type) {
            case "rect":
              return (
                <Rect
                  key={i}
                  {...shape}
                  fill={isSelected ? "rgba(0,0,255,0.5)" : "lightblue"}
                  stroke="black"
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setShapes((prev) => {
                      const newShapes = [...prev];
                      newShapes[i] = { ...shape, x, y };
                      return newShapes;
                    });
                  }}
                />
              );
            case "circle":
              return (
                <Circle
                  key={i}
                  {...shape}
                  fill={isSelected ? "rgba(0,255,0,0.5)" : "lightgreen"}
                  stroke="black"
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setShapes((prev) => {
                      const newShapes = [...prev];
                      newShapes[i] = { ...shape, x, y };
                      return newShapes;
                    });
                  }}
                />
              );
            case "line":
              return (
                <Line
                  key={i}
                  {...shape}
                  stroke={isSelected ? "blue" : "black"}
                  strokeWidth={2}
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    const [x1, y1, x2, y2] = shape.points;
                    setShapes((prev) => {
                      const newShapes = [...prev];
                      newShapes[i] = {
                        ...shape,
                        points: [x1 + x, y1 + y, x2 + x, y2 + y],
                      };
                      return newShapes;
                    });
                    e.target.position({ x: 0, y: 0 }); // Reset position to avoid offset
                  }}
                />
              );
            case "arrow":
              return (
                <Arrow
                  key={i}
                  {...shape}
                  stroke={isSelected ? "blue" : "red"}
                  fill={isSelected ? "blue" : "red"}
                  pointerLength={10}
                  pointerWidth={10}
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    const [x1, y1, x2, y2] = shape.points;
                    setShapes((prev) => {
                      const newShapes = [...prev];
                      newShapes[i] = {
                        ...shape,
                        points: [x1 + x, y1 + y, x2 + x, y2 + y],
                      };
                      return newShapes;
                    });
                    e.target.position({ x: 0, y: 0 }); // Reset position to avoid offset
                  }}
                />
              );
            case "ellipse":
              return (
                <Ellipse
                  key={i}
                  {...shape}
                  fill={isSelected ? "rgba(255,255,0,0.5)" : "lightyellow"}
                  stroke="black"
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setShapes((prev) => {
                      const newShapes = [...prev];
                      newShapes[i] = { ...shape, x, y };
                      return newShapes;
                    });
                  }}
                />
              );
            case "text":
              return (
                <Text
                  key={i}
                  {...shape}
                  fill={isSelected ? "blue" : "black"}
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setShapes((prev) => {
                      const newShapes = [...prev];
                      newShapes[i] = { ...shape, x, y };
                      return newShapes;
                    });
                  }}
                />
              );
            default:
              return null;
          }
        })}

        {newShape && newShape.type === "circle" && (
          <Circle {...newShape} fill="rgba(0,255,0,0.2)" stroke="black" />
        )}
        {newShape && newShape.type === "line" && (
          <Line {...newShape} stroke="gray" strokeWidth={1} />
        )}
        {newShape && newShape.type === "arrow" && (
          <Arrow
            {...newShape}
            stroke="gray"
            fill="gray"
            pointerLength={10}
            pointerWidth={10}
          />
        )}
        {newShape && newShape.type === "ellipse" && (
          <Ellipse {...newShape} fill="rgba(255,255,0,0.3)" stroke="black" />
        )}
        {newShape && newShape.type === "rect" && (
          <Rect {...newShape} fill="rgba(0,0,255,0.2)" stroke="black" />
        )}
      </Layer>
    </Stage>
  );
};

export default CanvasArea;
