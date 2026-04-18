export const PRODUCT_SLUGS = [
  "full-set",
  "mechanical",
  "electrical",
  "information",
] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export type ProductSample = {
  question: string;
  answer: string;
};

export type PurchasedWorkbookChildLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type PurchasedWorkbookLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  childLinks?: PurchasedWorkbookChildLink[];
};

export type StudyProduct = {
  slug: ProductSlug;
  name: string;
  shortName: string;
  category: string;
  priceLabel: string;
  questionCount: string;
  amount: number;
  currency: "jpy";
  imagePath: string;
  description: string;
  longDescription: string;
  noteUrl: string;
  freeTrialUrl?: string;
  badge: string;
  highlights: string[];
  audiences: string[];
  sampleQuestions: ProductSample[];
};

export const defaultProductSlug: ProductSlug = "full-set";

const mechanicalWorkbookChildLinks: PurchasedWorkbookChildLink[] = [
  {
    id: "mechanical-1",
    label: "機械 1-1機械工学基礎 1-2材料",
    description:
      "ある金属の結晶格子中に別の原子が入れ込んでいる状態を何というか？",
    href: "https://ankimaker.com/workbooks/05fe40ab-9f52-4fc3-8e02-8bf9eaf9b185?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "mechanical-2",
    label: "機械 1-3設計・製図 2-1加工 2-2機械要素",
    description:
      "2つの動作間に一定の約束事を備えた機構や電子回路を設けてヒューマンエラーを排除するシステムを何機構と言うか？",
    href: "https://ankimaker.com/workbooks/b659d0f4-5c09-40ee-a8a5-5aa3a056f259?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "mechanical-3",
    label: "機械 2-3計測制御",
    description:
      "制御対象の状態をセンサで確認しながら、その都度指令を変える制御方式をなんというか？",
    href: "https://ankimaker.com/workbooks/c6771ae0-5d0c-4b34-9511-bc9acb1cd2fa?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
];

const electricalWorkbookChildLinks: PurchasedWorkbookChildLink[] = [
  {
    id: "electrical-1",
    label: "電気電子 1-1電気回路の基礎 1-2電子回路の基礎",
    description:
      "抵抗器の抵抗値を表す方法に、色帯や許容差を表すものをなんという？",
    href: "https://ankimaker.com/workbooks/94074592-8c53-464c-b061-b74764f986d4?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "electrical-2",
    label: "電気電子 1-2電子回路の基礎 1-3半導体デバイス",
    description:
      "ブリッジ整流回路は入力電圧の正負に関係なく正の絶対電圧が得られることからなんと呼ばれる？",
    href: "https://ankimaker.com/workbooks/fbc99d62-a46f-4268-8c20-4e00d32e61da?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "electrical-3",
    label: "電気電子 2-1インターフェース 2-2モータと電力",
    description:
      "複雑で多様な命令セットを持ったマイコンは？",
    href: "https://ankimaker.com/workbooks/1dcc0f97-0d8e-4fea-886e-3a093f889203?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "electrical-4",
    label: "電気電子 2-3センサ技術",
    description:
      "制御対象の状態等に関する物理、化学量を伝送、記録あるいは信号処理しやすい別の物理、化学量に変換する素子をなんという？",
    href: "https://ankimaker.com/workbooks/d4a5e405-376a-4550-88f8-b6492adc68f9?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
];

const informationWorkbookChildLinks: PurchasedWorkbookChildLink[] = [
  {
    id: "information-1",
    label: "情報 1-1情報の基礎 1-2プロセッサ",
    description:
      "コンピュータの世界では文字、文字列、文字コード体系をそれぞれなんというか？",
    href: "https://ankimaker.com/workbooks/d622276c-eebf-4676-a2fa-3827f165f386?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "information-2",
    label: "情報 1-3プログラミング 2-1システム構成 2-2システム開発",
    description:
      "データと共に他のデータを指し示す情報を持たせた構造のことをなんという？",
    href: "https://ankimaker.com/workbooks/eeb0c9fc-a6ab-4807-9b39-422c52d68d01?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
  {
    id: "information-3",
    label: "情報 2-3ネットワークマルチメディア",
    description:
      "デジタルネットワークでは通信を実現するために通信手順や情報表現方法におけるビットの意味を定義してなんというか？",
    href: "https://ankimaker.com/workbooks/49f39287-d8bc-4a18-8082-551128965d31?utm_source=web&utm_medium=share&utm_campaign=workbook",
  },
];

export const products: StudyProduct[] = [
  {
    slug: "full-set",
    name: "To-Beエンジニア試験（スタンダード）対策｜全分野セット問題集",
    shortName: "全分野セット問題集",
    category: "機械・電気電子・情報",
    priceLabel: "セット版",
    questionCount: "合計約750問",
    amount: 1300,
    currency: "jpy",
    imagePath: "/full-set.png",
    description:
      "暗記メーカー対応で、機械・電気電子・情報を横断して学べる一問一答形式の全分野セット問題集です。",
    longDescription:
      "To-Beエンジニア試験（スタンダード）対策として、機械・電気電子・情報の技術基礎分野を横断的に整理し、短時間の反復学習で知識を定着させることを目的に作成した暗記メーカー対応の一問一答問題集です。",
    noteUrl: "https://note.com/fast_snake2749/n/n042be4c52253",
    badge: "全分野セット",
    highlights: [
      "機械・電気電子・情報の3分野をまとめて対策",
      "暗記メーカー対応の一問一答形式で反復しやすい",
      "分野別よりセット購入の方がお得",
    ],
    audiences: [
      "To-Beエンジニア試験を初めて受ける方",
      "分野横断で基礎をまとめて復習したい方",
      "短時間で抜け漏れを埋めたい方",
    ],
    sampleQuestions: [
      {
        question:
          "ホイートストンブリッジが平衡しているとき、検流計に流れる電流はどうなりますか？",
        answer: "ほぼ0になります。",
      },
      {
        question: "UTF-8 は何を表現するための方式ですか？",
        answer: "文字をバイト列として表現するための文字エンコーディングです。",
      },
      {
        question: "一問一答形式が反復学習に向く理由は何ですか？",
        answer: "短時間で何度も解き直せるため、記憶の定着を促しやすいからです。",
      },
    ],
  },
  {
    slug: "mechanical",
    name: "To-Beエンジニア試験（スタンダード）対策｜機械分野問題集",
    shortName: "機械分野問題集",
    category: "機械",
    priceLabel: "分野別",
    questionCount: "約200問",
    amount: 500,
    currency: "jpy",
    imagePath: "/mechanical.png",
    description:
      "機械分野の重要事項を中心に確認できる、一問一答形式のデジタル問題集です。",
    longDescription:
      "基礎理解の確認と知識定着を目的に、機械分野で問われやすい重要事項を中心に整理した教材です。必要な分野だけを絞って学びたい方向けです。",
    noteUrl: "https://note.com/fast_snake2749/n/n74efd797b4c1",
    freeTrialUrl:
      "https://ankimaker.com/workbooks/e928a3d1-53f6-492b-a943-534d79340acc?utm_source=web&utm_medium=share&utm_campaign=workbook",
    badge: "機械分野",
    highlights: [
      "機械分野だけを集中的に復習",
      "公式テキストの重要語句を優先",
      "新人研修後の確認にも使いやすい",
    ],
    audiences: [
      "機械分野だけを重点的に対策したい方",
      "機械系の基礎を短時間で確認したい方",
      "分野別に必要な教材だけ購入したい方",
    ],
    sampleQuestions: [
      {
        question:
          "鋼材を一様なオーステナイト組織になるまで加熱し、その温度に保持した後、空気中で自然放冷する熱処理を何というか？",
        answer: "焼ならし",
      },
      {
        question: "機械分野の学習で一問一答形式が向いている場面はどこですか？",
        answer: "用語や原理の確認を短時間で反復したい場面です。",
      },
    ],
  },
  {
    slug: "electrical",
    name: "To-Beエンジニア試験（スタンダード）対策｜電気電子分野問題集",
    shortName: "電気電子分野問題集",
    category: "電気電子",
    priceLabel: "分野別",
    questionCount: "約300問",
    amount: 500,
    currency: "jpy",
    imagePath: "/electrical.png",
    description:
      "電気電子分野の頻出事項を確認できる、一問一答形式のデジタル問題集です。",
    longDescription:
      "基礎理解の確認と知識定着を目的に、電気電子分野で問われやすい重要事項を中心に整理した教材です。出題範囲を絞って効率的に復習できます。",
    noteUrl: "https://note.com/fast_snake2749/n/n2e1d1650eb25",
    freeTrialUrl:
      "https://ankimaker.com/workbooks/9a9ce3b9-bf31-4125-a6df-8571347d780c?utm_source=web&utm_medium=share&utm_campaign=workbook",
    badge: "電気電子分野",
    highlights: [
      "電気電子の基礎事項を重点整理",
      "ホイートストンブリッジなど基礎問題を確認",
      "スキマ時間で反復しやすい構成",
    ],
    audiences: [
      "電気電子分野の理解を固めたい方",
      "式や用語の基礎を反復したい方",
      "通勤時間などで短く学習したい方",
    ],
    sampleQuestions: [
      {
        question:
          "画像のホイートストンブリッジにおいて、Va=Vbの時、ブリッジ平衡条件はR1~R4を用いてどんな式で表される？",
        answer: "R1R4=R2R3",
      },
      {
        question: "直流回路で電圧・電流・抵抗の関係を表す基本法則は何ですか？",
        answer: "オームの法則です。",
      },
    ],
  },
  {
    slug: "information",
    name: "To-Beエンジニア試験（スタンダード）対策｜情報分野問題集",
    shortName: "情報分野問題集",
    category: "情報",
    priceLabel: "分野別",
    questionCount: "約250問",
    amount: 500,
    currency: "jpy",
    imagePath: "/information.png",
    description:
      "情報分野の基礎用語や考え方を整理できる、一問一答形式のデジタル問題集です。",
    longDescription:
      "基礎理解の確認と知識定着を目的に、情報分野で問われやすい重要事項を中心に整理した教材です。文字コードなどの基本トピックをテンポよく確認できます。",
    noteUrl: "https://note.com/fast_snake2749/n/n7137fe95390f",
    freeTrialUrl:
      "https://ankimaker.com/workbooks/24cde5fd-aa06-4cbe-883b-1fd2c9393a5d?utm_source=web&utm_medium=share&utm_campaign=workbook",
    badge: "情報分野",
    highlights: [
      "文字コードなどの基礎用語を確認",
      "知識の取りこぼしを洗い出しやすい",
      "復習サイクルを回しやすい一問一答形式",
    ],
    audiences: [
      "情報分野の基礎用語を整理したい方",
      "文字コードやIT基礎を反復したい方",
      "分野別に必要な教材だけ購入したい方",
    ],
    sampleQuestions: [
      {
        question:
          "アルファベット、数字、記号等を7ビットで符号化したコードをなんとよぶか？",
        answer: "ASCIIコード",
      },
      {
        question: "情報分野の学習で一問一答形式が有効な理由は何ですか？",
        answer: "用語と意味の対応を素早く何度も確認できるからです。",
      },
    ],
  },
];

export function isProductSlug(value: string): value is ProductSlug {
  return (PRODUCT_SLUGS as readonly string[]).includes(value);
}

export function getProductBySlug(slug: string | undefined | null) {
  if (!slug || !isProductSlug(slug)) {
    return null;
  }

  return products.find((product) => product.slug === slug) ?? null;
}

export function getRelatedProducts(slug: ProductSlug) {
  return products.filter((product) => product.slug !== slug);
}

export function getPurchasedWorkbookLinks(slug: ProductSlug): PurchasedWorkbookLink[] {
  switch (slug) {
    case "full-set":
      return [
        {
          id: "mechanical",
          label: "機械分野",
          description:
            "材料・加工・機械要素など、頻出テーマをまとめて確認できる問題集です。",
          href: mechanicalWorkbookChildLinks[0].href,
          childLinks: mechanicalWorkbookChildLinks,
        },
        {
          id: "electrical",
          label: "電気電子分野",
          description:
            "回路・電子部品・電気の基礎をテンポよく反復できる問題集です。",
          href: electricalWorkbookChildLinks[0].href,
          childLinks: electricalWorkbookChildLinks,
        },
        {
          id: "information",
          label: "情報分野",
          description:
            "IT基礎・文字コード・アルゴリズムの要点を短時間で復習できます。",
          href: informationWorkbookChildLinks[0].href,
          childLinks: informationWorkbookChildLinks,
        },
      ];
    case "mechanical":
      return [
        {
          id: "mechanical",
          label: "機械分野",
          description:
            "基礎・設計製図と加工・計測制御まで、機械分野の購入済み問題集をまとめて開けます。",
          href: mechanicalWorkbookChildLinks[0].href,
          childLinks: mechanicalWorkbookChildLinks,
        },
      ];
    case "electrical":
      return [
        {
          id: "electrical",
          label: "電気電子分野",
          description:
            "回路・半導体・モータ・センサまで、電気電子分野の購入済み問題集をまとめて開けます。",
          href: electricalWorkbookChildLinks[0].href,
          childLinks: electricalWorkbookChildLinks,
        },
      ];
    case "information":
      return [
        {
          id: "information",
          label: "情報分野",
          description:
            "情報の基礎・プログラミング・ネットワークまで、情報分野の購入済み問題集をまとめて開けます。",
          href: informationWorkbookChildLinks[0].href,
          childLinks: informationWorkbookChildLinks,
        },
      ];
    default:
      return [];
  }
}
