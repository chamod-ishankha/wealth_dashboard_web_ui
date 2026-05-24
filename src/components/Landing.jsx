import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "./Brand";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Background Gradient - Subtle */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-200 opacity-15 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-slate-200 opacity-15 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Brand to="/" size="lg" />
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
        <section className="relative pt-16 pb-16 px-4 sm:pt-20 sm:pb-20">
        <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
            {/* Subtitle */}
            <span className="inline-block px-4 py-2 rounded-full border border-slate-300 bg-slate-100 text-slate-700 text-sm font-semibold">
              Personal Finance Made Simple
            </span>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight text-slate-950">
              Take Control of Your{" "}
              <span className="text-slate-600">Financial Future</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Track transactions, manage budgets, set financial goals, and achieve your dreams with an intuitive dashboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="text-sm text-slate-500 pt-4">
              🔒 Secure authentication • Your data is yours • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
        <section className="relative py-16 px-4 sm:py-20">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-950 mb-4">
              Powerful Features
            </h2>
            <p className="text-slate-600 text-lg">
              Everything you need to manage your finances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "📊",
                title: "Real-Time Dashboard",
                desc: "Monitor income, expenses, and savings at a glance",
              },
              {
                icon: "💳",
                title: "Smart Categories",
                desc: "Organize transactions by income, expense, or transfer",
              },
              {
                icon: "🎯",
                title: "Financial Goals",
                desc: "Track loans, savings, and goals with progress bars",
              },
              {
                icon: "📱",
                title: "Mobile Optimized",
                desc: "Manage finances on the go with responsive design",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-soft transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-950 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-16 px-4 sm:py-20 bg-slate-100/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-950 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Sign Up",
                desc: "Create your account in seconds. No credit card needed.",
              },
              {
                step: "2",
                title: "Log Transactions",
                desc: "Add income, expenses, and transfers with our simple form.",
              },
              {
                step: "3",
                title: "Track & Achieve",
                desc: "Monitor budgets, set goals, and watch your wealth grow.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-slate-950 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative py-16 px-4 sm:py-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { label: "Active Users", value: "1,000+" },
            { label: "Transactions Tracked", value: "50K+" },
            { label: "Financial Goals", value: "5K+" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-slate-200 bg-white"
            >
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {stat.value}
              </div>
              <p className="text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-16 px-4 sm:py-20 bg-slate-100/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-950 mb-4">
              What Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Freelancer",
                quote:
                  "Finally have a clear picture of my finances. The goal tracking changed how I plan.",
              },
              {
                name: "John K.",
                role: "Student",
                quote:
                  "Simple, beautiful, and actually useful. Way better than spreadsheets.",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200 bg-white"
              >
                <p className="text-slate-700 mb-4 text-sm">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-slate-950">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-16 px-4 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-12 rounded-2xl border border-slate-200 bg-white shadow-soft">
            <h2 className="text-4xl font-bold text-slate-950 mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Join thousands of users building their financial future today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                Start Your Journey
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
        <footer className="border-t border-slate-200 py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center text-slate-600">
          <p>&copy; 2026 Wealth Dashboard. All rights reserved.</p>
          <p className="text-sm mt-2">Secure • Private • Simple</p>
        </div>
      </footer>
    </div>
  );
}
