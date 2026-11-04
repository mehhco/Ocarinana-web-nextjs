export type ScoreInstrumentSlug = '6-hole' | '12-hole';
export type ScoreKeySlug = 'c' | 'f' | 'g';

export interface ScoreLandingFaq {
  question: string;
  answer: string;
}

export interface InstrumentLanding {
  slug: ScoreInstrumentSlug;
  /** 查询乐谱时使用的 instrumentType 值 */
  instrumentType: '6-hole' | '12-hole';
  label: string;
  title: string;
  description: string;
  intro: string[];
  keywords: string[];
  faqs: ScoreLandingFaq[];
}

export interface KeyLanding {
  slug: ScoreKeySlug;
  keySignature: 'C' | 'F' | 'G';
  label: string;
  title: string;
  description: string;
  intro: string[];
  keywords: string[];
  faqs: ScoreLandingFaq[];
}

export const instrumentLandings: InstrumentLanding[] = [
  {
    slug: '6-hole',
    instrumentType: '6-hole',
    label: '六孔陶笛谱',
    title: '六孔陶笛谱 - 在线查看与制作六孔数字简谱',
    description:
      '浏览 Ocarinana 乐谱广场公开的六孔陶笛数字简谱，在线查看谱面与指法图。也可以直接打开编辑器，把旋律改成六孔可吹的版本，导出打印。',
    intro: [
      '六孔陶笛音域较窄，能完整覆盖的曲目以短旋律、儿歌和入门练习曲为主。这里的每份乐谱都会标注孔数、调号和拍号，点进去可以直接对照指法图练习。',
      '如果现有曲谱不够用，可以在编辑器里换调、改写旋律或缩短音域，导出成适合打印和课堂使用的图片。',
    ],
    keywords: ['六孔陶笛谱', '六孔陶笛简谱', '六孔陶笛曲谱', '6孔陶笛谱', '陶笛数字简谱'],
    faqs: [
      {
        question: '六孔陶笛能吹哪些调？',
        answer:
          '常见的是 1=C、1=F、1=G 三种。C 调可用音级最完整，F 调只有一个高音，G 调没有高音区，选曲时要先看曲子的最高音。',
      },
      {
        question: '六孔和十二孔的乐谱能通用吗？',
        answer:
          '旋律写法可以通用，但指法图不能通用。同一份简谱换成另一种孔数后，指法、可用音域和换调方式都会变化。',
      },
      {
        question: '公开乐谱可以直接拿来练习吗？',
        answer:
          '可以。公开乐谱支持在线查看谱面和指法图，也可以导出图片用于个人练习和课堂教学。',
      },
    ],
  },
  {
    slug: '12-hole',
    instrumentType: '12-hole',
    label: '十二孔陶笛谱',
    title: '十二孔陶笛谱 - 在线查看与制作十二孔数字简谱',
    description:
      '浏览 Ocarinana 乐谱广场公开的十二孔陶笛数字简谱，按调号与拍号查看谱面和指法图，也可以在线改编歌词与排版，导出高清图片。',
    intro: [
      '十二孔陶笛音域更宽，能覆盖大部分流行曲和完整旋律，是很多学习者的主力乐器。这里的乐谱都来自用户公开分享，谱面标注了调号、拍号和指法。',
      '想换调、加歌词或者调整排版，可以复制一份到编辑器继续修改，导出时指法图会跟着调号自动更新。',
    ],
    keywords: ['十二孔陶笛谱', '十二孔陶笛简谱', '十二孔陶笛曲谱', '12孔陶笛谱', '陶笛数字简谱'],
    faqs: [
      {
        question: '十二孔陶笛适合吹什么曲子？',
        answer:
          '音域跨度大、需要低音区或高音区的完整旋律更适合十二孔，例如流行歌、影视配乐和考级曲目。',
      },
      {
        question: '为什么同一首谱换调后指法变了？',
        answer:
          '调号决定简谱数字对应的实际音高。换调之后每个音级的按孔方式都会变化，指法图需要整组重新看。',
      },
      {
        question: '谱面上的指法图可以关掉吗？',
        answer:
          '可以。查看乐谱时能单独开关歌词和指法图，导出时会按当前显示状态生成图片。',
      },
    ],
  },
];

export const keyLandings: KeyLanding[] = [
  {
    slug: 'c',
    keySignature: 'C',
    label: '1=C 陶笛谱',
    title: '1=C 陶笛谱 - C 调数字简谱与指法图',
    description:
      '查看 Ocarinana 乐谱广场公开的 1=C 陶笛谱。C 调不涉及升降音，指法最直观，六孔与十二孔都适用，谱面自带指法图，可在线练习和导出。',
    intro: [
      '1=C 是最常用的陶笛调号：不需要额外的升降音，指法最直观，适合入门和大部分儿歌、民谣。',
      'C 调下六孔陶笛有完整的中音区和高音区，十二孔还能向下延伸到低音 6、7，选曲时注意最低音不要超出范围。',
    ],
    keywords: ['1=C 陶笛谱', 'C 调陶笛谱', 'C调陶笛简谱', '陶笛C调指法'],
    faqs: [
      {
        question: '1=C 是什么意思？',
        answer:
          '表示简谱里的 1 对应实际音高 C。调号决定整组数字的实际音高，也决定每个音级要用哪个指法。',
      },
      {
        question: 'C 调谱可以用 F 调陶笛吹吗？',
        answer:
          '可以，但实际音高会整体移动，指法也要按 F 调重新查。要还原原曲音高，还是建议用对应调号的陶笛或换调处理。',
      },
    ],
  },
  {
    slug: 'f',
    keySignature: 'F',
    label: '1=F 陶笛谱',
    title: '1=F 陶笛谱 - F 调数字简谱与指法图',
    description:
      '查看 Ocarinana 乐谱广场公开的 1=F 陶笛谱。F 调在十二孔陶笛上偏向低音区，适合低沉柔和的旋律，谱面自带指法图，可直接对照练习。',
    intro: [
      '1=F 的曲子常用到低音区，十二孔陶笛在 F 调下可以吹到低音 3，六孔则从低音 4 开始。',
      'F 调高音区较窄，选曲时先确认最高音，必要时可以在编辑器里整体移调。',
    ],
    keywords: ['1=F 陶笛谱', 'F 调陶笛谱', 'F调陶笛简谱', '陶笛F调指法'],
    faqs: [
      {
        question: 'F 调为什么低音多？',
        answer:
          '因为 1=F 时，同样的按孔方式对应的实际音高整体下移，曲子里常见的低音区就落在陶笛可吹的范围内。',
      },
      {
        question: 'F 调吹不上去怎么办？',
        answer:
          'F 调高音区有限，超出音域的音可以整体移调，或者在编辑器里改写成可用音域内的旋律。',
      },
    ],
  },
  {
    slug: 'g',
    keySignature: 'G',
    label: '1=G 陶笛谱',
    title: '1=G 陶笛谱 - G 调数字简谱与指法图',
    description:
      '查看 Ocarinana 乐谱广场公开的 1=G 陶笛谱。G 调会用到降七音或升六音，是最容易按错的地方，谱面指法图按孔数与调号自动匹配。',
    intro: [
      '1=G 的曲子在陶笛上会用到降七音（十二孔）或升六音（六孔），是新手最容易按错的地方，建议先看指法表再上手。',
      'G 调没有高音区，遇到高音较多的旋律需要移调，或者换用十二孔陶笛。',
    ],
    keywords: ['1=G 陶笛谱', 'G 调陶笛谱', 'G调陶笛简谱', '陶笛G调指法'],
    faqs: [
      {
        question: 'G 调里的降七音怎么按？',
        answer:
          '十二孔陶笛的 G 调会用到降七音，六孔则是升六音。具体按孔方式可以在指法表里按孔数查询。',
      },
      {
        question: 'G 调为什么没有高音？',
        answer:
          '在常见陶笛上，G 调的可用音域偏向中低音区，高音部分超出乐器范围，需要移调或换孔数。',
      },
      {
        question: 'G 调的曲子太少，可以自己改吗？',
        answer:
          '可以。把 C 调或 F 调的谱子整体移调到 G 调，再检查最高音是否超出音域；编辑器里换调后指法图会自动更新，导出前对照一遍即可。',
      },
    ],
  },
];

export function getInstrumentLanding(slug: string): InstrumentLanding | undefined {
  return instrumentLandings.find((landing) => landing.slug === slug);
}

export function getKeyLanding(slug: string): KeyLanding | undefined {
  return keyLandings.find((landing) => landing.slug === slug);
}

export function getInstrumentLandingHref(slug: ScoreInstrumentSlug): string {
  return `/scores/instrument/${slug}`;
}

export function getKeyLandingHref(slug: ScoreKeySlug): string {
  return `/scores/key/${slug}`;
}
