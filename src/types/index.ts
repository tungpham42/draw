export type Tool =
  | "select"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "ellipse"
  | "text";

export type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; x: number; y: number; radius: number }
  | { type: "ellipse"; x: number; y: number; radiusX: number; radiusY: number }
  | { type: "line" | "arrow"; points: number[] }
  | { type: "text"; x: number; y: number; text: string; fontSize: number };
