import React, { useState, useRef, useEffect } from "react";
import { render } from "react-dom";
import { Stage, Layer, Circle, Group, Line } from "react-konva";
import useImage from "use-image";
import styled, { keyframes } from "styled-components";

import Ring from "./ring";
import Interface from "./interface";

const ringRadius = 150;

const ringDefs = [{ segments: 3 }, { segments: 6 }, { segments: 12 }];

const moveTwinkBack = keyframes`
  from {
    background-position:0 0;
  }
  to {
    background-position:-10000px 5000px;
  Î}
`;

const Starfield = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: #002b56;
  background-image: linear-gradient(
    237deg,
    #002b56 0%,
    #3f2c5f 59%,
    #007377 100%
  );
  opacity: 0.3;
  z-index: 2;
`;

const StarBase = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

const Star = styled(StarBase)`
  background: #000
    url(http://www.script-tutorials.com/demos/360/images/stars.png) repeat top
    center;
  z-index: 0;
`;
const Twinkle = styled(StarBase)`
  background: transparent
    url(http://www.script-tutorials.com/demos/360/images/twinkling.png) repeat
    top center;
  z-index: 1;
  animation: ${moveTwinkBack} 200s linear infinite;
`;

const App = () => {
  const stageRef = useRef(null);
  const ringsRef = useRef(null);
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);
  const [ringsX, setRingsX] = useState(window.innerWidth / 2);
  const [ringsY, setRingsY] = useState(window.innerHeight / 2);
  const [selectedRing, setSelectedRing] = useState(null);
  const [triggerRotate, setTriggerRotate] = useState({ tier: -1, dir: null });

  const dragBounds = pos => {
    const stage = stageRef.current.getStage();
    window.stage = stage;
    var x = stage.width() / 2;
    var y = stage.height() / 2;
    var radius = 400 * stage.getScale().x;
    var scale =
      radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
    if (scale < 1)
      return {
        y: Math.round((pos.y - y) * scale + y),
        x: Math.round((pos.x - x) * scale + x)
      };
    else return pos;
  };

  const onZoom = e => {
    e.evt.preventDefault();

    const scaleBy = 1.04;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    if (newScale > 3.5) newScale = 3.5;
    if (newScale < 1) newScale = 1;

    setStageScale(newScale);
    setStageX(
      -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale
    );
    setStageY(
      -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    );
  };

  const onDragRings = e => {
    setRingsX(e.target.x());
    setRingsY(e.target.y());
  };

  const onRotateRight = () => {
    if (!ringDefs[selectedRing]) {
      return;
    }
    setTriggerRotate({ tier: selectedRing, dir: "right" });
  };

  const onRotateLeft = () => {
    if (!ringDefs[selectedRing]) {
      return;
    }

    setTriggerRotate({ tier: selectedRing, dir: "left" });
  };

  return (
    <div>
      <Starfield>
        <Overlay />
        <Star />
        <Twinkle />
      </Starfield>
      <Interface
        onRotateRight={onRotateRight}
        onRotateLeft={onRotateLeft}
        setSelectedRing={setSelectedRing}
        selectedRing={selectedRing}
      />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={onZoom}
        scaleX={stageScale}
        scaleY={stageScale}
        ref={stageRef}
        x={stageX}
        y={stageY}
        style={{ zIndex: 98, position: "relative" }}
      >
        <Layer>
          <Group
            draggable
            dragBoundFunc={dragBounds}
            x={ringsX}
            y={ringsY}
            offset={{ x: 0, y: 0 }}
            ref={ringsRef}
            onDragEnd={onDragRings}
            width={ringRadius * 3}
            height={ringRadius * 3}
          >
            <Ring
              ringRadius={ringRadius}
              tier={2}
              x={ringsX}
              y={ringsY}
              segments={12}
              triggerRotation={triggerRotate}
              setTriggerRotate={setTriggerRotate}
            />
            <Ring
              ringRadius={ringRadius}
              tier={1}
              x={ringsX}
              y={ringsY}
              segments={6}
              triggerRotation={triggerRotate}
              setTriggerRotate={setTriggerRotate}
            />
            <Ring
              ringRadius={ringRadius}
              tier={0}
              x={ringsX}
              y={ringsY}
              segments={3}
              triggerRotation={triggerRotate}
              setTriggerRotate={setTriggerRotate}
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

render(<App />, document.getElementById("root"));
