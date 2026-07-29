import type { Metadata } from "next";
import DeadLetters from "./DeadLetters";

// /dead-letters — an anonymous one-in-one-out exchange: type or draw the thing you
// haven't said onto real paper, crumple it onto the table, and uncrumple a
// stranger's. The paper motion is real keyed footage.
export const metadata: Metadata = {
  title: "Dead Letters",
  description:
    "Leave one note, read one note. Anonymous, unsigned, and nothing is stored.",
};

export default function DeadLettersPage() {
  return <DeadLetters />;
}
