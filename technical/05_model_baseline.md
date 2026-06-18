# Model Baseline (V1)

## Overview

The baseline decision tree model (`build_complete_tree.py`) implements a manual ID3-style decision tree using Entropy and Information Gain, achieving 74% accuracy on raw features.

**File**: `generated/500/build_complete_tree.py`

---

## Algorithm Foundation

### Decision Tree Construction

**Type**: ID3-style (Iterative Dichotomiser 3)  
**Splitting Criterion**: Information Gain (based on Entropy reduction)  
**Split Types**: 
- Continuous features: Binary splits (≤ threshold)
- Categorical features: Multi-way splits (one branch per category)

---

## Core Concepts

### 1. Entropy

**Definition**: Measure of impurity/disorder in a dataset

**Formula**:
```
H(S) = -Σ p_i × log₂(p_i)
```

Where:
- `S` = dataset
- `p_i` = proportion of class i
- `H(S)` = entropy value (0 to 1 for binary classification)

**Interpretation**:
- **H = 0**: Pure node (all one class) → STOP splitting
- **H = 1**: Maximum impurity (50/50 split)
- **H ≈ 0.3**: Low entropy → consider stopping

**Python Implementation**:
```python
def calculate_entropy(labels):
    """Calculate entropy of a label distribution"""
    if not labels:
        return 0
    
    # Count class occurrences
    counts = Counter(labels)
    total = len(labels)
    
    # Calculate entropy
    entropy = 0
    for count in counts.values():
        if count > 0:
            p = count / total
            entropy -= p * math.log2(p)
    
    return entropy
```

**Example**:
- 100 samples: 50 Layak, 50 Tidak Layak → H = 1.0 (maximum)
- 100 samples: 80 Layak, 20 Tidak Layak → H = 0.72
- 100 samples: 100 Layak, 0 Tidak Layak → H = 0.0 (pure)

---

### 2. Information Gain

**Definition**: Reduction in entropy after a split

**Formula**:
```
IG(S, A) = H(S) - Σ (|S_v| / |S|) × H(S_v)
```

Where:
- `IG(S, A)` = Information Gain of splitting on attribute A
- `H(S)` = Entropy before split
- `S_v` = Subset after split on value v
- `|S_v| / |S|` = Weighted proportion of subset

**Interpretation**:
- **High IG**: Feature creates good separation → prefer this split
- **Low IG**: Feature doesn't help much → consider other features
- **Best split**: Feature with maximum IG

---

### 3. Information Gain for Continuous Features

**Challenge**: Infinite possible thresholds (e.g., IPK could split at 3.15, 3.16, 3.17, ...)

**Solution**: Binary search approach
1. Sort data by continuous feature
2. Identify candidate split points (midpoints between consecutive values)
3. Evaluate IG for each candidate
4. Select threshold with maximum IG

**Python Implementation**:
```python
def calculate_information_gain_continuous(data, labels, feature, parent_entropy):
    """Calculate best split for continuous feature"""
    
    # Get unique values and sort
    values = sorted(set(row[feature] for row in data))
    
    if len(values) < 2:
        return 0, None  # Cannot split
    
    best_gain = 0
    best_threshold = None
    
    # Try split points between consecutive values
    for i in range(len(values) - 1):
        threshold = (values[i] + values[i + 1]) / 2
        
        # Split data
        left_labels = [labels[j] for j, row in enumerate(data) 
                       if row[feature] <= threshold]
        right_labels = [labels[j] for j, row in enumerate(data) 
                        if row[feature] > threshold]
        
        # Calculate weighted entropy after split
        total = len(labels)
        left_entropy = calculate_entropy(left_labels)
        right_entropy = calculate_entropy(right_labels)
        
        weighted_entropy = (len(left_labels) / total) * left_entropy + \
                          (len(right_labels) / total) * right_entropy
        
        # Calculate information gain
        gain = parent_entropy - weighted_entropy
        
        # Update best if improved
        if gain > best_gain:
            best_gain = gain
            best_threshold = threshold
    
    return best_gain, best_threshold
```

**Example**:
- Feature: IPK
- Values: [2.8, 3.0, 3.2, 3.5, 3.8]
- Candidate thresholds: [2.9, 3.1, 3.35, 3.65]
- Best threshold: 3.2 (IG = 0.15)

---

### 4. Information Gain for Categorical Features

**Approach**: Multi-way split (one branch per category)

**Python Implementation**:
```python
def calculate_information_gain_categorical(data, labels, feature, parent_entropy):
    """Calculate information gain for categorical feature"""
    
    # Group data by category
    category_groups = {}
    for i, row in enumerate(data):
        category = row[feature]
        if category not in category_groups:
            category_groups[category] = []
        category_groups[category].append(labels[i])
    
    # Calculate weighted entropy
    total = len(labels)
    weighted_entropy = 0
    
    for category_labels in category_groups.values():
        weight = len(category_labels) / total
        entropy = calculate_entropy(category_labels)
        weighted_entropy += weight * entropy
    
    # Information gain
    gain = parent_entropy - weighted_entropy
    
    return gain
```

**Example**:
- Feature: Prestasi_Akademik
- Categories: Tidak Ada (H=0.8), Regional (H=0.6), Nasional (H=0.3)
- IG = 0.7 - 0.65 = 0.05

---

## Stopping Criteria

### Why Stop Early?

**Problem**: Without stopping, tree grows until pure leaf nodes → overfitting!

**Symptoms of Overfitting**:
- Perfect training accuracy (100%)
- Poor testing accuracy (60-70%)
- Tree memorizes noise, not patterns

### Implemented Criteria

```python
# Configuration
MIN_SAMPLES_LEAF = 10      # Minimum samples per leaf
MAX_DEPTH = 4              # Maximum tree depth
MIN_ENTROPY = 0.3          # Stop if entropy too low
MIN_IG = 0.01             # Stop if information gain too small
```

**Criteria Details**:

1. **MIN_SAMPLES_LEAF = 10**
   - Stop if node has ≤10 samples
   - Prevents creating leaves for rare cases
   - Ensures statistical significance

2. **MAX_DEPTH = 4**
   - Limit tree depth to 4 levels (5 layers total including root)
   - Balances complexity vs interpretability
   - Prevents excessive branching

3. **MIN_ENTROPY = 0.3**
   - Stop if entropy <0.3 (relatively pure)
   - Example: 80% one class → entropy ≈0.72 (continue)
   - Example: 90% one class → entropy ≈0.47 (continue)
   - Example: 95% one class → entropy ≈0.29 (STOP)

4. **MIN_IG = 0.01**
   - Stop if best split gains <0.01 information
   - Prevents splitting on noise
   - No meaningful improvement → make leaf

---

## Tree Building Algorithm

### Recursive Construction

```python
def build_tree_recursive(data, labels, features, depth=0, node_id="0"):
    """Recursively build decision tree"""
    
    # Calculate current entropy
    entropy = calculate_entropy(labels)
    
    # STOPPING CONDITION 1: Pure or near-pure node
    if entropy <= MIN_ENTROPY:
        return create_leaf_node(labels, entropy, node_id)
    
    # STOPPING CONDITION 2: Maximum depth reached
    if depth >= MAX_DEPTH:
        return create_leaf_node(labels, entropy, node_id)
    
    # STOPPING CONDITION 3: Too few samples
    if len(data) < MIN_SAMPLES_LEAF * 2:
        return create_leaf_node(labels, entropy, node_id)
    
    # Find best feature to split on
    best_feature, best_gain, best_threshold = find_best_split(
        data, labels, features, entropy
    )
    
    # STOPPING CONDITION 4: No good split available
    if best_gain < MIN_IG:
        return create_leaf_node(labels, entropy, node_id)
    
    # Create internal node and split data
    node = {
        'type': 'internal',
        'feature': best_feature,
        'threshold': best_threshold,  # None for categorical
        'entropy': entropy,
        'samples': len(data),
        'node_id': node_id
    }
    
    # Split data and recurse
    if best_threshold is not None:
        # Binary split for continuous feature
        left_data, left_labels = split_continuous(data, labels, best_feature, best_threshold)
        right_data, right_labels = split_continuous(data, labels, best_feature, best_threshold, inverse=True)
        
        node['left'] = build_tree_recursive(left_data, left_labels, features, depth+1, node_id+"-L")
        node['right'] = build_tree_recursive(right_data, right_labels, features, depth+1, node_id+"-R")
    else:
        # Multi-way split for categorical feature
        branches = {}
        for category in get_categories(data, best_feature):
            cat_data, cat_labels = filter_by_category(data, labels, best_feature, category)
            branches[category] = build_tree_recursive(
                cat_data, cat_labels, features, depth+1, f"{node_id}-{category}"
            )
        node['branches'] = branches
    
    return node
```

---

## TreeNode Class

```python
class TreeNode:
    """Represents a node in the decision tree"""
    
    def __init__(self, node_id="0"):
        self.node_id = node_id
        self.feature = None        # Feature to split on
        self.threshold = None      # Threshold for continuous features
        self.children = {}         # Child nodes
        self.is_leaf = False       # Leaf node flag
        self.prediction = None     # Class prediction (leaf only)
        self.confidence = None     # Confidence score (leaf only)
        self.entropy = None        # Node entropy
        self.samples = None        # Number of samples
```

---

## Model Training Results (V1)

### Tree Statistics
- **Total Nodes**: 29 (15 internal, 14 leaf nodes)
- **Tree Depth**: 4 levels
- **Average Confidence**: 78%
- **Training Time**: <2 seconds

### Performance Metrics
- **Accuracy**: 74%
- **Precision**: 73.53%
- **Recall**: 59.52%
- **F1-Score**: 65.79%

### Feature Usage
Most important features (by IG at root):
1. **Penghasilan_Ortu** (IG=0.228) - Root split at Rp 3.55M
2. **IPK** (IG=0.185) - Multiple splits (3.20, 3.54)
3. **Prestasi_Akademik** (IG=0.089)
4. **SKS_Lulus** (IG=0.042)
5. **Tanggungan** (IG=0.038)
6. **Keaktifan_Organisasi** (IG=0.015)

---

## Output Files

### 1. decision_rules.json
Complete tree structure in JSON format (machine-readable)

### 2. decision_rules.txt
Human-readable rule representation:
```
Rule 1: IF Penghasilan_Ortu <= 3550000 AND IPK > 3.20 
        THEN Layak (confidence: 85%)
```

### 3. decision_rules.csv
Tabular format for Excel analysis

---

## Usage Example

```bash
cd generated/500
python build_complete_tree.py
```

**Expected Output**:
```
Building decision tree (V1 - Baseline)...
✅ Tree built successfully
   - Total nodes: 29
   - Leaf nodes: 15
   - Max depth: 4
   - Avg confidence: 78%

✅ Rules saved to decision_rules.json
✅ Rules saved to decision_rules.txt
✅ Rules saved to decision_rules.csv
```

---

## Limitations & Next Steps

### Known Issues
1. **74% accuracy** - room for improvement
2. **17 False Negatives** - missing eligible students
3. **Fine-grained continuous splits** - may not align with human reasoning

### Solution: Feature Engineering (V2)
→ See **06_model_refined.md** for enhanced version with categorical features

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-18  
**Status**: Complete
