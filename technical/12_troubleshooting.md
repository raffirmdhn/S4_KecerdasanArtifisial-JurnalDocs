# Troubleshooting Guide

## Overview

Solutions to common issues encountered during development, testing, and deployment of the scholarship decision tree system.

---

## Dataset Generation Issues

### Issue: SKS Range Error

**Symptom**:
```
SKS values showing 18-24 instead of 54-72
```

**Cause**: Generating per-semester credits instead of cumulative 3-semester total

**Wrong Code**:
```python
def generate_sks():
    return random.randint(18, 24)  # Per semester
```

**Correct Code**:
```python
def generate_sks():
    sks = int(random.gauss(63, 4))  # 3 semesters cumulative
    return max(54, min(72, sks))
```

**Solution**: Use `random.gauss(63, 4)` with bounds [54, 72]

**Verification**:
```python
# Check dataset
with open('../dataset/dataset_training_400.csv', 'r') as f:
    reader = csv.DictReader(f)
    sks_values = [int(row['SKS_Lulus']) for row in reader]
    print(f"Min: {min(sks_values)}, Max: {max(sks_values)}")
    # Expected: Min: 54, Max: 72
```

---

### Issue: Unrealistic Class Imbalance

**Symptom**: 
```
Layak: 80%, Tidak Layak: 20% (or vice versa)
```

**Cause**: Scoring threshold too lenient or too strict

**Diagnosis**:
```python
# Check scoring distribution in generate_dataset.py
def determine_status(ipk, sks, penghasilan, tanggungan, prestasi, keaktifan):
    score = 0
    # ... calculate score ...
    print(f"Score: {score}")  # Add debug print
    return 'Layak' if score >= 50 else 'Tidak Layak'
```

**Solution**: Adjust threshold (currently 50/100) or scoring weights

**Target Distribution**: 35-45% Layak, 55-65% Tidak Layak (realistic imbalance)

---

### Issue: Non-Reproducible Results

**Symptom**: Different dataset every run

**Cause**: Missing random seed

**Solution**:
```python
import random

# Add at start of main execution
random.seed(42)  # Fixed seed for reproducibility

# Now generate data
data = [generate_student() for _ in range(500)]
```

**Verification**: Run twice, compare MD5 hashes
```bash
# Run 1
python generate_dataset.py
md5sum ../dataset/dataset_training_400.csv

# Run 2
python generate_dataset.py
md5sum ../dataset/dataset_training_400.csv

# Should be identical
```

---

## Feature Engineering Issues

### Issue: Categorical Features Not Created

**Symptom**:
```
KeyError: 'IPK_Kategori'
```

**Cause**: Using original dataset instead of enhanced

**Diagnosis**:
```python
# Check file being loaded
print(f"Loading: {TRAINING_FILE}")
# Should show: dataset_training_400_enhanced.csv

# Check columns
with open(TRAINING_FILE, 'r') as f:
    reader = csv.DictReader(f)
    print(f"Columns: {reader.fieldnames}")
    # Should include: IPK_Kategori, Tanggungan_Kategori, etc.
```

**Solution**:
```python
# In build_complete_tree_v2.py
TRAINING_FILE = '../dataset/dataset_training_400_enhanced.csv'  # Not dataset_training_400.csv
```

---

### Issue: Wrong Category Assignments

**Symptom**: IPK 3.5 categorized as "Low" instead of "Mid"

**Cause**: Threshold logic error

**Wrong Code**:
```python
def categorize_ipk(ipk):
    if ipk < 3.2:
        return 'Low'
    if ipk > 3.8:  # BUG: Misses 3.2-3.8 range!
        return 'High'
```

**Correct Code**:
```python
def categorize_ipk(ipk):
    if ipk < 3.2:
        return 'Low'
    elif ipk < 3.8:  # Use elif
        return 'Mid'
    else:
        return 'High'
```

**Verification**:
```python
# Test cases
assert categorize_ipk(3.0) == 'Low'
assert categorize_ipk(3.5) == 'Mid'
assert categorize_ipk(3.9) == 'High'
```

---

## Tree Building Issues

### Issue: Python String Formatting Error

**Symptom**:
```
ValueError: Cannot specify ',' with 's'.
```

**Cause**: Using conditional expression in f-string format specifier

**Wrong Code**:
```python
print(f"Value: {value:{'.2f' if is_float else 'd'}}")
```

**Solution**: Use helper function
```python
def format_threshold(value, is_float):
    return f"{value:.2f}" if is_float else str(value)

# Then use
print(f"Value: {format_threshold(value, is_float)}")
```

---

### Issue: Tree Not Splitting

**Symptom**: Only 1-2 nodes created, tree stops immediately

**Cause**: Stopping criteria too restrictive

**Diagnosis**:
```python
# Add debug prints in build_tree_recursive()
print(f"Depth: {depth}, Samples: {len(data)}, Entropy: {entropy}")
print(f"Best gain: {best_gain}, Threshold: MIN_IG={MIN_IG}")
```

**Common Culprits**:
```python
MIN_SAMPLES_LEAF = 200  # Too high! (should be 10-20)
MIN_IG = 0.5           # Too high! (should be 0.01)
MAX_DEPTH = 1          # Too low! (should be 4-5)
```

**Solution**: Use recommended values
```python
MIN_SAMPLES_LEAF = 10
MIN_IG = 0.01
MIN_ENTROPY = 0.3
MAX_DEPTH = 4
```

---

### Issue: Infinite Recursion

**Symptom**:
```
RecursionError: maximum recursion depth exceeded
```

**Cause**: Missing base case or stopping condition

**Diagnosis**:
```python
# Check if base cases are actually triggered
def build_tree_recursive(...):
    print(f"Depth: {depth}, Samples: {len(data)}, Is Leaf: {should_stop}")
    
    if entropy <= MIN_ENTROPY:
        print("STOP: Low entropy")
        return create_leaf_node(...)
    # ... other stops
```

**Common Causes**:
- Stopping criteria never met
- Continuous feature creates infinite splits (use midpoints!)
- Empty child nodes not handled

**Solution**: Ensure all stopping criteria are checked
```python
# Always check after split
if not left_data or not right_data:
    return create_leaf_node(...)  # Can't split further
```

---

## Testing Issues

### Issue: Condition Parsing Error

**Symptom**:
```
ValueError: Cannot parse condition: "IPK == 3.5"
or
Wrong split: ["IPK =", "= 3.5"]
```

**Cause**: Checking `=` before `==` in parsing logic

**Wrong Code**:
```python
if '=' in condition_str:
    parts = condition_str.split('=')  # Splits "==" incorrectly!
elif '==' in condition_str:
    # Never reached!
```

**Correct Code**:
```python
# Check most specific first!
if '==' in condition_str:
    parts = condition_str.split('==')
elif '=' in condition_str:
    parts = condition_str.split('=')
```

**Order Matters**:
1. `<=` (two characters)
2. `>=` (two characters)
3. `==` (two characters)
4. `<`, `>`, `=` (single characters)

---

### Issue: Type Mismatch in Comparisons

**Symptom**: Condition always false, rules never match

**Cause**: Comparing string to number

**Diagnosis**:
```python
# CSV reads everything as strings!
row['IPK']  # Returns "3.5" (string)
threshold   # Stored as 3.5 (float)

# This fails:
if row['IPK'] <= threshold:  # "3.5" <= 3.5 (string vs float)
```

**Solution**: Explicit type conversion
```python
def evaluate_condition(actual_value, operator, expected_value):
    if operator in ['<=', '>', '<', '>=']:
        # Continuous comparison - convert to float
        return float(actual_value) <= float(expected_value)
    else:
        # Categorical comparison - keep as string
        return str(actual_value) == str(expected_value)
```

---

### Issue: Wrong Accuracy Calculation

**Symptom**: Accuracy doesn't match manual count

**Cause**: Off-by-one error or wrong formula

**Wrong Code**:
```python
accuracy = (tp + tn) / (tp + tn + fp)  # Missing FN!
```

**Correct Code**:
```python
accuracy = (tp + tn) / (tp + tn + fp + fn)
```

**Verification**:
```python
# Sanity checks
assert tp + fn == total_actual_positive
assert tn + fp == total_actual_negative
assert tp + tn + fp + fn == total_samples
```

---

## Policy Override Issues

### Issue: Too Many False Positives

**Symptom**: Override rules create more errors than they fix

**Diagnosis**:
```python
# Track override impact
overrides_correct = 0
overrides_wrong = 0

for row in results:
    if row['Override_Applied'] != 'None':
        if row['Is_Correct'] == 'True':
            overrides_correct += 1
        else:
            overrides_wrong += 1

print(f"Override accuracy: {overrides_correct}/{overrides_correct + overrides_wrong}")
```

**Solution**: Tighten constraints
```python
# V1: Too loose
if ipk >= 2.5 and penghasilan <= 7_000_000:  # Catches too many

# V2: Refined
if ipk >= 3.3 and penghasilan <= 5_000_000:  # More selective
```

**Rule of Thumb**: Override success rate should be >70%

---

### Issue: Overrides Not Applied

**Symptom**: Override logic exists but never triggers

**Diagnosis**:
```python
# Add debug prints
def override_a(row, prediction):
    ipk = float(row['IPK'])
    print(f"Checking override: IPK={ipk}, threshold=3.3")
    
    if ipk >= 3.3:
        print("  IPK check passed")
    # ... more checks
```

**Common Causes**:
1. Only checking one prediction class
   ```python
   # Wrong: Only overrides "Layak" to "Tidak Layak" (rare!)
   if prediction == 'Layak':
       return True
   
   # Correct: Override "Tidak Layak" to "Layak" (common need)
   if prediction == 'Tidak Layak':
       return True
   ```

2. Logic error (AND vs OR)
   ```python
   # Wrong: All conditions must be true (too strict)
   if tang >= 6 and prestasi == 'Nasional' and keaktifan == 'Pengurus':
   
   # Correct: Alternative paths
   if tang >= 6 or (prestasi == 'Nasional' and tang >= 3):
   ```

---

## Performance Issues

### Issue: Slow Tree Building

**Symptom**: Taking >10 seconds for 400 samples

**Cause**: Inefficient threshold search

**Diagnosis**:
```python
import time

def calculate_information_gain_continuous(...):
    start = time.time()
    # ... calculation ...
    print(f"Feature {feature}: {time.time() - start:.3f}s")
```

**Optimization**:
```python
# Cache sorted values
values = sorted(set(float(row[feature]) for row in data))

# Only try midpoints (not every value)
for i in range(len(values) - 1):
    threshold = (values[i] + values[i + 1]) / 2
    # ... calculate gain ...
```

**Expected**: <2 seconds for 400 samples with 10 features

---

## File I/O Issues

### Issue: File Not Found

**Symptom**:
```
FileNotFoundError: [Errno 2] No such file or directory: '../dataset/dataset_training_400.csv'
```

**Diagnosis**:
```bash
# Check current directory
pwd  # macOS/Linux
cd   # Windows

# Should be in: .../generated/500/
```

**Solution**:
```bash
cd generated/500
python build_complete_tree_v2.py
```

**Permanent Fix**: Use absolute paths or validate path existence
```python
import os

TRAINING_FILE = '../dataset/dataset_training_400_enhanced.csv'

if not os.path.exists(TRAINING_FILE):
    print(f"Error: File not found: {TRAINING_FILE}")
    print(f"Current directory: {os.getcwd()}")
    exit(1)
```

---

### Issue: Encoding Errors

**Symptom**:
```
UnicodeDecodeError: 'charmap' codec can't decode byte ...
```

**Cause**: Windows default encoding (cp1252) vs UTF-8

**Solution**: Always specify UTF-8
```python
# Reading
with open(file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

# Writing
with open(file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fields)
```

---

## Validation Issues

### Issue: Metrics Don't Sum Correctly

**Symptom**: TP + FN ≠ Total Actual Positive

**Diagnosis**:
```python
# Verify counts
print(f"TP: {tp}, FN: {fn}, Total Layak: {tp + fn}")
print(f"Actual Layak in data: {sum(1 for x in actual if x == 'Layak')}")

# These should match!
```

**Common Causes**:
1. Inconsistent label spelling ("Layak" vs "layak")
2. Extra whitespace ("Layak " vs "Layak")
3. Missing predictions (not all 100 records classified)

**Solution**: Normalize labels
```python
def normalize_label(label):
    return label.strip().title()  # "  layak  " → "Layak"

# Apply when reading
actual_status = normalize_label(row['Status_Beasiswa'])
```

---

### Issue: Confidence Scores >100%

**Symptom**: Confidence shows 1.20 (120%)

**Cause**: Wrong calculation

**Wrong Code**:
```python
confidence = majority_count  # Absolute count!
```

**Correct Code**:
```python
confidence = majority_count / total_samples  # Proportion (0-1)
```

**Display**:
```python
print(f"Confidence: {confidence:.1%}")  # 0.85 → "85.0%"
```

---

## Integration Issues

### Issue: Results Don't Match Between Scripts

**Symptom**: V2 testing shows 81%, but report says 74%

**Diagnosis**:
```python
# Check which files are being used
print(f"Rules file: {RULES_FILE}")
print(f"Test data: {TEST_FILE}")

# Verify versions match
# V1: decision_rules.json + dataset_testing_100.csv
# V2: decision_rules_v2.json + dataset_testing_100_enhanced.csv
```

**Solution**: Ensure version consistency
```python
# For V2 testing
RULES_FILE = 'decision_rules_v2.json'
TEST_FILE = '../dataset/dataset_testing_100_enhanced.csv'
OUTPUT_FILE = 'testing_results_v2.csv'
```

---

## Deployment Issues

### Issue: Different Results on Production

**Symptom**: Dev: 83%, Production: 76%

**Common Causes**:
1. **Different Python versions**: Use same version (3.8+)
2. **Different data**: Ensure same CSV files
3. **Different random seed**: Check if seed is set
4. **Locale differences**: Use UTF-8 everywhere
5. **Line ending differences**: Git autocrlf issues

**Solution Checklist**:
```bash
# 1. Verify Python version
python --version

# 2. Check file MD5 hashes
md5sum decision_rules_v2.json

# 3. Verify CSV encoding
file -i dataset_training_400.csv

# 4. Check Git settings
git config core.autocrlf
# Should be: false (or input on Unix)
```

---

## Debugging Strategies

### Strategy 1: Add Verbose Logging

```python
# Add at start of script
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Use throughout
logger.debug(f"Processing node {node_id}: samples={len(data)}")
logger.info(f"Best split: {best_feature} (IG={best_gain:.3f})")
```

---

### Strategy 2: Unit Test Key Functions

```python
def test_entropy():
    # Pure node
    labels = ['Layak'] * 10
    assert calculate_entropy(labels) == 0
    
    # 50/50 split
    labels = ['Layak'] * 5 + ['Tidak Layak'] * 5
    assert abs(calculate_entropy(labels) - 1.0) < 0.01
    
    print("✅ Entropy tests passed")

test_entropy()
```

---

### Strategy 3: Visualize Intermediate Results

```python
# Save tree structure at each level
def save_tree_snapshot(node, depth, filename):
    with open(f'debug_tree_level{depth}.json', 'w') as f:
        json.dump(node, f, indent=2)

# Call during tree building
save_tree_snapshot(node, depth, f'tree_depth_{depth}.json')
```

---

### Strategy 4: Binary Search Issues

```python
# Isolate problem: Which step fails?
print("✅ Step 1: Dataset loaded")
print("✅ Step 2: Features created")
print("❌ Step 3: Tree building")  # Problem here!

# Then debug that specific step
```

---

## Common Error Messages

### "list index out of range"

**Likely Cause**: Splitting on empty category or wrong indices

**Check**:
```python
if not left_labels or not right_labels:
    print("Warning: Empty split!")
    return create_leaf_node(...)
```

---

### "division by zero"

**Likely Cause**: Empty label list in entropy/metrics calculation

**Check**:
```python
if not labels or len(labels) == 0:
    return 0  # Edge case
```

---

### "unhashable type: 'dict'"

**Likely Cause**: Trying to use dict as set/dict key

**Check**:
```python
# Wrong
unique_values = set(rows)  # rows is list of dicts

# Correct
unique_values = set(row['feature'] for row in rows)
```

---

## Getting Help

### Before Asking for Help

1. ✅ Read error message completely
2. ✅ Check this troubleshooting guide
3. ✅ Add debug prints to isolate issue
4. ✅ Verify file paths and versions
5. ✅ Try minimal reproducible example

### Information to Include

When reporting issues, provide:
- **Python version**: `python --version`
- **Operating system**: Windows/macOS/Linux
- **Full error message**: Complete traceback
- **Steps to reproduce**: Exact commands run
- **Expected vs actual**: What should happen vs what happens
- **File versions**: V1 or V2, which files

---

## Prevention Best Practices

### 1. Version Control

```bash
git init
git add .
git commit -m "Working version: 83% accuracy"
```

### 2. Automated Testing

```python
def run_full_pipeline_test():
    # Generate data
    subprocess.run(['python', 'generate_dataset.py'])
    
    # Build tree
    subprocess.run(['python', 'build_complete_tree_v2.py'])
    
    # Test
    result = subprocess.run(['python', 'test_decision_tree_v2.py'], 
                           capture_output=True)
    
    # Verify accuracy
    assert '81' in result.stdout.decode()  # Should contain 81%
    
    print("✅ Full pipeline test passed")
```

### 3. Documentation

Document every change:
```python
# CHANGED: 2026-06-18 - Tightened IPK threshold from 2.5 to 3.3
# REASON: Reduce false positives in Override Rule A
# IMPACT: Overrides dropped from 15 to 3, accuracy +11pp
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
