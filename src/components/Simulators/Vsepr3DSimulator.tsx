import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { VSEPR_MOLECULES } from '../../data/vseprData';
import { ELEMENTS_DATA } from '../../data/elementsData';
import type { ElementData } from '../../types/element';
import {
  generateVsepr3DGeometry,
  calculateAutoLonePairs,
  type CustomLigand,
  type GeneratedVseprMolecule,
} from '../../utils/vseprEngine';
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
  Atom,
  Plus,
  Trash2,
  Thermometer,
  Search,
  RefreshCw
} from 'lucide-react';

export const Vsepr3DSimulator: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Tab mode: 'presets' (Catálogo) or 'builder' (Laboratorio interactivo)
  const [activeTabMode, setActiveTabMode] = useState<'presets' | 'builder'>('builder');

  // Presets selection state
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('h2o');
  const [filterSN, setFilterSN] = useState<number | 'all'>('all');
  const [filterPolarity, setFilterPolarity] = useState<'all' | 'Polar' | 'No polar'>('all');

  // Interactive Builder state
  const [centralSymbol, setCentralSymbol] = useState<string>('C');
  const [ligands, setLigands] = useState<CustomLigand[]>([
    { id: '1', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
    { id: '2', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
    { id: '3', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
    { id: '4', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
  ]);
  const [manualLonePairs, setManualLonePairs] = useState<number>(0);
  const [newBondOrder, setNewBondOrder] = useState<1 | 2 | 3>(1);
  const [isElementPickerOpen, setIsElementPickerOpen] = useState<'central' | 'ligand' | null>(null);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // 3D Viewport Controls
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showDipole, setShowDipole] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [viewStyle, setViewStyle] = useState<'ball-stick' | 'space-fill' | 'wireframe'>('ball-stick');
  const [thermalVibrationTemp, setThermalVibrationTemp] = useState<number>(0); // 0 K (quiet) to 500 K (vibrating)

  // Central element object
  const centralElement: ElementData = useMemo(() => {
    return (
      ELEMENTS_DATA.find((e) => e.symbol.toLowerCase() === centralSymbol.toLowerCase()) ||
      ELEMENTS_DATA[5] // Carbon default
    );
  }, [centralSymbol]);

  // Molecules filtered for preset selection
  const filteredMolecules = useMemo(() => {
    return VSEPR_MOLECULES.filter((m) => {
      if (filterSN !== 'all' && m.stericNumber !== filterSN) return false;
      if (filterPolarity !== 'all' && m.polarity !== filterPolarity) return false;
      return true;
    });
  }, [filterSN, filterPolarity]);

  // Preset selected molecule converted to standard format
  const presetSelectedMolecule: GeneratedVseprMolecule = useMemo(() => {
    const raw = VSEPR_MOLECULES.find((m) => m.id === selectedMoleculeId) || VSEPR_MOLECULES[0];
    return {
      formula: raw.formula,
      name: raw.name,
      axe: raw.axe,
      stericNumber: raw.stericNumber,
      bondedCount: raw.bondedAtomsCount,
      lonePairsCount: raw.lonePairsCount,
      electronGeometry: raw.electronGeometry,
      molecularGeometry: raw.molecularGeometry,
      hybridization: raw.hybridization,
      idealAngle: raw.idealAngle,
      realAngle: raw.realAngle,
      polarity: raw.polarity,
      dipoleMomentD: raw.dipoleMomentD,
      atoms: raw.atoms,
      lonePairs: raw.lonePairs,
      bonds: raw.bonds.map(([a1, a2]) => ({ atom1: a1, atom2: a2, order: 1 })),
      description: raw.description,
      academicNotes: raw.academicNotes,
    };
  }, [selectedMoleculeId]);

  // Molecule dynamically generated in Builder mode
  const builderMolecule: GeneratedVseprMolecule = useMemo(() => {
    return generateVsepr3DGeometry(centralElement, ligands, manualLonePairs);
  }, [centralElement, ligands, manualLonePairs]);

  // Current molecule to render in 3D
  const activeMolecule = useMemo(() => {
    return activeTabMode === 'builder' ? builderMolecule : presetSelectedMolecule;
  }, [activeTabMode, builderMolecule, presetSelectedMolecule]);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const lonePairsGroupRef = useRef<THREE.Group | null>(null);
  const dipoleGroupRef = useRef<THREE.Group | null>(null);
  const atomMeshesRef = useRef<{ mesh: THREE.Mesh; basePosition: THREE.Vector3 }[]>([]);

  // Interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomLevelRef = useRef<number>(6.5);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const thermalTempRef = useRef<number>(thermalVibrationTemp);
  const ligandCounterRef = useRef<number>(10);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    thermalTempRef.current = thermalVibrationTemp;
  }, [thermalVibrationTemp]);

  // Initialize Three.js
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomLevelRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.65);
    dirLight2.position.set(-6, -6, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.6, 20);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    // Parent molecule group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    moleculeGroupRef.current = molGroup;

    // Lone pairs sub-group
    const lpGroup = new THREE.Group();
    molGroup.add(lpGroup);
    lonePairsGroupRef.current = lpGroup;

    // Dipole sub-group
    const dpGroup = new THREE.Group();
    molGroup.add(dpGroup);
    dipoleGroupRef.current = dpGroup;

    // Animation loop with thermal vibration
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto-rotation
      if (autoRotateRef.current && !isDraggingRef.current && molGroup) {
        molGroup.rotation.y += 0.005;
        molGroup.rotation.x += 0.0015;
      }

      // Harmonic thermal vibration simulation
      const temp = thermalTempRef.current;
      if (temp > 0 && atomMeshesRef.current.length > 0) {
        const amplitude = (temp / 500) * 0.08;
        atomMeshesRef.current.forEach((item, index) => {
          if (index === 0) return; // Keep central atom fixed
          const phase = index * 1.5;
          const vibX = Math.sin(elapsedTime * 14 + phase) * amplitude;
          const vibY = Math.cos(elapsedTime * 12 + phase) * amplitude;
          const vibZ = Math.sin(elapsedTime * 10 + phase) * amplitude;
          item.mesh.position.set(
            item.basePosition.x + vibX,
            item.basePosition.y + vibY,
            item.basePosition.z + vibZ
          );
        });
      }

      renderer.render(scene, camera);
    };
    animate();

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

  // Rebuild 3D objects when activeMolecule or viewStyle changes
  useEffect(() => {
    const molGroup = moleculeGroupRef.current;
    const lpGroup = lonePairsGroupRef.current;
    const dpGroup = dipoleGroupRef.current;
    if (!molGroup || !lpGroup || !dpGroup) return;

    atomMeshesRef.current = [];

    // Clear previous atoms and bonds (indices > 1)
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

    const mol = activeMolecule;

    // 1. Draw Atoms
    mol.atoms.forEach((atom) => {
      let radius = atom.radius || (atom.isCentral ? 0.45 : 0.35);

      if (viewStyle === 'space-fill') {
        radius = (atom.radius || 0.4) * 2.2;
      } else if (viewStyle === 'wireframe') {
        radius = (atom.radius || 0.4) * 0.45;
      }

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const hexColor = atom.color ? parseInt(atom.color.replace('#', ''), 16) : 0x0284c7;

      const material = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.2,
        metalness: 0.15,
        wireframe: viewStyle === 'wireframe',
      });

      const sphere = new THREE.Mesh(geometry, material);
      const basePos = new THREE.Vector3(...atom.position);
      sphere.position.copy(basePos);
      molGroup.add(sphere);

      atomMeshesRef.current.push({ mesh: sphere, basePosition: basePos });
    });

    // 2. Draw Bonds (with Single, Double, Triple bond rendering!)
    if (viewStyle !== 'space-fill') {
      mol.bonds.forEach((bond) => {
        if (!mol.atoms[bond.atom1] || !mol.atoms[bond.atom2]) return;
        const pos1 = new THREE.Vector3(...mol.atoms[bond.atom1].position);
        const pos2 = new THREE.Vector3(...mol.atoms[bond.atom2].position);

        const distance = pos1.distanceTo(pos2);
        const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
        const center = new THREE.Vector3().copy(pos1).add(pos2).multiplyScalar(0.5);

        const defaultDir = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, direction);

        // Perpendicular vector for offset of multiple bonds
        let perp = new THREE.Vector3(direction.y, -direction.x, direction.z).normalize();
        if (perp.length() === 0) perp.set(1, 0, 0);

        const cylinderRadius = viewStyle === 'wireframe' ? 0.03 : 0.07;
        const cylinderMaterial = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.35,
          metalness: 0.25,
          wireframe: viewStyle === 'wireframe',
        });

        const numBonds = bond.order || 1;
        const offsets =
          numBonds === 1
            ? [0]
            : numBonds === 2
            ? [-0.11, 0.11]
            : [-0.15, 0, 0.15];

        offsets.forEach((off) => {
          const cylinderGeometry = new THREE.CylinderGeometry(
            cylinderRadius,
            cylinderRadius,
            distance,
            16
          );
          const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

          const shiftedCenter = new THREE.Vector3()
            .copy(center)
            .addScaledVector(perp, off);

          cylinder.position.copy(shiftedCenter);
          cylinder.setRotationFromQuaternion(quaternion);
          molGroup.add(cylinder);
        });
      });
    }

    // 3. Draw Lone Pairs (Electron Clouds)
    mol.lonePairs.forEach((lp) => {
      const dir = new THREE.Vector3(...lp.direction).normalize();
      const dist = 1.35;
      const center = dir.clone().multiplyScalar(dist);

      const cloudGeo = new THREE.SphereGeometry(0.32, 24, 24);
      cloudGeo.scale(0.8, 1.4, 0.8);

      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
      });

      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      cloudMesh.position.copy(center);

      const defaultDir = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, dir);
      cloudMesh.setRotationFromQuaternion(quat);
      lpGroup.add(cloudMesh);

      // Two glowing electron dots
      const eGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const eMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const e1 = new THREE.Mesh(eGeo, eMat);
      const e2 = new THREE.Mesh(eGeo, eMat);

      const perp = new THREE.Vector3(dir.y, -dir.x, dir.z).normalize().multiplyScalar(0.1);
      if (perp.length() === 0) perp.set(0.1, 0, 0);

      e1.position.copy(center).add(perp);
      e2.position.copy(center).sub(perp);
      lpGroup.add(e1);
      lpGroup.add(e2);
    });

    // 4. Draw Dipole Vector if polar
    if (mol.polarity === 'Polar' && mol.dipoleMomentD > 0) {
      let dipoleDir = new THREE.Vector3(0, 0, 0);
      if (mol.lonePairs.length > 0) {
        mol.lonePairs.forEach((lp) => {
          dipoleDir.sub(new THREE.Vector3(...lp.direction));
        });
      } else {
        dipoleDir.set(0, 1, 0);
      }
      if (dipoleDir.length() < 0.1) dipoleDir.set(0, 1, 0);
      dipoleDir.normalize();

      const arrowLength = Math.min(2.6, 1.2 + mol.dipoleMomentD * 0.5);
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
  }, [activeMolecule, viewStyle]);

  // Visibility toggles
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

  // Actions for interactive Builder
  const handleAddLigand = (symbol: string) => {
    if (ligands.length >= 6) return;
    const el = ELEMENTS_DATA.find((e) => e.symbol.toLowerCase() === symbol.toLowerCase());
    const name = el ? el.name : symbol;

    const newLig: CustomLigand = {
      id: `lig-${ligandCounterRef.current++}`,
      symbol,
      name,
      bondOrder: newBondOrder,
    };
    const updated = [...ligands, newLig];
    setLigands(updated);

    // Auto-update lone pairs based on Lewis rules
    const autoLP = calculateAutoLonePairs(centralElement, updated);
    setManualLonePairs(autoLP);
  };

  const handleRemoveLigand = (id: string) => {
    if (ligands.length <= 1) return;
    const updated = ligands.filter((l) => l.id !== id);
    setLigands(updated);

    const autoLP = calculateAutoLonePairs(centralElement, updated);
    setManualLonePairs(autoLP);
  };

  const handleSelectCentral = (symbol: string) => {
    setCentralSymbol(symbol);
    const newEl = ELEMENTS_DATA.find((e) => e.symbol.toLowerCase() === symbol.toLowerCase());
    if (newEl) {
      const autoLP = calculateAutoLonePairs(newEl, ligands);
      setManualLonePairs(autoLP);
    }
  };

  const handleAutoCalculateLewis = () => {
    const autoLP = calculateAutoLonePairs(centralElement, ligands);
    setManualLonePairs(autoLP);
  };

  const handleResetMolecule = () => {
    setCentralSymbol('C');
    setLigands([
      { id: '1', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
      { id: '2', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
      { id: '3', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
      { id: '4', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 },
    ]);
    setManualLonePairs(0);
  };

  // Common element shortcuts for Central Atom
  const commonCentralElements = ['C', 'N', 'O', 'P', 'S', 'Si', 'B', 'Be', 'Xe', 'Cl'];
  // Common element shortcuts for Ligands
  const commonLigandElements = ['H', 'F', 'Cl', 'O', 'N', 'Br', 'I'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Laboratorio VSEPR &amp; Geometría 3D
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.0 Universitario</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Simulador Molecular 3D Interactivo
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Construye cualquier molécula eligiendo elementos de la tabla periódica, enlaces
              simples, dobles o triples y pares solitarios. Explora su geometría espacial, vibración
              térmica y dipolo en WebGL.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTabMode('builder')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTabMode === 'builder'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Constructor Libre
            </button>
            <button
              onClick={() => setActiveTabMode('presets')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTabMode === 'presets'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Atom className="w-4 h-4" />
              Catálogo de Moléculas
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Viewport on Left (7 cols), Interactive Studio on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Viewport Area */}
        <div className="lg:col-span-7 bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col space-y-4">
          {/* Viewport Top Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">
                {activeMolecule.formula}
              </span>
              <span className="text-[10px] text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded-full font-mono">
                {activeMolecule.axe}
              </span>
            </div>

            {/* Viewport Action Icons */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1 flex-wrap">
              {/* Style Switcher: Ball&Stick / SpaceFill / Wireframe */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => setViewStyle('ball-stick')}
                  className={`px-2 py-1 rounded transition-colors ${
                    viewStyle === 'ball-stick' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'
                  }`}
                  title="Esferas y Varillas (Ball & Stick)"
                >
                  Varillas
                </button>
                <button
                  onClick={() => setViewStyle('space-fill')}
                  className={`px-2 py-1 rounded transition-colors ${
                    viewStyle === 'space-fill' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'
                  }`}
                  title="Espacio Lleno (van der Waals / CPK)"
                >
                  CPK
                </button>
                <button
                  onClick={() => setViewStyle('wireframe')}
                  className={`px-2 py-1 rounded transition-colors ${
                    viewStyle === 'wireframe' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'
                  }`}
                  title="Alambre / Esqueleto (Wireframe)"
                >
                  Alambre
                </button>
              </div>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  autoRotate ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={autoRotate ? 'Pausar auto-rotación' : 'Activar auto-rotación'}
              >
                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setShowLonePairs(!showLonePairs)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  showLonePairs ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar/Ocultar pares solitarios"
              >
                {showLonePairs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px] hidden sm:inline">Pares</span>
              </button>

              <button
                onClick={() => setShowDipole(!showDipole)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  showDipole ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar/Ocultar vector dipolar"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Dipolo</span>
              </button>

              <button
                onClick={() => handleZoom(-1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Reiniciar cámara"
              >
                <Rotate3d className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Three.js Canvas Container */}
          <div
            ref={mountRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-[420px] sm:h-[480px] bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950 rounded-2xl border border-slate-800/80 cursor-grab active:cursor-grabbing relative overflow-hidden select-none"
          >
            {/* Overlay hint */}
            <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl pointer-events-none flex items-center gap-2">
              <Rotate3d className="w-3.5 h-3.5 text-sky-400" />
              <span>Arrastra para rotar · Rueda para zoom</span>
            </div>

            {/* Real-time Legend inside Canvas */}
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-800/80 p-2.5 rounded-2xl pointer-events-none text-xs space-y-1.5 max-w-[210px]">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: activeMolecule.atoms[0]?.color || '#0284c7' }}
                />
                <span className="text-slate-200 font-bold truncate">
                  {activeMolecule.atoms[0]?.symbol} ({activeMolecule.atoms[0]?.name})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-slate-300">
                  {activeMolecule.bondedCount} Ligando{activeMolecule.bondedCount !== 1 ? 's' : ''}
                </span>
              </div>
              {activeMolecule.lonePairsCount > 0 && showLonePairs && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400/50 border border-sky-300" />
                  <span className="text-sky-300">
                    {activeMolecule.lonePairsCount} Par{activeMolecule.lonePairsCount > 1 ? 'es' : ''}{' '}
                    libre{activeMolecule.lonePairsCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {activeMolecule.polarity === 'Polar' && showDipole && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-rose-500 rounded" />
                  <span className="text-rose-400 font-mono text-[10px]">
                    Dipolo ({activeMolecule.dipoleMomentD} D)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thermal Vibration Slider Bar */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300 shrink-0">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Vibración Térmica:</span>
              <span className="font-mono text-amber-400 font-bold">{thermalVibrationTemp} K</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={thermalVibrationTemp}
              onChange={(e) => setThermalVibrationTemp(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <button
              onClick={() => setThermalVibrationTemp(thermalVibrationTemp === 0 ? 300 : 0)}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              {thermalVibrationTemp === 0 ? '300 K (Ambiente)' : '0 K (Reposo)'}
            </button>
          </div>
        </div>

        {/* Controls & Configuration Studio Area */}
        <div className="lg:col-span-5 space-y-5">
          {activeTabMode === 'builder' ? (
            /* ========================================================
               BUILDER / LABORATORIO INTERACTIVO
               ======================================================== */
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-extrabold text-white text-base">Constructor Molecular</h3>
                </div>
                <button
                  onClick={handleResetMolecule}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  title="Reiniciar a metano"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Limpiar
                </button>
              </div>

              {/* Step 1: Select Central Atom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Átomo Central (A):
                  </label>
                  <span className="text-xs font-mono text-sky-400 bg-sky-950 border border-sky-800/60 px-2 py-0.5 rounded">
                    {centralElement.symbol} — {centralElement.name} (Z={centralElement.atomicNumber})
                  </span>
                </div>

                {/* Central Quick Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {commonCentralElements.map((sym) => {
                    const isSelected = centralSymbol.toUpperCase() === sym;
                    return (
                      <button
                        key={sym}
                        onClick={() => handleSelectCentral(sym)}
                        className={`w-9 h-8 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      setIsElementPickerOpen('central');
                      setPickerSearch('');
                    }}
                    className="px-2.5 h-8 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    Otro...
                  </button>
                </div>
              </div>

              {/* Step 2: Add Ligand with Bond Order */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Añadir Ligandos (X):
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {ligands.length} / 6 enlazados
                  </span>
                </div>

                {/* Bond Order Selector for new ligand */}
                <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">Enlace:</span>
                  <button
                    onClick={() => setNewBondOrder(1)}
                    className={`flex-1 py-1 rounded-lg font-semibold transition-colors ${
                      newBondOrder === 1
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Simple (—)
                  </button>
                  <button
                    onClick={() => setNewBondOrder(2)}
                    className={`flex-1 py-1 rounded-lg font-semibold transition-colors ${
                      newBondOrder === 2
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Doble (=)
                  </button>
                  <button
                    onClick={() => setNewBondOrder(3)}
                    className={`flex-1 py-1 rounded-lg font-semibold transition-colors ${
                      newBondOrder === 3
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Triple (≡)
                  </button>
                </div>

                {/* Ligand Quick Add Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {commonLigandElements.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => handleAddLigand(sym)}
                      disabled={ligands.length >= 6}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-emerald-950/40 text-slate-200 transition-all flex items-center gap-1 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      {sym}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsElementPickerOpen('ligand');
                      setPickerSearch('');
                    }}
                    disabled={ligands.length >= 6}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Search className="w-3 h-3" />
                    Buscar...
                  </button>
                </div>

                {/* Current Ligands Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ligands.map((lig) => (
                    <div
                      key={lig.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <span className="font-bold text-white">{lig.symbol}</span>
                      <span className="text-[10px] text-slate-500">
                        {lig.bondOrder === 1 ? '—' : lig.bondOrder === 2 ? '=' : '≡'}
                      </span>
                      <button
                        onClick={() => handleRemoveLigand(lig.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                        title="Eliminar este ligando"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Lone Pairs Controls */}
              <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    Pares Solitarios en {centralElement.symbol} (E):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setManualLonePairs(Math.max(0, manualLonePairs - 1))}
                      disabled={manualLonePairs <= 0}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sky-400 text-sm w-4 text-center">
                      {manualLonePairs}
                    </span>
                    <button
                      onClick={() => setManualLonePairs(Math.min(3, manualLonePairs + 1))}
                      disabled={manualLonePairs >= 3 || ligands.length + manualLonePairs >= 6}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Número Estérico Total (SN): <strong>{builderMolecule.stericNumber}</strong>
                  </span>
                  <button
                    onClick={handleAutoCalculateLewis}
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline"
                  >
                    Calcular por regla de Lewis
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               PRESETS / CATÁLOGO GUIADO
               ======================================================== */
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  Biblioteca de Moléculas
                </h3>
                <span className="text-xs text-slate-400">{filteredMolecules.length} moléculas</span>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nº Estérico (SN):</label>
                  <select
                    value={filterSN}
                    onChange={(e) =>
                      setFilterSN(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="all">Todos (SN 2 - 6)</option>
                    <option value="2">SN = 2 (sp)</option>
                    <option value="3">SN = 3 (sp²)</option>
                    <option value="4">SN = 4 (sp³)</option>
                    <option value="5">SN = 5 (sp³d)</option>
                    <option value="6">SN = 6 (sp³d²)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Polaridad:</label>
                  <select
                    value={filterPolarity}
                    onChange={(e) =>
                      setFilterPolarity(e.target.value as 'all' | 'Polar' | 'No polar')
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="all">Todas</option>
                    <option value="Polar">Polares (μ &gt; 0)</option>
                    <option value="No polar">No polares (μ = 0)</option>
                  </select>
                </div>
              </div>

              {/* Molecule Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
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
          )}

          {/* Academic & VSEPR Results Card */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-extrabold text-white">{activeMolecule.name}</h4>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                    {activeMolecule.formula}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Notación VSEPR:{' '}
                  <strong className="text-slate-200 font-mono">{activeMolecule.axe}</strong>
                </p>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  activeMolecule.polarity === 'Polar'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {activeMolecule.polarity}
              </span>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Geometría Electrónica</span>
                <span className="font-bold text-white text-sm">
                  {activeMolecule.electronGeometry}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  SN = {activeMolecule.stericNumber} dominios
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Geometría Molecular</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {activeMolecule.molecularGeometry}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Disposición observable</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Hibridación Orbital</span>
                <span className="font-bold font-mono text-amber-400 text-sm">
                  {activeMolecule.hybridization}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ángulo de Enlace</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-emerald-400 text-sm">
                    {activeMolecule.realAngle}
                  </span>
                  {activeMolecule.realAngle !== activeMolecule.idealAngle && (
                    <span className="text-[10px] text-slate-500 line-through">
                      ({activeMolecule.idealAngle})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Explanation */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Info className="w-4 h-4" />
                <span>Justificación Cuántica / VSEPR:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{activeMolecule.description}</p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                {activeMolecule.academicNotes}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Element Picker Modal (if open) */}
      {isElementPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Seleccionar Elemento para{' '}
                {isElementPickerOpen === 'central' ? 'Átomo Central' : 'Ligando'}
              </h3>
              <button
                onClick={() => setIsElementPickerOpen(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Buscar por símbolo o nombre (ej. Carbono, F, 16)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
              {ELEMENTS_DATA.filter((e) => {
                if (!pickerSearch) return true;
                const q = pickerSearch.toLowerCase();
                return (
                  e.symbol.toLowerCase().includes(q) ||
                  e.name.toLowerCase().includes(q) ||
                  e.atomicNumber.toString() === q
                );
              }).map((el) => (
                <button
                  key={el.atomicNumber}
                  onClick={() => {
                    if (isElementPickerOpen === 'central') {
                      handleSelectCentral(el.symbol);
                    } else {
                      handleAddLigand(el.symbol);
                    }
                    setIsElementPickerOpen(null);
                  }}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-slate-800 text-left transition-all"
                >
                  <span className="text-[10px] text-slate-500 block">Z={el.atomicNumber}</span>
                  <span className="font-extrabold text-white text-sm block">{el.symbol}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{el.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
