import { NextResponse } from "next/server";

// Complete RNA codon table
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


function analyzeDNA(sequence) {

  // Clean sequence
  sequence = sequence
    .toUpperCase()
    .replace(/ /g, "")
    .replace(/\n/g, "");

  // Validation
  if (!sequence) {
    return {
      error: "Please enter a DNA sequence.",
    };
  }

  if (!/^[ATGC]+$/.test(sequence)) {
    return {
      error:
        "Invalid DNA sequence. Only A, T, G, and C bases are allowed.",
    };
  }

  // Base counting
  const A = (sequence.match(/A/g) || []).length;
  const T = (sequence.match(/T/g) || []).length;
  const G = (sequence.match(/G/g) || []).length;
  const C = (sequence.match(/C/g) || []).length;

  // Sequence length
  const length = sequence.length;

  // GC and AT content
  const GC = Number((((G + C) / length) * 100).toFixed(2));
  const AT = Number((((A + T) / length) * 100).toFixed(2));

  // Reverse complement
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

  // DNA → RNA
  const RNA = sequence.replace(/T/g, "U");

  // RNA → Protein
  const protein = [];

  for (let i = 0; i < RNA.length - 2; i += 3) {
    const codon = RNA.substring(i, i + 3);

    const aminoAcid = codon_table[codon] || "Unknown";

    protein.push(aminoAcid);
  }

  const proteinSequence = protein.join(" ");

  return {
    sequence: sequence,
    length: length,
    A: A,
    T: T,
    G: G,
    C: C,
    GC: GC,
    AT: AT,
    reverseComplement: reverseComplement,
    RNA: RNA,
    protein: proteinSequence,
  };
}


export async function POST(request) {

  try {

    const body = await request.json();

    const sequence = body.sequence;

    const result = analyzeDNA(sequence);

    return NextResponse.json(result);

  } catch (error) {

    return NextResponse.json(
      {
        error: "Something went wrong while analyzing the DNA sequence.",
      },
      {
        status: 500,
      }
    );

  }
}