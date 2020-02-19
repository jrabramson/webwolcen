import React, { useRef, useState } from "react";
import { Circle, Line, Group } from "react-konva";

const NodeColors = {
  range: "green",
  melee: "red",
  tank: "red",
  magic: "purple"
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

export default ({ section, node, order, angle, ringRadius, tier, active, onClick }) => {
  const nodeRef = useRef(null);

  const coords = genNodeCoords(node, order, angle, ringRadius, tier);
  const ringCoords = genNodeCoords(
    {
      angle: angle * order,
      pos: node.pos * 0.95
    },
    order,
    angle,
    ringRadius,
    tier
  );
  const nextRingCoords = genNodeCoords(
    {
      angle: 1,
      pos: node.pos * 0.95
    },
    order,
    angle,
    ringRadius,
    tier
  );

  const getRelativeNeighbor = neighborId => {
    switch (neighborId) {
      case "begin":
        return { x: 0, y: 0, isRelativeDirection: true };
      case "rightUp":
      case "leftUp":
        return {
          x: coords.x2,
          y: coords.y2,
          isRelativeDirection: true
        };
      case "endRight":
        return {
          x: nextRingCoords.x,
          y: nextRingCoords.y,
          isRelativeDirection: true
        };
      case "rightDown":
        return {
          x:
            ringRadius *
            Math.cos(((angle * (order + 1) + 30) * Math.PI) / 180) *
            node.pos,
          y:
            ringRadius *
            Math.sin(((angle * (order + 1) + 30) * Math.PI) / 180) *
            node.pos,
          isRelativeDirection: true
        };
      case "endLeft":
        return {
          x: ringCoords.x,
          y: ringCoords.y,
          isRelativeDirection: true
        };
      case "leftDown":
        return {
          x:
            ringRadius *
            Math.cos(((angle * order + 30) * Math.PI) / 180) *
            node.pos,
          y:
            ringRadius *
            Math.sin(((angle * order + 30) * Math.PI) / 180) *
            node.pos,
          isRelativeDirection: true
        };
      default:
        return null;
    }
  };

  return (
    <Group onClick={() => onClick(node)}>
      {node.neighbours.map(neighborId => {
        let neighbor = section.find(s => s.id === neighborId);

        if (!neighbor) {
          neighbor = getRelativeNeighbor(neighborId);

          if (!neighbor) {
            return;
          }
        }

        const neighborCoords = genNodeCoords(
          neighbor,
          order,
          angle,
          ringRadius,
          tier
        );
        return (
          <Line
            key={neighborId + "-line-" + node.id}
            stroke="#525763"
            fill="#525763"
            strokeWidth={1}
            points={[coords.x, coords.y, neighborCoords.x, neighborCoords.y]}
          />
        );
      })}
      <Circle
        radius={node.rarity * 3}
        fill={active ? NodeColors[node.category] : NodeColorsInactive[node.category]}
        verticalAlign="middle"
        stroke="#525763"
        opacity={1}
        perfectDrawEnabled={false}
        strokeWidth={1}
        onClick={() => console.log(node.name + " - " + node.angle)}
        x={coords.x}
        y={coords.y}
        ref={nodeRef}
      />
    </Group>
  );
};
