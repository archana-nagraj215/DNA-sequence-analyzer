import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MATCH_THRESHOLD = 90;

/* =========================================================
   RNA CODON TABLE
========================================================= */

const CODON_TABLE = {
  UUU: "Phenylalanine",
  UUC: "Phenylalanine",
  UUA: "Leucine",
  UUG: "Leucine",

  UCU: "Serine",
  UCC: "Serine",
  UCA: "Serine",
  UCG: "Serine",

  UAU: "Tyrosine",
  UAC: "Tyrosine",
  UAA: "STOP",
  UAG: "STOP",

  UGU: "Cysteine",
  UGC: "Cysteine",
  UGA: "STOP",
  UGG: "Tryptophan",

  CUU: "Leucine",
  CUC: "Leucine",
  CUA: "Leucine",
  CUG: "Leucine",

  CCU: "Proline",
  CCC: "Proline",
  CCA: "Proline",
  CCG: "Proline",

  CAU: "Histidine",
  CAC: "Histidine",
  CAA: "Glutamine",
  CAG: "Glutamine",

  CGU: "Arginine",
  CGC: "Arginine",
  CGA: "Arginine",
  CGG: "Arginine",

  AUU: "Isoleucine",
  AUC: "Isoleucine",
  AUA: "Isoleucine",
  AUG: "Methionine",

  ACU: "Threonine",
  ACC: "Threonine",
  ACA: "Threonine",
  ACG: "Threonine",

  AAU: "Asparagine",
  AAC: "Asparagine",
  AAA: "Lysine",
  AAG: "Lysine",

  AGU: "Serine",
  AGC: "Serine",
  AGA: "Arginine",
  AGG: "Arginine",

  GUU: "Valine",
  GUC: "Valine",
  GUA: "Valine",
  GUG: "Valine",

  GCU: "Alanine",
  GCC: "Alanine",
  GCA: "Alanine",
  GCG: "Alanine",

  GAU: "Aspartic Acid",
  GAC: "Aspartic Acid",
  GAA: "Glutamic Acid",
  GAG: "Glutamic Acid",

  GGU: "Glycine",
  GGC: "Glycine",
  GGA: "Glycine",
  GGG: "Glycine",
};

/* =========================================================
   DNA COMPLEMENT
========================================================= */

const COMPLEMENT = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

/* =========================================================
   CLEAN DNA
========================================================= */

function cleanDNA(sequence) {
  if (!sequence) return "";

  return String(sequence)
    .toUpperCase()
    .replace(/\s+/g, "");
}

/* =========================================================
   VALIDATE DNA
========================================================= */

<<<<<<< HEAD
function analyzeDNA(sequence) {

  // ---------------------------------------------------
  // Check type
  // ---------------------------------------------------

  if (typeof sequence !== "string") {
    return {
      error: "DNA sequence must be a string.",
    };
  }

  // ---------------------------------------------------
  // Clean sequence
  // ---------------------------------------------------

  sequence = sequence
    .toUpperCase()
    .replace(/\s/g, "")
    .trim();

  // ---------------------------------------------------
  // Empty sequence
  // ---------------------------------------------------

  if (!sequence) {
    return {
      error: "Please enter a DNA sequence.",
    };
  }

  // ---------------------------------------------------
  // Validate DNA
  // ---------------------------------------------------

  if (!/^[ATGC]+$/.test(sequence)) {
    return {
      error:
        "Invalid DNA sequence. Only A, T, G, and C bases are allowed.",
    };
  }

  // =====================================================
  // BASE COUNTS
  // =====================================================

  const num_A =
    (sequence.match(/A/g) || []).length;

  const num_T =
    (sequence.match(/T/g) || []).length;

  const num_G =
    (sequence.match(/G/g) || []).length;

  const num_C =
    (sequence.match(/C/g) || []).length;

  // =====================================================
  // SEQUENCE LENGTH
  // =====================================================

  const length = sequence.length;

  // =====================================================
  // GC CONTENT
  // =====================================================

  const GC = Number(
    (
      ((num_G + num_C) / length) *
      100
    ).toFixed(2)
  );

  // =====================================================
  // AT CONTENT
  // =====================================================

  const AT = Number(
    (
      ((num_A + num_T) / length) *
      100
    ).toFixed(2)
  );

  // =====================================================
  // REVERSE COMPLEMENT
  // =====================================================

  const complement = {
    A: "T",
    T: "A",
    G: "C",
    C: "G",
=======
function validateDNA(sequence) {
  return /^[ATGC]+$/.test(sequence);
}

/* =========================================================
   COUNT BASES
========================================================= */

function countBases(sequence) {
  return {
    A: [...sequence].filter((base) => base === "A").length,
    T: [...sequence].filter((base) => base === "T").length,
    G: [...sequence].filter((base) => base === "G").length,
    C: [...sequence].filter((base) => base === "C").length,
>>>>>>> reference-comparison
  };
}

/* =========================================================
   REVERSE COMPLEMENT
========================================================= */

function reverseComplement(sequence) {
  return [...sequence]
    .reverse()
    .map((base) => COMPLEMENT[base])
    .join("");
}

/* =========================================================
   DNA → RNA
========================================================= */

function transcribeDNA(sequence) {
  return sequence.replace(/T/g, "U");
}

/* =========================================================
   RNA → PROTEIN
========================================================= */

function translateRNA(rna) {
  const protein = [];

<<<<<<< HEAD
  for (
    let i = 0;
    i <= RNA.length - 3;
    i += 3
  ) {
    const codon = RNA.substring(i, i + 3);
=======
  for (let i = 0; i + 2 < rna.length; i += 3) {
    const codon = rna.substring(i, i + 3);
>>>>>>> reference-comparison

    const aminoAcid = CODON_TABLE[codon];

    if (!aminoAcid) continue;

    protein.push({
      codon,
      aminoAcid,
    });

    if (aminoAcid === "STOP") {
      break;
    }
  }

  return protein;
}

/* =========================================================
   3-MER FREQUENCY
========================================================= */

function calculate3Mer(sequence) {
  const frequency = {};

<<<<<<< HEAD
  // =====================================================
  // RETURN RESULT
  // =====================================================
=======
  for (let i = 0; i <= sequence.length - 3; i++) {
    const mer = sequence.substring(i, i + 3);

    frequency[mer] = (frequency[mer] || 0) + 1;
  }

  return frequency;
}

/* =========================================================
   DNA ANALYSIS
========================================================= */

function analyzeDNA(sequence, sampleName = "Sample") {
  const dna = cleanDNA(sequence);

  if (!dna) {
    throw new Error("DNA sequence is empty.");
  }

  if (!validateDNA(dna)) {
    throw new Error(
      "Invalid DNA sequence. Only A, T, G and C are allowed."
    );
  }

  const counts = countBases(dna);

  const length = dna.length;

  const gc =
    length > 0
      ? ((counts.G + counts.C) / length) * 100
      : 0;

  const at =
    length > 0
      ? ((counts.A + counts.T) / length) * 100
      : 0;

  const rna = transcribeDNA(dna);
>>>>>>> reference-comparison

  return {
    sample_name: sampleName,

    sequence: dna,

    // Sequence length
    length,

    A: counts.A,
    T: counts.T,
    G: counts.G,
    C: counts.C,

<<<<<<< HEAD
    // Explicit names for CSV analysis
    num_A,
    num_T,
    num_G,
    num_C,
=======
    GC: Number(gc.toFixed(2)),
    AT: Number(at.toFixed(2)),
>>>>>>> reference-comparison

    reverse_complement: reverseComplement(dna),

<<<<<<< HEAD
    // Explicit CSV-friendly names
    gc_content: GC,
    at_content: AT,
=======
    rna,
>>>>>>> reference-comparison

    protein: translateRNA(rna),

<<<<<<< HEAD
    RNA,

    protein: proteinSequence,

    // K-mer frequency
    kmer_3_freq,
=======
    three_mer_frequency: calculate3Mer(dna),
>>>>>>> reference-comparison
  };
}

/* =========================================================
   REFERENCE COMPARISON
========================================================= */

function compareWithReference(sequence, reference) {
  const sample = cleanDNA(sequence);
  const ref = cleanDNA(reference);

  if (!sample || !ref) {
    return {
      similarity: 0,
      status: "MISMATCH",
    };
  }

  const maxLength = Math.max(
    sample.length,
    ref.length
  );

  let matches = 0;

  for (let i = 0; i < maxLength; i++) {
    if (
      sample[i] &&
      ref[i] &&
      sample[i] === ref[i]
    ) {
      matches++;
    }
  }

  const similarity =
    (matches / maxLength) * 100;

  return {
    similarity: Number(similarity.toFixed(2)),

    status:
      similarity >= MATCH_THRESHOLD
        ? "MATCH"
        : "MISMATCH",
  };
}

/* =========================================================
   POST API
========================================================= */

export async function POST(request) {
  try {
<<<<<<< HEAD

    // ---------------------------------------------------
    // Read request body
    // ---------------------------------------------------

    const body = await request.json();

    // ===================================================
    // CSV ANALYSIS
    // ===================================================

    /*
      Expected format:

      {
        "samples": [
          {
            "sample_name": "Sample_01",
            "sequence": "ATGCGTAGCTAG"
          },
          {
            "sample_name": "Sample_02",
            "sequence": "GGCTTAACCGGT"
          }
        ]
      }
    */

    if (Array.isArray(body?.samples)) {

      const results = body.samples.map(
        (row, index) => {

          // ---------------------------------------------
          // Get sample name
          // ---------------------------------------------

          const sample_name =
            row?.sample_name ||
            `Sample_${index + 1}`;

          // ---------------------------------------------
          // Get sequence
          // ---------------------------------------------

          const sequence =
            row?.sequence;

          // ---------------------------------------------
          // Analyze sequence
          // ---------------------------------------------

          const result =
            analyzeDNA(sequence);

          // ---------------------------------------------
          // Return sample name + analysis
          // ---------------------------------------------

          return {
            sample_name,
            ...result,
          };
        }
      );

      // -----------------------------------------------
      // Return all CSV results
      // -----------------------------------------------

      return NextResponse.json(
        {
          success: true,
          total_samples: results.length,
          results,
        },
        {
          status: 200,
        }
      );
    }

    // ===================================================
    // SINGLE DNA SEQUENCE ANALYSIS
    // ===================================================

    const sequence =
      body?.sequence;
=======
    const body = await request.json();

    const samples = body.samples || [];

    const reference = body.reference
      ? cleanDNA(body.reference)
      : null;
>>>>>>> reference-comparison

    /* -------------------------------------------------------
       CHECK SAMPLES
    ------------------------------------------------------- */

    if (
      !Array.isArray(samples) ||
      samples.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No DNA samples provided.",
        },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // ---------------------------------------------------
    // Analyze single sequence
    // ---------------------------------------------------
=======
    /* -------------------------------------------------------
       CHECK REFERENCE
    ------------------------------------------------------- */
>>>>>>> reference-comparison

    if (
      reference &&
      !validateDNA(reference)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid reference sequence. Only A, T, G and C are allowed.",
        },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------
       ANALYZE ALL SAMPLES
    ------------------------------------------------------- */

    const results = [];

    for (
      let index = 0;
      index < samples.length;
      index++
    ) {
      const sample = samples[index];

      const sequence =
        typeof sample === "string"
          ? sample
          : sample.sequence;

      const sampleName =
        typeof sample === "string"
          ? `Sample ${index + 1}`
          : sample.sample_name ||
            sample.sampleID ||
            sample.sample ||
            `Sample ${index + 1}`;

      const analysis = analyzeDNA(
        sequence,
        sampleName
      );

      /* -----------------------------------------------------
         REFERENCE COMPARISON
      ----------------------------------------------------- */

      if (reference) {
        const comparison =
          compareWithReference(
            analysis.sequence,
            reference
          );

        analysis.reference_similarity =
          comparison.similarity;

        analysis.reference_status =
          comparison.status;
      }
<<<<<<< HEAD
    );

=======

      results.push(analysis);
    }

    /* -------------------------------------------------------
       SUMMARY
    ------------------------------------------------------- */

    const matched = results.filter(
      (result) =>
        result.reference_status === "MATCH"
    ).length;

    const mismatched = results.filter(
      (result) =>
        result.reference_status === "MISMATCH"
    ).length;

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      results,

      reference,

      threshold: MATCH_THRESHOLD,

      summary: {
        total_samples: results.length,

        matched,

        mismatched,
      },
    });
>>>>>>> reference-comparison
  } catch (error) {

    console.error(
      "DNA ANALYSIS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
<<<<<<< HEAD
=======

>>>>>>> reference-comparison
        error:
          error instanceof Error
            ? error.message
            : "DNA analysis failed.",
      },
      { status: 500 }
    );
  }
}
