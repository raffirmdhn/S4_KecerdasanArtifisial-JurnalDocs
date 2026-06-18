# Code Walkthrough

## Overview

Deep dive into key functions and algorithm implementations, explaining the "how" and "why" behind critical code sections.

---

## 1. Entropy Calculation

### Function: `calculate_entropy()`

**Location**: `build_complete_tree_v2.py` (and V1)

**Purpose**: Measure impurity/disorder in a dataset

**Implementation**:
```python
def calculate_entropy(labels):
    """
    Calculate Shannon entropy for classification labels.
    
    Args:
        labels: List of class labels (e.g., ['Layak', 'Tidak Layak', 'Layak', ...])
    
    Returns:
        float: Entropy value between 0 (pure) and 1 (maximum impurity for binary)
    
    Formula:
        H(S) = -Σ p_i × log₂(p_i)
        where p_i = proportion of class i
    """
    
    # Edge case: empty dataset
    if not labels:
        return 0
    
    # Count occurrences of each class
    from collections import Counter
    counts = Counter(labels)
    total = len(labels)
    
    # Calculate entropy
    entropy = 0
    for count in counts.values():
        if count > 0:  # Avoid log(0)
            probability = count / total
            entropy -= probability * math.log2(probability)
    
    return entropy
```

**Step-by-Step Example**:

```python
# Dataset: 100 samples
labels = ['Layak'] * 40 + ['Tidak Layak'] * 60

# Step 1: Count classes
# Counter({'Tidak Layak': 60, 'Layak': 40})

# Step 2: Calculate probabilities
# p_Layak = 40/100 = 0.4
# p_Tidak = 60/100 = 0.6

# Step 3: Calculate entropy
# H = -(0.4 × log₂(0.4) + 0.6 × log₂(0.6))
# H = -(0.4 × -1.3219 + 0.6 × -0.7370)
# H = -(-0.5288 + -0.4422)
# H = 0.971 bits
```

**Key Insights**:
- **H = 0**: Pure node (all one class) → stop splitting
- **H = 1**: Maximum impurity (50/50 split)
- **Higher entropy**: More mixed, more uncertainty
- **Lower entropy**: More pure, better classification

**Why log₂?**
- Information theory standard
- Measures bits of information
- log₂(2) = 1 bit for binary choice

---

## 2. Information Gain for Continuous Features

### Function: `calculate_information_gain_continuous()`

**Location**: `build_complete_tree_v2.py`

**Purpose**: Find optimal threshold to split continuous features

**Implementation**:
```python
def calculate_information_gain_continuous(data, labels, feature, parent_entropy):
    """
    Find best binary split threshold for a continuous feature.
    
    Args:
        data: List of dictionaries (records)
        labels: List of corresponding class labels
        feature: Feature name to split on (e.g., 'IPK')
        parent_entropy: Entropy before split
    
    Returns:
        tuple: (best_gain, best_threshold)
    
    Algorithm:
        1. Sort unique values
        2. Try midpoints between consecutive values
        3. Calculate weighted entropy for each split
        4. Return split with maximum information gain
    """
    
    # Extract and sort unique values
    values = sorted(set(float(row[feature]) for row in data))
    
    # Edge case: cannot split if only one unique value
    if len(values) < 2:
        return 0, None
    
    best_gain = 0
    best_threshold = None
    
    # Try each potential split point
    for i in range(len(values) - 1):
        # Use midpoint to avoid bias
        threshold = (values[i] + values[i + 1]) / 2
        
        # Split data into left (≤ threshold) and right (> threshold)
        left_labels = [labels[j] for j, row in enumerate(data) 
                       if float(row[feature]) <= threshold]
        right_labels = [labels[j] for j, row in enumerate(data) 
                        if float(row[feature]) > threshold]
        
        # Skip if either side is empty
        if not left_labels or not right_labels:
            continue
        
        # Calculate weighted entropy after split
        total = len(labels)
        left_weight = len(left_labels) / total
        right_weight = len(right_labels) / total
        
        left_entropy = calculate_entropy(left_labels)
        right_entropy = calculate_entropy(right_labels)
        
        weighted_entropy = (left_weight * left_entropy + 
                           right_weight * right_entropy)
        
        # Information gain = reduction in entropy
        gain = parent_entropy - weighted_entropy
        
        # Track best split
        if gain > best_gain:
            best_gain = gain
            best_threshold = threshold
    
    return best_gain, best_threshold
```

**Step-by-Step Example**:

```python
# Feature: IPK
# Data: 20 samples with IPK values
# Values: [2.8, 2.9, 3.0, 3.2, 3.2, 3.5, 3.7, 3.8, ...]
# Parent entropy: 0.95

# Step 1: Get unique sorted values
unique_values = [2.8, 2.9, 3.0, 3.2, 3.5, 3.7, 3.8]

# Step 2: Generate candidate thresholds (midpoints)
thresholds = [
    (2.8 + 2.9)/2 = 2.85,
    (2.9 + 3.0)/2 = 2.95,
    (3.0 + 3.2)/2 = 3.10,
    (3.2 + 3.5)/2 = 3.35,
    (3.5 + 3.7)/2 = 3.60,
    (3.7 + 3.8)/2 = 3.75
]

# Step 3: Try threshold 3.35
# Left (IPK ≤ 3.35): 12 samples → 9 Tidak Layak, 3 Layak
# Right (IPK > 3.35): 8 samples → 2 Tidak Layak, 6 Layak

# Left entropy: -(9/12 × log₂(9/12) + 3/12 × log₂(3/12)) = 0.811
# Right entropy: -(2/8 × log₂(2/8) + 6/8 × log₂(6/8)) = 0.811

# Weighted entropy = (12/20 × 0.811) + (8/20 × 0.811) = 0.811
# Information gain = 0.95 - 0.811 = 0.139

# Step 4: Compare all thresholds, pick maximum gain
# Best: threshold = 3.20, gain = 0.185
```

**Why Midpoints?**
- Avoids bias towards either value
- Creates clear boundary
- Handles duplicate values naturally

**Optimization Note**:
- Time complexity: O(n log n) for sorting + O(n) for each threshold
- Could be optimized with dynamic programming for large datasets
- Current implementation sufficient for 400 training samples

---

## 3. Tree Building - Recursive Construction

### Function: `build_tree_recursive()`

**Location**: `build_complete_tree_v2.py`

**Purpose**: Recursively construct decision tree with stopping criteria

**Implementation**:
```python
def build_tree_recursive(data, labels, features, depth=0, node_id="0"):
    """
    Recursively build decision tree using ID3 algorithm.
    
    Args:
        data: Training records for this node
        labels: Corresponding class labels
        features: List of available features
        depth: Current tree depth (for MAX_DEPTH check)
        node_id: Unique identifier for this node
    
    Returns:
        TreeNode: Internal node or leaf node
    
    Stopping Criteria:
        1. Pure or near-pure node (entropy ≤ MIN_ENTROPY)
        2. Maximum depth reached (depth ≥ MAX_DEPTH)
        3. Too few samples (< MIN_SAMPLES_LEAF × 2)
        4. No good split available (best gain < MIN_IG)
    """
    
    # Calculate current node entropy
    entropy = calculate_entropy(labels)
    node = TreeNode(node_id)
    node.entropy = entropy
    node.samples = len(data)
    
    # STOPPING CONDITION 1: Pure or near-pure
    if entropy <= MIN_ENTROPY:
        return create_leaf_node(node, labels)
    
    # STOPPING CONDITION 2: Maximum depth
    if depth >= MAX_DEPTH:
        return create_leaf_node(node, labels)
    
    # STOPPING CONDITION 3: Too few samples
    if len(data) < MIN_SAMPLES_LEAF * 2:
        return create_leaf_node(node, labels)
    
    # Find best feature to split on
    best_feature = None
    best_gain = 0
    best_threshold = None
    
    for feature in features:
        if is_continuous(feature):
            gain, threshold = calculate_information_gain_continuous(
                data, labels, feature, entropy
            )
        else:  # Categorical
            gain = calculate_information_gain_categorical(
                data, labels, feature, entropy
            )
            threshold = None
        
        if gain > best_gain:
            best_gain = gain
            best_feature = feature
            best_threshold = threshold
    
    # STOPPING CONDITION 4: No good split
    if best_gain < MIN_IG:
        return create_leaf_node(node, labels)
    
    # Create internal node
    node.is_leaf = False
    node.feature = best_feature
    node.threshold = best_threshold
    
    # Split data and recurse
    if best_threshold is not None:
        # Binary split for continuous
        left_data, left_labels = [], []
        right_data, right_labels = [], []
        
        for i, row in enumerate(data):
            if float(row[best_feature]) <= best_threshold:
                left_data.append(row)
                left_labels.append(labels[i])
            else:
                right_data.append(row)
                right_labels.append(labels[i])
        
        node.left = build_tree_recursive(
            left_data, left_labels, features, depth + 1, f"{node_id}-L"
        )
        node.right = build_tree_recursive(
            right_data, right_labels, features, depth + 1, f"{node_id}-R"
        )
    else:
        # Multi-way split for categorical
        node.branches = {}
        categories = set(row[best_feature] for row in data)
        
        for category in categories:
            cat_data = [row for row in data if row[best_feature] == category]
            cat_labels = [labels[i] for i, row in enumerate(data) 
                         if row[best_feature] == category]
            
            node.branches[category] = build_tree_recursive(
                cat_data, cat_labels, features, depth + 1, f"{node_id}-{category}"
            )
    
    return node
```

**Execution Trace Example**:

```
build_tree_recursive(400 samples, depth=0)
├─ Calculate entropy: 0.95
├─ Check stopping criteria: all pass, continue
├─ Find best split: Penghasilan_Kategori (IG=0.245)
├─ Split into 3 branches: Low / Mid / High
│
├─ build_tree_recursive(Low branch: 140 samples, depth=1)
│  ├─ Calculate entropy: 0.82
│  ├─ Find best split: IPK_Kategori (IG=0.18)
│  ├─ Split into 3 branches: Low / Mid / High
│  │
│  ├─ build_tree_recursive(Low-Low: 45 samples, depth=2)
│  │  ├─ Entropy: 0.65
│  │  ├─ Find best split: Tanggungan_Kategori (IG=0.12)
│  │  └─ ... recurse further ...
│  │
│  ├─ build_tree_recursive(Low-Mid: 84 samples, depth=2)
│  │  └─ ... recurse ...
│  │
│  └─ build_tree_recursive(Low-High: 11 samples, depth=2)
│     ├─ Entropy: 0.24 (< MIN_ENTROPY=0.3)
│     └─ CREATE LEAF: Layak (confidence: 91%)
│
├─ build_tree_recursive(Mid branch: 240 samples, depth=1)
│  └─ ... similar recursion ...
│
└─ build_tree_recursive(High branch: 20 samples, depth=1)
   ├─ Entropy: 0.28 (< MIN_ENTROPY=0.3)
   └─ CREATE LEAF: Tidak Layak (confidence: 95%)
```

---

## 4. Leaf Node Creation

### Function: `create_leaf_node()`

**Implementation**:
```python
def create_leaf_node(node, labels):
    """
    Create a leaf node with majority class prediction.
    
    Args:
        node: TreeNode object to configure as leaf
        labels: Class labels at this node
    
    Returns:
        TreeNode: Configured leaf node
    
    Prediction Logic:
        - Class with most samples becomes prediction
        - Confidence = proportion of majority class
    """
    
    node.is_leaf = True
    
    # Count class occurrences
    from collections import Counter
    counts = Counter(labels)
    
    # Majority vote
    majority_class = counts.most_common(1)[0][0]
    majority_count = counts[majority_class]
    
    # Calculate confidence
    confidence = majority_count / len(labels)
    
    node.prediction = majority_class
    node.confidence = confidence
    
    return node
```

**Example**:
```python
# Leaf node with 20 samples
labels = ['Layak'] * 17 + ['Tidak Layak'] * 3

# Majority: Layak (17 samples)
# Confidence: 17/20 = 85%

# Result: Predict "Layak" with 85% confidence
```

---

## 5. Rule Extraction

### Function: `extract_rules()`

**Purpose**: Convert tree structure to interpretable if-then rules

**Implementation**:
```python
def extract_rules(node, conditions=None, rules=None, rule_id=1):
    """
    Traverse tree and extract decision rules.
    
    Args:
        node: Current TreeNode
        conditions: List of conditions accumulated so far
        rules: List to store extracted rules
        rule_id: Unique identifier for each rule
    
    Returns:
        list: Rules in format [{conditions: [...], prediction: ..., confidence: ...}]
    
    Algorithm:
        - Depth-first traversal
        - Accumulate conditions along path
        - At leaf, save complete rule
    """
    
    if conditions is None:
        conditions = []
    if rules is None:
        rules = []
    
    # Base case: leaf node
    if node.is_leaf:
        rule = {
            'rule_id': rule_id,
            'conditions': conditions.copy(),
            'prediction': node.prediction,
            'confidence': node.confidence,
            'samples': node.samples,
            'node_id': node.node_id
        }
        rules.append(rule)
        return rules
    
    # Recursive case: internal node
    if node.threshold is not None:
        # Binary split (continuous feature)
        
        # Left branch: feature ≤ threshold
        left_condition = {
            'feature': node.feature,
            'operator': '<=',
            'value': node.threshold
        }
        extract_rules(
            node.left, 
            conditions + [left_condition], 
            rules, 
            rule_id
        )
        
        # Right branch: feature > threshold
        right_condition = {
            'feature': node.feature,
            'operator': '>',
            'value': node.threshold
        }
        extract_rules(
            node.right, 
            conditions + [right_condition], 
            rules, 
            len(rules) + 1
        )
    else:
        # Multi-way split (categorical feature)
        for category, child in node.branches.items():
            condition = {
                'feature': node.feature,
                'operator': '=',
                'value': category
            }
            extract_rules(
                child, 
                conditions + [condition], 
                rules, 
                len(rules) + 1
            )
    
    return rules
```

**Example Output**:
```python
# Rule extracted from path: Root → Low → Mid → High
{
    'rule_id': 5,
    'conditions': [
        {'feature': 'Penghasilan_Kategori', 'operator': '=', 'value': 'Low'},
        {'feature': 'IPK_Kategori', 'operator': '=', 'value': 'Mid'},
        {'feature': 'Tanggungan_Kategori', 'operator': '=', 'value': 'High'}
    ],
    'prediction': 'Layak',
    'confidence': 0.88,
    'samples': 28,
    'node_id': '0-Low-Mid-High'
}

# Human-readable format:
# Rule 5: IF Penghasilan_Kategori = Low 
#            AND IPK_Kategori = Mid 
#            AND Tanggungan_Kategori = High 
#         THEN Layak (confidence: 88%, samples: 28)
```

---

## 6. Policy Override Logic

### Function: `override_a()`

**Location**: `apply_policy_overrides_v2.py`

**Purpose**: Catch high-need students missed by model

**Implementation**:
```python
def override_a(row, prediction):
    """
    Override A: High-need exception.
    
    Logic:
        Base: Good academics (IPK ≥3.3) + Low-mid income (≤5M)
        Path 1: Very large family (6+ dependents)
        Path 2: National achiever + leadership + moderate family
    
    Args:
        row: Student record (dict)
        prediction: Current model prediction
    
    Returns:
        bool: True if override should be applied
    """
    
    # Only override "Tidak Layak" predictions
    if prediction != 'Tidak Layak':
        return False
    
    # Extract features
    ipk = float(row['IPK'])
    penghasilan = int(row['Penghasilan_Ortu'])
    tanggungan = int(row['Tanggungan'])
    prestasi = row['Prestasi_Akademik']
    keaktifan = row['Keaktifan_Organisasi']
    
    # Base criteria: good academics + economic need
    if ipk >= 3.3 and penghasilan <= 5_000_000:
        
        # Path 1: Very large family
        if tanggungan >= 6:
            # Per capita: ≤5M / 6 = ≤833k per person
            # Clear economic hardship despite decent income
            return True
        
        # Path 2: Exceptional candidate
        if (prestasi == 'Nasional' and 
            tanggungan >= 3 and 
            keaktifan == 'Pengurus'):
            # National achievement + leadership + moderate family
            # Multiple strong positive signals
            return True
    
    return False
```

**Design Rationale**:

1. **Conservative Thresholds**:
   - IPK ≥3.3 (not ≥2.5): Ensure academic viability
   - Income ≤5M (not ≤7M): Focus on real need
   - Tanggungan ≥6 (not ≥4): Only extreme family burden

2. **Multiple Paths**:
   - Path 1: Economic focus (large family)
   - Path 2: Merit focus (exceptional + need)

3. **Safety Check**:
   - Only override "Tidak Layak" → "Layak"
   - Never demote eligible students

**Why It Works**:
- Catches systematic model blind spots
- Based on error analysis of FN cases
- Tight constraints prevent false positives

---

## 7. Condition Parsing

### Function: `parse_condition()`

**Location**: `test_decision_tree_v2.py`

**Purpose**: Extract operator and value from condition string

**Implementation**:
```python
def parse_condition(condition_str):
    """
    Parse condition string into components.
    
    Args:
        condition_str: String like "IPK <= 3.5" or "Prestasi == Nasional"
    
    Returns:
        tuple: (feature, operator, value)
    
    Critical: Check '==' before '=' to avoid false matches!
    """
    
    # Try operators in order of specificity
    if '<=' in condition_str:
        parts = condition_str.split('<=')
        return parts[0].strip(), '<=', parts[1].strip()
    
    elif '>' in condition_str:
        parts = condition_str.split('>')
        return parts[0].strip(), '>', parts[1].strip()
    
    elif '==' in condition_str:
        parts = condition_str.split('==')
        return parts[0].strip(), '==', parts[1].strip()
    
    elif '=' in condition_str:
        parts = condition_str.split('=')
        return parts[0].strip(), '=', parts[1].strip()
    
    else:
        raise ValueError(f"Cannot parse condition: {condition_str}")
```

**Critical Bug**: Check `==` before `=`!

**Wrong Order**:
```python
# WRONG: Checks '=' first
if '=' in condition_str:  # Matches '==' too!
    # "IPK == 3.5" splits incorrectly into ["IPK =", "= 3.5"]
```

**Correct Order**:
```python
# CORRECT: Checks '==' first
if '==' in condition_str:  # Exact match
    # "IPK == 3.5" splits correctly into ["IPK ", " 3.5"]
elif '=' in condition_str:  # Single equals
    # "IPK = 3.5" splits correctly into ["IPK ", " 3.5"]
```

---

## Key Programming Patterns

### 1. Defensive Coding

**Empty Checks**:
```python
if not labels:  # Empty list
    return 0

if len(values) < 2:  # Cannot split
    return 0, None
```

**Zero Division**:
```python
precision = tp / (tp + fp) if (tp + fp) > 0 else 0
```

### 2. Type Safety

**Explicit Casting**:
```python
ipk = float(row['IPK'])  # CSV reads as string
tanggungan = int(row['Tanggungan'])
```

**Consistent Types**:
```python
# Don't mix: "3.5" (str) == 3.5 (float)  → False
# Always: float("3.5") == 3.5  → True
```

### 3. Immutability

**Copy Lists**:
```python
conditions.copy()  # Don't modify original
conditions + [new_condition]  # Create new list
```

**Why**: Avoid side effects in recursive functions

---

## Performance Considerations

### Time Complexity

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Entropy calculation | O(n) | Single pass through labels |
| IG continuous | O(n log n) | Sorting + O(n) per threshold |
| IG categorical | O(n) | Group by category |
| Tree building | O(n × f × log n) | n samples, f features |
| Rule extraction | O(nodes) | Tree traversal |

### Space Complexity

| Structure | Space | Notes |
|-----------|-------|-------|
| Training data | O(n × f) | 400 samples × 10 features |
| Tree structure | O(nodes) | ~29 nodes total |
| Rules | O(leaves) | 15 rules |

**Optimization Not Needed**: Current dataset (400 samples) runs in <2 seconds

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
