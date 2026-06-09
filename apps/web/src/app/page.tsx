import Link from "next/link";
import { ArrowRight, Sparkles, Users, BookOpen, BriefcaseIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-extrabold text-primary tracking-tight">Clara</div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/register" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
          <Sparkles size={14} />
          Built for women returning to tech
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary leading-tight tracking-tight mb-6">
          Your return to tech,<br />
          <span className="text-primary">on your terms.</span>
        </h1>

        <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Clara helps you find jobs near you, build your skills in 10-minute sessions,
          track every application, and connect with women who get it.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="btn-primary px-8 py-3 text-base flex items-center gap-2">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base">
            I already have an account
          </Link>
        </div>

        <p className="text-sm text-text-muted mt-4 font-medium">
          Free forever. No credit card needed.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <BriefcaseIcon size={22} className="text-primary" />,
              title: "Jobs near you",
              desc: "Live job listings filtered by your location, skills, and work preference.",
            },
            {
              icon: <BookOpen size={22} className="text-primary" />,
              title: "Learn in 10 minutes",
              desc: "AI-suggested courses matched to your skill gaps. Quizzes that fit into real life.",
            },
            {
              icon: <Sparkles size={22} className="text-primary" />,
              title: "CV tailored by AI",
              desc: "Paste a job description. Clara rewrites your CV to match — and reframes your career gap.",
            },
            {
              icon: <Users size={22} className="text-primary" />,
              title: "Women near you",
              desc: "Find study buddies, coffee chats, and women who understand the juggle.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-base text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-surface border-y border-border py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xl text-text-primary leading-relaxed mb-4 font-medium">
            Built with purpose, for women returning to tech and rediscovering what they're capable of.
          </p>
          <p>
             <p className="text-text-muted text-sm font-semibold">— Deepa, founder of Clara. Antwerp, Belgium</p>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
          Ready when you are.
        </h2>
        <p className="text-text-muted mb-8 font-medium">
          Start with 10 minutes. No pressure, no overwhelm. Just one next step.
        </p>
        <Link href="/register" className="btn-primary px-10 py-3 text-base inline-flex items-center gap-2">
          Create your free account <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-text-muted font-medium">
        <p>Clara — Made with care for women returning to tech — Antwerp</p>
      </footer>
    </main>
  );
}
