import { NextResponse } from "next/server";

export const runtime = "nodejs";

// =====================================================
// RNA CODON TABLE
// =====================================================

const codon_table = {
  AUG: "Methionine",

  UUU: "Phenylalanine",
  UUC: "Phenylalanine",

  UUA: "Leucine",
  UUG: "Leucine",
  CUU: "Leucine",
  CUC: "Leucine",
  CUA: "Leucine",
  CUG: "Leucine",

  AUU: "Isoleucine",
  AUC: "Isoleucine",
  AUA: "Isoleucine",

  GUU: "Valine",
  GUC: "Valine",
  GUA: "Valine",
  GUG: "Valine",

  UCU: "Serine",
  UCC: "Serine",
  UCA: "Serine",
  UCG: "Serine",

  CCU: "Proline",
  CCC: "Proline",
  CCA: "Proline",
  CCG: "Proline",

  ACU: "Threonine",
  ACC: "Threonine",
  ACA: "Threonine",
  ACG: "Threonine",

  GCU: "Alanine",
  GCC: "Alanine",
  GCA: "Alanine",
  GCG: "Alanine",

  UAU: "Tyrosine",
  UAC: "Tyrosine",

  CAU: "Histidine",
  CAC: "Histidine",

  CAA: "Glutamine",
  CAG: "Glutamine",

  AAU: "Asparagine",
  AAC: "Asparagine",

  AAA: "Lysine",
  AAG: "Lysine",

  GAU: "Aspartic Acid",
  GAC: "Aspartic Acid",

  GAA: "Glutamic Acid",
  GAG: "Glutamic Acid",

  UGU: "Cysteine",
  UGC: "Cysteine",

  UGG: "Tryptophan",

  CGU: "Arginine",
  CGC: "Arginine",
  CGA: "Arginine",
  CGG: "Arginine",

  AGA: "Arginine",
  AGG: "Arginine",

  AGU: "Serine",
  AGC: "Serine",

  UAA: "STOP",
  UAG: "STOP",
  UGA: "STOP",
};

// =====================================================
// CALCULATE 3-MER FREQUENCY
// =====================================================

function calculate3MerFrequency(sequence) {
  const kmerCounts = {};

  if (sequence.length < 3) {
    return kmerCounts;
  }

  for (let i = 0; i <= sequence.length - 3; i++) {
    const kmer = sequence.substring(i, i + 3);

    kmerCounts[kmer] =
      (kmerCounts[kmer] || 0) + 1;
  }

  return kmerCounts;
}

// =====================================================
// ANALYZE DNA
// =====================================================

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
  };

  const reverseComplement = sequence
    .split("")
    .reverse()
    .map((base) => complement[base])
    .join("");

  // =====================================================
  // DNA → RNA
  // =====================================================

  const RNA = sequence.replace(/T/g, "U");

  // =====================================================
  // RNA → PROTEIN
  // =====================================================

  const protein = [];

  for (
    let i = 0;
    i <= RNA.length - 3;
    i += 3
  ) {
    const codon = RNA.substring(i, i + 3);

    const aminoAcid =
      codon_table[codon] || "Unknown";

    protein.push(aminoAcid);
  }

  const proteinSequence =
    protein.join(" ");

  // =====================================================
  // 3-MER FREQUENCY
  // =====================================================

  const kmer_3_freq =
    calculate3MerFrequency(sequence);

  // =====================================================
  // RETURN RESULT
  // =====================================================

  return {
    sequence,

    // Sequence length
    length,

    // Base counts
    A: num_A,
    T: num_T,
    G: num_G,
    C: num_C,

    // Explicit names for CSV analysis
    num_A,
    num_T,
    num_G,
    num_C,

    // Composition
    GC,
    AT,

    // Explicit CSV-friendly names
    gc_content: GC,
    at_content: AT,

    // Transformations
    reverseComplement,

    RNA,

    protein: proteinSequence,

    // K-mer frequency
    kmer_3_freq,
  };
}

// =====================================================
// POST API
// =====================================================

export async function POST(request) {
  try {

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

    // ---------------------------------------------------
    // Check sequence
    // ---------------------------------------------------

    if (
      sequence === undefined ||
      sequence === null
    ) {
      return NextResponse.json(
        {
          error:
            "No DNA sequence was provided.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------
    // Analyze single sequence
    // ---------------------------------------------------

    const result =
      analyzeDNA(sequence);

    // ---------------------------------------------------
    // Handle validation error
    // ---------------------------------------------------

    if (result.error) {
      return NextResponse.json(
        result,
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------
    // Successful response
    // ---------------------------------------------------

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "DNA analysis error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while analyzing the DNA sequence.",
      },
      {
        status: 500,
      }
    );
  }
}
