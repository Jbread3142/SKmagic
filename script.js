const DATA = window.PRODUCT_DATA || {};

const CATEGORY_META = {
  water: {
    label: "정수기",
    eyebrow: "Water Purifier",
    page: "water-purifier.html",
  },
  air: {
    label: "공기청정기",
    eyebrow: "Air Purifier",
    page: "air-purifier.html",
  },
  bidet: {
    label: "비데",
    eyebrow: "Bidet",
    page: "bidet.html",
  },
  sleep: {
    label: "매트리스",
    eyebrow: "Sleep Care",
    page: "sleep-care.html",
  },
};

const won = new Intl.NumberFormat("ko-KR");
const menuToggle = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");
const detailSection = document.querySelector("#productDetail");
const detailImage = document.querySelector("#detailImage");
const detailName = document.querySelector("#detailName");
const detailModel = document.querySelector("#detailModel");
const detailPrice = document.querySelector("#detailPrice");

function syncHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
}

function formatPrice(price) {
  return `${won.format(price)}원`;
}

function allProducts() {
  return Object.values(DATA).flat();
}

function productHref(product) {
  if (product.id === "G000069931") {
    return "product-detail-wpu-iac606.html";
  }
  if (product.category === "공기청정기") {
    return `product-detail-air.html?id=${product.id}`;
  }
  if (String(product.id).startsWith("G")) {
    return `product-detail-water.html?id=${product.id}`;
  }
  if (product.category === "비데") {
    return `product-detail-bidet.html?id=${product.id}`;
  }
  if (product.category === "매트리스") {
    return `product-detail-mattress.html?id=${product.id}`;
  }
  if (product.category === "정수기") {
    return `product-detail-${product.id}.html?id=${product.id}`;
  }
  return `#product-${product.id}`;
}

function productTitleParts(product) {
  const model = product.model || "";
  const escapedModel = model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const name = model
    ? product.name.replace(new RegExp(`\\s*${escapedModel}\\s*$`), "").trim()
    : product.name;

  return {
    name: name || product.name,
    model,
  };
}

function productCard(product, variant = "best") {
  const original = product.originalPrice
    ? `<small class="original-price">${formatPrice(product.originalPrice)}</small>`
    : "";
  const title = productTitleParts(product);
  const model = title.model ? `<span class="product-model">${title.model}</span>` : "";
  const benefit = product.benefit
    ? `<div class="product-benefit">${product.benefit}</div>`
    : "";
  const priceBasis = product.priceBasis
    ? `<p class="product-price-basis">월 렌탈료 · ${product.priceBasis}</p>`
    : "";

  return `
    <article class="product-card ${variant}">
      <a class="product-image" href="${productHref(product)}" aria-label="${product.name} 상세 보기">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </a>
      <div class="product-body">
        <h3><span class="product-name">${title.name}</span>${model}</h3>
        ${benefit}
        <div class="product-price">${formatPrice(product.price)}${original}</div>
        ${priceBasis}
      </div>
    </article>
  `;
}

function bestItems(key) {
  return (DATA[key] || []).slice(0, 4);
}

function monthlyItems() {
  return [
    ...(DATA.water || []).slice(0, 2),
    ...(DATA.air || []).slice(0, 1),
    ...(DATA.sleep || []).slice(0, 1),
  ].slice(0, 4);
}

function renderHome() {
  const sections = {
    waterBest: bestItems("water"),
    airBest: bestItems("air"),
    bidetBest: bestItems("bidet"),
    monthlyBest: monthlyItems(),
  };

  document.querySelectorAll("[data-section]").forEach((target) => {
    const data = sections[target.dataset.section] || [];
    target.innerHTML = data.map((product) => productCard(product, "best")).join("");
  });
}

function renderCategoryPage() {
  const key = document.body.dataset.category;
  if (!key) return;

  const meta = CATEGORY_META[key];
  const products = DATA[key] || [];
  const grid = document.querySelector("[data-product-grid]");
  const count = document.querySelector("[data-product-count]");

  if (grid) {
    grid.classList.toggle("mattress-grid", key === "sleep");
    grid.innerHTML = products.map((product) => productCard(product, "listing")).join("");
  }
  if (count && meta) {
    count.textContent = `${meta.label} 제품 ${products.length}개를 반영했습니다.`;
  }
}

function renderDetail(product) {
  if (!detailSection || !product) {
    detailSection?.classList.add("hidden");
    return;
  }

  detailImage.src = product.image;
  detailImage.alt = product.name;
  detailName.textContent = product.name;
  detailModel.textContent = product.model ? `모델명 ${product.model}` : product.category;
  detailPrice.textContent = formatPrice(product.price);
  detailSection.classList.remove("hidden");
  detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function planByTerm(plans = []) {
  return plans.reduce((acc, plan) => {
    acc[plan.term] = plan;
    return acc;
  }, {});
}

function renderPlanRow(basePlan, tradePlan) {
  const trade = tradePlan
    ? `<i></i><strong class="trade-label">타사보상 <em>월</em></strong><span>${formatPrice(tradePlan.price)}</span>`
    : "";
  const ownership = basePlan.ownershipMonths
    ? ` <small>(소유권 이전 ${basePlan.ownershipMonths}개월)</small>`
    : "";
  const promotion = basePlan.halfPriceMonths
    ? `<p class="rental-plan-note">첫 ${basePlan.halfPriceMonths}개월 월 ${formatPrice(basePlan.price / 2)} · 이후 월 ${formatPrice(basePlan.price)}</p>`
    : "";
  const tradePromotion = tradePlan?.halfPriceMonths
    ? `<p class="rental-plan-note">타사보상: 첫 ${tradePlan.halfPriceMonths}개월 월 ${formatPrice(tradePlan.price / 2)} · 이후 월 ${formatPrice(tradePlan.price)}</p>`
    : "";
  return `
    <section>
      <h3>${basePlan.term}${ownership}</h3>
      <ul>
        <li><strong><em>월</em></strong><span>${formatPrice(basePlan.price)}</span>${trade}</li>
      </ul>
      ${promotion}${tradePromotion}
    </section>
  `;
}

function renderRentalPanel(key, plans = [], tradePlans = [], activeKey = "visit") {
  if (!plans.length) return "";
  const tradeByTerm = planByTerm(tradePlans);
  const serviceCycle = plans[0]?.serviceCycle;
  return `
    <div class="rental-panel${key === activeKey ? " is-active" : ""}" data-rental-panel="${key}">
      ${serviceCycle ? `<p class="rental-cycle">${key === "self" ? "셀프관리 방문 케어" : "방문관리"} ${serviceCycle} 주기</p>` : ""}
      ${plans.map((plan) => renderPlanRow(plan, tradeByTerm[plan.term])).join("")}
    </div>
  `;
}

function rentalLabel(product, key) {
  return product.rentalLabels?.[key] || (key === "self" ? "셀프관리" : "방문관리");
}

function renderRentalGuide(guide, product) {
  const plans = product.rentalPlans || {};
  const rentalTypes = (product.rentalOrder || Object.keys(plans)).filter((key) => {
    return !key.endsWith("Trade") && (plans[key] || []).length > 0;
  });
  const activeRentalType = rentalTypes[0] || "visit";
  const tabButtons = rentalTypes
    .map((key) => {
      return `<button class="${activeRentalType === key ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeRentalType === key}" data-rental-tab="${key}">${rentalLabel(product, key)}</button>`;
    })
    .join("");

  guide.innerHTML = `
    <div class="rental-type-tabs" role="tablist" aria-label="관리 방식 선택">${tabButtons}</div>
    ${rentalTypes
      .map((key) => renderRentalPanel(key, plans[key] || [], plans[`${key}Trade`] || [], activeRentalType))
      .join("")}
  `;
}

function renderWaterDetailPage() {
  if (document.body.dataset.page !== "water-detail") return;

  const id = new URLSearchParams(location.search).get("id");
  const product = (DATA.water || []).find((item) => item.id === id) || (DATA.water || [])[0];
  if (!product) return;

  document.title = `${product.name} ${product.model} | 세모가 - SK매직 다이렉트`;

  const image = document.querySelector("[data-water-detail-image]");
  const title = document.querySelector("[data-water-detail-title]");
  const badges = document.querySelector("[data-water-detail-badges]");
  const guide = document.querySelector("[data-water-rental-guide]");
  const detailStack = document.querySelector("[data-water-detail-stack]");
  const serviceNote = document.querySelector("[data-water-service-note]");
  const plans = product.rentalPlans || {};

  if (image) {
    image.src = product.image;
    image.alt = `${product.name} ${product.model}`;
  }
  if (title) {
    title.innerHTML = `${product.name}<span>${product.model}</span>`;
  }
  if (badges) {
    badges.innerHTML = [
      product.benefit ? `<span>${product.benefit.replace(/\s*,\s*/g, " / ")}</span>` : "",
      (plans.visitTrade || plans.selfTrade) ? `<span class="light">타사보상할인</span>` : "",
    ].join("");
  }
  if (guide) {
    renderRentalGuide(guide, product);
  }
  if (serviceNote) {
    const hasTrade = Object.entries(plans).some(([key, values]) => key.endsWith("Trade") && values.length);
    serviceNote.innerHTML = [
      `<p>표시 요금은 제휴카드 할인 전 월 렌탈료입니다. 반값 할인 기간과 이후 요금은 약정별로 확인해 주세요.</p>`,
      hasTrade ? `<p>타사보상 요금은 기존 타사 정수기를 사용하던 고객에게 적용됩니다. 기존 제품은 해당 브랜드에 반납합니다.</p>` : "",
      product.tradePromotionNote ? `<p>${product.tradePromotionNote}</p>` : "",
    ].join("");
  }
  if (detailStack) {
    const detailImages = product.detailImages?.length ? product.detailImages : (product.detailImage ? [product.detailImage] : []);
    detailStack.innerHTML = detailImages.length
      ? detailImages.map((src, index) => `<img src="${src}" alt="${product.name} ${product.model} 상세 이미지 ${index + 1}" loading="lazy">`).join("")
      : `<p class="detail-placeholder">상세 이미지는 준비 중입니다.</p>`;
  }
}

function renderAirDetailPage() {
  if (document.body.dataset.page !== "air-detail") return;

  const id = new URLSearchParams(location.search).get("id");
  const product = (DATA.air || []).find((item) => item.id === id) || (DATA.air || [])[0];
  if (!product) return;

  document.title = `${product.name} ${product.model} | 세모가 - SK매직 다이렉트`;

  const image = document.querySelector("[data-air-detail-image]");
  const title = document.querySelector("[data-air-detail-title]");
  const badges = document.querySelector("[data-air-detail-badges]");
  const guide = document.querySelector("[data-air-rental-guide]");
  const detailStack = document.querySelector("[data-air-detail-stack]");

  if (image) {
    image.src = product.image;
    image.alt = `${product.name} ${product.model}`;
  }
  if (title) {
    title.innerHTML = `${product.name}<span>${product.model}</span>`;
  }
  if (badges) {
    badges.innerHTML = product.benefit ? `<span>${product.benefit}</span>` : "";
  }
  if (guide) {
    renderRentalGuide(guide, product);
  }
  if (detailStack) {
    detailStack.innerHTML = product.detailImage
      ? `<img src="${product.detailImage}" alt="${product.name} ${product.model} 상세 이미지">`
      : `<p class="detail-placeholder">상세 이미지는 준비 중입니다.</p>`;
  }
}

function renderBidetDetailPage() {
  if (document.body.dataset.page !== "bidet-detail") return;

  const id = new URLSearchParams(location.search).get("id");
  const product = (DATA.bidet || []).find((item) => item.id === id) || (DATA.bidet || [])[0];
  if (!product) return;

  document.title = `${product.name} ${product.model} | 세모가 - SK매직 다이렉트`;

  const image = document.querySelector("[data-bidet-detail-image]");
  const title = document.querySelector("[data-bidet-detail-title]");
  const badges = document.querySelector("[data-bidet-detail-badges]");
  const guide = document.querySelector("[data-bidet-rental-guide]");
  const detailStack = document.querySelector("[data-bidet-detail-stack]");

  if (image) {
    image.src = product.image;
    image.alt = `${product.name} ${product.model}`;
  }
  if (title) {
    title.innerHTML = `${product.name}<span>${product.model}</span>`;
  }
  if (badges) {
    badges.innerHTML = product.benefit ? `<span>${product.benefit}</span>` : "";
  }
  if (guide) {
    renderRentalGuide(guide, product);
  }
  if (detailStack) {
    detailStack.innerHTML = product.detailImage
      ? `<img src="${product.detailImage}" alt="${product.name} ${product.model} 상세 이미지">`
      : `<p class="detail-placeholder">상세 이미지는 준비 중입니다.</p>`;
  }
}

function renderMattressDetailPage() {
  if (document.body.dataset.page !== "mattress-detail") return;

  const id = new URLSearchParams(location.search).get("id");
  const product = (DATA.sleep || []).find((item) => item.id === id) || (DATA.sleep || [])[0];
  if (!product) return;

  document.title = `${product.name} ${product.model} | 세모가 - SK매직 다이렉트`;

  const image = document.querySelector("[data-mattress-detail-image]");
  const title = document.querySelector("[data-mattress-detail-title]");
  const badges = document.querySelector("[data-mattress-detail-badges]");
  const guide = document.querySelector("[data-mattress-rental-guide]");
  const detailStack = document.querySelector("[data-mattress-detail-stack]");

  if (image) {
    image.src = product.image;
    image.alt = `${product.name} ${product.model}`;
  }
  if (title) {
    title.innerHTML = `${product.name}<span>${product.model}</span>`;
  }
  if (badges) {
    badges.innerHTML = product.benefit ? `<span>${product.benefit}</span>` : "";
  }
  if (guide) {
    renderRentalGuide(guide, product);
  }
  if (detailStack) {
    detailStack.innerHTML = product.detailImage
      ? `<img src="${product.detailImage}" alt="${product.name} ${product.model} 상세 이미지">`
      : `<p class="detail-placeholder">상세 이미지는 준비 중입니다.</p>`;
  }
}

function bindRentalTabs() {
  const tabs = document.querySelectorAll("[data-rental-tab]");
  const panels = document.querySelectorAll("[data-rental-panel]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.rentalTab;
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.rentalPanel === target);
      });
    });
  });
}

function syncRoute() {
  const match = location.hash.match(/^#product-(.+)$/);
  if (!match) return;
  renderDetail(allProducts().find((product) => product.id === match[1]));
}

menuToggle?.addEventListener("click", () => {
  header.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".main-nav a")) {
    header.classList.remove("open");
  }
});

window.addEventListener("hashchange", syncRoute);
window.addEventListener("scroll", syncHeaderState, { passive: true });

renderHome();
renderCategoryPage();
renderWaterDetailPage();
renderAirDetailPage();
renderBidetDetailPage();
renderMattressDetailPage();
bindRentalTabs();
syncRoute();
syncHeaderState();



