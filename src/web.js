import React from "react";
import { Line } from "react-konva";

const populateEdges = links => {
  links["WILL_3"] = links["WILL_3"] || {};
  links["WILL_3"].rightDown = "AGIL_23";
  links["AGIL_3"] = links["AGIL_3"] || {};
  links["AGIL_3"].rightDown = "FERO_23";
  links["FERO_3"] = links["FERO_3"] || {};
  links["FERO_3"].rightDown = "WILL_23";

  links["AGIL_23"] = links["AGIL_23"] || {};
  links["AGIL_23"].leftDown = "WILL_3";
  links["FERO_23"] = links["FERO_23"] || {};
  links["FERO_23"].leftDown = "AGIL_3";
  links["WILL_23"] = links["WILL_23"] || {};
  links["WILL_23"].leftDown = "FERO_3";

  links["AGIL_24"] = links["AGIL_24"] || {};
  links["AGIL_24"].endLeft = "WILL_4";
  links["WILL_24"] = links["WILL_24"] || {};
  links["WILL_24"].endLeft = "FERO_4";
  links["FERO_24"] = links["FERO_24"] || {};
  links["FERO_24"].endLeft = "AGIL_4";

  links["WILL_4"] = links["WILL_4"] || {};
  links["WILL_4"].endRight = "AGIL_24";
  links["FERO_4"] = links["FERO_4"] || {};
  links["FERO_4"].endRight = "WILL_24";
  links["AGIL_4"] = links["AGIL_4"] || {};
  links["AGIL_4"].endRight = "FERO_24";

  links["MAST_27"] = links["MAST_27"] || {};
  links["MAST_27"].endLeft = "TANK_10";
  links["TANK_27"] = links["TANK_27"] || {};
  links["TANK_27"].endLeft = "MELEE_10";
  links["MELEE_27"] = links["MELEE_27"] || {};
  links["MELEE_27"].endLeft = "ELEM_10";
  links["ELEM_27"] = links["ELEM_27"] || {};
  links["ELEM_27"].endLeft = "WARR_10";
  links["WARR_27"] = links["WARR_27"] || {};
  links["WARR_27"].endLeft = "DIST_10";
  links["DIST_27"] = links["DIST_27"] || {};
  links["DIST_27"].endLeft = "MAST_10";

  links["TANK_10"] = links["TANK_10"] || {};
  links["TANK_10"].endRight = "MAST_27";
  links["MELEE_10"] = links["MELEE_10"] || {};
  links["MELEE_10"].endRight = "TANK_27";
  links["ELEM_10"] = links["ELEM_10"] || {};
  links["ELEM_10"].endRight = "MELEE_27";
  links["WARR_10"] = links["WARR_10"] || {};
  links["WARR_10"].endRight = "ELEM_27";
  links["DIST_10"] = links["DIST_10"] || {};
  links["DIST_10"].endRight = "WARR_27";
  links["MAST_10"] = links["MAST_10"] || {};
  links["MAST_10"].endRight = "DIST_27";

  return links;
};

export default ({
  section,
  order,
  angle,
  ringRadius,
  tier,
  activeNodes,
  links
}) => {
  const genNodeCoords = (node, order, angle, ringRadius, tier) => {
    if (node.isRelativeDirection) {
      return node;
    }

    links = populateEdges(links);

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
        return {
          id:
            links && links[node.id] && links[node.id].down
              ? links[node.id].down
              : null,

          x: 0,
          y: 0,
          isRelativeDirection: true
        };
      case "rightUp":
      case "leftUp":
        return {
          id:
            links && links[node.id] && links[node.id].up
              ? links[node.id].up
              : null,
          x: coords.x2,
          y: coords.y2,
          isRelativeDirection: true
        };
      case "endRight":
        return {
          id:
            links && links[node.id] && links[node.id].endRight
              ? links[node.id].endRight
              : null,
          x: nextRingCoords.x,
          y: nextRingCoords.y,
          isRelativeDirection: true
        };
      case "rightDown":
        return {
          id:
            links && links[node.id] && links[node.id].rightDown
              ? links[node.id].rightDown
              : null,
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
          id:
            links && links[node.id] && links[node.id].endLeft
              ? links[node.id].endLeft
              : null,
          x: ringCoords.x,
          y: ringCoords.y,
          isRelativeDirection: true
        };
      case "leftDown":
        return {
          id:
            links && links[node.id] && links[node.id].leftDown
              ? links[node.id].leftDown
              : null,
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

      const colour =
        activeNodes.includes(node.id) && activeNodes.includes(neighbor.id)
          ? "red"
          : activeNodes.includes(node.id)
          ? "blue"
          : "#525763";
      return (
        <WebLine
          key={neighborId + "-line-" + node.id}
          colour={colour}
          coords={coords}
          neighborCoords={neighborCoords}
        />
      );
    })
  );
};

const WebLine = React.memo(({ colour, coords, neighborCoords }) => (
  <Line
    stroke={colour}
    fill={colour}
    strokeWidth={1}
    points={[coords.x, coords.y, neighborCoords.x, neighborCoords.y]}
  />
));
