import { cn } from "@/lib/utils";

export type JianpuOctave = "low" | "basic" | "high";

interface JianpuNoteProps {
  /** 简谱数字，含升降号时直接写成 ♭7 / ♯6 */
  degree: string;
  /** 高低音点位置 */
  octave?: JianpuOctave;
  /** 无障碍读法，默认按「高音 1 / 低音 1」生成 */
  ariaLabel?: string;
  className?: string;
}

const OCTAVE_PREFIX: Record<JianpuOctave, string> = {
  low: "低音",
  basic: "",
  high: "高音",
};

/**
 * 简谱音级。
 *
 * 不使用「1̇ / 1̣」这类组合附加符号：很多中文字体缺少对应字形，
 * 点会偏到数字右侧、大小不一致，在部分安卓机型上甚至会丢失。
 * 这里用固定尺寸的圆点自己排版，高低音点的位置和大小不受字体影响。
 */
export function JianpuNote({
  degree,
  octave = "basic",
  ariaLabel,
  className,
}: JianpuNoteProps) {
  const accessibleLabel =
    ariaLabel ?? `${OCTAVE_PREFIX[octave]} ${degree}`.trim();

  return (
    <span
      role="img"
      aria-label={accessibleLabel}
      className={cn(
        "relative inline-block leading-none tabular-nums align-middle",
        className
      )}
    >
      {octave === "high" && (
        <span
          aria-hidden="true"
          className="jianpu-dot absolute bottom-full left-1/2 mb-[0.08em] h-[0.2em] w-[0.2em] min-h-[2.5px] min-w-[2.5px] -translate-x-1/2 rounded-full bg-current"
        />
      )}
      <span aria-hidden="true" className="block">
        {degree}
      </span>
      {octave === "low" && (
        <span
          aria-hidden="true"
          className="jianpu-dot absolute top-full left-1/2 mt-[0.08em] h-[0.2em] w-[0.2em] min-h-[2.5px] min-w-[2.5px] -translate-x-1/2 rounded-full bg-current"
        />
      )}
    </span>
  );
}
