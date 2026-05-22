"use client";
import React from "react";

type Props = {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
  rotationY?: number;
};

export default function Wall({ position = [0, 0, 0], width = 4, depth = 0.2, height = 3, color = "#8aa4ff", rotationY = 0 }: Props) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} />
    </mesh>
  );
}
