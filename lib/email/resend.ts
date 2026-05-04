type SendEmailInput = {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

type ResendEmailResponse = {
  id: string;
};

type ResendErrorResponse = {
  message?: string;
  name?: string;
  statusCode?: number;
};

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

function ensureHtmlCharset(html: string) {
  if (/<meta\s+charset=/i.test(html)) {
    return html;
  }

  if (/<html[\s>]/i.test(html)) {
    return html.replace(/<head([\s\S]*?)>/i, '<head$1><meta charset="UTF-8">');
  }

  return `<!doctype html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
}

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    throw new Error("RESEND_API_KEY is missing. Replace re_xxxxxxxxx with your real Resend API key.");
  }

  return apiKey;
}

function getDefaultFromEmail() {
  return process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "onboarding@resend.dev";
}

export async function sendEmail(input: SendEmailInput): Promise<ResendEmailResponse> {
  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      from: input.from || getDefaultFromEmail(),
      to: input.to,
      subject: input.subject,
      html: ensureHtmlCharset(input.html),
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

  const payload = (await response.json().catch(() => null)) as ResendEmailResponse | ResendErrorResponse | null;

  if (!response.ok) {
    const message =
      payload && "message" in payload && payload.message
        ? payload.message
        : `Resend API request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!payload || !("id" in payload) || !payload.id) {
    throw new Error("Resend API response did not include an email id.");
  }

  return payload;
}
