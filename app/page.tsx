"use client";

import { useState } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";

/* =========================================================
   TYPES
========================================================= */

type ProteinItem = {
  codon: string;
  aminoAcid: string;
};

type DNAResult = {
  sample_name?: string;
  sequence?: string;
  length?: number;

  A?: number;
  T?: number;
  G?: number;
  C?: number;

  GC?: number;
  AT?: number;

  reverse_complement?: string;
  rna?: string;

  protein?: ProteinItem[];

  three_mer_frequency?: Record<string, number>;

  reference_similarity?: number;
  reference_status?: string;
};

type CSVRow = {
  sample_name?: string;
  sampleID?: string;
  sample?: string;
  sequence?: string;
  DNA?: string;

  [key: string]: string | undefined;
};

type AnalysisResponse = {
  success: boolean;
  results: DNAResult[];
  reference?: string | null;
  threshold?: number;

  summary?: {
    total_samples: number;
    matched: number;
    mismatched: number;
  };

  error?: string;
};

/* =========================================================
   DNA HELIX
========================================================= */

function DNAHelix() {
  return (
    <div className="dna-hero-graphic">
      <svg
        viewBox="0 0 520 520"
        className="dna-svg"
        aria-label="DNA double helix illustration"
      >
        {/* Left strand */}
        <path
          d="M170 20 C360 100 360 180 170 260 C-20 340 -20 420 170 500"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Right strand */}
        <path
          d="M350 20 C160 100 160 180 350 260 C540 340 540 420 350 500"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Base pairs */}
        <line x1="210" y1="45" x2="310" y2="45" />
        <line x1="260" y1="85" x2="260" y2="85" />

        <line x1="280" y1="100" x2="240" y2="100" />
        <line x1="300" y1="140" x2="220" y2="140" />

        <line x1="300" y1="180" x2="220" y2="180" />
        <line x1="280" y1="220" x2="240" y2="220" />

        <line x1="210" y1="260" x2="310" y2="260" />

        <line x1="220" y1="300" x2="300" y2="300" />
        <line x1="240" y1="340" x2="280" y2="340" />

        <line x1="220" y1="380" x2="300" y2="380" />
        <line x1="210" y1="420" x2="310" y2="420" />

        <line x1="220" y1="460" x2="300" y2="460" />

        <g
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <line x1="210" y1="45" x2="310" y2="45" />
          <line x1="280" y1="100" x2="240" y2="100" />
          <line x1="300" y1="140" x2="220" y2="140" />
          <line x1="300" y1="180" x2="220" y2="180" />
          <line x1="280" y1="220" x2="240" y2="220" />
          <line x1="210" y1="260" x2="310" y2="260" />
          <line x1="220" y1="300" x2="300" y2="300" />
          <line x1="240" y1="340" x2="280" y2="340" />
          <line x1="220" y1="380" x2="300" y2="380" />
          <line x1="210" y1="420" x2="310" y2="420" />
          <line x1="220" y1="460" x2="300" y2="460" />
        </g>

        {/* Nucleotide circles */}
        <g fill="currentColor">
          <circle cx="170" cy="20" r="8" />
          <circle cx="350" cy="20" r="8" />
          <circle cx="170" cy="260" r="8" />
          <circle cx="350" cy="260" r="8" />
          <circle cx="170" cy="500" r="8" />
          <circle cx="350" cy="500" r="8" />
        </g>
      </svg>

      <div className="dna-floating-card dna-card-one">
        <strong>DNA</strong>
        <span>Sequence</span>
      </div>

      <div className="dna-floating-card dna-card-two">
        <strong>GC</strong>
        <span>Composition</span>
      </div>

      <div className="dna-floating-card dna-card-three">
        <strong>RNA</strong>
        <span>Translation</span>
      </div>
    </div>
  );
}

/* =========================================================
   STAT ICON
========================================================= */

function StatIcon({ letter }: { letter: string }) {
  return <div className="base-icon">{letter}</div>;
}

/* =========================================================
   MAIN
========================================================= */

export default function Home() {
  /* =======================================================
     SINGLE ANALYSIS
  ======================================================= */

  const [dnaSequence, setDnaSequence] = useState("");

  const [singleResult, setSingleResult] =
    useState<DNAResult | null>(null);

  const [singleError, setSingleError] = useState("");

  const [singleLoading, setSingleLoading] =
    useState(false);

  /* =======================================================
     CSV
  ======================================================= */

  const [csvFileName, setCsvFileName] =
    useState("");

  const [csvRows, setCsvRows] =
    useState<CSVRow[]>([]);

  const [batchResults, setBatchResults] =
    useState<DNAResult[]>([]);

  const [batchError, setBatchError] =
    useState("");

  const [batchLoading, setBatchLoading] =
    useState(false);

  /* =======================================================
     REFERENCE
  ======================================================= */

  const [referenceMode, setReferenceMode] =
    useState<"type" | "upload">("type");

  const [referenceSequence, setReferenceSequence] =
    useState("");

  const [referenceFileName, setReferenceFileName] =
    useState("");

  const [referenceError, setReferenceError] =
    useState("");

  const [referenceResults, setReferenceResults] =
    useState<DNAResult[]>([]);

  const [referenceSummary, setReferenceSummary] =
    useState<AnalysisResponse["summary"]>();

  const [referenceLoading, setReferenceLoading] =
    useState(false);

  /* =======================================================
     SINGLE DNA ANALYSIS
  ======================================================= */

  async function analyzeSingleDNA() {
    setSingleError("");
    setSingleResult(null);

    const sequence = dnaSequence
      .toUpperCase()
      .replace(/\s+/g, "");

    if (!sequence) {
      setSingleError(
        "Please enter a DNA sequence."
      );
      return;
    }

    if (!/^[ATGC]+$/.test(sequence)) {
      setSingleError(
        "Invalid sequence. Only A, T, G and C are allowed."
      );
      return;
    }

    try {
      setSingleLoading(true);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            samples: [
              {
                sample_name:
                  "Single DNA Sample",

                sequence,
              },
            ],
          }),
        }
      );

      const data: AnalysisResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Analysis failed."
        );
      }

      setSingleResult(
        data.results[0]
      );
    } catch (error) {
      setSingleError(
        error instanceof Error
          ? error.message
          : "DNA analysis failed."
      );
    } finally {
      setSingleLoading(false);
    }
  }

  function clearSingleDNAAnalysis() {
    setDnaSequence("");
    setSingleResult(null);
    setSingleError("");
  }

  /* =======================================================
     CSV UPLOAD
  ======================================================= */

  function handleCSVUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setCsvFileName(file.name);
    setCsvRows([]);
    setBatchResults([]);
    setBatchError("");

    Papa.parse<CSVRow>(file, {
      header: true,

      skipEmptyLines: true,

      complete: (results) => {
        if (!results.data.length) {
          setBatchError(
            "The CSV file is empty."
          );
          return;
        }

        setCsvRows(results.data);
      },

      error: (error) => {
        setBatchError(
          `CSV parsing failed: ${error.message}`
        );
      },
    });
  }

  /* =======================================================
     BATCH ANALYSIS
  ======================================================= */

  async function analyzeCSV() {
    setBatchError("");

    if (!csvRows.length) {
      setBatchError(
        "Please upload a CSV file first."
      );
      return;
    }

    const sequenceKey =
      Object.keys(csvRows[0]).find(
        (key) => {
          const name =
            key.toLowerCase().trim();

          return (
            name === "sequence" ||
            name === "dna"
          );
        }
      );

    if (!sequenceKey) {
      setBatchError(
        "CSV must contain a 'sequence' or 'DNA' column."
      );
      return;
    }

    const samples = csvRows
      .map((row, index) => ({
        sample_name:
          row.sample_name ||
          row.sampleID ||
          row.sample ||
          `Sample ${index + 1}`,

        sequence:
          row[sequenceKey]
            ?.toUpperCase()
            .replace(/\s+/g, "") ||
          "",
      }))
      .filter(
        (sample) =>
          sample.sequence.length > 0
      );

    if (!samples.length) {
      setBatchError(
        "No DNA sequences were found."
      );
      return;
    }

    try {
      setBatchLoading(true);

      const response = await fetch(
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

      const data: AnalysisResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Batch analysis failed."
        );
      }

      setBatchResults(
        data.results
      );
    } catch (error) {
      setBatchError(
        error instanceof Error
          ? error.message
          : "Batch analysis failed."
      );
    } finally {
      setBatchLoading(false);
    }
  }

  /* =======================================================
     REFERENCE TEXT
  ======================================================= */

  function handleReferenceText(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setReferenceSequence(
      event.target.value.toUpperCase()
    );

    setReferenceFileName("");
    setReferenceError("");
    setReferenceResults([]);
    setReferenceSummary(undefined);
  }

  /* =======================================================
     REFERENCE FILE
  ======================================================= */

  function handleReferenceUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setReferenceFileName(file.name);
    setReferenceError("");
    setReferenceSequence("");
    setReferenceResults([]);
    setReferenceSummary(undefined);

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    /* CSV */

    if (extension === "csv") {
      Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,

        complete: (results) => {
          if (!results.data.length) {
            setReferenceError(
              "Reference CSV is empty."
            );
            return;
          }

          const firstRow =
            results.data[0];

          const sequenceKey =
            Object.keys(firstRow).find(
              (key) => {
                const lower =
                  key.toLowerCase().trim();

                return (
                  lower === "sequence" ||
                  lower === "dna"
                );
              }
            );

          if (!sequenceKey) {
            setReferenceError(
              "Reference CSV must contain a sequence or DNA column."
            );
            return;
          }

          const row =
            results.data.find(
              (item) =>
                item[sequenceKey] &&
                item[sequenceKey]!.trim()
            );

          if (!row) {
            setReferenceError(
              "No reference DNA sequence was found."
            );
            return;
          }

          const sequence =
            row[sequenceKey]!
              .toUpperCase()
              .replace(/\s+/g, "");

          if (!/^[ATGC]+$/.test(sequence)) {
            setReferenceError(
              "Reference contains invalid DNA characters."
            );
            return;
          }

          setReferenceSequence(
            sequence
          );
        },

        error: (error) => {
          setReferenceError(
            error.message
          );
        },
      });

      return;
    }

    /* TXT / FASTA / FA */

    if (
      extension === "txt" ||
      extension === "fasta" ||
      extension === "fa"
    ) {
      const reader =
        new FileReader();

      reader.onload = () => {
        const text =
          String(
            reader.result || ""
          );

        const sequence = text
          .split(/\r?\n/)
          .filter(
            (line) =>
              !line
                .trim()
                .startsWith(">")
          )
          .join("")
          .replace(/\s+/g, "")
          .toUpperCase();

        if (!sequence) {
          setReferenceError(
            "No DNA sequence was found."
          );
          return;
        }

        if (!/^[ATGC]+$/.test(sequence)) {
          setReferenceError(
            "Reference contains invalid DNA characters."
          );
          return;
        }

        setReferenceSequence(
          sequence
        );
      };

      reader.onerror = () => {
        setReferenceError(
          "Unable to read reference file."
        );
      };

      reader.readAsText(file);

      return;
    }

    setReferenceError(
      "Supported formats are CSV, TXT, FASTA and FA."
    );
  }

  /* =======================================================
     REFERENCE COMPARISON
  ======================================================= */

  async function compareReference() {
    setReferenceError("");

    if (!referenceSequence.trim()) {
      setReferenceError(
        "Please enter or upload a reference sequence."
      );
      return;
    }

    const reference =
      referenceSequence
        .toUpperCase()
        .replace(/\s+/g, "");

    if (!/^[ATGC]+$/.test(reference)) {
      setReferenceError(
        "Reference sequence can contain only A, T, G and C."
      );
      return;
    }

    if (!batchResults.length) {
      setReferenceError(
        "Please analyze your CSV batch first."
      );
      return;
    }

    try {
      setReferenceLoading(true);

      const samples =
        batchResults.map(
          (result, index) => ({
            sample_name:
              result.sample_name ||
              `Sample ${index + 1}`,

            sequence:
              result.sequence || "",
          })
        );

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            samples,
            reference,
          }),
        }
      );

      const data: AnalysisResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Reference comparison failed."
        );
      }

      setReferenceResults(
        data.results
      );

      setReferenceSummary(
        data.summary
      );
    } catch (error) {
      setReferenceError(
        error instanceof Error
          ? error.message
          : "Reference comparison failed."
      );
    } finally {
      setReferenceLoading(false);
    }
  }

  /* =======================================================
     PDF SINGLE
     
     FIX:
     Long DNA/RNA sequences are now:
     - Split into 60 bases per line
     - Numbered by starting position
     - Kept in monospaced font
     - Automatically moved to new pages
     - Prevented from overlapping
  ======================================================= */

  function exportSinglePDF() {
    if (!singleResult) return;

    const pdf = new jsPDF();

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const leftMargin = 20;
    const rightMargin = 20;
    const topMargin = 20;
    const bottomMargin = 20;

    let y = topMargin;

    /* =====================================================
       PAGE CONTROL
    ===================================================== */

    function addPageIfNeeded(
      requiredHeight: number
    ) {
      if (
        y + requiredHeight >
        pageHeight - bottomMargin
      ) {
        pdf.addPage();
        y = topMargin;
      }
    }

    /* =====================================================
       SECTION TITLE
    ===================================================== */

    function addSectionTitle(
      title: string
    ) {
      addPageIfNeeded(20);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(12);

      pdf.text(
        title,
        leftMargin,
        y
      );

      y += 5;

      pdf.setLineWidth(0.3);

      pdf.line(
        leftMargin,
        y,
        pageWidth - rightMargin,
        y
      );

      y += 9;
    }

    /* =====================================================
       SEQUENCE FORMATTER
    ===================================================== */

    function addSequenceSection(
      title: string,
      sequence: string,
      basesPerLine = 60
    ) {
      if (!sequence) return;

      addSectionTitle(title);

      const cleanSequence =
        sequence
          .replace(/\s+/g, "")
          .toUpperCase();

      pdf.setFont(
        "courier",
        "normal"
      );

      pdf.setFontSize(9);

      for (
        let i = 0;
        i < cleanSequence.length;
        i += basesPerLine
      ) {
        addPageIfNeeded(8);

        const chunk =
          cleanSequence.slice(
            i,
            i + basesPerLine
          );

        const position =
          String(i + 1).padStart(
            7,
            " "
          );

        pdf.text(
          `${position}  ${chunk}`,
          leftMargin,
          y
        );

        y += 6;
      }

      y += 6;
    }

    /* =====================================================
       REPORT TITLE
    ===================================================== */

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(20);

    pdf.text(
      "DNA Sequence Analysis Report",
      leftMargin,
      y
    );

    y += 10;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(10);

    pdf.text(
      "Computational Biology / Bioinformatics Analysis",
      leftMargin,
      y
    );

    y += 12;

    pdf.setLineWidth(0.5);

    pdf.line(
      leftMargin,
      y,
      pageWidth - rightMargin,
      y
    );

    y += 12;

    /* =====================================================
       SAMPLE INFORMATION
    ===================================================== */

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(12);

    pdf.text(
      "Sample Information",
      leftMargin,
      y
    );

    y += 8;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(10);

    pdf.text(
      `Sample: ${
        singleResult.sample_name ||
        "Single DNA Sample"
      }`,
      leftMargin,
      y
    );

    y += 7;

    pdf.text(
      `Sequence Length: ${
        singleResult.length || 0
      } bp`,
      leftMargin,
      y
    );

    y += 12;

    /* =====================================================
       NUCLEOTIDE COMPOSITION
    ===================================================== */

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(12);

    pdf.text(
      "Nucleotide Composition",
      leftMargin,
      y
    );

    y += 8;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(10);

    pdf.text(
      `Adenine (A): ${
        singleResult.A || 0
      }`,
      leftMargin,
      y
    );

    pdf.text(
      `Thymine (T): ${
        singleResult.T || 0
      }`,
      leftMargin + 55,
      y
    );

    y += 7;

    pdf.text(
      `Guanine (G): ${
        singleResult.G || 0
      }`,
      leftMargin,
      y
    );

    pdf.text(
      `Cytosine (C): ${
        singleResult.C || 0
      }`,
      leftMargin + 55,
      y
    );

    y += 7;

    pdf.text(
      `GC Content: ${
        singleResult.GC || 0
      }%`,
      leftMargin,
      y
    );

    pdf.text(
      `AT Content: ${
        singleResult.AT || 0
      }%`,
      leftMargin + 55,
      y
    );

    y += 15;

    /* =====================================================
       DNA SEQUENCE
    ===================================================== */

    addSequenceSection(
      "DNA Sequence",
      singleResult.sequence || ""
    );

    /* =====================================================
       DNA → RNA
    ===================================================== */

    addSequenceSection(
      "DNA → RNA Transcription",
      singleResult.rna || ""
    );

    /* =====================================================
       REVERSE COMPLEMENT
    ===================================================== */

    addSequenceSection(
      "Reverse Complement",
      singleResult.reverse_complement ||
        ""
    );

    /* =====================================================
       PROTEIN TRANSLATION
    ===================================================== */

    if (
      singleResult.protein &&
      singleResult.protein.length > 0
    ) {
      addSectionTitle(
        "RNA → Protein Translation"
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(9);

      pdf.text(
        "Codon",
        leftMargin,
        y
      );

      pdf.text(
        "Amino Acid",
        leftMargin + 45,
        y
      );

      y += 6;

      pdf.setFont(
        "helvetica",
        "normal"
      );

      singleResult.protein.forEach(
        (item) => {
          addPageIfNeeded(7);

          pdf.text(
            item.codon,
            leftMargin,
            y
          );

          pdf.text(
            item.aminoAcid,
            leftMargin + 45,
            y
          );

          y += 6;
        }
      );
    } else {
      addSectionTitle(
        "RNA → Protein Translation"
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      pdf.text(
        "No complete codons available for translation.",
        leftMargin,
        y
      );

      y += 10;
    }

    /* =====================================================
       FOOTER ON EVERY PAGE
    ===================================================== */

    const totalPages =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pdf.setPage(page);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        `DNA Analyzer • Page ${page} of ${totalPages}`,
        leftMargin,
        pageHeight - 10
      );

      pdf.text(
        "Computational Biology",
        pageWidth - 65,
        pageHeight - 10
      );
    }

    /* =====================================================
       SAVE PDF
    ===================================================== */

    pdf.save(
      "DNA_Sequence_Analysis_Report.pdf"
    );
  }

  /* =======================================================
     PDF BATCH
  ======================================================= */

  function exportBatchPDF() {
    if (!referenceResults.length) return;

    const pdf =
      new jsPDF();

    let y = 20;

    pdf.setFontSize(20);

    pdf.text(
      "DNA Reference Comparison Report",
      20,
      y
    );

    y += 14;

    pdf.setFontSize(11);

    pdf.text(
      `Reference Length: ${
        referenceSequence.length
      } bp`,
      20,
      y
    );

    y += 8;

    pdf.text(
      "Match Threshold: 90%",
      20,
      y
    );

    y += 14;

    referenceResults.forEach(
      (result, index) => {
        if (y > 260) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFontSize(12);

        pdf.text(
          result.sample_name ||
            `Sample ${index + 1}`,
          20,
          y
        );

        y += 8;

        pdf.setFontSize(10);

        pdf.text(
          `Length: ${
            result.length || 0
          } bp`,
          20,
          y
        );

        y += 7;

        pdf.text(
          `GC: ${
            result.GC || 0
          }%`,
          20,
          y
        );

        y += 7;

        pdf.text(
          `Similarity: ${
            result.reference_similarity ??
            0
          }%`,
          20,
          y
        );

        y += 7;

        pdf.text(
          `Status: ${
            result.reference_status ||
            "N/A"
          }`,
          20,
          y
        );

        y += 12;
      }
    );

    pdf.save(
      "DNA_Reference_Comparison_Report.pdf"
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <main className="app-shell">

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav className="top-nav">

        <div className="brand">

          <div className="brand-mark">
            <span>A</span>
            <span>T</span>
            <span>G</span>
            <span>C</span>
          </div>

          <div>
            <strong>
              DNA Analyzer
            </strong>

            <small>
              Bioinformatics Platform
            </small>
          </div>

        </div>

        <div className="nav-links">

          <a href="#single-analysis">
            Single Analysis
          </a>

          <a href="#batch-analysis">
            Batch Analysis
          </a>

          <a href="#reference">
            Reference
          </a>

          <a href="#reports">
            Reports
          </a>

        </div>

      </nav>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="hero">

        <div className="hero-text">

          <div className="eyebrow">
            COMPUTATIONAL BIOLOGY
          </div>

          <h1>
            DNA Sequence
            <span>
              Analysis Platform
            </span>
          </h1>

          <p className="hero-description">
            Analyze DNA sequences, identify
            nucleotide composition, transcribe
            DNA to RNA, translate RNA to
            proteins, process multiple samples,
            and compare sequences against a
            reference.
          </p>

          <div className="hero-actions">

            <a
              href="#single-analysis"
              className="primary-button"
            >
              Start Analysis
              <span>→</span>
            </a>

            <a
              href="#batch-analysis"
              className="outline-button"
            >
              Batch Analysis
            </a>

          </div>

          <div className="hero-features">

            <div>
              <strong>
                A/T/G/C
              </strong>
              <span>
                Base composition
              </span>
            </div>

            <div>
              <strong>
                DNA → RNA
              </strong>
              <span>
                Transcription
              </span>
            </div>

            <div>
              <strong>
                RNA → Protein
              </strong>
              <span>
                Translation
              </span>
            </div>

          </div>

        </div>

        <DNAHelix />

      </section>

      {/* ===================================================
          SINGLE ANALYSIS
      =================================================== */}

      <section
        id="single-analysis"
        className="content-section"
      >

        <div className="section-intro">

          <div className="section-index">
            01
          </div>

          <div>
            <div className="section-tag">
              SEQUENCE ANALYSIS
            </div>

            <h2>
              Analyze a DNA Sequence
            </h2>

            <p>
              Enter a nucleotide sequence to
              calculate its fundamental molecular
              characteristics.
            </p>
          </div>

        </div>

        <div className="analysis-layout">

          <div className="sequence-input-panel">

            <div className="panel-header">

              <div>
                <h3>
                  Input Sequence
                </h3>

                <p>
                  Enter DNA using A, T, G and C.
                </p>
              </div>

              <span className="status-dot">
                Ready
              </span>

            </div>

            <textarea
              value={dnaSequence}
              onChange={(event) =>
                setDnaSequence(
                  event.target.value
                )
              }
              placeholder="Example: ATGCGTAAATGCGGCTAGCTAG..."
              className="sequence-input"
            />

            <div className="input-footer">

              <span>
                {dnaSequence
                  .replace(/\s+/g, "")
                  .length}{" "}
                nucleotides
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={analyzeSingleDNA}
                disabled={singleLoading}
              >
                {singleLoading
                  ? "Analyzing..."
                  : "Analyze Sequence →"}
              </button>

            </div>

            {singleError && (
              <div className="error-box">
                {singleError}
              </div>
            )}

          </div>

          <div className="feature-panel">

            <div className="feature-item">

              <div className="feature-number">
                01
              </div>

              <div>
                <strong>
                  Nucleotide Composition
                </strong>

                <p>
                  A, T, G and C base counts,
                  GC and AT percentages.
                </p>
              </div>

            </div>

            <div className="feature-item">

              <div className="feature-number">
                02
              </div>

              <div>
                <strong>
                  Sequence Transformation
                </strong>

                <p>
                  Reverse complement and
                  DNA-to-RNA transcription.
                </p>
              </div>

            </div>

            <div className="feature-item">

              <div className="feature-number">
                03
              </div>

              <div>
                <strong>
                  Protein Translation
                </strong>

                <p>
                  Translate RNA codons into
                  complete amino-acid names.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            RESULTS
        ================================================= */}

        {singleResult && (

          <div className="results-container">

            <div className="results-title">

              <div>
                <div className="section-tag">
                  ANALYSIS COMPLETE
                </div>

                <h3>
                  Sequence Results
                </h3>
              </div>

              <button
                type="button"
                className="small-button"
                onClick={exportSinglePDF}
              >
                Export PDF
              </button>

            </div>

            {/* STATISTICS */}

            <div className="stats-grid">

              <div className="stat-box">
                <span>
                  Sequence Length
                </span>

                <strong>
                  {singleResult.length}
                </strong>

                <small>
                  base pairs
                </small>
              </div>

              <div className="stat-box">
                <StatIcon letter="A" />

                <div>
                  <span>
                    Adenine
                  </span>

                  <strong>
                    {singleResult.A}
                  </strong>
                </div>
              </div>

              <div className="stat-box">
                <StatIcon letter="T" />

                <div>
                  <span>
                    Thymine
                  </span>

                  <strong>
                    {singleResult.T}
                  </strong>
                </div>
              </div>

              <div className="stat-box">
                <StatIcon letter="G" />

                <div>
                  <span>
                    Guanine
                  </span>

                  <strong>
                    {singleResult.G}
                  </strong>
                </div>
              </div>

              <div className="stat-box">
                <StatIcon letter="C" />

                <div>
                  <span>
                    Cytosine
                  </span>

                  <strong>
                    {singleResult.C}
                  </strong>
                </div>
              </div>

              <div className="stat-box highlight">
                <span>
                  GC Content
                </span>

                <strong>
                  {singleResult.GC}%
                </strong>
              </div>

              <div className="stat-box">
                <span>
                  AT Content
                </span>

                <strong>
                  {singleResult.AT}%
                </strong>
              </div>

            </div>

            {/* TRANSFORMATIONS */}

            <div className="result-grid">

              <div className="result-card">

                <div className="result-card-header">
                  <span>
                    DNA SEQUENCE
                  </span>
                </div>

                <div className="sequence-display">
                  {singleResult.sequence}
                </div>

              </div>

              <div className="result-card">

                <div className="result-card-header">
                  <span>
                    REVERSE COMPLEMENT
                  </span>
                </div>

                <div className="sequence-display">
                  {
                    singleResult.reverse_complement
                  }
                </div>

              </div>

              <div className="result-card">

                <div className="result-card-header">
                  <span>
                    DNA → RNA
                  </span>
                </div>

                <div className="sequence-display">
                  {singleResult.rna}
                </div>

              </div>

              <div className="result-card">

                <div className="result-card-header">
                  <span>
                    3-MER FREQUENCY
                  </span>
                </div>

                <div className="mer-grid">

                  {Object.entries(
                    singleResult.three_mer_frequency ||
                      {}
                  ).map(
                    ([mer, count]) => (
                      <div
                        key={mer}
                        className="mer-item"
                      >
                        <strong>
                          {mer}
                        </strong>

                        <span>
                          {count}
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* PROTEIN */}

            <div className="protein-section">

              <div className="result-card-header">
                <span>
                  RNA → PROTEIN
                </span>
              </div>

              {singleResult.protein &&
              singleResult.protein.length > 0 ? (

                <div className="protein-table">

                  <div className="protein-row protein-head">

                    <span>
                      Codon
                    </span>

                    <span>
                      Amino Acid
                    </span>

                  </div>

                  {singleResult.protein.map(
                    (item, index) => (

                      <div
                        className="protein-row"
                        key={`${item.codon}-${index}`}
                      >

                        <span className="codon">
                          {item.codon}
                        </span>

                        <span>
                          {item.aminoAcid}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="empty-result">
                  No complete codons available
                  for translation.
                </div>

              )}

            </div>

          </div>

        )}

      </section>

      {/* ===================================================
          BATCH ANALYSIS
      =================================================== */}

      <section
        id="batch-analysis"
        className="content-section alternate-section"
      >

        <div className="section-intro">

          <div className="section-index">
            02
          </div>

          <div>
            <div className="section-tag">
              HIGH-THROUGHPUT ANALYSIS
            </div>

            <h2>
              Batch DNA Analysis
            </h2>

            <p>
              Upload a CSV containing multiple
              DNA samples and process them in a
              single analysis workflow.
            </p>
          </div>

        </div>

        <div className="upload-layout">

          <div className="upload-panel">

            <div className="upload-icon">
              ↑
            </div>

            <h3>
              Upload Sample Dataset
            </h3>

            <p>
              Select a CSV file containing
              sample names and DNA sequences.
            </p>

            <label className="large-upload-button">

              Choose CSV File

              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
              />

            </label>

            {csvFileName && (
              <div className="selected-file">

                <span className="file-check">
                  ✓
                </span>

                <div>
                  <strong>
                    {csvFileName}
                  </strong>

                  <small>
                    {csvRows.length} rows
                    detected
                  </small>
                </div>

              </div>
            )}

            <div className="format-note">

              <strong>
                Expected format
              </strong>

              <code>
                sample_name,sequence
              </code>

            </div>

            <button
              type="button"
              className="primary-button full-button"
              onClick={analyzeCSV}
              disabled={
                batchLoading ||
                !csvRows.length
              }
            >
              {batchLoading
                ? "Processing Samples..."
                : "Analyze Batch →"}
            </button>

            {batchError && (
              <div className="error-box">
                {batchError}
              </div>
            )}

          </div>

          <div className="batch-info">

            <div className="info-card">

              <span className="info-number">
                01
              </span>

              <div>
                <strong>
                  Upload
                </strong>

                <p>
                  Provide a CSV dataset
                  containing multiple DNA
                  sequences.
                </p>
              </div>

            </div>

            <div className="info-card">

              <span className="info-number">
                02
              </span>

              <div>
                <strong>
                  Process
                </strong>

                <p>
                  Each sequence is validated
                  and analyzed independently.
                </p>
              </div>

            </div>

            <div className="info-card">

              <span className="info-number">
                03
              </span>

              <div>
                <strong>
                  Compare
                </strong>

                <p>
                  Use the resulting samples
                  for reference comparison.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* BATCH TABLE */}

        {batchResults.length > 0 && (

          <div className="results-container">

            <div className="results-title">

              <div>
                <div className="section-tag">
                  BATCH COMPLETE
                </div>

                <h3>
                  Sample Analysis Results
                </h3>
              </div>

              <span className="result-count">
                {batchResults.length}
                {" "}
                Samples
              </span>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Sample
                    </th>

                    <th>
                      Length
                    </th>

                    <th>
                      A
                    </th>

                    <th>
                      T
                    </th>

                    <th>
                      G
                    </th>

                    <th>
                      C
                    </th>

                    <th>
                      GC Content
                    </th>

                    <th>
                      AT Content
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {batchResults.map(
                    (result, index) => (

                      <tr
                        key={`${result.sample_name}-${index}`}
                      >

                        <td className="sample-name">
                          {result.sample_name ||
                            `Sample ${
                              index + 1
                            }`}
                        </td>

                        <td>
                          {result.length} bp
                        </td>

                        <td>
                          {result.A}
                        </td>

                        <td>
                          {result.T}
                        </td>

                        <td>
                          {result.G}
                        </td>

                        <td>
                          {result.C}
                        </td>

                        <td>
                          <strong>
                            {result.GC}%
                          </strong>
                        </td>

                        <td>
                          {result.AT}%
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </section>

      {/* ===================================================
          REFERENCE COMPARISON
      =================================================== */}

      <section
        id="reference"
        className="content-section"
      >

        <div className="section-intro">

          <div className="section-index">
            03
          </div>

          <div>

            <div className="section-tag">
              REFERENCE ANALYSIS
            </div>

            <h2>
              Reference Comparison
            </h2>

            <p>
              Compare every batch sample against
              a reference DNA sequence and
              identify MATCH or MISMATCH results.
            </p>

          </div>

        </div>

        <div className="reference-panel">

          <div className="reference-tabs">

            <button
              type="button"
              className={
                referenceMode === "type"
                  ? "reference-tab active"
                  : "reference-tab"
              }
              onClick={() => {
                setReferenceMode("type");
                setReferenceError("");
              }}
            >
              <span>
                01
              </span>

              Type / Paste
            </button>

            <button
              type="button"
              className={
                referenceMode === "upload"
                  ? "reference-tab active"
                  : "reference-tab"
              }
              onClick={() => {
                setReferenceMode("upload");
                setReferenceError("");
              }}
            >
              <span>
                02
              </span>

              Upload File
            </button>

          </div>

          {/* TYPE */}

          {referenceMode === "type" && (

            <div className="reference-input">

              <label>
                Reference DNA Sequence
              </label>

              <textarea
                value={
                  referenceSequence
                }
                onChange={
                  handleReferenceText
                }
                placeholder="Paste or type the reference DNA sequence..."
              />

              <div className="reference-helper">

                <span>
                  Only A, T, G and C
                </span>

                <span>
                  {referenceSequence
                    .replace(/\s+/g, "")
                    .length}{" "}
                  bp
                </span>

              </div>

            </div>

          )}

          {/* UPLOAD */}

          {referenceMode === "upload" && (

            <div className="reference-file-upload">

              <label className="reference-upload-box">

                <div className="reference-upload-icon">
                  ↑
                </div>

                <strong>
                  Upload Reference File
                </strong>

                <span>
                  CSV, TXT, FASTA or FA
                </span>

                <input
                  type="file"
                  accept=".csv,.txt,.fasta,.fa"
                  onChange={
                    handleReferenceUpload
                  }
                />

              </label>

              {referenceFileName && (
                <div className="selected-file">

                  <span className="file-check">
                    ✓
                  </span>

                  <div>
                    <strong>
                      {referenceFileName}
                    </strong>

                    <small>
                      Reference file loaded
                    </small>
                  </div>

                </div>
              )}

            </div>

          )}

          {referenceError && (
            <div className="error-box">
              {referenceError}
            </div>
          )}

          {/* PREVIEW */}

          {referenceSequence && (

            <div className="reference-preview">

              <div className="preview-header">

                <div>
                  <span>
                    REFERENCE SEQUENCE
                  </span>

                  <h3>
                    Reference Ready
                  </h3>
                </div>

                <div className="reference-length">
                  {referenceSequence.length}
                  {" "}
                  bp
                </div>

              </div>

              <div className="reference-sequence">
                {referenceSequence}
              </div>

              <div className="reference-meta">

                <span>
                  Validation:{" "}
                  <strong>
                    Valid DNA
                  </strong>
                </span>

                <span>
                  Match threshold:{" "}
                  <strong>
                    90%
                  </strong>
                </span>

              </div>

            </div>

          )}

          <div className="reference-action">

            <button
              type="button"
              className="primary-button"
              onClick={compareReference}
              disabled={
                referenceLoading ||
                !referenceSequence ||
                !batchResults.length
              }
            >
              {referenceLoading
                ? "Comparing Samples..."
                : "Compare With Reference →"}
            </button>

            {!batchResults.length && (
              <span>
                Complete batch analysis
                before comparison.
              </span>
            )}

          </div>

        </div>

        {/* COMPARISON RESULTS */}

        {referenceSummary && (

          <div className="comparison-results">

            <div className="comparison-header">

              <div>

                <div className="section-tag">
                  COMPARISON COMPLETE
                </div>

                <h3>
                  Reference Comparison Results
                </h3>

              </div>

              <button
                type="button"
                className="small-button"
                onClick={exportBatchPDF}
              >
                Export PDF
              </button>

            </div>

            <div className="comparison-stats">

              <div>
                <span>
                  Total Samples
                </span>

                <strong>
                  {
                    referenceSummary.total_samples
                  }
                </strong>
              </div>

              <div className="match-stat">
                <span>
                  MATCH
                </span>

                <strong>
                  {
                    referenceSummary.matched
                  }
                </strong>
              </div>

              <div className="mismatch-stat">
                <span>
                  MISMATCH
                </span>

                <strong>
                  {
                    referenceSummary.mismatched
                  }
                </strong>
              </div>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Sample
                    </th>

                    <th>
                      Length
                    </th>

                    <th>
                      GC %
                    </th>

                    <th>
                      Reference Similarity
                    </th>

                    <th>
                      Classification
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {referenceResults.map(
                    (result, index) => {

                      const isMatch =
                        result.reference_status ===
                        "MATCH";

                      return (

                        <tr
                          key={`${result.sample_name}-${index}`}
                        >

                          <td className="sample-name">
                            {result.sample_name ||
                              `Sample ${
                                index + 1
                              }`}
                          </td>

                          <td>
                            {result.length} bp
                          </td>

                          <td>
                            {result.GC}%
                          </td>

                          <td>

                            <div className="similarity-cell">

                              <strong>
                                {
                                  result.reference_similarity ??
                                  0
                                }%
                              </strong>

                              <div className="similarity-bar">

                                <span
                                  style={{
                                    width: `${Math.min(
                                      result.reference_similarity ||
                                        0,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          <td>

                            <span
                              className={
                                isMatch
                                  ? "match-badge"
                                  : "mismatch-badge"
                              }
                            >
                              {isMatch
                                ? "✓ MATCH"
                                : "× MISMATCH"}
                            </span>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            <div className="scientific-note">

              <strong>
                Method note
              </strong>

              <p>
                Similarity is calculated using
                positional nucleotide comparison
                between each sample and the
                reference sequence. A similarity
                of 90% or higher is classified as
                MATCH. This is a computational
                screening metric and not a
                clinically validated purity test.
              </p>

            </div>

          </div>

        )}

      </section>

      {/* ===================================================
          REPORTS
      =================================================== */}

      <section
        id="reports"
        className="content-section report-section"
      >

        <div className="section-intro">

          <div className="section-index">
            04
          </div>

          <div>

            <div className="section-tag">
              DOCUMENTATION
            </div>

            <h2>
              Analysis Reports
            </h2>

            <p>
              Generate PDF reports from your
              sequence and reference analyis.
            </p>

          </div>

        </div>

        <div className="report-grid">

          <div className="report-card">

            <div className="report-icon">
              PDF
            </div>

            <div>

              <h3>
                Single Sequence Report
              </h3>

              <p>
                Export sequence composition,
                reverse complement, RNA
                transcription and protein
                translation.
              </p>

              <button
                type="button"
                className="outline-button"
                onClick={
                  exportSinglePDF
                }
                disabled={!singleResult}
              >
                Generate Report →
              </button>

            </div>

          </div>

          <div className="report-card">

            <div className="report-icon">
              PDF
            </div>

            <div>

              <h3>
                Batch Comparison Report
              </h3>

              <p>
                Export sample results,
                reference similarity and
                MATCH/MISMATCH classifications.
              </p>

              <button
                type="button"
                className="outline-button"
                onClick={
                  exportBatchPDF
                }
                disabled={
                  !referenceResults.length
                }
              >
                Generate Report →
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="brand-mark">
            <span>A</span>
            <span>T</span>
            <span>G</span>
            <span>C</span>
          </div>

          <div>

            <strong>
              DNA Analyzer
            </strong>

            <span>
              Computational Biology
            </span>

          </div>

        </div>

        <p>
          DNA sequence analysis platform
          for computational biology and
          bioinformatics workflows.
        </p>

        <span className="footer-copy">
          Bioinformatics • Genomics •
          Computational Biology
        </span>

      </footer>

    </main>
  );
}