<template>
  <div
    class="welcome-container flex flex-col items-center justify-center min-h-full text-center px-4 overflow-hidden relative selection:bg-accent-500/30 selection:text-white"
    @mousemove="handleMouseMove"
    ref="welcomeContainerRef"
  >
    <canvas
      id="dynamicGridCanvas"
      class="absolute inset-0 z-0 pointer-events-none"
    ></canvas>

    <div
      class="glitch-overlay absolute inset-0 z-20 pointer-events-none opacity-5"
    ></div>
    <div
      class="scanline-overlay absolute inset-0 z-30 pointer-events-none"
    ></div>

    <div class="relative z-10 flex flex-col items-center content-wrapper">
      <div
        class="logo-wrapper mb-8 md:mb-10 transform-gpu perspective"
        ref="logoWrapperRef"
      >
        <img
          src="../image/logo.png"
          alt="ST CardPlus Logo"
          class="w-28 h-28 md:w-32 md:h-32 logo-core filter"
          :style="{
            filter: `drop-shadow(0 0 10px rgba(${canvasDrawingColorRGB.value},0.5)) drop-shadow(0 0 20px rgba(${canvasDrawingColorRGB.value},0.3))`,
          }"
          ref="logoRef"
        />
      </div>

      <h1
        class="main-title text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider mb-3 md:mb-4 text-neutral-800 dark:text-neutral-100"
        :style="{
          textShadow: `0 0 8px rgba(${canvasDrawingColorRGB.value},0.4), 0 0 15px rgba(${canvasDrawingColorRGB.value},0.3), 0 0 25px rgba(${canvasDrawingColorRGB.value},0.2)`,
        }"
        ref="mainTitleRef"
      ></h1>

      <p
        class="subtitle text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-1 animate-fade-in-up opacity-0"
        style="--animate-delay: 2.5s"
      >
        今天要创造些什么？
      </p>

      <p
        class="prompt-text text-sm md:text-base text-neutral-500 dark:text-neutral-400 animate-fade-in-up opacity-0"
        style="--animate-delay: 2.8s"
      >
        从侧边栏选择您的创作模块，开启无限可能。
      </p>

      <div
        class="mt-10 md:mt-12 animate-fade-in-up opacity-0"
        style="--animate-delay: 3.1s"
      >
        <button
          @click="goToFirstEditor"
          v-if="canNavigate"
          class="btn-cyber text-base md:text-lg py-2.5 px-6 md:py-3 md:px-8 rounded-sm group relative overflow-hidden"
          :style="{
            borderColor: `rgba(${canvasDrawingColorRGB.value}, 0.5)`,
            color: `rgba(${canvasDrawingColorRGB.value}, 0.9)`,
          }"
          @mouseover="
            setButtonHoverStyle(true, $event.currentTarget as HTMLElement)
          "
          @mouseleave="
            setButtonHoverStyle(false, $event.currentTarget as HTMLElement)
          "
        >
          <span
            class="btn-cyber-bg absolute inset-0 transition-colors duration-300 z-0"
            :style="{
              backgroundColor: `rgba(${canvasDrawingColorRGB.value}, 0.1)`,
            }"
          ></span>
          <span class="relative z-10 flex items-center">
            <Icon
              icon="ph:rocket-launch-duotone"
              class="mr-2 text-xl transition-transform duration-300 group-hover:translate-x-1"
            />
            立即开始创作
          </span>
          <span
            class="absolute left-0 top-0 h-full w-0.5 animate-pulse-vertical group-hover:animate-none"
            :style="{
              backgroundColor: `rgba(${canvasDrawingColorRGB.value}, 1)`,
            }"
          ></span>
          <span
            class="absolute right-0 bottom-0 h-full w-0.5 animate-pulse-vertical-reverse group-hover:animate-none"
            :style="{
              backgroundColor: `rgba(${canvasDrawingColorRGB.value}, 1)`,
            }"
          ></span>
        </button>
      </div>
    </div>

    <div
      class="corner-ui top-4 left-4 text-xs animate-pulse-fast"
      :style="{ color: `rgba(${canvasDrawingColorRGB.value},0.5)` }"
    >
      [STATUS: ONLINE]
    </div>
    <div
      class="corner-ui bottom-4 right-4 text-xs animate-pulse-fast"
      :style="{ color: `rgba(${canvasDrawingColorRGB.value},0.5)` }"
    >
      [VER: {{ appVersion }}]
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, computed, type Ref, watch } from "vue";
import { useDark } from "@vueuse/core";

const router = useRouter();
const appVersion = ref(import.meta.env.PACKAGE_VERSION || "ERROR");
const isDark = useDark();

const welcomeContainerRef = ref<HTMLElement | null>(null);
const canvasDrawingColorRGB = ref<string>("200, 200, 200");

const firstEditorPath = "/card";
const canNavigate = computed(() => {
  try {
    return router.getRoutes().some((route) => route.path === firstEditorPath);
  } catch (e) {
    return false;
  }
});
const goToFirstEditor = () => {
  if (canNavigate.value) {
    router.push(firstEditorPath);
  }
};
const logoWrapperRef = ref<HTMLElement | null>(null);
const logoRef = ref<HTMLImageElement | null>(null);
const mainTitleRef = ref<HTMLElement | null>(null);

const handleMouseMove = (event: MouseEvent) => {
  const { clientX, clientY } = event;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const deltaX = (clientX - centerX) / centerX;
  const deltaY = (clientY - centerY) / centerY;
  const parallaxFactorLogoWrapper = 15;
  const parallaxFactorLogoCore = 5;
  const parallaxFactorTitle = 8;

  if (logoWrapperRef.value) {
    logoWrapperRef.value.style.transform = `perspective(1000px) rotateY(${
      deltaX * -5
    }deg) rotateX(${deltaY * 5}deg) translateZ(0px) translateX(${
      deltaX * -parallaxFactorLogoWrapper * 0.3
    }px) translateY(${deltaY * -parallaxFactorLogoWrapper * 0.3}px)`;
  }
  if (logoRef.value) {
    logoRef.value.style.transform = `translateX(${
      deltaX * parallaxFactorLogoCore
    }px) translateY(${deltaY * parallaxFactorLogoCore}px) translateZ(20px)`;
  }
  if (mainTitleRef.value) {
    mainTitleRef.value.style.transform = `translateX(${
      deltaX * -parallaxFactorTitle
    }px) translateY(${deltaY * -parallaxFactorTitle}px)`;
  }
};

const fullTitle = "ST CARDPLUS";
const typeDelay = 100;
const typeWriter = (
  text: string,
  i: number,
  elRef: Ref<HTMLElement | null>
) => {
  if (i < text.length && elRef.value) {
    elRef.value.innerHTML =
      text.substring(0, i + 1) +
      '<span class="typing-cursor animate-ping-cursor">|</span>';
    setTimeout(() => typeWriter(text, i + 1, elRef), typeDelay);
  } else if (elRef.value) {
    elRef.value.innerHTML = text;
    elRef.value.classList.add("typing-done");
    document.querySelectorAll(".animate-fade-in-up").forEach((el) => {
      (el as HTMLElement).style.animationPlayState = "running";
    });
  }
};

let gridAnimationId: number;
let currentPhase: "drawing" | "drawn" | "erasing" | "erased" = "drawing";
let animationProgress = 0;
const phaseDuration = {
  drawing: 3000,
  drawn: 5000,
  erasing: 3000,
  erased: 1000,
};
let phaseStartTime = 0;

function parseRgb(rgbString: string): [number, number, number] | null {
  const match = rgbString.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
  );
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastColor(bgColorRgb: [number, number, number]): string {
  const luminance = getLuminance(bgColorRgb[0], bgColorRgb[1], bgColorRgb[2]);
  if (luminance > 0.5) {
    return "50, 50, 50";
  } else {
    return "220, 220, 220";
  }
}

function updateCanvasColor() {
  if (welcomeContainerRef.value && welcomeContainerRef.value.parentElement) {
    const parentStyle = window.getComputedStyle(
      welcomeContainerRef.value.parentElement
    );
    const parentBgColor = parentStyle.backgroundColor;
    const rgbArray = parseRgb(parentBgColor);
    if (
      rgbArray &&
      parentBgColor !== "rgba(0, 0, 0, 0)" &&
      parentBgColor !== "transparent"
    ) {
      // Check for actual color
      canvasDrawingColorRGB.value = getContrastColor(rgbArray);
    } else {
      canvasDrawingColorRGB.value = isDark.value
        ? "220, 220, 220"
        : "50, 50, 50";
    }
  } else {
    canvasDrawingColorRGB.value = isDark.value ? "220, 220, 220" : "50, 50, 50";
  }
}

const setButtonHoverStyle = (
  isHovering: boolean,
  buttonElement: HTMLElement | null
) => {
  if (!buttonElement) return;
  const bgSpan = buttonElement.querySelector(".btn-cyber-bg") as HTMLElement;
  if (bgSpan) {
    if (isHovering) {
      bgSpan.style.backgroundColor = `rgba(${canvasDrawingColorRGB.value}, 0.2)`;
      buttonElement.style.color = isDark.value ? "#171717" : "#FFFFFF"; // Example hover text color change
    } else {
      bgSpan.style.backgroundColor = `rgba(${canvasDrawingColorRGB.value}, 0.1)`;
      buttonElement.style.color = `rgba(${canvasDrawingColorRGB.value}, 0.9)`;
    }
  }
};

watch(isDark, updateCanvasColor, { immediate: true });

onMounted(() => {
  typeWriter(fullTitle, 0, mainTitleRef);

  const canvas = document.getElementById(
    "dynamicGridCanvas"
  ) as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const handleResize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    updateCanvasColor();
  };
  window.addEventListener("resize", handleResize);

  const opts = {
    gridAlphaDrawn: 0.15,
    particleAlpha: 0.5,
    particleAmount: 30,
    defaultSpeed: 0.03,
    variantSpeed: 0.08,
    particleSize: 1.5,
    lineLength: 120,
    gridSize: 40,
  };

  const particles: any[] = [];
  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < opts.particleAmount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx:
          (Math.random() - 0.5) * opts.variantSpeed +
          (Math.random() > 0.5 ? opts.defaultSpeed : -opts.defaultSpeed),
        vy:
          (Math.random() - 0.5) * opts.variantSpeed +
          (Math.random() > 0.5 ? opts.defaultSpeed : -opts.defaultSpeed),
      });
    }
  }
  initParticles();
  phaseStartTime = Date.now();

  function drawDynamicGrid(progress: number, drawing: boolean) {
    if (!ctx) return;
    const drawingRGB = canvasDrawingColorRGB.value;

    for (let x = 0; x < w; x += opts.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      const lineLengthY = drawing ? h * progress : h * (1 - progress);
      ctx.lineTo(x, lineLengthY);
      const alpha = drawing
        ? opts.gridAlphaDrawn * progress
        : opts.gridAlphaDrawn * (1 - progress);
      ctx.strokeStyle = `rgba(${drawingRGB}, ${Math.min(
        opts.gridAlphaDrawn,
        Math.max(0, alpha)
      )})`;
      ctx.stroke();
    }
    for (let y = 0; y < h; y += opts.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      const lineLengthX = drawing ? w * progress : w * (1 - progress);
      ctx.lineTo(lineLengthX, y);
      const alpha = drawing
        ? opts.gridAlphaDrawn * progress
        : opts.gridAlphaDrawn * (1 - progress);
      ctx.strokeStyle = `rgba(${drawingRGB}, ${Math.min(
        opts.gridAlphaDrawn,
        Math.max(0, alpha)
      )})`;
      ctx.stroke();
    }
  }

  function drawParticles() {
    if (!ctx) return;
    const drawingRGB = canvasDrawingColorRGB.value;

    particles.forEach((p) => {
      ctx.fillStyle = `rgba(${drawingRGB}, ${opts.particleAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, opts.particleSize, 0, Math.PI * 2);
      ctx.fill();
      particles.forEach((p2) => {
        if (p === p2) return;
        const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (dist < opts.lineLength) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${drawingRGB}, ${
            (1 - dist / opts.lineLength) * 0.08
          })`;
          ctx.stroke();
        }
      });
    });
  }

  function updateParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) {
        p.vx *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
      }
      if (p.y < 0 || p.y > h) {
        p.vy *= -1;
        p.y = Math.max(0, Math.min(h, p.y));
      }
    });
  }

  function loop() {
    if (!ctx) return;
    const now = Date.now();
    const elapsedTime = now - phaseStartTime;
    ctx.clearRect(0, 0, w, h);

    if (currentPhase === "drawing") {
      animationProgress = Math.min(1, elapsedTime / phaseDuration.drawing);
      drawDynamicGrid(animationProgress, true);
      if (animationProgress >= 1) {
        currentPhase = "drawn";
        phaseStartTime = now;
      }
    } else if (currentPhase === "drawn") {
      drawDynamicGrid(1, true);
      if (elapsedTime >= phaseDuration.drawn) {
        currentPhase = "erasing";
        phaseStartTime = now;
      }
    } else if (currentPhase === "erasing") {
      animationProgress = Math.min(1, elapsedTime / phaseDuration.erasing);
      drawDynamicGrid(animationProgress, false);
      if (animationProgress >= 1) {
        currentPhase = "erased";
        phaseStartTime = now;
      }
    } else if (currentPhase === "erased") {
      if (elapsedTime >= phaseDuration.erased) {
        currentPhase = "drawing";
        phaseStartTime = now;
        animationProgress = 0;
        initParticles();
      }
    }

    updateParticles();
    drawParticles();
    gridAnimationId = requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll(".animate-fade-in-up").forEach((el) => {
    (el as HTMLElement).style.animationPlayState = "paused";
  });

  onUnmounted(() => {
    cancelAnimationFrame(gridAnimationId);
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<style scoped>
.welcome-container {
}
#dynamicGridCanvas {
}
.content-wrapper {
  transform-style: preserve-3d;
}
.perspective {
  perspective: 1000px;
}
.logo-wrapper {
  transition: transform 0.1s linear;
}
.logo-core {
  transition: transform 0.1s linear, filter 0.3s ease-out;
}

.main-title {
  transition: transform 0.1s linear;
  position: relative;
}
.main-title.typing-done {
  animation: pulseGlowMainTitle 1.5s ease-in-out 0.5s;
}
.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  opacity: 1;
}
.animate-ping-cursor {
  animation: blink 0.8s step-end infinite;
}
@keyframes blink {
  from,
  to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes pulseGlowMainTitle {
  0%,
  100% {
    text-shadow: var(--tw-text-shadow-glow-base);
  }
  50% {
    text-shadow: var(--tw-text-shadow-glow-pulse);
  }
}
:root {
  /* Define these based on canvasDrawingColorRGB if needed, or keep static if text color is fixed */
  --tw-text-shadow-glow-base: 0 0 8px
      rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.4),
    0 0 15px rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.3),
    0 0 25px rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.2);
  --tw-text-shadow-glow-pulse: 0 0 12px
      rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.7),
    0 0 25px rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.5),
    0 0 50px rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.3);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
  animation-delay: var(--animate-delay, 0s);
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--animate-delay, 0s);
}

.btn-cyber::before,
.btn-cyber::after {
  content: "";
  position: absolute;
  left: -2px;
  top: -2px;
  background: linear-gradient(
    45deg,
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0),
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0),
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.5),
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.8),
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.5),
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0),
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0)
  );
  background-size: 400%;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  z-index: 0;
  animation: beamBtnCyber 8s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.btn-cyber:hover::before,
.btn-cyber:hover::after {
  opacity: 1;
}
.btn-cyber::after {
  filter: blur(20px);
}
@keyframes beamBtnCyber {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse-vertical {
  0%,
  100% {
    height: 0%;
  }
  50% {
    height: 100%;
  }
}
.animate-pulse-vertical {
  animation: pulse-vertical 2s ease-in-out infinite;
}
@keyframes pulse-vertical-reverse {
  0%,
  100% {
    height: 0%;
    bottom: auto;
    top: 0;
  }
  50% {
    height: 100%;
    bottom: auto;
    top: 0;
  }
  50.01% {
    height: 100%;
    top: auto;
    bottom: 0;
  }
  100% {
    height: 0%;
    top: auto;
    bottom: 0;
  }
}
.animate-pulse-vertical-reverse {
  animation: pulse-vertical-reverse 2s 1s ease-in-out infinite;
}

.scanline-overlay {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 98%,
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.02) 99%,
    rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.04) 100%
  );
  background-size: 100% 4px;
  animation: scanOverlayAnim 10s linear infinite;
}
@keyframes scanOverlayAnim {
  0% {
    background-position-y: 0;
  }
  100% {
    background-position-y: 100vh;
  }
}

.glitch-overlay {
  animation: subtleGlitchOverlay 15s steps(8, end) infinite;
}
@keyframes subtleGlitchOverlay {
  0% {
    background: transparent;
  }
  1% {
    background: linear-gradient(
      90deg,
      rgba(var(--dynamic-color-rgb, 200, 200, 200), 0.005) 50%,
      transparent 50%
    );
    background-size: 10px 100%;
  }
  1.5% {
    background: transparent;
  }
  2% {
    transform: translateX(1px);
  }
  2.5% {
    transform: translateX(-1px);
  }
  3% {
    transform: translateX(0);
  }
  90% {
    background: transparent;
  }
}

.corner-ui {
  position: absolute;
  font-family: "Courier New", Courier, monospace;
}
.animate-pulse-fast {
  animation: pulseCornerUi 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulseCornerUi {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
