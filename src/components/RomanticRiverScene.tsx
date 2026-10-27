import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sparkles, Maximize2, Minimize2, Flower2, RotateCw, Play, Pause, Waves } from 'lucide-react';

interface RomanticRiverSceneProps {
  recipientName: string;
}

export const RomanticRiverScene: React.FC<RomanticRiverSceneProps> = ({
  recipientName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [riverSpeed, setRiverSpeed] = useState<'gentle' | 'normal' | 'vibrant'>('normal');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [petalCountDisplay, setPetalCountDisplay] = useState(45);

  // Mutable refs for Three.js loop to avoid re-initializing scene
  const isAutoSpinningRef = useRef(isAutoSpinning);
  isAutoSpinningRef.current = isAutoSpinning;

  const riverSpeedRef = useRef(riverSpeed);
  riverSpeedRef.current = riverSpeed;

  const spawnPetalsTriggerRef = useRef<((count: number, clientX?: number, clientY?: number) => void) | null>(null);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = mount.clientWidth || 900;
    const height = mount.clientHeight || 500;
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // 3. Studio Environment for Glass Refraction
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffe6eb, 1.2);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xffa372, 2.5);
    warmKeyLight.position.set(4, 5, 4);
    scene.add(warmKeyLight);

    const pinkFillLight = new THREE.DirectionalLight(0xf43f68, 1.8);
    pinkFillLight.position.set(-4, -2, 3);
    scene.add(pinkFillLight);

    const goldenRimLight = new THREE.PointLight(0xffd166, 3.0, 10);
    goldenRimLight.position.set(1.5, 0.2, 1);
    scene.add(goldenRimLight);

    // 5. Background Image Quad (The user's romantic twilight river background)
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('/assets/aistudio/08_clean_romantic_background_b08e1156.png');
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    bgTexture.minFilter = THREE.LinearFilter;

    // Create backdrop plane that matches camera frustum
    const planeGeo = new THREE.PlaneGeometry(16, 9);
    const bgMat = new THREE.MeshBasicMaterial({
      map: bgTexture,
      depthTest: true,
      depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(planeGeo, bgMat);
    bgMesh.position.set(0, 0, -2);
    scene.add(bgMesh);

    // 6. River Motion Surface (Animated Water Shader Overlay on Lower River Area)
    const riverGeo = new THREE.PlaneGeometry(16, 4.5, 64, 32);
    const riverUniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 1.0 },
      uTexture: { value: bgTexture },
    };

    const riverShaderMat = new THREE.ShaderMaterial({
      uniforms: riverUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform float uSpeed;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Water ripple displacement
          float wave1 = sin(pos.x * 2.5 + uTime * 1.5 * uSpeed + pos.y * 1.8) * 0.035;
          float wave2 = cos(pos.x * 5.0 - uTime * 2.2 * uSpeed + pos.y * 3.5) * 0.015;
          float wave3 = sin(pos.x * 8.0 + pos.y * 6.0 + uTime * 3.0 * uSpeed) * 0.008;

          pos.z += wave1 + wave2 + wave3;
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          // River UV mapped to lower half of background (Y: 0.0 to 0.48)
          vec2 bgUv = vec2(vUv.x, vUv.y * 0.48);

          // Animated flowing distortion coordinates
          float flowX = sin(vUv.y * 14.0 + uTime * 2.0 * uSpeed) * 0.006;
          float flowY = cos(vUv.x * 12.0 - uTime * 2.5 * uSpeed) * 0.008;
          flowY += sin(vUv.x * 24.0 + uTime * 3.2 * uSpeed) * 0.004;

          vec4 col = texture2D(uTexture, bgUv + vec2(flowX, flowY));

          // Golden caustic shimmer on sunset water reflection
          float caustic = pow(sin(vUv.x * 32.0 + flowX * 40.0 + uTime * 2.5 * uSpeed) * 0.5 + 0.5, 5.0);
          caustic += pow(cos(vUv.y * 28.0 - flowY * 35.0 + uTime * 2.0 * uSpeed) * 0.5 + 0.5, 4.0);

          // Specular sunset gold highlight
          vec3 goldenShimmer = vec3(1.0, 0.78, 0.45) * (caustic * 0.28);
          vec3 pinkGlow = vec3(0.95, 0.35, 0.55) * (caustic * 0.15);

          // Soft river depth gradient
          float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

          gl_FragColor = vec4(col.rgb + (goldenShimmer + pinkGlow) * edgeFade, 0.82);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const riverMesh = new THREE.Mesh(riverGeo, riverShaderMat);
    // Align with bottom half of background
    riverMesh.position.set(0, -2.1, -1.9);
    scene.add(riverMesh);

    // 7. 3D Glass Crystal Heart Model
    const heartGroup = new THREE.Group();
    // Position aligned with the heart in the image (center-right, over water)
    heartGroup.position.set(1.65, 0.55, 0.2);

    // Parametric 3D Extruded Heart Shape
    const heartShape = new THREE.Shape();
    // Centered smooth cubic bezier heart
    heartShape.moveTo(0, 0.35);
    heartShape.bezierCurveTo(0, 0.65, -0.55, 0.95, -0.95, 0.55);
    heartShape.bezierCurveTo(-1.35, 0.15, -1.05, -0.45, -0.55, -0.85);
    heartShape.bezierCurveTo(-0.25, -1.15, 0, -1.45, 0, -1.65);
    heartShape.bezierCurveTo(0, -1.45, 0.25, -1.15, 0.55, -0.85);
    heartShape.bezierCurveTo(1.05, -0.45, 1.35, 0.15, 0.95, 0.55);
    heartShape.bezierCurveTo(0.55, 0.95, 0, 0.65, 0, 0.35);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 3,
      bevelSize: 0.18,
      bevelThickness: 0.18,
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    // Invert Y so heart points downwards
    heartGeo.rotateZ(Math.PI);
    heartGeo.scale(0.95, 0.95, 0.95);

    // Luxurious Glass Crystal Material
    const crystalHeartMat = new THREE.MeshPhysicalMaterial({
      color: 0xffd5df,
      emissive: 0xff3b6b,
      emissiveIntensity: 0.22,
      roughness: 0.08,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.88,
      opacity: isSoftwareGl ? 0.45 : 1.0,
      transparent: true,
      ior: 1.54,
      thickness: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      attenuationColor: new THREE.Color(0xff88a3),
      attenuationDistance: 1.5,
    });

    const crystalHeartMesh = new THREE.Mesh(heartGeo, crystalHeartMat);
    heartGroup.add(crystalHeartMesh);

    // Inner Velvet Roses & Golden Stamen inside the 3D Heart
    const innerRosesGroup = new THREE.Group();
    const roseGeo = new THREE.DodecahedronGeometry(0.24, 1);
    const roseMat = new THREE.MeshStandardMaterial({
      color: 0xc8102e,
      roughness: 0.45,
      metalness: 0.1,
      emissive: 0x800518,
      emissiveIntensity: 0.3,
    });

    // 5 stylized rose blossoms nestled inside
    const rosePositions = [
      [0, -0.05, 0],
      [-0.22, 0.15, 0.05],
      [0.22, 0.15, 0.05],
      [-0.15, -0.25, -0.05],
      [0.15, -0.25, -0.05],
    ];

    rosePositions.forEach(([rx, ry, rz], i) => {
      const rose = new THREE.Mesh(roseGeo, roseMat);
      rose.position.set(rx, ry, rz);
      rose.scale.set(1 + (i % 2) * 0.2, 1 + (i % 2) * 0.2, 0.8);
      rose.rotation.set(rx * 2, ry * 2, i);
      innerRosesGroup.add(rose);
    });

    // Golden Fairy Dust particles swirling inside the heart
    const sparkleCount = 35;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions[i * 3] = (Math.random() - 0.5) * 0.9;
      sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.9;
      sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffe082,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
    innerRosesGroup.add(sparklePoints);

    heartGroup.add(innerRosesGroup);

    // Glowing halo ring around the heart
    const haloGeo = new THREE.TorusGeometry(1.25, 0.025, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffa3be,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI * 0.4;
    heartGroup.add(haloMesh);

    scene.add(heartGroup);

    // 8. Falling Flowers & Floating Petals in the River
    interface PetalData {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatingOnWater: boolean;
      waterTime: number;
    }

    const petals: PetalData[] = [];
    const maxPetals = 48;

    // Curved Organic Rose Petal Geometry
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, -0.15);
    petalShape.bezierCurveTo(-0.12, -0.05, -0.14, 0.12, 0, 0.18);
    petalShape.bezierCurveTo(0.14, 0.12, 0.12, -0.05, 0, -0.15);

    const petalGeo = new THREE.ShapeGeometry(petalShape, 12);
    // Add subtle curvature across vertex Z
    const posAttr = petalGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      posAttr.setZ(i, (px * px + py * py) * -0.5);
    }
    petalGeo.computeVertexNormals();

    const petalColors = [0xd11338, 0xef4444, 0xf43f5e, 0xfb7185, 0xffa3b8];

    const createPetal = (spawnY?: number, spawnX?: number): PetalData => {
      const mat = new THREE.MeshStandardMaterial({
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      });

      const mesh = new THREE.Mesh(petalGeo, mat);
      const startX = spawnX !== undefined ? spawnX : (Math.random() - 0.5) * 12;
      const startY = spawnY !== undefined ? spawnY : 2.5 + Math.random() * 2.5;
      const startZ = (Math.random() - 0.5) * 4 - 0.5;

      mesh.position.set(startX, startY, startZ);
      const s = 0.7 + Math.random() * 0.6;
      mesh.scale.set(s, s, s);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      scene.add(mesh);

      return {
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          -(0.012 + Math.random() * 0.018), // downward fall
          (Math.random() - 0.5) * 0.008
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.02
        ),
        floatingOnWater: false,
        waterTime: 0,
      };
    };

    // Initialize 45 petals distributed from sky down into the water
    for (let i = 0; i < maxPetals; i++) {
      const spawnY = -2.2 + Math.random() * 5.0;
      petals.push(createPetal(spawnY));
    }

    // Function to trigger extra petals on click/button
    spawnPetalsTriggerRef.current = (count: number, clientX?: number, clientY?: number) => {
      let worldX = 0;
      let worldY = 3.0;

      if (clientX !== undefined && clientY !== undefined && mount) {
        const rect = mount.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        worldX = normX * 4.5;
        worldY = Math.max(0.5, normY * 3.0 + 1.5);
      }

      for (let i = 0; i < count; i++) {
        const offset = (Math.random() - 0.5) * 1.5;
        petals.push(createPetal(worldY + Math.random() * 0.8, worldX + offset));
      }
      setPetalCountDisplay(petals.length);
    };

    // 9. Interactive Drag / Touch Orbit for 3D Heart
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let manualHeartRotationY = 0;
    let manualHeartRotationX = 0;

    const onPointerDown = (e: PointerEvent) => {
      // If clicking directly on UI buttons, don't drag
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      // Drop 3 flower petals at tap location!
      if (spawnPetalsTriggerRef.current) {
        spawnPetalsTriggerRef.current(3, e.clientX, e.clientY);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      manualHeartRotationY += deltaX * 0.012;
      manualHeartRotationX += deltaY * 0.008;
      manualHeartRotationX = Math.max(-0.6, Math.min(0.6, manualHeartRotationX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation & Render Loop
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    const waterSurfaceY = -0.95; // Y level of river surface in 3D world space

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // River motion speed multiplier
      let speedMult = 1.0;
      if (riverSpeedRef.current === 'gentle') speedMult = 0.55;
      if (riverSpeedRef.current === 'vibrant') speedMult = 1.65;

      riverUniforms.uTime.value = elapsed;
      riverUniforms.uSpeed.value = speedMult;

      // 3D Heart Rotation & Gentle Floating Bob
      if (isAutoSpinningRef.current && !isDragging) {
        manualHeartRotationY += delta * 0.55;
      }

      heartGroup.rotation.y = manualHeartRotationY;
      heartGroup.rotation.x = manualHeartRotationX + Math.sin(elapsed * 1.5) * 0.04;
      heartGroup.position.y = 0.55 + Math.sin(elapsed * 1.8) * 0.09;

      // Halo gentle spin
      haloMesh.rotation.z += delta * 0.3;

      // Sparkle twinkle inside heart
      sparkleMat.opacity = 0.65 + Math.sin(elapsed * 4.0) * 0.3;

      // Petal Falling & River Drift Physics
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];

        if (!p.floatingOnWater) {
          // Falling through the air with aerodynamic swaying
          p.mesh.position.y += p.velocity.y * (speedMult * 0.8 + 0.2);
          p.mesh.position.x += Math.sin(elapsed * 2.0 + p.mesh.position.y * 3.0) * 0.006 + p.velocity.x;
          p.mesh.position.z += p.velocity.z;

          p.mesh.rotation.x += p.rotSpeed.x;
          p.mesh.rotation.y += p.rotSpeed.y;
          p.mesh.rotation.z += p.rotSpeed.z;

          // Check if reached river water surface
          if (p.mesh.position.y <= waterSurfaceY + (Math.sin(p.mesh.position.x * 2.0 + elapsed) * 0.04)) {
            p.floatingOnWater = true;
            p.waterTime = 0;
            // Align petal flat on the water
            p.mesh.rotation.x = -Math.PI * 0.45;
          }
        } else {
          // Floating on river surface and drifting downstream along river current
          p.waterTime += delta;
          // Current flows gently down and towards camera (+Z, slightly right +X)
          p.mesh.position.x += 0.007 * speedMult;
          p.mesh.position.z += 0.008 * speedMult;
          // Bob up and down on the water ripples
          p.mesh.position.y = waterSurfaceY + Math.sin(p.mesh.position.x * 3.0 + elapsed * 2.0 * speedMult) * 0.025;
          p.mesh.rotation.z += delta * 0.15 * speedMult;

          // Fade out as it drifts close to camera or past boundary
          if (p.mesh.position.z > 3.5 || p.mesh.position.x > 7.0 || p.waterTime > 20) {
            // Respawn back at top of sky
            p.floatingOnWater = false;
            p.mesh.position.set((Math.random() - 0.5) * 11, 2.5 + Math.random() * 2.0, (Math.random() - 0.5) * 3 - 0.5);
            p.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          }
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Dispose Three.js objects
      planeGeo.dispose();
      bgMat.dispose();
      bgTexture.dispose();
      riverGeo.dispose();
      riverShaderMat.dispose();
      heartGeo.dispose();
      crystalHeartMat.dispose();
      roseGeo.dispose();
      roseMat.dispose();
      sparkleGeo.dispose();
      sparkleMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      petalGeo.dispose();

      petals.forEach((p) => {
        scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleDropPetals = useCallback(() => {
    if (spawnPetalsTriggerRef.current) {
      spawnPetalsTriggerRef.current(10);
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <section
      id="dream-river"
      ref={containerRef}
      className={`relative transition-all duration-500 max-w-6xl mx-auto px-4 sm:px-6 my-16 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-0 m-0 max-w-none bg-black flex items-center justify-center'
          : ''
      }`}
    >
      {/* Scrapbook Container */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-200/90 transition-all ${
          isFullscreen ? 'h-full rounded-none border-0' : 'aspect-[16/9] min-h-[440px] sm:min-h-[540px]'
        }`}
      >
        {/* Top Washi Tape (hidden in fullscreen) */}
        {!isFullscreen && (
          <>
            <div className="absolute -top-3 left-12 washi-tape-pink w-32 h-6 -rotate-2 rounded-xs z-20"></div>
            <div className="absolute -top-3 right-12 washi-tape-gold w-32 h-6 rotate-1 rounded-xs z-20"></div>
          </>
        )}

        {/* 3D WebGL Canvas Mount Container */}
        <div
          ref={canvasMountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        />

        {/* Minimal Header Badge Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-300/30 text-white flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-pink-300 animate-spin-slow" />
            <span className="font-serif-romantic text-xs sm:text-sm font-semibold tracking-wide">
              The Enchanted Twilight River
            </span>
            <span className="text-[11px] text-pink-200 hidden sm:inline">
              · For {recipientName || 'You'}
            </span>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleDropPetals}
            title="Drop flower petals into the river"
            className="px-3 py-1.5 rounded-full bg-rose-500/85 hover:bg-rose-600 text-white text-xs font-medium backdrop-blur-md shadow-lg border border-rose-300/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Drop Petals 🌸</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Unified Bottom Control Dock (Three.js Skill Directive) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-auto max-w-[94vw] transition-all duration-300">
          {/* Toggle Tab */}
          <div className="flex justify-center mb-1">
            <button
              onClick={() => setControlsCollapsed(!controlsCollapsed)}
              className="px-3 py-0.5 rounded-t-lg bg-black/50 text-white/80 hover:text-white text-[11px] font-medium backdrop-blur-md border-t border-x border-pink-300/20 cursor-pointer"
            >
              {controlsCollapsed ? '▴ Show Scene Controls' : '▾ Hide Controls'}
            </button>
          </div>

          {!controlsCollapsed && (
            <div className="bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-pink-300/30 shadow-2xl flex flex-wrap items-center justify-center gap-4 text-xs text-white">
              {/* 3D Heart Auto-Spin Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-pink-200 text-[11px] font-medium">3D Heart:</span>
                <button
                  onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAutoSpinning
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  {isAutoSpinning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAutoSpinning ? 'Auto-Spinning' : 'Free Touch'}</span>
                </button>
              </div>

              {/* River Flow Speed */}
              <div className="flex items-center gap-1.5 border-l border-white/20 pl-3">
                <Waves className="w-3.5 h-3.5 text-pink-300" />
                <span className="text-pink-200 text-[11px] font-medium">River Current:</span>
                <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                  {(['gentle', 'normal', 'vibrant'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setRiverSpeed(spd)}
                      className={`px-2 py-0.5 rounded-md text-[11px] capitalize transition-colors cursor-pointer ${
                        riverSpeed === spd
                          ? 'bg-rose-500 text-white font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Touch hint */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-pink-200/80 border-l border-white/20 pl-3">
                <RotateCw className="w-3 h-3 text-pink-400" />
                <span>Drag to spin 3D heart · Tap water to drop petals</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Scrapbook Caption beneath frame */}
      {!isFullscreen && (
        <div className="text-center mt-3">
          <p className="font-handwriting text-2xl text-pink-600">
            &ldquo;May our love always flow peaceful and steady like this golden river...&rdquo; 💖
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
            <span>Tap anywhere on the river to drop rose petals</span>
            <span aria-hidden="true">·</span>
            <span>Drag to rotate the 3D crystal heart</span>
          </div>
        </div>
      )}
    </section>
  );
};
