import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { VSEPR_MOLECULES } from '../../data/vseprData';
import type { VseprMolecule } from '../../types/vsepr';
import {
  Rotate3d,
  Layers,
  Sparkles,
  Info,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Compass,
  Eye,
  EyeOff,
  Atom
} from 'lucide-react';

export const Vsepr3DSimulator: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('h2o');
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showDipole, setShowDipole] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [filterSN, setFilterSN] = useState<number | 'all'>('all');
  const [filterPolarity, setFilterPolarity] = useState<'all' | 'Polar' | 'No polar'>('all');

  // Custom Sandbox mode
  const [activeTabMode, setActiveTabMode] = useState<'presets' | 'sandbox'>('presets');
  const [sandboxX, setSandboxX] = useState<number>(2);
  const [sandboxE, setSandboxE] = useState<number>(2);

  const selectedMolecule = useMemo(() => {
    return VSEPR_MOLECULES.find((m) => m.id === selectedMoleculeId) || VSEPR_MOLECULES[0];
  }, [selectedMoleculeId]);

  // Molecules filtered for selection
  const filteredMolecules = useMemo(() => {
    return VSEPR_MOLECULES.filter((m) => {
      if (filterSN !== 'all' && m.stericNumber !== filterSN) return false;
      if (filterPolarity !== 'all' && m.polarity !== filterPolarity) return false;
      return true;
    });
  }, [filterSN, filterPolarity]);

  // Sandbox matched geometry
  const sandboxMatchedMolecule = useMemo(() => {
    return VSEPR_MOLECULES.find(
      (m) => m.bondedAtomsCount === sandboxX && m.lonePairsCount === sandboxE
    );
  }, [sandboxX, sandboxE]);

  // Current active molecule to display in 3D
  const currentMoleculeToDisplay: VseprMolecule = useMemo(() => {
    if (activeTabMode === 'sandbox' && sandboxMatchedMolecule) {
      return sandboxMatchedMolecule;
    }
    return selectedMolecule;
  }, [activeTabMode, sandboxMatchedMolecule, selectedMolecule]);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const lonePairsGroupRef = useRef<THREE.Group | null>(null);
  const dipoleGroupRef = useRef<THREE.Group | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomLevelRef = useRef<number>(6.5);
  const autoRotateRef = useRef<boolean>(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomLevelRef.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-5, -5, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    // 5. Main molecule parent group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    moleculeGroupRef.current = molGroup;

    // 6. Lone pairs group
    const lpGroup = new THREE.Group();
    molGroup.add(lpGroup);
    lonePairsGroupRef.current = lpGroup;

    // 7. Dipole group
    const dpGroup = new THREE.Group();
    molGroup.add(dpGroup);
    dipoleGroupRef.current = dpGroup;

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDraggingRef.current && molGroup) {
        molGroup.rotation.y += 0.006;
        molGroup.rotation.x += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D objects when currentMoleculeToDisplay changes
  useEffect(() => {
    const molGroup = moleculeGroupRef.current;
    const lpGroup = lonePairsGroupRef.current;
    const dpGroup = dipoleGroupRef.current;
    if (!molGroup || !lpGroup || !dpGroup) return;

    // Clear previous atoms and bonds (except lone pairs and dipole groups)
    while (molGroup.children.length > 2) {
      const child = molGroup.children[2];
      molGroup.remove(child);
      if ('geometry' in child && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
    // Clear lone pairs
    while (lpGroup.children.length > 0) {
      const child = lpGroup.children[0];
      lpGroup.remove(child);
      if ('geometry' in child && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
    // Clear dipole
    while (dpGroup.children.length > 0) {
      const child = dpGroup.children[0];
      dpGroup.remove(child);
      if ('geometry' in child && (child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }

    const mol = currentMoleculeToDisplay;

    // Helper: Material for atoms
    const atomMaterials: THREE.MeshStandardMaterial[] = [];

    // Draw Atoms
    mol.atoms.forEach((atom) => {
      const radius = atom.radius || (atom.isCentral ? 0.45 : 0.35);
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const hexColor = atom.color ? parseInt(atom.color.replace('#', ''), 16) : 0x0284c7;

      const material = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.25,
        metalness: 0.1,
      });
      atomMaterials.push(material);

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(atom.position[0], atom.position[1], atom.position[2]);
      molGroup.add(sphere);
    });

    // Draw Bonds as 3D Cylinders
    mol.bonds.forEach(([i1, i2]) => {
      const pos1 = new THREE.Vector3(...mol.atoms[i1].position);
      const pos2 = new THREE.Vector3(...mol.atoms[i2].position);

      const distance = pos1.distanceTo(pos2);
      const cylinderGeometry = new THREE.CylinderGeometry(0.08, 0.08, distance, 16);
      const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.3,
        metalness: 0.2,
      });

      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

      // Position cylinder halfway between the two atoms
      cylinder.position.copy(pos1).add(pos2).multiplyScalar(0.5);

      // Orient cylinder towards pos2
      const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
      const defaultDir = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, direction);
      cylinder.setRotationFromQuaternion(quaternion);

      molGroup.add(cylinder);
    });

    // Draw Lone Pairs (Electron Clouds)
    mol.lonePairs.forEach((lp) => {
      const dir = new THREE.Vector3(...lp.direction).normalize();
      const dist = 1.35;
      const center = dir.clone().multiplyScalar(dist);

      // Teardrop/ellipsoid electron cloud
      const cloudGeo = new THREE.SphereGeometry(0.32, 24, 24);
      cloudGeo.scale(0.8, 1.4, 0.8);

      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        metalness: 0.1,
      });

      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      cloudMesh.position.copy(center);

      // Orient cloud outwards from central atom
      const defaultDir = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, dir);
      cloudMesh.setRotationFromQuaternion(quat);

      lpGroup.add(cloudMesh);

      // Draw two little dots representing electrons inside the cloud
      const eGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const eMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const e1 = new THREE.Mesh(eGeo, eMat);
      const e2 = new THREE.Mesh(eGeo, eMat);

      // Position perpendicular to lobe direction
      const perp = new THREE.Vector3(dir.y, -dir.x, dir.z).normalize().multiplyScalar(0.1);
      if (perp.length() === 0) perp.set(0.1, 0, 0);

      e1.position.copy(center).add(perp);
      e2.position.copy(center).sub(perp);

      lpGroup.add(e1);
      lpGroup.add(e2);
    });

    // Draw Dipole Moment Vector if polar
    if (mol.polarity === 'Polar' && mol.dipoleMomentD > 0) {
      // Calculate approximate dipole direction from atoms
      let dipoleDir = new THREE.Vector3(0, 0, 0);

      if (mol.lonePairs.length > 0) {
        // Points generally opposite to lone pairs or towards electronegative atoms
        mol.lonePairs.forEach((lp) => {
          dipoleDir.sub(new THREE.Vector3(...lp.direction));
        });
      } else {
        dipoleDir.set(0, 1, 0);
      }

      if (dipoleDir.length() < 0.1) dipoleDir.set(0, 1, 0);
      dipoleDir.normalize();

      const arrowLength = Math.min(2.5, 1.2 + mol.dipoleMomentD * 0.5);
      const arrowHelper = new THREE.ArrowHelper(
        dipoleDir,
        new THREE.Vector3(0, 0, 0),
        arrowLength,
        0xf43f5e,
        0.35,
        0.2
      );
      dpGroup.add(arrowHelper);
    }
  }, [currentMoleculeToDisplay]);

  // Toggle visibility of Lone Pairs and Dipole
  useEffect(() => {
    if (lonePairsGroupRef.current) {
      lonePairsGroupRef.current.visible = showLonePairs;
    }
  }, [showLonePairs]);

  useEffect(() => {
    if (dipoleGroupRef.current) {
      dipoleGroupRef.current.visible = showDipole;
    }
  }, [showDipole]);

  // Mouse & Touch Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !moleculeGroupRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    moleculeGroupRef.current.rotation.y += deltaX * 0.008;
    moleculeGroupRef.current.rotation.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const newZoom = Math.min(Math.max(cameraRef.current.position.z + e.deltaY * 0.005, 3.5), 12);
    cameraRef.current.position.z = newZoom;
    zoomLevelRef.current = newZoom;
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.min(Math.max(cameraRef.current.position.z + delta, 3.5), 12);
    cameraRef.current.position.z = newZoom;
    zoomLevelRef.current = newZoom;
  };

  const handleResetView = () => {
    if (moleculeGroupRef.current && cameraRef.current) {
      moleculeGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 0, 6.5);
      zoomLevelRef.current = 6.5;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Modelo VSEPR / RPECV 3D
              </span>
              <span className="text-xs text-slate-400 font-mono">Simetría &amp; Orbitales</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Geometría Molecular 3D
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Visualiza en tres dimensiones las formas moleculares según la{' '}
              <strong className="text-slate-200">
                Teoría de Repulsión de Pares de Electrones de la Capa de Valencia (VSEPR)
              </strong>
              . Inspecciona ángulos de enlace, hibridación y nubes de pares solitarios.
            </p>
          </div>

          {/* Mode Switcher: Presets vs Sandbox */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTabMode('presets')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTabMode === 'presets'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Atom className="w-4 h-4" />
              Moléculas Reales
            </button>
            <button
              onClick={() => setActiveTabMode('sandbox')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTabMode === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Constructor Libre (AXE)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Viewport on Left, Details & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Card (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col space-y-4">
          {/* Top Bar inside Canvas Card */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">
                Visualizador WebGL 3D
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                {currentMoleculeToDisplay.formula}
              </span>
            </div>

            {/* Quick interactive viewport toggles */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  autoRotate ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={autoRotate ? 'Pausar rotación automática' : 'Activar auto-rotación'}
              >
                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setShowLonePairs(!showLonePairs)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  showLonePairs ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar/Ocultar pares solitarios (nubes electrónicas)"
              >
                {showLonePairs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px] hidden sm:inline">Pares libres</span>
              </button>

              <button
                onClick={() => setShowDipole(!showDipole)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  showDipole ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar/Ocultar vector momento dipolar neto"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Dipolo</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              <button
                onClick={() => handleZoom(-1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Acercar (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Alejar (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Restablecer posición de cámara"
              >
                <Rotate3d className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Three.js Container */}
          <div
            ref={mountRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/90 rounded-2xl border border-slate-800/80 cursor-grab active:cursor-grabbing relative overflow-hidden select-none"
          >
            {/* Watermark / instructions overlay */}
            <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl pointer-events-none flex items-center gap-2">
              <Rotate3d className="w-3.5 h-3.5 text-sky-400" />
              <span>Arrastra para rotar en 3D · Rueda para zoom</span>
            </div>

            {/* In-viewport Legend */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-800/80 p-2.5 rounded-2xl pointer-events-none text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                <span className="text-slate-300 font-medium">{currentMoleculeToDisplay.atoms[0].name} (Central)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-slate-300">Ligandos enlazados</span>
              </div>
              {currentMoleculeToDisplay.lonePairs.length > 0 && showLonePairs && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400/50 border border-sky-300/80" />
                  <span className="text-sky-300">Nube de par solitario</span>
                </div>
              )}
              {currentMoleculeToDisplay.polarity === 'Polar' && showDipole && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-rose-500 rounded" />
                  <span className="text-rose-400 font-mono text-[10px]">
                    Dipolo ({currentMoleculeToDisplay.dipoleMomentD} D)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info & Selectors (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Selector Panel (If presets mode) */}
          {activeTabMode === 'presets' ? (
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Catálogo de Moléculas
                </h3>
                <span className="text-xs text-slate-400">
                  {filteredMolecules.length} disponibles
                </span>
              </div>

              {/* Filters for Presets */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nº Estérico (SN):</label>
                  <select
                    value={filterSN}
                    onChange={(e) =>
                      setFilterSN(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">Todos los SN (2 - 6)</option>
                    <option value="2">SN = 2 (sp, Lineal)</option>
                    <option value="3">SN = 3 (sp², Trigonal)</option>
                    <option value="4">SN = 4 (sp³, Tetraédrica)</option>
                    <option value="5">SN = 5 (sp³d, Bipirámide)</option>
                    <option value="6">SN = 6 (sp³d², Octaédrica)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Polaridad:</label>
                  <select
                    value={filterPolarity}
                    onChange={(e) =>
                      setFilterPolarity(e.target.value as 'all' | 'Polar' | 'No polar')
                    }
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">Todas</option>
                    <option value="No polar">No polares (μ = 0)</option>
                    <option value="Polar">Polares (μ &gt; 0)</option>
                  </select>
                </div>
              </div>

              {/* Molecule Pill Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {filteredMolecules.map((m) => {
                  const isSelected = m.id === selectedMoleculeId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMoleculeId(m.id)}
                      className={`px-3 py-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-sky-600/30 border-sky-500 text-white shadow-md shadow-sky-600/20'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-extrabold text-sm">{m.formula}</span>
                        <span className="text-[10px] font-mono text-sky-400">{m.axe}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{m.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Sandbox Mode Panel */
            <div className="bg-slate-900/95 border border-indigo-900/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Constructor de Repulsión VSEPR
                </h3>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-full">
                  AX{sandboxX}E{sandboxE > 0 ? sandboxE : ''}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Ajusta el número de ligandos enlazantes (X) y pares de electrones libres (E) para
                observar cómo cambia instantáneamente la forma de la molécula según el principio de
                mínima repulsión.
              </p>

              {/* Sliders */}
              <div className="space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Atom className="w-3.5 h-3.5 text-emerald-400" />
                      Átomos Enlazados (X):
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{sandboxX}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="1"
                    value={sandboxX}
                    onChange={(e) => {
                      const newX = Number(e.target.value);
                      setSandboxX(newX);
                      // keep SN <= 6
                      if (newX + sandboxE > 6) setSandboxE(6 - newX);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>2 (Mínimo)</span>
                    <span>6 (Octaédrico)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Pares Solitarios (E):
                    </span>
                    <span className="font-mono text-sky-400 font-bold">{sandboxE}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(3, 6 - sandboxX)}
                    step="1"
                    value={sandboxE}
                    onChange={(e) => setSandboxE(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 (Sin pares libres)</span>
                    <span>{Math.min(3, 6 - sandboxX)} (Máx. para SN≤6)</span>
                  </div>
                </div>
              </div>

              {sandboxMatchedMolecule ? (
                <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <span>
                    Ejemplo real: <strong>{sandboxMatchedMolecule.formula}</strong> (
                    {sandboxMatchedMolecule.name})
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMoleculeId(sandboxMatchedMolecule.id);
                      setActiveTabMode('presets');
                    }}
                    className="text-xs underline text-emerald-400 hover:text-white"
                  >
                    Ver ficha
                  </button>
                </div>
              ) : (
                <div className="bg-amber-950/40 border border-amber-800/50 p-3 rounded-xl text-xs text-amber-300">
                  Configuración teórica VSEPR calculada.
                </div>
              )}
            </div>
          )}

          {/* Theoretical & Physicochemical Card */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">
                    {currentMoleculeToDisplay.name}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                    {currentMoleculeToDisplay.formula}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Notación AXE: <strong className="text-slate-200">{currentMoleculeToDisplay.axe}</strong>
                </p>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  currentMoleculeToDisplay.polarity === 'Polar'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {currentMoleculeToDisplay.polarity}
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Geometría Electrónica</span>
                <span className="font-bold text-white text-sm">
                  {currentMoleculeToDisplay.electronGeometry}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  SN = {currentMoleculeToDisplay.stericNumber} dominios
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Geometría Molecular</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {currentMoleculeToDisplay.molecularGeometry}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Disposición observable</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Hibridación del Central</span>
                <span className="font-bold font-mono text-amber-400 text-sm">
                  {currentMoleculeToDisplay.hybridization}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ángulo de Enlace</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-emerald-400 text-sm">
                    {currentMoleculeToDisplay.realAngle}
                  </span>
                  {currentMoleculeToDisplay.realAngle !== currentMoleculeToDisplay.idealAngle && (
                    <span className="text-[10px] text-slate-500 line-through">
                      ({currentMoleculeToDisplay.idealAngle})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Notes */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Info className="w-4 h-4" />
                <span>Explicación Didáctica Universitaria:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentMoleculeToDisplay.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                {currentMoleculeToDisplay.academicNotes}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
