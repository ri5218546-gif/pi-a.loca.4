const PDFDocument = require("pdfkit");

function buildInvoicePDF(invoice) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.circle(297, 42, 18).fill("#ffd84d");
  doc.polygon([297, 13], [285, 29], [309, 29]).fill("#29a86b");
  doc.fillColor("#1f3d2b").fontSize(24).text("Piña Loca", { align: "center" });
  doc.fillColor("#f6a600").fontSize(13).text("Factura de compra", { align: "center" });
  doc.moveDown();

  doc.fillColor("#1f2937").fontSize(11);
  doc.text(`Factura: ${invoice.invoiceNumber}`);
  doc.text(`Fecha: ${new Date(invoice.createdAt).toLocaleString("es-GT")}`);
  doc.text(`Cliente: ${invoice.customerName}`);
  doc.text(`Correo: ${invoice.customerEmail}`);
  doc.moveDown();

  doc.fontSize(12).fillColor("#1f3d2b").text("Productos", { underline: true });
  doc.moveDown(0.5);
  doc.fillColor("#1f2937");

  invoice.items.forEach((item) => {
    const promo = item.promotionApplied ? ` | Promo: ${item.promotionApplied}` : "";
    const finalSubtotal = item.finalSubtotal ?? item.subtotal;
    doc.text(
      `${item.name} | Cantidad: ${item.quantity} | Precio: Q${item.price.toFixed(2)}${promo} | Total: Q${finalSubtotal.toFixed(2)}`
    );
  });

  doc.moveDown();
  if (invoice.discount > 0) {
    doc.fillColor("#1f2937").fontSize(12).text(`Descuentos: Q${invoice.discount.toFixed(2)}`, {
      align: "right"
    });
  }
  doc.fillColor("#1f3d2b").fontSize(16).text(`Total: Q${invoice.total.toFixed(2)}`, {
    align: "right"
  });

  doc.moveDown(2);
  doc.fillColor("#6b7280").fontSize(10).text("Gracias por comprar frutas frescas en Piña Loca.", {
    align: "center"
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

module.exports = buildInvoicePDF;
