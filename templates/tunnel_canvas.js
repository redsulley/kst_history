
const canvas = document.getElementById('tunnelCanvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;

// --- 核心設定 ---
const SPOKE_COUNT = 16;       // 放射線數量
const RING_COUNT = 12;        // 圓環數量
const SPEED = 0.0005;         // 移動與旋轉速度
const WOBBLE_STRENGTH = 6;    // 手繪抖動強度
const SEGMENT_SIZE = 15;      // 線條細膩度
const BASE_ROTATION = Math.PI * 2; // 一個週期轉一圈 (確保無縫)

// --- 線條粗細度設定 (分開設定) ---
const SPOKE_LINE_WIDTH = 1.2; // 放射線的粗細度
const RING_LINE_WIDTH = 2.5;  // 圓環線的粗細度

let progress = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width * 0.25;
    centerY = height * 0.35;
}

window.addEventListener('resize', resize);
resize();

/**
 * 繪製自由手繪放射線 (Spokes)
 */
function drawHandDrawnSpoke(index, seed) {
    const angle = (index / SPOKE_COUNT) * Math.PI * 2 + progress * BASE_ROTATION;
    const maxDist = Math.max(width, height) * 1.5;
    const segments = Math.floor(maxDist / SEGMENT_SIZE);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.moveTo(centerX, centerY);

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const normX = -dirY;
    const normY = dirX;

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const dist = t * maxDist;
        const bx = centerX + dirX * dist;
        const by = centerY + dirY * dist;
        const wobble = Math.sin(t * 6 * Math.PI + seed + progress * Math.PI * 4) * WOBBLE_STRENGTH;

        ctx.lineTo(bx + normX * wobble, by + normY * wobble);
    }
    ctx.stroke();
}

/**
 * 繪製完整的閉合手繪圓環 (Rings)
 */
function drawHandDrawnRing(radius, seed, alpha, rotationOffset) {
    if (radius < 5 || alpha <= 0) return;

    const segments = 100;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

    const eccX = 1 + Math.sin(seed) * 0.03;
    const eccY = 1 + Math.cos(seed) * 0.03;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2 + rotationOffset;
        const wobble = Math.sin(t * Math.PI * 10 + seed + progress * Math.PI * 6) * WOBBLE_STRENGTH;
        const currentR = radius + wobble;

        const x = centerX + Math.cos(angle) * currentR * eccX;
        const y = centerY + Math.sin(angle) * currentR * eccY;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    progress += SPEED;
    if (progress >= 1) progress = 0;

    const maxDist = Math.max(width, height) * 1.5;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. 繪製放射線 (使用專屬粗細度)
    ctx.lineWidth = SPOKE_LINE_WIDTH;
    for (let i = 0; i < SPOKE_COUNT; i++) {
        drawHandDrawnSpoke(i, i * 42.1);
    }

    // 2. 繪製圓環 (使用專屬粗細度)
    ctx.lineWidth = RING_LINE_WIDTH;
    for (let i = 0; i < RING_COUNT; i++) {
        let ringProgress = (i / RING_COUNT + progress) % 1;
        const radius = Math.pow(ringProgress, 2.5) * maxDist;
        const alpha = Math.sin(ringProgress * Math.PI) * 0.6;
        const ringRotation = progress * BASE_ROTATION;

        drawHandDrawnRing(radius, i * 123.7, alpha, ringRotation);
    }

    // 3. 中心光點
    const glowSize = 35 + Math.sin(progress * Math.PI * 2) * 5;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(animate);
}

animate();