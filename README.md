🧬 DNA Sequence Analyzer  

A full-stack bioinformatics web application for analyzing DNA sequences individually or in batch through CSV upload. The platform performs nucleotide composition analysis, GC/AT content calculation, reverse complement generation, RNA transcription, protein translation, and reference-based sequence comparison. The platform is deployed on Vercel and demonstrates end-to-end full-stack development using Next.js, FastAPI, and PostgreSQL.
Designed for: Bioinformatics • Genomics • Molecular Biology 

Project Overview 

This application enables researchers and students to quickly analyze DNA sequences without requiring command-line bioinformatics tools.
It supports both single sequence analysis and high-throughput CSV analysis, making it suitable for educational demonstrations and small laboratory workflows.

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

Technology Stack 

* Frontend : Next.js 15, React, TypeScript

* Backend : FastAPI, Python

* Database : Neon PostgreSQL 

* Data Processing : Pandas, PapaParse

* Deployment : Vercel 

Screenshots 

* Home Dashboard
  
<img width="1379" height="685" alt="Screenshot 2026-09-03 at 7 54 22 PM" src="https://github.com/user-attachments/assets/2a6b055b-09d7-4d57-84f1-0586d2ed4aa9" />


* Analysing DNA sequence 
  
<img width="1379" height="471" alt="Screenshot 2026-09-03 at 7 56 03 PM" src="https://github.com/user-attachments/assets/cfd96601-9fee-4017-975b-5108e734de04" />


<img width="1384" height="609" alt="Screenshot 2026-09-03 at 7 56 15 PM" src="https://github.com/user-attachments/assets/91431c64-85fd-482c-844a-0a8787252599" />


<img width="1370" height="585" alt="Screenshot 2026-09-03 at 7 56 31 PM" src="https://github.com/user-attachments/assets/5a55dac0-88fb-4d5a-b8d6-d6a99bb7f897" />


* Analysing CSV file and its output
<img width="1369" height="714" alt="Screenshot 2026-09-03 at 7 57 21 PM" src="https://github.com/user-attachments/assets/018881d3-4b33-44b4-95e0-9c2dc290d579" />


<img width="1375" height="567" alt="Screenshot 2026-09-03 at 7 57 50 PM" src="https://github.com/user-attachments/assets/69de2e11-785d-45f4-afad-2c639c2d59e6" />


<img width="1396" height="715" alt="Screenshot 2026-09-03 at 7 58 03 PM" src="https://github.com/user-attachments/assets/3a89de7c-a50c-4a82-b6b4-d55e4cd8815c" />


DNA sequence analyzer workflow :


<img width="340" height="420" alt="Workflow" src="https://github.com/user-attachments/assets/1daf60ce-fca3-447c-86f4-c1bfa3c56564" />
<svg font-family="-apple-system-body, ui-sans-serif, -apple-system, system-ui, &quot;Segoe UI&quot;, Helvetica, &quot;Apple Color Emoji&quot;, Arial, sans-serif, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;" font-weight="400" data-d-component="svg" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" style="color:rgb(255, 255, 255)" viewBox="0 0 340 420" width="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient><linearGradient id="purple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#6D28D9"/></linearGradient><linearGradient id="green" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#047857"/></linearGradient><linearGradient id="orange" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EA580C"/><stop offset="100%" stop-color="#C2410C"/></linearGradient><marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B"/></marker><filter id="shadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/></filter></defs><rect width="340" height="420" rx="18" fill="#F8FAFC"/><rect x="70" y="18" width="200" height="42" rx="10" fill="url(#blue)" filter="url(#shadow)"/><text x="170" y="34" font-size="11" font-family="Arial, Helvetica, sans-serif" fill="#FFFFFF" text-anchor="middle" font-weight="bold"x1="170" y1="128" x2="170" y2="144" stroke="#64748B" stroke-dasharray="4 4" marker-end="url(#arrow)"/><rect x="34" y="144" width="272" height="110" rx="12" fill="url(#purple)" filter="url(#shadow)"/><text x="170" y="160" font-size="11" font-family="Arial, Helvetica, sans-serif" fill="#FFFFFF" text-anchor="middle" font-weight="bold"></svg>


## 🔮 Future Work

### 1. Reference-Based Sequence Comparison
- Support reference/expected marker profiles.
- Compare sample profiles against a selected reference.
- Incorporate GC/AT composition and 3-mer frequency.
- Generate a similarity/purity percentage.
- Classify samples as **Match / Mismatch** based on defined thresholds.

### 2. PDF Report Export
- Generate downloadable PDF reports.
- Include sequence information and analytical metrics.
- Include batch analysis results.
- Provide a structured report suitable for documentation and laboratory workflows.






