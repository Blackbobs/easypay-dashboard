import nodemailer from "nodemailer";
import type { ITransaction } from "@/interface/transaction";
import { generateReceiptPdf } from "./generateReceiptdPdf";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

export const sendReceiptEmail = async (transaction: ITransaction) => {
  const pdfBuffer = await generateReceiptPdf(transaction);

  const formatCurrency = (amount: number) => {
    return `NGN ${amount.toLocaleString("en-NG")}`;
  };

  const payload = {
    receiptName: transaction.receiptName,
    reference: transaction.reference,
    date: new Date(transaction.createdAt).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: transaction.status,
    fullName: transaction.fullName,
    email: transaction.email,
    phoneNumber: transaction.phoneNumber,
    matricNumber: transaction.matricNumber,
    college: transaction.college,
    department: transaction.department,
    studentType: transaction.studentType,
    dueType: transaction.dueType,
    paymentMethod: transaction.paymentMethod,
    amount: formatCurrency(transaction.amount || 0),
    hostel: transaction.hostel,
    roomNumber: transaction.roomNumber,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
        return "#10b981";
      case "failed":
        return "#ef4444";
      default:
        return "#f59e0b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "successful":
        return "Successful";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${payload.reference}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 32px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><polygon points="1000,100 1000,0 0,100"/></svg>');
            background-size: cover;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .status-badge {
            display: inline-block;
            background: ${getStatusColor(transaction.status)};
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 16px;
            text-transform: capitalize;
        }
        
        .content {
            padding: 40px 32px;
        }
        
        .section {
            margin-bottom: 32px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f3f4f6;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .info-label {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
        }
        
        .amount-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            margin: 32px 0;
            border: 1px solid #bae6fd;
        }
        
        .amount-label {
            font-size: 14px;
            color: #0369a1;
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .amount-value {
            font-size: 32px;
            font-weight: 700;
            color: #0369a1;
        }
        
        .reference-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        
        .reference-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .reference-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            font-family: 'Courier New', monospace;
        }
        
        .footer {
            background: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .contact {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 12px;
            }
            
            .header {
                padding: 32px 24px;
            }
            
            .content {
                padding: 32px 24px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .amount-value {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Official confirmation of your transaction</p>
            <div class="status-badge">${getStatusText(transaction.status)}</div>
        </div>
        
        <div class="content">
            <div class="amount-section">
                <div class="amount-label">Amount Paid</div>
                <div class="amount-value">${payload.amount}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Student Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Full Name</span>
                        <span class="info-value">${payload.fullName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">${payload.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone Number</span>
                        <span class="info-value">${
                          payload.phoneNumber || "Not provided"
                        }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Matric Number</span>
                        <span class="info-value">${payload.matricNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">College</span>
                        <span class="info-value">${payload.college}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Department</span>
                        <span class="info-value">${
                          payload.department || "Not provided"
                        }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Student Type</span>
                        <span class="info-value">${
                          payload.studentType || "Not provided"
                        }</span>
                    </div>
                </div>
            </div>
            
            ${
              payload.hostel || payload.roomNumber
                ? `
            <div class="section">
                <div class="section-title">Accommodation Details</div>
                <div class="info-grid">
                    ${
                      payload.hostel
                        ? `
                    <div class="info-item">
                        <span class="info-label">Hostel</span>
                        <span class="info-value">${payload.hostel}</span>
                    </div>
                    `
                        : ""
                    }
                    ${
                      payload.roomNumber
                        ? `
                    <div class="info-item">
                        <span class="info-label">Room Number</span>
                        <span class="info-value">${payload.roomNumber}</span>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
            `
                : ""
            }
            
            <div class="section">
                <div class="section-title">Transaction Details</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Due Type</span>
                        <span class="info-value">${payload.dueType}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Method</span>
                        <span class="info-value">${payload.paymentMethod}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Transaction Date</span>
                        <span class="info-value">${payload.date}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Receipt Name</span>
                        <span class="info-value">${
                          payload.receiptName || "Not provided"
                        }</span>
                    </div>
                </div>
            </div>
            
            <div class="reference-section">
                <div class="reference-label">Transaction Reference</div>
                <div class="reference-value">${payload.reference}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for using EasyPay!</p>
            <p>For any inquiries, please contact <a href="mailto:easypayinnovationshubs@gmail.com" class="contact">easypayinnovationshubs@gmail.com</a></p>
            <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} EasyPay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  const mailOptions = {
    from: `"EasyPay" <${process.env.NODEMAILER_USER}>`,
    to: transaction.email,
    subject: `Payment Receipt - ${transaction.reference}`,
    html: htmlContent,
    attachments: [
      {
        filename: `Receipt-${transaction.reference}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
