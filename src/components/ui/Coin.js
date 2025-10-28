// components/ui/Coin.js
"use client";
import { useRef, useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ✅ Preload the GLTF model to reduce perceived load time
useGLTF.preload("/models/2lyptoken-compressed.glb");


function CoinModel({ scrollProgress, showTokenBox, controlsEnabled }) {
  const { scene } = useGLTF("/models/2lyptoken-compressed.glb");
  const coinRef = useRef();
  const initialXRotation = useMemo(() => Math.PI / 2, []);
  const target = useRef({
    rotationY: initialXRotation,
    rotationZ: 0,
    scale: 2
  });

  useFrame(() => {
    if (!coinRef.current) return;

    if (!controlsEnabled) {
      const { rotationY, rotationZ, scale } = target.current;
      const smoothing = 0.1;

      coinRef.current.rotation.y += (rotationY - coinRef.current.rotation.y) * smoothing;
      coinRef.current.rotation.z += (rotationZ - coinRef.current.rotation.z) * smoothing;
      coinRef.current.scale.setScalar(
        coinRef.current.scale.x + (scale - coinRef.current.scale.x) * smoothing
      );
    }
  });

  useEffect(() => {
    if (controlsEnabled) return;

    if (showTokenBox) {
      const progress = Math.min(1, (scrollProgress - 0.85) / 0.15);
      target.current.rotationY = initialXRotation + (Math.PI / 2) * progress;
      target.current.rotationZ = scrollProgress * 2 * Math.PI * (1 - progress);
      target.current.scale = 3.5;
    } else {
      target.current.rotationY = initialXRotation;
      target.current.rotationZ = scrollProgress * 2 * Math.PI;
      target.current.scale = 2;

      if (scrollProgress >= 0.95) {
        const extra = ((scrollProgress - 0.95) / 0.05) * (Math.PI / 2);
        target.current.rotationY += extra;
      }
    }
  }, [scrollProgress, showTokenBox, initialXRotation, controlsEnabled]);

  return <primitive object={scene} ref={coinRef} scale={2} />;
}

export default function Coin({ scrollProgress = 0, showTokenBox = false }) {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const coinSize = 450;
  const scrollbarWidth = 15;
  const canvasRef = useRef();

  const handlePointerEnter = useCallback(() => setControlsEnabled(true), []);
  const handlePointerLeave = useCallback(() => setControlsEnabled(false), []);

  const coinStyle = useMemo(() => {
    if (dimensions.height === 0 || dimensions.width === 0) {
      return {
        top: "50vh",
        right: "50vw",
        transform: "translate(50%, 50%)",
        width: "300px",
        height: "300px",
        opacity: 1
      };
    }

    const maxTop = dimensions.height - coinSize;
    const maxRight = dimensions.width - coinSize;
    const baseRight = -coinSize / 1.9 + scrollbarWidth;

    if (showTokenBox) {
      const progress = Math.min(1, (scrollProgress - 0.85) / 0.15);
      const startTop = Math.min(maxTop, scrollProgress * maxTop);
      const centerTop = maxTop / 2;
      const centerRight = maxRight / 2;

      return {
        top: `${startTop + (centerTop - startTop) * progress}px`,
        right: `${baseRight + (centerRight - baseRight) * progress}px`,
        width: `${coinSize}px`,
        height: `${coinSize}px`
      };
    }

    return {
      top: `${Math.min(maxTop, scrollProgress * maxTop)}px`,
      right: `${baseRight}px`,
      width: `${coinSize}px`,
      height: `${coinSize}px`
    };
  }, [dimensions, scrollProgress, showTokenBox]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Throttle resize updates
    const throttle = (func, limit) => {
      let inThrottle;
      return () => {
        if (!inThrottle) {
          func();
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    const throttledResize = throttle(updateDimensions, 200);
    updateDimensions();
    window.addEventListener("resize", throttledResize);
    return () => window.removeEventListener("resize", throttledResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        ...coinStyle,
        pointerEvents: controlsEnabled ? "auto" : "none",
        zIndex: 30,
        overflow: "visible",
        transformStyle: "preserve-3d"
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        ref={canvasRef}
        camera={{
          position: [0, 0, 10],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          overflow: "visible",
          margin: 0,
          padding: 0,
          background: "transparent"
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        linear
      >
        <directionalLight
          position={[-8, 0, 15]}
          intensity={5}
          color={"#eeeeee"}
        />
        <directionalLight
          position={[0, 3, 4]}
          intensity={10}
          color={"#eeeeee"}
        />
        <Environment preset="apartment" />
        
        <Suspense fallback={null}>
          <CoinModel
            scrollProgress={scrollProgress}
            showTokenBox={showTokenBox}
            controlsEnabled={controlsEnabled}
          />
        </Suspense>

        {controlsEnabled && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(Math.PI / 4) * 3}
          />
        )}
      </Canvas>
    </div>
  );
}
