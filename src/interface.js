import React from "react";
import styled from "styled-components";

const RotateRight = styled.button`
  background-image: url(./rotate-r.png);
  width: 41px;
  height: 35px;
  border: 0;
  background-color: transparent;
  position: absolute;
  top: 344px;
  left: 56px;
  outline: none;
  cursor: pointer;
`;

const RotateLeft = styled.button`
  background-image: url(./rotate-r.png);
  transform: scaleX(-1);
  width: 41px;
  height: 35px;
  border: 0;
  background-color: transparent;
  position: absolute;
  top: 344px;
  left: 5px;
  outline: none;
  cursor: pointer;
`;

const InterfaceImage = styled.div`
  background: grey;
  background-repeat: no-repeat;
  height: 100vh;
  width: 20%;
  z-index: 99;
`;

const WrappedRingUI = styled.div`
  background-image: ${props =>
    `url(./${props.tier}-ring${(props.selected && "-hover") || ""}.png);`};
  background-repeat: no-repeat;
  position: absolute;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  ${props => {
    switch (props.tier) {
      case "middle":
        return `
          width: 56px;
          height: 55px;
          top: 15px;
          left: 14px;
        `;
      case "inner":
        return `
          width: 29px;
          height: 27px;
          top: 29px;
          left: 28px;
        `;
    }
  }}
  &:hover {
    background-image: url(./${props => props.tier}-ring-hover.png);
  }
`;

const RingUI = ({ setSelectedRing, selected, tier }) => {
  return (
    <WrappedRingUI selected={selected} tier={tier} onClick={setSelectedRing} />
  );
};

const RingUIContainer = styled.div`
  width: 93px;
  height: 86px;
  border: 0;
  background-color: transparent;
  position: absolute;
  top: 280px;
  left: 9px;
  outline: none;
  cursor: pointer;
`;

export default ({
  onRotateRight,
  onRotateLeft,
  setSelectedRing,
  selectedRing
}) => {
  return (
    <InterfaceImage>
      <RingUIContainer>
        <RingUI
          selected={selectedRing === 2}
          tier="outer"
          setSelectedRing={() => setSelectedRing(2)}
        />
        <RingUI
          selected={selectedRing === 1}
          tier="middle"
          setSelectedRing={() => setSelectedRing(1)}
        />
        <RingUI
          selected={selectedRing === 0}
          tier="inner"
          setSelectedRing={() => setSelectedRing(0)}
        />
      </RingUIContainer>
      <RotateRight onClick={onRotateRight} />
      <RotateLeft onClick={onRotateLeft} />
    </InterfaceImage>
  );
};
