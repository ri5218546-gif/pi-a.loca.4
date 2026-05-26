function promotionLabel(promotion = {}) {
  if (!promotion || promotion.type === "none") return "";
  if (promotion.type === "2x1") return promotion.label || "2x1";
  if (promotion.type === "discount5") return promotion.label || "5% de descuento";
  if (promotion.type === "discount10") return promotion.label || "10% de descuento";
  if (promotion.type === "day") return promotion.label || "Promoción por día especial";
  return "";
}

function isPromotionActive(promotion = {}, date = new Date()) {
  if (!promotion || promotion.type === "none") return false;
  if (Number.isInteger(promotion.dayOfWeek)) return Number(promotion.dayOfWeek) === date.getDay();
  if (promotion.type !== "day") return true;
  return Number(promotion.dayOfWeek) === date.getDay();
}

function priceCartItem(product, quantity, date = new Date()) {
  const subtotal = product.price * quantity;
  let discount = 0;
  let promotionApplied = "";

  if (isPromotionActive(product.promotion, date)) {
    promotionApplied = promotionLabel(product.promotion);

    if (product.promotion.type === "2x1") {
      discount = Math.floor(quantity / 2) * product.price;
    }

    if (product.promotion.type === "discount5") {
      discount = subtotal * 0.05;
    }

    if (product.promotion.type === "discount10") {
      discount = subtotal * 0.1;
    }

    if (product.promotion.type === "day") {
      discount = subtotal * 0.1;
    }
  }

  return {
    subtotal,
    discount,
    promotionApplied,
    finalSubtotal: Math.max(subtotal - discount, 0)
  };
}

module.exports = { isPromotionActive, priceCartItem, promotionLabel };
