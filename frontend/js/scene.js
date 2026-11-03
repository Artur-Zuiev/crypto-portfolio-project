// ==================================================
// BLOCK 01 — IMPORTS / ИМПОРТЫ
// ==================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";


// ==================================================
// BLOCK 02 — DOM ELEMENTS / HTML-ЭЛЕМЕНТЫ
// ==================================================

const threeContainer = document.getElementById("threeContainer");
const sceneTotalValue = document.getElementById("sceneTotalValue");
const sceneStatus = document.getElementById("sceneStatus");
const sceneAssetsList = document.getElementById("sceneAssetsList");
const reloadSceneBtn = document.getElementById("reloadSceneBtn");
const resetViewBtn = document.getElementById("resetViewBtn");
const pauseMotionBtn = document.getElementById("pauseMotionBtn");

const coinModal = document.getElementById("coinModal");
const closeCoinModal = document.getElementById("closeCoinModal");

const modalCoinSymbol = document.getElementById("modalCoinSymbol");
const modalCoinQuantity = document.getElementById("modalCoinQuantity");
const modalCoinPrice = document.getElementById("modalCoinPrice");
const modalCoinValue = document.getElementById("modalCoinValue");
const modalCoinProfit = document.getElementById("modalCoinProfit");

const modalCoinProfitPercent = document.getElementById("modalCoinProfitPercent");
const modalCoinAllocation = document.getElementById("modalCoinAllocation");


// ==================================================
// BLOCK 03 — GLOBAL THREE VARIABLES / ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ THREE.JS
// ==================================================

let scene;
let camera;
let renderer;
let labelRenderer;
let controls;

let cryptoObjects = [];
let sceneDecorations = [];
let hoveredObject = null;
let particles = null;

let cameraTargetPosition = null;
let cameraLookAtTarget = new THREE.Vector3(0, 0, 0);
let pendingModalData = null;
let modalOpenTimer = null;
let pointerDownPosition = new THREE.Vector2();
let pointerMovedDistance = 0;
let isDraggingScene = false;
let motionPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const API_URL = `${window.location.protocol}//${window.location.hostname}:8080`;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const defaultCameraPosition = new THREE.Vector3(0, 4.6, 14.6);
const defaultControlsTarget = new THREE.Vector3(0, -0.35, -4.2);

const SCENE_FLOOR_Y = -3.15;


// ==================================================
// BLOCK 04 — INIT / ЗАПУСК СЦЕНЫ
// ==================================================

initScene();
loadPortfolioAndBuildScene();

reloadSceneBtn.addEventListener("click", () => {
    loadPortfolioAndBuildScene();
});

function updateMotionButton() {
    if (!pauseMotionBtn) return;
    pauseMotionBtn.textContent = motionPaused ? "Resume motion" : "Pause motion";
    pauseMotionBtn.setAttribute("aria-pressed", String(motionPaused));
}
updateMotionButton();
pauseMotionBtn?.addEventListener("click", () => {
    motionPaused = !motionPaused;
    updateMotionButton();
});
resetViewBtn?.addEventListener("click", () => {
    cameraTargetPosition = defaultCameraPosition.clone();
    cameraLookAtTarget.copy(defaultControlsTarget);
    coinModal?.classList.add("hidden");
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape") coinModal?.classList.add("hidden");
});


sceneAssetsList.addEventListener("click", (event) => {
    const assetRow = event.target.closest(".asset-row");

    if (!assetRow) {
        return;
    }

    const symbol = assetRow.dataset.symbol;

    focusObjectBySymbol(symbol);
});

window.addEventListener("resize", handleResize);

threeContainer.addEventListener("pointerdown", handlePointerDown);
threeContainer.addEventListener("pointermove", handlePointerMove);
threeContainer.addEventListener("pointerup", handlePointerUp);

threeContainer.addEventListener("click", handleObjectClick);
threeContainer.addEventListener("dblclick", handleSceneDoubleClick);
threeContainer.addEventListener("mousemove", handleObjectHover);
threeContainer.addEventListener("mouseleave", clearHoverEffect);

closeCoinModal.addEventListener("click", () => {
    coinModal.classList.add("hidden");
});

coinModal.addEventListener("click", (event) => {
    if (event.target === coinModal) {
        coinModal.classList.add("hidden");
    }
});


// ==================================================
// BLOCK 05 — CREATE BASIC THREE SCENE / СОЗДАНИЕ ОСНОВНОЙ 3D-СЦЕНЫ
// ==================================================

function initScene() {
    scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(0x050816, 0.023);
    scene.background = new THREE.Color(0x07111f);

    camera = new THREE.PerspectiveCamera(
        50,
        threeContainer.clientWidth / threeContainer.clientHeight,
        0.1,
        1000
    );

    camera.position.copy(defaultCameraPosition);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;

    threeContainer.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none";

    threeContainer.appendChild(labelRenderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    controls.target.copy(defaultControlsTarget);
    controls.update();

    addLights();
    addFloor();
    addParticles();

    animate();
}


// ==================================================
// BLOCK 06 — LIGHTS / СВЕТ
// ==================================================

function addLights() {
    const ambientLight = new THREE.AmbientLight(0xbcd3ff, 1.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 4.8);
    mainLight.position.set(5, 11, 8);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 7.2, 70);
    blueLight.position.set(-8, 5, 6);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 4.6, 55);
    cyanLight.position.set(8, 4, 3);
    scene.add(cyanLight);

    const backLight = new THREE.PointLight(0x8b5cf6, 3.8, 58);
    backLight.position.set(0, 3, -8);
    scene.add(backLight);

    const whiteLight = new THREE.PointLight(0xffffff, 1.8, 25);
    whiteLight.position.set(0, 6, 4);
    scene.add(whiteLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.2, 35);
    rimLight.position.set(0, 4.5, 9);
    scene.add(rimLight);

    const floorLightOne = new THREE.PointLight(0x38bdf8, 3.2, 42);
    floorLightOne.position.set(0, -0.8, 2.5);
    scene.add(floorLightOne);

    const floorLightTwo = new THREE.PointLight(0x38bdf8, 3.4, 44);
    floorLightTwo.position.set(0, -0.8, 3.5);
    scene.add(floorLightTwo);
}

// ==================================================
// BLOCK 07 — FLOOR / GRID / ПОЛ И СЕТКА
// ==================================================

function addFloor() {
    // Круглая сетка
    const polarGrid = new THREE.PolarGridHelper(
        15.5,   // radius
        24,     // sectors
        14,     // rings
        96,     // divisions
        0x2563eb,
        0x1d4ed8
    );

    polarGrid.position.y = SCENE_FLOOR_Y + 0.08;
    polarGrid.material.transparent = true;
    polarGrid.material.opacity = 0.58;
    polarGrid.material.depthWrite = false;

    scene.add(polarGrid);

    // Основная круглая платформа
    const floorGeometry = new THREE.CircleGeometry(15.8, 96);

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x071a35,
        transparent: true,
        opacity: 0.96,
        roughness: 0.38,
        metalness: 0.28,
        emissive: 0x0a1f45,
        emissiveIntensity: 0.28
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = SCENE_FLOOR_Y;

    scene.add(floor);

    // Мягкое свечение по центру
    const glowGeometry = new THREE.CircleGeometry(12.6, 96);

    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x1d4ed8,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = SCENE_FLOOR_Y + 0.02;

    scene.add(glow);

    // Внешнее кольцо
    const outerRingGeometry = new THREE.RingGeometry(13.9, 15.6, 96);

    const outerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.13,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = SCENE_FLOOR_Y + 0.03;

    scene.add(outerRing);
    sceneDecorations.push(outerRing);
}


// ==================================================
// BLOCK 07.1 — BACKGROUND PARTICLES / ФОНОВЫЕ ЧАСТИЦЫ
// ==================================================

function addParticles() {
    const particlesCount = 340;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 28;
        positions[i * 3 + 1] = Math.random() * 10 - 0.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.045,
        transparent: true,
        opacity: 0.78,
        depthWrite: false
    });

    particles = new THREE.Points(geometry, material);
    particles.position.y = 0.5;

    scene.add(particles);
}


// ==================================================
// BLOCK 08 — LOAD PORTFOLIO FROM BACKEND / ЗАГРУЗКА ПОРТФЕЛЯ С BACKEND
// ==================================================

async function loadPortfolioAndBuildScene() {
    try {
        setStatus("Loading portfolio...", "neutral");

        const portfolio = await fetchPortfolio();
        const normalizedPortfolio = normalizePortfolioData(portfolio);

        clearOldCryptoObjects();

        renderAssetsList(normalizedPortfolio);
        renderTotalValue(normalizedPortfolio);
        createCryptoObjects(normalizedPortfolio);

        setStatus("3D scene loaded", "success");
    } catch (error) {
        console.error(error);

        clearOldCryptoObjects();

        setStatus("Could not load portfolio", "error");

        sceneAssetsList.innerHTML = "No portfolio data found.";
        sceneTotalValue.textContent = "€0.00";
    }
}


// ==================================================
// BLOCK 09 — FETCH PORTFOLIO / ЗАПРОС ПОРТФЕЛЯ
// ==================================================

async function fetchPortfolio() {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(`${API_URL}/api/portfolio/my`, {
        method: "GET",
        headers
    });

    if (!response.ok) {
        response = await fetch(`${API_URL}/api/portfolio`, {
            method: "GET",
            headers
        });
    }

    if (!response.ok) {
        throw new Error("Portfolio request failed");
    }

    return await response.json();
}


// ==================================================
// BLOCK 10 — NORMALIZE BACKEND DATA / ПОДГОТОВКА ДАННЫХ С BACKEND
// ==================================================

function normalizePortfolioData(data) {
    const items = Array.isArray(data)
        ? data
        : data.items || data.portfolioItems || data.assets || [];

    return items
        .map((item) => {
            const symbol =
                item.symbol ||
                item.cryptoSymbol ||
                item.cryptoCurrency?.symbol ||
                item.crypto?.symbol ||
                "UNKNOWN";

            const name =
                item.name ||
                item.cryptoName ||
                item.cryptoCurrency?.name ||
                item.crypto?.name ||
                symbol;

            const quantity = Number(item.quantity || 0);

            const currentPrice = Number(
                item.currentPrice ||
                item.price ||
                item.cryptoCurrency?.currentPrice ||
                item.crypto?.currentPrice ||
                0
            );

            const averageBuyPrice = Number(
                item.averageBuyPrice ||
                item.avgBuyPrice ||
                item.buyPrice ||
                0
            );

            const value = Number(
                item.value ||
                item.currentValue ||
                item.totalValue ||
                quantity * currentPrice
            );

            const investedValue = quantity * averageBuyPrice;

            const profitLoss = Number(
                item.profitLoss ||
                item.profit ||
                item.totalProfitLoss ||
                value - investedValue
            );

            const profitPercent =
                investedValue > 0
                    ? (profitLoss / investedValue) * 100
                    : 0;

            return {
                symbol: symbol.toUpperCase(),
                name,
                quantity,
                currentPrice,
                averageBuyPrice,
                value,
                investedValue,
                profitLoss,
                profitPercent
            };
        })
        .filter((item) => item.quantity > 0 && item.value > 0);
}


// ==================================================
// BLOCK 11 — CREATE 3D OBJECTS / СОЗДАНИЕ 3D-ОБЪЕКТОВ
// ==================================================

function createCryptoObjects(portfolioItems) {
    if (portfolioItems.length === 0) {
        createEmptyStateObject();
        return;
    }

    const maxValue = Math.max(...portfolioItems.map((item) => item.value));
    const totalValue = portfolioItems.reduce((sum, item) => sum + item.value, 0);

    portfolioItems.forEach((item, index) => {
        const scale = calculateScale(item.value, maxValue);
        const allocationPercent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        const profitStatus = getProfitStatus(item.profitLoss);

        const baseColor = getObjectDisplayColor(item.symbol, profitStatus);
        const profitColor = getColorByProfitStatus(profitStatus);
        const geometry = getGeometryBySymbol(item.symbol, scale);

        const material = new THREE.MeshPhysicalMaterial({
            color: baseColor,
            metalness: 0.52,
            roughness: 0.08,
            transparent: true,
            opacity: 0.96,
            clearcoat: 1,
            clearcoatRoughness: 0.02,
            emissive: profitColor,
            emissiveIntensity: getEmissiveIntensityByProfit(item.profitPercent),
            flatShading: true
        });

        const mesh = new THREE.Mesh(geometry, material);

        const position = calculateObjectPosition(
            index,
            portfolioItems.length,
            scale,
            item.profitPercent
        );

        mesh.position.set(position.x, position.y, position.z);

        mesh.userData = {
            isCryptoObject: true,

            symbol: item.symbol,
            name: item.name,

            quantity: item.quantity,
            currentPrice: item.currentPrice,
            averageBuyPrice: item.averageBuyPrice,

            value: item.value,
            investedValue: item.investedValue,
            profitLoss: item.profitLoss,
            profitPercent: item.profitPercent,
            allocationPercent: allocationPercent,

            profitStatus: profitStatus,

            rotationSpeed: calculateRotationSpeed(item.profitPercent, index),
            baseEmissiveIntensity: getEmissiveIntensityByProfit(item.profitPercent),

            baseY: mesh.position.y,
            baseScale: scale,
            floatOffset: index * 0.75,
            targetScale: 1
        };

        scene.add(mesh);

        addCrystalEdges(mesh, item.symbol);
        addCrystalCoreLight(mesh, profitStatus);
        addGlowBase(mesh, item.symbol, profitStatus, allocationPercent);
        addProfitPillar(mesh, profitStatus, position.profitHeight);

        cryptoObjects.push(mesh);

        const label = createCryptoLabel({
            ...item,
            allocationPercent
        });

        const labelHeightOffset = getLabelHeightOffset(
            index,
            portfolioItems.length,
            item.symbol
        );

        label.position.set(0, scale + labelHeightOffset, 0);

        mesh.add(label);
    });
}

function getLabelHeightOffset(index, totalObjects, symbol) {
    if (totalObjects === 1) {
        return 1.45;
    }

    if (totalObjects === 2) {
        return 1.4;
    }

    if (totalObjects === 3) {
        const offsets = [1.35, 1.55, 1.35];
        return offsets[index] || 1.35;
    }

    if (totalObjects === 4) {
        const offsets = [1.35, 1.55, 1.55, 1.35];
        return offsets[index] || 1.35;
    }

    if (totalObjects === 5) {
        const offsets = [1.35, 1.75, 2.05, 1.65, 1.35];
        return offsets[index] || 1.4;
    }

    return index % 2 === 0 ? 1.35 : 1.6;
}

function calculateObjectPosition(index, totalObjects, scale, profitPercent) {
    const profitHeight = calculateProfitHeight(profitPercent);
    const visualLift = profitHeight * 0.42;

    // 1 крипта — центр сцены
    if (totalObjects === 1) {
        return {
            x: 0,
            y: scale - 2.15 + visualLift,
            z: -2.7,
            profitHeight
        };
    }

    // 2 крипты — красиво рядом
    if (totalObjects === 2) {
        const positions = [
            { x: -2.5, z: -2 },
            { x: 2.5, z: -2.5 }
        ];

        return {
            x: positions[index].x,
            y: scale - 2.25 + visualLift,
            z: positions[index].z,
            profitHeight
        };
    }

    // 3 крипты — треугольная композиция
    if (totalObjects === 3) {
        const positions = [
            { x: -3.7, z: -2.45 },
            { x: 0, z: -3.25 },
            { x: 3.7, z: -2.45 }
        ];

        return {
            x: positions[index].x,
            y: scale - 2.28 + visualLift,
            z: positions[index].z,
            profitHeight
        };
    }

    // 4 крипты — широкая витрина
    if (totalObjects === 4) {
        const positions = [
            { x: -5.3, z: -2.3 },
            { x: -1.65, z: -3.15 },
            { x: 1.65, z: -3.15 },
            { x: 4.7, z: -2.35 }
        ];

        return {
            x: positions[index].x,
            y: scale - 2.33 + visualLift,
            z: positions[index].z,
            profitHeight
        };
    }

    // 5 крипт — широкая витрина:
    // BTC и ETH раздвинуты сильнее, чтобы большие объекты не слипались
    if (totalObjects === 5) {
        const positions = [
            { x: -6.35, z: -2.25 }, // 1-я крипта: дальше влево
            { x: -2.25, z: -3.55 }, // 2-я крипта: правее и глубже
            { x: 0.75,  z: -4.25 }, // 3-я крипта: центр глубже
            { x: 3.35,  z: -3.45 }, // 4-я крипта: правый центр
            { x: 6.05,  z: -2.25 }  // 5-я крипта: правый край
        ];

        const heightOffsets = [
            0.16,
            -0.04,
            0.22,
            -0.16,
            0.14
        ];

    return {
        x: positions[index].x,
        y: scale - 2.35 + visualLift + heightOffsets[index],
        z: positions[index].z,
        profitHeight
    };
}

    // 6+ крипт — дуга внутри круга
    const radius = Math.min(7.6, 5.5 + totalObjects * 0.38);
    const arcSpan = Math.min(Math.PI * 1.02, 1.3 + totalObjects * 0.18);

    const startAngle = -Math.PI / 2 - arcSpan / 2;
    const angleStep = arcSpan / (totalObjects - 1);
    const angle = startAngle + index * angleStep;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 1.95;

    const heightOffset = index % 2 === 0 ? 0.16 : -0.08;

    return {
        x,
        y: scale - 2.35 + visualLift + heightOffset,
        z,
        profitHeight
    };
}


// ==================================================
// BLOCK 12 — GEOMETRY BY COIN / ФОРМА ОБЪЕКТА ПО МОНЕТЕ
// ==================================================

function getGeometryBySymbol(symbol, scale) {
    const cleanSymbol = symbol.toUpperCase();

    if (cleanSymbol === "BTC") {
        // BTC — крупный многогранник
        return new THREE.DodecahedronGeometry(scale * 1.05, 0);
    }

    if (cleanSymbol === "ETH") {
        // ETH — классический кристалл-ромб
        return new THREE.OctahedronGeometry(scale * 1.02, 0);
    }

    if (cleanSymbol === "SOL") {
        // SOL — треугольная пирамида, чуть меньше чтобы не мешала соседям
        return new THREE.TetrahedronGeometry(scale * 1.05, 0);
    }   

    if (cleanSymbol === "ADA") {
        // ADA — пятигранный кристалл, теперь форма отличается от ETH
        return new THREE.CylinderGeometry(
            scale * 0.72,  // верхний радиус
            scale * 0.42,  // нижний радиус
            scale * 1.55,  // высота
            5              // количество сторон
        );
    }

    if (cleanSymbol === "BNB") {
        // BNB — икосаэдр
        return new THREE.IcosahedronGeometry(scale * 1.02, 0);
    }

    return new THREE.OctahedronGeometry(scale, 0);
}

// ==================================================
// BLOCK 12.1 — CRYSTAL EDGES / INNER LIGHT / ГРАНИ КРИСТАЛЛА И ВНУТРЕННИЙ СВЕТ
// ==================================================

function addCrystalEdges(mesh, symbol) {
    const edgeColors = {
        BTC: 0x93c5fd,
        ETH: 0xc4b5fd,
        SOL: 0x67e8f9,
        ADA: 0xbfdbfe,
        BNB: 0xfde68a
    };

    const color = edgeColors[symbol?.toUpperCase()] || 0xffffff;

    const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry, 15);

    const edgesMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95
    });

    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    mesh.add(edges);
}

function addCrystalCoreLight(mesh, profitStatus = "neutral") {
    const coreGeometry = new THREE.SphereGeometry(0.16, 24, 24);

    const coreMaterial = new THREE.MeshBasicMaterial({
        color: getColorByProfitStatus(profitStatus),
        transparent: true,
        opacity: 0.95
    });

    const core = new THREE.Mesh(coreGeometry, coreMaterial);

    mesh.add(core);
}

function addGlowBase(mesh, symbol, profitStatus = "neutral", allocationPercent = 0) {
    const color = getColorByProfitStatus(profitStatus);

    const outerRadius = 0.9 + Math.min(allocationPercent / 100, 1) * 0.8;

    const geometry = new THREE.RingGeometry(
        outerRadius * 0.56,
        outerRadius,
        64
    );

    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.30,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.x = -Math.PI / 2;
    ring.position.set(mesh.position.x, SCENE_FLOOR_Y + 0.08, mesh.position.z);

    scene.add(ring);
    sceneDecorations.push(ring);
}

function addProfitPillar(mesh, profitStatus, profitHeight) {
    const color = getColorByProfitStatus(profitStatus);

    const pillarHeight = Math.max(0.18, Math.abs(profitHeight) + 0.18);

    const geometry = new THREE.CylinderGeometry(0.03, 0.03, pillarHeight, 18);

    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
    });

    const pillar = new THREE.Mesh(geometry, material);

    const direction = profitHeight >= 0 ? 1 : -1;

    pillar.position.set(
        mesh.position.x,
        SCENE_FLOOR_Y + 0.14 + direction * pillarHeight / 2,
        mesh.position.z
    );

    scene.add(pillar);
    sceneDecorations.push(pillar);
}


// ==================================================
// BLOCK 13 — LABELS / ПОДПИСИ ОБЪЕКТОВ
// ==================================================

function createCryptoLabel(item) {
    const labelElement = document.createElement("div");
    labelElement.className = "crypto-label";

    const profitClass =
        item.profitLoss > 0
            ? "label-profit"
            : item.profitLoss < 0
                ? "label-loss"
                : "label-neutral";

    labelElement.classList.add(profitClass);

    labelElement.innerHTML = `
        <strong>${item.symbol}</strong>
        <span>${formatCurrency(item.value)}</span>
        <small>${formatPercent(item.allocationPercent)} of portfolio</small>
    `;

    return new CSS2DObject(labelElement);
}


// ==================================================
// BLOCK 14 — EMPTY STATE OBJECT / ОБЪЕКТ ДЛЯ ПУСТОГО ПОРТФЕЛЯ
// ==================================================

function createEmptyStateObject() {
    const geometry = new THREE.OctahedronGeometry(1.8, 0);

    const material = new THREE.MeshPhysicalMaterial({
        color: 0x18295a,
        metalness: 0.45,
        roughness: 0.14,
        transparent: true,
        opacity: 0.82,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.18,
        flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, -0.4, -3.6);

    mesh.userData = {
        isCryptoObject: true,
        symbol: "EMPTY",
        quantity: 0,
        currentPrice: 0,
        value: 0,
        profitLoss: 0,
        rotationSpeed: 0.006,
        baseY: 0,
        baseScale: 1.8,
        floatOffset: 0,
        targetScale: 1
    };

    scene.add(mesh);

    addCrystalEdges(mesh, "ETH");
    addCrystalCoreLight(mesh);

    cryptoObjects.push(mesh);

    const labelElement = document.createElement("div");
    labelElement.className = "crypto-label";
    labelElement.textContent = "No assets yet";

    const label = new CSS2DObject(labelElement);
    label.position.set(0, 2.2, 0);

    mesh.add(label);
}


// ==================================================
// BLOCK 14.0 — POINTER DRAG DETECTION / ОПРЕДЕЛЕНИЕ ПЕРЕТАСКИВАНИЯ МЫШЬЮ
// ==================================================

function handlePointerDown(event) {
    pointerDownPosition.set(event.clientX, event.clientY);
    pointerMovedDistance = 0;
    isDraggingScene = false;
}

function handlePointerMove(event) {
    const currentPosition = new THREE.Vector2(event.clientX, event.clientY);

    pointerMovedDistance = currentPosition.distanceTo(pointerDownPosition);

    if (pointerMovedDistance > 6) {
        isDraggingScene = true;
    }
}

function handlePointerUp() {
    setTimeout(() => {
        isDraggingScene = false;
        pointerMovedDistance = 0;
    }, 80);
}


// ==================================================
// BLOCK 14.1 — CLICK ON 3D OBJECT / КЛИК ПО 3D-ОБЪЕКТУ
// ==================================================

function handleObjectClick(event) {
    // Если пользователь двигал мышку, значит он вращал сцену,
    // а не хотел выбрать объект.
    if (isDraggingScene || pointerMovedDistance > 6) {
        return;
    }

    const rect = threeContainer.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cryptoObjects, false);

    if (intersects.length === 0) {
        return;
    }

    const selectedObject = intersects[0].object;

    if (!selectedObject.userData.isCryptoObject) {
        return;
    }

    focusCameraOnObject(selectedObject);

    pendingModalData = selectedObject.userData;

    if (modalOpenTimer) {
        clearTimeout(modalOpenTimer);
    }

    modalOpenTimer = setTimeout(() => {
        openCoinModal(pendingModalData);
        pendingModalData = null;
    }, 450);
}

function openCoinModal(data) {
    if (!data) {
        return;
    }

    modalCoinSymbol.textContent = data.symbol;
    modalCoinQuantity.textContent = formatNumber(data.quantity);
    modalCoinPrice.textContent = formatCurrency(data.currentPrice);
    modalCoinValue.textContent = formatCurrency(data.value);
    modalCoinProfit.textContent = formatCurrency(data.profitLoss);

    if (modalCoinProfitPercent) {
        modalCoinProfitPercent.textContent = formatPercent(data.profitPercent);
    }

    if (modalCoinAllocation) {
        modalCoinAllocation.textContent = formatPercent(data.allocationPercent);
    }

    if (data.profitLoss > 0) {
        modalCoinProfit.style.color = "#14b88a";
    } else if (data.profitLoss < 0) {
        modalCoinProfit.style.color = "#c43f5f";
    } else {
        modalCoinProfit.style.color = "#4457c2";
    }

    coinModal.classList.remove("hidden");
}

function focusCameraOnObject(object) {
    const objectWorldPosition = new THREE.Vector3();

    object.getWorldPosition(objectWorldPosition);

    cameraLookAtTarget = objectWorldPosition.clone();

    const clampedCameraX = THREE.MathUtils.clamp(
        objectWorldPosition.x * 0.42,
        -2.8,
        2.8
    );

    cameraTargetPosition = new THREE.Vector3(
        clampedCameraX,
        objectWorldPosition.y + 2.8,
        objectWorldPosition.z + 8.7
    );
}

function resetCameraView() {
    cameraTargetPosition = defaultCameraPosition.clone();
    cameraLookAtTarget = defaultControlsTarget.clone();
}

function handleSceneDoubleClick(event) {
    event.preventDefault();

    if (modalOpenTimer) {
        clearTimeout(modalOpenTimer);
        modalOpenTimer = null;
    }

    pendingModalData = null;

    coinModal.classList.add("hidden");

    resetCameraView();
}


// ==================================================
// BLOCK 14.2 — HOVER EFFECT ON 3D OBJECT / ЭФФЕКТ ПРИ НАВЕДЕНИИ НА 3D-ОБЪЕКТ
// ==================================================

function handleObjectHover(event) {
    const rect = threeContainer.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cryptoObjects, false);

    if (intersects.length === 0) {
        clearHoverEffect();
        return;
    }

    const selectedObject = intersects[0].object;

    if (!selectedObject.userData.isCryptoObject) {
        clearHoverEffect();
        return;
    }

    if (hoveredObject === selectedObject) {
        return;
    }

    clearHoverEffect();

    hoveredObject = selectedObject;
    hoveredObject.userData.targetScale = 1.2;

    if (hoveredObject.material) {
        hoveredObject.material.emissiveIntensity =
            (hoveredObject.userData.baseEmissiveIntensity || 0.18) + 0.16;
    }

    threeContainer.style.cursor = "pointer";
}

function clearHoverEffect() {
    if (!hoveredObject) {
        return;
    }

    hoveredObject.userData.targetScale = 1;

    if (hoveredObject.material) {
        hoveredObject.material.emissiveIntensity =
            hoveredObject.userData.baseEmissiveIntensity || 0.18;
    }

    hoveredObject = null;
    threeContainer.style.cursor = "default";
}


// ==================================================
// BLOCK 15 — HELPERS / ПОМОЩНИКИ
// ==================================================

function calculateScale(value, maxValue) {
    if (maxValue <= 0) {
        return 1.2;
    }

    // Немного уменьшили максимум,
    // чтобы ETH не перекрывал BTC / SOL / ADA / BNB
    const minScale = 1.18;
    const maxScale = 2.15;

    return minScale + (value / maxValue) * (maxScale - minScale);
}

function getProfitStatus(profitLoss) {
    if (profitLoss > 0) {
        return "profit";
    }

    if (profitLoss < 0) {
        return "loss";
    }

    return "neutral";
}

function getColorByProfitStatus(status) {
    if (status === "profit") {
        return 0x2dd4bf; // blue-green / cyan-teal
    }

    if (status === "loss") {
        return 0xf43f5e;
    }

    return 0x3b82f6;
}

function calculateProfitHeight(profitPercent) {
    const limitedPercent = Math.max(-50, Math.min(50, profitPercent));

    return limitedPercent / 30;
}

function calculateRotationSpeed(profitPercent, index) {
    const absolutePercent = Math.abs(profitPercent);

    const baseSpeed = 0.0038;
    const extraSpeed = Math.min(absolutePercent / 100, 0.018);

    return baseSpeed + extraSpeed + index * 0.0004;
}

function getEmissiveIntensityByProfit(profitPercent) {
    const absolutePercent = Math.abs(profitPercent);

    return 0.18 + Math.min(absolutePercent / 90, 0.24);
}

function formatPercent(value) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function formatNumber(value) {
    return new Intl.NumberFormat("de-DE", {
        maximumFractionDigits: 16
    }).format(value || 0);
}

function getColorBySymbol(symbol) {
    const coinColors = {
        BTC: 0x1f5f8f,
        ETH: 0x4c63c9,
        SOL: 0x1a7287,
        ADA: 0x256fb2,
        BNB: 0x3f566f
    };

    return coinColors[symbol?.toUpperCase()] || 0x1f5f8f;
}

function getObjectDisplayColor(symbol, profitStatus) {
    if (profitStatus === "profit") {
        const profitPalette = {
            BTC: 0x35c9c2,
            ETH: 0x62b8ff,
            SOL: 0x20d0b2,
            ADA: 0x4d92ff,
            BNB: 0x38bdf8
        };

        return profitPalette[symbol?.toUpperCase()] || 0x38bdf8;
    }

    return getColorBySymbol(symbol);
}

function formatCurrency(value) {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return "—";
    const fractionDigits = Math.abs(numeric) > 0 && Math.abs(numeric) < 0.005 ? 18 : 2;
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: fractionDigits === 2 ? 2 : 0,
        maximumFractionDigits: fractionDigits
    }).format(numeric);
}

function setStatus(text, type) {
    sceneStatus.textContent = text;

    if (type === "success") {
        sceneStatus.style.color = "#14b88a";
        sceneStatus.style.background = "rgba(20, 184, 138, 0.12)";
        return;
    }

    if (type === "error") {
        sceneStatus.style.color = "#c43f5f";
        sceneStatus.style.background = "rgba(196, 63, 95, 0.12)";
        return;
    }

    sceneStatus.style.color = "#22d3ee";
    sceneStatus.style.background = "rgba(34, 211, 238, 0.12)";
}


// ==================================================
// BLOCK 16 — RENDER SIDE PANEL / ОТРИСОВКА БОКОВОЙ ПАНЕЛИ
// ==================================================

function renderTotalValue(items) {
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);

    sceneTotalValue.textContent = formatCurrency(totalValue);
}

function renderAssetsList(items) {
    if (items.length === 0) {
        sceneAssetsList.innerHTML = "No assets loaded yet.";
        return;
    }

    const totalValue = items.reduce((sum, item) => sum + item.value, 0);

    sceneAssetsList.innerHTML = items
        .map((item) => {
            const allocationPercent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

            const status =
                item.profitLoss > 0
                    ? "profit"
                    : item.profitLoss < 0
                        ? "loss"
                        : "neutral";

            return `
                <button class="asset-row asset-row-button ${status}" data-symbol="${item.symbol}" type="button">
                    <span class="asset-left">
                        <span class="asset-status-dot"></span>
                        <span class="asset-symbol">${item.symbol}</span>
                    </span>

                    <span class="asset-right">
                        <span class="asset-value">${formatCurrency(item.value)}</span>
                        <span class="asset-percent">${formatPercent(allocationPercent)}</span>
                    </span>
                </button>
            `;
        })
        .join("");
}

function focusObjectBySymbol(symbol) {
    const object = cryptoObjects.find((item) => {
        return item.userData.symbol === symbol;
    });

    if (!object) {
        return;
    }

    focusCameraOnObject(object);
    openCoinModal(object.userData);
}


// ==================================================
// BLOCK 17 — CLEAR OLD OBJECTS / ОЧИСТКА СТАРЫХ ОБЪЕКТОВ
// ==================================================

function clearOldCryptoObjects() {
    // 1. Удаляем старые CSS2D labels из HTML-слоя
    // Это исправляет баг, когда после Reload 3D текст удваивается
    if (labelRenderer && labelRenderer.domElement) {
        labelRenderer.domElement
            .querySelectorAll(".crypto-label")
            .forEach((label) => {
                label.remove();
            });
    }

    // 2. Удаляем старые 3D-объекты криптовалют
    cryptoObjects.forEach((object) => {
        object.traverse((child) => {
            // Дополнительная защита: если внутри объекта есть HTML-label
            if (child.element && child.element.classList?.contains("crypto-label")) {
                child.element.remove();
            }

            if (child.geometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                child.material.dispose();
            }
        });

        scene.remove(object);
    });

    // 3. Удаляем только динамические декорации:
    // кольца под монетами и profit/loss pillars
    sceneDecorations.forEach((object) => {
        if (object.geometry) {
            object.geometry.dispose();
        }

        if (object.material) {
            object.material.dispose();
        }

        scene.remove(object);
    });

    // 4. Очищаем массивы
    cryptoObjects = [];
    sceneDecorations = [];
}


// ==================================================
// BLOCK 18 — RESIZE / АДАПТАЦИЯ ПРИ ИЗМЕНЕНИИ РАЗМЕРА ОКНА
// ==================================================

function handleResize() {
    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
}


// ==================================================
// BLOCK 19 — ANIMATION LOOP / ЦИКЛ АНИМАЦИИ
// ==================================================

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    if (particles && !motionPaused) {
        particles.rotation.y += 0.0009;
        particles.rotation.x += 0.00025;
    }

    cryptoObjects.forEach((object) => {
        if (!motionPaused) {
            object.rotation.y += object.userData.rotationSpeed || 0.004;
            object.rotation.x += 0.0012;
        }

        if (typeof object.userData.baseY === "number" && !motionPaused) {
            object.position.y =
                object.userData.baseY +
                Math.sin(time * 1.2 + object.userData.floatOffset) * 0.12;
        }

        const targetScale = object.userData.targetScale || 1;

        object.scale.x += (targetScale - object.scale.x) * 0.08;
        object.scale.y += (targetScale - object.scale.y) * 0.08;
        object.scale.z += (targetScale - object.scale.z) * 0.08;
    });

    if (cameraTargetPosition) {
        camera.position.lerp(cameraTargetPosition, 0.045);
        controls.target.lerp(cameraLookAtTarget, 0.045);

        if (camera.position.distanceTo(cameraTargetPosition) < 0.08) {
            cameraTargetPosition = null;
        }
    }

    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}