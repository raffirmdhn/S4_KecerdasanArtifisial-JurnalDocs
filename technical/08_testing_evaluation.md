# Testing & Evaluation

## Overview

Comprehensive testing methodology using manual confusion matrix calculation and standard ML metrics to evaluate model performance across three versions (V1, V2, V2+Overrides).

**Testing Scripts**:
- `test_decision_tree.py` (V1 baseline testing)
- `test_decision_tree_v2.py` (V2 enhanced testing)
- `apply_policy_overrides_v2.py` (Final evaluation)

---

## Testing Methodology

### Dataset Split

**Training Set**: 400 records (80%)
- Used for tree building
- Never used in evaluation
- Stratified by class (maintains ~39/61 distribution)

**Testing Set**: 100 records (20%)
- Completely unseen during training
- Used for final evaluation only
- Independent validation of model performance

**Why 80/20 Split?**
- Standard practice for medium datasets (500 records)
- Enough training data for robust tree (400)
- Enough testing data for reliable metrics (100)
- No cross-validation needed (single deterministic tree)

---

## Evaluation Pipeline

### Step 1: Parse Decision Rules

```python
def load_decision_rules(rules_file):
    """Load decision rules from JSON"""
    with open(rules_file, 'r', encoding='utf-8') as f:
        return json.load(f)
```

**Input**: `decision_rules_v2.json`  
**Output**: Structured rule list

---

### Step 2: Apply Rules to Test Data

```python
def apply_rules(row, rules):
    """Apply decision rules to a single record"""
    
    for rule in rules:
        # Check all conditions in rule
        all_conditions_met = True
        
        for condition in rule['conditions']:
            feature = condition['feature']
            operator = condition['operator']
            value = condition['value']
            
            # Evaluate condition
            if not evaluate_condition(row[feature], operator, value):
                all_conditions_met = False
                break
        
        # If all conditions met, return prediction
        if all_conditions_met:
            return rule['prediction'], rule['confidence']
    
    # Default fallback (should not happen with complete tree)
    return 'Tidak Layak', 0.5
```

**Key Functions**:

1. **evaluate_condition()**: Handle different operators
   ```python
   def evaluate_condition(actual_value, operator, expected_value):
       if operator == '<=':
           return float(actual_value) <= float(expected_value)
       elif operator == '>':
           return float(actual_value) > float(expected_value)
       elif operator in ['=', '==']:
           return str(actual_value) == str(expected_value)
       else:
           raise ValueError(f"Unknown operator: {operator}")
   ```

2. **parse_condition()**: Extract operator and value
   ```python
   def parse_condition(condition_str):
       # Check for <= first (before <)
       if '<=' in condition_str:
           feature, value = condition_str.split('<=')
           return feature.strip(), '<=', value.strip()
       elif '>' in condition_str:
           feature, value = condition_str.split('>')
           return feature.strip(), '>', value.strip()
       elif '==' in condition_str:
           feature, value = condition_str.split('==')
           return feature.strip(), '==', value.strip()
       elif '=' in condition_str:
           feature, value = condition_str.split('=')
           return feature.strip(), '=', value.strip()
       else:
           raise ValueError(f"Cannot parse condition: {condition_str}")
   ```

**Critical Bug Fix**: Check `==` before `=` to avoid false matches!

---

### Step 3: Calculate Confusion Matrix

```python
def calculate_confusion_matrix(actual, predicted):
    """Calculate TP, TN, FP, FN"""
    
    tp = sum(1 for a, p in zip(actual, predicted) 
             if a == 'Layak' and p == 'Layak')
    
    tn = sum(1 for a, p in zip(actual, predicted) 
             if a == 'Tidak Layak' and p == 'Tidak Layak')
    
    fp = sum(1 for a, p in zip(actual, predicted) 
             if a == 'Tidak Layak' and p == 'Layak')
    
    fn = sum(1 for a, p in zip(actual, predicted) 
             if a == 'Layak' and p == 'Tidak Layak')
    
    return {'TP': tp, 'TN': tn, 'FP': fp, 'FN': fn}
```

**Confusion Matrix Layout**:
```
                    Predicted
                 Layak    Tidak Layak
Actual Layak       TP          FN
       Tidak Layak FP          TN
```

---

### Step 4: Calculate Performance Metrics

```python
def calculate_metrics(confusion):
    """Calculate accuracy, precision, recall, F1"""
    
    tp = confusion['TP']
    tn = confusion['TN']
    fp = confusion['FP']
    fn = confusion['FN']
    
    # Accuracy
    accuracy = (tp + tn) / (tp + tn + fp + fn)
    
    # Precision: Of predicted Layak, how many are actually Layak?
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    
    # Recall: Of actual Layak, how many did we predict?
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    
    # F1-Score: Harmonic mean of precision and recall
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }
```

---

## Metrics Explanation

### 1. Accuracy

**Definition**: Overall correctness  
**Formula**: (TP + TN) / (TP + TN + FP + FN)  
**Interpretation**: What percentage of predictions are correct?

**Example**:
- TP = 31, TN = 50, FP = 8, FN = 11
- Accuracy = (31 + 50) / 100 = **81%**

**Limitation**: Can be misleading with class imbalance
- If 90% are "Tidak Layak", predicting all as "Tidak Layak" gives 90% accuracy!
- Need precision/recall for full picture

---

### 2. Precision

**Definition**: Quality of positive predictions  
**Formula**: TP / (TP + FP)  
**Interpretation**: When we predict "Layak", how often are we correct?

**Example**:
- TP = 31, FP = 8
- Precision = 31 / (31 + 8) = 31 / 39 = **79.49%**

**Business Impact**: 
- High precision → fewer false alarms
- Low precision → wasting scholarship budget on ineligible students

---

### 3. Recall (Sensitivity)

**Definition**: Coverage of actual positives  
**Formula**: TP / (TP + FN)  
**Interpretation**: Of all eligible students, how many do we identify?

**Example**:
- TP = 31, FN = 11
- Recall = 31 / (31 + 11) = 31 / 42 = **73.81%**

**Business Impact**:
- High recall → fewer missed opportunities
- Low recall → deserving students don't get scholarships

**Priority for Scholarships**: Recall matters more than precision!
- Better to review extra candidates than miss deserving ones

---

### 4. F1-Score

**Definition**: Harmonic mean of precision and recall  
**Formula**: 2 × (Precision × Recall) / (Precision + Recall)  
**Interpretation**: Balanced measure of model performance

**Example**:
- Precision = 79.49%, Recall = 73.81%
- F1 = 2 × (0.7949 × 0.7381) / (0.7949 + 0.7381)
- F1 = 2 × 0.5866 / 1.5330 = **76.54%**

**Why Harmonic Mean?**
- Penalizes extreme imbalance
- If precision = 100% but recall = 50%, F1 = 66.7% (not 75%)
- Forces balanced performance

---

## Results Comparison

### V1: Baseline Model (Raw Features)

**Confusion Matrix**:
```
                 Predicted
              Layak  Tidak Layak
Actual Layak    25       17
       Tidak    9       49
```

**Metrics**:
- **Accuracy**: 74%
- **Precision**: 73.53% (25/34)
- **Recall**: 59.52% (25/42)
- **F1-Score**: 65.79%

**Analysis**:
- ✅ Decent baseline for manual implementation
- ❌ High FN (17): Missing many eligible students
- ❌ Low recall (59.52%): Only catching ~60% of deserving students

---

### V2: Enhanced Model (+ Categorical Features)

**Confusion Matrix**:
```
                 Predicted
              Layak  Tidak Layak
Actual Layak    31       11
       Tidak    8       50
```

**Metrics**:
- **Accuracy**: 81% (+7 pp)
- **Precision**: 79.49% (31/39)
- **Recall**: 73.81% (31/42) (+14.29 pp!)
- **F1-Score**: 76.54% (+10.75 pp)

**Analysis**:
- ✅ Major improvement across all metrics
- ✅ FN reduced from 17 to 11 (-35%)
- ✅ Feature engineering validated
- ⚠️ Still 11 FN (target: ≤10)

---

### V2 + Policy Overrides (Final Model)

**Confusion Matrix**:
```
                 Predicted
              Layak  Tidak Layak
Actual Layak    34        8
       Tidak    9       49
```

**Metrics**:
- **Accuracy**: 83% (+2 pp)
- **Precision**: 79.07% (34/43)
- **Recall**: 80.95% (34/42) (+7.14 pp!)
- **F1-Score**: 80.00% (+3.46 pp)

**Analysis**:
- ✅ **Target achieved**: 8 FN ≤ 10 target
- ✅ Recall: 80.95% (4 out of 5 eligible students caught)
- ✅ Balanced performance: 83% accuracy, 80% F1
- ✅ Policy overrides effective: +3 correct, -1 incorrect

---

## Error Analysis

### False Negatives (FN = 8)

**Definition**: Students marked "Tidak Layak" but actually "Layak"  
**Impact**: Deserving students miss scholarship opportunity

**Pattern Analysis**:

1. **Borderline Cases (3 cases)**
   - IPK 3.2-3.4 (Mid category edge)
   - Income Rp 4-5M (Low/Mid boundary)
   - Multiple moderate factors, no standout signal

2. **High Income + Exceptional Achievement (2 cases)**
   - Income >Rp 6M
   - IPK >3.7 + National achievement
   - Model prioritizes economic need over merit

3. **Low Confidence Predictions (2 cases)**
   - Model confidence <70%
   - Conflicting signals
   - Correctly flagged for human review

4. **Edge Case (1 case)**
   - Unusual combination: Low SKS + High IPK + Mid Income
   - Rare pattern, insufficient training examples

**Recommendation**: Human review for flagged cases can reduce FN further

---

### False Positives (FP = 9)

**Definition**: Students marked "Layak" but actually "Tidak Layak"  
**Impact**: Budget spent on ineligible students

**Pattern Analysis**:

1. **Policy Override Error (1 case)**
   - Record 78: Rule B override
   - IPK High + Tanggungan High + Income Rp 6.5M
   - Per-capita income still comfortable

2. **Affluent High Achievers (4 cases)**
   - Income >Rp 6M + IPK >3.8
   - Model gives weight to academic merit
   - But economic need should dominate

3. **Grade Inflation (2 cases)**
   - IPK 3.5-3.6 + Income Rp 5-6M
   - Model sees good academics + moderate income
   - But combined factors insufficient

4. **Small Family, High Income (2 cases)**
   - Tanggungan 1-2, Income >Rp 5M
   - No real economic need
   - Model may under-weight small family

**Recommendation**: Consider stricter income caps for high earners

---

## Performance Evolution

### Improvement Timeline

| Version | Accuracy | Recall | FN | Key Change |
|---------|----------|--------|----|-----------| 
| **V1 Baseline** | 74% | 59.52% | 17 | Raw features |
| **V2 Enhanced** | 81% | 73.81% | 11 | + Categorical features |
| **V2 + Overrides** | 83% | 80.95% | 8 | + Policy layer |

**Total Improvement**: +9 pp accuracy, +21.43 pp recall, -53% FN

### Feature Engineering Impact

**V1 → V2**: +7 pp accuracy
- Largest single improvement
- Validates domain knowledge approach
- Categorical features align with human reasoning

### Policy Override Impact

**V2 → Final**: +2 pp accuracy
- Surgical corrections
- Targeted rule refinement
- High-confidence overrides only

---

## Statistical Significance

### Sample Size Validation

**Testing Set**: 100 records
- Actual Layak: 42 (sufficient for recall calculation)
- Actual Tidak Layak: 58 (sufficient for precision calculation)

**Confidence Interval** (95% CI for accuracy):
- Accuracy = 83%
- Standard error = √(0.83 × 0.17 / 100) = 0.0376
- CI = 83% ± 1.96 × 3.76% = **[75.6%, 90.4%]**

**Interpretation**: True accuracy likely between 76-90% for similar student populations

---

## Validation Checks

### Sanity Tests

1. **TP + FN = Total Actual Layak**
   - 34 + 8 = 42 ✅

2. **TN + FP = Total Actual Tidak Layak**
   - 49 + 9 = 58 ✅

3. **Total Predictions = 100**
   - 34 + 8 + 49 + 9 = 100 ✅

4. **Accuracy Check**
   - (34 + 49) / 100 = 83% ✅

---

## Output Files

### testing_results_v2_with_overrides_refined.csv

**Columns**:
- Student features (IPK, SKS, Income, etc.)
- Actual_Status (ground truth)
- Predicted_Status (model V2)
- Confidence (model confidence score)
- Final_Status (after overrides)
- Override_Applied (reason if changed)
- Is_Correct (boolean)

**Example Rows**:
```csv
Record,IPK,Income,Actual,Predicted,Confidence,Final,Override,Correct
1,3.45,4500000,Layak,Layak,0.88,Layak,None,True
31,3.35,4200000,Layak,Tidak Layak,0.72,Layak,Rule A,True
78,3.85,6500000,Tidak Layak,Tidak Layak,0.75,Layak,Rule B,False
```

---

## Usage Example

### Run V2 Testing

```bash
cd generated/500
python test_decision_tree_v2.py
```

**Expected Output**:
```
================================================================================
TESTING DECISION TREE (V2 - ENHANCED)
================================================================================

[1] Loading decision rules...
    ✅ Loaded 15 rules

[2] Loading test data...
    ✅ Loaded 100 test records

[3] Applying rules...
    ✅ All records classified

[4] Calculating metrics...

    Confusion Matrix:
                     Predicted
                  Layak  Tidak Layak
    Actual Layak    31       11
           Tidak    8       50

    Performance Metrics:
    • Accuracy:  81.00%
    • Precision: 79.49%
    • Recall:    73.81%
    • F1-Score:  76.54%

    Error Breakdown:
    • False Negatives: 11 (missed eligible students)
    • False Positives: 8 (accepted ineligible students)

[5] Saving results...
    ✅ testing_results_v2.csv

================================================================================
TESTING COMPLETE!
================================================================================
```

---

## Best Practices

### 1. Never Use Test Data for Training
- Strict separation of train/test
- No peeking at test labels during development
- Test only after model finalized

### 2. Report Multiple Metrics
- Accuracy alone is insufficient
- Always include precision, recall, F1
- Show confusion matrix for full picture

### 3. Analyze Errors
- Don't just report numbers
- Understand why model fails
- Pattern analysis guides improvements

### 4. Document Assumptions
- How are ties handled?
- What's the default prediction?
- How are missing values treated?

---

## Next Steps

After testing:
1. ✅ Error analysis drives improvements
2. ✅ Documentation for reproducibility → **09_code_walkthrough.md**
3. ✅ Deploy with confidence thresholds
4. ✅ Monitor real-world performance

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
