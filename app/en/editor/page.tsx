import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingLink } from "@/components/pending-link";
import { ScoreEditor } from "@/components/editor/core/ScoreEditor";
import { DEFAULT_PRODUCER, DEFAULT_SETTINGS } from "@/components/editor/lib/constants";
import { createClient } from "@/lib/supabase/server";
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
  searchParams: Promise<{ instrument?: string; save?: string }>;
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
              <p className="mt-1 text-sm leading-6 text-slate-500">
                No account needed to try it: whatever you write is autosaved in this browser, and
                you can save it to the cloud after signing in.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
              {INSTRUMENTS.map((option) => (
                <Card key={option.value} className="flex h-full flex-col border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="text-sm leading-6 text-slate-600">{option.description}</p>
                    <Button asChild className="mt-auto w-full">
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user);
  const shouldAutoSaveDraft = isSignedIn && params.save === "1";
  const loginNextPath = `/en/editor?instrument=${instrumentType}&save=1`;

  return (
    <div lang="en">
      <main className="flex h-screen h-dvh min-h-0 w-full flex-col overflow-hidden bg-slate-50">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
          <Link href="/en" className="text-sm font-semibold text-emerald-700">
            Ocarinana
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {isSignedIn
                ? "Signed in: “Save to cloud” stores the score under My scores"
                : "Your edits are autosaved in this browser — nothing is lost. Sign in to store scores in the cloud."}
            </span>
            {isSignedIn ? (
              <Button asChild size="sm" variant="outline">
                <PendingLink href="/protected/me/scores" pendingText="Opening…" showPendingSpinner>
                  My scores
                </PendingLink>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline">
                <PendingLink
                  href={`/auth/login?next=${encodeURIComponent(loginNextPath)}`}
                  pendingText="Opening…"
                  showPendingSpinner
                >
                  Sign in to save
                </PendingLink>
              </Button>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ScoreEditor
            key={instrumentType}
            initialDocument={createGuestDocument(instrumentType)}
            backHref="/en"
            locale="en"
            guestMode={!isSignedIn}
            restoreGuestDraft
            allowCloudCreate={isSignedIn}
            autoSaveGuestDraftOnLoad={shouldAutoSaveDraft}
          />
        </div>
      </main>
    </div>
  );
}
