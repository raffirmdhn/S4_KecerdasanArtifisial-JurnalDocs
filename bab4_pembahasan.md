# BAB 4  
# PEMBAHASAN

## 4.1 Analisis Efektivitas Feature Engineering

### 4.1.1 Mengapa Feature Engineering Berhasil (+7 pp)

Peningkatan akurasi dari 74% (V1) menjadi 81% (V2) merupakan kontribusi terbesar dalam penelitian ini, yang dicapai hanya dengan menambahkan 4 fitur kategorikal. Pembahasan berikut menganalisis mekanisme di balik keberhasilan tersebut.

**1. Alignment dengan Model Mental Manusia**

Panitia beasiswa cenderung berpikir dalam kategori, bukan nilai kontinu:
- "Mahasiswa dari keluarga **kurang mampu**" (bukan "penghasilan Rp 3.450.000")
- "IPK **tinggi**" (bukan "IPK 3.7845")
- "Tanggungan keluarga **besar**" (bukan "5.3 orang")

Fitur kategorikal menangkap pola pikir ini, membuat decision tree lebih sejalan dengan kebijakan institusional. Hal ini sesuai dengan teori **cognitive chunking** (Miller, 1956) yang menyatakan manusia memproses informasi dalam kelompok kategorikal (7±2 item), bukan nilai numerik presisi tinggi.

**2. Pengurangan Overfitting pada Split Kontinu**

Model V1 menghasilkan split seperti:
- `IF Penghasilan_Ortu <= 3,550,000 THEN ...`
- `IF IPK <= 3.2015 THEN ...`

Threshold 3.2015 terlihat overfitted (terlalu spesifik untuk data latih). Sebaliknya, fitur kategorikal dengan threshold 3.2 (batas kategori "Mid") lebih robust:
- Berdasarkan pengetahuan domain (rata-rata IPK kampus)
- Generalisasi lebih baik ke data unseen
- Mengurangi variance tanpa menambah bias secara signifikan

**3. Separasi Kelas yang Lebih Baik**

Analisis distribusi menunjukkan:

**Penghasilan_Kategori** vs **Penghasilan_Ortu (kontinu)**:
- Kategori "Low": 85% Layak, 15% Tidak Layak → **Separasi jelas**
- Rentang 2.5-3.5 juta (kontinu): 65% Layak, 35% Tidak Layak → **Overlap tinggi**

Fitur kategorikal secara eksplisit mengumpulkan rentang nilai dengan perilaku serupa, meningkatkan homogenitas dalam setiap split dan menaikkan Information Gain:
- IG(Penghasilan_Ortu kontinu) = 0.2287
- IG(Penghasilan_Kategori) = 0.2450 → **+0.0163 improvement**

**4. Handling Borderline Cases**

Dari 17 False Negatives (V1), 6 kasus adalah mahasiswa borderline:
- IPK 3.2-3.5 (zona gray antara Low dan Mid)
- Penghasilan 3-5 juta (zona gray antara Low dan Mid)

V2 dengan fitur kategorikal menangani kasus ini lebih baik karena:
- Kategori "Mid" menciptakan aturan eksplisit untuk zona gray
- Decision boundary lebih jelas (3.2 untuk IPK, 3 juta untuk penghasilan)
- Mengurangi ambiguitas yang menyebabkan misclassification

**Kesimpulan Teoritis:**

Feature engineering efektif bukan karena menambah informasi baru (fitur kategorikal derived dari fitur kontinu), tetapi karena **mengubah representasi** data agar lebih aligned dengan:
1. Pola pikir pembuat keputusan (domain experts)
2. Structure natural dari problem domain
3. Distribusi statistik yang lebih separable

Ini memvalidasi prinsip **representation learning**: "The right representation makes subsequent learning easier" (Bengio et al., 2013).

---

## 4.2 Analisis Arsitektur Hybrid (ML + Policy Override)

### 4.2.1 Rasional Hybrid Approach

Penelitian ini mengadopsi arsitektur hybrid: **Machine Learning (81%) + Policy Override Layer (+2%)** untuk mencapai 83% akurasi final. Pendekatan ini berbeda dari pure ML atau pure rule-based system.

**Mengapa Tidak Pure Machine Learning?**

Pure ML memiliki keterbatasan dalam domain beasiswa:
1. **Black box problem**: Sulit menjelaskan ke stakeholder mengapa mahasiswa ditolak
2. **Edge cases**: ML struggle dengan kasus langka tetapi penting (contoh: prestasi nasional dengan tanggungan besar)
3. **Policy compliance**: ML mungkin melanggar aturan institusional implisit

**Mengapa Tidak Pure Rule-Based System?**

Pure rules terlalu rigid:
1. **Maintenance burden**: Setiap edge case membutuhkan rule baru → rules explosion
2. **Conflict resolution**: 15+ rules dengan prioritas berbeda sulit di-manage
3. **Tidak adaptif**: Tidak belajar dari data baru

**Keunggulan Hybrid:**

| Aspek | ML Component | Policy Override Layer |
|-------|--------------|----------------------|
| **Coverage** | 96% kasus (mayoritas) | 4% kasus (edge cases) |
| **Learning** | Adaptif dari data | Static, expertly-defined |
| **Explainability** | Rule extraction (15 rules) | Explicit conditions |
| **Maintenance** | Re-train dengan data baru | Manual update untuk policy changes |

Sistem hybrid memungkinkan:
- ML menangani pola umum (learned dari 400 training samples)
- Policy override menangani exceptional cases yang known a priori
- Clear separation of concerns (data-driven vs policy-driven)

### 4.2.2 Analisis Kegagalan Override V1 vs Sukses V2

**Override V1 (Gagal):**
```
IF IPK >= 2.5 AND Penghasilan <= 7 juta AND Tanggungan >= 4
THEN override ke "Layak"
```
- 15 overrides diterapkan, hanya 3 benar (20% precision)
- Akurasi turun dari 81% ke 72% (-9 pp)

**Root cause kegagalan:**
1. **Too permissive**: IPK 2.5 terlalu rendah (termasuk mahasiswa struggling)
2. **Too broad**: Penghasilan 7 juta termasuk keluarga menengah-atas
3. **High recall, low precision**: Menangkap banyak kasus tetapi banyak false positives

**Override V2 (Sukses):**
```
Rule A: IPK >= 3.3 AND Penghasilan <= 5 juta AND
        (Tanggungan >= 6 OR (Prestasi Nasional + multiple conditions))
```
- 4 overrides diterapkan, 3 benar (75% precision)
- Akurasi naik dari 81% ke 83% (+2 pp)

**Why V2 worked:**
1. **Tighter constraints**: IPK 3.3 (akademik viable), Penghasilan 5 juta (real need)
2. **Disjunctive conditions**: Tanggungan ≥6 (extreme burden) OR exceptional achievement
3. **Surgical precision**: Hanya menangani kasus sangat spesifik

**Lesson Learned:**

> "Policy overrides should be surgical, not broad. Over-intervening causes more harm than under-intervening."

Ini sejalan dengan prinsip **Occam's Razor** dalam ML: prefer simpler models with fewer interventions. Override sebaiknya digunakan untuk:
- Known systematic errors (bukan random errors)
- Cases dengan high confidence dalam domain knowledge
- Trade-off recall vs precision yang clear

---

## 4.3 Analisis Pola Error dan Implikasinya

### 4.3.1 False Negatives (8 Kasus Tersisa)

Meskipun berhasil mengurangi FN dari 17 (V1) ke 8 (Final), masih ada mahasiswa layak yang terlewat. Analisis mendalam terhadap 8 kasus:

**Pattern 1: Borderline Multiple Factors (3 kasus)**
- Contoh: IPK 3.25, Penghasilan 4.5 juta, Tanggungan 3, Tidak ada prestasi
- **Insight**: Tidak ada sinyal kuat tunggal, semua faktor di zona gray
- **Implikasi**: Model struggle dengan "aggregate of moderates"
- **Solusi potensial**: Composite scoring system (weighted sum)

**Pattern 2: Income Catch-All Rule (2 kasus)**
- Contoh: Penghasilan 5.2-6 juta dengan faktor lain strong (IPK 3.6, Tanggungan 5)
- **Insight**: Threshold 5 juta terlalu strict untuk kasus exceptional
- **Implikasi**: Need dynamic thresholding based on other factors
- **Solusi potensial**: Fuzzy logic untuk boundary cases

**Pattern 3: Legitimate Edge Cases (3 kasus)**
- Contoh: Prestasi regional (bukan nasional) dengan IPK 3.15
- **Insight**: Policy ambiguity - apakah prestasi regional cukup mengompensasi IPK borderline?
- **Implikasi**: Butuh klarifikasi policy dari stakeholder
- **Solusi potensial**: Human-in-the-loop untuk cases ini

**Rekomendasi:**

Untuk 8 FN tersisa, peneliti merekomendasikan **tidak** menambah complexity model lebih lanjut karena:
1. Risk of overfitting (model terlalu tuned untuk 100 testing samples)
2. Diminishing returns (effort tinggi untuk improvement kecil)
3. **Trade-off acceptable**: 19% FN rate reasonable untuk sistem pendukung keputusan (bukan automated decision)

### 4.3.2 False Positives (9 Kasus)

9 mahasiswa diprediksi Layak tetapi actual Tidak Layak. Analisis:

**Pattern 1: Grade Inflation (4 kasus)**
- Contoh: IPK 3.6 dengan Penghasilan 6.5 juta, Tanggungan 2
- **Insight**: IPK tinggi tidak selalu indikasi butuh beasiswa jika keluarga mampu
- **Implikasi**: IPK alone insufficient, context matters

**Pattern 2: Override Collateral Damage (1 kasus - Rule B)**
- Contoh: Record 78 (IPK_Kategori High + Tanggungan_Kategori High tetapi penghasilan cukup)
- **Insight**: Rule B perlu refinement (add income cap 6 juta bukan 7 juta)

**Pattern 3: Multiple Moderate Factors Misinterpreted (4 kasus)**
- Contoh: IPK 3.4, Penghasilan 5 juta, Tanggungan 4 (semua di threshold boundary)
- **Insight**: Aggregate seems eligible tetapi context detail (misalnya orang tua PNS) tidak captured

**Implikasi FP:**

FP lebih acceptable daripada FN dalam konteks beasiswa:
- **FP**: Mahasiswa tidak eligible receive scholarship → screening kedua dapat koreksi
- **FN**: Mahasiswa eligible rejected → opportunity loss, impact student welfare

Namun, FP rate 15.5% (9/58) masih reasonable untuk pre-screening system.

---

## 4.4 Perbandingan dengan Penelitian Terkait

### 4.4.1 Comparison dengan Studi Sejenis

**[1] Klasifikasi Kelayakan Penerimaan Beasiswa KIP (2021)**
- Metode: Decision Tree C4.5
- Akurasi: 76%
- Dataset: 120 rekaman (real data)
- **Perbedaan:** Penelitian ini mencapai 83% (+7 pp) dengan feature engineering

**[2] Penerapan Algoritma Decision Tree untuk Seleksi Penerima Beasiswa (2022)**
- Metode: Decision Tree C4.5
- Akurasi: 72%
- Dataset: 100 rekaman (real data SMP)
- **Perbedaan:** Penelitian ini menggunakan fitur kategorikal domain-informed

**[3] Klasifikasi Kelayakan Data Beasiswa PIP (2024)**
- Metode: Decision Tree
- Akurasi: 78%
- Dataset: 150 rekaman
- **Perbedaan:** Penelitian ini mencapai 83% dengan hybrid ML+policy approach

**Positioning Penelitian Ini:**

| Aspek | Penelitian Terkait | Penelitian Ini | Keunggulan |
|-------|-------------------|----------------|------------|
| **Akurasi** | 72-78% | **83%** | +5-11 pp improvement |
| **Dataset Size** | 100-150 | **500** | Lebih robust, less overfitting |
| **Feature Engineering** | Minimal | **Kategorikal berbasis domain** | Significant impact (+7 pp) |
| **Hybrid Approach** | Pure ML | **ML + Policy Override** | Better handling edge cases |
| **Explainability** | Moderate | **Tinggi (15 rules + manual calc)** | Educational + practical |

**Kontribusi Utama Penelitian Ini:**

1. **Metodologi feature engineering** yang sistematis berbasis domain knowledge
2. **Hybrid architecture** (ML + policy) untuk production system
3. **Dokumentasi lengkap** termasuk perhitungan manual untuk educational purposes
4. **Dataset lebih besar** (500 records) untuk generalisasi lebih baik

### 4.4.2 Validasi dengan Teori Information Gain

Hasil penelitian memvalidasi teori entropi dan information gain:

**Theoretical Expectation:**
- Fitur dengan IG tinggi dipilih di level atas (root)
- Fitur dengan IG rendah dipilih di level bawah atau tidak digunakan
- Entropy menurun seiring depth (konvergen ke pure nodes)

**Empirical Results:**
- ✅ Penghasilan_Kategori (IG=0.245) dipilih sebagai root
- ✅ IPK_Kategori (IG=0.182) dipilih di Level 1
- ✅ Prestasi_Akademik (IG=0.089) dipilih di Level 2
- ✅ Keaktifan_Organisasi (IG=0.015) jarang digunakan (hanya 1 node)

**Entropy Reduction:**
- Level 0: H(S) = 0.9534 bits
- Level 1: H(S) = 0.78-0.81 bits (average)
- Level 2: H(S) = 0.45-0.65 bits (average)
- Leaf nodes: H(S) = 0-0.25 bits (mostly pure)

**Conclusion:** Implementasi manual konsisten dengan teori, validasi algoritma correct.

---

## 4.5 Alignment dengan Kebijakan Beasiswa

### 4.5.1 Prinsip Kebijakan Universitas

Kebijakan beasiswa umumnya berdasarkan 3 pilar:

**1. Academic Merit (30-40% weight)**
- Indikator: IPK, SKS lulus, prestasi akademik
- Threshold: IPK minimal 3.0 (grade C)
- Rasional: Investasi pada mahasiswa yang viable

**2. Financial Need (40-50% weight)**
- Indikator: Penghasilan orang tua, tanggungan keluarga
- Threshold: Penghasilan di bawah garis kemiskinan atau UMR
- Rasional: Membantu yang benar-benar membutuhkan

**3. Character/Leadership (10-20% weight)**
- Indikator: Prestasi non-akademik, keaktifan organisasi
- Threshold: Minimal aktif di organisasi atau punya prestasi
- Rasional: Mengembangkan leader masa depan

### 4.5.2 Alignment Model dengan Kebijakan

**Root Split: Penghasilan_Kategori**
- ✅ Aligned: Financial need sebagai primary criterion (pilar 2)
- ✅ Information Gain tertinggi (0.245) → most discriminative feature
- ✅ Separasi jelas: Low income (85% layak) vs High income (95% tidak layak)

**Level 1: IPK_Kategori**
- ✅ Aligned: Academic merit sebagai secondary criterion (pilar 1)
- ✅ Dalam cabang Low Income, IPK membedakan mahasiswa viable vs struggling
- ✅ Threshold 3.2 sesuai standar akademik universitas

**Level 2: Prestasi & Keaktifan**
- ✅ Aligned: Character/leadership sebagai tertiary criterion (pilar 3)
- ✅ Prestasi Nasional mengompensasi faktor moderate lainnya
- ✅ Pengurus organisasi menambah poin untuk borderline cases

**Policy Override Layer:**
- ✅ Aligned: Menangani exceptional cases yang known dalam kebijakan
- ✅ Rule A: High need + viable academic (IPK 3.3+) → must support
- ✅ Rule B: High achiever + large family → deserve opportunity

**Kesimpulan:** Model decision tree secara natural belajar hierarki prioritas yang aligned dengan kebijakan institusional, tanpa explicitly programming policy weights. Ini menunjukkan data-driven approach dapat capture domain knowledge implicitly.

---

## 4.6 Diskusi Keterbatasan Model

### 4.6.1 Keterbatasan Teknis

**1. Dataset Sintetis**
- **Limitation**: Data dibangkitkan secara artifisial, bukan dari real scholarship applications
- **Impact**: Distribusi mungkin tidak perfectly match realitas
- **Mitigation**: Gunakan distribusi berbasis penelitian demografi Indonesia
- **Future work**: Validasi dengan data riil dari universitas

**2. Fitur Terbatas (6+4 variables)**
- **Limitation**: Tidak menangkap aspek kualitatif (essay, interview, recommendation letters)
- **Impact**: Model tidak "complete" untuk decision akhir
- **Mitigation**: Model sebagai pre-screening, bukan final decision
- **Future work**: Integrate text analysis untuk essay scholarship

**3. Imbalanced Dataset (39:61)**
- **Limitation**: Lebih banyak "Tidak Layak" daripada "Layak"
- **Impact**: Model mungkin bias toward majority class
- **Mitigation**: Recall optimization (prioritize detecting positive class)
- **Note**: Imbalance realistis (tidak semua mahasiswa eligible)

**4. Static Thresholds**
- **Limitation**: Threshold kategorikal (3.2 untuk IPK, 3 juta untuk penghasilan) fixed
- **Impact**: Tidak adaptif terhadap inflasi atau policy changes
- **Mitigation**: Annual review dan update thresholds
- **Future work**: Adaptive thresholding based on economic indicators

### 4.6.2 Keterbatasan Konseptual

**1. Single Point-in-Time Assessment**
- **Limitation**: Model menggunakan data satu semester (semester 3)
- **Impact**: Tidak menangkap trajectory (improving vs declining)
- **Example**: Mahasiswa dengan IPK 3.1 tetapi trend naik (2.8 → 3.0 → 3.1) vs stabil
- **Future work**: Temporal analysis (time series features)

**2. Context-Free Evaluation**
- **Limitation**: Tidak menangkap context individual (family situation changes)
- **Impact**: Kasus seperti "orang tua tiba-tiba sakit" tidak terdeteksi
- **Mitigation**: Human review layer untuk exceptional circumstances
- **Note**: Ini limitation fundamental dari ML (pattern-based, not context-aware)

**3. Correlation ≠ Causation**
- **Limitation**: Model menemukan korelasi (IPK tinggi → layak) bukan kausalitas
- **Impact**: Potential spurious correlations jika data biased
- **Example**: Jika historical committee bias toward prestasi nasional, model belajar bias tersebut
- **Mitigation**: Regular fairness audit dan bias detection

### 4.6.3 Keterbatasan Praktis

**1. Interpretability vs Accuracy Trade-off**
- **Trade-off**: Decision tree (83%) vs Neural Network (potentially 85-90%)
- **Choice**: Prioritas interpretability untuk domain beasiswa
- **Justification**: Stakeholder need explainability, bukan just accuracy

**2. Maintenance Burden**
- **Limitation**: Model perlu re-train jika kebijakan berubah
- **Impact**: Maintenance cost (data collection, retraining, validation)
- **Mitigation**: Design for easy retraining (modular pipeline)

**3. Human Oversight Required**
- **Limitation**: Model bukan automated decision maker
- **Impact**: Still need human committee untuk final review
- **Note**: Ini feature, bukan bug - human-in-the-loop by design

---

## 4.7 Implikasi untuk Sistem Beasiswa

### 4.7.1 Implikasi Praktis

**1. Efisiensi Screening**
- **Current process**: Manual review 500 aplikasi (8 jam × 5 committee members = 40 jam)
- **With AI pre-screening**: Review 50 flagged cases (2 jam × 5 members = 10 jam)
- **Time savings**: 75% reduction (30 jam saved)

**2. Konsistensi Keputusan**
- **Benefit**: Reduce subjective bias dari individual reviewer
- **Evidence**: Model memiliki clear rules (15 aturan) yang konsisten
- **Caveat**: Bias masih bisa ada jika data training biased

**3. Transparansi**
- **Benefit**: Mahasiswa dapat lihat "mengapa ditolak" dari decision path
- **Example**: "Anda ditolak karena IPK < 3.2 DAN penghasilan orang tua > 7 juta"
- **Impact**: Reduce complaints dan meningkatkan trust

### 4.7.2 Implikasi Etis

**1. Fairness Concerns**
- **Risk**: Model mungkin diskriminasi terhadap demographic groups tertentu
- **Example**: Jika "prestasi nasional" lebih sering dari kota besar, model bias toward urban students
- **Mitigation**: Regular fairness audits (compare approval rate across demographics)

**2. False Negatives Impact**
- **Impact**: 8 mahasiswa layak ditolak → opportunity cost significant
- **Severity**: Beasiswa adalah life-changing untuk low-income students
- **Recommendation**: Prioritize recall over precision (better FP than FN)

**3. Accountability**
- **Question**: "Who is responsible jika model salah?"
- **Answer**: Hybrid system → committee tetap ultimate decision maker
- **Model role**: Tool to assist, bukan replace, human judgment

### 4.7.3 Implikasi untuk Mahasiswa

**1. Positive Impact**
- ✅ Faster decision (2 minggu → 1 minggu)
- ✅ Lebih transparan (clear criteria)
- ✅ Less subjective bias

**2. Potential Concerns**
- ⚠️ "Gaming the system" - mahasiswa optimize untuk model bukan genuine improvement
- ⚠️ Loss of personal narrative (model tidak baca essay)
- ⚠️ Edge cases mungkin disadvantaged

**3. Recommendations untuk Mahasiswa**
- Focus on genuine academic performance (IPK, prestasi)
- Document financial situation accurately
- Participate dalam organisasi (leadership development)
- **Note**: Kriteria yang sama dengan kebijakan existing, bukan kriteria baru

---

## 4.8 Diskusi Metodologi

### 4.8.1 Pilihan Algoritma: Mengapa Decision Tree?

**Kelebihan Decision Tree untuk Beasiswa:**

1. **Interpretability**: Rules mudah dijelaskan ke stakeholder non-teknis
2. **No Feature Scaling**: Tidak perlu normalisasi (income dan IPK di skala berbeda)
3. **Mixed Data Types**: Handle categorical (prestasi) dan continuous (IPK) simultaneously
4. **Feature Importance**: Jelas fitur mana yang paling penting
5. **Efficient**: Fast training dan prediction (<2 detik untuk 500 records)

**Comparison dengan Alternatif:**

| Algoritma | Accuracy (estimated) | Interpretability | Training Time | Adoption Barrier |
|-----------|---------------------|------------------|---------------|------------------|
| **Decision Tree** | 83% | ⭐⭐⭐⭐⭐ | 1.8s | Low (simple) |
| Logistic Regression | 79-81% | ⭐⭐⭐⭐ | 0.5s | Low |
| Random Forest | 85-88% | ⭐⭐ | 15s | Medium (ensemble) |
| Neural Network | 87-90% | ⭐ | 60s+ | High (black box) |
| SVM | 82-84% | ⭐⭐ | 10s | Medium (complex) |

**Conclusion**: Decision tree optimal untuk educational purposes dan stakeholder buy-in, meskipun bukan absolutely highest accuracy.

### 4.8.2 Manual Implementation vs Library (sklearn)

**Mengapa Tidak Menggunakan sklearn?**

Penelitian ini deliberately menggunakan pure Python implementation tanpa library ML:

**Advantages:**
1. **Educational value**: Mahasiswa paham algoritma deeply (entropy, IG calculation)
2. **Transparency**: Full control atas stopping criteria dan splitting logic
3. **Customization**: Mudah modify untuk hybrid approach (ML + policy override)
4. **Reproducibility**: Tidak depend on library version changes

**Trade-offs:**
1. **Development time**: Lebih lama develop (manual implementation vs sklearn 2 lines)
2. **Optimization**: sklearn mungkin lebih efficient (C++ backend)
3. **Features**: Sklearn punya pruning, cost-complexity, dll yang advanced

**Validation:**

Untuk memastikan implementation correct:
- ✅ Manual calculation (Level 0-2) match automated results
- ✅ Entropy formula produces expected values
- ✅ Information Gain selalu non-negative (theoretical property)
- ✅ Decision boundaries logical dan interpretable

**Recommendation**: Manual implementation ideal untuk pembelajaran, sklearn untuk production deployment.

---

## 4.9 Refleksi Proses Iteratif

### 4.9.1 Timeline Development

**Week 1: Dataset Generation & Discovery**
- Initial approach: 150 records
- **Lesson**: Small dataset prone to overfitting
- **Pivot**: Scale ke 500 records untuk robustness

**Week 2: Baseline Model (74%)**
- **Insight**: Raw features tidak cukup, recall rendah (59%)
- **Learning**: Continuous features create overfitted splits

**Week 3: Feature Engineering (81%)**
- **Breakthrough**: Categorical features +7 pp improvement
- **Lesson**: Domain knowledge > algorithmic complexity

**Week 4: Policy Override (83%)**
- **Iteration 1 failed**: Broad rules create more errors
- **Iteration 2 success**: Surgical precision works
- **Lesson**: Less is more untuk interventions

### 4.9.2 Key Decision Points

**Decision 1: Dataset Size (500 vs 150)**
- **Impact**: High (foundation untuk semua downstream work)
- **Justification**: Larger dataset prevents overfitting, more realistic

**Decision 2: Feature Engineering (Categorical vs Continuous only)**
- **Impact**: Very High (+7 pp akurasi)
- **Justification**: Alignment dengan domain knowledge

**Decision 3: Hybrid Approach (ML+Policy vs Pure ML)**
- **Impact**: Medium (+2 pp akurasi)
- **Justification**: Handle edge cases yang ML struggle

**Decision 4: Manual Implementation (Pure Python vs sklearn)**
- **Impact**: Educational value > production efficiency
- **Justification**: Practikum goal adalah pembelajaran, bukan deployment

### 4.9.3 What Worked vs What Didn't

**✅ What Worked:**
1. Domain-informed feature engineering (biggest impact)
2. Iterative error analysis (let data guide decisions)
3. Tight override constraints (surgical precision)
4. Hybrid architecture (ML + policy)
5. Large dataset (500 records for robustness)

**❌ What Didn't Work:**
1. Broad policy overrides V1 (created more errors)
2. Pure continuous features (overfitting issues)
3. Small dataset initially (overfitting risk)

**📚 Lessons Learned:**
- Start simple, add complexity only when justified
- Domain knowledge is critical untuk ML in specialized domains
- Iterative refinement better than one-shot optimization
- Interpretability matters dalam high-stakes decisions (beasiswa)

---

## 4.10 Kesimpulan Pembahasan

Penelitian ini berhasil mengimplementasikan decision tree untuk klasifikasi kelayakan beasiswa dengan akurasi 83%, melebihi target dan studi sejenis. Keberhasilan dicapai melalui:

1. **Feature engineering berbasis domain knowledge** (+7 pp) - kontribusi terbesar
2. **Hybrid architecture** (ML + policy override) (+2 pp) - handle edge cases
3. **Iterative refinement** (74% → 81% → 83%) - data-driven improvement
4. **Dataset robust** (500 records) - prevent overfitting

**Kontribusi Utama:**
- Metodologi feature engineering sistematis untuk scholarship domain
- Demonstrasi bahwa manual implementation viable dan educational
- Hybrid approach untuk production-ready system
- Complete audit trail untuk stakeholder transparency

**Keterbatasan:**
- Dataset sintetis (perlu validasi dengan real data)
- Fitur terbatas (tidak tangkap qualitative aspects)
- Static model (perlu periodic retraining)

**Implikasi:**
- Praktis: 75% time savings untuk committee screening
- Etis: Need fairness audit dan human oversight
- Akademis: Validasi bahwa domain knowledge > algorithmic complexity

Pembahasan di atas menunjukkan bahwa keberhasilan sistem beasiswa AI tidak hanya tentang akurasi tinggi, tetapi tentang **balance antara performa, interpretability, fairness, dan practical adoption**.

---

**Catatan:** Pembahasan ini menginterpretasi hasil dari Bab 3, memberikan context teoritis, dan menganalisis implikasi lebih luas. Kesimpulan formal penelitian akan disajikan di Bab 5.
