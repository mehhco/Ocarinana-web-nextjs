import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, MusicIcon } from "@/components/ui/icons";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/structured-data";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://ocarinana.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "音乐课堂 - 陶笛、简谱与基础乐理系统入门",
  description:
    "Ocarinana 音乐课堂提供更系统的基础乐理、简谱符号、陶笛演奏技巧和编辑器使用教程，帮助陶笛学习者从读谱到制谱建立完整路径。",
  keywords: [
    "音乐课堂",
    "基础乐理",
    "简谱知识",
    "简谱符号",
    "陶笛演奏技巧",
    "陶笛教程",
    "陶笛气息",
    "陶笛指法",
    "Ocarinana 编辑器",
  ],
  openGraph: {
    title: "音乐课堂 - Ocarinana",
    description: "系统学习基础乐理、简谱符号、陶笛演奏和 Ocarinana 编辑器使用。",
    type: "article",
    url: `${baseUrl}/music-classroom`,
  },
  alternates: {
    canonical: `${baseUrl}/music-classroom`,
  },
};

const lessons = [
  { id: "music-theory", title: "基础乐理知识", short: "音高、节奏、调号、乐句" },
  { id: "jianpu", title: "基础简谱知识", short: "数字、时值、符号、反复" },
  { id: "playing", title: "陶笛演奏技巧", short: "气息、吐音、音准、换指" },
  { id: "editor", title: "编辑器使用", short: "建谱、输入、排版、导出" },
];

const pitchRows = [
  { concept: "音级", detail: "简谱 1-7 对应 do、re、mi、fa、sol、la、si，是相对音高。" },
  { concept: "全音/半音", detail: "大调音阶常见关系为全、全、半、全、全、全、半，用来理解 3-4、7-1 的距离。" },
  { concept: "调号", detail: "1=C 表示 1 唱作 C 音；同一段简谱换成 1=F 或 1=G 时，数字关系不变，实际音高整体移动。" },
  { concept: "音域", detail: "陶笛可吹的最低音到最高音是选曲和移调的边界，超出音域就需要换调、换笛或改写。" },
];

const rhythmRows = [
  { notation: "4/4", accent: "强、弱、次强、弱", usage: "流行歌、练习曲、教学谱最常见，适合初学者建立稳定拍感。" },
  { notation: "3/4", accent: "强、弱、弱", usage: "圆舞曲、抒情旋律常见，乐句有明显摆动感。" },
  { notation: "6/8", accent: "强、弱、弱、次强、弱、弱", usage: "按两大拍理解，每大拍三等分，常用于摇曳感较强的旋律。" },
];

const jianpuSymbolRows = [
  { symbol: "1 2 3 4 5 6 7", name: "音级", meaning: "表示七个相对音级；调号决定它们对应的实际音高。" },
  { symbol: "0", name: "休止", meaning: "表示不发音，占据相应时值；练习时仍然要数拍。" },
  { symbol: "上点 / 下点", name: "八度", meaning: "数字上方加点升高八度，下方加点降低八度。" },
  { symbol: "下划线", name: "缩短时值", meaning: "一条下划线常表示八分音符，两条表示更短的十六分音符。" },
  { symbol: "数字后横线", name: "延长时值", meaning: "延长前一个音的持续时间，常用于长音或句尾收束。" },
  { symbol: "附点", name: "延长一半", meaning: "把原时值增加一半，例如附点四分音符等于四分音符加八分音符。" },
  { symbol: "连音线", name: "连贯演奏", meaning: "提示若干音之间少断开，陶笛上通常用更平滑的气息和换指处理。" },
  { symbol: "反复记号", name: "重复段落", meaning: "减少重复书写，演奏时按标记返回指定位置。" },
];

const editorFlow = [
  "先确定曲名、调号、拍号和每行小节数。",
  "按乐句输入音符，不急着调整所有细节。",
  "检查简谱符号：休止、附点、连线、反复和歌词位置。",
  "切换指法图显示，确认陶笛调性与目标乐器一致。",
  "导出前放大检查小节拥挤、换行和歌词遮挡。",
];

const sourceLinks = [
  {
    label: "Open Music Theory",
    href: "https://viva.pressbooks.pub/openmusictheory/",
    note: "用于交叉核对节拍、音级、音程和调性等基础乐理概念。",
  },
  {
    label: "MusicTheory.net Lessons",
    href: "https://www.musictheory.net/lessons",
    note: "用于核对节奏、拍号、音程、调号等入门教学表达。",
  },
  {
    label: "Jianpu / Numbered Musical Notation",
    href: "https://en.wikipedia.org/wiki/Numbered_musical_notation",
    note: "用于核对数字简谱、八度点、时值线等符号的通用说明。",
  },
  {
    label: "Pure Ocarinas Guides",
    href: "https://pureocarinas.com/",
    note: "用于核对陶笛气息、音准、指法和选笛相关原则。",
  },
  {
    label: "STL Ocarina Resources",
    href: "https://www.stlocarina.com/",
    note: "用于参考陶笛入门学习和演奏资源的组织方式。",
  },
];

function KnowledgeFigure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <Image
        src={src}
        alt={alt}
        width={1456}
        height={1074}
        className="h-auto w-full"
        loading="lazy"
      />
      <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-5 text-zinc-600">
        {caption}
      </figcaption>
    </figure>
  );
}

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
      <div className="text-sm font-semibold text-emerald-800">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold text-zinc-950 md:text-3xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-zinc-700">{children}</p>
    </div>
  );
}

export default function MusicClassroomPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#fbfaf6]">
      <AppNav currentPath="/music-classroom" />

      <ArticleSchema
        headline="音乐课堂 - 陶笛、简谱与基础乐理系统入门"
        description="系统学习基础乐理、简谱符号、陶笛演奏技巧和 Ocarinana 编辑器使用。"
        url={`${baseUrl}/music-classroom`}
        image="/webfile/static/note.webp"
        datePublished="2026-05-13"
        dateModified="2026-05-13"
      />
      <BreadcrumbSchema
        items={[
          { name: "首页", url: baseUrl },
          { name: "音乐课堂", url: `${baseUrl}/music-classroom` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-[#f8f1df]">
        <div className="absolute inset-0 opacity-[0.1]">
          <Image
            src="/webfile/static/note.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,241,223,0.98)_0%,rgba(248,241,223,0.9)_52%,rgba(248,241,223,0.74)_100%)]" />

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
          <div>
            <p className="mb-4 text-sm font-semibold text-emerald-800">Ocarinana 系统学习路径</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-zinc-950 md:text-6xl">
              音乐课堂
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-700 md:text-lg">
              这不是零散的术语表，而是一条从“听得懂、数得准、吹得稳”到“能独立整理陶笛谱”的学习路线。页面内容以基础乐理、数字简谱、陶笛演奏和制谱流程为主，适合初学者、音乐教师和需要整理教学谱例的用户。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 bg-emerald-700 px-6 hover:bg-emerald-800">
                <Link href="/editor">
                  打开编辑器
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 border-zinc-300 bg-white/70 px-6">
                <Link href="#music-theory">从第一课开始</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 text-sm">
              <span className="font-semibold text-zinc-950">课程目录</span>
              <span className="text-emerald-800">5 个模块</span>
            </div>
            <div className="mt-4 grid gap-2">
              {lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`#${lesson.id}`}
                  className="group grid grid-cols-[2.25rem_1fr] items-center gap-3 rounded-md border border-zinc-200 bg-[#fffdf7] p-3 text-sm transition-colors hover:border-emerald-700 hover:bg-emerald-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-zinc-950 group-hover:text-emerald-800">
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-600">{lesson.short}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 md:grid-cols-5">
          {lessons.map((lesson, index) => (
            <a key={lesson.id} href={`#${lesson.id}`} className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-4 transition-colors hover:border-emerald-700">
              <div className="text-xs font-semibold text-emerald-800">Module {index + 1}</div>
              <div className="mt-1 font-semibold text-zinc-950">{lesson.title}</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">{lesson.short}</div>
            </a>
          ))}
        </div>
      </section>

      <section id="music-theory" className="scroll-mt-24 border-b border-zinc-200 bg-[#fbfaf6]">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-16">
          <SectionHeader eyebrow="Lesson 01" title="基础乐理知识：先建立可迁移的音乐坐标">
            陶笛谱不只是把数字写在纸上。真正影响演奏质量的是音高关系、节拍组织、调号选择和乐句呼吸。理解这些概念后，同一首曲子换调、改写或录入编辑器都会更清晰。
          </SectionHeader>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              <div className="bg-zinc-950 px-4 py-3 text-sm font-semibold text-white">音高与调号</div>
              {pitchRows.map((row) => (
                <div key={row.concept} className="grid gap-2 border-t border-zinc-200 px-4 py-4 text-sm md:grid-cols-[7rem_1fr]">
                  <div className="font-semibold text-zinc-950">{row.concept}</div>
                  <div className="leading-6 text-zinc-700">{row.detail}</div>
                </div>
              ))}
            </div>
            <figure className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              <Image
                src="/webfile/static/note_knowledge/knowledge_01.png"
                alt="C 大调音阶全音和半音阶梯示意图"
                width={1456}
                height={1074}
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-5 text-zinc-600">
                钢琴白键从 C 到下一个 C 正好构成 C 大调音阶，音程规律是“全、全、半、全、全、全、半”。
              </figcaption>
            </figure>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <figure className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              <Image
                src="/webfile/static/note_knowledge/knowledge_02.png"
                alt="4/4、3/4、6/8 拍号与强弱拍循环示意图"
                width={1456}
                height={1074}
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="border-t border-zinc-200 px-4 py-3 text-xs leading-5 text-zinc-600">
                6/8 常按两大拍感受，而不是六个平均重音的拍子；常见分组是 3+3，第 1 拍强，第 4 拍次强。
              </figcaption>
            </figure>
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              <div className="bg-emerald-800 px-4 py-3 text-sm font-semibold text-white">常见拍号</div>
              {rhythmRows.map((row) => (
                <div key={row.notation} className="grid gap-2 border-t border-zinc-200 px-4 py-4 text-sm md:grid-cols-[4rem_8rem_1fr]">
                  <div className="font-semibold text-zinc-950">{row.notation}</div>
                  <div className="text-zinc-700">{row.accent}</div>
                  <div className="leading-6 text-zinc-700">{row.usage}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-md bg-emerald-50 p-5 text-sm leading-7 text-emerald-950 ring-1 ring-emerald-900/10">
            <span className="font-semibold">练习建议：</span>
            新曲先不急着吹。先读调号和拍号，再拍手数两遍节奏，最后用“1、2、3”唱出音高走向。这个顺序能把错误分离出来：节奏错、音高错、还是陶笛换指错。
          </div>
        </div>
      </section>

      <section id="jianpu" className="scroll-mt-24 border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-16">
          <SectionHeader eyebrow="Lesson 02" title="基础简谱知识：数字、时值和符号要分层阅读">
            数字简谱的优势是直观，但它把音高、节奏、装饰和段落结构压缩在很少的符号里。读谱时建议按三层处理：先看数字音高，再看时值线和附点，最后看连线、反复、换气等演奏标记。
          </SectionHeader>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-[#fffdf7]">
              <div className="grid grid-cols-[1fr_1fr_2fr] bg-zinc-950 px-4 py-3 text-xs font-semibold text-white">
                <span>符号</span>
                <span>名称</span>
                <span>读谱要点</span>
              </div>
              {jianpuSymbolRows.map((row) => (
                <div key={row.symbol} className="grid grid-cols-[1fr_1fr_2fr] border-t border-zinc-200 px-4 py-3 text-sm text-zinc-700">
                  <span className="font-semibold text-zinc-950">{row.symbol}</span>
                  <span>{row.name}</span>
                  <span className="leading-6">{row.meaning}</span>
                </div>
              ))}
            </div>
            <KnowledgeFigure
              src="/webfile/static/note_knowledge/knowledge_03.png"
              alt="简谱符号总览图，包含数字音级、休止符、高低音点、下划线、延长线、附点、连线和反复记号"
              caption="读简谱时先看数字音高，再看时值线，最后检查连线、反复和演奏标记。"
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-5">
              <h3 className="font-semibold text-zinc-950">时值关系</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                在常见写法中，四分音符是基础单位；下划线越多，音越短；横线越多，音越长。附点不是固定加一拍，而是增加原时值的一半。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-5">
              <h3 className="font-semibold text-zinc-950">连线区别</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                延音线连接相同音高，表示时值合并；圆滑线连接不同音高，表示乐句连贯。陶笛演奏时两者的气息处理不同。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-5">
              <h3 className="font-semibold text-zinc-950">反复与段落</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                反复记号、房子记号和 D.C. / D.S. 会改变实际演奏顺序。录入编辑器前，先把演奏路线在纸上走一遍。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="playing" className="scroll-mt-24 border-b border-zinc-200 bg-[#fbfaf6]">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-16">
          <SectionHeader eyebrow="Lesson 03" title="陶笛演奏知识和技巧：音准来自气息，不只是手指">
            陶笛没有簧片和键盘机构，音高会明显受到气息压力影响。初学者常见问题不是“不会按孔”，而是低音吹得过猛、高音挤压、换指时气息断裂。
          </SectionHeader>

          <div className="mt-8">
            <KnowledgeFigure
              src="/webfile/static/note_knowledge/finger_guide.png"
              alt="陶笛指法与持笛手指覆盖示意图"
              caption="手指要用指腹完整覆盖音孔，保持手腕自然放松，换指时尽量减少多余动作。"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-md border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-950">吐音</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                用舌尖轻触上齿龈附近形成 tu、du 的音头。慢练时追求音头清楚、音尾完整，避免每个音都被舌头截断得过硬。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-950">换指</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                先练相邻两个音的慢速连接，保证手指同时性。遇到跨孔多的音程，先拆成“按孔动作”和“气息动作”分别稳定。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-950">音准</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                用调音器检查长音，不要只看瞬间数值。真正要训练的是进入音、保持音和离开音时都接近目标音高。
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-950">气息训练重点</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                从低音到高音，气息通常从柔和、稳定逐步转向更集中。练习时不要用喉咙挤压高音，而是用更稳定的身体支撑和更集中的气流完成音区转换。
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-950">日常练习结构</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                建议把练习拆成三段：长音稳定音准，音阶训练换指，短句检查节奏和乐句。每次练习保留一小段录音，更容易发现气息和音准问题。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="editor" className="scroll-mt-24 border-b border-zinc-200 bg-[#fbfaf6]">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-16">
          <SectionHeader eyebrow="Lesson 04" title="编辑器使用：把音乐判断转化成清晰谱面">
            编辑器不是最后一步的排版工具，而是整理音乐信息的工作台。高质量陶笛谱通常先确认调号和音域，再录入音符和节奏，最后检查指法图、歌词、换行和导出清晰度。
          </SectionHeader>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-md border border-zinc-200 bg-white p-5">
              <h3 className="font-semibold text-zinc-950">推荐制谱流程</h3>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
                {editorFlow.map((step, index) => (
                  <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              <Image
                src="/webfile/static/note_knowledge/sample.png"
                alt="Ocarinana 陶笛谱示例输出"
                width={1456}
                height={1074}
                className="h-auto w-full bg-[#fffdf7] p-3"
                loading="lazy"
              />
              <div className="border-t border-zinc-200 px-4 py-3 text-xs leading-5 text-zinc-600">
                示例：成品谱面应同时检查音符、歌词、指法图和行距。实际教程截图可后续替换为编辑器操作界面。
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <KnowledgeFigure
              src="/webfile/static/note_knowledge/knowledge_10.png"
              alt="Ocarinana 新建乐谱设置面板示意图"
              caption="新建乐谱时先确定曲名、调号、拍号和每行小节数，后续录入会更稳定。"
            />
            <KnowledgeFigure
              src="/webfile/static/note_knowledge/knowledge_11.png"
              alt="Ocarinana 音符与符号输入区域示意图"
              caption="先按乐句录入旋律，再补充休止、附点、连线和歌词等细节。"
            />
            <KnowledgeFigure
              src="/webfile/static/note_knowledge/knowledge_12.png"
              alt="Ocarinana 导出前检查清单示意图"
              caption="导出后再打开图片检查清晰度、行距、歌词位置和指法图，比只看编辑器预览更可靠。"
            />
          </div>

          <div className="mt-8 flex flex-col gap-5 rounded-md border border-zinc-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-zinc-950">学完一章，就录入 4 到 8 小节</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                短谱例足够检验节拍、符号、调号和指法理解，也更容易发现编辑器里需要调整的排版问题。
              </p>
            </div>
            <Button asChild className="h-12 shrink-0 bg-emerald-700 px-6 hover:bg-emerald-800">
              <Link href="/editor">
                新建乐谱
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
              <MusicIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-950">资料参考</h2>
              <p className="text-xs text-zinc-500">以下链接用于核对概念表达，页面正文已按陶笛学习场景重新整理。</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {sourceLinks.map((source) => (
              <a
                key={source.href}
                href={source.href}
                className="rounded-md border border-zinc-200 bg-[#fbfaf6] p-4 text-sm transition-colors hover:border-emerald-700"
                target="_blank"
                rel="noreferrer"
              >
                <span className="font-semibold text-zinc-950">{source.label}</span>
                <span className="mt-2 block leading-6 text-zinc-600">{source.note}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full border-t bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 md:flex-row">
          <p className="text-xs text-foreground/60">
            © {new Date().getFullYear()} Ocarinana · 陶笛谱生成器
          </p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/legal/privacy" className="text-foreground/60 transition-colors hover:text-foreground">
              隐私政策
            </Link>
            <Link href="/legal/terms" className="text-foreground/60 transition-colors hover:text-foreground">
              用户协议
            </Link>
            <LazyThemeSwitcher />
          </div>
        </div>
      </footer>
    </main>
  );
}
