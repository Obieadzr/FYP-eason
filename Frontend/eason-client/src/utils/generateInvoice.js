import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order, userRole = "retailer") => {
  const doc = new jsPDF();

  // Company Branding
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("eAson.", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Kathmandu, Nepal", 14, 28);
  doc.text("VAT No: 123456789", 14, 33);
  doc.text("support@eason.com.np", 14, 38);

  // Invoice Title & Info
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 150, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order ID: #${order._id.slice(-8).toUpperCase()}`, 150, 28);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 33);
  doc.text(`Status: ${order.status.toUpperCase()}`, 150, 38);

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 45, 196, 45);

  // Billing To
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${order.user?.firstName || ""} ${order.user?.lastName || ""}`, 14, 61);
  doc.text(`Email: ${order.user?.email || ""}`, 14, 66);
  doc.text(`Phone: ${order.phone || ""}`, 14, 71);
  doc.text(`Address: ${order.shippingAddress || ""}`, 14, 76);

  // Table
  const tableData = order.items.map((item, index) => [
    index + 1,
    item.product?.name || "Product",
    item.quantity,
    `Rs ${Number(item.pricePerUnit).toLocaleString()}`,
    `Rs ${(item.pricePerUnit * item.quantity).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["#", "Item Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
    styles: { fontSize: 10, cellPadding: 4 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Totals Section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  if (userRole === "wholesaler") {
    // Wholesaler POV
    doc.text("Subtotal:", 140, finalY);
    doc.text(`Rs ${Number(order.totalAmount).toLocaleString()}`, 196, finalY, { align: "right" });
    
    doc.text("Platform Fee (5% Escrow):", 140, finalY + 6);
    doc.text(`- Rs ${Number(order.platformFee || order.totalAmount * 0.05).toLocaleString()}`, 196, finalY + 6, { align: "right" });
    
    doc.setFontSize(12);
    doc.text("Net Escrow Payout:", 140, finalY + 16);
    doc.text(`Rs ${Number(order.wholesalerPayout || order.totalAmount * 0.95).toLocaleString()}`, 196, finalY + 16, { align: "right" });
  } else {
    // Retailer POV
    const subtotal = order.totalAmount / 1.13; // Backing out 13% tax to be clean if needed, but totalAmount is subtotal in some schemas.
    doc.text("Subtotal:", 140, finalY);
    doc.text(`Rs ${Number(order.totalAmount).toLocaleString()}`, 196, finalY, { align: "right" });
    
    doc.text("Tax/VAT (13%):", 140, finalY + 6);
    doc.text(`Rs ${Number(order.taxAmount).toLocaleString()}`, 196, finalY + 6, { align: "right" });
    
    doc.setFontSize(12);
    doc.text("Grand Total:", 140, finalY + 16);
    doc.text(`Rs ${Number(order.grandTotal).toLocaleString()}`, 196, finalY + 16, { align: "right" });
  }

  // Footer notes
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text("This is an electronically generated document. Thank you for using eAson B2B Platform.", 14, 280);

  doc.save(`eAson_Invoice_${order._id.slice(-8)}.pdf`);
};
