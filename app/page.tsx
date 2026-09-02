"use client";

import { useState } from "react";
import Papa from "papaparse";

type DNAResult = {
  sequence?: string;
  length?: number;

  A?: number;
  T?: number;
  G?: number;
  C?: number;

  num_A?: number;
  num_T?: number;
  num_G?: number;
  num_C?: number;

  GC?: number;
  AT?: number;

  gc_content?: number;
  at_content?: number;

  kmer_3_freq?: Record<string, number>;

  reverseComplement?: string;
  RNA?: string;
  protein?: string;

  error?: string;
};

type CSVRow = {
  sampleID?: string;
  sample_id?: string;
  sample_name?: string;
  sequence?: string;

  [key: string]: string | undefined;
};

type CSVResult = {
  sampleID: string;
  sequence: string;

  GC: number | string;
  AT: number | string;

  length: number | string;

  num_A: number | string;
  num_T: number | string;
  num_C: number | string;
  num_G: number | string;

  kmer_3_frequency: Record<string, number>;

  error?: string;
};

export default function Home() {
  // =====================================================
  // SINGLE DNA ANALYSIS
  // =====================================================

  const [sequence, setSequence] = useState("");
  const [result, setResult] =
    useState<DNAResult | null>(null);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // CSV
  // =====================================================

  const [csvData, setCsvData] =
    useState<CSVRow[]>([]);

  const [csvFileName, setCsvFileName] =
    useState("");

  const [csvResults, setCsvResults] =
    useState<CSVResult[]>([]);

  const [csvAnalyzing, setCsvAnalyzing] =
    useState(false);

  // =====================================================
  // SINGLE DNA ANALYSIS
  // =====================================================

  async function analyzeDNA() {
    if (!sequence.trim()) {
      setResult({
        error:
          "Please enter a DNA sequence first.",
      });

      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            sequence: sequence,
          }),
        }
      );

      const data: DNAResult =
        await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        error:
          "Unable to analyze the sequence. Please check your API.",
      });
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CLEAR SINGLE DNA
  // =====================================================

  function clearSequence() {
    setSequence("");
    setResult(null);
  }

  // =====================================================
  // CSV UPLOAD
  // =====================================================

  function handleCSVUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvFileName(file.name);
    setCsvData([]);
    setCsvResults([]);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,

      transformHeader: (
        header: string
      ) => header.trim(),

      complete: (results) => {
        console.log(
          "Uploaded CSV:",
          results.data
        );

        // ---------------------------------------------
        // Check whether sequence column exists
        // ---------------------------------------------

        const firstRow =
          results.data[0];

        if (!firstRow) {
          alert(
            "The CSV file is empty."
          );

          return;
        }

        const hasSequenceColumn =
          Object.keys(firstRow).some(
            (key) =>
              key.toLowerCase() ===
              "sequence"
          );

        if (!hasSequenceColumn) {
          alert(
            "The CSV must contain a column named 'sequence'."
          );

          return;
        }

        // ---------------------------------------------
        // Normalize rows
        // ---------------------------------------------

        const normalizedRows =
          results.data.map(
            (row, index) => {
              const sequenceKey =
                Object.keys(row).find(
                  (key) =>
                    key.toLowerCase() ===
                    "sequence"
                );

              const sampleKey =
                Object.keys(row).find(
                  (key) =>
                    key.toLowerCase() ===
                      "sampleid" ||
                    key.toLowerCase() ===
                      "sample_id" ||
                    key.toLowerCase() ===
                      "sample_name"
                );

              const dna =
                sequenceKey
                  ? String(
                      row[sequenceKey] ||
                        ""
                    ).trim()
                  : "";

              const sample =
                sampleKey
                  ? String(
                      row[sampleKey] ||
                        ""
                    ).trim()
                  : "";

              return {
                sampleID:
                  sample ||
                  `Sample${index + 1}`,

                sequence: dna,
              };
            }
          );

        // ---------------------------------------------
        // Remove empty rows
        // ---------------------------------------------

        const validRows =
          normalizedRows.filter(
            (row) =>
              row.sequence.length > 0
          );

        if (
          validRows.length === 0
        ) {
          alert(
            "No DNA sequences were found in the CSV."
          );

          return;
        }

        setCsvData(validRows);
      },

      error: (error) => {
        console.error(
          "CSV parsing error:",
          error
        );

        alert(
          "There was a problem reading the CSV file."
        );
      },
    });
  }

  // =====================================================
  // ANALYZE CSV
  // =====================================================

 async function analyzeCSV() {
  if (csvData.length === 0) {
    alert("Please upload a CSV file first.");
    return;
  }

  setCsvAnalyzing(true);
  setCsvResults([]);

  try {
    const results: CSVResult[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      const sampleID = row.sampleID || `Sample${i + 1}`;
      const dnaSequence =
        row.sequence?.toUpperCase().replace(/\s/g, "").trim() || "";

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequence: dnaSequence,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      results.push({
        sampleID,
        sequence: dnaSequence,
        length: data.length,
        gc_content: data.gc_content,
        at_content: data.at_content,
        a: data.a,
        t: data.t,
        g: data.g,
        c: data.c,
      });
    }

    setCsvResults(results);
  } catch (error) {
    console.error("CSV Analysis Error:", error);
    alert("Failed to analyze CSV.");
  } finally {
    setCsvAnalyzing(false);
  }
}
      // ---------------------------------------------
      // Empty sequence
      // ---------------------------------------------

      if (!dnaSequence) {
        results.push({
          sampleID,
          sequence: "",
          GC: "—",
          AT: "—",
          length: "—",
          num_A: "—",
          num_T: "—",
          num_C: "—",
          num_G: "—",
          kmer_3_frequency: {},
          error:
            "No DNA sequence found.",
        });

        continue;
      }

      try {
        const response =
          await fetch(
            "/api/analyze",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                sequence:
                  dnaSequence,
              }),
            }
          );

        const data: DNAResult =
          await response.json();

        // ---------------------------------------------
        // API ERROR
        // ---------------------------------------------

        if (
          !response.ok ||
          data.error
        ) {
          results.push({
            sampleID,
            sequence:
              dnaSequence,
            GC: "—",
            AT: "—",
            length: "—",
            num_A: "—",
            num_T: "—",
            num_C: "—",
            num_G: "—",
            kmer_3_frequency: {},
            error:
              data.error ||
              "Unable to analyze sequence.",
          });

          continue;
        }

        // ---------------------------------------------
        // Get base counts
        // ---------------------------------------------

        const num_A =
          data.num_A ??
          data.A ??
          0;

        const num_T =
          data.num_T ??
          data.T ??
          0;

        const num_C =
          data.num_C ??
          data.C ??
          0;

        const num_G =
          data.num_G ??
          data.G ??
          0;

        // ---------------------------------------------
        // Get GC / AT
        // ---------------------------------------------

        const GC =
          data.gc_content ??
          data.GC ??
          0;

        const AT =
          data.at_content ??
          data.AT ??
          0;

        // ---------------------------------------------
        // Store CSV result
        // ---------------------------------------------

        results.push({
          sampleID,

          sequence:
            data.sequence ||
            dnaSequence,

          GC,

          AT,

          length:
            data.length ??
            dnaSequence.length,

          num_A,

          num_T,

          num_C,

          num_G,

          kmer_3_frequency:
            data.kmer_3_freq ||
            {},
        });
      } catch (error) {
        console.error(
          `Error analyzing ${sampleID}:`,
          error
        );

        results.push({
          sampleID,
          sequence:
            dnaSequence,
          GC: "—",
          AT: "—",
          length: "—",
          num_A: "—",
          num_T: "—",
          num_C: "—",
          num_G: "—",
          kmer_3_frequency: {},
          error:
            "Unable to analyze this sequence.",
        });
      }
    }

    setCsvResults(results);
    setCsvAnalyzing(false);
  }

  // =====================================================
  // FORMAT K-MER
  // =====================================================

  function formatKmer(
    kmer: Record<string, number>
  ) {
    const entries =
      Object.entries(kmer);

    if (entries.length === 0) {
      return "—";
    }

    return entries
      .map(
        ([key, value]) =>
          `${key}: ${value}`
      )
      .join(", ");
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-2xl shadow-lg">
              🧬
            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                DNA Analyzer
              </h1>

              <p className="text-sm text-slate-500">
                Bioinformatics Platform
              </p>

            </div>

          </div>

          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">

            <a
              href="#"
              className="hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#analysis"
              className="hover:text-blue-600"
            >
              Analysis
            </a>

            <a
              href="#batch"
              className="hover:text-blue-600"
            >
              CSV Analysis
            </a>

            <a
              href="#about"
              className="hover:text-blue-600"
            >
              About
            </a>

          </nav>

          <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            ● API Ready
          </div>

        </div>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          <div>

            <div className="mb-5 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              Computational Biology
            </div>

            <h2 className="text-5xl font-black leading-tight text-slate-900 md:text-6xl">

              DNA Sequence

              <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Analyzer
              </span>

            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">

              Analyze nucleotide composition,
              GC and AT content, sequence
              length and k-mer frequencies
              using a simple bioinformatics
              workflow.

            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={() =>
                  document
                    .getElementById(
                      "analysis"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 font-semibold text-white shadow-lg transition hover:scale-105"
              >
                Start Analysis →
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById(
                      "batch"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Upload CSV
              </button>

            </div>

          </div>

          <div className="flex justify-center">

  <div className="dna-container">

    <div className="dna-glow"></div>

    <div className="dna">

      <div className="dna-strand dna-strand-left"></div>

      <div className="dna-strand dna-strand-right"></div>

      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>
      <div className="dna-base"></div>

    </div>

    <div className="dna-label dna-label-a">
      A
    </div>

    <div className="dna-label dna-label-t">
      T
    </div>

    <div className="dna-label dna-label-g">
      G
    </div>

    <div className="dna-label dna-label-c">
      C
    </div>

  </div>

</div>

        </div>

      </section>

      {/* =================================================
          SINGLE DNA ANALYSIS
      ================================================= */}

      <section
        id="analysis"
        className="mx-auto max-w-7xl px-6"
      >

        <div className="grid gap-6 lg:grid-cols-3">

          {/* INPUT */}

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-xl lg:col-span-2">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h3 className="text-2xl font-bold text-slate-900">
                  DNA Sequence Input
                </h3>

                <p className="mt-1 text-slate-500">
                  Enter A, T, G and C bases.
                </p>

              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                DNA
              </span>

            </div>

            <textarea
              value={sequence}
              onChange={(e) =>
                setSequence(
                  e.target.value
                )
              }
              rows={10}
              placeholder="Example: ATGCGTAAATGC..."
              className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 p-5 font-mono text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-4 flex items-center justify-between text-sm">

              <span className="text-slate-500">
                {
                  sequence.replace(
                    /\s/g,
                    ""
                  ).length
                }{" "}
                bases
              </span>

              <button
                onClick={
                  clearSequence
                }
                className="font-semibold text-red-500 hover:text-red-700"
              >
                Clear
              </button>

            </div>

            <button
              onClick={analyzeDNA}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-4 text-lg font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? "Analyzing DNA..."
                : "Analyze Sequence"}

            </button>

          </div>

          {/* TOOLS */}

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl">

            <h3 className="mb-5 text-xl font-bold text-slate-900">
              Analysis Tools
            </h3>

            {[
              [
                "🧬",
                "Base Statistics",
              ],
              [
                "📊",
                "GC / AT Content",
              ],
              [
                "🔢",
                "3-mer Frequency",
              ],
              [
                "🔄",
                "Reverse Complement",
              ],
              [
                "🧪",
                "RNA Transcription",
              ],
              [
                "🧫",
                "Protein Translation",
              ],
            ].map(
              ([icon, title]) => (

                <div
                  key={title}
                  className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-indigo-50"
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    {icon}
                  </div>

                  <div>

                    <h4 className="font-semibold text-slate-800">
                      {title}
                    </h4>

                    <p className="text-sm text-slate-500">
                      Sequence analysis
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          SINGLE RESULT
      ================================================= */}

      {result && (

        <section className="mx-auto max-w-7xl px-6 pt-12">

          <h2 className="mb-6 text-3xl font-black text-slate-900">
            Analysis Results
          </h2>

          {result.error ? (

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
              ⚠ {result.error}
            </div>

          ) : (

            <>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">

                {[
                  [
                    "Length",
                    result.length,
                  ],
                  [
                    "A",
                    result.num_A ??
                      result.A,
                  ],
                  [
                    "T",
                    result.num_T ??
                      result.T,
                  ],
                  [
                    "G",
                    result.num_G ??
                      result.G,
                  ],
                  [
                    "C",
                    result.num_C ??
                      result.C,
                  ],
                  [
                    "GC %",
                    result.gc_content ??
                      result.GC,
                  ],
                  [
                    "AT %",
                    result.at_content ??
                      result.AT,
                  ],
                ].map(
                  ([label, value]) => (

                    <div
                      key={String(
                        label
                      )}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >

                      <p className="text-sm text-slate-500">
                        {label}
                      </p>

                      <h3 className="mt-2 text-3xl font-black text-slate-900">
                        {value}
                      </h3>

                    </div>

                  )
                )}

              </div>

              <ResultCard
                title="Reverse Complement"
                value={
                  result.reverseComplement ||
                  "—"
                }
                icon="🔄"
              />

              <ResultCard
                title="RNA Transcription"
                value={
                  result.RNA ||
                  "—"
                }
                icon="🧪"
              />

              <ResultCard
                title="Protein Translation"
                value={
                  result.protein ||
                  "—"
                }
                icon="🧫"
              />

            </>

          )}

        </section>

      )}

      {/* =================================================
          CSV SECTION
      ================================================= */}

      <section
        id="batch"
        className="mx-auto max-w-7xl px-6 py-16"
      >

        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-xl">

          <div className="mb-8">

            <div className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
              Batch Processing
            </div>

            <h2 className="text-3xl font-black text-slate-900">
              CSV DNA Analysis
            </h2>

            <p className="mt-2 text-slate-500">
              Upload multiple DNA samples
              for batch analysis.
            </p>

          </div>

          {/* CSV FORMAT */}

          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <h3 className="font-bold text-blue-900">
              CSV Format
            </h3>

            <p className="mt-2 text-sm text-blue-800">
              Your CSV should contain a
              <b> sequence </b>
              column. You can optionally
              include a
              <b> sampleID </b>
              column.
            </p>

            <pre className="mt-4 overflow-x-auto rounded-xl bg-white p-4 text-sm text-slate-700">
{`sampleID,sequence
Sample1,ATGCGTAAATGC
Sample2,ATGCCCGGTAAA
Sample3,ATGTTTGGCCAA`}
            </pre>

          </div>

          {/* UPLOAD */}

          <div className="rounded-3xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-10 text-center">

            <div className="mb-4 text-5xl">
              📁
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Upload DNA CSV
            </h3>

            <p className="mb-6 mt-2 text-sm text-slate-500">
              CSV with sampleID and
              sequence columns
            </p>

            <label className="inline-flex cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105">

              Choose CSV File

              <input
                type="file"
                accept=".csv"
                onChange={
                  handleCSVUpload
                }
                className="hidden"
              />

            </label>

          </div>

          {/* FILE INFO */}

          {csvFileName && (

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

              <div>

                <p className="font-semibold text-emerald-800">
                  ✓ CSV Uploaded
                </p>

                <p className="text-sm text-emerald-700">
                  {csvFileName}
                </p>

              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                {csvData.length} samples
              </span>

            </div>

          )}

          {/* ANALYZE */}

          {csvData.length > 0 && (

            <button
              onClick={analyzeCSV}
              disabled={
                csvAnalyzing
              }
              className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 font-bold text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {csvAnalyzing
                ? "Analyzing Samples..."
                : `Analyze ${csvData.length} Samples`}

            </button>

          )}

          {/* =================================================
              CSV RESULTS
          ================================================= */}

          {csvResults.length > 0 && (

            <div className="mt-10">

              <div className="mb-5">

                <h3 className="text-2xl font-black text-slate-900">
                  CSV Analysis Results
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Computed features for each
                  DNA sample.
                </p>

              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">

                <table className="min-w-[1500px] w-full border-collapse">

                  <thead>

                    <tr className="bg-slate-900 text-left text-sm text-white">

                      <th className="whitespace-nowrap px-4 py-4">
                        Sample ID
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        Sequence
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        GC Content (%)
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        AT Content (%)
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        Sequence Length
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        Num_A
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        Num_T
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        Num_C
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        Num_G
                      </th>

                      <th className="whitespace-nowrap px-4 py-4">
                        K-mer 3 Frequency
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {csvResults.map(
                      (row, index) => (

                        <tr
                          key={index}
                          className="border-t border-slate-200 hover:bg-indigo-50"
                        >

                          {/* SAMPLE ID */}

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-blue-700">
                            {row.sampleID}
                          </td>

                          {/* SEQUENCE */}

                          <td className="max-w-[250px] px-4 py-4">

                            <div className="max-h-24 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                              {row.sequence ||
                                "—"}
                            </div>

                          </td>

                          {/* GC */}

                          <td className="px-4 py-4 font-bold text-indigo-700">
                            {row.GC !==
                            "—"
                              ? `${row.GC}%`
                              : "—"}
                          </td>

                          {/* AT */}

                          <td className="px-4 py-4 font-bold text-violet-700">
                            {row.AT !==
                            "—"
                              ? `${row.AT}%`
                              : "—"}
                          </td>

                          {/* LENGTH */}

                          <td className="px-4 py-4 font-bold text-slate-800">
                            {row.length}
                          </td>

                          {/* A */}

                          <td className="px-4 py-4 font-semibold">
                            {row.num_A}
                          </td>

                          {/* T */}

                          <td className="px-4 py-4 font-semibold">
                            {row.num_T}
                          </td>

                          {/* C */}

                          <td className="px-4 py-4 font-semibold">
                            {row.num_C}
                          </td>

                          {/* G */}

                          <td className="px-4 py-4 font-semibold">
                            {row.num_G}
                          </td>

                          {/* KMER */}

                          <td className="max-w-[400px] px-4 py-4">

                            <div className="max-h-28 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs leading-6 text-slate-700">
                              {formatKmer(
                                row.kmer_3_frequency
                              )}
                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          ABOUT
      ================================================= */}

      <section
        id="about"
        className="mx-auto max-w-7xl px-6 pb-16"
      >

        <div className="rounded-[30px] border border-indigo-100 bg-indigo-50 p-8">

          <h2 className="text-2xl font-black text-slate-900">
            About DNA Analyzer
          </h2>

          <p className="mt-3 max-w-4xl leading-7 text-slate-600">

            This bioinformatics platform
            performs DNA sequence analysis
            including nucleotide composition,
            GC content, AT content, sequence
            length and 3-mer frequency
            analysis.

            <br />
            <br />

            Future versions can include
            reference sequence comparison,
            mutation detection and PDF
            report generation.

          </p>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-slate-950 py-8 text-white">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 text-sm text-slate-400 md:flex-row">

          <span>
            🧬 DNA Analyzer
          </span>

          <span>
            Next.js • Bioinformatics
          </span>

        </div>

      </footer>

    </main>
  );
}

// =====================================================
// RESULT CARD
// =====================================================

function ResultCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (

    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-4 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
          {icon}
        </div>

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

      </div>

      <div className="max-h-48 overflow-auto rounded-2xl bg-slate-50 p-4">

        <p className="break-all font-mono text-sm leading-7 text-slate-700">
          {value}
        </p>

      </div>

    </div>

  );
}

