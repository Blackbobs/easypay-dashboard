import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ITransaction } from "@/interface/transaction";
import QRCode from "qrcode";

export const generateReceiptPdf = async (transaction: ITransaction): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 default
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const margin = 40;
  let y = pageHeight - 100;

  // --- Receipt Name at Top ---
if (transaction.receiptName) {
  page.drawText(transaction.receiptName, {
    x: margin,
    y: pageHeight - 40, // top margin instead of y (higher up)
    size: 18,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.65),
  });
}

  // --- Header Section ---
  page.drawRectangle({
    x: 0,
    y: y - 80,
    width: pageWidth,
    height: 80,
    color: rgb(0.05, 0.35, 0.65),
  });

  page.drawText("EasyPay", {
    x: margin,
    y: y - 50,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("PAYMENT RECEIPT", {
    x: margin,
    y: y - 70,
    size: 12,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  const receiptNumber = `#${transaction.reference?.slice(-8) || "N/A"}`;
  const receiptDate = new Date(transaction.createdAt).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  page.drawText(receiptNumber, {
    x: pageWidth - margin - 120,
    y: y - 45,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(receiptDate, {
    x: pageWidth - margin - 120,
    y: y - 65,
    size: 10,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  y -= 120;


  // --- Status Badge ---
  const statusColor =
    transaction.status === "successful"
      ? rgb(0.1, 0.7, 0.1)
      : transaction.status === "pending"
      ? rgb(0.9, 0.6, 0.1)
      : rgb(0.8, 0.1, 0.1);

  page.drawRectangle({
    x: margin,
    y: y,
    width: 100,
    height: 20,
    color: statusColor,
  });

  page.drawText(transaction.status?.toUpperCase() || "UNKNOWN", {
    x: margin + 10,
    y: y + 5,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= 40;

  // --- Student Information ---
  page.drawText("STUDENT INFORMATION", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 25;

  const customerDetails = [
    { label: "Full Name", value: transaction.fullName },
    { label: "Email", value: transaction.email },
    { label: "Matric Number", value: transaction.matricNumber },
    { label: "College", value: transaction.college },
    { label: "Department", value: transaction.department },
    { label: "Room Number", value: transaction.roomNumber },
  ];

  for (const detail of customerDetails) {
    if (!detail.value) continue;
    page.drawText(detail.label + ":", {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(String(detail.value), {
      x: margin + 120,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: pageWidth - margin * 2 - 120, // wrap long text
    });
    y -= 18;
  }

  y -= 25;

  // --- Payment Details ---
  page.drawText("PAYMENT DETAILS", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 25;

  const paymentDetails = [
    { label: "Transaction ID", value: transaction.reference },
    {
      label: "Transaction Date",
      value: new Date(transaction.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    { label: "Due Type", value: transaction.dueType },
    { label: "Payment Method", value: transaction.paymentMethod },
  ];

  for (const detail of paymentDetails) {
    if (!detail.value) continue;
    page.drawText(detail.label + ":", {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(String(detail.value), {
      x: margin + 120,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: pageWidth - margin * 2 - 120,
    });
    y -= 18;
  }

  y -= 30;

  // --- Amount Highlight ---
  page.drawRectangle({
    x: margin - 10,
    y: y - 20,
    width: pageWidth - 2 * margin + 20,
    height: 40,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.05, 0.35, 0.65),
    borderWidth: 1,
  });

  page.drawText("AMOUNT PAID", {
    x: margin,
    y: y - 5,
    size: 11,
    font: fontBold,
    color: rgb(0.4, 0.4, 0.4),
  });

  const amount = transaction.amount
    ? `NGN ${transaction.amount.toLocaleString("en-NG")}`
    : "NGN 4000/NGN 3000";

  page.drawText(amount, {
    x: pageWidth - margin - 150,
    y: y - 5,
    size: 16,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.65),
  });

 
  // --- Footer ---
  page.drawText("Thank you for your payment!", {
    x: margin,
    y: 40,
    size: 10,
    font: fontBold,
    color: rgb(0.05, 0.35, 0.65),
  });

  page.drawText("For inquiries, contact easypayinnovationshubs@gmail.com", {
    x: margin,
    y: 25,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const qrData = transaction.reference || "N/A";
  const qrBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: "M",
    type: "png",
    scale: 5,
    margin: 1,
  });

  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrDims = qrImage.scale(0.4); // smaller, like a stamp

  page.drawImage(qrImage, {
    x: pageWidth - margin - qrDims.width,
    y: 40, // bottom spacing
    width: qrDims.width,
    height: qrDims.height,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
