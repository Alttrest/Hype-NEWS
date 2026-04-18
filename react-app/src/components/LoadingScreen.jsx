import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { animate, createTimer, text, utils } from 'animejs';

export default function LoadingScreen({ isFinished }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textContainerRef = useRef(null);
  const [dots, setDots] = useState([]);
  
  // Track mouse for both Three.js and Anime.js
  const mouse = useRef({ x: 999, y: 999, active: false, down: false });
  const isDark = document.body.classList.contains('dark');

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const app = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: false,
      alpha: true 
    });
    
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // --- Liquid Glass Texture ---
    const bgCanvas = document.createElement("canvas");
    const bgCtx = bgCanvas.getContext("2d");
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    bgTexture.minFilter = THREE.LinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;

    const drawBackground = () => {
      const w = renderer.domElement.width;
      const h = renderer.domElement.height;
      bgCanvas.width = w;
      bgCanvas.height = h;

      const grd = bgCtx.createLinearGradient(0, 0, w * 0.6, h);
      if (isDark) {
        grd.addColorStop(0, "#0f172a");
        grd.addColorStop(0.35, "#1e1b4b");
        grd.addColorStop(0.6, "#312e81");
        grd.addColorStop(1, "#1e1b4b");
      } else {
        grd.addColorStop(0, "#eef2ff");
        grd.addColorStop(0.35, "#c7d2fe");
        grd.addColorStop(0.6, "#818cf8");
        grd.addColorStop(1, "#4f46e5");
      }
      
      bgCtx.fillStyle = grd;
      bgCtx.fillRect(0, 0, w, h);

      // Waves
      bgCtx.save();
      bgCtx.globalAlpha = 0.25;
      for (let i = 0; i < 5; i++) {
        const cx = w * (0.2 + i * 0.18);
        const cy = h * (0.3 + Math.sin(i * 1.3) * 0.25);
        const rg = bgCtx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.35);
        const hue = isDark ? 260 + i * 15 : 230 + i * 20;
        rg.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.4)`);
        rg.addColorStop(1, `hsla(${hue}, 60%, 40%, 0)`);
        bgCtx.fillStyle = rg;
        bgCtx.fillRect(0, 0, w, h);
      }
      bgCtx.restore();

      bgTexture.needsUpdate = true;
    };

    drawBackground();

    // --- Droplets Physics (Optimized for performance) ---
    const MAX_DROPLETS = 12;
    const MAX_ENTRIES = MAX_DROPLETS * 2;
    const dropletBuf = new Float32Array(MAX_ENTRIES * 4);
    const dropletTex = new THREE.DataTexture(
      dropletBuf,
      MAX_ENTRIES,
      1,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dropletTex.needsUpdate = true;

    let drops = [];
    let uid = 0;
    let aspect = window.innerWidth / window.innerHeight;

    const spawn = (x, y, r, vx = 0, vy = 0) => {
      if (drops.length >= MAX_DROPLETS) return null;
      const area = Math.PI * r * r;
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.0003 + Math.random() * 0.0008;
      const d = {
        id: uid++, x, y, r, area,
        vx: vx || Math.cos(angle) * spd,
        vy: vy || Math.sin(angle) * spd,
        alive: true,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.3 + Math.random() * 0.5,
        softPrevX: x, softPrevY: y,
        softOffX: 0, softOffY: 0,
        softVelX: 0, softVelY: 0,
      };
      drops.push(d);
      return d;
    };

    for (let i = 0; i < 8; i++) {
      spawn((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.5, 0.04 + Math.random() * 0.06);
    }

    // --- Shaders ---
    const fragSrc = `
      precision highp float;
      #define MAX_N ${MAX_ENTRIES}
      uniform vec2 uRes;
      uniform sampler2D uData;
      uniform sampler2D uBg;
      uniform int uCount;
      uniform float uTime;

      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float asp = uRes.x / uRes.y;
        vec2 p = (uv - 0.5) * vec2(asp, 1.0);
        float field = 0.0;
        vec2 grad = vec2(0.0);
        vec2 lens = vec2(0.0);
        float lensW = 0.0;

        for(int i = 0; i < MAX_N; i++){
          if(i >= uCount) break;
          vec4 d = texture2D(uData, vec2((float(i)+0.5)/float(MAX_N), 0.5));
          vec2 c = d.xy;
          float r = d.z;
          if(r < 0.001) continue;
          vec2 delta = p - c;
          float dSq = dot(delta, delta) + 1e-5;
          float contrib = r * r / dSq;
          field += contrib;
          grad += -2.0 * contrib / dSq * delta;
          float w = r * r / (dSq + r * r);
          lens += (c - p) * w;
          lensW += w;
        }

        lens /= (lensW + 0.001);
        float lensLen = length(lens);
        float thr = 1.0;
        float edge = smoothstep(thr - 0.08, thr + 0.03, field);
        float refractStrength = 0.04;
        float mappedLens = atan(lensLen * 6.0) * refractStrength;
        vec2 refractDir = (lensLen > 1e-5) ? lens / lensLen : vec2(0.0);
        float refractMask = smoothstep(thr - 0.2, thr + 1.5, field);
        vec2 refractedUV = clamp(uv + refractDir * mappedLens * refractMask, 0.001, 0.999);
        vec3 bgClean = texture2D(uBg, uv).rgb;
        float gradLen = length(grad);
        float nScale = atan(gradLen * 0.5) * 0.3;
        vec2 nGrad = (gradLen > 1e-4) ? (grad / gradLen) * nScale : vec2(0.0);
        vec3 N = normalize(vec3(-nGrad, 1.0));
        vec3 L = normalize(vec3(0.3, 0.6, 1.0));
        vec3 V = vec3(0.0, 0.0, 1.0);
        vec3 H = normalize(L + V);
        float spec = pow(max(dot(N, H), 0.0), 180.0);
        float cosTheta = max(dot(N, V), 0.0);
        float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 4.0);
        float rim = smoothstep(thr + 0.6, thr, field) * edge;
        float caStr = 0.002 * edge;
        vec3 bgCA;
        bgCA.r = texture2D(uBg, refractedUV + vec2(caStr, caStr * 0.5)).r;
        bgCA.g = texture2D(uBg, refractedUV).g;
        bgCA.b = texture2D(uBg, refractedUV - vec2(caStr, caStr * 0.5)).b;
        float depth = smoothstep(thr, thr + 3.0, field);
        vec3 tint = mix(vec3(1.0), vec3(0.9, 0.95, 1.0), depth * 0.4);
        vec3 glassColor = bgCA * tint * (0.92 + 0.08 * max(dot(N, L), 0.0)) + vec3(1.0) * spec * 0.85 + vec3(0.9, 0.95, 1.0) * rim * 0.22 + vec3(1.0) * fresnel * 0.10;
        float shadowField = smoothstep(thr - 0.35, thr - 0.05, field);
        vec3 bg = bgClean * (1.0 - shadowField * 0.08);
        float border = smoothstep(thr - 0.10, thr - 0.01, field) * (1.0 - smoothstep(thr + 0.0, thr + 0.06, field)) * 0.3;
        vec3 col = mix(bg, glassColor, edge) + vec3(1.0) * border;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
      fragmentShader: fragSrc,
      uniforms: {
        uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uData: { value: dropletTex },
        uBg: { value: bgTexture },
        uCount: { value: 0 },
        uTime: { value: 0 },
      },
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    // Physics Logic
    const FIXED_DT = 8;
    const DAMP = 0.993;
    const MOUSE_R = 0.22;
    const MOUSE_F = 0.005;
    const TENSION_RANGE = 0.15;
    const TENSION_F = 0.0005;
    const BOUNCE = 0.4;
    const WANDER_F = 0.00005;
    const CENTER_PULL = 0.00001;
    const SOFT_STIFFNESS = 0.22;
    const SOFT_DAMPING = 0.6;

    const fixedUpdate = (simTime) => {
      // Apply Forces
      for (const d of drops) {
        d.wanderAngle += (Math.random() - 0.5) * d.wanderSpeed;
        d.vx += Math.cos(d.wanderAngle) * WANDER_F;
        d.vy += Math.sin(d.wanderAngle) * WANDER_F;
        d.vx -= d.x * CENTER_PULL;
        d.vy -= d.y * CENTER_PULL;

        if (mouse.current.active) {
          const dx = d.x - mouse.current.x;
          const dy = d.y - mouse.current.y;
          const dSq = dx * dx + dy * dy;
          const rr = MOUSE_R + d.r;
          if (dSq < rr * rr && dSq > 1e-5) {
            const dist = Math.sqrt(dSq);
            const s = 1 - dist / rr;
            const f = s * s * MOUSE_F;
            d.vx += (dx / dist) * f;
            d.vy += (dy / dist) * f;
          }
        }
      }

      // Tension
      for (let i = 0; i < drops.length; i++) {
        const a = drops[i];
        for (let j = i + 1; j < drops.length; j++) {
          const b = drops[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dSq = dx * dx + dy * dy;
          const rng = TENSION_RANGE + a.r + b.r;
          if (dSq < rng * rng && dSq > 1e-5) {
            const dist = Math.sqrt(dSq);
            const s = 1 - dist / rng;
            const f = s * TENSION_F;
            a.vx += (dx / dist) * f;
            a.vy += (dy / dist) * f;
            b.vx -= (dx / dist) * f;
            b.vy -= (dy / dist) * f;
          }
        }
      }

      // Integrate
      for (const d of drops) {
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= DAMP;
        d.vy *= DAMP;
        const wx = aspect * 0.5;
        const wy = 0.5;
        if (d.x - d.r < -wx) { d.x = -wx + d.r; d.vx = Math.abs(d.vx) * BOUNCE; }
        if (d.x + d.r > wx) { d.x = wx - d.r; d.vx = -Math.abs(d.vx) * BOUNCE; }
        if (d.y - d.r < -wy) { d.y = -wy + d.r; d.vy = Math.abs(d.vy) * BOUNCE; }
        if (d.y + d.r > wy) { d.y = wy - d.r; d.vy = -Math.abs(d.vy) * BOUNCE; }
      }

      // Merge
      for (let i = 0; i < drops.length; i++) {
        const a = drops[i]; if (!a.alive) continue;
        for (let j = i + 1; j < drops.length; j++) {
          const b = drops[j]; if (!b.alive) continue;
          const dx = b.x - a.x; const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < (a.r + b.r) * 0.65) {
            const na = a.area + b.area;
            a.x = (a.x * a.area + b.x * b.area) / na;
            a.y = (a.y * a.area + b.y * b.area) / na;
            a.vx = (a.vx * a.area + b.vx * b.area) / na;
            a.vy = (a.vy * a.area + b.vy * b.area) / na;
            a.r = Math.sqrt(na / Math.PI); a.area = na; b.alive = false;
          }
        }
      }
      drops = drops.filter(d => d.alive);

      // Soft Bodies
      for (const d of drops) {
        const dx = d.x - d.softPrevX;
        const dy = d.y - d.softPrevY;
        d.softVelX += (dx - d.softOffX) * SOFT_STIFFNESS;
        d.softVelY += (dy - d.softOffY) * SOFT_STIFFNESS;
        d.softVelX *= SOFT_DAMPING;
        d.softVelY *= SOFT_DAMPING;
        d.softOffX += d.softVelX;
        d.softOffY += d.softVelY;
        d.softPrevX = d.x;
        d.softPrevY = d.y;
      }
    };

    const sync = () => {
      dropletBuf.fill(0);
      const n = Math.min(drops.length, MAX_DROPLETS);
      for (let i = 0; i < n; i++) {
        const d = drops[i];
        dropletBuf[i * 4] = d.x;
        dropletBuf[i * 4 + 1] = d.y;
        dropletBuf[i * 4 + 2] = d.r;
        dropletBuf[i * 4 + 3] = 1;
        const gi = (n + i) * 4;
        dropletBuf[gi] = d.x - d.softOffX * 3.5;
        dropletBuf[gi + 1] = d.y - d.softOffY * 3.5;
        dropletBuf[gi + 2] = d.r * 0.7;
        dropletBuf[gi + 3] = 1;
      }
      dropletTex.needsUpdate = true;
      mat.uniforms.uCount.value = n * 2;
    };

    let lastTime = performance.now();
    let acc = 0;
    let requestRef;

    const animateLoop = (now) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;
      acc += dt;
      while (acc >= FIXED_DT) {
        fixedUpdate(now);
        acc -= FIXED_DT;
      }
      mat.uniforms.uTime.value = now * 0.001;
      sync();
      renderer.render(scene, camera);
      requestRef = requestAnimationFrame(animateLoop);
    };

    requestRef = requestAnimationFrame(animateLoop);

    const handlePointerMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * aspect;
      mouse.current.y = 0.5 - (e.clientY - rect.top) / rect.height;
      mouse.current.active = true;
      // Share with Anime.js
      window.pointerX = e.clientX;
      window.pointerY = e.clientY;
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      aspect = window.innerWidth / window.innerHeight;
      mat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
      drawBackground();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  // --- Anime.js Fleeing Text ---
  useEffect(() => {
    if (!textContainerRef.current) return;

    const { chars } = text.split('#hype-logo', { chars: true });
    const rects = [];
    const animations = [];
    const radius = 80;

    const getRect = ($c, i) => rects[i] = $c.getBoundingClientRect();
    chars.forEach(getRect);

    const animateChar = ($c, i) => {
      const anim = animations[i];
      if (anim && anim.progress < .5) return;
      const rect = rects[i];
      if (!rect) return;
      
      const px = window.pointerX || 0;
      const py = window.pointerY || 0;
      
      const dx = px - (rect.left + (rect.width * .5));
      const dy = py - (rect.top + (rect.height * .5));
      const distanceSquared = dx * dx + dy * dy;
      const intersect = distanceSquared <= radius * radius;
      
      if (intersect) {
        animations[i] = animate($c, {
          keyframes: [
            {
              x: utils.random(-radius/2, radius/2),
              y: utils.random(-radius/2, radius/2),
              duration: 400
            },
            {
              x: 0, y: 0,
              ease: 'inOutQuad', delay: 800, duration: 1200
            }
          ],
        });
      }
    };

    const timer = createTimer({ onUpdate: () => chars.forEach(animateChar) });
    window.addEventListener('resize', () => chars.forEach(getRect));

    return () => {
      timer.pause();
      window.removeEventListener('resize', () => chars.forEach(getRect));
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center transition-opacity duration-1000 ${isFinished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div ref={textContainerRef} className="relative z-10 flex flex-col items-center select-none pointer-events-none">
        <h1 
          id="hype-logo"
          className="text-6xl sm:text-8xl font-black tracking-tighter text-white drop-shadow-2xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          HypeNews
        </h1>
        
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="w-full h-full bg-white animate-[loading-bar_2s_infinite]" />
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
            Haberler Derleniyor...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
