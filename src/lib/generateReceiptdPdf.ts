import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ITransaction } from "@/interface/transaction";

export const generateReceiptPdf = async (transaction: ITransaction): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 750;

  // --- Header ---
  page.drawText("EasyPay - Payment Receipt", {
    x: 150,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.2),
  });

  y -= 50;

  const details: Record<string, string | number | undefined> = {
    Reference: transaction.reference,
    Name: transaction.fullName,
    Email: transaction.email,
    College: transaction.college,
    Department: transaction.department,
    "Due Type": transaction.dueType,
    "Payment Method": transaction.paymentMethod,
    // Amount: `₦${transaction.amount?.toLocaleString("en-NG")}`,
    Amount: `NGN ${transaction.amount?.toLocaleString("en-NG")}`,

    Status: transaction.status,
    Date: new Date(transaction.createdAt).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  for (const [label, value] of Object.entries(details)) {
    if (!value) continue;
    page.drawText(`${label}:`, {
      x: 50,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(String(value), {
      x: 180,
      y,
      size: 12,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
