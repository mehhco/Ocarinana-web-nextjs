'use client';

import { Printer } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

const CARD_SELECTOR = 'figure[data-fingering-card] img';
const IMAGE_WAIT_TIMEOUT_MS = 5000;

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    image.loading = 'eager';

    const done = () => resolve();
    image.addEventListener('load', done, { once: true });
    image.addEventListener('error', done, { once: true });
    window.setTimeout(done, IMAGE_WAIT_TIMEOUT_MS);
  });
}

/**
 * 打印前先把指法图全部加载完。
 *
 * 指法图默认按需加载，直接调用 window.print() 时，位于首屏之外的
 * 六孔指法图还没有发起请求，打印预览里就会是空白。
 */
export function PrintFingeringButton() {
  const [preparing, setPreparing] = useState(false);

  const handlePrint = useCallback(() => {
    if (preparing) return;

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(CARD_SELECTOR)
    );
    const pending = images.filter(
      (image) => !(image.complete && image.naturalWidth > 0)
    );

    // 图片都就绪时保持同步调用，Safari 在 await 之后会丢失用户手势、拒绝打开打印框。
    if (pending.length === 0) {
      window.print();
      return;
    }

    setPreparing(true);

    void Promise.all(pending.map(waitForImage))
      .then(
        () =>
          new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => resolve());
            });
          })
      )
      .then(() => window.print())
      .finally(() => setPreparing(false));
  }, [preparing]);

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 px-5"
      onClick={handlePrint}
      disabled={preparing}
    >
      <Printer className="h-4 w-4" />
      {preparing ? '正在准备打印…' : '打印这张指法表'}
    </Button>
  );
}
