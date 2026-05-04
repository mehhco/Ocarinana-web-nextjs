import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";

export const runtime = "nodejs";

const DEFAULT_TEST_SUBJECT = "Ocarinana 邮件测试";
const DEFAULT_TEST_HTML = "<p>生产环境 Resend 中文邮件测试成功。</p>";

function isAuthorized(request: NextRequest) {
  const secret = process.env.EMAIL_SEND_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      to?: unknown;
      subject?: unknown;
      html?: unknown;
    };

    const to = typeof body.to === "string" ? body.to : process.env.RESEND_TEST_TO_EMAIL;

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide a recipient email in the request body or RESEND_TEST_TO_EMAIL.",
        },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: typeof body.subject === "string" ? body.subject : DEFAULT_TEST_SUBJECT,
      html: typeof body.html === "string" ? body.html : DEFAULT_TEST_HTML,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    console.error("Resend test email failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send email.",
      },
      { status: 500 }
    );
  }
}
