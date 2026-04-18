import { createHash, randomBytes } from "node:crypto";
import { getPurchasedWorkbookLinks, getProductBySlug, type ProductSlug } from "@/lib/products";

export type PurchaseAccessEmailPayload = {
  subject: string;
  html: string;
  text: string;
};

type PurchaseSummaryInput = {
  productSlug: string;
  productName: string;
  paidAt: Date;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getPurchaseAccessUrl(baseUrl: string, token: string) {
  return new URL(`/library?token=${encodeURIComponent(token)}`, `${baseUrl}/`).toString();
}

export function getAccessibleWorkbookLinks(productSlugs: string[]) {
  const workbookLinks = new Map<string, ReturnType<typeof getPurchasedWorkbookLinks>[number]>();

  for (const slug of productSlugs) {
    const product = getProductBySlug(slug);

    if (!product) {
      continue;
    }

    for (const link of getPurchasedWorkbookLinks(product.slug as ProductSlug)) {
      if (link.childLinks?.length) {
        for (const childLink of link.childLinks) {
          workbookLinks.set(childLink.id, childLink);
        }
        continue;
      }

      workbookLinks.set(link.id, link);
    }
  }

  return [...workbookLinks.values()];
}

export function maskEmailAddress(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const [localPart, domain = ""] = normalizedEmail.split("@");

  if (!localPart || !domain) {
    return normalizedEmail;
  }

  const visiblePrefix = localPart.slice(0, 2);
  const maskedPart = "*".repeat(Math.max(localPart.length - visiblePrefix.length, 2));

  return `${visiblePrefix}${maskedPart}@${domain}`;
}

export function buildPurchaseAccessEmail({
  accessUrl,
  purchases,
}: {
  accessUrl: string;
  purchases: PurchaseSummaryInput[];
}): PurchaseAccessEmailPayload {
  const sortedPurchases = [...purchases].sort(
    (left, right) => right.paidAt.getTime() - left.paidAt.getTime(),
  );
  const purchaseLines = sortedPurchases.map(
    (purchase) => `<li>${purchase.productName} / ${purchase.paidAt.toLocaleDateString("ja-JP")}</li>`,
  );
  const purchaseText = sortedPurchases.map(
    (purchase) => `- ${purchase.productName} / ${purchase.paidAt.toLocaleDateString("ja-JP")}`,
  );

  return {
    subject: "ご購入教材ページのご案内",
    html: [
      "<p>教材をご購入いただきありがとうございます。</p>",
      "<p>以下の専用ページから、購入済みの問題集にいつでも戻れます。</p>",
      `<p><a href="${accessUrl}">${accessUrl}</a></p>`,
      "<p>購入済み教材:</p>",
      `<ul>${purchaseLines.join("")}</ul>`,
      "<p>このメールは再訪用リンクの送信に利用する想定です。</p>",
    ].join(""),
    text: [
      "教材をご購入いただきありがとうございます。",
      "以下の専用ページから、購入済みの問題集にいつでも戻れます。",
      accessUrl,
      "",
      "購入済み教材:",
      ...purchaseText,
      "",
      "このメールは再訪用リンクの送信に利用する想定です。",
    ].join("\n"),
  };
}
