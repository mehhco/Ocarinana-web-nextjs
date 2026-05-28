import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InfoIcon } from '@/components/ui/icons';

interface UpgradePromptProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function UpgradePrompt({
  title,
  description,
  actionLabel = '查看 Plus 权益',
}: UpgradePromptProps) {
  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <InfoIcon className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
          <div>
            <h2 className="font-semibold text-amber-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">{description}</p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/protected/me/plus">{actionLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
