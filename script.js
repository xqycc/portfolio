const cases = [
  {
    id: "bot",
    href: "project-bot.html",
    number: "01",
    title: "东上数科AI外呼",
    period: "2022.10 - 2023.03",
    role: "独立负责 0-1 视觉 / 交互",
    meta: "Web端",
    tags: ["AI 语音外呼", "0-1"],
    accent: "#20d4ff",
    summary:
      "围绕客服自动打电话场景，梳理 Bot 配置、话术流程、问答知识、训练测试与数据看板，让政企用户能低成本理解和维护复杂对话系统。",
    hero: 3,
    crop: {
      image: 4,
      label: "从诉求到策略的设计目标",
      x: 36,
      y: 22,
      scale: 1.65,
    },
    highlights: [
      ["轻量感知", "通过视觉降噪、主次对比和标签层级，让高密度后台界面更容易聚焦主体内容。"],
      ["驯服复杂", "将对话流程、问答知识、变量配置等模块拆成清晰任务路径，降低理解门槛。"],
      ["直观展示", "把表格数据、状态反馈和统计信息转译为更适合决策的可视化表达。"],
    ],
    process: [5, 8, 10, 14],
  },
  {
    id: "rpa",
    href: "project-rpa.html",
    number: "02",
    title: "U途RPA",
    period: "2022.02 - 2023.03",
    role: "独立负责设计改版",
    meta: "PC客户端",
    tags: ["流程搭建", "设计改版"],
    accent: "#55a8ff",
    summary:
      "为模拟人在电脑上操作的自动化产品重构核心体验，重点处理流程搭建、必要工具触达、快捷操作与任务表单复杂度。",
    hero: 15,
    crop: {
      image: 21,
      label: "必要工具近在咫尺",
      x: 24,
      y: 18,
      scale: 1.38,
    },
    highlights: [
      ["减少停留", "让高频工具和快捷键更接近当前操作对象，减少指针移动和中断。"],
      ["心流式搭建", "围绕流程画布组织模块、节点和配置，让用户连续完成自动化搭建。"],
      ["轻松配置", "拆分任务类型和表单入口，降低填写难度，减少联动表单带来的混乱。"],
    ],
    process: [18, 21, 24, 27],
  },
  {
    id: "dashboard",
    href: "project-dashboard.html",
    number: "03",
    title: "可视化大屏",
    period: "2021 - 2022",
    role: "UI 界面设计；协同建模与动效",
    meta: "大屏",
    tags: ["政务场景", "数据看板"],
    accent: "#38d8a0",
    summary:
      "将业务监控、接待内容、区域分类、预警状态等信息组织为大屏界面，在强视觉场景里保持数据层级和阅读效率。",
    hero: 28,
    crop: {
      image: 28,
      label: "政务数智管理平台大屏",
      x: 8,
      y: 20,
      scale: 1.28,
    },
    highlights: [
      ["数据优先", "以关键指标、地图/模型和状态列表构成主视线，避免视觉效果压过业务判断。"],
      ["场景沉浸", "使用城市建模、透明面板和高亮路径，强化政务管理平台的现场感。"],
      ["多端表达", "覆盖大屏、Web 监控平台和 App 方向，展示跨终端视觉系统能力。"],
    ],
    process: [29, 30, 31, 34],
  },
  {
    id: "ai-workflow",
    href: "project-ai-workflow.html",
    number: "04",
    title: "AI 工作流设计探索",
    period: "2025 - 2026",
    role: "设计主导 / 自驱推进",
    meta: "Web端",
    tags: ["VibeCoding", "提效工具"],
    accent: "#8a7cff",
    summary: "通过AI生成访谈内容，并编制标准界面生成skill，让AI直接输出符合政采云规范的界面",
    hero: 1,
    crop: {
      image: 1,
      label: "AI 工作流设计探索",
      x: 20,
      y: 20,
      scale: 1.2,
    },
    highlights: [
      ["流程拆解", "把 AI 能力拆成输入、生成、确认、执行四个阶段，降低理解成本。"],
      ["人机协作", "保留人工判断节点，让生成式结果可以被快速验证和修正。"],
      ["设计自驱", "从需求识别到方案推进，主动定义问题和落地节奏。"],
    ],
    process: [1],
  },
  {
    id: "design-driven",
    href: "project-design-driven.html",
    number: "05",
    title: "设计自驱动",
    period: "2019 - 2026",
    role: "设计主导 / 自驱推进",
    meta: "文章",
    tags: ["交互细节", "复盘", "批量操作"],
    accent: "#f5b05d",
    summary:
      "以设计师视角主动识别问题、拆解目标并推进方案落地，将业务理解、体验策略与视觉表达整合成可执行的设计行动。",
    hero: 2,
    crop: {
      image: 2,
      label: "设计自驱动",
      x: 18,
      y: 20,
      scale: 1.2,
    },
    highlights: [
      ["主动识别", "从业务和用户场景中发现设计机会，而不是只承接明确需求。"],
      ["方案推进", "把目标拆成可执行路径，推动跨角色协作和持续迭代。"],
      ["经验沉淀", "将项目经历、方法和设计判断转化为可复用的设计资产。"],
    ],
    process: [2],
  },
];

const projectGrid = document.querySelector("#projectGrid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const topbar = document.querySelector(".topbar");
let lightboxItems = [];
let lightboxIndex = -1;
let pendingScrollTarget = null;

function slideSrc(number) {
  return `assets/slides/${number}.jpg`;
}

function originalSrc(number) {
  return `assets/slides/${number}.jpg`;
}

function showLightboxItem(index) {
  if (!lightboxImage || !lightboxItems.length) return;
  if (index < 0 || index >= lightboxItems.length) return;
  lightboxIndex = index;
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
}

function scrollToLightboxItem(index) {
  const target = lightboxItems[index]?.element;
  if (!target) return;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function scrollToPageBottom() {
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  });
}

function openLightbox(src, alt = "", index = -1) {
  if (!lightbox || !lightboxImage) return;
  if (index >= 0) {
    showLightboxItem(index);
  } else {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxIndex = lightboxItems.findIndex((item) => item.src === src);
  }
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function switchLightboxImage(step) {
  if (!lightbox?.classList.contains("open") || lightboxItems.length < 2) return;
  const nextIndex = lightboxIndex + step;
  if (nextIndex < 0 || nextIndex >= lightboxItems.length) {
    pendingScrollTarget = nextIndex >= lightboxItems.length ? "bottom" : lightboxIndex;
    closeLightbox();
    return;
  }
  showLightboxItem(nextIndex);
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
  if (pendingScrollTarget !== null) {
    if (pendingScrollTarget === "bottom") {
      scrollToPageBottom();
    } else {
      scrollToLightboxItem(pendingScrollTarget);
    }
    pendingScrollTarget = null;
  }
  lightboxIndex = -1;
}

function attachZoomHandlers(root = document) {
  lightboxItems = [...root.querySelectorAll("[data-original]")].map((element) => {
    const img = element.querySelector("img");
    return {
      element,
      src: element.dataset.original,
      alt: img?.alt || "作品集高清图",
    };
  });

  lightboxItems.forEach((item, index) => {
    const { element } = item;
    element.addEventListener("click", () => {
      openLightbox(item.src, item.alt, index);
    });
  });
}

function renderProjectCards() {
  if (!projectGrid) return;

  projectGrid.innerHTML = cases
    .map(
      (item) => `
        <a class="project-card" href="${item.href}" style="--accent: ${item.accent}">
          <div class="project-meta">
            <span>${item.number}</span>
            <span>${item.meta}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <div class="project-tags">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        </a>
      `,
    )
    .join("");
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function setupActiveNav() {
  const links = [...document.querySelectorAll(".main-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupProjectAnchorNav() {
  const links = [...document.querySelectorAll(".project-anchor nav a")];
  const sections = links
    .map((link) => {
      const href = link.getAttribute("href");
      return href?.startsWith("#") ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const setActiveLink = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });
    sections.forEach((section) => {
      section.classList.toggle("active", section.id === id);
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.slice(1);
      if (id) setActiveLink(id);
    });
  });

  const updateActiveLinkByScroll = () => {
    const probeY = window.innerHeight * 0.28;
    let activeSection = sections[0];

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probeY) {
        activeSection = section;
      }
    });

    setActiveLink(activeSection.id);
  };

  window.addEventListener("scroll", updateActiveLinkByScroll, { passive: true });
  window.addEventListener("resize", updateActiveLinkByScroll);

  const currentHash = window.location.hash.slice(1);
  if (currentHash) {
    setActiveLink(currentHash);
  } else {
    updateActiveLinkByScroll();
  }
}

function setupTopbarSurface() {
  if (!topbar) return;

  const updateTopbarSurface = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateTopbarSurface();
  window.addEventListener("scroll", updateTopbarSurface, { passive: true });
}

renderProjectCards();
attachZoomHandlers();
setupReveal();
setupActiveNav();
setupProjectAnchorNav();
setupTopbarSurface();

navToggle?.addEventListener("click", () => {
  const isOpen = mainNav?.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox?.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    switchLightboxImage(event.deltaY > 0 ? 1 : -1);
  },
  { passive: false },
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("open")) {
    closeLightbox();
  }
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    switchLightboxImage(1);
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    switchLightboxImage(-1);
  }
});

// Experience card border-following light effect
document.querySelectorAll(".experience-item").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - cx;
    const dy = my - cy;

    // Find where ray from center intersects the border
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    let bx, by;
    if (absDx * rect.height > absDy * rect.width) {
      // Intersects left or right edge
      const sign = dx > 0 ? 1 : -1;
      bx = cx + sign * cx;
      by = cy + (dy / absDx) * cx;
    } else {
      // Intersects top or bottom edge
      const sign = dy > 0 ? 1 : -1;
      bx = cx + (dx / absDy) * cy;
      by = cy + sign * cy;
    }

    const lx = (bx / rect.width) * 100;
    const ly = (by / rect.height) * 100;
    card.style.setProperty("--lx", lx + "%");
    card.style.setProperty("--ly", ly + "%");
  });
});

// Project card border-following light effect
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - cx;
    const dy = my - cy;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    let bx, by;
    if (absDx * rect.height > absDy * rect.width) {
      const sign = dx > 0 ? 1 : -1;
      bx = cx + sign * cx;
      by = cy + (dy / absDx) * cx;
    } else {
      const sign = dy > 0 ? 1 : -1;
      bx = cx + (dx / absDy) * cy;
      by = cy + sign * cy;
    }

    const lx = (bx / rect.width) * 100;
    const ly = (by / rect.height) * 100;
    card.style.setProperty("--lx", lx + "%");
    card.style.setProperty("--ly", ly + "%");
  });
});

// Align date's right edge with 16px inside the square frame
function alignDateToFrame() {
  const hero = document.querySelector(".signal-hero");
  const frame = document.querySelector(".signal-frame");
  const dateEl = document.querySelector(".signal-date");
  if (!hero || !frame || !dateEl) return;

  const heroRect = hero.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  // Distance from hero's right edge to frame's right edge
  const offset = heroRect.right - frameRect.right;
  // Date should be 16px inside the frame's right edge
  dateEl.style.marginRight = (offset + 16) + "px";
}

window.addEventListener("load", alignDateToFrame);
window.addEventListener("resize", alignDateToFrame);

// Experience cards: button-based horizontal scroll
(function () {
  const shell = document.querySelector(".experience-shell");
  const list = document.querySelector(".experience-list");
  if (!shell || !list) return;

  const btnLeft = document.querySelector(".exp-arrow--left");
  const btnRight = document.querySelector(".exp-arrow--right");
  if (!btnLeft || !btnRight) return;

  function getCardWidth() {
    const card = list.querySelector(".experience-item");
    if (!card) return 360;
    const style = getComputedStyle(list);
    return card.offsetWidth + parseInt(style.gap) || 360;
  }

  function updateArrows() {
    const maxScroll = list.scrollWidth - list.clientWidth;
    btnLeft.classList.toggle("is-visible", list.scrollLeft > 2);
    btnRight.classList.toggle("is-visible", list.scrollLeft < maxScroll - 2);
  }

  btnRight.addEventListener("click", () => {
    list.scrollBy({ left: getCardWidth(), behavior: "smooth" });
  });

  btnLeft.addEventListener("click", () => {
    list.scrollBy({ left: -getCardWidth(), behavior: "smooth" });
  });

  list.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  window.addEventListener("load", updateArrows);
  updateArrows();
})();
