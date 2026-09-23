import type { SiteContent } from "@/lib/site/types";
import { withTheme } from "@/lib/site/types";

export function SiteView({ site }: { site: SiteContent }) {
  const t = withTheme(site.theme);
  const font =
    t.font === "serif"
      ? 'Georgia, "Times New Roman", serif'
      : 'Inter, system-ui, -apple-system, sans-serif';
  const wrap = {
    padding: `${t.sectionPad}px ${t.padX}px`,
    maxWidth: t.maxWidth,
    margin: "0 auto" as const,
  };
  const card = {
    background: t.surface,
    borderRadius: t.radius,
    padding: t.cardPad,
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  };

  return (
    <div
      style={{
        background: t.background,
        color: t.text,
        fontFamily: font,
        minHeight: "100%",
      }}
    >
      {site.sections.map((section) => {
        if (section.type === "hero") {
          const d = section.data;
          return (
            <section key={section.id} style={{ ...wrap, paddingTop: t.sectionPad + 24 }}>
              <p style={{ color: t.primary, fontWeight: 700, letterSpacing: "0.08em", fontSize: 12, textTransform: "uppercase" }}>
                {d.kicker}
              </p>
              <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", letterSpacing: "-0.04em", margin: "8px 0 16px", lineHeight: 1.05 }}>
                {d.title}
              </h1>
              <p style={{ color: t.muted, fontSize: 18, maxWidth: 520, lineHeight: 1.5 }}>{d.subtitle}</p>
              <a
                href="#contact"
                style={{
                  display: "inline-block",
                  marginTop: 24,
                  background: t.primary,
                  color: "#fff",
                  padding: "12px 18px",
                  borderRadius: t.buttonRadius,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {d.cta}
              </a>
            </section>
          );
        }
        if (section.type === "about") {
          const d = section.data;
          return (
            <section key={section.id} style={wrap}>
              <div style={card}>
                <h2 style={{ fontSize: 28, letterSpacing: "-0.03em", margin: "0 0 12px" }}>{d.title}</h2>
                <p style={{ color: t.muted, lineHeight: 1.6, margin: 0 }}>{d.body}</p>
              </div>
            </section>
          );
        }
        if (section.type === "services") {
          const d = section.data;
          return (
            <section key={section.id} style={wrap}>
              <h2 style={{ fontSize: 28, letterSpacing: "-0.03em", marginBottom: 16 }}>{d.title}</h2>
              <div style={{ display: "grid", gap: t.gap, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {d.items.map((item) => (
                  <article key={item.title} style={card}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{item.title}</h3>
                    <p style={{ color: t.muted, margin: 0, lineHeight: 1.5 }}>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        }
        if (section.type === "cta") {
          const d = section.data;
          return (
            <section key={section.id} style={wrap}>
              <div style={{ background: t.primary, color: "#fff", borderRadius: t.radius, padding: t.cardPad + 8 }}>
                <h2 style={{ fontSize: 28, margin: "0 0 8px" }}>{d.title}</h2>
                <p style={{ opacity: 0.9, margin: "0 0 16px" }}>{d.body}</p>
                <a href="#contact" style={{ color: "#fff", fontWeight: 700 }}>
                  {d.cta} →
                </a>
              </div>
            </section>
          );
        }
        if (section.type === "contact") {
          const d = section.data;
          return (
            <section id="contact" key={section.id} style={wrap}>
              <h2 style={{ fontSize: 28, letterSpacing: "-0.03em" }}>{d.title}</h2>
              <p style={{ color: t.muted }}>{d.area}</p>
              <p style={{ margin: "8px 0" }}>
                <a href={`mailto:${d.email}`} style={{ color: t.primary, fontWeight: 700 }}>
                  {d.email}
                </a>
              </p>
              <p>
                <a href={`tel:${d.phone}`} style={{ color: t.primary, fontWeight: 700 }}>
                  {d.phone}
                </a>
              </p>
            </section>
          );
        }
        return (
          <footer key={section.id} style={{ padding: t.padX, textAlign: "center", color: t.muted, fontSize: 13 }}>
            {section.data.note}
          </footer>
        );
      })}
    </div>
  );
}
