"use client";

import { useState, useMemo, memo } from "react";
import { useDebounce } from "@/components/performance-optimized";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScoreCard } from "@/components/score-card";
import { Search, Filter, ArrowUpDown, Music, ChevronLeft, ChevronRight } from "lucide-react";

interface Score {
  scoreId: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  settings: {
    keySignature: string;
    timeSignature: string;
  };
}

interface ScoreListClientProps {
  initialScores: Score[];
}

const ITEMS_PER_PAGE = 12;

const KEY_OPTIONS = [
  { value: "all", label: "全部调号" },
  { value: "C", label: "1=C" },
  { value: "G", label: "1=G" },
  { value: "D", label: "1=D" },
  { value: "A", label: "1=A" },
  { value: "E", label: "1=E" },
  { value: "F", label: "1=F" },
  { value: "Bb", label: "1=Bb" },
  { value: "Eb", label: "1=Eb" },
];

const TIME_OPTIONS = [
  { value: "all", label: "全部拍号" },
  { value: "4/4", label: "4/4" },
  { value: "3/4", label: "3/4" },
  { value: "2/4", label: "2/4" },
  { value: "6/8", label: "6/8" },
];

const SORT_OPTIONS = [
  { value: "updated_at", label: "最近更新" },
  { value: "created_at", label: "创建时间" },
  { value: "title", label: "标题" },
];

export const ScoreListClient = memo(function ScoreListClient({ initialScores }: ScoreListClientProps) {
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [searchQuery, setSearchQuery] = useState("");
  const [keyFilter, setKeyFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_at");
  const [currentPage, setCurrentPage] = useState(1);

  // 防抖搜索优化
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 筛选和排序 - 使用防抖搜索
  const filteredAndSortedScores = useMemo(() => {
    const filtered = scores.filter((score) => {
      const matchesSearch = score.title
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());
      const matchesKey =
        keyFilter === "all" || score.settings.keySignature === keyFilter;
      const matchesTime =
        timeFilter === "all" || score.settings.timeSignature === timeFilter;
      return matchesSearch && matchesKey && matchesTime;
    });

    filtered.sort((a, b) => {
      if (sortBy === "updated_at")
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "created_at")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title, "zh-CN");
      return 0;
    });

    return filtered;
  }, [scores, debouncedSearchQuery, keyFilter, timeFilter, sortBy]);

  // 分页
  const totalPages = Math.ceil(filteredAndSortedScores.length / ITEMS_PER_PAGE);
  const paginatedScores = filteredAndSortedScores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 删除乐谱（乐观更新）
  const handleDelete = (scoreId: string) => {
    setScores((prev) => prev.filter((s) => s.scoreId !== scoreId));
  };

  // 重置到第一页当筛选条件改变时
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // 空状态
  if (scores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="rounded-full bg-muted p-6">
          <Music className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">还没有创建任何乐谱</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            开始创作你的第一首数字简谱，体验便捷的陶笛指法谱生成功能
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/protected/scores/new">创建第一个乐谱</Link>
        </Button>
      </div>
    );
  }

  // 筛选后无结果
  if (filteredAndSortedScores.length === 0) {
    return (
      <div className="space-y-6">
        {/* 筛选控件 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索乐谱标题..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {KEY_OPTIONS.find((k) => k.value === keyFilter)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {KEY_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleFilterChange(setKeyFilter, option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {TIME_OPTIONS.find((t) => t.value === timeFilter)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {TIME_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleFilterChange(setTimeFilter, option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-muted-foreground">未找到匹配的乐谱</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setKeyFilter("all");
              setTimeFilter("all");
              setCurrentPage(1);
            }}
          >
            清除筛选条件
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 筛选控件 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索乐谱标题..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {KEY_OPTIONS.find((k) => k.value === keyFilter)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {KEY_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterChange(setKeyFilter, option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {TIME_OPTIONS.find((t) => t.value === timeFilter)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {TIME_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterChange(setTimeFilter, option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 结果数量 */}
      <div className="text-sm text-muted-foreground">
        共找到 {filteredAndSortedScores.length} 个乐谱
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedScores.map((score) => (
          <ScoreCard
            key={score.scoreId}
            scoreId={score.scoreId}
            title={score.title}
            keySignature={score.settings.keySignature}
            timeSignature={score.settings.timeSignature}
            updatedAt={score.updatedAt}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // 显示当前页和相邻页
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, index, array) => {
                // 添加省略号
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                );
              })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
});

