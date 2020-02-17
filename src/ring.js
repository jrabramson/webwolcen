import React, { useState, useRef, useEffect } from "react";
import { Circle, Group, Line } from "react-konva";

import treeJSON from "./tree.json";
window.treeJSON = treeJSON;
var x = Math.cos(0.75) * 150 * 0.25;
var y = Math.sin(0.75) * 150 * 0.25;

const Node = ({ x, y, onClick, radius, color }) => {
  return (
    <Circle
      radius={radius}
      fill={color}
      verticalAlign="middle"
      stroke="#0B0023"
      strokeWidth={1}
      onClick={onClick}
      x={x}
      y={y}
    />
  );
};

export default ({
  tier,
  segments,
  triggerRotation,
  setTriggerRotate,
  ringRadius
}) => {
  const circleRef = useRef(null);
  const [isRotating, setIsRotating] = useState(false);

  const lines = Array.from({ length: segments }, (_, i) => i);
  const angle = 360 / segments;
  const radius = ringRadius * (tier + 1);
  const tierShade = ["#2C303C", "#252934", "#1D222D"];

  useEffect(() => {
    if (triggerRotation.tier === tier && !isRotating) {
      setIsRotating(true);
      circleRef.current.to({
        rotation:
          triggerRotation.dir === "right"
            ? circleRef.current.getRotation() - angle
            : circleRef.current.getRotation() + angle,
        duration: 1,
        onFinish: () => {
          setIsRotating(false);
        }
      });
      setTriggerRotate(-1);
    }
  }, [triggerRotation, setTriggerRotate]);

  const NodeColors = {
    "range": "green",
    "melee": "red",
    "tank": "red",
    "magic": "purple"
  }

  const buildNode = (node, order) => {
    const originAngle = angle * node.angle + 30 + angle * order;
    const axis = {
      x1: ringRadius * tier * Math.cos((originAngle * Math.PI) / 180),
      y1: ringRadius * tier * Math.sin((originAngle * Math.PI) / 180),
      x2: ringRadius * (tier + 1) * Math.cos((originAngle * Math.PI) / 180),
      y2: ringRadius * (tier + 1) * Math.sin((originAngle * Math.PI) / 180)
    };

    const xlen = axis.x2 - axis.x1;
    const ylen = axis.y2 - axis.y1;

    const hlen = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));

    const ratio = hlen * node.pos;
    const smallX = (1 - node.pos) * axis.x1 + node.pos * axis.x2;
    const smallY = (1 - node.pos) * axis.y1 + node.pos * axis.y2;

    return [
      <Node
        key={node.id}
        onClick={() => console.log(node.name + " - " + node.angle)}
        x={smallX}
        y={smallY}
        radius={(node.rarity * 2)}
        color={NodeColors[node.category]}
      />
    ];
  };

  return (
    <Group ref={circleRef}>
      <Circle
        radius={radius}
        fill={tierShade[tier]}
        verticalAlign="middle"
        stroke="#0B0023"
        strokeWidth={1}
      />
      {lines.map(i => (
        <Group key={i}>
          <Line
            stroke="#0B0023"
            fill="#0B0023"
            strokeWidth={1}
            points={[
              0,
              0,
              radius * Math.cos(((angle * i + 30) * Math.PI) / 180),
              radius * Math.sin(((angle * i + 30) * Math.PI) / 180)
            ]}
          />
          {treeJSON[tier][i].skills.map(node => buildNode(node, i))}
        </Group>
      ))}
    </Group>
  );
};
