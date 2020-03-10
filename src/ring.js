import React, { useState, useRef, useEffect } from "react";
import { Circle, Group, Line } from "react-konva";

import Node from "./node";
import Web from "./web";

export default ({
  sections,
  tier,
  segments,
  triggerRotation,
  setTriggerRotate,
  setRingRotation,
  ringRadius,
  activeNodes,
  onClickNode,
  links
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
      const rotation =
        triggerRotation.dir === "right"
          ? circleRef.current.getRotation() - angle
          : circleRef.current.getRotation() + angle;

      circleRef.current.to({
        rotation: rotation,
        duration: 0.7,
        onFinish: () => {
          setIsRotating(false);

          let newRotation = ((rotation / 360) * segments) % segments;
          newRotation = newRotation < 0 ? segments + newRotation : newRotation;
          setRingRotation(tier, newRotation);
        }
      });
      setTriggerRotate(-1);
    }
  }, [triggerRotation, setTriggerRotate]);

  return (
    <Group ref={circleRef} key={"tier-" + tier}>
      <Circle
        radius={radius}
        fill={tierShade[tier]}
        verticalAlign="middle"
        stroke="#0B0023"
        strokeWidth={1}
      />
      {lines.map(i => (
        <Group key={"section-boundary-" + i}>
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
          <Web
            section={sections[i].skills}
            order={i}
            angle={angle}
            ringRadius={ringRadius}
            tier={tier}
            activeNodes={activeNodes}
            links={links}
          />
          {sections[i].skills.map(node => (
            <Node
              node={node}
              order={i}
              angle={angle}
              ringRadius={ringRadius}
              tier={tier}
              key={node.id}
              active={activeNodes.indexOf(node.id) > -1}
              onClick={onClickNode}
            />
          ))}
        </Group>
      ))}
    </Group>
  );
};
