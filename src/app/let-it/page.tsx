import type { Metadata } from "next";
import LetIt from "./LetIt";

// /let-it — an anonymous one-in-one-out exchange: type or draw the thing you
// haven't said onto real paper, crumple it onto the table, and uncrumple a
// stranger's. The paper motion is real keyed footage.
export const metadata: Metadata = {
  title: "let it.",
  description:
    "Leave one note, read one note. Anonymous, unsigned, and nothing is stored.",
};

export default function LetItPage() {
  return <LetIt />;
}
