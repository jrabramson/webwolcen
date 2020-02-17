import React, { useState, useRef, useEffect } from "react";
import { Circle, Group, Line } from "react-konva";

import treeJSON from "./tree.json";
window.treeJSON = treeJSON;
var x = Math.cos(0.75) * 150 * 0.25;
var y = Math.sin(0.75) * 150 * 0.25;

const Node = ({ x, y, onClick }) => {
  return (
    <Circle
      radius={3}
      fill={"red"}
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

  const lines = Array.from({ length: segments }, (x, i) => i);
  const angle = 360 / segments;
  const radius = ringRadius * (tier + 1);
  const tierShade = ["#2C303C", "#252934", "#1D222D"];

  if (tier === 0) {
  }

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
              radius * Math.cos(((angle * i - 90) * Math.PI) / 180),
              radius * Math.sin(((angle * i - 90) * Math.PI) / 180)
            ]}
          />
          {treeJSON[tier][i].skills.map(node => (
            <Node
              key={node.id}
              onClick={() => console.log(node.name + " - " + node.angle)}
              x={
                Math.cos(parseFloat((node.angle - ((angle * i - 90) * (Math.PI / 180))) * Math.PI * 0.6)) *
                radius *
                parseFloat(node.pos)
              }
              y={
                Math.sin(parseFloat((node.angle - ((angle * i - 90) * (Math.PI / 180))) * Math.PI * 0.6)) *
                radius *
                parseFloat(node.pos)
              }
            />
          ))}
        </Group>
      ))}
    </Group>
  );
};
