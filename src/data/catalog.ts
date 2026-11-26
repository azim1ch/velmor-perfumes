/**
 * КАТАЛОГ VELMOR PERFUMES — единственное место, где задаются товары, фото и цены.
 *
 * Цены: таблица из прайса владельца. Рабочая трактовка: «70» = 70 000 UZS,
 * объёмы — миллилитры по строкам таблицы (см. OWNER_NOTES.md).
 * Измените число здесь — оно обновится в каталоге, на странице товара,
 * в корзине и в тексте заказа для Telegram.
 */

export type VolumeOption = {
  /** Объём в миллилитрах */
  ml: number;
  /** Цена в сумах (UZS) */
  price: number;
};

/** Прайс-сетки из таблицы. Покупателю буквы групп не показываются. */
export const PRICE_GROUPS = {
  A: [
    { ml: 10, price: 70_000 },
    { ml: 20, price: 120_000 },
    { ml: 30, price: 170_000 },
    { ml: 50, price: 200_000 },
    { ml: 100, price: 300_000 },
  ],
  B: [
    { ml: 10, price: 100_000 },
    { ml: 20, price: 150_000 },
    { ml: 30, price: 250_000 },
    { ml: 40, price: 300_000 },
    { ml: 100, price: 350_000 },
  ],
} satisfies Record<string, VolumeOption[]>;

export type PriceGroup = keyof typeof PRICE_GROUPS;

export type ProductPhoto = {
  /** Путь от папки public */
  src: string;
  width: number;
  height: number;
  alt: { ru: string; uz: string };
  /** CSS object-position для кадрирования в рамку 4:5 */
  position?: string;
  /** "cover" — фото на всю рамку (свои снимки); "contain" — флакон на прозрачном фоне по центру */
  fit?: "cover" | "contain";
  /** Источник фото — показывается подписью на странице товара */
  credit?: string;
};

/**
 * Фото флакона с Fragrantica.ru (вырезанный флакон на прозрачном фоне, 750×1000).
 * Файлы лежат в public/images/products/fragrantica/<slug>.webp.
 * Чтобы заменить на свой снимок, укажите у товара обычный photo без credit.
 */
function fragranticaPhoto(slug: string, label: string): ProductPhoto {
  return {
    src: `/images/products/fragrantica/${slug}.webp`,
    width: 750,
    height: 1000,
    fit: "contain",
    credit: "Fragrantica.ru",
    alt: { ru: `Флакон ${label}`, uz: `${label} flakoni` },
  };
}

export type Product = {
  slug: string;
  /** Названия брендов и ароматов — в оригинале */
  brand: string;
  name: string;
  /** Прайс-сетка. null — цена не указана, покупатель видит «Уточнить цену». */
  priceGroup: PriceGroup | null;
  /** Индивидуальные объёмы/цены, если позиция выходит из общей сетки. */
  volumes?: VolumeOption[];
  /** Фото товара. Если нет — показывается типографическая обложка. */
  photo?: ProductPhoto;
  /** Доп. варианты написания для поиска (сокращения, кириллица). */
  aliases?: string[];
  /** false — черновик: не виден покупателям и недоступен по ссылке. */
  published: boolean;
};

export const products: Product[] = [
  // ---------- Сетка A ----------
  {
    slug: "louis-vuitton-limmensite",
    brand: "Louis Vuitton",
    name: "L’Immensité",
    priceGroup: "A",
    aliases: ["LV", "Луи Виттон", "Имменсите", "Immensite"],
    published: true,
    photo: fragranticaPhoto("louis-vuitton-limmensite", "Louis Vuitton L’Immensité"),
    // ВЛАДЕЛЬЦУ: В первой строке таблицы указан только бренд «Louis Vuitton». Название L’Immensité сопоставлено с постером — подтвердить.
  },
  {
    slug: "emporio-armani-stronger-with-you-intensely",
    brand: "Emporio Armani",
    name: "Stronger With You Intensely",
    priceGroup: "A",
    aliases: ["Armani", "Армани", "SWY"],
    published: true,
    photo: fragranticaPhoto("emporio-armani-stronger-with-you-intensely", "Emporio Armani Stronger With You Intensely"),
  },
  {
    slug: "maison-crivelli-oud-maracuja",
    brand: "Maison Crivelli",
    name: "Oud Maracujá",
    priceGroup: "A",
    aliases: ["Кривелли", "Уд Маракуйя"],
    published: true,
    photo: fragranticaPhoto("maison-crivelli-oud-maracuja", "Maison Crivelli Oud Maracujá"),
  },
  {
    slug: "chanel-bleu-de-chanel",
    brand: "Chanel",
    name: "Bleu de Chanel",
    priceGroup: "A",
    aliases: ["Шанель", "Блю де Шанель", "Blue de Chanel"],
    published: true,
    photo: fragranticaPhoto("chanel-bleu-de-chanel", "Chanel Bleu de Chanel"),
    // ВЛАДЕЛЬЦУ: Концентрация (EDT/EDP/Parfum) в таблице не указана.
  },
  {
    slug: "dior-sauvage-eau-de-toilette",
    brand: "Dior",
    name: "Sauvage Eau de Toilette",
    priceGroup: "A",
    aliases: ["Диор", "Саваж", "Sauvage EDT", "EDT"],
    published: true,
    photo: fragranticaPhoto("dior-sauvage-eau-de-toilette", "Dior Sauvage Eau de Toilette"),
  },

  // ---------- Сетка B ----------
  {
    slug: "louis-vuitton-ombre-nomade",
    brand: "Louis Vuitton",
    name: "Ombre Nomade",
    priceGroup: "B",
    aliases: ["LV", "Луи Виттон", "Омбре Номад"],
    published: true,
    photo: {
      src: "/images/products/louis-vuitton-ombre-nomade.webp",
      width: 742,
      height: 1280,
      alt: {
        ru: "Чёрный флакон Louis Vuitton Ombre Nomade с золотой надписью и прозрачный атомайзер на светлой ткани",
        uz: "Oltin yozuvli qora Louis Vuitton Ombre Nomade flakoni va och rangli matodagi shaffof atomayzer",
      },
      position: "50% 46%",
    },
  },
  {
    slug: "creed-aventus",
    brand: "Creed",
    name: "Aventus",
    priceGroup: "B",
    aliases: ["Крид", "Авентус"],
    published: true,
    photo: fragranticaPhoto("creed-aventus", "Creed Aventus"),
    // ВЛАДЕЛЬЦУ: Фото со светло-зелёной тканью — это Aventus For Her, другой продукт. Для Aventus нужен собственный снимок.
  },
  {
    slug: "nasomatto-black-afgano",
    brand: "Nasomatto",
    name: "Black Afgano",
    priceGroup: "B",
    aliases: ["Насоматто", "Блэк Афгано", "Black Afghano"],
    published: true,
    photo: fragranticaPhoto("nasomatto-black-afgano", "Nasomatto Black Afgano"),
  },
  {
    slug: "parfums-de-marly-layton",
    brand: "Parfums de Marly",
    name: "Layton",
    priceGroup: "B",
    aliases: ["PDM", "Marly", "Марли", "Лейтон"],
    published: true,
    photo: {
      src: "/images/products/parfums-de-marly-layton.webp",
      width: 960,
      height: 1280,
      alt: {
        ru: "Тёмно-синий флакон Parfums de Marly и атомайзер с золотой крышкой рядом со светлыми розами",
        uz: "To‘q ko‘k Parfums de Marly flakoni va oltin qopqoqli atomayzer, yonida oq atirgullar",
      },
      position: "50% 50%",
    },
    // ВЛАДЕЛЬЦУ: Подтвердить, что на фото именно Layton (на коробке видна надпись Royal Essence).
  },
  {
    slug: "yves-saint-laurent-y-eau-de-parfum",
    brand: "Yves Saint Laurent",
    name: "Y Eau de Parfum",
    priceGroup: "B",
    aliases: ["YSL", "ИСЛ", "Ив Сен Лоран", "Y EDP", "EDP"],
    published: true,
    photo: {
      src: "/images/products/ysl-y-edp.webp",
      width: 857,
      height: 1280,
      alt: {
        ru: "Синий флакон Yves Saint Laurent Y и чёрный атомайзер в каплях воды на тёмном мраморе",
        uz: "Suv tomchilari bilan qoplangan ko‘k Yves Saint Laurent Y flakoni va qora atomayzer, qora marmar ustida",
      },
      position: "50% 55%",
    },
  },
  {
    slug: "chanel-allure-homme",
    brand: "Chanel",
    name: "Allure Homme",
    priceGroup: "B",
    aliases: ["Шанель", "Аллюр"],
    published: true,
    photo: fragranticaPhoto("chanel-allure-homme", "Chanel Allure Homme"),
    // ВЛАДЕЛЬЦУ: Фото «Allure Homme Sport All-Over Spray» относится к другому продукту — не использовать для этой позиции.
  },
  {
    slug: "tom-ford-ombre",
    brand: "Tom Ford",
    name: "Ombre",
    priceGroup: "B",
    aliases: ["Том Форд"],
    published: false,
    // ВЛАДЕЛЬЦУ: ЧЕРНОВИК. В таблице указано только «Tom Ford Ombre» — уточнить полное название (например, Ombré Leather), затем published: true.
  },

  // ---------- Без цены ----------
  {
    slug: "tiziana-terenzi-kirke",
    brand: "Tiziana Terenzi",
    name: "Kirkè",
    priceGroup: null,
    aliases: ["Тициана Теренци", "Кирке", "Kirke"],
    published: true,
    photo: fragranticaPhoto("tiziana-terenzi-kirke", "Tiziana Terenzi Kirkè"),
    // ВЛАДЕЛЬЦУ: Есть на постере, строки в таблице нет. Пока показывается «Уточнить цену».
  },
];

/** Слаги для блока «Ароматы» на главной (в указанном порядке). */
export const featuredSlugs = [
  "louis-vuitton-ombre-nomade",
  "yves-saint-laurent-y-eau-de-parfum",
  "parfums-de-marly-layton",
  "dior-sauvage-eau-de-toilette",
];

// ---------- Вспомогательные функции ----------

export const publishedProducts = products.filter((p) => p.published);

export function getProduct(slug: string): Product | undefined {
  return publishedProducts.find((p) => p.slug === slug);
}

export function getVolumes(p: Product): VolumeOption[] {
  if (p.volumes) return p.volumes;
  return p.priceGroup ? PRICE_GROUPS[p.priceGroup] : [];
}

export function getPrice(p: Product, ml: number): number | null {
  return getVolumes(p).find((v) => v.ml === ml)?.price ?? null;
}

export function getMinPrice(p: Product): number | null {
  const v = getVolumes(p);
  return v.length ? Math.min(...v.map((x) => x.price)) : null;
}

export function getAllBrands(): string[] {
  return Array.from(new Set(publishedProducts.map((p) => p.brand))).sort((a, b) => a.localeCompare(b));
}

export function getAllVolumes(): number[] {
  return Array.from(new Set(publishedProducts.flatMap((p) => getVolumes(p).map((v) => v.ml)))).sort((a, b) => a - b);
}
