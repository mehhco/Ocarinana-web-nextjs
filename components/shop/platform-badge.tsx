"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: 'taobao' | 'tmall' | 'jd' | 'pdd';
  className?: string;
}

const platformConfig = {
  taobao: {
    label: '淘宝',
    className: 'bg-[#FF6A00] text-white border-[#FF6A00]',
  },
  tmall: {
    label: '天猫',
    className: 'bg-[#FF0036] text-white border-[#FF0036]',
  },
  jd: {
    label: '京东',
    className: 'bg-[#E1251B] text-white border-[#E1251B]',
  },
  pdd: {
    label: '拼多多',
    className: 'bg-[#FF5000] text-white border-[#FF5000]',
  },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = platformConfig[platform];
  
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

