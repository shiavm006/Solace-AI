"use client";

import SplineScene from "@/components/SplineScene";
import SplitText from "@/components/SplitText";

export default function Welcome() {
  // replace with your spline scene url from spline.design
  const splineSceneUrl = "";

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
    <div className="h-screen text-white relative bg-black">
      <div className="absolute inset-0 m-6 border-2 border-emerald-500">
        {/* Corner squares */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-500"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-500"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500"></div>
        
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <SplitText
            text="Hey… I'm really glad you're here."
            delay={50}
            duration={1.25}
            ease="bounce.out"
            splitType="chars"
            className="text-4xl font-bold text-white"
            tag="h1"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </div>
        {splineSceneUrl && (
          <div className="absolute inset-0 z-0">
            <SplineScene scene={splineSceneUrl} />
          </div>
        )}
      </div>
    </div>
  );
}

