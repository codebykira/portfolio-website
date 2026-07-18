"use client";
import ResumeDoc from "./ResumeDoc";
import { productResume } from "./resumeData";

export default function ResumePage() {
  return <ResumeDoc data={productResume} variant="product" />;
}
