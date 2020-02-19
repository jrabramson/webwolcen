import React from "react";
import { Line } from "react-konva";

export default ({ section, order, angle, ringRadius, tier }) => {
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

  const getRelativeNeighbor = (
    node,
    neighborId,
    coords,
    ringCoords,
    nextRingCoords
  ) => {
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

  return section.map(node =>
    node.unlock.split(",").map(neighborId => {
      let neighbor = section.find(s => s.id === neighborId);
      const ringCoords = genNodeCoords(
        {
          angle: angle * order,
          pos: node.pos * 0.9
        },
        order,
        angle,
        ringRadius,
        tier
      );
      const nextRingCoords = genNodeCoords(
        {
          angle: 1,
          pos: node.pos * 0.9
        },
        order,
        angle,
        ringRadius,
        tier
      );
      const coords = genNodeCoords(node, order, angle, ringRadius, tier);

      if (!neighbor) {
        neighbor = getRelativeNeighbor(
          node,
          neighborId,
          coords,
          ringCoords,
          nextRingCoords
        );

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
    })
  );
};
