import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "乐谱广场 - Ocarinana",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GuestScoreLimitPage() {
  redirect("/scores");
}
