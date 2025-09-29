import { NextResponse } from "next/server";
import { sendReceiptEmail } from "@/lib/email";
// import { ITransaction } from "@/interface/transaction";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const info = await sendReceiptEmail(body);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
