"use client";

import { useState } from "react";

export default function Home() {
  const [sequence, setSequence] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyzeDNA() {
    if (!sequence.trim()) {
      setResult({
        error: "Please enter a DNA sequence first.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequence: sequence,
        }),
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      setResult({
        error: "Unable to analyze the sequence. Please check your API.",
      });
    }

    setLoading(false);
  }

  function clearSequence() {
    setSequence("");
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Background decoration */}
      <div className="fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-green-500/20">
              🧬
            </div>

            <div>
              <h1 className="font-bold text-lg">
                DNA Analyzer
              </h1>

              <p className="text-xs text-slate-400">
                Bioinformatics Platform
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-sm text-slate-400">
            <span className="px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
              ● API Ready
            </span>

            <span>Next.js</span>
            <span>•</span>
            <span>Bioinformatics</span>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-10">

        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-400 mb-6">
            <span>🧬</span>
            <span>Computational Biology Tool</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Analyze your
            <span className="text-green-400"> DNA sequence</span>
          </h2>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
            Explore nucleotide composition, GC and AT content, reverse
            complement, RNA transcription, and protein translation.
          </p>

        </div>

      </section>

      {/* Main analyzer */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Input panel */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-2xl">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="text-xl font-semibold">
                  DNA Sequence
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Enter a sequence containing A, T, G and C bases.
                </p>
              </div>

              <div className="hidden sm:block px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-400">
                FASTA compatible input
              </div>

            </div>

            <textarea
              className="w-full min-h-[260px] resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-green-300 font-mono text-sm leading-7 placeholder:text-slate-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10 transition"
              placeholder="Example:

ATGCGTACGTTAGC
GGCTAACGTTACG
ATGCCGTAGCTA"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">

              <div className="text-sm text-slate-500">
                {sequence.replace(/\s/g, "").length} bases entered
              </div>

              <div className="flex gap-3 w-full sm:w-auto">

                <button
                  onClick={clearSequence}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition"
                >
                  Clear
                </button>

                <button
                  onClick={analyzeDNA}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-green-500 text-slate-950 font-semibold hover:bg-green-400 transition disabled:bg-slate-700 disabled:text-slate-500"
                >
                  {loading ? "Analyzing..." : "Analyze Sequence →"}
                </button>

              </div>

            </div>

          </div>

          {/* Features panel */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8">

            <h3 className="text-xl font-semibold mb-2">
              Analysis Tools
            </h3>

            <p className="text-sm text-slate-400 mb-6">
              Your sequence will be processed using the following analyses.
            </p>

            <div className="space-y-3">

              <Feature icon="📊" title="Base Statistics" text="A, T, G and C counts" />

              <Feature icon="🧪" title="GC / AT Content" text="Nucleotide composition" />

              <Feature icon="🔄" title="Reverse Complement" text="Complementary DNA strand" />

              <Feature icon="🧬" title="RNA Transcription" text="DNA → RNA conversion" />

              <Feature icon="🔬" title="Protein Translation" text="RNA → amino acids" />

            </div>

          </div>

        </div>

      </section>

      {/* Results */}
      {result && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">

          {result.error ? (

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>

                <div>
                  <h3 className="font-semibold text-red-400">
                    Analysis Error
                  </h3>

                  <p className="text-sm text-red-300/80 mt-1">
                    {result.error}
                  </p>
                </div>
              </div>
            </div>

          ) : (

            <div className="space-y-6">

              {/* Results heading */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

                <div>
                  <div className="text-green-400 text-sm font-medium mb-2">
                    ✓ Analysis Complete
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold">
                    Analysis Results
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Sequence length: {result.length} bases
                  </p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  Valid DNA Sequence
                </div>

              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">

                <StatCard label="Length" value={result.length} unit="bp" />

                <StatCard label="Adenine" value={result.A} unit="A" />

                <StatCard label="Thymine" value={result.T} unit="T" />

                <StatCard label="Guanine" value={result.G} unit="G" />

                <StatCard label="Cytosine" value={result.C} unit="C" />

                <StatCard label="GC Content" value={result.GC} unit="%" />

                <StatCard label="AT Content" value={result.AT} unit="%" />

              </div>

              {/* Molecular results */}
              <div className="grid lg:grid-cols-2 gap-6">

                {/* Reverse complement */}
                <ResultBox
                  icon="🔄"
                  title="Reverse Complement"
                  description="Complementary antiparallel DNA sequence"
                  value={result.reverseComplement}
                />

                {/* RNA */}
                <ResultBox
                  icon="🧪"
                  title="RNA Transcription"
                  description="DNA → RNA"
                  value={result.RNA}
                />

              </div>

              {/* Protein */}
              <div className="rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-6 md:p-8">

                <div className="flex items-center gap-3 mb-5">

                  <div className="h-11 w-11 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
                    🧬
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      Protein Translation
                    </h3>

                    <p className="text-sm text-slate-400">
                      RNA → amino acid sequence
                    </p>
                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">

                  <p className="font-mono text-green-300 leading-8 break-words">
                    {result.protein}
                  </p>

                </div>

              </div>

              {/* Original sequence */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                <h3 className="font-semibold mb-3">
                  Original Sequence
                </h3>

                <div className="rounded-xl bg-slate-950/70 border border-white/5 p-4">
                  <p className="font-mono text-sm text-slate-300 break-all leading-7">
                    {result.sequence}
                  </p>
                </div>

              </div>

            </div>

          )}

        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>🧬</span>
            <span>DNA Sequence Analyzer</span>
          </div>

          <p className="text-sm text-slate-600">
            Built with Next.js • Bioinformatics • Computational Biology
          </p>

        </div>

      </footer>

    </main>
  );
}


/* Feature component */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition">

      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h4 className="font-medium text-slate-200">
          {title}
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          {text}
        </p>
      </div>

    </div>
  );
}


/* Statistics card */

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="flex items-baseline gap-1 mt-3">

        <span className="text-2xl font-bold text-white">
          {value}
        </span>

        <span className="text-sm text-green-400">
          {unit}
        </span>

      </div>

    </div>
  );
}


/* Result box */

function ResultBox({
  icon,
  title,
  description,
  value,
}: {
  icon: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">

      <div className="flex items-center gap-3 mb-5">

        <div className="h-11 w-11 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            {title}
          </h3>

          <p className="text-sm text-slate-500">
            {description}
          </p>
        </div>

      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-5">

        <p className="font-mono text-sm text-cyan-300 leading-7 break-all">
          {value}
        </p>

      </div>

    </div>
  );
}
