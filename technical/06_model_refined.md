# Model Refined (V2)

## Overview

The refined decision tree model (`build_complete_tree_v2.py`) uses enhanced features (categorical + continuous) to achieve 81% accuracy, a 7 percentage point improvement over baseline.

**File**: `generated/500/build_complete_tree_v2.py`

---

## Key Improvements Over V1

| Aspect | V1 Baseline | V2 Refined | Change |
|--------|-------------|------------|--------|
| **Input Dataset** | Raw features only | Enhanced (+ 4 categorical) | +4 features |
| **Accuracy** | 74% | 81% | +7 pp ✅ |
| **Recall** | 59.52% | 73.81% | +14.29 pp ✅ |
| **F1-Score** | 65.79% | 76.54% | +10.75 pp ✅ |
| **Avg Confidence** | 78% | 87% | +9 pp ✅ |
| **False Negatives** | 17 | 11 | -6 ✅ |
| **False Positives** | 9 | 8 | -1 ✅ |

**Key Insight**: Feature engineering delivered more improvement than any hyperparameter tuning could achieve!

---

## Algorithm Differences

### Core Algorithm: UNCHANGED

The tree-building algorithm remains identical to V1:
- Same entropy calculation
- Same information gain logic
- Same stopping criteria (MAX_DEPTH=4, MIN_IG=0.01, etc.)
- Same recursive construction

### What Changed: INPUT FEATURES

```python
# V1: 6 features
features = ['IPK', 'SKS_Lulus', 'Penghasilan_Ortu', 
            'Tanggungan', 'Prestasi_Akademik', 'Keaktifan_Organisasi']

# V2: 10 features (original 6 + 4 categorical)
features = ['IPK', 'SKS_Lulus', 'Penghasilan_Ortu', 
            'Tanggungan', 'Prestasi_Akademik', 'Keaktifan_Organisasi',
            'IPK_Kategori', 'SKS_Kategori', 
            'Penghasilan_Kategori', 'Tanggungan_Kategori']
```

**Philosophy**: Let the tree decide which representation (continuous vs categorical) is optimal for each split!

---

## Feature Selection Behavior

### Tree's Feature Choices by Level

**Level 0 (Root Node)**:
- **Selected**: `Penghasilan_Kategori` (categorical!)
- **IG**: 0.245 (higher than V1's continuous Penghasilan_Ortu at 0.228)
- **Split**: Low / Mid / High (3-way split)
- **Why Better**: Aligns with scholarship policy language, cleaner boundaries

**Level 1 (Second Layer)**:
- **Left Branch (Low Income)**: `IPK_Kategori` (categorical)
  - Split: Low / Mid / High
  - Rationale: For low-income students, clear GPA categories matter
  
- **Middle Branch (Mid Income)**: `IPK` (continuous)
  - Threshold: 3.45
  - Rationale: Fine-grained academic distinction needed for middle-income
  
- **Right Branch (High Income)**: Usually pure or near-pure (Tidak Layak)
  - Rationale: High income = low priority regardless of other factors

**Level 2-4 (Lower Levels)**:
- Mix of categorical (`Tanggungan_Kategori`, `Prestasi_Akademik`) and continuous features
- Tree chooses representation based on local data characteristics

**Observation**: Categorical features dominate higher levels (policy-level decisions), continuous features refine lower levels (edge cases).

---

## Decision Rules Comparison

### V1 Example Rule (Baseline)
```
Rule 3:
IF Penghasilan_Ortu <= 3550000 
   AND IPK <= 3.2015
   AND Prestasi_Akademik = Nasional
THEN Layak
Confidence: 75%
Samples: 12
```

**Issue**: Fine-grained threshold (3.2015) lacks interpretability

### V2 Example Rule (Refined)
```
Rule 3:
IF Penghasilan_Kategori = Low
   AND IPK_Kategori = Mid
   AND Tanggungan_Kategori = High
THEN Layak
Confidence: 88%
Samples: 28
```

**Improvement**: 
- Clear categories (Low/Mid/High) align with human reasoning
- Higher confidence (88% vs 75%)
- More samples (28 vs 12) → more robust rule

---

## Tree Statistics

### V2 Tree Structure

```
Root (Penghasilan_Kategori)
├── Low (Income ≤3M)
│   ├── IPK_Kategori = Low → mostly Tidak Layak
│   ├── IPK_Kategori = Mid
│   │   ├── Tanggungan_Kategori = Low → mixed
│   │   ├── Tanggungan_Kategori = Mid → mostly Layak
│   │   └── Tanggungan_Kategori = High → Layak (high confidence)
│   └── IPK_Kategori = High → Layak (very high confidence)
│
├── Mid (Income 3-7M)
│   ├── IPK ≤ 3.45 → mostly Tidak Layak
│   └── IPK > 3.45
│       ├── Prestasi = Nasional → Layak
│       └── Otherwise → mixed (depends on tanggungan, keaktifan)
│
└── High (Income >7M) → Tidak Layak (very high confidence)
```

**Metrics**:
- **Total Nodes**: 29 (same as V1)
- **Leaf Nodes**: 15 (same as V1)
- **Max Depth**: 4 (same as V1)
- **Average Confidence**: 87% (+9 pp from V1)

**Key Finding**: Same tree size, but much better confidence and accuracy!

---

## Why V2 Works Better

### 1. Alignment with Domain Knowledge

**Human Scholarship Committee Thinking**:
- "This student is from a low-income family" (not "Rp 2.85M")
- "High achiever" (not "IPK 3.67")
- "Large family burden" (not "5 dependents")

**V2 Advantage**: Categorical features match natural decision-making language

### 2. Cleaner Decision Boundaries

**V1 Problem**: Continuous splits create arbitrary thresholds
- Example: IPK 3.2015 vs 3.2016 (meaningless difference)

**V2 Solution**: Categorical bins create zones
- Example: IPK 3.15-3.79 all treated as "Mid" (consistent treatment)

### 3. Reduced Overfitting

**V1 Risk**: Fine-grained splits may fit training noise
- Threshold 3.2015 might be artifact of specific training samples

**V2 Benefit**: Broader categories generalize better
- "Mid" category captures essence without memorizing specifics

### 4. Higher Confidence Scores

**Why?**
- Categorical splits group more similar cases together
- Larger, more homogeneous leaf nodes
- Less noise within each category

**Result**: 87% avg confidence (V2) vs 78% (V1)

---

## Code Changes

### Minimal Modifications Required

The core algorithm remains the same. Only two changes:

**Change 1: Update Feature List**
```python
# V1
FEATURES = ['IPK', 'SKS_Lulus', 'Penghasilan_Ortu', 
            'Tanggungan', 'Prestasi_Akademik', 'Keaktifan_Organisasi']

# V2 (add categorical features)
FEATURES = ['IPK', 'SKS_Lulus', 'Penghasilan_Ortu', 
            'Tanggungan', 'Prestasi_Akademik', 'Keaktifan_Organisasi',
            'IPK_Kategori', 'SKS_Kategori', 
            'Penghasilan_Kategori', 'Tanggungan_Kategori']
```

**Change 2: Update File Paths**
```python
# V1
TRAINING_FILE = '../dataset/dataset_training_400.csv'

# V2 (use enhanced dataset)
TRAINING_FILE = '../dataset/dataset_training_400_enhanced.csv'
```

**That's it!** The algorithm automatically:
- Detects categorical vs continuous features
- Calculates appropriate information gain
- Selects optimal features at each split

---

## Testing Results

### Confusion Matrix (V2)

```
                  Predicted
                 Layak  Tidak Layak
Actual Layak       31       11        (Total: 42)
       Tidak Layak  8       50        (Total: 58)
```

**Metrics**:
- **True Positives (TP)**: 31
- **False Negatives (FN)**: 11
- **False Positives (FP)**: 8
- **True Negatives (TN)**: 50

**Calculated Metrics**:
- Accuracy = (31+50)/100 = **81%**
- Precision = 31/(31+8) = **79.49%**
- Recall = 31/(31+11) = **73.81%**
- F1 = 2×(79.49×73.81)/(79.49+73.81) = **76.54%**

### Error Reduction

| Error Type | V1 Count | V2 Count | Reduction |
|------------|----------|----------|-----------|
| False Negatives | 17 | 11 | -35% ✅ |
| False Positives | 9 | 8 | -11% ✅ |

**Impact**: 6 additional students correctly identified as eligible for scholarship!

---

## Feature Importance Analysis

### Information Gain at Root (V2)

| Feature | IG | Type | Selected? |
|---------|-----|------|-----------|
| **Penghasilan_Kategori** | 0.245 | Categorical | ✅ ROOT |
| Penghasilan_Ortu | 0.228 | Continuous | ❌ |
| IPK_Kategori | 0.198 | Categorical | ✅ Level 1 |
| IPK | 0.185 | Continuous | ✅ Level 1 |
| Tanggungan_Kategori | 0.152 | Categorical | ✅ Level 2 |
| Tanggungan | 0.038 | Continuous | ❌ |
| Prestasi_Akademik | 0.089 | Categorical | ✅ Level 2 |
| SKS_Kategori | 0.048 | Categorical | ✅ Level 3 |
| SKS_Lulus | 0.042 | Continuous | ❌ |
| Keaktifan_Organisasi | 0.015 | Categorical | ✅ Level 3-4 |

**Observations**:
1. Categorical versions consistently have higher IG than continuous counterparts
2. Income (categorical) is strongest single predictor
3. IPK matters differently based on income level (context-dependent importance)
4. Tanggungan becomes important for mid-income + mid-GPA cases

---

## Output Files

### 1. decision_rules_v2.json
Enhanced tree structure with categorical features

### 2. decision_rules_v2.txt
More readable rules:
```
Rule 1: IF Penghasilan_Kategori = Low AND IPK_Kategori = High 
        THEN Layak (confidence: 95%, samples: 18)

Rule 2: IF Penghasilan_Kategori = Low AND IPK_Kategori = Mid 
           AND Tanggungan_Kategori = High 
        THEN Layak (confidence: 88%, samples: 28)

Rule 3: IF Penghasilan_Kategori = High 
        THEN Tidak Layak (confidence: 92%, samples: 20)
```

### 3. decision_rules_v2.csv
For Excel analysis and comparison with V1

---

## Usage Example

```bash
cd generated/500
python build_complete_tree_v2.py
```

**Expected Output**:
```
================================================================================
BUILDING DECISION TREE (V2 - ENHANCED FEATURES)
================================================================================

[1] Loading enhanced training data...
    ✅ Loaded 400 records with 10 features

[2] Building decision tree...
    ✅ Tree built successfully
       - Total nodes: 29
       - Leaf nodes: 15
       - Max depth: 4
       - Avg confidence: 87%

[3] Extracting decision rules...
    ✅ Extracted 15 rules

[4] Saving results...
    ✅ decision_rules_v2.json
    ✅ decision_rules_v2.txt
    ✅ decision_rules_v2.csv

================================================================================
TREE BUILDING COMPLETE!
Expected accuracy on testing: ~81% (improvement from V1: 74%)
================================================================================
```

---

## Validation & Analysis

### Cross-Check with Manual Calculations

**Level 0** (from level0_entropy_ig_calculation.py):
- Manual calculation: Penghasilan_Ortu IG = 0.228705
- V2 uses: Penghasilan_Kategori IG = 0.245
- ✅ Categorical version is better!

**Level 1** (from level1_entropy_ig_calculation.py):
- Manual: IPK splits at 3.20, 3.54
- V2: Uses IPK_Kategori (Low/Mid/High) for some branches, continuous IPK for others
- ✅ Hybrid approach validates manual findings

### Rule Interpretability Check

Ask: "Can a scholarship committee member understand this rule?"

**V1 Rule**: ❌ "IF Income ≤ 3,550,000 AND IPK ≤ 3.2015..."
- Problem: Arbitrary precision (3.2015)

**V2 Rule**: ✅ "IF Income = Low AND IPK = Mid AND Family = Large..."
- Clear: Committee can explain to students

---

## Limitations & Next Steps

### Remaining Issues (V2)

1. **11 False Negatives** still exist (target: ≤10)
   - Students at decision boundaries
   - Edge cases with conflicting signals
   
2. **8 False Positives** 
   - High achievers from affluent families
   - Model may be too generous

### Solution: Policy Override Layer
→ See **07_policy_overrides.md** for surgical corrections (+2 pp improvement)

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
