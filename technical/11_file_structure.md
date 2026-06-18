# File Structure

## Overview

Complete reference of all files in the project, including purpose, dependencies, and relationships.

---

## Directory Hierarchy

```
generated/
├── dataset/                           # Training and testing data
│   ├── dataset_training_400.csv       # Original training data (400 records)
│   ├── dataset_testing_100.csv        # Original testing data (100 records)
│   ├── dataset_training_400_enhanced.csv  # Training + categorical features
│   └── dataset_testing_100_enhanced.csv   # Testing + categorical features
│
├── 500/                               # Main scripts directory
│   ├── generate_dataset.py            # Dataset generation
│   ├── verify_dataset.py              # Quality assurance checks
│   ├── create_enhanced_features.py    # Feature engineering
│   │
│   ├── level0_entropy_ig_calculation.py  # Manual: Root node calculations
│   ├── level1_entropy_ig_calculation.py  # Manual: Level 1 calculations
│   ├── level2_entropy_ig_calculation.py  # Manual: Level 2 calculations
│   │
│   ├── build_complete_tree.py         # V1: Baseline model (raw features)
│   ├── build_complete_tree_v2.py      # V2: Enhanced model (+ categorical)
│   │
│   ├── test_decision_tree.py          # V1 testing script
│   ├── test_decision_tree_v2.py       # V2 testing script
│   │
│   ├── apply_policy_overrides.py      # V1: Initial overrides (deprecated)
│   ├── apply_policy_overrides_v2.py   # V2: Refined overrides (current)
│   │
│   ├── decision_rules.json            # V1 rules (machine-readable)
│   ├── decision_rules.txt             # V1 rules (human-readable)
│   ├── decision_rules.csv             # V1 rules (spreadsheet)
│   │
│   ├── decision_rules_v2.json         # V2 rules (machine-readable)
│   ├── decision_rules_v2.txt          # V2 rules (human-readable)
│   ├── decision_rules_v2.csv          # V2 rules (spreadsheet)
│   │
│   ├── testing_results.csv            # V1 testing results
│   ├── testing_results_v2.csv         # V2 testing results
│   ├── testing_results_v2_with_overrides.csv        # V1 overrides (deprecated)
│   └── testing_results_v2_with_overrides_refined.csv # V2 overrides (final)
│
└── report_docs/                       # Documentation
    ├── technical/                     # Technical guides (English)
    │   ├── 01_overview.md
    │   ├── 02_environment_setup.md
    │   ├── 03_data_generation.md
    │   ├── 04_feature_engineering.md
    │   ├── 05_model_baseline.md
    │   ├── 06_model_refined.md
    │   ├── 07_policy_overrides.md
    │   ├── 08_testing_evaluation.md
    │   ├── 09_code_walkthrough.md
    │   ├── 10_reproducibility_guide.md
    │   ├── 11_file_structure.md       # This file
    │   └── 12_troubleshooting.md
    │
    ├── reference/                     # Quick reference materials
    │   ├── metrics_summary.csv
    │   ├── error_analysis.csv
    │   ├── decision_rules_summary.md
    │   └── improvement_timeline.md
    │
    └── [Academic reports]             # Formal report chapters (Bahasa Indonesia)
        ├── bab3_hasil.md
        ├── bab4_pembahasan.md
        ├── bab5_kesimpulan.md
        ├── bab6_saran.md
        └── summary_metrics.md
```

---

## Data Files

### Raw Datasets

#### `dataset_training_400.csv`

**Purpose**: Original training data  
**Size**: 400 records  
**Created By**: `generate_dataset.py`  
**Used By**: `build_complete_tree.py` (V1), manual calculation scripts  

**Columns** (7):
- `IPK`: Float, 2.50-4.00 (Grade Point Average)
- `SKS_Lulus`: Integer, 54-72 (Cumulative credits completed)
- `Penghasilan_Ortu`: Integer, 1,500,000-8,000,000 (Monthly family income in Rupiah)
- `Tanggungan`: Integer, 1-6 (Number of family dependents)
- `Prestasi_Akademik`: String, {Tidak Ada, Regional, Nasional} (Academic achievement)
- `Keaktifan_Organisasi`: String, {Tidak Aktif, Anggota, Pengurus} (Organization activity)
- `Status_Beasiswa`: String, {Layak, Tidak Layak} (Scholarship eligibility - ground truth)

**Sample Row**:
```csv
IPK,SKS_Lulus,Penghasilan_Ortu,Tanggungan,Prestasi_Akademik,Keaktifan_Organisasi,Status_Beasiswa
3.45,63,4500000,3,Tidak Ada,Anggota,Layak
```

---

#### `dataset_testing_100.csv`

**Purpose**: Testing/validation data (unseen during training)  
**Size**: 100 records  
**Created By**: `generate_dataset.py`  
**Used By**: `test_decision_tree.py`, `test_decision_tree_v2.py`  

**Structure**: Identical to training dataset (7 columns)  
**Class Distribution**: ~42 Layak, ~58 Tidak Layak

---

### Enhanced Datasets

#### `dataset_training_400_enhanced.csv`

**Purpose**: Training data with additional categorical features  
**Size**: 400 records  
**Created By**: `create_enhanced_features.py`  
**Used By**: `build_complete_tree_v2.py`  

**Columns** (11): Original 7 + 4 categorical:
- All original columns from `dataset_training_400.csv`
- `IPK_Kategori`: String, {Low, Mid, High}
- `Tanggungan_Kategori`: String, {Low, Mid, High}
- `Penghasilan_Kategori`: String, {Low, Mid, High}
- `SKS_Kategori`: String, {Low, Mid, High}

**Sample Row**:
```csv
...,Status_Beasiswa,IPK_Kategori,Tanggungan_Kategori,Penghasilan_Kategori,SKS_Kategori
...,Layak,Mid,Mid,Low,Mid
```

---

#### `dataset_testing_100_enhanced.csv`

**Purpose**: Testing data with categorical features  
**Size**: 100 records  
**Created By**: `create_enhanced_features.py`  
**Used By**: `test_decision_tree_v2.py`  

**Structure**: Identical to enhanced training dataset (11 columns)

---

## Script Files

### Data Generation & Preprocessing

#### `generate_dataset.py`

**Purpose**: Generate synthetic scholarship dataset  
**Input**: None (uses random seed 42)  
**Output**: 
- `../dataset/dataset_training_400.csv`
- `../dataset/dataset_testing_100.csv`

**Key Functions**:
- `generate_ipk()`: Normal distribution, mean=3.2, std=0.4
- `generate_sks()`: Gaussian, mean=63, std=4
- `generate_penghasilan()`: Weighted distribution (35% low, 40% mid, 25% high)
- `generate_tanggungan()`: Weighted, peak at 3-4 people
- `generate_prestasi()`: 60% none, 30% regional, 10% national
- `generate_keaktifan()`: 40% inactive, 35% member, 25% leader
- `determine_status()`: Scoring system, threshold=50/100

**Dependencies**: `csv`, `random`  
**Execution Time**: ~0.8 seconds  
**Deterministic**: Yes (fixed seed)

---

#### `verify_dataset.py`

**Purpose**: Quality assurance checks on generated data  
**Input**: Training and testing CSV files  
**Output**: Console output with validation results  

**Checks Performed**:
- Range validation (IPK 2.5-4.0, SKS 54-72, etc.)
- Outlier detection
- Duplicate checking
- Class balance verification
- Distribution analysis

**Dependencies**: `csv`, `collections`  
**Execution Time**: ~0.2 seconds

---

#### `create_enhanced_features.py`

**Purpose**: Add categorical features to existing datasets  
**Input**: 
- `../dataset/dataset_training_400.csv`
- `../dataset/dataset_testing_100.csv`

**Output**:
- `../dataset/dataset_training_400_enhanced.csv`
- `../dataset/dataset_testing_100_enhanced.csv`

**Key Functions**:
- `categorize_ipk()`: <3.2=Low, 3.2-3.8=Mid, ≥3.8=High
- `categorize_tanggungan()`: 1-2=Low, 3-4=Mid, 5-6=High
- `categorize_penghasilan()`: ≤3M=Low, 3-7M=Mid, >7M=High
- `categorize_sks()`: <60=Low, 60-64=Mid, ≥65=High

**Dependencies**: `csv`  
**Execution Time**: ~0.3 seconds

---

### Manual Calculations (Educational)

#### `level0_entropy_ig_calculation.py`

**Purpose**: Manual calculation of root node split  
**Input**: `../dataset/dataset_training_400.csv`  
**Output**: Console output with detailed calculations  

**Calculations**:
- Parent entropy (all 400 samples)
- Information gain for each feature
- Best split selection

**Result**: Penghasilan_Ortu best feature (IG≈0.23)  
**Dependencies**: `csv`, `math`, `collections`  
**Execution Time**: ~0.5 seconds

---

#### `level1_entropy_ig_calculation.py`

**Purpose**: Manual calculation of Level 1 splits  
**Input**: Training data + Level 0 split results  
**Output**: Detailed calculations for second layer  

**Validates**: Automated tree's Level 1 decisions  
**Dependencies**: `csv`, `math`, `collections`

---

#### `level2_entropy_ig_calculation.py`

**Purpose**: Manual calculation of Level 2 splits  
**Input**: Training data + Level 0-1 split results  
**Output**: Third layer calculations, identifies pure nodes  

**Note**: First pure leaf node typically appears at Level 2  
**Dependencies**: `csv`, `math`, `collections`

---

### Model Building

#### `build_complete_tree.py` (V1 - Baseline)

**Purpose**: Build decision tree with raw features only  
**Input**: `../dataset/dataset_training_400.csv`  
**Output**:
- `decision_rules.json`
- `decision_rules.txt`
- `decision_rules.csv`

**Algorithm**: ID3 with Entropy & Information Gain  
**Features**: 6 original features only  
**Stopping Criteria**: MAX_DEPTH=4, MIN_SAMPLES_LEAF=10, MIN_ENTROPY=0.3, MIN_IG=0.01  
**Result**: 15 leaf nodes, 74% expected accuracy  

**Key Classes**: `TreeNode`  
**Key Functions**: 
- `calculate_entropy()`
- `calculate_information_gain_continuous()`
- `calculate_information_gain_categorical()`
- `find_best_split()`
- `build_tree_recursive()`
- `extract_rules()`

**Dependencies**: `csv`, `math`, `json`, `collections`  
**Execution Time**: ~1.5 seconds

---

#### `build_complete_tree_v2.py` (V2 - Enhanced)

**Purpose**: Build decision tree with enhanced features  
**Input**: `../dataset/dataset_training_400_enhanced.csv`  
**Output**:
- `decision_rules_v2.json`
- `decision_rules_v2.txt`
- `decision_rules_v2.csv`

**Algorithm**: Same as V1 (ID3)  
**Features**: 10 features (6 original + 4 categorical)  
**Stopping Criteria**: Identical to V1  
**Result**: 15 leaf nodes, 81% expected accuracy (+7pp vs V1)  

**Difference from V1**: Only input dataset changed, algorithm identical  
**Dependencies**: `csv`, `math`, `json`, `collections`  
**Execution Time**: ~1.8 seconds

---

### Testing & Evaluation

#### `test_decision_tree.py` (V1 Testing)

**Purpose**: Test baseline model on unseen data  
**Input**: 
- `decision_rules.json`
- `../dataset/dataset_testing_100.csv`

**Output**: `testing_results.csv`

**Metrics Calculated**:
- Confusion matrix (TP, TN, FP, FN)
- Accuracy, Precision, Recall, F1-Score

**Result**: 74% accuracy, 17 FN, 9 FP  
**Dependencies**: `csv`, `json`  
**Execution Time**: ~0.4 seconds

---

#### `test_decision_tree_v2.py` (V2 Testing)

**Purpose**: Test enhanced model on unseen data  
**Input**:
- `decision_rules_v2.json`
- `../dataset/dataset_testing_100_enhanced.csv`

**Output**: `testing_results_v2.csv`

**Structure**: Same as V1 testing script  
**Result**: 81% accuracy, 11 FN, 8 FP  
**Dependencies**: `csv`, `json`  
**Execution Time**: ~0.5 seconds

---

### Policy Overrides

#### `apply_policy_overrides.py` (V1 - Deprecated)

**Purpose**: Initial policy override attempt  
**Input**: `testing_results_v2.csv`  
**Output**: `testing_results_v2_with_overrides.csv`

**Issue**: Too aggressive (15 overrides, 12 FP created)  
**Result**: 72% accuracy (worse than V2 alone)  
**Status**: Deprecated, replaced by V2

**Override Rules (V1)**:
- Rule A: IPK ≥2.5, Income ≤7M, Tanggungan ≥4 (TOO BROAD)

---

#### `apply_policy_overrides_v2.py` (V2 - Current)

**Purpose**: Refined policy overrides with tight constraints  
**Input**: `testing_results_v2.csv`  
**Output**: `testing_results_v2_with_overrides_refined.csv`

**Override Rules (V2)**:
- **Rule A**: IPK ≥3.3 AND Income ≤5M AND (Tanggungan ≥6 OR (Nasional + Tanggungan ≥3 + Pengurus))
- **Rule B**: IPK_Kategori=High AND Tanggungan_Kategori=High AND Income 5.1-7M
- **Rule C**: Flag confidence <70% for human review

**Result**: 4 overrides (3 correct, 1 wrong), 83% accuracy (+2pp vs V2)  
**Key Achievement**: 8 FN (under target ≤10)  

**Dependencies**: `csv`  
**Execution Time**: ~0.4 seconds

---

## Output Files

### Decision Rules

#### `decision_rules_v2.json`

**Purpose**: Machine-readable tree structure  
**Format**: JSON  
**Size**: ~5 KB  

**Structure**:
```json
[
  {
    "rule_id": 1,
    "conditions": [
      {"feature": "Penghasilan_Kategori", "operator": "=", "value": "Low"},
      {"feature": "IPK_Kategori", "operator": "=", "value": "High"}
    ],
    "prediction": "Layak",
    "confidence": 0.95,
    "samples": 18,
    "node_id": "0-Low-High"
  },
  ...
]
```

**Used By**: `test_decision_tree_v2.py`, documentation generation

---

#### `decision_rules_v2.txt`

**Purpose**: Human-readable rule representation  
**Format**: Plain text  
**Size**: ~3 KB  

**Structure**:
```
Rule 1:
  IF Penghasilan_Kategori = Low
     AND IPK_Kategori = High
  THEN Layak
  Confidence: 95%
  Samples: 18
  Node: 0-Low-High

Rule 2:
  ...
```

**Used By**: Documentation, presentations, manual review

---

#### `decision_rules_v2.csv`

**Purpose**: Spreadsheet-compatible rules  
**Format**: CSV  
**Size**: ~2 KB  

**Columns**:
- `Rule_ID`
- `Conditions` (concatenated string)
- `Prediction`
- `Confidence`
- `Samples`
- `Node_ID`

**Used By**: Excel analysis, reporting

---

### Testing Results

#### `testing_results_v2_with_overrides_refined.csv`

**Purpose**: Final model predictions with override information  
**Format**: CSV  
**Size**: ~15 KB  

**Columns** (18):
- Input features: IPK, SKS_Lulus, Penghasilan_Ortu, Tanggungan, Prestasi_Akademik, Keaktifan_Organisasi
- Categorical features: IPK_Kategori, Tanggungan_Kategori, Penghasilan_Kategori, SKS_Kategori
- `Actual_Status`: Ground truth
- `Predicted_Status`: Model V2 output
- `Confidence`: Model confidence score
- `Final_Status`: After policy overrides
- `Override_Applied`: Reason if changed ("None" if unchanged)
- `Is_Correct`: TRUE/FALSE (based on Final_Status vs Actual_Status)

**Sample Row**:
```csv
...,Actual_Status,Predicted_Status,Confidence,Final_Status,Override_Applied,Is_Correct
...,Layak,Tidak Layak,0.72,Layak,Rule A: High-need exception,TRUE
```

**Used By**: Final evaluation, error analysis, reporting

---

## Documentation Files

### Technical Documentation (English)

**Location**: `report_docs/technical/`  
**Format**: Markdown  
**Audience**: Developers, researchers, technical reviewers  

**Files**:
1. `01_overview.md`: Project architecture, goals, tech stack
2. `02_environment_setup.md`: Installation, dependencies, setup
3. `03_data_generation.md`: Dataset creation methodology
4. `04_feature_engineering.md`: Categorical feature design
5. `05_model_baseline.md`: V1 algorithm implementation
6. `06_model_refined.md`: V2 enhancements and improvements
7. `07_policy_overrides.md`: Hybrid ML + policy approach
8. `08_testing_evaluation.md`: Metrics, confusion matrix, validation
9. `09_code_walkthrough.md`: Deep dive into key functions
10. `10_reproducibility_guide.md`: Step-by-step reproduction
11. `11_file_structure.md`: This file
12. `12_troubleshooting.md`: Common issues and solutions

---

### Reference Materials

**Location**: `report_docs/reference/`  
**Format**: Markdown, CSV  
**Audience**: Quick reference, reporting  

**Files** (to be created):
- `metrics_summary.csv`: All metrics in table format
- `error_analysis.csv`: FN/FP case details
- `decision_rules_summary.md`: Human-readable rules
- `improvement_timeline.md`: 74% → 81% → 83% journey

---

### Academic Documentation (Bahasa Indonesia)

**Location**: `report_docs/`  
**Format**: Markdown  
**Audience**: Academic committee, formal report submission  

**Files** (to be created):
- `bab3_hasil.md`: Hasil - experimental results
- `bab4_pembahasan.md`: Pembahasan - analysis and interpretation
- `bab5_kesimpulan.md`: Kesimpulan - conclusions
- `bab6_saran.md`: Saran - recommendations
- `summary_metrics.md`: Quick metrics reference

---

## File Dependencies

### Dependency Graph

```
generate_dataset.py
    ↓
dataset_training_400.csv, dataset_testing_100.csv
    ↓
create_enhanced_features.py
    ↓
dataset_training_400_enhanced.csv, dataset_testing_100_enhanced.csv
    ↓
build_complete_tree_v2.py
    ↓
decision_rules_v2.json/txt/csv
    ↓
test_decision_tree_v2.py
    ↓
testing_results_v2.csv
    ↓
apply_policy_overrides_v2.py
    ↓
testing_results_v2_with_overrides_refined.csv (FINAL)
```

---

## Version History

### V1 (Baseline - 74% accuracy)
- `build_complete_tree.py`
- `test_decision_tree.py`
- `decision_rules.json/txt/csv`
- `testing_results.csv`

### V2 (Enhanced - 81% accuracy)
- `create_enhanced_features.py` (NEW)
- `build_complete_tree_v2.py`
- `test_decision_tree_v2.py`
- `decision_rules_v2.json/txt/csv`
- `testing_results_v2.csv`

### V2 + Overrides V1 (Failed - 72% accuracy)
- `apply_policy_overrides.py` (DEPRECATED)
- `testing_results_v2_with_overrides.csv` (DEPRECATED)

### V2 + Overrides V2 (Final - 83% accuracy)
- `apply_policy_overrides_v2.py` (CURRENT)
- `testing_results_v2_with_overrides_refined.csv` (FINAL)

---

## File Naming Conventions

### Datasets
- Pattern: `dataset_{type}_{size}[_enhanced].csv`
- Examples: `dataset_training_400.csv`, `dataset_testing_100_enhanced.csv`

### Scripts
- Pattern: `{action}_{target}[_v{version}].py`
- Examples: `build_complete_tree_v2.py`, `test_decision_tree.py`

### Results
- Pattern: `{type}_results[_v{version}][_with_{modifier}].csv`
- Examples: `testing_results_v2_with_overrides_refined.csv`

### Documentation
- Pattern: `{number}_{topic}.md` (technical), `bab{number}_{topic}.md` (academic)
- Examples: `01_overview.md`, `bab3_hasil.md`

---

## Storage Estimates

| Category | Files | Total Size |
|----------|-------|------------|
| Datasets | 4 | ~200 KB |
| Scripts | 13 | ~100 KB |
| Rules | 6 | ~15 KB |
| Results | 4 | ~60 KB |
| Documentation | 21 | ~500 KB |
| **Total** | **48** | **~875 KB** |

**Note**: Very lightweight - entire project fits on floppy disk!

---

## Backup Recommendations

### Critical Files (Must Backup)
- All CSV files in `generated/dataset/`
- `decision_rules_v2.json`
- `testing_results_v2_with_overrides_refined.csv`
- All Python scripts
- All documentation files

### Regenerable Files (Optional Backup)
- `.txt` and `.csv` rule files (can regenerate from JSON)
- Intermediate results (can rerun pipeline)

### Backup Command
```bash
# Create backup archive
tar -czf scholarship_tree_backup_$(date +%Y%m%d).tar.gz generated/

# Or zip (Windows)
Compress-Archive -Path generated -DestinationPath scholarship_tree_backup_20260618.zip
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
