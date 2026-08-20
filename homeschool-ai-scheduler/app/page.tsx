import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-xl text-gray-900">HomeschoolAI</span>
        </div>
        <Link
          href="/schedule"
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>✨</span> AI-Powered Homeschool Planning
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Plan your homeschool year{" "}
          <span className="text-amber-500">in minutes</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Input your children&apos;s grades, curricula, and schedule
          constraints. Our AI generates a personalized weekly pacing guide so
          you can focus on teaching — not planning.
        </p>
        <Link
          href="/schedule"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg shadow-amber-200 transition-all hover:scale-105"
        >
          Generate Schedule →
        </Link>
        <p className="mt-4 text-sm text-gray-400">
          Free to try · No account required
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          {
            icon: "🎓",
            title: "Multi-Grade Support",
            desc: "Handle multiple children across different grade levels in a single schedule.",
          },
          {
            icon: "📖",
            title: "Popular Curricula",
            desc: "Works with Math Mammoth, Story of the World, Well-Trained Mind, and more.",
          },
          {
            icon: "🗓️",
            title: "Flexible Constraints",
            desc: "Set your school days, daily hours, and break periods. The AI adapts to your life.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                label: "Enter your details",
                desc: "Grades, subjects, curricula, weekly hours, and start date.",
              },
              {
                step: "2",
                label: "AI generates a plan",
                desc: "Our AI maps lessons to weeks based on your exact constraints.",
              },
              {
                step: "3",
                label: "Download & teach",
                desc: "Get a printable, week-by-week pacing guide ready to use.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl flex items-center justify-center mb-4">
                  {s.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{s.label}</h4>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to simplify your homeschool planning?
        </h2>
        <p className="text-gray-500 mb-8">
          Spend less time planning and more time teaching.
        </p>
        <Link
          href="/schedule"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors"
        >
          Generate My Schedule →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} HomeschoolAI Scheduler · Built with
        Next.js + AI
      </footer>
    </main>
  );
}
