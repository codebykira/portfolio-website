"use client";
import ResumeDoc from "../ResumeDoc";
import { deployResume } from "../resumeData";

export default function AiResumePage() {
  return <ResumeDoc data={deployResume} variant="ai" />;
}
