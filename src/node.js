import React, { useRef, useEffect } from "react";
import { Circle, Group } from "react-konva";

const NodeColors = {
  range: "#2eff5b",
  melee: "#ff1212",
  tank: "#ff1212",
  magic: "#ff12f3"
};

const NodeColorsInactive = {
  range: "#285c36",
  melee: "#5c2828",
  tank: "#5c2828",
  magic: "#55285c"
};

const genNodeCoords = (node, order, angle, ringRadius, tier) => {
  if (node.isRelativeDirection) {
    return node;
  }

  const originAngle = angle * node.angle + 30 + angle * order;
  const axis = {
    x1: ringRadius * tier * Math.cos((originAngle * Math.PI) / 180),
    y1: ringRadius * tier * Math.sin((originAngle * Math.PI) / 180),
    x2: ringRadius * (tier + 1) * Math.cos((originAngle * Math.PI) / 180),
    y2: ringRadius * (tier + 1) * Math.sin((originAngle * Math.PI) / 180)
  };

  axis.x = (1 - node.pos) * axis.x1 + node.pos * axis.x2;
  axis.y = (1 - node.pos) * axis.y1 + node.pos * axis.y2;

  return axis;
};

export default React.memo(
  ({ node, order, angle, ringRadius, tier, onClick, active }) => {
    const nodeRef = useRef(null);

    useEffect(() => {
      const object = nodeRef.current;
      object.on("mouseenter", function() {
        object.getStage().container().style.cursor = "pointer";
      });
      object.on("mouseleave", function() {
        object.getStage().container().style.cursor = "default";
      });
    }, []);

    const coords = genNodeCoords(node, order, angle, ringRadius, tier);

    const clickNode = () => {
      onClick(node);
    };

    return (
      <Group>
        <Circle
          radius={node.rarity * 3}
          fill={
            active
              ? NodeColors[node.category]
              : NodeColorsInactive[node.category]
          }
          verticalAlign="middle"
          stroke="#525763"
          opacity={1}
          perfectDrawEnabled={false}
          strokeWidth={1}
          onClick={() => clickNode(node)}
          x={coords.x}
          y={coords.y}
          ref={nodeRef}
        />
      </Group>
    );
  }
);
