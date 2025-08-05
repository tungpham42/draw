import React from "react";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import { Tool } from "../types";

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

const toolLabels: Record<Tool, string> = {
  select: "Chọn",
  rectangle: "Hình chữ nhật",
  circle: "Hình tròn",
  line: "Đường thẳng",
  ellipse: "Hình elip",
  arrow: "Mũi tên",
  text: "Văn bản",
};

const Toolbar: React.FC<ToolbarProps> = ({ tool, setTool }) => {
  return (
    <>
      <h5 className="mt-3">Thanh công cụ</h5>
      <ButtonGroup vertical className="w-100">
        {[
          "select",
          "rectangle",
          "circle",
          "line",
          "ellipse",
          "arrow",
          "text",
        ].map((t) => (
          <ToggleButton
            key={t}
            id={`radio-${t}`}
            type="radio"
            variant="outline-primary"
            name="tool"
            value={t}
            checked={tool === t}
            onChange={(e) => setTool(e.currentTarget.value as Tool)}
          >
            {toolLabels[t as Tool]}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </>
  );
};

export default Toolbar;
