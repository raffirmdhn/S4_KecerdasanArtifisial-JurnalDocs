# Environment Setup

## System Requirements

### Operating System
- **Supported**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Tested On**: Windows 11

### Python Version
- **Required**: Python 3.8 or higher
- **Recommended**: Python 3.10+
- **Tested With**: Python 3.10.x

---

## Dependencies

### Core Libraries (Built-in)

This project uses **ONLY Python standard library** - no external dependencies required!

```python
import csv           # CSV file reading/writing
import math          # Mathematical operations (log2, sqrt)
import json          # JSON serialization
from collections import Counter  # Counting operations
```

**Why No External Libraries?**
- ✅ **Educational Purpose**: Understand algorithms from scratch
- ✅ **Minimal Setup**: No pip install needed
- ✅ **Transparency**: See every calculation step
- ✅ **Portability**: Runs anywhere Python runs
- ✅ **No Version Conflicts**: Pure Python compatibility

---

## Installation Guide

### Step 1: Verify Python Installation

```bash
# Check Python version
python --version

# Or on some systems
python3 --version
```

**Expected Output**: `Python 3.10.x` or higher

If Python not installed, download from: https://www.python.org/downloads/

### Step 2: Create Project Directory

```bash
# Create main project folder
mkdir scholarship_decision_tree
cd scholarship_decision_tree

# Create subdirectories
mkdir generated
mkdir generated/dataset
mkdir generated/500
mkdir generated/report_docs
```

### Step 3: Verify Python Environment

```bash
# Test Python imports
python -c "import csv, math, json; from collections import Counter; print('All imports successful!')"
```

**Expected Output**: `All imports successful!`

---

## Optional: Virtual Environment Setup

While not required (no external dependencies), you may want to use a virtual environment for organization:

### Windows

```bash
# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate

# Verify
python --version
```

### macOS/Linux

```bash
# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate

# Verify
python --version
```

### Deactivate (when done)

```bash
deactivate
```

---

## Project Structure Setup

### Create Complete Folder Hierarchy

```bash
scholarship_decision_tree/
├── generated/
│   ├── dataset/                 # Training & testing data
│   ├── 500/                     # Main scripts directory
│   └── report_docs/             # Documentation
│       ├── technical/           # Technical guides
│       └── reference/           # Reference materials
├── journals/                    # Research papers (optional)
└── README.md                    # Project readme (optional)
```

### Create Required Folders (Command Line)

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "generated/dataset"
New-Item -ItemType Directory -Force -Path "generated/500"
New-Item -ItemType Directory -Force -Path "generated/report_docs/technical"
New-Item -ItemType Directory -Force -Path "generated/report_docs/reference"
```

**macOS/Linux (Bash):**
```bash
mkdir -p generated/dataset
mkdir -p generated/500
mkdir -p generated/report_docs/technical
mkdir -p generated/report_docs/reference
```

---

## File Naming Conventions

### Scripts
- Use descriptive snake_case names
- Include version suffix for iterations (e.g., `_v2.py`)
- Example: `build_complete_tree_v2.py`

### Data Files
- Use descriptive names with size indicator
- Example: `dataset_training_400.csv`
- Enhanced versions: `dataset_training_400_enhanced.csv`

### Results Files
- Include version and processing stage
- Example: `testing_results_v2_with_overrides_refined.csv`

### Documentation
- Number files for sequential reading
- Example: `01_overview.md`, `02_environment_setup.md`

---

## Verification Checklist

Before starting development, verify:

- [ ] Python 3.8+ installed and accessible
- [ ] Can import: `csv`, `math`, `json`, `collections`
- [ ] Project folder structure created
- [ ] Write permissions in project directory
- [ ] Terminal/command prompt accessible
- [ ] Text editor/IDE installed (VS Code recommended)

---

## Development Tools (Recommended)

### Code Editor
- **VS Code** (Recommended)
  - Python extension for syntax highlighting
  - Built-in terminal
  - Git integration
  
- **Alternatives**: PyCharm, Sublime Text, Notepad++

### Terminal
- **Windows**: PowerShell, Command Prompt, or Git Bash
- **macOS/Linux**: Built-in Terminal

### CSV Viewer
- **Excel** (for data inspection)
- **VS Code** with Rainbow CSV extension
- **Online**: https://csvlint.io/

### Markdown Viewer
- **VS Code** (built-in preview)
- **Online**: https://dillinger.io/

---

## Performance Considerations

### System Resources

**Minimum Requirements:**
- **RAM**: 4 GB (dataset fits in memory)
- **Storage**: 50 MB (data + scripts + docs)
- **CPU**: Any modern processor (no GPU needed)

**Recommended:**
- **RAM**: 8 GB or more
- **Storage**: 100 MB (with room for additional files)

### Execution Time Estimates

| Task | Estimated Time | Resource Usage |
|------|---------------|----------------|
| Dataset Generation (500 records) | < 1 second | Minimal |
| Feature Engineering | < 1 second | Minimal |
| Tree Building (V2) | 1-2 seconds | Minimal |
| Testing (100 records) | < 1 second | Minimal |
| Policy Overrides | < 1 second | Minimal |
| **Total Pipeline** | **< 10 seconds** | **Very Light** |

**Note**: All operations are lightweight - no GPU or special hardware required!

---

## Troubleshooting

### Issue: "Python not found"

**Solution**: Add Python to PATH
- **Windows**: Reinstall Python, check "Add Python to PATH" option
- **macOS/Linux**: Use `python3` instead of `python`

### Issue: "No module named 'csv'"

**Solution**: This indicates Python installation issue
- Reinstall Python from official source
- Ensure using Python (not Anaconda base without proper setup)

### Issue: "Permission denied"

**Solution**: Run terminal as administrator or check folder permissions
- **Windows**: Right-click terminal → "Run as administrator"
- **macOS/Linux**: Use `sudo` if needed, or change folder ownership

### Issue: CSV files show encoding errors

**Solution**: Ensure UTF-8 encoding
- Most scripts use `encoding='utf-8'` parameter
- If issues persist, check regional settings

---

## Next Steps

After environment setup:
1. ✅ Proceed to **03_data_generation.md** - Create dataset
2. ✅ Run verification tests
3. ✅ Start building decision tree

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-19  
**Status**: Complete
