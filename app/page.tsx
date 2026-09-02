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
     SINGLE DNA ANALYSIS STATES
  ======================================================= */

  const [sequence, setSequence] = useState("");

  const [result, setResult] =
    useState<DNAResult | null>(null);

  const [loading, setLoading] =
    useState(false);


  /* =======================================================
     CSV STATES
  ======================================================= */

  const [csvData, setCsvData] =
    useState<CSVRow[]>([]);

  const [csvResults, setCsvResults] =
    useState<CSVResult[]>([]);

  const [csvAnalyzing, setCsvAnalyzing] =
    useState(false);


  /* =======================================================
     SINGLE DNA ANALYSIS
  ======================================================= */

  async function handleAnalyze() {

    if (!sequence.trim()) {
      alert("Please enter a DNA sequence.");
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
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            sequence: sequence,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data?.error ||
          "DNA analysis failed."
        );
      }


      setResult(data);

    } catch (error) {

      console.error(
        "DNA Analysis Error:",
        error
      );

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

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    Papa.parse(file, {

      header: true,

      skipEmptyLines: true,

      transformHeader: (
        header: string
      ) => header.trim(),

      complete: (results) => {

        try {

          const rows =
            results.data as Record<
              string,
              unknown
            >[];


          if (!rows.length) {

            alert(
              "The CSV file is empty."
            );

            return;
          }


          /* -------------------------------------------------
             FIND SEQUENCE COLUMN
          ------------------------------------------------- */

          const firstRow =
            rows[0];

          const headers =
            Object.keys(firstRow);


          const sequenceColumn =
            headers.find(
              (header) =>
                header
                  .trim()
                  .toLowerCase() ===
                "sequence"
            );


          if (!sequenceColumn) {

            alert(
              'CSV must contain a "sequence" column.'
            );

            return;
          }


          /* -------------------------------------------------
             FIND OPTIONAL SAMPLE NAME COLUMN
          ------------------------------------------------- */

          const sampleColumn =
            headers.find(
              (header) => {

                const normalized =
                  header
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "_");

                return (
                  normalized ===
                    "sampleid" ||

                  normalized ===
                    "sample_id" ||

                  normalized ===
                    "sample_name"
                );
              }
            );


          /* -------------------------------------------------
             NORMALIZE CSV DATA
          ------------------------------------------------- */

          const normalizedRows: CSVRow[] =
            rows
              .map(
                (
                  row,
                  index
                ) => {

                  const rawSequence =
                    row[
                      sequenceColumn
                    ];

                  const dnaSequence =
                    String(
                      rawSequence ?? ""
                    )
                      .trim()
                      .toUpperCase()
                      .replace(/\s/g, "");


                  let sampleID =
                    sampleColumn
                      ? String(
                          row[
                            sampleColumn
                          ] ?? ""
                        ).trim()
                      : "";


                  if (!sampleID) {

                    sampleID =
                      `Sample_${index + 1}`;
                  }


                  return {
                    sampleID,
                    sequence:
                      dnaSequence,
                  };
                }
              )
              .filter(
                (row) =>
                  row.sequence.length > 0
              );


          /* -------------------------------------------------
             CHECK VALID SEQUENCES
          ------------------------------------------------- */

          if (
            normalizedRows.length === 0
          ) {

            alert(
              "No valid DNA sequences were found in the CSV."
            );

            return;
          }


          setCsvData(
            normalizedRows
          );

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


    /* Allow selecting the same file again */
    event.target.value = "";
  }


  /* =========================================================
     CSV ANALYSIS — IMPROVED VERSION
  ========================================================= */

  async function analyzeCSV() {

    /* -------------------------------------------------------
       CHECK CSV DATA
    ------------------------------------------------------- */

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
         OPTIONAL CLIENT-SIDE VALIDATION
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
         READ RESPONSE SAFELY
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
         CHECK HTTP STATUS
      ----------------------------------------------------- */

      if (!response.ok) {

        throw new Error(
          data?.error ||
          `CSV analysis failed (HTTP ${response.status}).`
        );
      }


      /* -----------------------------------------------------
         CHECK RESULTS
      ----------------------------------------------------- */

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
          ) => {

            return {

              /* Sample name */
              sampleID:
                row.sample_name ||
                row.sampleID ||
                `Sample_${index + 1}`,


              /* DNA sequence */
              sequence:
                row.sequence ||
                samples[index]
                  ?.sequence ||
                "",


              /* GC */
              GC:
                row.gc_content ??
                row.GC ??
                "—",


              /* AT */
              AT:
                row.at_content ??
                row.AT ??
                "—",


              /* Length */
              length:
                row.length ??
                "—",


              /* A */
              num_A:
                row.num_A ??
                row.A ??
                "—",


              /* T */
              num_T:
                row.num_T ??
                row.T ??
                "—",


              /* C */
              num_C:
                row.num_C ??
                row.C ??
                "—",


              /* G */
              num_G:
                row.num_G ??
                row.G ??
                "—",


              /* 3-mer frequency */
              kmer_3_frequency:
                row.kmer_3_freq &&
                typeof row.kmer_3_freq ===
                  "object"
                  ? row.kmer_3_freq
                  : {},


              /* Individual sample error */
              error:
                row.error,
            };
          }
        );


      /* -----------------------------------------------------
         SAVE RESULTS
      ----------------------------------------------------- */

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
     CLEAR CSV
  ========================================================= */

  function clearCSV() {

    setCsvData([]);

    setCsvResults([]);
  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-slate-800">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <h1 className="text-4xl font-bold">
            🧬 DNA Sequence Analyzer
          </h1>

          <p className="mt-2 text-slate-400">
            Analyze DNA sequences and perform
            genomic sequence analysis.
          </p>

        </div>

      </section>


      {/* =====================================================
          SINGLE SEQUENCE ANALYZER
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-semibold">
            Single DNA Sequence Analysis
          </h2>


          <textarea
            value={sequence}
            onChange={(e) =>
              setSequence(
                e.target.value
              )
            }
            placeholder="Enter DNA sequence (A, T, G, C)..."
            className="mt-5 min-h-[150px] w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-cyan-500"
          />


          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 rounded-xl bg-cyan-600 px-6 py-3 font-semibold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading
              ? "Analyzing..."
              : "Analyze DNA"}

          </button>


          {/* =================================================
              SINGLE RESULT
          ================================================= */}

          {result && (

            <div className="mt-8">

              {result.error ? (

                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                  {result.error}
                </div>

              ) : (

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-xl bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">
                      Length
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {result.length}
                    </p>
                  </div>


                  <div className="rounded-xl bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">
                      GC Content
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {result.gc_content ??
                        result.GC}
                      %
                    </p>
                  </div>


                  <div className="rounded-xl bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">
                      AT Content
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {result.at_content ??
                        result.AT}
                      %
                    </p>
                  </div>


                  <div className="rounded-xl bg-slate-950 p-5">
                    <p className="text-sm text-slate-400">
                      A / T / G / C
                    </p>

                    <p className="mt-2 text-xl font-bold">
                      {result.num_A ??
                        result.A}{" "}
                      /{" "}
                      {result.num_T ??
                        result.T}{" "}
                      /{" "}
                      {result.num_G ??
                        result.G}{" "}
                      /{" "}
                      {result.num_C ??
                        result.C}
                    </p>
                  </div>

                </div>

              )}

            </div>

          )}

        </div>


        {/* ===================================================
            CSV ANALYSIS
        =================================================== */}

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-2xl font-semibold">
                📊 CSV Batch Analysis
              </h2>

              <p className="mt-2 text-slate-400">
                Upload a CSV containing sample names
                and DNA sequences.
              </p>

            </div>


            {csvData.length > 0 && (

              <button
                onClick={clearCSV}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Clear CSV
              </button>

            )}

          </div>


          {/* =================================================
              CSV FORMAT
          ================================================= */}

          <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

            <p className="text-sm text-slate-300">

              <strong>CSV format:</strong>{" "}

              <code className="text-cyan-400">
                sample_name,sequence
              </code>

            </p>

          </div>


          {/* =================================================
              FILE INPUT
          ================================================= */}

          <div className="mt-6">

            <label
              htmlFor="csv-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 p-10 text-center transition hover:border-cyan-500"
            >

              <span className="text-4xl">
                📁
              </span>

              <span className="mt-3 font-semibold">
                Upload CSV File
              </span>

              <span className="mt-1 text-sm text-slate-500">
                Click here to select your CSV
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


          {/* =================================================
              CSV PREVIEW
          ================================================= */}

          {csvData.length > 0 && (

            <div className="mt-8">

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  CSV Preview
                </h3>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-400">
                  {csvData.length} samples
                </span>

              </div>


              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">

                <table className="w-full min-w-[600px] text-left text-sm">

                  <thead className="bg-slate-950">

                    <tr>

                      <th className="px-4 py-3">
                        Sample
                      </th>

                      <th className="px-4 py-3">
                        Sequence
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {csvData
                      .slice(0, 10)
                      .map(
                        (
                          row,
                          index
                        ) => (

                          <tr
                            key={`${row.sampleID}-${index}`}
                            className="border-t border-slate-800"
                          >

                            <td className="px-4 py-3 font-medium">
                              {row.sampleID}
                            </td>

                            <td className="max-w-xl truncate px-4 py-3 font-mono text-xs text-slate-400">
                              {row.sequence}
                            </td>

                          </tr>

                        )
                      )}

                  </tbody>

                </table>

              </div>


              {csvData.length > 10 && (

                <p className="mt-2 text-sm text-slate-500">
                  Showing first 10 samples of{" "}
                  {csvData.length}.
                </p>

              )}


              {/* =================================================
                  ANALYZE CSV BUTTON
              ================================================= */}

              <button
                onClick={analyzeCSV}
                disabled={csvAnalyzing}
                className="mt-6 rounded-xl bg-cyan-600 px-7 py-3 font-semibold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {csvAnalyzing
                  ? `Analyzing ${csvData.length} samples...`
                  : `Analyze ${csvData.length} Samples`}

              </button>

            </div>

          )}


          {/* =================================================
              CSV RESULTS
          ================================================= */}

          {csvResults.length > 0 && (

            <div className="mt-10">

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                <div>

                  <h3 className="text-xl font-semibold">
                    Analysis Results
                  </h3>

                  <p className="text-sm text-slate-400">
                    Successfully analyzed{" "}
                    {csvResults.length}{" "}
                    samples.
                  </p>

                </div>

              </div>


              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead className="bg-slate-950">

                    <tr>

                      <th className="px-4 py-3">
                        Sample
                      </th>

                      <th className="px-4 py-3">
                        Length
                      </th>

                      <th className="px-4 py-3">
                        GC %
                      </th>

                      <th className="px-4 py-3">
                        AT %
                      </th>

                      <th className="px-4 py-3">
                        A
                      </th>

                      <th className="px-4 py-3">
                        T
                      </th>

                      <th className="px-4 py-3">
                        C
                      </th>

                      <th className="px-4 py-3">
                        G
                      </th>

                      <th className="px-4 py-3">
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
                          className="border-t border-slate-800"
                        >

                          <td className="px-4 py-3 font-semibold">
                            {row.sampleID}
                          </td>


                          <td className="px-4 py-3">
                            {row.length}
                          </td>


                          <td className="px-4 py-3 text-cyan-400">
                            {row.GC}%
                          </td>


                          <td className="px-4 py-3">
                            {row.AT}%
                          </td>


                          <td className="px-4 py-3">
                            {row.num_A}
                          </td>


                          <td className="px-4 py-3">
                            {row.num_T}
                          </td>


                          <td className="px-4 py-3">
                            {row.num_C}
                          </td>


                          <td className="px-4 py-3">
                            {row.num_G}
                          </td>


                          <td className="max-w-md px-4 py-3">

                            <div className="flex flex-wrap gap-2">

                              {Object.entries(
                                row.kmer_3_frequency
                              )
                                .slice(0, 15)
                                .map(
                                  (
                                    [
                                      kmer,
                                      count,
                                    ]
                                  ) => (

                                    <span
                                      key={kmer}
                                      className="rounded-md bg-slate-800 px-2 py-1 font-mono text-xs"
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

          )}

        </div>

      </section>

    </main>
  );
}
