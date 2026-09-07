import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MATCH_THRESHOLD = 90;

/* =========================================================
   RNA CODON TABLE
========================================================= */

const CODON_TABLE = {
  UUU: "Phenylalanine", UUC: "Phenylalanine",
  UUA: "Leucine", UUG: "Leucine",

  UCU: "Serine", UCC: "Serine",
  UCA: "Serine", UCG: "Serine",

  UAU: "Tyrosine", UAC: "Tyrosine",
  UAA: "STOP", UAG: "STOP",

  UGU: "Cysteine", UGC: "Cysteine",
  UGA: "STOP", UGG: "Tryptophan",

  CUU: "Leucine", CUC: "Leucine",
  CUA: "Leucine", CUG: "Leucine",

  CCU: "Proline", CCC: "Proline",
  CCA: "Proline", CCG: "Proline",

  CAU: "Histidine", CAC: "Histidine",
  CAA: "Glutamine", CAG: "Glutamine",

  CGU: "Arginine", CGC: "Arginine",
  CGA: "Arginine", CGG: "Arginine",

  AUU: "Isoleucine", AUC: "Isoleucine",
  AUA: "Isoleucine", AUG: "Methionine",

  ACU: "Threonine", ACC: "Threonine",
  ACA: "Threonine", ACG: "Threonine",

  AAU: "Asparagine", AAC: "Asparagine",
  AAA: "Lysine", AAG: "Lysine",

  AGU: "Serine", AGC: "Serine",
  AGA: "Arginine", AGG: "Arginine",

  GUU: "Valine", GUC: "Valine",
  GUA: "Valine", GUG: "Valine",

  GCU: "Alanine", GCC: "Alanine",
  GCA: "Alanine", GCG: "Alanine",

  GAU: "Aspartic Acid", GAC: "Aspartic Acid",
  GAA: "Glutamic Acid", GAG: "Glutamic Acid",

  GGU: "Glycine", GGC: "Glycine",
  GGA: "Glycine", GGG: "Glycine"
};

const COMPLEMENT = {
  A: "T",
  T: "A",
  G: "C",
  C: "G"
};

/* ========================================================= */

function cleanDNA(sequence) {
  return String(sequence || "")
    .toUpperCase()
    .replace(/\s+/g, "");
}

function validateDNA(sequence) {
  return /^[ATGC]+$/.test(sequence);
}

function countBases(sequence) {
  return {
    A: [...sequence].filter(x => x === "A").length,
    T: [...sequence].filter(x => x === "T").length,
    G: [...sequence].filter(x => x === "G").length,
    C: [...sequence].filter(x => x === "C").length
  };
}

function reverseComplement(sequence) {
  return [...sequence]
    .reverse()
    .map(base => COMPLEMENT[base])
    .join("");
}

function transcribeDNA(sequence) {
  return sequence.replace(/T/g, "U");
}

function translateRNA(rna) {
  const protein = [];

  for (let i = 0; i + 2 < rna.length; i += 3) {
    const codon = rna.substring(i, i + 3);
    const aminoAcid = CODON_TABLE[codon];

    if (!aminoAcid) continue;

    protein.push({
      codon,
      aminoAcid
    });

    if (aminoAcid === "STOP") break;
  }

  return protein;
}

function calculate3Mer(sequence) {
  const freq = {};

  for (let i = 0; i <= sequence.length - 3; i++) {
    const mer = sequence.substring(i, i + 3);
    freq[mer] = (freq[mer] || 0) + 1;
  }

  return freq;
}

function analyzeDNA(sequence, sampleName = "Sample") {
  const dna = cleanDNA(sequence);

  if (!dna)
    throw new Error("DNA sequence is empty.");

  if (!validateDNA(dna))
    throw new Error(
      "Invalid DNA sequence. Only A, T, G and C are allowed."
    );

  const counts = countBases(dna);
  const length = dna.length;

  const gc = Number(
    (((counts.G + counts.C) / length) * 100).toFixed(2)
  );

  const at = Number(
    (((counts.A + counts.T) / length) * 100).toFixed(2)
  );

  const rna = transcribeDNA(dna);

  return {
    sample_name: sampleName,
    sequence: dna,
    length,

    A: counts.A,
    T: counts.T,
    G: counts.G,
    C: counts.C,

    GC: gc,
    AT: at,

    reverse_complement: reverseComplement(dna),
    rna,

    protein: translateRNA(rna),

    three_mer_frequency: calculate3Mer(dna)
  };
}

/* ========================================================= */

function compareWithReference(sequence, reference) {
  const sample = cleanDNA(sequence);
  const ref = cleanDNA(reference);

  const maxLength = Math.max(sample.length, ref.length);

  let matches = 0;

  for (let i = 0; i < maxLength; i++) {
    if (sample[i] && ref[i] && sample[i] === ref[i]) {
      matches++;
    }
  }

  const similarity = Number(
    ((matches / maxLength) * 100).toFixed(2)
  );

  return {
    similarity,
    status:
      similarity >= MATCH_THRESHOLD
        ? "MATCH"
        : "MISMATCH"
  };
}

/* ========================================================= */

export async function POST(request) {
  try {
    const body = await request.json();

    const samples = body.samples || [];
    const reference = body.reference
      ? cleanDNA(body.reference)
      : null;

    if (!Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No DNA samples provided."
        },
        { status: 400 }
      );
    }

    if (reference && !validateDNA(reference)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reference sequence."
        },
        { status: 400 }
      );
    }

    const results = samples.map((sample, index) => {
      const analysis = analyzeDNA(
        sample.sequence,
        sample.sample_name || `Sample ${index + 1}`
      );

      if (reference) {
        const comp = compareWithReference(
          analysis.sequence,
          reference
        );

        analysis.reference_similarity =
          comp.similarity;

        analysis.reference_status =
          comp.status;
      }

      return analysis;
    });

    const matched = results.filter(
      r => r.reference_status === "MATCH"
    ).length;

    const mismatched = results.filter(
      r => r.reference_status === "MISMATCH"
    ).length;

    return NextResponse.json({
      success: true,
      results,
      reference,
      threshold: MATCH_THRESHOLD,

      summary: {
        total_samples: results.length,
        matched,
        mismatched
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "DNA analysis failed."
      },
      { status: 500 }
    );
  }
}
