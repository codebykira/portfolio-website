import {
  MapPin,
  Globe,
  LinkedinLogo,
  XLogo,
  EnvelopeSimple,
  Phone,
  GithubLogo,
  type Icon,
} from "@phosphor-icons/react";
import type { Resume } from "./resumeData";
import type { ParsedResume } from "./parsedResume";

/* Map a parsed contact `type` back to the Phosphor icon the sheet renders. */
const CONTACT_ICONS: Record<string, Icon> = {
  location: MapPin,
  website: Globe,
  linkedin: LinkedinLogo,
  x: XLogo,
  email: EnvelopeSimple,
  phone: Phone,
  github: GithubLogo,
  other: Globe,
};

/* Adapt the wire-safe ParsedResume into the `Resume` the sheet renders. */
export function parsedToResume(parsed: ParsedResume): Resume {
  return {
    name: parsed.name,
    contact: parsed.contact.map((c) => ({
      text: c.text,
      href: c.href,
      icon: CONTACT_ICONS[c.type] ?? Globe,
    })),
    summary: parsed.summary,
    experience: parsed.experience.map((e) => ({
      org: e.org,
      role: e.role,
      date: e.date,
      tagline: e.tagline,
      points: e.points,
    })),
    education: parsed.education,
    awards: parsed.awards,
    skills: parsed.skills,
    sections: parsed.sections?.map((s) => ({
      title: s.title,
      entries: s.entries.map((e) => ({
        org: e.org,
        role: e.role,
        date: e.date,
        tagline: e.tagline,
        points: e.points,
      })),
    })),
  };
}
