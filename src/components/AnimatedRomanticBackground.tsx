import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Petal {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  rotationY: number;
  vRotY: number;
  size: number;
  color: string;
  hasLanded: boolean;
  landTime: number;
  waterWaveOffset: number;
  opacity: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

interface AnimatedRomanticBackgroundProps {
  customMediaUrl?: string | null;
  customMediaType?: 'default' | 'image' | 'video';
  enableOverlayEffects?: boolean;
}

export const AnimatedRomanticBackground: React.FC<AnimatedRomanticBackgroundProps> = ({
  customMediaUrl,
  customMediaType = 'default',
  enableOverlayEffects = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const riverCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Check if a background image or video was added by the user
  const hasUserMedia = Boolean(
    customMediaUrl &&
    typeof customMediaUrl === 'string' &&
    customMediaUrl.trim().length > 0 &&
    (customMediaType === 'image' ||
      customMediaType === 'video' ||
      customMediaType !== 'default' ||
      customMediaUrl.startsWith('data:') ||
      customMediaUrl.startsWith('http'))
  );

  const detectedType: 'video' | 'image' =
    customMediaType === 'video' ||
    (typeof customMediaUrl === 'string' &&
      (customMediaUrl.startsWith('data:video') ||
        /\.(mp4|webm|mov|m4v)($|\?)/i.test(customMediaUrl)))
      ? 'video'
      : 'image';

  // Keep mutable refs for animation loop
  const hasUserMediaRef = useRef(hasUserMedia);
  hasUserMediaRef.current = hasUserMedia;

  const enableOverlayEffectsRef = useRef(enableOverlayEffects);
  enableOverlayEffectsRef.current = enableOverlayEffects;

  useEffect(() => {
    // -------------------------------------------------------------
    // 1. THREE.JS 3D SPINNING CRYSTAL HEART SETUP
    // (Only active when default background is displayed)
    // -------------------------------------------------------------
    const threeCanvas = threeCanvasRef.current;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let heartGroup: THREE.Group | null = null;
    let sparkles: THREE.Points | null = null;
    let heartGeometry: THREE.ExtrudeGeometry | null = null;
    let innerHeartGeo: THREE.ExtrudeGeometry | null = null;
    let wireGeo: THREE.WireframeGeometry | null = null;
    let sparkleGeo: THREE.BufferGeometry | null = null;
    let crystalMaterial: THREE.MeshPhysicalMaterial | null = null;
    let roseCoreMaterial: THREE.MeshStandardMaterial | null = null;
    let wireMat: THREE.LineBasicMaterial | null = null;
    let sparkleMat: THREE.PointsMaterial | null = null;

    if (threeCanvas) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        45,
        threeCanvas.clientWidth / threeCanvas.clientHeight || 1,
        0.1,
        100
      );
      camera.position.set(0, 0, 4.2);

      renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(threeCanvas.clientWidth || 300, threeCanvas.clientHeight || 300);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      // Build 3D Heart Geometry
      const shape = new THREE.Shape();
      const d = 1.05;
      shape.moveTo(0, 0.35 * d);
      shape.bezierCurveTo(0, 0.7 * d, 0.42 * d, 1.02 * d, 0.88 * d, 1.02 * d);
      shape.bezierCurveTo(1.35 * d, 1.02 * d, 1.38 * d, 0.62 * d, 1.38 * d, 0.62 * d);
      shape.bezierCurveTo(1.38 * d, 0.22 * d, 0.95 * d, -0.32 * d, 0, -1.05 * d);
      shape.bezierCurveTo(-0.95 * d, -0.32 * d, -1.38 * d, 0.22 * d, -1.38 * d, 0.62 * d);
      shape.bezierCurveTo(-1.38 * d, 0.62 * d, -1.35 * d, 1.02 * d, -0.88 * d, 1.02 * d);
      shape.bezierCurveTo(-0.42 * d, 1.02 * d, 0, 0.7 * d, 0, 0.35 * d);

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: 0.32,
        bevelEnabled: true,
        bevelSegments: 10,
        steps: 2,
        bevelSize: 0.16,
        bevelThickness: 0.16,
      };

      heartGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      heartGeometry.center();

      crystalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffe4e8,
        emissive: 0x551122,
        emissiveIntensity: 0.35,
        metalness: 0.15,
        roughness: 0.08,
        transmission: 0.75,
        ior: 1.55,
        thickness: 1.2,
        transparent: true,
        opacity: 0.92,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });

      const heartMesh = new THREE.Mesh(heartGeometry, crystalMaterial);

      innerHeartGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.18,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 1,
        bevelSize: 0.08,
        bevelThickness: 0.08,
      });
      innerHeartGeo.center();

      roseCoreMaterial = new THREE.MeshStandardMaterial({
        color: 0xd90429,
        emissive: 0x9f1239,
        emissiveIntensity: 0.65,
        roughness: 0.35,
        metalness: 0.1,
      });

      const innerHeartMesh = new THREE.Mesh(innerHeartGeo, roseCoreMaterial);
      innerHeartMesh.scale.set(0.72, 0.72, 0.72);

      wireGeo = new THREE.WireframeGeometry(heartGeometry);
      wireMat = new THREE.LineBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.3,
      });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);

      heartGroup = new THREE.Group();
      heartGroup.add(heartMesh);
      heartGroup.add(innerHeartMesh);
      heartGroup.add(wireframe);

      const sparkleCount = 28;
      sparkleGeo = new THREE.BufferGeometry();
      const sparklePositions = new Float32Array(sparkleCount * 3);
      for (let i = 0; i < sparkleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.3 + Math.random() * 0.7;
        sparklePositions[i * 3] = Math.cos(angle) * radius;
        sparklePositions[i * 3 + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.4;
        sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      }
      sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
      sparkleMat = new THREE.PointsMaterial({
        color: 0xfff0b3,
        size: 0.06,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      sparkles = new THREE.Points(sparkleGeo, sparkleMat);
      heartGroup.add(sparkles);

      scene.add(heartGroup);

      const ambientLight = new THREE.AmbientLight(0xffc2d1, 1.4);
      scene.add(ambientLight);

      const sunsetKeyLight = new THREE.DirectionalLight(0xffaa44, 3.2);
      sunsetKeyLight.position.set(-2, 1, 3);
      scene.add(sunsetKeyLight);

      const rimLight = new THREE.DirectionalLight(0xff6688, 2.5);
      rimLight.position.set(2, 3, -2);
      scene.add(rimLight);

      const heartInnerGlow = new THREE.PointLight(0xff1144, 2.0, 5);
      heartInnerGlow.position.set(0, 0, 0);
      scene.add(heartInnerGlow);
    }

    // -------------------------------------------------------------
    // 2. CANVAS WATER FLOW & FALLING FLOWERS SIMULATION
    // -------------------------------------------------------------
    const riverCanvas = riverCanvasRef.current;
    if (!riverCanvas) return;
    const ctx = riverCanvas.getContext('2d');
    if (!ctx) return;

    let width = (riverCanvas.width = riverCanvas.clientWidth);
    let height = (riverCanvas.height = riverCanvas.clientHeight);

    const petalColors = [
      '#e63946',
      '#d90429',
      '#ff4d6d',
      '#c9184a',
      '#ff758f',
      '#ff8fa3',
    ];

    const petals: Petal[] = [];
    const ripples: WaterRipple[] = [];

    // Initialize 36 falling petals
    for (let i = 0; i < 36; i++) {
      const isAlreadyOnWater = Math.random() < 0.35;
      const startY = isAlreadyOnWater
        ? height * 0.6 + Math.random() * (height * 0.38)
        : Math.random() * height * 0.6;

      petals.push({
        x: Math.random() * width,
        y: startY,
        z: Math.random() * 0.8 + 0.4,
        vx: (Math.random() - 0.45) * 0.6,
        vy: isAlreadyOnWater ? 0.15 + Math.random() * 0.25 : 0.8 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.03,
        rotationY: Math.random() * Math.PI,
        vRotY: 0.02 + Math.random() * 0.04,
        size: 8 + Math.random() * 12,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        hasLanded: isAlreadyOnWater,
        landTime: isAlreadyOnWater ? performance.now() - Math.random() * 8000 : 0,
        waterWaveOffset: Math.random() * Math.PI * 2,
        opacity: isAlreadyOnWater ? 0.65 : 0.85,
      });
    }

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const handleResize = () => {
      if (!riverCanvas) return;
      width = riverCanvas.width = riverCanvas.clientWidth;
      height = riverCanvas.height = riverCanvas.clientHeight;

      if (threeCanvas && camera && renderer) {
        const tW = threeCanvas.clientWidth;
        const tH = threeCanvas.clientHeight;
        if (tW && tH) {
          camera.aspect = tW / tH;
          camera.updateProjectionMatrix();
          renderer.setSize(tW, tH);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      const isUserActive = hasUserMediaRef.current;
      const overlayOn = enableOverlayEffectsRef.current;
      const elapsedTime = clock.getElapsedTime();

      // A) Update 3D Spinning Heart - ONLY if user has NOT added custom media
      if (!isUserActive && heartGroup && renderer && scene && camera && sparkles) {
        heartGroup.rotation.y = elapsedTime * 0.55;
        heartGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.1;
        heartGroup.rotation.z = Math.cos(elapsedTime * 0.6) * 0.06;
        heartGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.08;

        sparkles.rotation.y = -elapsedTime * 0.3;
        sparkles.rotation.x = elapsedTime * 0.2;

        renderer.render(scene, camera);
      }

      // B) Update 2D Canvas Layer
      ctx.clearRect(0, 0, width, height);

      // If custom media is active and user turned off overlay effects, skip drawing
      if (isUserActive && !overlayOn) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const waterHorizonY = height * 0.55;

      // 1. River Caustics, Sunset Reflections & Water Currents
      // CRITICAL: ONLY draw default river wave lines and sunset reflections if user has NOT added custom media!
      if (!isUserActive) {
        const sunsetReflectCenter = width * 0.68;

        ctx.save();
        const waveCount = 24;
        for (let i = 0; i < waveCount; i++) {
          const rowRatio = i / waveCount;
          const yPos = waterHorizonY + rowRatio * (height - waterHorizonY);
          const waveSpeed = 1.2 + rowRatio * 1.5;
          const waveAmp = (1.5 + rowRatio * 5) * Math.sin(elapsedTime * waveSpeed + i);

          const reflectSpread = (140 + rowRatio * 480) * 0.5;
          const startX = Math.max(0, sunsetReflectCenter - reflectSpread);
          const endX = Math.min(width, sunsetReflectCenter + reflectSpread);

          const grad = ctx.createLinearGradient(startX, yPos, endX, yPos);
          const alpha = (0.08 + rowRatio * 0.18) * (0.6 + 0.4 * Math.sin(elapsedTime * 2.5 + i * 0.8));
          grad.addColorStop(0, 'rgba(255, 140, 60, 0)');
          grad.addColorStop(0.35, `rgba(255, 190, 90, ${alpha * 0.7})`);
          grad.addColorStop(0.5, `rgba(255, 245, 180, ${alpha * 1.2})`);
          grad.addColorStop(0.65, `rgba(255, 160, 70, ${alpha * 0.7})`);
          grad.addColorStop(1, 'rgba(255, 120, 50, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8 + rowRatio * 3.5;
          ctx.beginPath();
          ctx.moveTo(startX, yPos + waveAmp);

          const segments = 8;
          const segWidth = (endX - startX) / segments;
          for (let s = 1; s <= segments; s++) {
            const sx = startX + s * segWidth;
            const sy = yPos + waveAmp + Math.sin(s + elapsedTime * 3 + i) * (1.2 + rowRatio * 2);
            ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }

        // Secondary subtle river ripples
        ctx.lineWidth = 1.2;
        for (let r = 0; r < 14; r++) {
          const yP = waterHorizonY + (r / 14) * (height - waterHorizonY);
          const flowShift = (elapsedTime * 28 + r * 55) % width;
          ctx.strokeStyle = `rgba(255, 180, 200, ${0.04 + (r / 14) * 0.08})`;
          ctx.beginPath();
          ctx.moveTo(flowShift - 80, yP + Math.sin(elapsedTime * 2 + r) * 2);
          ctx.bezierCurveTo(
            flowShift - 40,
            yP - 2,
            flowShift + 40,
            yP + 2,
            flowShift + 80,
            yP
          );
          ctx.stroke();
        }
        ctx.restore();

        // Water ripples from landed flowers
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i];
          rip.radius += 0.45;
          rip.opacity -= 0.012;

          if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = `rgba(255, 210, 180, ${rip.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(rip.x, rip.y, rip.radius * 2.2, rip.radius * 0.65, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Falling Flower Petals
      const now = performance.now();
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        if (isUserActive) {
          // In custom background mode: petals gracefully drift down over the photo/video
          p.hasLanded = false;
          p.y += p.vy * 0.9;
          p.x += p.vx + Math.sin(elapsedTime * 1.5 + p.waterWaveOffset) * 0.5;
          p.rotation += p.vRot;
          p.rotationY += p.vRotY;

          if (p.y > height + 25 || p.x < -30 || p.x > width + 30) {
            p.y = -20 - Math.random() * 50;
            p.x = Math.random() * width;
            p.vy = 0.6 + Math.random() * 1.0;
          }
        } else {
          // In default river background mode: petals land on river water
          if (!p.hasLanded) {
            p.y += p.vy;
            p.x += p.vx + Math.sin(elapsedTime * 2 + p.waterWaveOffset) * 0.8;
            p.rotation += p.vRot;
            p.rotationY += p.vRotY;

            if (p.y >= waterHorizonY + 10 + Math.random() * (height - waterHorizonY - 20)) {
              p.hasLanded = true;
              p.landTime = now;
              p.vy = 0.2 + Math.random() * 0.3;
              p.vx = 0.35 + Math.random() * 0.4;

              ripples.push({
                x: p.x,
                y: p.y,
                radius: 2,
                maxRadius: 18 + Math.random() * 14,
                opacity: 0.7,
                color: '#ffc2d1',
              });
            }
          } else {
            const floatDuration = now - p.landTime;
            p.x += p.vx;
            p.y += p.vy + Math.sin(elapsedTime * 2.2 + p.waterWaveOffset) * 0.35;
            p.rotation += p.vRot * 0.3;

            if (floatDuration > 9000 || p.y > height + 20 || p.x > width + 30) {
              p.x = Math.random() * (width * 0.85);
              p.y = -20 - Math.random() * 80;
              p.hasLanded = false;
              p.vy = 0.7 + Math.random() * 1.1;
              p.vx = (Math.random() - 0.4) * 0.5;
              p.opacity = 0.85;
            }
          }
        }

        // Draw Petal
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const scaleY = p.hasLanded ? 0.45 : Math.max(0.15, Math.abs(Math.cos(p.rotationY)));
        ctx.scale(p.z, p.z * scaleY);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.8, p.size, p.size * 0.4, 0, p.size);
        ctx.bezierCurveTo(-p.size, p.size * 0.4, -p.size * 0.8, -p.size * 0.8, 0, -p.size);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 230, 240, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (renderer) renderer.dispose();
      if (heartGeometry) heartGeometry.dispose();
      if (innerHeartGeo) innerHeartGeo.dispose();
      if (wireGeo) wireGeo.dispose();
      if (sparkleGeo) sparkleGeo.dispose();
      if (crystalMaterial) crystalMaterial.dispose();
      if (roseCoreMaterial) roseCoreMaterial.dispose();
      if (wireMat) wireMat.dispose();
      if (sparkleMat) sparkleMat.dispose();

      scene = null;
      camera = null;
      renderer = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. CUSTOM VIDEO BACKGROUND (If added by user) */}
      {hasUserMedia && detectedType === 'video' && customMediaUrl && (
        <video
          key={customMediaUrl}
          src={customMediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center absolute inset-0"
        />
      )}

      {/* 2. CUSTOM IMAGE BACKGROUND (If added by user) */}
      {hasUserMedia && detectedType === 'image' && customMediaUrl && (
        <img
          key={customMediaUrl}
          src={customMediaUrl}
          alt="Custom background"
          className="w-full h-full object-cover object-center absolute inset-0"
        />
      )}

      {/* 3. DEFAULT BACKGROUND (COMPLETELY REMOVED when user media is present) */}
      {!hasUserMedia && (
        <>
          <img
            src="/romantic_bg.png"
            alt="Romantic evening river scene with candles and roses"
            className="w-full h-full object-cover object-center absolute inset-0"
          />

          {/* 3D Model of Heart Spinning Slowly */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '70.3%',
              top: '44.5%',
              width: 'clamp(260px, 32vw, 520px)',
              height: 'clamp(260px, 32vw, 520px)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <canvas
              ref={threeCanvasRef}
              className="w-full h-full pointer-events-none drop-shadow-[0_0_35px_rgba(255,90,120,0.5)]"
            />
          </div>

          {/* Ambient Candle Glimmers */}
          <div
            className="absolute w-8 h-8 rounded-full bg-amber-400/25 blur-md animate-pulse pointer-events-none"
            style={{ left: '9.5%', bottom: '14%' }}
          />
          <div
            className="absolute w-7 h-7 rounded-full bg-amber-400/25 blur-md animate-pulse delay-100 pointer-events-none"
            style={{ left: '19.5%', bottom: '5.5%' }}
          />
          <div
            className="absolute w-8 h-8 rounded-full bg-amber-400/25 blur-md animate-pulse delay-300 pointer-events-none"
            style={{ right: '14.5%', bottom: '28%' }}
          />
          <div
            className="absolute w-8 h-8 rounded-full bg-amber-400/25 blur-md animate-pulse delay-200 pointer-events-none"
            style={{ right: '7.5%', bottom: '11%' }}
          />
        </>
      )}

      {/* 4. CANVAS OVERLAY (Only floating flower petals if user enabled overlay, or full river motion on default) */}
      {(!hasUserMedia || enableOverlayEffects) && (
        <canvas
          ref={riverCanvasRef}
          className="w-full h-full absolute inset-0 mix-blend-screen pointer-events-none"
        />
      )}

      {/* 5. GENTLE READABILITY GRADIENT OVERLAY */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          hasUserMedia
            ? 'bg-gradient-to-b from-black/25 via-black/10 to-black/35'
            : 'bg-gradient-to-b from-black/20 via-transparent to-black/35'
        }`}
      />
    </div>
  );
};
