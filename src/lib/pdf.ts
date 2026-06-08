import { jsPDF } from "jspdf";
import type { AIResult } from "./curriculo-types";

const MARGIN = 50;
const PAGE_W = 595; // A4 pt
const PAGE_H = 842;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function generatePDF(r: AIResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  const ensure = (need: number) => {
    if (y + need > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeWrapped = (text: string, size: number, bold = false, gap = 4) => {
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    const lineH = size * 1.25;
    for (const ln of lines) {
      ensure(lineH);
      doc.text(ln, MARGIN, y);
      y += lineH;
    }
    y += gap;
  };

  const section = (title: string) => {
    ensure(40);
    y += 6;
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 4;
    doc.setLineWidth(0.7);
    doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
    y += 14;
  };

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text(r.name || "", MARGIN, y);
  y += 26;

  if (r.suggestedTitle) {
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    doc.text(r.suggestedTitle, MARGIN, y);
    y += 16;
  }

  const contactBits = [r.contacts.phone, r.contacts.email, r.contacts.link].filter(Boolean);
  if (contactBits.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text(contactBits.join("  •  "), MARGIN, y);
    y += 12;
  }
  y += 4;

  if (r.summary) {
    section("Summary");
    writeWrapped(r.summary, 11);
  }

  if (r.skills?.length) {
    section("Skills");
    writeWrapped(r.skills.join(" • "), 11);
  }

  if (r.workExperience?.length) {
    section("Work Experience");
    for (const w of r.workExperience) {
      writeWrapped(w.title, 11, true, 0);
      if (w.period) writeWrapped(w.period, 10, false, 2);
      for (const b of w.bullets) writeWrapped(`• ${b}`, 11, false, 2);
      y += 4;
    }
  }

  if (r.education?.length) {
    section("Education");
    for (const e of r.education) {
      writeWrapped(e.title, 11, true, 0);
      if (e.period) writeWrapped(e.period, 10, false, 2);
      if (e.description) writeWrapped(e.description, 11);
    }
  }

  if (r.certifications?.length) {
    section("Certifications");
    for (const c of r.certifications) {
      writeWrapped(c.title, 11, true, 0);
      if (c.period) writeWrapped(c.period, 10, false, 2);
      if (c.description) writeWrapped(c.description, 11);
    }
  }

  const filename = `Curriculo_${(r.name || "candidato").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
