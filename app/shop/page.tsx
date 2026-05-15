import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, ExternalLinkIcon, InfoIcon } from "@/components/ui/icons";
import { getActiveProducts, type Product } from "@/lib/supabase/products";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/structured-data";
import { isShopEnabled } from "@/lib/supabase/config";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ocarinana.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: "陶笛推荐",
  description: "Ocarinana 陶笛推荐页按吹奏形态、孔数、管数、调性音区和材质系统整理陶笛种类，并提供初学者选购原则和精选商品。",
  keywords: [
    "陶笛推荐",
    "陶笛选购",
    "陶笛购买",
    "初学者陶笛",
    "12孔AC陶笛",
    "中音C陶笛",
    "塑料陶笛",
    "陶瓷陶笛",
    "复管陶笛",
    "横吹陶笛",
    "挂坠陶笛",
    "陶笛分类",
    "淘宝陶笛",
    "京东陶笛",
  ],
  openGraph: {
    title: "陶笛推荐 - Ocarinana",
    description: "从陶笛种类、选购判断到精选商品，帮你选对第一支或下一支陶笛。",
    type: "website",
    url: `${baseUrl}/shop`,
  },
  alternates: {
    canonical: `${baseUrl}/shop`,
  },
};

const classificationHighlights = [
  { label: "新手主线", value: "横吹单腔 / 12 孔 / 中音 C" },
  { label: "便携路线", value: "挂坠式 / 4-6 孔 / 小音域" },
  { label: "进阶路线", value: "双管或三管 / 扩展音域" },
  { label: "音色路线", value: "塑料耐用，陶瓷更有质感" },
];

const ocarinaClassificationGroups = [
  {
    method: "按吹奏形态分",
    summary: "先看拿法、吹嘴位置和指法体系，这是购买页最常见的第一层分类。",
    types: [
      {
        name: "横吹式 / Transverse",
        fit: "主流学习、教材跟练、长期练习",
        detail: "吹嘴在侧面，双手横向持笛。常见 10、11、12 孔，也最容易找到指法图、教材和商品选择。",
        note: "大多数新手优先从 12 孔横吹中音 C 开始。",
      },
      {
        name: "挂坠式 / Pendant",
        fit: "便携、礼物、短旋律演奏",
        detail: "常见 4、5、6 孔，体积小，常挂在胸前或随身携带。它通过组合孔位得到音阶，音域通常比横吹短。",
        note: "适合补充玩法，不建议作为唯一主力学习笛。",
      },
      {
        name: "直吹式 / Inline",
        fit: "偏好竖向持握、手腕不适用户",
        detail: "吹嘴在笛身端部，整体像竖笛一样向前持握。指法常接近横吹式，但市场和教材资料更少。",
        note: "购买前要确认指法体系，不要只看外形。",
      },
    ],
  },
  {
    method: "按孔数与指法分",
    summary: "孔数影响音域、指法复杂度和教材匹配度。商品标题里的“6孔”“12孔”通常说的是这一层。",
    types: [
      {
        name: "4-6 孔",
        fit: "挂坠陶笛、儿童兴趣、轻量便携",
        detail: "孔少、体积小，但需要用组合指法覆盖音阶。适合短旋律、随身练习和礼物场景。",
        note: "音域和音准精细度通常不如主流横吹学习笛。",
      },
      {
        name: "10-11 孔",
        fit: "更重视音色和音准平衡的学习者",
        detail: "10 孔是横吹陶笛的经典基础形态；11 孔在低音扩展和音准平衡之间折中。",
        note: "国内新手资料少于 12 孔，但并不代表更低级。",
      },
      {
        name: "12 孔",
        fit: "大多数初学者、简谱学习、曲库覆盖",
        detail: "在横吹单腔里覆盖更宽的常用音域，商品和教程最多，是电商平台最常见的入门规格。",
        note: "低音附孔和高音区对气息控制更敏感，便宜笛容易暴露音准问题。",
      },
    ],
  },
  {
    method: "按管数与音域分",
    summary: "单腔适合入门和大多数流行旋律；复管用于解决单腔音域不够的问题。",
    types: [
      {
        name: "单腔",
        fit: "入门、基础练习、常规曲目",
        detail: "只有一个发声腔体，结构简单、重量低、价格跨度大。12 孔单腔通常已能覆盖大量入门曲。",
        note: "先把单腔吹准，比过早买复管更重要。",
      },
      {
        name: "双管",
        fit: "曲目常超出单腔高音范围的进阶玩家",
        detail: "在主腔外增加一个腔体，用来扩展高音区。需要适应换管、气息和不同腔体的音色连接。",
        note: "不要把双管当作新手捷径。",
      },
      {
        name: "三管 / 四管",
        fit: "更宽音域、演奏级需求",
        detail: "继续增加腔体以获得更大音域。可演奏更复杂曲目，但持握、价格和学习成本明显上升。",
        note: "适合明确知道自己曲目需求的人。",
      },
    ],
  },
  {
    method: "按调性与音区分",
    summary: "“AC、AF、SG、BC”等缩写通常同时表达调性和音区。不同品牌命名不完全统一，购买时要看实际音域。",
    types: [
      {
        name: "中音 C / Alto C / AC",
        fit: "第一支陶笛、简谱学习、通用曲库",
        detail: "音高适中，既不像高音笛那么尖，也不像低音笛那么大。C 调资料和伴奏匹配最友好。",
        note: "部分英文商家会把近似规格称为 Tenor C，需看音域说明。",
      },
      {
        name: "高音区 / Soprano",
        fit: "明亮音色、儿童小手、突出旋律",
        detail: "体积更小、声音更亮更穿透，但高音可能刺耳，对气息稳定度要求也更明显。",
        note: "不建议怕吵或室内练习为主的人盲买。",
      },
      {
        name: "低音区 / Bass",
        fit: "柔和厚实音色、慢歌、合奏低声部",
        detail: "体积更大、声音更低更圆润，手小用户持握可能吃力，价格也通常更高。",
        note: "先确认手型、重量和孔距是否适合。",
      },
      {
        name: "F 调 / G 调",
        fit: "特定曲目、合奏、需要不同音色位置",
        detail: "F、G 调陶笛可用相同相对指法吹出不同实际音高。对初学者来说，C 调仍是资料最多的起点。",
        note: "跟固定调伴奏合奏时，要提前确认调性。",
      },
    ],
  },
  {
    method: "按材质与用途分",
    summary: "材质不只影响外观，还影响重量、耐摔程度、价格和日常维护成本。",
    types: [
      {
        name: "塑料 / 树脂",
        fit: "儿童、通勤、预算有限、户外携带",
        detail: "耐摔、轻便、价格稳定，适合把练习频率先建立起来。优质塑料笛也可以有不错音准。",
        note: "避免只买玩具级装饰款。",
      },
      {
        name: "陶瓷 / 陶土",
        fit: "长期练习、音色质感、正式演奏",
        detail: "是最常见的进阶选择，音色和手感更有质感，但怕摔，也更依赖制作者调音水平。",
        note: "要优先看音准、售后和真实演示。",
      },
      {
        name: "木质 / 金属 / 其他材质",
        fit: "收藏、特殊音色、设计偏好",
        detail: "市场相对少，维护要求和个体差异更明显。适合作为有经验后的补充选择。",
        note: "不建议作为完全新手第一支主力笛。",
      },
    ],
  },
];

const selectionRules = [
  {
    title: "刚入门，先选 12 孔中音 C",
    detail: "中音 C 音高适中、音色不尖，常见教材和指法图匹配度高。12 孔比 6 孔更适合作为长期学习主力。",
  },
  {
    title: "孩子、手小或通勤练习，优先轻便材质",
    detail: "塑料或树脂陶笛不怕轻微磕碰，重量更低，适合随身练习。确认孔距和吹嘴做工，比只看外观更重要。",
  },
  {
    title: "想要更稳定音色，再考虑陶瓷",
    detail: "陶瓷陶笛通常质感和音色更好，但怕摔、个体差异也更明显。购买时要看音准说明、售后和真实评价。",
  },
  {
    title: "曲目经常超音域，再升级复管",
    detail: "双管或三管不是新手捷径，而是音域需求的升级选择。先确认自己常吹曲目确实超过单腔范围。",
  },
];

const avoidRules = [
  "只写装饰、礼品、摆件，缺少调性和孔数说明",
  "价格异常低但没有音准、材质、售后描述",
  "外观复杂导致孔位不清晰或手感不稳定",
  "高音区评价普遍刺耳、费气或跑音",
];

const audienceRecommendationSections = [
  {
    audience: "儿童 / 随身练习",
    summary: "优先考虑重量、耐摔、孔距和维护成本。这个阶段的目标是让用户愿意经常拿出来吹，而不是一步到位追求复杂音色。",
    accent: "耐用优先",
    matchKeywords: ["儿童", "孩子", "小孩", "塑料", "树脂", "便携", "挂坠", "6孔", "6 孔", "耐摔", "随身"],
    recommendations: [
      {
        title: "12 孔 AC 塑料陶笛",
        image: "/webfile/static/Cfinger.png",
        specs: ["12 孔", "中音 C", "塑料/树脂", "轻便耐摔"],
        reason: "指法体系接近主流教材，摔碰风险低，适合作为孩子或通勤用户的第一支练习笛。",
        href: "https://www.stlocarina.com/products/12-hole-plastic-tenor-ocarina-in-c-major-7-colors",
      },
      {
        title: "6 孔挂坠式 Alto C",
        image: "/webfile/static/note_knowledge/sample.png",
        specs: ["6 孔", "挂坠式", "便携", "短旋律"],
        reason: "体积小、携带方便，适合兴趣启蒙和短旋律演奏；但音域有限，不建议作为长期学习唯一主力。",
        href: "https://www.songbirdocarina.com/products/seedpod-alto-c-brushed",
      },
    ],
  },
  {
    audience: "初学者 / 第一支主力笛",
    summary: "默认推荐 12 孔横吹中音 C / Alto C。它的资料、指法图、简谱曲库和商品选择都更容易匹配，适合从零建立稳定练习路径。",
    accent: "资料最多",
    matchKeywords: ["初学", "入门", "新手", "12孔", "12 孔", "AC", "中音C", "中音 C", "alto c", "tenor c", "主力"],
    recommendations: [
      {
        title: "12 孔 AC 入门陶瓷陶笛",
        image: "/webfile/static/note_knowledge/finger_guide.png",
        specs: ["12 孔", "中音 C", "陶瓷", "主力练习"],
        reason: "比挂坠式更适合系统学习，音色和手感也比普通玩具级塑料笛更接近长期练习需求。",
        href: "https://www.fypottery.com/cn/product/twelve-hole-ocarina/tz12-212.html",
      },
      {
        title: "12 孔 AC 高品质塑料陶笛",
        image: "/webfile/static/Cfinger.png",
        specs: ["12 孔", "中音 C", "塑料", "低维护"],
        reason: "适合还不确定能否长期坚持的人。优先选择明确标注调性、孔数、音准和售后的型号。",
        href: "https://www.songbirdocarina.com/collections/transverse-style-ocarinas/products/rivo-alto-c-black",
      },
    ],
  },
  {
    audience: "进阶者 / 已会基础曲目",
    summary: "这个阶段通常已经知道自己喜欢的曲风和练习频率。推荐从音准、音色、调性补充和稳定高音区入手，而不是盲目买复管。",
    accent: "音色升级",
    matchKeywords: ["进阶", "中高端", "专业", "音准", "AF", "SG", "F调", "G调", "F 调", "G 调", "第二支", "补充笛", "合奏"],
    recommendations: [
      {
        title: "12 孔 AC 中高端陶瓷陶笛",
        image: "/webfile/static/note_knowledge/knowledge_01.png",
        specs: ["12 孔", "中音 C", "陶瓷", "音准优先"],
        reason: "保留熟悉指法，重点升级音准、响应和高音区稳定性，适合从入门笛过渡到长期主力笛。",
        href: "https://www.songbirdocarina.com/products/sonoro-ocarina-alto-c-in-jade-crackle",
      },
      {
        title: "AF / SG 调补充笛",
        image: "/webfile/static/note_knowledge/knowledge_02.png",
        specs: ["F 调或 G 调", "单腔", "第二支笛", "适合合奏"],
        reason: "当 C 调已经熟悉后，F/G 调可以覆盖不同伴奏、合奏声部和音色位置，但不建议早于 AC 主力笛购买。",
        href: "https://pureocarinas.com/about-the-ocarina/ocarina-keys-and-pitch-ranges",
      },
    ],
  },
  {
    audience: "高级吹奏者 / 扩展音域",
    summary: "高级用户的主要矛盾通常是音域和表现力。推荐双管、三管或低音区陶笛，但前提是已经能稳定控制单腔气息和音准。",
    accent: "音域扩展",
    matchKeywords: ["高级", "双管", "三管", "四管", "复管", "多管", "低音", "演奏级", "扩展音域", "double", "triple", "bass"],
    recommendations: [
      {
        title: "双管 AC 陶笛",
        image: "/webfile/static/note_knowledge/knowledge_03.png",
        specs: ["双管", "C 调", "约两八度", "进阶换管"],
        reason: "适合经常遇到单腔最高音不够的曲目。重点考察两腔之间的音色衔接、换管手感和高音气息压力。",
        href: "https://www.stlocarina.com/products/double-ocarina-in-c-major-with-two-octave-range-1",
      },
      {
        title: "三管 AC / 低音陶笛",
        image: "/webfile/static/note.webp",
        specs: ["三管或低音", "宽音域", "演奏级", "预算更高"],
        reason: "三管适合更宽音域和复杂曲目；低音陶笛适合柔和厚实音色和合奏低声部。购买前必须确认重量、孔距和实际音域。",
        href: "https://www.focalink.com.tw/productList.php?class=3&line=6",
      },
    ],
  },
];

const sourceLinks = [
  {
    label: "Pure Ocarinas：陶笛种类",
    href: "https://pureocarinas.com/types-of-ocarina?prefer_lang=en",
  },
  {
    label: "Pure Ocarinas：调性与音域",
    href: "https://pureocarinas.com/about-the-ocarina/ocarina-keys-and-pitch-ranges",
  },
  {
    label: "Pure Ocarinas：第一支陶笛怎么选",
    href: "https://pureocarinas.com/choosing-first-ocarina?prefer_lang=en",
  },
  {
    label: "STL Ocarina：音区命名",
    href: "https://www.stlocarina.com/blogs/news/different-types-of-ocarinas-learn-about-the-soprano-alto-tenor-bass-ocarinas",
  },
  {
    label: "STL Ocarina：新手选购",
    href: "https://www.stlocarina.com/blogs/news/which-ocarina-is-best-for-beginners",
  },
  {
    label: "STL Ocarina：双管示例",
    href: "https://www.stlocarina.com/products/double-ocarina-in-c-major-with-two-octave-range-1",
  },
  {
    label: "Songbird Ocarina：挂坠式示例",
    href: "https://www.songbirdocarina.com/products/seedpod-alto-c-brushed",
  },
  {
    label: "Focalink：三管示例",
    href: "https://www.focalink.com.tw/productList.php?class=3&line=6",
  },
  {
    label: "风雅陶笛：12 孔 AC 商品示例",
    href: "https://www.fypottery.com/cn/product/twelve-hole-ocarina/tz12-212.html",
  },
];

function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold text-emerald-800">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-normal text-zinc-950 md:text-3xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-zinc-700">{children}</p>
    </div>
  );
}

const audienceProductMatchOrder = [
  "高级吹奏者 / 扩展音域",
  "儿童 / 随身练习",
  "进阶者 / 已会基础曲目",
  "初学者 / 第一支主力笛",
];

function getNormalizedText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function getProductSearchText(product: Product) {
  return getNormalizedText(
    [
      product.title,
      product.description || "",
      product.platform,
    ].join(" ")
  );
}

function productMatchesKeywords(product: Product, keywords: string[]) {
  const text = getProductSearchText(product);
  return keywords.some((keyword) => text.includes(getNormalizedText(keyword)));
}

function groupProductsByAudience(products: Product[]) {
  const groups: Record<string, Product[]> = {};
  const unmatched: Product[] = [];

  for (const section of audienceRecommendationSections) {
    groups[section.audience] = [];
  }

  for (const product of products) {
    const matchedAudience = audienceProductMatchOrder.find((audience) => {
      const section = audienceRecommendationSections.find((item) => item.audience === audience);
      return section ? productMatchesKeywords(product, section.matchKeywords) : false;
    });

    if (matchedAudience) {
      groups[matchedAudience].push(product);
    } else {
      unmatched.push(product);
    }
  }

  return { groups, unmatched };
}

function AudienceRecommendations({
  products,
  productsEnabled,
}: {
  products: Product[];
  productsEnabled: boolean;
}) {
  const { groups, unmatched } = productsEnabled
    ? groupProductsByAudience(products)
    : { groups: {}, unmatched: [] };

  return (
    <div className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-[#fbfaf6]">
      {audienceRecommendationSections.map((section) => (
        <article key={section.audience} className="p-5 md:p-6">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div>
              <span className="inline-flex rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900">
                {section.accent}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-zinc-950">{section.audience}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">{section.summary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {section.recommendations.map((product) => (
                <div key={product.title} className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                    <div className="relative min-h-[170px] bg-[#f6f0e4]">
                      <Image
                        src={product.image}
                        alt={`${product.title}推荐图`}
                        fill
                        className="object-contain p-5"
                        sizes="(max-width: 768px) 100vw, 150px"
                      />
                      <span className="absolute left-2 top-2 rounded-sm bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                        示例
                      </span>
                    </div>
                    <div className="flex flex-col p-4">
                      <h4 className="font-semibold text-zinc-950">{product.title}</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.specs.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">{product.reason}</p>
                      {productsEnabled && (
                        <Button asChild variant="outline" className="mt-4 w-full">
                          <Link href={product.href} target="_blank" rel="noopener noreferrer">
                            查看示例
                            <ExternalLinkIcon className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="md:col-span-2">
                <div className="mt-2 border-t border-zinc-200 pt-5">
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h4 className="font-semibold text-zinc-950">对应上架商品</h4>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        根据商品标题和描述自动匹配到该人群，方便看完推荐理由后直接购买。
                      </p>
                    </div>
                  </div>
                  {!productsEnabled ? (
                    <div className="rounded-md border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm leading-6 text-zinc-600">
                      商品展示暂未开放。当前仅展示选购建议和推荐规格。
                    </div>
                  ) : groups[section.audience].length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {groups[section.audience].map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          audience={section.audience}
                          highlight="匹配此人群"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm leading-6 text-zinc-600">
                      暂无匹配商品。添加商品时，可在标题或描述中写入相关关键词，例如“初学”“12孔AC”“塑料”“双管”等。
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}

      {productsEnabled && unmatched.length > 0 && (
        <article className="p-5 md:p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-zinc-950">其他上架商品</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              这些商品暂未匹配到明确人群，建议在后台商品标题或描述中补充“初学、进阶、双管、塑料”等关键词。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {unmatched.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

export default async function ShopPage() {
  let productsEnabled = false;
  try {
    productsEnabled = await isShopEnabled();
  } catch {
    productsEnabled = false;
  }

  let products: Product[] = [];
  if (productsEnabled) {
    try {
      products = await getActiveProducts();
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#fbfaf6]">
      <AppNav currentPath="/shop" />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-[#f8f1df]">
        <div className="absolute inset-0 opacity-[0.11]">
          <Image
            src="/webfile/static/note.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,241,223,0.98)_0%,rgba(248,241,223,0.91)_54%,rgba(248,241,223,0.76)_100%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-18">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Ocarinana 陶笛推荐</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-normal text-zinc-950 md:text-5xl">
              先选对陶笛，再开始稳定练习
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg">
              这不是单纯的商品货架。我们把陶笛种类、调性、材质、学习阶段和商品选择放在同一页，帮助你判断第一支或下一支陶笛应该买什么。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="#recommended-products">
                  查看推荐
                  <ArrowUpRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 bg-white/70">
                <Link href="#choose">按情况选择</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-md border border-emerald-900/15 bg-white/75 p-5 shadow-sm backdrop-blur">
            <div className="flex items-start gap-3">
              <InfoIcon className="mt-1 h-5 w-5 flex-none text-emerald-800" />
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">快速结论</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-700">
                  大多数初学者优先选择 12 孔横吹中音 C / Alto C。预算有限、孩子使用或经常携带时选塑料/树脂；确定长期学习后再升级陶瓷；曲目音域不够时再考虑复管。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="types" className="w-full border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <SectionHeader eyebrow="01 / 种类" title="陶笛种类有哪些">
            陶笛不是只按外形分类。真正影响购买判断的是吹奏形态、孔数指法、管数音域、调性音区和材质用途。先把这些词拆开，商品标题就容易读懂。
          </SectionHeader>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {classificationHighlights.map((item) => (
              <div key={item.label} className="rounded-md border border-emerald-900/10 bg-[#fbfaf6] p-4">
                <p className="text-xs font-semibold text-emerald-800">{item.label}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {ocarinaClassificationGroups.map((group) => (
              <article key={group.method} className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-5">
                <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-950">{group.method}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-600">{group.summary}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.types.map((type) => (
                      <div key={type.name} className="rounded-md border border-zinc-200 bg-white p-4">
                        <h4 className="font-semibold text-zinc-950">{type.name}</h4>
                        <p className="mt-2 text-xs font-medium text-emerald-800">适合：{type.fit}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-600">{type.detail}</p>
                        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">
                          {type.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="choose" className="w-full border-b border-zinc-200 bg-[#fbfaf6]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[1fr_340px]">
          <div>
            <SectionHeader eyebrow="02 / 选择" title="如何根据自身情况选择合适的陶笛">
              选陶笛的核心是匹配你的学习阶段、手型、使用场景和曲目音域。下面这组规则可以直接作为购买前检查清单。
            </SectionHeader>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {selectionRules.map((rule, index) => (
                <article key={rule.title} className="rounded-md border border-zinc-200 bg-white p-5">
                  <div className="text-sm font-semibold text-emerald-800">0{index + 1}</div>
                  <h3 className="mt-2 font-semibold text-zinc-950">{rule.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600">{rule.detail}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="rounded-md border border-red-200 bg-white p-5 lg:mt-12">
            <h3 className="font-semibold text-zinc-950">购买前避坑</h3>
            <ul className="mt-4 space-y-3">
              {avoidRules.map((rule) => (
                <li key={rule} className="text-sm leading-6 text-zinc-700">
                  <span className="mr-2 font-bold text-red-600">!</span>
                  {rule}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section id="recommended-products" className="w-full flex-1 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader eyebrow="03 / 推荐" title="我们精心挑选后向用户推荐的陶笛">
              推荐不只按价格排序，而是按人群和学习阶段拆分。每个板块先说明适合的陶笛规格和推荐理由，随后紧跟对应上架商品，让用户看完判断后就能购买。
            </SectionHeader>
            <p className="max-w-sm text-sm leading-6 text-zinc-500">
              商品链接会跳转第三方平台，购买前请再次核对价格、库存、运费和售后。
            </p>
          </div>

          <div className="mt-8">
            <AudienceRecommendations products={products} productsEnabled={productsEnabled} />
          </div>
        </div>
      </section>

      <section className="w-full border-t border-zinc-200 bg-[#fbfaf6]">
        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <h2 className="text-sm font-semibold text-zinc-950">资料来源与核对</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {sourceLinks.map((source) => (
              <Link
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition-colors hover:border-emerald-700 hover:text-emerald-800"
              >
                {source.label}
                <ExternalLinkIcon className="ml-2 h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO: 结构化数据 */}
      <BreadcrumbSchema
        items={[
          { name: "首页", url: baseUrl },
          { name: "陶笛推荐", url: `${baseUrl}/shop` },
        ]}
      />
      {productsEnabled && products.length > 0 && (
        <ProductSchema products={products} />
      )}

      {/* 页脚 */}
      <footer className="w-full border-t mt-auto">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/60">
              © {new Date().getFullYear()} Ocarinana · 陶笛谱生成器
            </p>
            <div className="flex items-center gap-6 text-xs">
              <p className="text-foreground/60">
                商品链接跳转到第三方平台，购买时请注意商品详情
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

