import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult = {
  delivered: boolean;
  previewOnly: boolean;
};

let resendClient: Resend | null = null;

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

function getPurchaseAccessFromEmail() {
  return process.env.PURCHASE_ACCESS_FROM_EMAIL?.trim() ?? "";
}

export function canSendPurchaseAccessEmail() {
  return Boolean(getResendApiKey() && getPurchaseAccessFromEmail());
}

function getResendClient() {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendPurchaseAccessEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<SendEmailResult> {
  const from = getPurchaseAccessFromEmail();
  const resend = getResendClient();

  if (!from || !resend) {
    return {
      delivered: false,
      previewOnly: true,
    };
  }

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  return {
    delivered: true,
    previewOnly: false,
  };
}
