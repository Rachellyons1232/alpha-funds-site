const loader = document.getElementById('loader');
const progressBar = document.querySelector('#loader-bar span');
const loaderPercent = document.getElementById('loader-percent');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const marquee = document.querySelector('.marquee-text');
const frameCount = 150;
const frames = [];
let activeFrame = 0;
let loadedCount = 0;
let hasFrames = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawPlaceholder(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#11131a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#232844';
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.42;
  ctx.beginPath();
  ctx.arc(window.innerWidth / 2, window.innerHeight / 2, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7c87ff';
  ctx.font = '700 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Video frames not yet loaded', window.innerWidth / 2, window.innerHeight / 2 - 12);
  ctx.fillStyle = '#a7aabe';
  ctx.font = '500 16px Inter, system-ui, sans-serif';
  ctx.fillText(`Frame ${index + 1} / ${frameCount}`, window.innerWidth / 2, window.innerHeight / 2 + 22);
}

function drawFrame(index) {
  if (!hasFrames) {
    drawPlaceholder(index);
    return;
  }

  const frame = frames[index] || frames[0];
  if (!frame) {
    drawPlaceholder(index);
    return;
  }

  const { naturalWidth: iw, naturalHeight: ih } = frame;
  const cw = canvas.width / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const scale = Math.max(cw / iw, ch / ih) * 0.92;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0d1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(frame, dx, dy, dw, dh);
}

function loadFrame(index) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = `frames/frame_${String(index + 1).padStart(4, '0')}.webp`;
    image.onload = () => {
      frames[index] = image;
      loadedCount += 1;
      hasFrames = true;
      resolve(true);
    };
    image.onerror = () => {
      resolve(false);
    };
  });
}

async function preloadFrames() {
  const batch = Math.min(frameCount, 80);
  const promises = [];
  for (let i = 0; i < batch; i += 1) {
    promises.push(loadFrame(i));
  }

  const results = await Promise.all(promises);
  const loaded = results.filter(Boolean).length;
  updateLoader(loaded, batch);

  if (loaded === 0) {
    loaderPercent.textContent = '0%';
    progressBar.style.width = '0%';
    hasFrames = false;
  }

  // Continue loading any remaining frames in background
  for (let i = batch; i < frameCount; i += 1) {
    loadFrame(i).then((success) => {
      if (success) {
        loadedCount += 1;
      }
    });
  }

  finishLoading();
}

function updateLoader(loaded, total) {
  const percent = Math.round((loaded / total) * 100);
  loaderPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

function finishLoading() {
  document.body.classList.add('loaded');
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 420);
  }, 600);
  drawFrame(0);
  initScrollAnimations();
}

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      return arguments.length ? window.scrollTo(0, value) : window.pageYOffset;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    fixedMarkers: true,
  });

  ScrollTrigger.addEventListener('refresh', () => lenis.update());

  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach((section, index) => {
    const animation = section.dataset.animation || 'slide-left';
    const direction = animation.includes('right') ? 50 : -50;
    gsap.from(section.querySelector('.section-inner'), {
      y: direction,
      opacity: 0,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: false,
      },
    });
  });

  document.querySelectorAll('.stat-number').forEach((stat) => {
    const target = parseInt(stat.dataset.value, 10) || 0;
    gsap.fromTo(
      { value: 0 },
      { value: target, duration: 1.8, ease: 'power1.out', onUpdate() {
        stat.textContent = Math.floor(this.targets()[0].value);
      },
      scrollTrigger: {
        trigger: stat,
        start: 'top 80%',
        once: true,
      },
    });
  });

  gsap.to('.hero-standalone', {
    clipPath: 'circle(0% at 50% 10%)',
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '.hero-standalone',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7,
    },
  });

  gsap.to(marquee, {
    xPercent: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: '#scroll-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
    },
  });

  ScrollTrigger.create({
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate(self) {
      const index = Math.min(frameCount - 1, Math.floor(self.progress * (frameCount * 1.15)));
      if (index !== activeFrame) {
        activeFrame = index;
        drawFrame(index);
      }
    },
  });
}

window.addEventListener('resize', () => {
  resizeCanvas();
  drawFrame(activeFrame);
});

resizeCanvas();
drawPlaceholder(0);
preloadFrames();
