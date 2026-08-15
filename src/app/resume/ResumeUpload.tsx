"use client";
import { useEffect, useRef, useState } from "react";
import { UploadSimple, SpinnerGap, ArrowCounterClockwise, Warning } from "@phosphor-icons/react";
import type { Resume } from "./resumeData";
import { parsedResumeSchema } from "./parsedResume";
import { parsedToResume } from "./parsedToResume";

interface ResumeUploadProps {
  /** Called with the parsed résumé when an upload succeeds. */
  onParsed: (resume: Resume) => void;
  /** Whether an uploaded résumé is currently being shown. */
  hasOverride: boolean;
  /** Restore Kira's original résumé. */
  onReset: () => void;
}

type Status = "idle" | "loading" | "error";

const ACCEPT = ".pdf,.docx,application/pdf," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Hover-to-upload overlay for the "plain" style. Drop (or pick) a PDF/DOCX
 * résumé; it's parsed server-side and re-rendered in this template. The layer
 * itself is pointer-events:none so it never blocks reading — only its controls
 * and the drag/loading scrim capture events.
 */
export default function ResumeUpload({ onParsed, hasOverride, onReset }: ResumeUploadProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("loading");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Couldn't parse that résumé.");
      }
      const parsed = parsedResumeSchema.safeParse(data?.resume);
      if (!parsed.success) {
        throw new Error("Couldn't read that résumé. Please try another file.");
      }
      onParsed(parsedToResume(parsed.data));
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  // Window-level drag-and-drop so dropping anywhere on the page works, without
  // putting a pointer-capturing layer over the résumé text.
  useEffect(() => {
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragging(true);
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const openPicker = () => inputRef.current?.click();

  const showScrim = dragging || status === "loading" || status === "error";

  return (
    <div className="resume-upload">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // allow re-uploading the same file
        }}
      />

      {/* Centered drop-zone prompt — shown until a résumé is uploaded, over the
          blurred original. Clicking anywhere on it opens the file picker. */}
      {!hasOverride && (
        <button type="button" className="resume-upload-prompt" onClick={openPicker}>
          <span className="resume-upload-ring" aria-hidden />
          <UploadSimple size={34} weight="bold" aria-hidden />
          <span className="resume-upload-prompt-title">Drop your résumé to restyle it</span>
          <span className="resume-upload-prompt-sub">
            Drag a PDF or DOCX here, or click to pick a file
          </span>
        </button>
      )}

      {hasOverride && (
        <button type="button" className="resume-upload-reset" onClick={onReset}>
          <ArrowCounterClockwise size={13} weight="bold" aria-hidden />
          Kira&rsquo;s résumé
        </button>
      )}

      {/* Drag / loading / error scrim */}
      {showScrim && (
        <div className="resume-upload-scrim">
          {status === "loading" ? (
            <>
              <SpinnerGap size={30} weight="bold" className="resume-upload-spin" aria-hidden />
              <p className="resume-upload-title">Reading your résumé…</p>
              <p className="resume-upload-sub">Parsing the words and restyling</p>
            </>
          ) : status === "error" ? (
            <>
              <Warning size={28} weight="fill" aria-hidden style={{ color: "#DC2626" }} />
              <p className="resume-upload-title">{error}</p>
              <button type="button" className="resume-upload-retry" onClick={openPicker}>
                Try another file
              </button>
            </>
          ) : (
            <>
              <UploadSimple size={30} weight="bold" aria-hidden />
              <p className="resume-upload-title">Drop to restyle</p>
              <p className="resume-upload-sub">PDF or DOCX</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
