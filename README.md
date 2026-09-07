🧬 DNA Sequence Analyzer  

A full-stack bioinformatics web application for analyzing DNA sequences individually or in batch through CSV upload. The platform performs nucleotide composition analysis, GC/AT content calculation, reverse complement generation, RNA transcription, protein translation, and reference-based sequence comparison. The platform is deployed on Vercel and demonstrates end-to-end full-stack development using Next.js, FastAPI, and PostgreSQL.
Designed for: Bioinformatics • Genomics • Molecular Biology 

Project Overview 


The **DNA Sequence Analyzer** is a web-based bioinformatics application designed to simplify and automate the analysis of DNA sequences. The application provides a user-friendly interface for performing fundamental DNA sequence analysis and generating organized analytical reports.

The tool allows users to enter a DNA sequence manually or upload sequence data for analysis. It validates DNA sequences and calculates important sequence characteristics such as sequence length, nucleotide composition, GC content, and AT content. It also performs biological sequence transformations including reverse complement generation, DNA-to-RNA transcription, and RNA-to-protein translation.

For larger datasets, the application supports **batch DNA sequence analysis through CSV file upload**, allowing multiple samples to be processed efficiently. Each sample can be analyzed individually and the results are presented in a structured format for easier interpretation.

An additional **Reference Comparison** feature allows users to compare analyzed DNA samples against a reference sequence provided by the user. The application calculates positional nucleotide similarity and classifies samples as **MATCH** or **MISMATCH** using a predefined 90% similarity threshold.

The application also includes **PDF report generation**, enabling users to export single-sequence analysis results and batch reference comparison results into structured reports. Long DNA sequences are automatically formatted across multiple lines and pages to improve readability.

LIVE DEMO
https://dna-sequence-analyzer-two.vercel.app/

Key Features

Feature : Description

* DNA Validation : Detects invalid nucleotide characters

* Base Count : Counts A, T, G, C nucleotides

* GC & AT Analysis : Calculates nucleotide composition percentages

* Reverse Complement : Generates complementary DNA strand

* DNA → RNA : Performs transcription

* RNA → Protein : Translates codons into amino acids

* CSV Batch Analysis : Analyze hundreds of sequences simultaneously

*### 🔬 Reference Comparison

The DNA Sequence Analyzer includes a reference comparison feature for evaluating batch DNA samples against a reference DNA sequence.

**Key capabilities:**
- Upload or paste a reference DNA sequence.
- Supports reference files such as CSV, TXT, FASTA, and FA.
- Compares each sample nucleotide-by-nucleotide with the reference sequence.
- Calculates a similarity percentage for each sample.
- Classifies samples as **MATCH** or **MISMATCH** based on a 90% similarity threshold.
- Provides an overall batch summary showing:
  - Total samples
  - Number of matched samples
  - Number of mismatched samples
- Displays the comparison results in an easy-to-read table.

> **Note:** The similarity score is based on positional nucleotide comparison and is intended for research/educational analysis. It is not a clinically validated purity or diagnostic measurement.

### 📄 PDF Report Export

The application provides PDF export functionality to generate professional analysis reports.

**Single DNA Analysis Report:**
- Sample information
- DNA sequence length
- Nucleotide composition
- A, T, G, and C counts
- GC and AT content
- DNA sequence
- RNA transcription
- Reverse complement
- Protein translation
- Codon and amino-acid information
- Long DNA sequences are automatically formatted across multiple lines and pages for readability.

**Reference Comparison Report:**
- Reference sequence information
- Reference sequence length
- Similarity threshold
- Sample-by-sample comparison results
- Similarity percentage
- MATCH/MISMATCH status
- Batch comparison summary

Reports can be exported directly from the application for documentation, analysis, and project reporting.

Technology Stack 

* Frontend : Next.js , React, TypeScript

* Backend : FastAPI, Python

* Database : Neon PostgreSQL 

* Data Processing : Pandas, PapaParse

* Deployment : Vercel 


DNA sequence analyzer workflow :


                    ┌──────────────────────┐
                    │   DNA Sequence Input │
                    │  Paste / File Upload │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Sequence Validation  │
                    │  A / T / G / C only  │
                    └──────────┬───────────┘
                               │
                               ▼
                 ┌────────────────────────────┐
                 │      DNA Sequence Analysis │
                 └─────────────┬──────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌──────────────┐  ┌──────────────┐
       │ Sequence   │   │ Nucleotide   │  │ GC / AT      │
       │ Length     │   │ Counts       │  │ Content      │
       └────────────┘   └──────────────┘  └──────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                 ┌─────────────────────────┐
                 │ Sequence Transformations│
                 └────────────┬────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
          ┌────────────┐ ┌──────────┐ ┌──────────────┐
          │  Reverse   │ │ DNA → RNA│ │ 3-mer        │
          │ Complement │ │          │ │ Frequency     │
          └────────────┘ └────┬─────┘ └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ RNA → Protein    │
                    │ Translation      │
                    └────────┬─────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │       Batch Analysis    │
                │       (CSV Upload)      │
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │ Reference Comparison    │
                │ Paste / CSV / FASTA/TXT │
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │ Similarity Calculation  │
                │     & Classification    │
                └────────────┬────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              ┌──────────┐      ┌────────────┐
              │  MATCH   │      │  MISMATCH  │
              │  ≥ 90%   │      │   < 90%    │
              └──────────┘      └────────────┘
                    │                 │
                    └────────┬────────┘
                             ▼
                 ┌────────────────────────┐
                 │      PDF Report        │
                 │ Single / Batch Results │
                 └────────────────────────┘








