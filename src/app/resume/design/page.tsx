"use client";
import ResumeDoc from "../ResumeDoc";
import { designResume } from "../resumeData";

export default function DesignResumePage() {
  return <ResumeDoc data={designResume} variant="design" />;
}
