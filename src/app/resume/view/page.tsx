"use client";
import ResumeDoc from "../ResumeDoc";
import { productResume } from "../resumeData";

// The original themed résumé viewer (Claude / Notion / OpenAI / Plain + PDF),
// preserved here while /resume itself becomes the canvas builder.
export default function ResumeViewPage() {
  return <ResumeDoc data={productResume} variant="product" />;
}
