"use client";

import Spline from "@splinetool/react-spline";

export default function SplineScene({ scene, className = "" }) {
  if (!scene) {
    return null;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Spline scene={scene} />
    </div>
  );
}

