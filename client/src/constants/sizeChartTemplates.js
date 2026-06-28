/** Shared size chart templates — one entry reused across all products of that fit/type */

export const SIZE_CHART_TEMPLATE_KEYS = [
  "regularTshirt",
  "oversizedTshirt",
  "poloShirt",
];

export const SIZE_CHART_TEMPLATES = {
  regularTshirt: {
    label: "Regular T-Shirt",
    productFit: "Regular",
    measurements: {
      S: { chest: 38, length: 26, shoulder: 17, sleeve: 8, waist: 18 },
      M: { chest: 40, length: 27, shoulder: 18, sleeve: 8.5, waist: 19 },
      L: { chest: 42, length: 28, shoulder: 19, sleeve: 9, waist: 20 },
      XL: { chest: 44, length: 29, shoulder: 20, sleeve: 9.5, waist: 21 },
    },
    defaults: {
      fitDescription: "True to size",
      unit: "inches",
    },
  },
  oversizedTshirt: {
    label: "Oversized T-Shirt",
    productFit: "Oversized",
    measurements: {
      S: { chest: 43, length: 27, shoulder: 20.5, sleeve: 9.5, waist: 22.5 },
      M: { chest: 46, length: 27, shoulder: 21, sleeve: 10, waist: 23.5 },
      L: { chest: 48, length: 28, shoulder: 22.5, sleeve: 10, waist: 24.5 },
      XL: { chest: 50, length: 30, shoulder: 23.5, sleeve: 11, waist: 25.5 },
    },
    defaults: {
      fitDescription: "Oversized",
      unit: "inches",
    },
  },
  poloShirt: {
    label: "Polo T-Shirt (Regular fit)",
    productFit: "Regular",
    measurements: {
      S: { chest: 39, length: 27, shoulder: 17.5, sleeve: 8.5, waist: 19 },
      M: { chest: 41, length: 28, shoulder: 18.5, sleeve: 9, waist: 20 },
      L: { chest: 43, length: 29, shoulder: 19.5, sleeve: 9.5, waist: 21 },
      XL: { chest: 45, length: 30, shoulder: 20.5, sleeve: 10, waist: 22 },
    },
    defaults: {
      fitDescription: "True to size",
      unit: "inches",
    },
  },
};

const MEASUREMENT_KEYS = [
  "chest",
  "shoulder",
  "sleeve",
  "length",
  "waist",
  "hip",
  "hips",
  "inseam",
  "footLength",
  "neck",
  "thigh",
  "legOpening",
  "fitDescription",
  "unit",
];

export function sizeDetailsMeaningful(sd) {
  if (!sd || typeof sd !== "object") return false;
  return Object.keys(sd).some(
    (k) => k !== "_id" && sd[k] !== undefined && sd[k] !== null && sd[k] !== "",
  );
}

export function normalizeProductSizeChart(sizeChart) {
  if (!sizeChart) return null;
  if (sizeChart instanceof Map) return Object.fromEntries(sizeChart);
  if (typeof sizeChart === "object") return sizeChart;
  return null;
}

/** Build { S: {...}, M: {...} } from a template key */
export function buildSizeChartFromTemplate(templateKey, sizes = []) {
  const template = SIZE_CHART_TEMPLATES[templateKey];
  if (!template) return null;

  const result = {};
  const sizeList =
    sizes.length > 0 ? sizes : Object.keys(template.measurements);

  sizeList.forEach((size) => {
    const measurements = template.measurements[size];
    if (!measurements) return;
    result[size] = { ...template.defaults, ...measurements };
  });

  return Object.keys(result).length > 0 ? result : null;
}

/** First color's per-size charts → single product-level chart */
export function extractProductLevelSizeChart(sizeCharts, colors, sizes) {
  const firstColor = colors?.[0];
  if (!firstColor) return null;

  const chart = {};
  sizes.forEach((size) => {
    const data = sizeCharts[firstColor]?.[size];
    if (sizeDetailsMeaningful(data)) {
      chart[size] = { ...data };
    }
  });

  return Object.keys(chart).length > 0 ? chart : null;
}

function measurementEntryMatches(a, b) {
  for (const key of MEASUREMENT_KEYS) {
    const va = a?.[key];
    const vb = b?.[key];
    if (va == null && vb == null) continue;
    if (Number(va) === Number(vb)) continue;
    if (String(va ?? "") !== String(vb ?? "")) return false;
  }
  return true;
}

/** True when all colors/sizes match the template exactly */
export function chartsMatchTemplate(sizeCharts, colors, sizes, templateKey) {
  const template = SIZE_CHART_TEMPLATES[templateKey];
  if (!template || !colors?.length || !sizes?.length) return false;

  return colors.every((color) =>
    sizes.every((size) => {
      const expected = template.measurements[size];
      if (!expected) return true;
      const expectedEntry = { ...template.defaults, ...expected };
      const actual = sizeCharts[color]?.[size];
      return actual && measurementEntryMatches(actual, expectedEntry);
    }),
  );
}

/** Resolve chart for product page: template → product.sizeChart → variants */
export function resolveProductSizeChartData({
  sizeChartTemplate,
  sizeChart,
  variants = [],
  sizesOrder = [],
}) {
  const fromTemplate = buildSizeChartFromTemplate(
    sizeChartTemplate,
    sizesOrder,
  );
  if (fromTemplate && Object.keys(fromTemplate).length > 0) {
    return fromTemplate;
  }

  const normalized = normalizeProductSizeChart(sizeChart);
  if (normalized && Object.keys(normalized).length > 0) {
    const hasData = Object.values(normalized).some(sizeDetailsMeaningful);
    if (hasData) return normalized;
  }

  const fromVariants = {};
  for (const v of variants) {
    if (!v?.size || !sizeDetailsMeaningful(v.sizeDetails)) continue;
    fromVariants[v.size] = v.sizeDetails;
  }
  return fromVariants;
}

export function productHasSizeChart({
  sizeChartTemplate,
  sizeChart,
  variants = [],
}) {
  if (sizeChartTemplate && SIZE_CHART_TEMPLATES[sizeChartTemplate]) {
    return true;
  }
  const normalized = normalizeProductSizeChart(sizeChart);
  if (normalized && Object.values(normalized).some(sizeDetailsMeaningful)) {
    return true;
  }
  return variants.some((v) => sizeDetailsMeaningful(v?.sizeDetails));
}
