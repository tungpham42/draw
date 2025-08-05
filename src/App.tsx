import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Toolbar from "./components/Toolbar";
import CanvasArea from "./components/CanvasArea";
import { Tool } from "./types";

const App = () => {
  const [tool, setTool] = useState<Tool>("rectangle");

  return (
    <Container fluid>
      <Row>
        <Col md={2}>
          <Toolbar tool={tool} setTool={setTool} />
        </Col>
        <Col md={10}>
          <CanvasArea tool={tool} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
