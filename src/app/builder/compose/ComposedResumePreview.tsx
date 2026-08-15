"use client";

import type { ParsedResume } from "@/app/resume/parsedResume";

/** A clean, print-friendly preview of a composed résumé (ParsedResume shape). */
export default function ComposedResumePreview({ data }: { data: ParsedResume }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white text-neutral-900 shadow-lg">
      <div className="mx-auto max-w-[820px] px-10 py-10">
        <h2 className="text-center text-2xl font-extrabold">{data.name}</h2>
        {data.contact?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[12px] text-neutral-600">
            {data.contact.map((c, i) => (
              <span key={i}>
                {c.href ? (
                  <a href={c.href} className="underline" target="_blank" rel="noreferrer">
                    {c.text}
                  </a>
                ) : (
                  c.text
                )}
              </span>
            ))}
          </div>
        )}
        {data.summary && <p className="mt-3 text-center text-[13px] leading-relaxed">{data.summary}</p>}

        {data.experience?.length > 0 && (
          <Section title="Experience">
            {data.experience.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-[14px] font-bold">
                    {e.org}
                    {e.role ? <span className="font-normal">, {e.role}</span> : null}
                  </h4>
                  <span className="shrink-0 text-[12px] text-neutral-500">{e.date}</span>
                </div>
                {e.tagline && <p className="text-[12px] italic text-neutral-600">{e.tagline}</p>}
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[12.5px] leading-relaxed">
                  {e.points.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {data.education?.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i) => (
              <div key={i} className="mb-2 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-semibold">{e.org}</p>
                  <p className="text-[12px] text-neutral-600">{e.detail}</p>
                </div>
                <span className="shrink-0 text-[12px] text-neutral-500">{e.date}</span>
              </div>
            ))}
          </Section>
        )}

        {data.awards?.length > 0 && (
          <Section title="Awards & Leadership">
            {data.awards.map((a, i) => (
              <div key={i} className="mb-1.5 text-[12.5px]">
                <span className="font-semibold">{a.title}:</span> {a.detail}
                {a.date ? <span className="text-neutral-500"> ({a.date})</span> : null}
              </div>
            ))}
          </Section>
        )}

        {data.skills?.length > 0 && (
          <Section title="Skills">
            <div className="space-y-1 text-[12.5px]">
              {data.skills.map((g, i) => (
                <p key={i}>
                  <span className="font-semibold">{g.group}:</span> {g.items.join(" · ")}
                </p>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 border-b border-neutral-300 pb-1 text-[13px] font-extrabold uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}
