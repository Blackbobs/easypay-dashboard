import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ITransaction } from "@/interface/transaction";
import QRCode from "qrcode";

export const generateReceiptPdf = async (
  transaction: ITransaction
): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = pageHeight - margin;

  // Colors
  const primaryColor = rgb(0.102, 0.494, 0.918); // #1a7de6
  const secondaryColor = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.9, 0.9, 0.9);
  const darkGray = rgb(0.4, 0.4, 0.4);
  const white = rgb(1, 1, 1);

  // Header with gradient effect
  const headerHeight = 120;
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerHeight,
    width: pageWidth,
    height: headerHeight,
    color: primaryColor,
  });

  // Title
  page.drawText("PAYMENT RECEIPT", {
    x: margin,
    y: pageHeight - 60,
    size: 24,
    font: fontBold,
    color: white,
  });

  page.drawText("EasyPay - Official Transaction Confirmation", {
    x: margin,
    y: pageHeight - 85,
    size: 10,
    font: fontRegular,
    color: rgb(0.95, 0.95, 0.95),
  });

  // Reference and Date
  const receiptNumber = `#${transaction.reference}`;
  const receiptDate = new Date(transaction.createdAt).toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  page.drawText(receiptNumber, {
    x: pageWidth - margin - 200,
    y: pageHeight - 60,
    size: 12,
    font: fontBold,
    color: white,
  });

  page.drawText(receiptDate, {
    x: pageWidth - margin - 200,
    y: pageHeight - 80,
    size: 10,
    font: fontRegular,
    color: rgb(0.95, 0.95, 0.95),
  });

  y = pageHeight - headerHeight - 30;

  // Status Badge
  const statusColor =
    transaction.status === "successful"
      ? rgb(0.2, 0.8, 0.2)
      : transaction.status === "failed"
      ? rgb(0.8, 0.2, 0.2)
      : rgb(0.9, 0.6, 0.1);

  page.drawRectangle({
    x: margin,
    y: y - 25,
    width: 120,
    height: 25,
    color: statusColor,
    borderColor: statusColor,
    borderWidth: 1,
  });

  page.drawText(transaction.status.toUpperCase(), {
    x: margin + 10,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: white,
  });

  y -= 50;

  // Amount Section - Fixed: Use "NGN" instead of "₦"
  const amountValue = (transaction.amount || 0).toLocaleString();
  const amountText = `NGN ${amountValue}`;

  page.drawText("Amount Paid", {
    x: margin,
    y,
    size: 14,
    font: fontBold,
    color: secondaryColor,
  });

  y -= 35;

  page.drawText(amountText, {
    x: margin,
    y,
    size: 28,
    font: fontBold,
    color: primaryColor,
  });

  y -= 50;

  // Student Information Section
  page.drawText("STUDENT INFORMATION", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });

  y -= 25;

  const studentDetails = [
    { label: "Full Name", value: transaction.fullName },
    { label: "Email", value: transaction.email },
    { label: "Phone Number", value: transaction.phoneNumber },
    { label: "Matric Number", value: transaction.matricNumber },
    { label: "College", value: transaction.college },
    { label: "Department", value: transaction.department },
    { label: "Student Type", value: transaction.studentType },
    { label: "Level", value: transaction.level },
  ];

  for (const detail of studentDetails) {
    if (!detail.value) continue;

    page.drawText(detail.label + ":", {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: darkGray,
    });

    // Handle special characters by converting to safe string
    const safeValue = String(detail.value).replace(/[^\x00-\x7F]/g, "");
    page.drawText(safeValue, {
      x: margin + 120,
      y,
      size: 10,
      font: fontRegular,
      color: secondaryColor,
      maxWidth: pageWidth - margin * 2 - 120,
    });
    y -= 18;
  }

  y -= 20;

  // Accommodation Section (if available)
  if (transaction.hostel || transaction.roomNumber) {
    page.drawText("ACCOMMODATION DETAILS", {
      x: margin,
      y,
      size: 12,
      font: fontBold,
      color: primaryColor,
    });

    y -= 25;

    if (transaction.hostel) {
      page.drawText("Hostel:", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: darkGray,
      });

      const safeHostel = String(transaction.hostel).replace(
        /[^\x00-\x7F]/g,
        ""
      );
      page.drawText(safeHostel, {
        x: margin + 120,
        y,
        size: 10,
        font: fontRegular,
        color: secondaryColor,
      });
      y -= 18;
    }

    if (transaction.roomNumber) {
      page.drawText("Room Number:", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: darkGray,
      });

      const safeRoomNumber = String(transaction.roomNumber).replace(
        /[^\x00-\x7F]/g,
        ""
      );
      page.drawText(safeRoomNumber, {
        x: margin + 120,
        y,
        size: 10,
        font: fontRegular,
        color: secondaryColor,
      });
      y -= 18;
    }

    y -= 20;
  }

  // Transaction Details Section
  page.drawText("TRANSACTION DETAILS", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: primaryColor,
  });

  y -= 25;

  const transactionDetails = [
    { label: "Due Type", value: transaction.dueType },
    { label: "Payment Method", value: transaction.paymentMethod },
    { label: "Receipt Name", value: transaction.receiptName },
  ];

  for (const detail of transactionDetails) {
    if (!detail.value) continue;

    page.drawText(detail.label + ":", {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: darkGray,
    });

    const safeValue = String(detail.value).replace(/[^\x00-\x7F]/g, "");
    page.drawText(safeValue, {
      x: margin + 120,
      y,
      size: 10,
      font: fontRegular,
      color: secondaryColor,
      maxWidth: pageWidth - margin * 2 - 120,
    });
    y -= 18;
  }

  y -= 30;

  // Reference Section
  page.drawRectangle({
    x: margin,
    y: y - 40,
    width: pageWidth - margin * 2,
    height: 40,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: lightGray,
    borderWidth: 1,
  });

  page.drawText("Transaction Reference", {
    x: margin + 10,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: darkGray,
  });

  page.drawText(transaction.reference, {
    x: margin + 10,
    y: y - 35,
    size: 11,
    font: fontBold,
    color: secondaryColor,
  });

  // Footer
  const footerY = 60;

  page.drawText("Thank you for your payment!", {
    x: margin,
    y: footerY,
    size: 10,
    font: fontBold,
    color: primaryColor,
  });

  page.drawText("For inquiries: easypayinnovationshubs@gmail.com", {
    x: margin,
    y: footerY - 15,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  // QR Code
  const qrData = transaction.reference;
  const qrBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: "M",
    type: "png",
    scale: 4,
    margin: 1,
  });

  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrSize = 60;

  page.drawImage(qrImage, {
    x: pageWidth - margin - qrSize,
    y: footerY - 10,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Scan to verify", {
    x: pageWidth - margin - qrSize,
    y: footerY - 15 - qrSize,
    size: 8,
    font: fontRegular,
    color: darkGray,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
