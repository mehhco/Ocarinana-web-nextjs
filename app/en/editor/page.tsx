import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingLink } from "@/components/pending-link";
import { ScoreEditor } from "@/components/editor/core/ScoreEditor";
import { DEFAULT_PRODUCER, DEFAULT_SETTINGS } from "@/components/editor/lib/constants";
import type { InstrumentType } from "@/lib/editor/types";

export const metadata: Metadata = {
  title: "Free Ocarina Sheet Music Editor — Ocarinana",
  description:
    "Try the Ocarinana ocarina sheet music editor without signing up. Choose 6-hole or 12-hole, write numbered notation, and export a PNG with fingering diagrams.",
  robots: {
    index: false,
    follow: false,
  },
};

interface EnglishEditorPageProps {
  searchParams: Promise<{ instrument?: string }>;
}

const INSTRUMENTS: Array<{
  value: InstrumentType;
  title: string;
  description: string;
  action: string;
}> = [
  {
    value: "12-hole",
    title: "12-hole ocarina",
    description:
      "Wider range and the most complete set of notes — suits full melodies, pop songs and soundtrack pieces.",
    action: "Start with 12-hole",
  },
  {
    value: "6-hole",
    title: "6-hole ocarina",
    description:
      "Smaller range, ideal for short melodies, children's songs and beginner exercises.",
    action: "Start with 6-hole",
  },
];

function isInstrumentType(value: string | undefined): value is InstrumentType {
  return value === "12-hole" || value === "6-hole";
}

function createGuestDocument(instrumentType: InstrumentType) {
  const now = new Date().toISOString();

  return {
    version: "2.0",
    scoreId: `guest-${instrumentType}`,
    title: "Untitled score",
    producer: DEFAULT_PRODUCER,
    lyricist: "",
    composer: "",
    additionalInfo: "",
    measures: [{ id: "measure-1", elements: [] }],
    ties: [],
    beams: [],
    expressions: [],
    lyrics: [],
    sections: [],
    playbackOrder: [],
    settings: {
      ...DEFAULT_SETTINGS,
      instrumentType,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export default async function EnglishEditorPage({ searchParams }: EnglishEditorPageProps) {
  const params = await searchParams;
  const instrumentType = isInstrumentType(params.instrument) ? params.instrument : null;

  if (!instrumentType) {
    return (
      <div lang="en">
        <main className="min-h-screen bg-slate-50 px-5 py-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <div>
              <Link href="/en" className="text-sm font-semibold text-emerald-700">
                Ocarinana
              </Link>
              <h1 className="mt-6 text-2xl font-bold tracking-normal text-slate-900">
                Choose your ocarina type
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The ocarina type is locked once you enter the editor. 6-hole and 12-hole ocarinas
                use different ranges and fingering diagrams.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {INSTRUMENTS.map((option) => (
                <Card key={option.value} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="min-h-12 text-sm leading-6 text-slate-600">
                      {option.description}
                    </p>
                    <Button asChild className="w-full">
                      <PendingLink
                        href={`/en/editor?instrument=${option.value}`}
                        pendingText="Opening…"
                        showPendingSpinner
                      >
                        {option.action}
                      </PendingLink>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div lang="en">
      <main className="flex h-screen h-dvh min-h-0 w-full flex-col overflow-hidden bg-slate-50">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
          <Link href="/en" className="text-sm font-semibold text-emerald-700">
            Ocarinana
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              Trial mode: you can export images right away. Sign in to save scores to the cloud.
            </span>
            <Button asChild size="sm" variant="outline">
              <PendingLink href="/auth/login" pendingText="Opening…" showPendingSpinner>
                Sign in to save
              </PendingLink>
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ScoreEditor
            initialDocument={createGuestDocument(instrumentType)}
            backHref="/en"
            locale="en"
          />
        </div>
      </main>
    </div>
  );
}
