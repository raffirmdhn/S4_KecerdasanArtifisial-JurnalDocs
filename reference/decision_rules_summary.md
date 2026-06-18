# Decision Rules Summary

## Overview

Human-readable summary of the 15 decision rules extracted from the enhanced decision tree (V2). Rules are organized by root branch and ordered by confidence level.

**Model**: Decision Tree V2 (Enhanced with Categorical Features)  
**Accuracy**: 81% (V2 alone), 83% (with policy overrides)  
**Total Rules**: 15 leaf nodes  
**Average Confidence**: 87%

---

## Root Split: Penghasilan_Kategori (Income Category)

The tree first splits on **Penghasilan_Kategori** with three main branches:
- **Low** (Income ≤ Rp 3,000,000): 140 students, generally higher eligibility
- **Mid** (Income Rp 3M - 7M): 240 students, mixed eligibility 
- **High** (Income > Rp 7,000,000): 20 students, generally ineligible

---

## Branch 1: Low Income (≤Rp 3M)

### Rule 1: Low Income + High IPK → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = High (IPK ≥ 3.8)

**Decision**: **Layak** (Eligible)  
**Confidence**: 95%  
**Samples**: 18 students  
**Rationale**: Low income + excellent academics = clear scholarship candidate

---

### Rule 2: Low Income + Mid IPK + High Tanggungan → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Mid (IPK 3.2-3.8)
- Tanggungan_Kategori = High (5-6 dependents)

**Decision**: **Layak** (Eligible)  
**Confidence**: 88%  
**Samples**: 28 students  
**Rationale**: Low income + large family burden + solid academics = high need

---

### Rule 3: Low Income + Mid IPK + Mid Tanggungan + National Achievement → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Mid (IPK 3.2-3.8)
- Tanggungan_Kategori = Mid (3-4 dependents)
- Prestasi_Akademik = Nasional

**Decision**: **Layak** (Eligible)  
**Confidence**: 92%  
**Samples**: 12 students  
**Rationale**: National achievement compensates for moderate tanggungan

---

### Rule 4: Low Income + Mid IPK + Mid Tanggungan + Regional/None + Leadership → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Mid (IPK 3.2-3.8)
- Tanggungan_Kategori = Mid (3-4 dependents)
- Prestasi_Akademik = Regional OR Tidak Ada
- Keaktifan_Organisasi = Pengurus

**Decision**: **Layak** (Eligible)  
**Confidence**: 82%  
**Samples**: 22 students  
**Rationale**: Leadership demonstrates time management + soft skills despite economic challenge

---

### Rule 5: Low Income + Mid IPK + Mid Tanggungan + No Achievement + Not Leader → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Mid (IPK 3.2-3.8)
- Tanggungan_Kategori = Mid (3-4 dependents)
- Prestasi_Akademik = Tidak Ada OR Regional
- Keaktifan_Organisasi = Tidak Aktif OR Anggota

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 73%  
**Samples**: 18 students  
**Rationale**: Low income alone insufficient; need academic/leadership excellence

---

### Rule 6: Low Income + Mid IPK + Low Tanggungan → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Mid (IPK 3.2-3.8)
- Tanggungan_Kategori = Low (1-2 dependents)

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 78%  
**Samples**: 16 students  
**Rationale**: Small family reduces per-capita burden; low income alone not sufficient

---

### Rule 7: Low Income + Low IPK + National Achievement → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Low (IPK < 3.2)
- Prestasi_Akademik = Nasional

**Decision**: **Layak** (Eligible)  
**Confidence**: 85%  
**Samples**: 8 students  
**Rationale**: National achievement offsets lower IPK; demonstrates potential

---

### Rule 8: Low Income + Low IPK + Regional/None → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = Low
- IPK_Kategori = Low (IPK < 3.2)
- Prestasi_Akademik = Regional OR Tidak Ada

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 68%  
**Samples**: 18 students  
**Rationale**: Academic concern; scholarships require minimum performance  
**Note**: Lowest confidence rule - many borderline cases here

---

## Branch 2: Mid Income (Rp 3M - 7M)

### Rule 9: Mid Income + High IPK (>3.45) + National Achievement → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Mid
- IPK > 3.45 (continuous threshold)
- Prestasi_Akademik = Nasional

**Decision**: **Layak** (Eligible)  
**Confidence**: 90%  
**Samples**: 15 students  
**Rationale**: Exceptional academic merit + national recognition compensates for moderate income

---

### Rule 10: Mid Income + High IPK (>3.45) + High Tanggungan + Leadership → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Mid
- IPK > 3.45 (continuous threshold)
- Tanggungan_Kategori = High (5-6 dependents)
- Keaktifan_Organisasi = Pengurus

**Decision**: **Layak** (Eligible)  
**Confidence**: 84%  
**Samples**: 20 students  
**Rationale**: Per-capita income low with large family (3-7M / 6 people = ~500k-1.2M per person)

---

### Rule 11: Mid Income + High IPK (>3.45) + Regional/None + Not Large Family → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = Mid
- IPK > 3.45 (continuous threshold)
- Prestasi_Akademik = Regional OR Tidak Ada
- Tanggungan_Kategori = Low OR Mid

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 81%  
**Samples**: 35 students  
**Rationale**: Comfortable income with small/moderate family; no exceptional achievement

---

### Rule 12: Mid Income + Mid IPK (3.20-3.45) + High Tanggungan → **LAYAK** ✅
**Conditions**:
- Penghasilan_Kategori = Mid
- IPK ≤ 3.45 AND IPK ≥ 3.20 (continuous thresholds)
- Tanggungan_Kategori = High (5-6 dependents)

**Decision**: **Layak** (Eligible)  
**Confidence**: 79%  
**Samples**: 25 students  
**Rationale**: Large family burden makes mid-income tight; solid academic performance

---

### Rule 13: Mid Income + Mid IPK (3.20-3.45) + Low/Mid Tanggungan → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = Mid
- IPK ≤ 3.45 AND IPK ≥ 3.20 (continuous thresholds)
- Tanggungan_Kategori = Low OR Mid (1-4 dependents)

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 86%  
**Samples**: 50 students  
**Rationale**: Comfortable income for small/moderate family; no special circumstances

---

### Rule 14: Mid Income + Low IPK (<3.20) → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = Mid
- IPK < 3.20

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 92%  
**Samples**: 95 students  
**Rationale**: Academic performance below standard; mid-income sufficient for family

---

## Branch 3: High Income (>Rp 7M)

### Rule 15: High Income → **TIDAK LAYAK** ❌
**Conditions**:
- Penghasilan_Kategori = High (Income > Rp 7,000,000)

**Decision**: **Tidak Layak** (Not Eligible)  
**Confidence**: 95%  
**Samples**: 20 students  
**Rationale**: Affluent family; no economic need regardless of other factors  
**Note**: Pure economic criterion at root level

---

## Rule Statistics

### By Decision

| Decision | Rule Count | Total Samples | Avg Confidence |
|----------|------------|---------------|----------------|
| **Layak** | 7 rules | 148 students | 88% |
| **Tidak Layak** | 8 rules | 252 students | 84% |

### By Confidence Level

| Confidence Range | Rule Count | Notes |
|------------------|------------|-------|
| **90-95%** (Very High) | 5 rules | Clear-cut cases (pure economic or exceptional merit) |
| **80-89%** (High) | 7 rules | Strong signals with minor ambiguity |
| **70-79%** (Moderate) | 2 rules | Borderline cases (Rule 5, Rule 8) |
| **<70%** (Low) | 1 rule | Rule 8 (68%) - most ambiguous cases |

### By Tree Depth

| Depth | Rule Count | Avg Confidence | Complexity |
|-------|------------|----------------|------------|
| **Level 1** | 1 rule | 95% | Single criterion (Rule 15) |
| **Level 2** | 2 rules | 92% | Two criteria |
| **Level 3** | 7 rules | 85% | Three criteria |
| **Level 4** | 5 rules | 82% | Four+ criteria |

**Observation**: Deeper rules (more conditions) have slightly lower confidence due to complexity.

---

## Key Decision Factors

### Primary Factors (Always Important)

1. **Penghasilan_Kategori** (Income Category)
   - Root split criterion
   - IG = 0.245 (highest)
   - Dominates initial classification

2. **IPK / IPK_Kategori** (Academic Performance)
   - Used in 12 of 15 rules
   - Critical for mid-income decisions
   - Threshold: 3.2 (Low/Mid), 3.45 (Mid/High continuous), 3.8 (Mid/High category)

### Secondary Factors (Context-Dependent)

3. **Tanggungan_Kategori** (Family Size)
   - Used in 9 of 15 rules
   - Critical for mid-income + mid-IPK cases
   - Per-capita income consideration

4. **Prestasi_Akademik** (Academic Achievement)
   - Used in 5 of 15 rules
   - Can override other negative signals
   - National achievement most valuable

### Tertiary Factors (Tiebreakers)

5. **Keaktifan_Organisasi** (Leadership)
   - Used in 3 of 15 rules
   - Leadership (Pengurus) provides edge in borderline cases

6. **SKS_Lulus** (Credits Completed)
   - Not directly used in final rules (absorbed by IPK correlation)
   - Considered in manual calculations but not selected by tree

---

## Policy Override Exceptions

After tree classification, 4 policy override rules can modify predictions:

### Override A: High-Need Exception
**Triggers**: IPK ≥3.3 AND Income ≤5M AND (Tanggungan ≥6 OR National+Leadership+Tang≥3)  
**Changes**: "Tidak Layak" → "Layak"  
**Applied**: 3 cases (all correct)

### Override B: High Achiever + Large Family
**Triggers**: IPK_Kategori=High AND Tanggungan_Kategori=High AND Income 5.1-7M  
**Changes**: "Tidak Layak" → "Layak"  
**Applied**: 1 case (incorrect - needs refinement)

### Override C: Low Confidence Flag
**Triggers**: Confidence <70%  
**Changes**: None (flags for human review)  
**Applied**: 8 cases

---

## Rule Interpretation Guide

### How to Apply Rules

1. **Start at Root**: Check income category first
2. **Follow Path**: Navigate through conditions sequentially
3. **First Match Wins**: Apply first rule where all conditions are TRUE
4. **Consider Overrides**: Check if policy exceptions apply
5. **Review Flags**: If confidence <70%, recommend human review

### Example: Student Profile

**Given**:
- IPK: 3.35
- Income: Rp 4,200,000
- Tanggungan: 6
- Prestasi: Tidak Ada
- Keaktifan: Anggota

**Step 1**: Penghasilan_Kategori = Low (4.2M ≤ 3M? No, but ≤7M? Yes) → Actually Low (≤3M)  
Wait, 4.2M > 3M, so Penghasilan_Kategori = **Mid**

**Step 2**: IPK = 3.35, so IPK check: 3.35 > 3.45? **No**

**Step 3**: IPK check: 3.20 ≤ 3.35 ≤ 3.45? **Yes** (Mid IPK range)

**Step 4**: Tanggungan_Kategori = High (6 ≥ 5)

**Step 5**: Matches **Rule 12**: Mid Income + Mid IPK + High Tanggungan → **Layak**

**Result**: Eligible (79% confidence)

---

## Common Patterns

### Automatic Acceptance (High Confidence)

- Low income + High IPK (Rule 1: 95%)
- Low income + Mid IPK + High Tanggungan (Rule 2: 88%)
- Any income + National achievement + good academics (Rule 3: 92%, Rule 9: 90%)

### Automatic Rejection (High Confidence)

- High income (>7M) regardless of other factors (Rule 15: 95%)
- Mid income + Low IPK (Rule 14: 92%)
- Mid income + Mid IPK + Small family (Rule 13: 86%)

### Borderline Cases (Lower Confidence)

- Low income + Low IPK + No exceptional achievement (Rule 8: 68%)
- Low income + Mid IPK + Mid tanggungan + No achievement/leadership (Rule 5: 73%)

---

## Usage Recommendations

### For Scholarship Committee

- **Rules 1-7**: Low-income students (prioritize by confidence)
- **Rules 9-14**: Mid-income students (stricter criteria)
- **Rule 15**: High-income students (automatic rejection)

### For Students

- **Check Rule 1**: If low income + IPK >3.8, very likely eligible
- **Check Rule 15**: If family income >7M, likely ineligible
- **Check Rule 8**: If low income + IPK <3.2 + no national achievement, borderline

### For Model Improvement

- **Review Rule 8**: Lowest confidence (68%) - most errors here
- **Review Rule 5**: Second-lowest (73%) - consider refinement
- **Refine Override B**: Currently 0% success rate - needs tightening

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
