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
  sendFailed: boolean;
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
      sendFailed: false,
    };
  }

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Resend でのメール送信に失敗しました。", {
      to,
      fromConfigured: Boolean(from),
      message: error instanceof Error ? error.message : String(error),
    });

    return {
      delivered: false,
      previewOnly: false,
      sendFailed: true,
    };
  }

  return {
    delivered: true,
    previewOnly: false,
    sendFailed: false,
  };
}
