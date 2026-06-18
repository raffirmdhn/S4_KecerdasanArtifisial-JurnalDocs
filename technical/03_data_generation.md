# Data Generation

## Overview

The `generate_dataset.py` script creates a synthetic scholarship dataset with realistic distributions based on domain knowledge and Indonesian university contexts.

**File**: `generated/500/generate_dataset.py`

---

## Dataset Specifications

### Size & Split
- **Total Records**: 500 students
- **Training Set**: 400 records (80%)
- **Testing Set**: 100 records (20%)
- **Class Distribution**: ~39% Layak, ~61% Tidak Layak (realistic imbalance)

### Output Files
- `../dataset/dataset_training_400.csv`
- `../dataset/dataset_testing_100.csv`

---

## Variable Generation Logic

### 1. IPK (Grade Point Average)

**Type**: Continuous  
**Range**: 2.50 - 4.00  
**Distribution**: Normal (Gaussian)

```python
def generate_ipk():
    """Generate IPK with realistic distribution"""
    ipk = random.gauss(3.2, 0.4)  # Mean=3.2, StdDev=0.4
    return max(2.5, min(4.0, round(ipk, 2)))
```

**Rationale**:
- Mean 3.2: Typical university average
- StdDev 0.4: Natural variation
- Bounds: 2.5 minimum (below = failing), 4.0 maximum (perfect)
- Distribution: Most students cluster around 3.0-3.4

**Statistics** (400 training records):
- Mean: ~3.2
- Range: 2.50 - 4.00
- Distribution: Bell curve centered at 3.2

---

### 2. SKS_Lulus (Completed Credits)

**Type**: Continuous (integer)  
**Range**: 54 - 72 SKS (cumulative for 3 semesters)  
**Distribution**: Normal (Gaussian)

```python
def generate_sks():
    """Generate SKS_Lulus for 3 semesters"""
    sks = int(random.gauss(63, 4))  # Mean=63, StdDev=4
    return max(54, min(72, sks))
```

**Rationale**:
- **Calculation**: 3 semesters × 18-24 SKS/semester = 54-72 total
- Mean 63: 21 SKS/semester (standard pace)
- StdDev 4: Accounts for variation
- Below 54: Too slow (concern)
- Above 72: Overloading (rare)

**Common Mistake**: Early versions used 18-24 (per semester) instead of 54-72 (cumulative)

**Statistics**:
- Mean: ~63 SKS
- Standard pace: 60-66 SKS
- Slow progress: <60 SKS
- Fast progress: >66 SKS

---

### 3. Penghasilan_Ortu (Family Income)

**Type**: Continuous (integer)  
**Range**: Rp 1,500,000 - 8,000,000 per month  
**Distribution**: Weighted towards lower-middle income

```python
def generate_penghasilan():
    """Generate family income with realistic distribution"""
    rand = random.random()
    
    if rand < 0.35:  # 35% low income
        return random.randint(1_500_000, 3_000_000)
    elif rand < 0.75:  # 40% middle income
        return random.randint(3_000_000, 5_000_000)
    else:  # 25% upper-middle income
        return random.randint(5_000_000, 8_000_000)
```

**Rationale**:
- **Low**: <Rp 3M (35%) - High scholarship priority
- **Middle**: Rp 3-5M (40%) - Moderate need
- **Upper-middle**: >Rp 5M (25%) - Lower priority
- Distribution reflects Indonesian socioeconomic reality

**Thresholds**:
- Rp 3M: Poverty line reference
- Rp 5M: Comfortable middle class
- Rp 7M+: Affluent (very low priority)

---

### 4. Tanggungan (Family Dependents)

**Type**: Discrete integer  
**Range**: 1 - 6 people  
**Distribution**: Weighted towards 3-4 members

```python
def generate_tanggungan():
    """Generate number of family dependents"""
    weights = [0.10, 0.15, 0.25, 0.25, 0.15, 0.10]  # For 1-6
    return random.choices([1, 2, 3, 4, 5, 6], weights=weights)[0]
```

**Rationale**:
- 1-2 people (25%): Small family, lower burden
- 3-4 people (50%): Standard family size
- 5-6 people (25%): Large family, high burden
- Higher tanggungan increases scholarship priority

---

### 5. Prestasi_Akademik (Academic Achievement)

**Type**: Categorical  
**Categories**: Tidak Ada, Regional, Nasional  
**Distribution**: Weighted towards no achievement

```python
def generate_prestasi():
    """Generate academic achievement level"""
    weights = [0.60, 0.30, 0.10]  # Tidak Ada, Regional, Nasional
    return random.choices(
        ['Tidak Ada', 'Regional', 'Nasional'], 
        weights=weights
    )[0]
```

**Rationale**:
- **Tidak Ada** (60%): Majority have no special achievements
- **Regional** (30%): Provincial/regional competitions
- **Nasional** (10%): National-level achievements (rare, prestigious)
- Strong positive signal for scholarship

---

### 6. Keaktifan_Organisasi (Organization Activity)

**Type**: Categorical  
**Categories**: Tidak Aktif, Anggota, Pengurus  
**Distribution**: Balanced

```python
def generate_keaktifan():
    """Generate organization activity level"""
    weights = [0.40, 0.35, 0.25]  # Tidak Aktif, Anggota, Pengurus
    return random.choices(
        ['Tidak Aktif', 'Anggota', 'Pengurus'], 
        weights=weights
    )[0]
```

**Rationale**:
- **Tidak Aktif** (40%): Not involved
- **Anggota** (35%): Member (moderate involvement)
- **Pengurus** (25%): Leadership role (high commitment)
- Leadership shows soft skills, time management

---

## Scholarship Status Determination

### Scoring System

```python
def determine_status(ipk, sks, penghasilan, tanggungan, prestasi, keaktifan):
    """Calculate scholarship eligibility based on weighted scoring"""
    score = 0
    
    # IPK contribution (max 30 points)
    if ipk >= 3.5:
        score += 30
    elif ipk >= 3.0:
        score += 20
    elif ipk >= 2.75:
        score += 10
    
    # SKS contribution (max 15 points)
    if sks >= 65:
        score += 15
    elif sks >= 60:
        score += 10
    elif sks >= 54:
        score += 5
    
    # Income contribution (max 30 points) - INVERTED
    if penghasilan <= 2_000_000:
        score += 30
    elif penghasilan <= 3_500_000:
        score += 20
    elif penghasilan <= 5_000_000:
        score += 10
    
    # Tanggungan contribution (max 10 points)
    if tanggungan >= 5:
        score += 10
    elif tanggungan >= 3:
        score += 5
    
    # Prestasi contribution (max 10 points)
    if prestasi == 'Nasional':
        score += 10
    elif prestasi == 'Regional':
        score += 5
    
    # Keaktifan contribution (max 5 points)
    if keaktifan == 'Pengurus':
        score += 5
    elif keaktifan == 'Anggota':
        score += 3
    
    # Total possible: 100 points
    # Threshold: 50 points for Layak
    return 'Layak' if score >= 50 else 'Tidak Layak'
```

**Scoring Breakdown**:
- **IPK**: 30 points (highest weight - academic performance)
- **Income**: 30 points (second highest - economic need)
- **SKS**: 15 points (academic progress)
- **Tanggungan**: 10 points (family burden)
- **Prestasi**: 10 points (achievement bonus)
- **Keaktifan**: 5 points (leadership bonus)

**Threshold**: 50/100 points = Layak

**Expected Distribution**: ~39% Layak, ~61% Tidak Layak

---

## Validation & Quality Checks

### Statistical Validation

The `verify_dataset.py` script performs:

1. **Range Checks**:
   - IPK: 2.50 ≤ x ≤ 4.00
   - SKS: 54 ≤ x ≤ 72
   - Penghasilan: 1.5M ≤ x ≤ 8M
   - Tanggungan: 1 ≤ x ≤ 6

2. **Distribution Checks**:
   - Class balance (not >80% one class)
   - No extreme outliers
   - Realistic distributions

3. **Data Quality**:
   - No duplicates
   - No missing values
   - Consistent encoding

---

## Usage Example

### Generate Dataset

```bash
cd generated/500
python generate_dataset.py
```

**Expected Output**:
```
================================================================================
GENERATE SYNTHETIC SCHOLARSHIP DATASET
================================================================================

[1] Generating 500 student records...
    ✅ Generated 500 records

[2] Determining scholarship status...
    ✅ Status determined
    Distribution: Layak=196, Tidak Layak=304

[3] Splitting into training/testing sets...
    ✅ Training: 400 records
    ✅ Testing: 100 records

[4] Saving datasets...
    ✅ Saved: ../dataset/dataset_training_400.csv
    ✅ Saved: ../dataset/dataset_testing_100.csv

================================================================================
DATASET GENERATION COMPLETE!
================================================================================
```

### Verify Dataset

```bash
python verify_dataset.py
```

**Expected Output**: All validation checks passed ✅

---

## Key Design Decisions

### 1. Why Synthetic Data?

**Rationale**:
- No access to real student data (privacy)
- Control over distributions
- Reproducible experiments
- Can test edge cases

**Validation**: Consulted with scholarship committee for realistic parameters

### 2. Why This Scoring System?

**Rationale**:
- Weights reflect scholarship policy priorities
- IPK + Income = 60% of score (primary factors)
- Creates realistic class imbalance
- Allows for edge cases (high IPK + high income, etc.)

### 3. Why 500 Records?

**Rationale**:
- Large enough to avoid overfitting (previous 150 was too small)
- Realistic for single semester (500+ students typical)
- Manageable for manual calculation verification
- Fast computation (<1 second)

---

## Common Issues & Solutions

### Issue: Class Imbalance Too Extreme

**Symptom**: >80% one class  
**Solution**: Adjust scoring threshold (currently 50/100)

### Issue: Unrealistic Distributions

**Symptom**: Too many high IPK or extreme income  
**Solution**: Review weights in generation functions

### Issue: SKS Range Error

**Symptom**: SKS shows 18-24 instead of 54-72  
**Solution**: Use cumulative calculation (3 semesters × 18-24)

---

## Next Steps

After dataset generation:
1. ✅ Run verification checks
2. ✅ Proceed to **04_feature_engineering.md**
3. ✅ Begin tree building

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-19  
**Status**: Complete
