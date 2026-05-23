exports.calculatePrice = (avgImportPrice, profitPercent, discountPercent) => {
  const avg = Number(avgImportPrice || 0);
  const profit = Number(profitPercent || 0);
  const discount = Number(discountPercent || 0);

  // Giá gốc (nhập + lãi), làm tròn lên phần nghìn
  const original_price = Math.ceil((avg * (1 + profit / 100)) / 1000) * 1000;

  // Giá bán sau giảm, tính theo original_price, dùng Math.round() để khách hàng không bị thiệt
  const raw_selling_price = original_price * (1 - discount / 100);
  const selling_price = Math.round(raw_selling_price / 1000) * 1000;

  return { original_price, selling_price };
};
