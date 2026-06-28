const SIZE_CHART_TEMPLATE_KEYS = [
  "regularTshirt",
  "oversizedTshirt",
  "poloShirt",
];

function parseSizeChart(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") return raw;
  return null;
}

function stripSizeDetailsFromVariants(variants) {
  return variants.map((v) => {
    const { sizeDetails, ...rest } = v;
    return rest;
  });
}

/**
 * When product uses a template or product-level chart, omit per-variant sizeDetails.
 */
function normalizeVariantsForSave(variants, { sizeChartTemplate, sizeChart }) {
  const mapped = (variants || []).map((v) => ({
    color: v.color,
    colorCode: v.colorCode || "#000000",
    size: v.size,
    price: parseFloat(v.price) || 0,
    stock: v.stock ?? 0,
    sellingPrice: v.sellingPrice,
    sizeSystem: v.sizeSystem,
    sku: v.sku,
    barcode: v.barcode,
    reservedStock: v.reservedStock,
  }));

  const parsedChart = parseSizeChart(sizeChart);
  const hasProductChart =
    parsedChart && Object.keys(parsedChart).length > 0;
  const hasTemplate =
    sizeChartTemplate &&
    SIZE_CHART_TEMPLATE_KEYS.includes(sizeChartTemplate);

  if (hasTemplate || hasProductChart) {
    return stripSizeDetailsFromVariants(mapped);
  }

  return (variants || []).map((v, index) => ({
    ...(mapped[index] || {
      color: v.color,
      colorCode: v.colorCode || "#000000",
      size: v.size,
      price: parseFloat(v.price) || 0,
      stock: v.stock ?? 0,
    }),
    sizeDetails: v.sizeDetails || {},
  }));
}

module.exports = {
  SIZE_CHART_TEMPLATE_KEYS,
  parseSizeChart,
  normalizeVariantsForSave,
};
