import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { ITransaction } from "@/interface/transaction";

export const generateReceiptPdf = async (transaction: ITransaction): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  let y = pageHeight - 80;

  // --- Header Section with Background ---
  // Header background rectangle
  page.drawRectangle({
    x: 0,
    y: pageHeight - 120,
    width: pageWidth,
    height: 120,
    color: rgb(0.05, 0.35, 0.65), // Professional blue
  });

  // Company Logo Area (placeholder circle)
  page.drawCircle({
    x: margin + 30,
    y: pageHeight - 60,
    size: 25,
    color: rgb(1, 1, 1),
  });
  page.drawText("EP", {
    x: margin + 20,
    y: pageHeight - 68,
    size: 16,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.65),
  });

  // Company Name and Title
  page.drawText("EasyPay", {
    x: margin + 80,
    y: pageHeight - 50,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("PAYMENT RECEIPT", {
    x: margin + 80,
    y: pageHeight - 75,
    size: 14,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  // Receipt number and date on the right
  const receiptNumber = `#${transaction.reference?.slice(-8) || 'N/A'}`;
  page.drawText(receiptNumber, {
    x: pageWidth - margin - 120,
    y: pageHeight - 45,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const receiptDate = new Date(transaction.createdAt).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  page.drawText(receiptDate, {
    x: pageWidth - margin - 120,
    y: pageHeight - 70,
    size: 12,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  y = pageHeight - 160;

  // --- Status Badge ---
  const statusColor = transaction.status === 'successful' ? rgb(0.1, 0.7, 0.1) : 
                     transaction.status === 'pending' ? rgb(0.9, 0.6, 0.1) : 
                     rgb(0.8, 0.1, 0.1);

  page.drawRectangle({
    x: margin,
    y: y - 5,
    width: 100,
    height: 25,
    color: statusColor,
  });

  page.drawText(transaction.status?.toUpperCase() || 'UNKNOWN', {
    x: margin + 15,
    y: y + 3,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= 60;

  // --- Student Information Section ---
  page.drawText("STUDENT INFORMATION", {
    x: margin,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Underline
  page.drawRectangle({
    x: margin,
    y: y - 5,
    width: 180,
    height: 2,
    color: rgb(0.05, 0.35, 0.65),
  });

  y -= 30;

  const customerDetails = [
    { label: "Full Name", value: transaction.fullName },
    { label: "Email", value: transaction.email },
    { label: "College", value: transaction.college },
    { label: "Department", value: transaction.department },
  ];

  for (const detail of customerDetails) {
    if (!detail.value) continue;
    
    page.drawText(detail.label, {
      x: margin,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    page.drawText(String(detail.value), {
      x: margin + 120,
      y,
      size: 11,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 22;
  }

  y -= 20;

  // --- Payment Details Section ---
  page.drawText("PAYMENT DETAILS", {
    x: margin,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Underline
  page.drawRectangle({
    x: margin,
    y: y - 5,
    width: 160,
    height: 2,
    color: rgb(0.05, 0.35, 0.65),
  });

  y -= 30;

  const paymentDetails = [
    { label: "Transaction ID", value: transaction.reference },
    { label: "Due Type", value: transaction.dueType },
    { label: "Payment Method", value: transaction.paymentMethod },
    { label: "Transaction Date", value: new Date(transaction.createdAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })},
  ];

  for (const detail of paymentDetails) {
    if (!detail.value) continue;
    
    page.drawText(detail.label, {
      x: margin,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    const value = String(detail.value);
    const maxWidth = 300;
    // Handle long transaction IDs by wrapping
    if (detail.label === "Transaction ID" && value.length > 35) {
      const firstPart = value.substring(0, 35);
      const secondPart = value.substring(35);
      
      page.drawText(firstPart, {
        x: margin + 120,
        y,
        size: 10,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.1),
      });
      
      if (secondPart) {
        y -= 15;
        page.drawText(secondPart, {
          x: margin + 120,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
    } else {
      page.drawText(value, {
        x: margin + 120,
        y,
        size: 11,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.1),
      });
    }
    y -= 22;
  }

  y -= 40;

  // --- Amount Section (Highlighted) ---
  page.drawRectangle({
    x: margin - 10,
    y: y - 15,
    width: pageWidth - 2 * margin + 20,
    height: 50,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.05, 0.35, 0.65),
    borderWidth: 1,
  });

  page.drawText("AMOUNT PAID", {
    x: margin,
    y: y + 10,
    size: 12,
    font: fontBold,
    color: rgb(0.4, 0.4, 0.4),
  });

  const amount = transaction.amount 
    ? `₦${transaction.amount.toLocaleString("en-NG")}`
    : "Amount not available";

  page.drawText(amount, {
    x: pageWidth - margin - 150,
    y: y + 10,
    size: 20,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.65),
  });

  y -= 80;

  // --- Footer ---
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: 60,
    color: rgb(0.98, 0.98, 0.98),
  });

  page.drawText("Thank you for your payment!", {
    x: margin,
    y: 35,
    size: 12,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.65),
  });

  page.drawText("For any inquiries, please contact our support team.", {
    x: margin,
    y: 18,
    size: 10,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  // --- Watermark/Security element ---
  page.drawText("OFFICIAL RECEIPT", {
    x: pageWidth - 200,
    y: 25,
    size: 8,
    font: fontBold,
    color: rgb(0.8, 0.8, 0.8),
   rotate: degrees(-25),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};