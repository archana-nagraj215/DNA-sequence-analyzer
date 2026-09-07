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

  for (let i = 0; i + 2 < rna.length; i += 3) {
    const codon = rna.substring(i, i + 3);

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

  return {
    sample_name: sampleName,

    sequence: dna,

    length,

    A: counts.A,
    T: counts.T,
    G: counts.G,
    C: counts.C,

    GC: Number(gc.toFixed(2)),
    AT: Number(at.toFixed(2)),

    reverse_complement: reverseComplement(dna),

    rna,

    protein: translateRNA(rna),

    three_mer_frequency: calculate3Mer(dna),
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
    const body = await request.json();

    const samples = body.samples || [];

    const reference = body.reference
      ? cleanDNA(body.reference)
      : null;

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

    /* -------------------------------------------------------
       CHECK REFERENCE
    ------------------------------------------------------- */

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
  } catch (error) {
    console.error(
      "DNA ANALYSIS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "DNA analysis failed.",
      },
      { status: 500 }
    );
  }
}