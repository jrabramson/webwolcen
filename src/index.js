import React, { useState, useRef, useEffect } from "react";
import { render } from "react-dom";
import { Stage, Layer, Group } from "react-konva";
import styled, { keyframes } from "styled-components";
import { Graph } from "graphs-adt";
import Konva from "konva";

Konva.pixelRatio = 1;

import Ring from "./ring";
import Interface from "./interface";

import treeJSON from "./scraped.json";

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
  background: #000 url(./stars.png) repeat top center;
  z-index: 0;
`;
const Twinkle = styled(StarBase)`
  background: transparent url(./twinkling.png) repeat top center;
  z-index: 1;
  animation: ${moveTwinkBack} 200s linear infinite;
`;

const structure = treeJSON;

const beginNodes = [
  "AGIL_1",
  "AGIL_16",
  "FERO_1",
  "FERO_16",
  "WILL_1",
  "WILL_16"
];

const getBoundaryNode = (skills, boundary) => {
  return skills.filter(node => {
    if (typeof boundary === "object") {
      const nodes = boundary
        .flatMap(b => {
          return node.unlock && node.unlock.split(",").indexOf(b) > -1
            ? node
            : null;
        })
        .filter(Boolean);

      return nodes.length ? nodes : null;
    } else {
      return node.unlock && node.unlock.split(",").indexOf(boundary) > -1;
    }
  });
};

const shiftRight = (arr, places) => {
  for (var i = 0; i < places; i++) {
    arr.unshift(arr.pop());
  }
};

const ring1ExitNodes = getBoundaryNode(
  structure.rings[0].sections.flatMap(section => section.skills.reverse()),
  ["leftUp", "rightUp"]
);
const ring2EntryNodes = getBoundaryNode(
  structure.rings[1].sections.flatMap(section => section.skills.reverse()),
  "begin"
);
const ring2ExitNodes = getBoundaryNode(
  structure.rings[1].sections.flatMap(section => section.skills),
  ["leftUp", "rightUp"]
);
const ring3EntryNodes = getBoundaryNode(
  structure.rings[2].sections.flatMap(section => section.skills.reverse()),
  "begin"
);

const Rings = () => {
  const stageRef = useRef(null);
  const ringsRef = useRef(null);

  const [graph, setGraph] = useState(null);
  const [links, setLinks] = useState({});
  const [stageProps, setStageProps] = useState({ zoom: 1, x: -(window.innerWidth * 0.1), y: 0 });
  const [ringsX, setRingsX] = useState(window.innerWidth / 2);
  const [ringsY, setRingsY] = useState(window.innerHeight / 2);
  const [selectedRing, setSelectedRing] = useState(null);
  const [triggerRotate, setTriggerRotate] = useState({ tier: -1, dir: null });
  const [activeNodes, setActiveNodes] = useState(["begin"]);
  const [rotations, setRotations] = useState([
    { rotation: 0, direction: 0 },
    { rotation: 0, direction: 0 },
    { rotation: 0, direction: 0 }
  ]);

  const clearNodes = () => {
    setActiveNodes(["begin"]);
  };
  window.clear = clearNodes;

  const getCurrentRotation = (points, tier, duplicate) => {
    let rotationMap = [...Array(points)].map((_, i) => i);
    let currentRotation = rotations[tier].rotation;
    currentRotation = duplicate ? currentRotation * 2 : currentRotation;

    shiftRight(rotationMap, currentRotation);

    return rotationMap;
  };

  useEffect(() => {
    const graph = new Graph({
      directed: false
    });

    graph.addNode("begin", { active: true });

    beginNodes.forEach(node => {
      graph.addNode(node, { active: false });
      graph.addEdge("begin", node, 1);
    });

    structure.rings.forEach(ring => {
      ring.relations.forEach(rel => {
        if (!graph.nodes.find(node => node.key === rel[0])) {
          graph.addNode(rel[0], { active: false });
        }

        if (!graph.nodes.find(node => node.key === rel[1])) {
          graph.addNode(rel[1], { active: false });
        }

        graph.addEdge(rel[0], rel[1], 1);
      });
    });

    let newLinks = {};

    const ring2Links = structure.rings[1].sections.length;
    const shiftedRing1ExitRotations = getCurrentRotation(ring2Links, 0, true);
    const shiftedRing2EntryRotations = getCurrentRotation(ring2Links, 1);

    [...Array(ring2Links)].forEach((_, i) => {
      newLinks[ring1ExitNodes[shiftedRing1ExitRotations[i]].id] = {};
      newLinks[ring1ExitNodes[shiftedRing1ExitRotations[i]].id].up =
        ring2EntryNodes[shiftedRing2EntryRotations[i]].id;

      newLinks[ring2EntryNodes[shiftedRing2EntryRotations[i]].id] = {};
      newLinks[ring2EntryNodes[shiftedRing2EntryRotations[i]].id].down =
        ring1ExitNodes[shiftedRing1ExitRotations[i]].id;

      graph.addEdge(
        ring1ExitNodes[shiftedRing1ExitRotations[i]].id,
        ring2EntryNodes[shiftedRing2EntryRotations[i]].id,
        1
      );
    });

    const ring3Links = structure.rings[2].sections.length;
    const shiftedRing2ExitRotations = getCurrentRotation(ring3Links, 1, true);
    const shiftedRing3EntryRotations = getCurrentRotation(ring3Links, 2);

    [...Array(ring3Links)].forEach((_, i) => {
      newLinks[ring2ExitNodes[shiftedRing2ExitRotations[i]].id] = {};
      newLinks[ring2ExitNodes[shiftedRing2ExitRotations[i]].id].up =
        ring3EntryNodes[shiftedRing3EntryRotations[i]].id;

      newLinks[ring3EntryNodes[shiftedRing3EntryRotations[i]].id] = {};
      newLinks[ring3EntryNodes[shiftedRing3EntryRotations[i]].id].down =
        ring2ExitNodes[shiftedRing2ExitRotations[i]].id;

      graph.addEdge(
        ring2ExitNodes[shiftedRing2ExitRotations[i]].id,
        ring3EntryNodes[shiftedRing3EntryRotations[i]].id,
        1
      );
    });

    let cleanedActive = recursiveClean(activeNodes, graph);

    setLinks(newLinks);
    setActiveNodes(cleanedActive);
    setGraph(graph);
  }, [rotations]);

  window.graph = graph;
  window.links = links;

  const setRingRotation = (tier, rotation) => {
    let currentRotations = Array.from(rotations);
    currentRotations[tier].rotation = rotation;

    setRotations(currentRotations);
  };

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

    const scaleBy = 1.2;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    if (newScale > 3.5) newScale = 3.5;
    if (newScale < 1) newScale = 1;

    stage.scale({ x: newScale, y: newScale });

    setStageProps({
      zoom: newScale,
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
    stage.batchDraw();
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

  const recursiveClean = (currentNodes, tempGraph = null) => {
    const currentGraph = tempGraph || graph;

    currentNodes.forEach(nodeId => {
      const nodeIndex = currentGraph.nodes.findIndex(node => node.key === nodeId);
      currentGraph.nodes[nodeIndex].meta.active = true;
    });

    let cleanedNodes = [...currentNodes];

    currentNodes.forEach(nodeId => {
      const valid = currentGraph.getPath("begin", nodeId, "active");

      if (!valid.length) {
        cleanedNodes.splice(cleanedNodes.indexOf(nodeId), 1);
      }
    });

    currentGraph.nodes.forEach(node => (node.meta.active = false));

    return cleanedNodes;
  };
  window.active = activeNodes;
  window.rClean = recursiveClean;

  const onClickNode = node => {
    console.log(node);
    let currentNodes = [...activeNodes];

    if (~currentNodes.indexOf(node.id)) {
      currentNodes.splice(currentNodes.indexOf(node.id), 1);

      currentNodes = recursiveClean(currentNodes);

      setActiveNodes(Array.from(new Set(currentNodes)));

      return;
    }

    let closest = "begin";
    let found = false;
    graph.bfs(node.id, node => {
      if (currentNodes.includes(node.key) && !found) {
        closest = node.key;
        found = true;
        return closest;
      }
    });

    let path = graph.getPath(closest, node.id);
    path.map((nodeId, i) => {
      currentNodes.push(nodeId);
    });

    setActiveNodes(activeNodes => Array.from(new Set(currentNodes)));
  };

  return (
    <div style={{ display: 'flex' }}>
      <Interface
        onRotateRight={onRotateRight}
        onRotateLeft={onRotateLeft}
        setSelectedRing={setSelectedRing}
        selectedRing={selectedRing}
      />
      <Stage
        width={window.innerWidth * 0.80}
        height={window.innerHeight}
        onWheel={onZoom}
        scaleX={stageProps.zoom}
        scaleY={stageProps.zoom}
        ref={stageRef}
        x={stageProps.x}
        y={stageProps.y}
        style={{ zIndex: 98, position: "relative" }}
      >
        <Layer
          draggable
          dragBoundFunc={dragBounds}
          x={ringsX}
          y={ringsY}
          offset={{ x: 0, y: 0 }}
          ref={ringsRef}
          onDragEnd={onDragRings}
        >
          <Group>
            {structure.rings
              .map((ring, i) => (
                <Ring
                  key={"ring-" + ring.order}
                  sections={ring.sections}
                  tier={ring.order}
                  segments={ring.sections.length}
                  triggerRotation={triggerRotate}
                  setTriggerRotate={setTriggerRotate}
                  setRingRotation={setRingRotation}
                  ringRadius={ringRadius}
                  activeNodes={activeNodes}
                  onClickNode={onClickNode}
                  links={links}
                />
              ))
              .reverse()}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

const App = () => (
  <div>
    <div>
      <Starfield>
        <Overlay />
        <Star />
        <Twinkle />
      </Starfield>
    </div>
    <div>
      <Rings />
    </div>
  </div>
);

render(<App />, document.getElementById("root"));
