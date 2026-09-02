"use client";

import { useState } from "react";
import Papa from "papaparse";

/* =========================================================
   TYPES
========================================================= */

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

  reverseComplement?: string;
  RNA?: string;
  protein?: string;

  kmer_3_freq?: Record<string, number>;

  error?: string;
};

type CSVRow = {
  sampleID: string;
  sequence: string;
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

/* =========================================================
   COMPONENT
========================================================= */

export default function Home() {
  /* =======================================================
     SINGLE DNA STATES
  ======================================================= */

  const [sequence, setSequence] = useState("");
  const [result, setResult] = useState<DNAResult | null>(null);
  const [loading, setLoading] = useState(false);

  /* =======================================================
     CSV STATES
  ======================================================= */

  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvResults, setCsvResults] = useState<CSVResult[]>([]);
  const [csvAnalyzing, setCsvAnalyzing] = useState(false);

  /* =========================================================
     SINGLE DNA ANALYSIS
  ========================================================= */

  async function handleAnalyze() {
    if (!sequence.trim()) {
      alert("Please enter a DNA sequence.");
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

      if (!response.ok) {
        throw new Error(
          data?.error || "DNA analysis failed."
        );
      }

      setResult(data);
    } catch (error) {
      console.error("DNA Analysis Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     CSV FILE UPLOAD
  ========================================================= */

  function handleCSVUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      transformHeader: (header: string) =>
        header.trim(),

      complete: (results) => {
        try {
          const rows =
            results.data as Record<string, unknown>[];

          if (!rows.length) {
            alert("The CSV file is empty.");
            return;
          }

          /* -------------------------------------------------
             FIND SEQUENCE COLUMN
          ------------------------------------------------- */

          const firstRow = rows[0];

          const headers = Object.keys(firstRow);

          const sequenceColumn = headers.find(
            (header) =>
              header.trim().toLowerCase() ===
              "sequence"
          );

          if (!sequenceColumn) {
            alert(
              'CSV must contain a "sequence" column.'
            );
            return;
          }

          /* -------------------------------------------------
             FIND SAMPLE COLUMN
          ------------------------------------------------- */

          const sampleColumn = headers.find(
            (header) => {
              const normalized =
                header
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "_");

              return (
                normalized === "sampleid" ||
                normalized === "sample_id" ||
                normalized === "sample_name"
              );
            }
          );

          /* -------------------------------------------------
             NORMALIZE CSV
          ------------------------------------------------- */

          const normalizedRows: CSVRow[] =
            rows
              .map((row, index) => {
                const rawSequence =
                  row[sequenceColumn];

                const dnaSequence = String(
                  rawSequence ?? ""
                )
                  .trim()
                  .toUpperCase()
                  .replace(/\s/g, "");

                let sampleID = sampleColumn
                  ? String(
                      row[sampleColumn] ?? ""
                    ).trim()
                  : "";

                if (!sampleID) {
                  sampleID =
                    `Sample_${index + 1}`;
                }

                return {
                  sampleID,
                  sequence: dnaSequence,
                };
              })
              .filter(
                (row) =>
                  row.sequence.length > 0
              );

          if (
            normalizedRows.length === 0
          ) {
            alert(
              "No valid DNA sequences were found in the CSV."
            );
            return;
          }

          setCsvData(normalizedRows);
          setCsvResults([]);
        } catch (error) {
          console.error(
            "CSV parsing error:",
            error
          );

          alert(
            "Unable to process the CSV file."
          );
        }
      },

      error: (error) => {
        console.error(
          "PapaParse Error:",
          error
        );

        alert(
          "Failed to read the CSV file."
        );
      },
    });

    event.target.value = "";
  }

  /* =========================================================
     CSV ANALYSIS — WORKING BATCH VERSION
  ========================================================= */

  async function analyzeCSV() {
    if (csvData.length === 0) {
      alert(
        "Please upload a CSV file first."
      );
      return;
    }

    setCsvAnalyzing(true);
    setCsvResults([]);

    try {
      /* -----------------------------------------------------
         PREPARE SAMPLES
      ----------------------------------------------------- */

      const samples = csvData
        .map((row) => ({
          sample_name:
            row.sampleID.trim(),

          sequence:
            row.sequence
              .trim()
              .toUpperCase()
              .replace(/\s/g, ""),
        }))
        .filter(
          (row) =>
            row.sequence.length > 0
        );

      if (samples.length === 0) {
        throw new Error(
          "No valid DNA sequences were found."
        );
      }

      /* -----------------------------------------------------
         VALIDATE DNA
      ----------------------------------------------------- */

      const invalidSamples =
        samples.filter(
          (sample) =>
            !/^[ATGC]+$/.test(
              sample.sequence
            )
        );

      if (
        invalidSamples.length > 0
      ) {
        const names =
          invalidSamples
            .slice(0, 5)
            .map(
              (sample) =>
                sample.sample_name
            )
            .join(", ");

        throw new Error(
          `Invalid DNA sequence found in: ${names}${
            invalidSamples.length > 5
              ? " and other samples."
              : "."
          }`
        );
      }

      /* -----------------------------------------------------
         SEND ONE BATCH REQUEST
      ----------------------------------------------------- */

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
              samples,
            }),
          }
        );

      /* -----------------------------------------------------
         READ RESPONSE
      ----------------------------------------------------- */

      let data: any;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "The analysis server returned an invalid response."
        );
      }

      /* -----------------------------------------------------
         CHECK RESPONSE
      ----------------------------------------------------- */

      if (!response.ok) {
        throw new Error(
          data?.error ||
          `CSV analysis failed (HTTP ${response.status}).`
        );
      }

      if (
        !data ||
        !Array.isArray(
          data.results
        )
      ) {
        throw new Error(
          "The server did not return valid CSV analysis results."
        );
      }

      /* -----------------------------------------------------
         FORMAT RESULTS
      ----------------------------------------------------- */

      const formattedResults: CSVResult[] =
        data.results.map(
          (
            row: any,
            index: number
          ) => ({
            sampleID:
              row.sample_name ||
              row.sampleID ||
              `Sample_${index + 1}`,

            sequence:
              row.sequence ||
              samples[index]?.sequence ||
              "",

            GC:
              row.gc_content ??
              row.GC ??
              "—",

            AT:
              row.at_content ??
              row.AT ??
              "—",

            length:
              row.length ??
              "—",

            num_A:
              row.num_A ??
              row.A ??
              "—",

            num_T:
              row.num_T ??
              row.T ??
              "—",

            num_C:
              row.num_C ??
              row.C ??
              "—",

            num_G:
              row.num_G ??
              row.G ??
              "—",

            kmer_3_frequency:
              row.kmer_3_freq &&
              typeof row.kmer_3_freq ===
                "object"
                ? row.kmer_3_freq
                : {},

            error:
              row.error,
          })
        );

      setCsvResults(
        formattedResults
      );
    } catch (error) {
      console.error(
        "CSV Analysis Error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to analyze CSV."
      );
    } finally {
      setCsvAnalyzing(false);
    }
  }

  /* =========================================================
     CLEAR
  ========================================================= */

  function clearCSV() {
    setCsvData([]);
    setCsvResults([]);
  }

  function clearSingleAnalysis() {
    setSequence("");
    setResult(null);
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-sm">
              🧬
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                DNA Analyzer
              </h1>

              <p className="text-xs text-slate-500">
                Bioinformatics Platform
              </p>
            </div>

          </div>


          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">

            <a
              href="#single-analysis"
              className="transition hover:text-blue-600"
            >
              Sequence Analysis
            </a>

            <a
              href="#csv-analysis"
              className="transition hover:text-blue-600"
            >
              Batch Analysis
            </a>

            <a
              href="#results"
              className="transition hover:text-blue-600"
            >
              Results
            </a>

          </div>

        </div>

      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/70 to-white">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Computational Biology Tool

            </div>


            <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

              DNA Sequence
              <span className="text-blue-600">
                {" "}Analyzer
              </span>

            </h2>


            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">

              Analyze DNA sequences with essential
              molecular statistics including nucleotide
              composition, GC content, reverse complement,
              transcription, translation, and 3-mer
              frequency analysis.

            </p>


            <div className="mt-8 flex flex-wrap gap-3">

              <a
                href="#single-analysis"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Start Analysis
              </a>

              <a
                href="#csv-analysis"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Analyze CSV
              </a>

            </div>

          </div>


          {/* HERO FEATURE CARDS */}

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: "🧬",
                title: "Sequence Validation",
                text: "Validate A, T, G and C bases",
              },
              {
                icon: "📊",
                title: "GC / AT Content",
                text: "Calculate nucleotide composition",
              },
              {
                icon: "🔬",
                title: "Sequence Analysis",
                text: "Transcription and translation",
              },
              {
                icon: "📁",
                title: "Batch Processing",
                text: "Analyze multiple CSV samples",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="text-2xl">
                  {item.icon}
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12">


        {/* ===================================================
            SINGLE ANALYSIS
        =================================================== */}

        <div
          id="single-analysis"
          className="scroll-mt-24"
        >

          <div className="mb-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Sequence Analysis
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Analyze a DNA Sequence
            </h2>

            <p className="mt-2 text-slate-500">
              Enter a DNA sequence containing only
              A, T, G, and C bases.
            </p>

          </div>


          <div className="grid gap-6 lg:grid-cols-5">


            {/* INPUT */}

            <div className="lg:col-span-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      DNA Input
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Paste or type your sequence below
                    </p>

                  </div>

                  {sequence && (

                    <button
                      onClick={clearSingleAnalysis}
                      className="text-sm font-medium text-slate-500 hover:text-red-600"
                    >
                      Clear
                    </button>

                  )}

                </div>


                <textarea
                  value={sequence}
                  onChange={(e) =>
                    setSequence(
                      e.target.value
                    )
                  }
                  placeholder="Example: ATGCGTACGTAGCTAGCTAG..."
                  className="mt-5 min-h-[220px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />


                <div className="mt-4 flex items-center justify-between">

                  <span className="text-xs text-slate-500">
                    {sequence
                      .replace(/\s/g, "")
                      .length}{" "}
                    bases
                  </span>


                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {loading
                      ? "Analyzing..."
                      : "Analyze Sequence"}

                  </button>

                </div>

              </div>

            </div>


            {/* QUICK RESULT */}

            <div className="lg:col-span-2">

              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    📈
                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      Analysis Summary
                    </h3>

                    <p className="text-xs text-slate-500">
                      Sequence statistics
                    </p>

                  </div>

                </div>


                {result?.error ? (

                  <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {result.error}
                  </div>

                ) : result ? (

                  <div className="mt-7 space-y-4">

                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-sm text-slate-500">
                        Sequence Length
                      </span>

                      <span className="font-semibold text-slate-900">
                        {result.length}
                      </span>
                    </div>


                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-sm text-slate-500">
                        GC Content
                      </span>

                      <span className="font-semibold text-blue-600">
                        {result.gc_content ??
                          result.GC}
                        %
                      </span>
                    </div>


                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-sm text-slate-500">
                        AT Content
                      </span>

                      <span className="font-semibold text-slate-900">
                        {result.at_content ??
                          result.AT}
                        %
                      </span>
                    </div>


                    <div>

                      <p className="mb-3 text-sm text-slate-500">
                        Nucleotide Count
                      </p>

                      <div className="grid grid-cols-4 gap-2">

                        {[
                          ["A", result.num_A ?? result.A],
                          ["T", result.num_T ?? result.T],
                          ["G", result.num_G ?? result.G],
                          ["C", result.num_C ?? result.C],
                        ].map(
                          ([base, count]) => (

                            <div
                              key={base}
                              className="rounded-xl border border-slate-200 bg-white p-3 text-center"
                            >

                              <p className="text-xs font-bold text-blue-600">
                                {base}
                              </p>

                              <p className="mt-1 font-semibold text-slate-900">
                                {count}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="flex min-h-[260px] items-center justify-center text-center">

                    <div>

                      <div className="text-4xl">
                        🧬
                      </div>

                      <p className="mt-4 font-medium text-slate-700">
                        No analysis yet
                      </p>

                      <p className="mt-1 max-w-xs text-sm text-slate-500">
                        Enter a sequence and click
                        Analyze Sequence to view
                        your results.
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>


          {/* DETAILED RESULT */}

          {result && !result.error && (

            <div className="mt-6 grid gap-6 lg:grid-cols-2">


              {/* REVERSE COMPLEMENT */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-semibold text-slate-900">
                  Reverse Complement
                </h3>

                <div className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4">

                  <code className="break-all font-mono text-sm leading-7 text-slate-700">
                    {result.reverseComplement ||
                      "—"}
                  </code>

                </div>

              </div>


              {/* RNA */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-semibold text-slate-900">
                  RNA Transcription
                </h3>

                <div className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-4">

                  <code className="break-all font-mono text-sm leading-7 text-slate-700">
                    {result.RNA || "—"}
                  </code>

                </div>

              </div>


              {/* PROTEIN */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                <h3 className="font-semibold text-slate-900">
                  Protein Translation
                </h3>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">

                  <p className="font-mono text-sm leading-7 text-slate-700">
                    {result.protein ||
                      "—"}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>


        {/* ===================================================
            CSV BATCH ANALYSIS
        =================================================== */}

        <div
          id="csv-analysis"
          className="mt-20 scroll-mt-24"
        >

          <div className="mb-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Batch Analysis
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Analyze Multiple DNA Samples
            </h2>

            <p className="mt-2 text-slate-500">
              Upload a CSV file to analyze multiple
              DNA sequences simultaneously.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


            {/* CSV FORMAT */}

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex gap-4">

                <div className="text-2xl">
                  📋
                </div>

                <div>

                  <h3 className="font-semibold text-slate-900">
                    CSV Format
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Your CSV should contain a
                    <strong> sequence </strong>
                    column and optionally a
                    <strong> sample_name </strong>
                    column.
                  </p>

                  <code className="mt-3 block rounded-lg bg-white p-3 text-xs text-slate-700">
                    sample_name,sequence
                    <br />
                    Sample_01,ATGCGTACGTAGCTAG
                    <br />
                    Sample_02,GCGCGATATATGCGC
                  </code>

                </div>

              </div>

            </div>


            {/* UPLOAD */}

            <div className="mt-6">

              <label
                htmlFor="csv-upload"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl transition group-hover:scale-105">
                  📁
                </div>

                <h3 className="mt-5 font-semibold text-slate-900">
                  Upload your CSV file
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Click to browse or select a CSV
                  file from your computer
                </p>

                <span className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                  CSV files only
                </span>

              </label>


              <input
                id="csv-upload"
                type="file"
                accept=".csv,text/csv"
                onChange={handleCSVUpload}
                className="hidden"
              />

            </div>


            {/* CSV PREVIEW */}

            {csvData.length > 0 && (

              <div className="mt-8">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      Uploaded Samples
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Review your sequences before
                      analysis.
                    </p>

                  </div>


                  <div className="flex items-center gap-3">

                    <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                      {csvData.length} samples
                    </span>

                    <button
                      onClick={clearCSV}
                      className="text-sm font-medium text-slate-500 transition hover:text-red-600"
                    >
                      Remove
                    </button>

                  </div>

                </div>


                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">

                  <div className="max-h-[350px] overflow-auto">

                    <table className="w-full min-w-[650px] text-left text-sm">

                      <thead className="sticky top-0 bg-slate-100">

                        <tr>

                          <th className="px-5 py-3 font-semibold text-slate-700">
                            #
                          </th>

                          <th className="px-5 py-3 font-semibold text-slate-700">
                            Sample
                          </th>

                          <th className="px-5 py-3 font-semibold text-slate-700">
                            DNA Sequence
                          </th>

                          <th className="px-5 py-3 font-semibold text-slate-700">
                            Length
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {csvData.map(
                          (
                            row,
                            index
                          ) => (

                            <tr
                              key={`${row.sampleID}-${index}`}
                              className="border-t border-slate-200 hover:bg-slate-50"
                            >

                              <td className="px-5 py-3 text-slate-400">
                                {index + 1}
                              </td>

                              <td className="px-5 py-3 font-medium text-slate-900">
                                {row.sampleID}
                              </td>

                              <td className="max-w-lg truncate px-5 py-3 font-mono text-xs text-slate-500">
                                {row.sequence}
                              </td>

                              <td className="px-5 py-3 text-slate-600">
                                {row.sequence.length}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* ANALYZE BUTTON */}

                <div className="mt-6 flex justify-end">

                  <button
                    onClick={analyzeCSV}
                    disabled={csvAnalyzing}
                    className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {csvAnalyzing
                      ? `Analyzing ${csvData.length} samples...`
                      : `Analyze ${csvData.length} Samples`}

                  </button>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              CSV RESULTS
          ================================================= */}

          {csvResults.length > 0 && (

            <div
              id="results"
              className="mt-8 scroll-mt-24"
            >

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* RESULT HEADER */}

                <div className="border-b border-slate-200 p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                        Analysis Complete
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-950">
                        Batch Analysis Results
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {csvResults.length} DNA samples
                        analyzed successfully.
                      </p>

                    </div>


                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                      ✓
                    </div>

                  </div>

                </div>


                {/* RESULTS TABLE */}

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px] text-left text-sm">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Sample
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          Length
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          GC %
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          AT %
                        </th>

                        <th className="px-5 py-4 text-center font-semibold text-slate-700">
                          A
                        </th>

                        <th className="px-5 py-4 text-center font-semibold text-slate-700">
                          T
                        </th>

                        <th className="px-5 py-4 text-center font-semibold text-slate-700">
                          C
                        </th>

                        <th className="px-5 py-4 text-center font-semibold text-slate-700">
                          G
                        </th>

                        <th className="px-5 py-4 font-semibold text-slate-700">
                          3-mer Frequency
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {csvResults.map(
                        (
                          row,
                          index
                        ) => (

                          <tr
                            key={`${row.sampleID}-${index}`}
                            className="border-t border-slate-200 hover:bg-slate-50"
                          >

                            <td className="px-5 py-4">

                              <div className="font-semibold text-slate-900">
                                {row.sampleID}
                              </div>

                              {row.error && (

                                <div className="mt-1 text-xs text-red-600">
                                  {row.error}
                                </div>

                              )}

                            </td>


                            <td className="px-5 py-4 text-slate-700">
                              {row.length}
                            </td>


                            <td className="px-5 py-4">

                              <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                                {row.GC}%
                              </span>

                            </td>


                            <td className="px-5 py-4 font-medium text-slate-700">
                              {row.AT}%
                            </td>


                            <td className="px-5 py-4 text-center font-medium text-slate-700">
                              {row.num_A}
                            </td>


                            <td className="px-5 py-4 text-center font-medium text-slate-700">
                              {row.num_T}
                            </td>


                            <td className="px-5 py-4 text-center font-medium text-slate-700">
                              {row.num_C}
                            </td>


                            <td className="px-5 py-4 text-center font-medium text-slate-700">
                              {row.num_G}
                            </td>


                            <td className="max-w-lg px-5 py-4">

                              <div className="flex max-w-md flex-wrap gap-1.5">

                                {Object.entries(
                                  row.kmer_3_frequency
                                )
                                  .slice(
                                    0,
                                    15
                                  )
                                  .map(
                                    (
                                      [
                                        kmer,
                                        count,
                                      ]
                                    ) => (

                                      <span
                                        key={kmer}
                                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600"
                                      >
                                        {kmer}:{" "}
                                        {count}
                                      </span>

                                    )
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

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="font-semibold text-slate-900">
                🧬 DNA Sequence Analyzer
              </p>

              <p className="mt-1 text-sm text-slate-500">
                A computational biology tool for
                DNA sequence analysis.
              </p>

            </div>


            <p className="text-xs text-slate-400">
              Bioinformatics • Genomics • Sequence Analysis
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}

