import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;
const FONT_PATH = ['public', 'fonts', 'noto-sans-sc-og.ttf'];
const FONT_FAMILY = 'Noto Sans SC OG';
const MAX_TITLE_LENGTH = 30;

type ScoreOgRecord = {
  score_id: string;
  title: string;
  document: { settings?: { instrumentType?: string; keySignature?: string; timeSignature?: string } } | null;
};

let fontPromise: Promise<ArrayBuffer | null> | null = null;

function loadFont(): Promise<ArrayBuffer | null> {
  if (!fontPromise) {
    fontPromise = readFile(path.join(process.cwd(), ...FONT_PATH))
      .then((buffer) => {
        const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
        return arrayBuffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
      })
      .catch(() => null);
  }

  return fontPromise;
}

async function getScore(id: string): Promise<ScoreOgRecord | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('scores')
    .select('score_id, title, document')
    .eq('score_id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ScoreOgRecord;
}

function clampTitle(title: string): string {
  const trimmed = title.trim() || '陶笛谱';
  return trimmed.length > MAX_TITLE_LENGTH
    ? `${trimmed.slice(0, MAX_TITLE_LENGTH)}…`
    : trimmed;
}

function renderFallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #f3f7ec 0%, #dff0e3 100%)',
          color: '#064e3b',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 700 }}>Ocarinana</div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700 }}>
          Ocarina Sheet Music
        </div>
        <div style={{ display: 'flex', fontSize: 28 }}>ocarinana.com</div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [score, font] = await Promise.all([getScore(id), loadFont()]);

  if (!score || !font) {
    return renderFallbackImage();
  }

  const settings = score.document?.settings ?? {};
  const instrumentLabel = settings.instrumentType === '6-hole' ? '六孔陶笛' : '十二孔陶笛';
  const keySignature = settings.keySignature || 'C';
  const timeSignature = settings.timeSignature || '4/4';

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #f6f8ef 0%, #e2f1e6 55%, #d3ecdf 100%)',
          color: '#0f172a',
          fontFamily: FONT_FAMILY,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-120px',
            top: '-140px',
            width: '520px',
            height: '520px',
            borderRadius: '9999px',
            border: '2px solid rgba(6, 95, 70, 0.16)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '180px',
            bottom: '-120px',
            width: '300px',
            height: '300px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.12)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#065f46' }}>
            Ocarinana
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#047857',
              padding: '8px 20px',
              borderRadius: '9999px',
              border: '2px solid rgba(6, 95, 70, 0.25)',
            }}
          >
            乐谱广场
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={{ display: 'flex', fontSize: 24, color: '#15803d', letterSpacing: '0.12em' }}>
            陶笛数字简谱 · 附指法图
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '960px',
            }}
          >
            {clampTitle(score.title)}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: 28, color: '#334155' }}>
            <span
              style={{
                display: 'flex',
                padding: '8px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              {instrumentLabel}
            </span>
            <span
              style={{
                display: 'flex',
                padding: '8px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              1={keySignature}
            </span>
            <span
              style={{
                display: 'flex',
                padding: '8px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              {timeSignature}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', fontSize: 26, color: '#065f46', fontWeight: 700 }}>
              在线查看谱面 · 导出打印 · 自动匹配指法
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: '#64748b' }}>
              ocarinana.com/scores/{score.score_id}
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#64748b' }}>陶笛谱生成器</div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: FONT_FAMILY, data: font, weight: 700, style: 'normal' }],
    }
  );

  image.headers.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
  );

  return image;
}
