/** Shared iOS-inspired styles for generated business apps. */
export const appShellCss = `
:root {
  --bg: #f2f2f7;
  --card: #ffffff;
  --ink: #1c1c1e;
  --muted: #8e8e93;
  --line: rgba(60, 60, 67, 0.12);
  --blue: #007aff;
  --green: #34c759;
  --orange: #ff9f0a;
  --red: #ff3b30;
  --shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
  --radius: 18px;
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
.app { max-width: 430px; margin: 0 auto; min-height: 100vh; padding: 20px 16px 40px; }
.topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.kicker { color: var(--muted); font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
h1 { font-size: 28px; letter-spacing: -0.03em; margin: 0; }
.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
  margin-bottom: 12px;
}
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.muted { color: var(--muted); font-size: 13px; }
.btn {
  appearance: none; border: 0; border-radius: 12px;
  background: var(--blue); color: #fff; font-weight: 600;
  padding: 10px 14px; font-size: 14px; cursor: pointer;
}
.btn.ghost { background: rgba(0,122,255,0.12); color: var(--blue); }
.btn.warn { background: var(--orange); }
.btn.danger { background: var(--red); }
.btn.small { padding: 6px 10px; font-size: 12px; border-radius: 10px; }
input, select, textarea {
  width: 100%; border: 1px solid var(--line); border-radius: 12px;
  padding: 10px 12px; font: inherit; background: #fff;
}
label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin: 0 0 6px; }
.field { margin-bottom: 12px; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 600;
  background: rgba(52,199,89,0.12); color: #248a3d;
}
.pill.hold { background: rgba(255,159,10,0.16); color: #9a6700; }
.pill.done { background: rgba(0,122,255,0.12); color: var(--blue); }
.list { display: flex; flex-direction: column; gap: 10px; }
.search { margin-bottom: 14px; }
.empty { text-align: center; color: var(--muted); padding: 28px 8px; }
`;
