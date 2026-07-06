function setupSignalReveal() {
  const elements = document.querySelectorAll("[data-reveal]");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  elements.forEach((element) => observer.observe(element));
}

function setupWebglParticles() {
  const container = document.getElementById("webgl-container");
  const particleFrame = document.getElementById("particle-frame");
  const explodeButton = document.getElementById("hero-explode-btn");
  const particleStat = document.getElementById("stat-particles");
  const callout1 = document.getElementById("hud-callout-1");
  const callout2 = document.getElementById("hud-callout-2");

  if (!container || !particleFrame) return;
  if (!window.THREE || !window.gsap) return;

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const particleCount = isMobile ? 3000 : 15000;
  if (particleStat) particleStat.textContent = `${particleCount.toLocaleString()} PARTICLES`;

  let currentShape = "torus";
  let staticMode = false;
  let isExploded = false;
  let explosionFactor = 1;
  let isMorphingShape = false;
  let isIntro = true;
  let introProgress = 0;

  const logoMotionState = { strength: 0 };
  const rotationState = { y: 0, logoBlend: 0 };
  const ndcMouse = new THREE.Vector2(-999, -999);
  const mouseWorld = new THREE.Vector3();
  const mouseLocal = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020204, 0.006);

  const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 280);
  camera.position.z = 25.5;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const nexusGroup = new THREE.Group();
  scene.add(nexusGroup);

  function createSharpParticleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.18, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.32, "rgba(6, 182, 212, 0.85)");
    gradient.addColorStop(0.6, "rgba(3, 105, 120, 0.25)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  const positions = { logo: [], torus: [], wave: [] };
  const colors = [];
  const sizes = [];
  const baseSizes = [];
  const logoDepthLayers = [];
  const logoOrbitBands = [];
  const logoPhases = [];
  const logoPhis = [];
  const logoThetas = [];
  const logoBaseRs = [];

  function generateLogoPositions(i) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const latitude = Math.sin(phi);
    const orbitBand = Math.sin(phi * 18 + theta * 0.35);
    const longitudeGroove = Math.sin(theta * 7 + phi * 2);
    const layerNoise = Math.sin(i * 12.9898) * Math.cos(i * 78.233);
    const surfaceRipple = orbitBand * 0.055 + longitudeGroove * 0.03 + layerNoise * 0.035;
    const isOuterLayer = i % 7 === 0;
    const isInnerLayer = i % 11 === 0;
    const baseR = 8;
    const r = baseR + surfaceRipple + (isOuterLayer ? 0.08 : 0) - (isInnerLayer ? 0.05 : 0);

    logoDepthLayers[i] = isOuterLayer ? 1 : isInnerLayer ? -1 : 0;
    logoOrbitBands[i] = Math.min(1, Math.max(0, Math.abs(orbitBand)) * latitude);
    logoPhases[i] = theta + phi * 2.4 + layerNoise;
    logoPhis[i] = phi;
    logoThetas[i] = theta;
    logoBaseRs[i] = baseR;

    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );
  }

  function generateTorusPositions() {
    const angle = Math.random() * Math.PI * 2;
    const tubeAngle = Math.random() * Math.PI * 2;
    const radius = 8;
    const tubeRadius = 2.2;
    return new THREE.Vector3(
      (radius + tubeRadius * Math.cos(tubeAngle)) * Math.cos(angle),
      (radius + tubeRadius * Math.cos(tubeAngle)) * Math.sin(angle),
      tubeRadius * Math.sin(tubeAngle),
    );
  }

  function generateWavePositions(i) {
    const side = Math.ceil(Math.sqrt(particleCount));
    const col = i % side;
    const row = Math.floor(i / side);
    const width = 24;
    const height = 18;
    const x = (col / (side - 1) - 0.5) * width;
    const y = (row / (side - 1) - 0.5) * height;
    const d = Math.sqrt(x * x + y * y);
    return new THREE.Vector3(x, y, Math.sin(d * 0.8) * 1.5);
  }

  const spawnPositions = new Float32Array(particleCount * 3);
  const introEdgePositions = new Float32Array(particleCount * 3);
  const introDelays = new Float32Array(particleCount);
  const introDepthBias = new Float32Array(particleCount);

  function setVec3(arr, i, x, y, z) {
    const idx = i * 3;
    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  function easeOutCubic(t) {
    const clamped = Math.min(1, Math.max(0, t));
    return 1 - Math.pow(1 - clamped, 3);
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function mixChannel(a, b, t) {
    return a + (b - a) * t;
  }

  function getPreviewGradientColor(x, y, z, lightBoost = 0) {
    const diagonal = clamp01((x * 0.045 - y * 0.055 + z * 0.018 + 0.72) / 1.44);
    const highlight = clamp01((1 - diagonal) * 0.56 + lightBoost * 0.28);
    const mid = clamp01(Math.sin(diagonal * Math.PI) * 0.72);
    const deep = clamp01(Math.pow(diagonal, 0.62));

    const pale = { r: 0.88, g: 0.99, b: 1 };
    const cyan = { r: 0.05, g: 0.72, b: 1 };
    const blue = { r: 0.02, g: 0.2, b: 0.78 };

    const r = mixChannel(mixChannel(pale.r, cyan.r, mid), blue.r, deep);
    const g = mixChannel(mixChannel(pale.g, cyan.g, mid), blue.g, deep);
    const b = mixChannel(mixChannel(pale.b, cyan.b, mid), blue.b, deep);

    return {
      r: clamp01(r + highlight * 0.22),
      g: clamp01(g + highlight * 0.18),
      b: clamp01(b + highlight * 0.12),
    };
  }

  function accelerateFlow(t) {
    const clamped = Math.min(1, Math.max(0, t));
    return clamped * clamped * (3 - 2 * clamped);
  }

  function generateIntroPositions() {
    for (let i = 0; i < particleCount; i += 1) {
      const idx = i * 3;
      const target = positions.torus[i];
      const targetAngle = Math.atan2(target.y, target.x);
      const radialX = Math.cos(targetAngle);
      const radialY = Math.sin(targetAngle);
      const tangentX = -Math.sin(targetAngle);
      const tangentY = Math.cos(targetAngle);
      const targetRadius = Math.sqrt(target.x * target.x + target.y * target.y) || 8;
      const laneJitter = (Math.random() - 0.5) * 1.15;

      introDepthBias[i] = (i % 2 === 0 ? 1 : -1) * (1.2 + Math.random() * 2.4);

      const startRadius = targetRadius + 25 + Math.random() * 15;
      const startDepth = introDepthBias[i] * 8 + (Math.random() - 0.5) * 12;
      setVec3(
        introEdgePositions,
        i,
        radialX * startRadius + tangentX * laneJitter,
        radialY * startRadius + tangentY * laneJitter,
        startDepth,
      );

      introDelays[i] = Math.pow(Math.random(), 1.35) * 0.75;
      spawnPositions[idx] = introEdgePositions[idx];
      spawnPositions[idx + 1] = introEdgePositions[idx + 1];
      spawnPositions[idx + 2] = introEdgePositions[idx + 2];
    }
  }

  for (let i = 0; i < particleCount; i += 1) {
    positions.logo.push(generateLogoPositions(i));
    positions.torus.push(generateTorusPositions(i));
    positions.wave.push(generateWavePositions(i));
    colors.push(0.45, 0.9, 1);
    const baseSize = isMobile ? 0.9 + Math.random() * 0.8 : 1.5 + Math.random() * 1.8;
    baseSizes.push(baseSize);
    sizes.push(baseSize);
  }
  generateIntroPositions();

  const geometry = new THREE.BufferGeometry();
  const currentPositionsAttr = new Float32Array(particleCount * 3);
  const velocitiesAttr = new Float32Array(particleCount * 3);
  const homesAttr = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const pos = positions.torus[i];
    const idx = i * 3;
    currentPositionsAttr[idx] = spawnPositions[idx];
    currentPositionsAttr[idx + 1] = spawnPositions[idx + 1];
    currentPositionsAttr[idx + 2] = spawnPositions[idx + 2];
    homesAttr[idx] = pos.x;
    homesAttr[idx + 1] = pos.y;
    homesAttr[idx + 2] = pos.z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(currentPositionsAttr, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.16 : 0.24,
    map: createSharpParticleTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.98,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particleSystem = new THREE.Points(geometry, particleMaterial);
  nexusGroup.add(particleSystem);

  const dustCount = isMobile ? 500 : 2000;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);

  for (let i = 0; i < dustCount; i += 1) {
    const r = 10 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const bright = Math.random() > 0.8;
    dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dustPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    dustPositions[i * 3 + 2] = r * Math.cos(phi);
    dustColors[i * 3] = 0;
    dustColors[i * 3 + 1] = bright ? 0.4 : 0.1;
    dustColors[i * 3 + 2] = bright ? 0.6 : 0.25;
    dustSizes[i] = 0.5 + Math.random() * 0.8;
  }

  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  dustGeometry.setAttribute("size", new THREE.BufferAttribute(dustSizes, 1));

  const dustMaterial = new THREE.PointsMaterial({
    size: 0.12,
    map: createSharpParticleTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const dustSystem = new THREE.Points(dustGeometry, dustMaterial);
  nexusGroup.add(dustSystem);

  function updateNexusGroupPosition() {
    const rect = particleFrame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const centerX = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 2 - 1;
    const centerY = -(((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 2 - 1);
    const vector = new THREE.Vector3(centerX, centerY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    nexusGroup.position.copy(camera.position.clone().add(dir.multiplyScalar(distance)));
  }

  function setTargetShape(shapeName) {
    if (staticMode || isIntro) return;
    isMorphingShape = true;
    gsap.killTweensOf(logoMotionState);
    gsap.killTweensOf(rotationState);
    logoMotionState.strength = 0;
    if (shapeName !== "logo") {
      gsap.to(rotationState, { logoBlend: 0, duration: 1.2, ease: "power2.out" });
    } else {
      rotationState.logoBlend = 0;
    }

    currentShape = shapeName;
    const targetSet = positions[shapeName];
    const tweenState = { progress: 0 };
    const startHomes = new Float32Array(homesAttr);
    gsap.to(dustSystem.material, { opacity: shapeName === "logo" ? 0.45 : 0, duration: shapeName === "logo" ? 1 : 0.6 });
    gsap.to(tweenState, {
      progress: 1,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        for (let i = 0; i < particleCount; i += 1) {
          const target = targetSet[i];
          const idx = i * 3;
          homesAttr[idx] = startHomes[idx] + (target.x - startHomes[idx]) * tweenState.progress;
          homesAttr[idx + 1] = startHomes[idx + 1] + (target.y - startHomes[idx + 1]) * tweenState.progress;
          homesAttr[idx + 2] = startHomes[idx + 2] + (target.z - startHomes[idx + 2]) * tweenState.progress;
        }
      },
      onComplete: () => {
        isMorphingShape = false;
        if (shapeName === "logo") {
          gsap.to(logoMotionState, { strength: 1, duration: 1, ease: "power2.out" });
          gsap.to(rotationState, { logoBlend: 1, duration: 1, ease: "power2.out" });
        }
      },
    });
  }

  const availableStates = ["torus", "logo", "wave"];
  const firstShapeHoldMs = 2200;
  const shapeCycleMs = 3500;
  let currentStateIndex = 0;
  let autoCycleTimer = null;
  let firstCycleTimer = null;

  function advanceAutomaticShape() {
    if (staticMode || isExploded || isIntro) return;
    currentStateIndex = (currentStateIndex + 1) % availableStates.length;
    const nextShapeName = availableStates[currentStateIndex];
    setTargetShape(nextShapeName);
  }

  function startAutomaticReconfiguration(useShortFirstHold = false) {
    if (autoCycleTimer) clearInterval(autoCycleTimer);
    if (firstCycleTimer) clearTimeout(firstCycleTimer);
    const startCycle = () => {
      advanceAutomaticShape();
      autoCycleTimer = setInterval(() => {
        advanceAutomaticShape();
      }, shapeCycleMs);
    };
    if (useShortFirstHold) {
      firstCycleTimer = setTimeout(startCycle, firstShapeHoldMs);
    } else {
      startCycle();
    }
  }

  function playIntroAnimation() {
    gsap.to({ val: 0 }, {
      val: 1,
      duration: 3.05,
      ease: "power3.out",
      onUpdate() {
        introProgress = this.targets()[0].val;
      },
      onComplete: () => {
        isIntro = false;
        gsap.to(dustSystem.material, { opacity: 0.45, duration: 1.5 });
        startAutomaticReconfiguration(true);
      },
    });
  }

  function explodeLogo() {
    if (staticMode || isExploded || isIntro) return;
    isExploded = true;
    explosionFactor = 1;
    const posArr = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i += 1) {
      const idx = i * 3;
      const px = posArr[idx];
      const py = posArr[idx + 1];
      const pz = posArr[idx + 2];
      const d = Math.sqrt(px * px + py * py + pz * pz) || 1;
      const force = 12 + Math.random() * 16;
      velocitiesAttr[idx] = (px / d) * force + (Math.random() - 0.5) * 6;
      velocitiesAttr[idx + 1] = (py / d) * force + (Math.random() - 0.5) * 6;
      velocitiesAttr[idx + 2] = (pz / d) * force + (Math.random() - 0.5) * 6;
    }
    gsap.to({ val: 1 }, {
      val: 0,
      duration: 0.8,
      delay: 0.4,
      ease: "power2.inOut",
      onUpdate() {
        explosionFactor = this.targets()[0].val;
      },
      onComplete: () => {
        isExploded = false;
        velocitiesAttr.fill(0);
      },
    });
  }

  if (explodeButton) {
    explodeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      explodeLogo();
    });
  }

  function updateMouseProjection(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    ndcMouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndcMouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    const intensity = 20;
    if (callout1) gsap.to(callout1, { x: ndcMouse.x * intensity, y: -ndcMouse.y * intensity, duration: 0.8 });
    if (callout2) gsap.to(callout2, { x: ndcMouse.x * intensity, y: -ndcMouse.y * intensity, duration: 0.8 });
  }

  window.addEventListener("mousemove", (event) => updateMouseProjection(event.clientX, event.clientY));
  window.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches[0]) updateMouseProjection(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: true },
  );
  window.addEventListener("mouseleave", () => {
    ndcMouse.set(-999, -999);
    gsap.to([callout1, callout2].filter(Boolean), { x: 0, y: 0, duration: 0.8 });
  });
  window.addEventListener("touchend", () => {
    ndcMouse.set(-999, -999);
    gsap.to([callout1, callout2].filter(Boolean), { x: 0, y: 0, duration: 0.8 });
  });

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    updateNexusGroupPosition();
  });

  const frameResizeObserver = new ResizeObserver(updateNexusGroupPosition);
  frameResizeObserver.observe(particleFrame);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.033);
    const time = clock.elapsedTime;
    const posArr = geometry.attributes.position.array;
    const colArr = geometry.attributes.color.array;

    if (!staticMode) {
      const isMouseActive = ndcMouse.x !== -999;
      if (isMouseActive) {
        const normal = new THREE.Vector3();
        camera.getWorldDirection(normal);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, nexusGroup.position);
        raycaster.setFromCamera(ndcMouse, camera);
        raycaster.ray.intersectPlane(plane, mouseWorld);
        mouseLocal.copy(mouseWorld);
        particleSystem.worldToLocal(mouseLocal);
      } else {
        mouseLocal.set(-999, -999, -999);
      }

      if (isIntro) {
        const progress = Math.min(introProgress, 1);
        const torusMotionBlend = easeOutCubic(Math.max(0, (progress - 0.72) / 0.24));
        rotationState.y += delta * 0.18 * torusMotionBlend;
        for (let i = 0; i < particleCount; i += 1) {
          const idx = i * 3;
          const hx = homesAttr[idx];
          const hy = homesAttr[idx + 1];
          const hz = homesAttr[idx + 2];
          const targetAngle = Math.atan2(hy, hx);
          const tangentX = -Math.sin(targetAngle);
          const tangentY = Math.cos(targetAngle);
          const delay = introDelays[i];
          const sparkle = 0.72 + Math.sin(time * 13 + i * 0.41) * 0.28;
          const depthBias = introDepthBias[i];
          const remainingDuration = 1 - delay;
          const local = (progress - delay) / remainingDuration;
          let visibility = 0;
          let travel = 0;
          let px = introEdgePositions[idx];
          let py = introEdgePositions[idx + 1];
          let pz = introEdgePositions[idx + 2];

          if (local > 0) {
            const t = Math.min(1, Math.max(0, local));
            travel = accelerateFlow(t);
            const flow = Math.sin(Math.PI * travel);
            px = introEdgePositions[idx] + (hx - introEdgePositions[idx]) * travel + tangentX * flow * (0.16 + (i % 7) * 0.01);
            py = introEdgePositions[idx + 1] + (hy - introEdgePositions[idx + 1]) * travel + tangentY * flow * (0.16 + (i % 7) * 0.01);
            pz = introEdgePositions[idx + 2] + (hz - introEdgePositions[idx + 2]) * travel + flow * depthBias * 1.15;
            visibility = Math.min(1, local * 6);
          }

          posArr[idx] = px;
          posArr[idx + 1] = py;
          posArr[idx + 2] = pz;

          const ringGlow = easeOutCubic(Math.max(0, (progress - 0.12) / 0.88));
          const depthScale = Math.min(1.9, Math.max(0.38, 1 + pz * 0.055));
          const depthLight = Math.min(1.45, Math.max(0.35, 0.86 + pz * 0.045));
          const highlight = i % 11 === 0 ? 1.32 : i % 7 === 0 ? 1.16 : 1;
          const introGlow = 0.32 + ringGlow * 0.68;
          const introLight = depthLight * highlight;

          geometry.attributes.size.array[i] = baseSizes[i] * visibility * depthScale * (0.35 + sparkle * 0.65) * (0.58 + ringGlow * 0.42);
          const introColor = getPreviewGradientColor(px, py, pz, ringGlow);
          const introSparkle = (0.85 + sparkle * 0.15) * introLight;
          colArr[idx] = introColor.r * introGlow * introSparkle;
          colArr[idx + 1] = introColor.g * introGlow * introSparkle;
          colArr[idx + 2] = introColor.b * introGlow * introSparkle;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        particleSystem.rotation.y = rotationState.y;
        particleSystem.rotation.x = 0;
        particleSystem.rotation.z = 0;
      } else {
        const logoMotionStrength = currentShape === "logo" && !isMorphingShape ? logoMotionState.strength : 0;
        const springStrength = isExploded ? 0.01 + (1 - explosionFactor) * 0.16 : currentShape === "logo" && logoMotionStrength > 0 ? 0.058 : 0.05;
        const damping = isExploded ? 0.94 : currentShape === "logo" && logoMotionStrength > 0 ? 0.74 : 0.82;
        const repelRadius = 6.5;

        for (let i = 0; i < particleCount; i += 1) {
          const idx = i * 3;
          let px = posArr[idx];
          let py = posArr[idx + 1];
          let pz = posArr[idx + 2];
          let hx = homesAttr[idx];
          let hy = homesAttr[idx + 1];
          let hz = homesAttr[idx + 2];

          if (currentShape === "logo" && !isExploded && logoMotionStrength > 0) {
            const phase = logoPhases[i] || 0;
            const phi = logoPhis[i];
            const theta = logoThetas[i];
            const dynamicR =
              (logoBaseRs[i] || 8) +
              Math.sin(phi * 5.2 + time * 3.8 + (logoDepthLayers[i] || 0) * 0.6) * 0.16 * logoMotionStrength +
              Math.cos(theta * 7 + time * 2.1 + phase * 0.12) * 0.12 * logoMotionStrength +
              Math.sin(time * 2.6 + phase) * (logoOrbitBands[i] || 0) * 0.08 * logoMotionStrength;
            hx = dynamicR * Math.sin(phi) * Math.cos(theta);
            hy = dynamicR * Math.sin(phi) * Math.sin(theta);
            hz = dynamicR * Math.cos(phi);
            homesAttr[idx] = hx;
            homesAttr[idx + 1] = hy;
            homesAttr[idx + 2] = hz;
          }

          if (isMorphingShape && !isExploded) {
            const morphFollow = 0.22;
            velocitiesAttr[idx] = 0;
            velocitiesAttr[idx + 1] = 0;
            velocitiesAttr[idx + 2] = 0;
            posArr[idx] = px + (hx - px) * morphFollow;
            posArr[idx + 1] = py + (hy - py) * morphFollow;
            posArr[idx + 2] = pz + (hz - pz) * morphFollow;
            continue;
          }

          let ax = (hx - px) * springStrength;
          let ay = (hy - py) * springStrength;
          let az = (hz - pz) * springStrength;
          let mouseGlow = 0;

          if (isMouseActive) {
            const dx = px - mouseLocal.x;
            const dy = py - mouseLocal.y;
            const dz = pz - mouseLocal.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
            if (dist < repelRadius) {
              mouseGlow = Math.pow(1 - dist / repelRadius, 2);
              ax += (dx / dist) * mouseGlow * 8.8;
              ay += (dy / dist) * mouseGlow * 8.8;
              az += (dz / dist) * mouseGlow * 8.8;
              ax += (-dy / dist) * mouseGlow * 5.2;
              ay += (dx / dist) * mouseGlow * 5.2;
            }
          }

          if (currentShape === "wave" && !isExploded) {
            const distFromCenter = Math.sqrt(hx * hx + hy * hy);
            homesAttr[idx + 2] = Math.sin(distFromCenter * 0.6 - time * 3) * 1.5;
          }

          if (currentShape === "torus" && !isExploded) {
            const angleStep = 0.006 * (1 + (i % 3));
            const cosA = Math.cos(angleStep);
            const sinA = Math.sin(angleStep);
            const rx = hx * cosA - hy * sinA;
            const ry = hx * sinA + hy * cosA;
            homesAttr[idx] = rx;
            homesAttr[idx + 1] = ry;
          }

          const currentDamping = damping - mouseGlow * 0.12;
          velocitiesAttr[idx] = (velocitiesAttr[idx] + ax) * currentDamping;
          velocitiesAttr[idx + 1] = (velocitiesAttr[idx + 1] + ay) * currentDamping;
          velocitiesAttr[idx + 2] = (velocitiesAttr[idx + 2] + az) * currentDamping;

          posArr[idx] += velocitiesAttr[idx];
          posArr[idx + 1] += velocitiesAttr[idx + 1];
          posArr[idx + 2] += velocitiesAttr[idx + 2];
        }

        geometry.attributes.position.needsUpdate = true;

        const lWorldX = 0.82;
        const lWorldY = 0.45;
        const lWorldZ = 0.35;
        const logoRotationBlend = rotationState.logoBlend;
        const baseSpinSpeed = currentShape === "torus" ? 0.18 : 0.03;
        rotationState.y += delta * (baseSpinSpeed + (0.32 - baseSpinSpeed) * logoRotationBlend);
        const logoSpinY = rotationState.y;
        const rotYCol = rotationState.y;
        const cosRCol = Math.cos(-rotYCol);
        const sinRCol = Math.sin(-rotYCol);
        const lx = lWorldX * cosRCol - lWorldZ * sinRCol;
        const ly = lWorldY;
        const lz = lWorldX * sinRCol + lWorldZ * cosRCol;

        for (let i = 0; i < particleCount; i += 1) {
          const idx = i * 3;
          const hx = homesAttr[idx];
          const hy = homesAttr[idx + 1];
          const hz = homesAttr[idx + 2];
          const distToOrigin = Math.sqrt(hx * hx + hy * hy + hz * hz) || 8;
          const nx = hx / distToOrigin;
          const ny = hy / distToOrigin;
          const nz = hz / distToOrigin;
          const dot = nx * lx + ny * ly + nz * lz;
          const rim = Math.pow(Math.max(0, 1 - Math.abs(nz)), currentShape === "logo" ? 1.8 : 1.6);
          const depth = (nz + 1) * 0.5;
          const shimmer = (Math.sin(time * 1.7 + i * 0.137 + hx * 0.21) + 1) * 0.5;
          const light = Math.max(0, dot);
          const bandGlow = currentShape === "logo" ? Math.pow(logoOrbitBands[i] || 0, 1.7) * (0.45 + shimmer * 0.35) : 0;
          const glow = Math.min(1, 0.18 + depth * 0.32 + light * 0.38 + rim * 0.38 + bandGlow);
          const whiteBlend = Math.min(1, Math.max(0, rim * 0.65 + light * 0.34 + depth * 0.22 + bandGlow * 0.45));

          if (currentShape === "torus") {
            const blueGlow = Math.min(1, 0.48 + depth * 0.18 + light * 0.22 + rim * 0.24 + shimmer * 0.08);
            const torusColor = getPreviewGradientColor(hx, hy, hz, blueGlow);
            colArr[idx] = torusColor.r * (0.72 + blueGlow * 0.36);
            colArr[idx + 1] = torusColor.g * (0.72 + blueGlow * 0.36);
            colArr[idx + 2] = torusColor.b * (0.78 + blueGlow * 0.34);
          } else {
            const previewColor = getPreviewGradientColor(hx, hy, hz, whiteBlend);
            colArr[idx] = previewColor.r * (0.42 + glow * 0.66);
            colArr[idx + 1] = previewColor.g * (0.42 + glow * 0.66);
            colArr[idx + 2] = previewColor.b * (0.48 + glow * 0.58);
          }
          geometry.attributes.size.array[i] = baseSizes[i] * (0.68 + glow * 0.34 + rim * 0.12 + light * 0.08);
        }

        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;

        const nonLogoRotX = Math.sin(time * 0.03) * 0.03;
        const logoRotX = Math.sin(time * 0.45) * 0.12 + 0.08;
        const logoRotZ = Math.sin(time * 0.28) * 0.045;
        particleSystem.rotation.y = logoSpinY;
        particleSystem.rotation.x = nonLogoRotX + (logoRotX - nonLogoRotX) * logoRotationBlend;
        particleSystem.rotation.z = logoRotZ * logoRotationBlend;
        dustSystem.rotation.y = currentShape === "logo" ? -time * 0.045 : time * 0.015;
      }
    }

    renderer.render(scene, camera);
  }

  updateNexusGroupPosition();
  requestAnimationFrame(updateNexusGroupPosition);
  setTimeout(updateNexusGroupPosition, 100);
  animate();
  playIntroAnimation();
}

document.addEventListener("DOMContentLoaded", () => {
  setupSignalReveal();
  setupWebglParticles();
});
