# BAB 6  
# SARAN

## 6.1 Saran untuk Implementasi di Universitas

### 6.1.1 Saran Teknis

**1. Pilot Testing Sebelum Deployment Penuh**

Sebelum mengimplementasikan sistem secara menyeluruh, disarankan untuk:
- Melakukan uji coba di 1-2 fakultas terlebih dahulu (1 semester)
- Membandingkan rekomendasi AI dengan keputusan komite manual
- Mengukur tingkat agreement, time savings, dan kepuasan stakeholder
- Mengidentifikasi edge cases spesifik institusi yang belum tertangani model

**Expected outcome**: Validasi performa model pada data riil dan identifikasi area improvement sebelum scaling.

**2. Integrasi dengan Student Information System (SIS)**

Model akan lebih efektif jika terintegrasi dengan sistem existing:
- Auto-populate data akademik (IPK, SKS) dari SIS
- Real-time update ketika data mahasiswa berubah
- Dashboard untuk komite beasiswa dengan fitur review dan override
- Automated notification untuk mahasiswa (status aplikasi + feedback)

**Benefit**: Mengurangi manual data entry, meningkatkan accuracy, dan mempercepat proses.

**3. Establish Clear Role Separation**

Definisikan secara jelas:
- **AI role**: Pre-screening dan ranking aplikasi (mengidentifikasi top 100-150 dari 500 aplikasi)
- **Human role**: Final decision untuk shortlisted candidates, review edge cases
- **Override authority**: Siapa yang bisa override AI recommendation dan prosesnya

**Importance**: Avoid confusion dan ensure accountability dalam decision making.

### 6.1.2 Saran Operasional

**4. Training untuk Stakeholder**

Sebelum deployment, lakukan training untuk:
- **Komite beasiswa**: Cara membaca AI output, interpretasi confidence scores, kapan override
- **Staff administrasi**: Cara menjalankan sistem, troubleshooting basic issues
- **Mahasiswa**: Transparansi kriteria seleksi, cara membaca feedback AI

**Duration**: 2-4 jam workshop dengan hands-on practice.

**5. Dokumentasi dan SOP**

Buat standard operating procedure untuk:
- Cara menjalankan model setiap semester (reproducibility checklist)
- Prosedur handling low-confidence cases (<70%)
- Prosedur appeal untuk mahasiswa yang merasa salah classified
- Maintenance schedule (retraining, threshold update)

**6. Monitoring dan Evaluation**

Establish KPI untuk monitoring performance:
- Agreement rate antara AI dan komite (target: >85%)
- Time savings (target: 60-75% reduction)
- False negative rate (target: <10%)
- Complaint rate dari mahasiswa (track trend)

**Review cycle**: Quarterly review untuk 1 tahun pertama, kemudian bi-annually.

### 6.1.3 Saran Etis dan Fairness

**7. Regular Fairness Audit**

Lakukan fairness audit setiap semester:
- Compare approval rate across demographics (gender, program studi, asal daerah)
- Detect systematic bias (contoh: apakah mahasiswa dari daerah tertentu consistently disadvantaged?)
- Statistical tests: Chi-square test untuk independence, disparate impact ratio

**Threshold**: Jika disparate impact ratio <0.8 atau >1.25, investigate lebih lanjut.

**8. Human-in-the-Loop untuk High-Stakes Cases**

Mandatory human review untuk:
- Semua cases dengan confidence <70% (8 cases dalam testing kami)
- Mahasiswa dengan exceptional circumstances (family emergency, medical issues)
- Appeals dari mahasiswa yang rejected oleh AI

**Philosophy**: AI untuk efficiency, human untuk empathy dan context understanding.

**9. Transparency dan Communication**

- Publish kriteria seleksi beasiswa secara terbuka
- Berikan specific feedback untuk rejected applications (contoh: "IPK Anda saat ini 3.15, threshold untuk kategori Mid adalah 3.2")
- Jelaskan bahwa AI adalah tool bantu, final decision tetap di komite
- Sediakan channel untuk questions dan concerns (email, help desk)

---

## 6.2 Saran untuk Penelitian Lanjutan

### 6.2.1 Short-term Research (6-12 bulan)

**1. Validasi dengan Data Riil**

Prioritas tertinggi untuk penelitian lanjutan:
- Collect historical scholarship data (3-5 tahun terakhir) dari 1-2 universitas
- Compare distribusi data riil vs sintetis (validate assumptions)
- Retrain model dengan real data dan measure performance difference
- Identify features yang important di real data vs synthetic data

**Expected contribution**: Validate external validity dari findings penelitian ini.

**2. Comparative Study dengan Algoritma Lain**

Bandingkan decision tree dengan algoritma alternatif:
- Logistic Regression (baseline linear model)
- Random Forest (ensemble, potentially higher accuracy)
- Gradient Boosting (XGBoost, state-of-the-art)
- Neural Network (deep learning approach)

**Metrics**: Accuracy, interpretability score, training time, inference time.

**Expected finding**: Trade-off curve antara accuracy dan interpretability.

**3. Feature Importance Analysis Mendalam**

Explore:
- SHAP values untuk quantify feature contribution
- Partial dependence plots untuk understand feature interactions
- Sensitivity analysis (bagaimana perubahan threshold affect predictions)

**Contribution**: Deeper understanding of what drives scholarship eligibility.

### 6.2.2 Medium-term Research (1-2 tahun)

**4. Temporal Analysis (Multi-Semester Prediction)**

Extend model untuk predict:
- Trajectory akademik (apakah mahasiswa akan maintain IPK?)
- Long-term success (graduation rate, time-to-degree)
- Beasiswa sustainability (apakah recipient tetap eligible di semester berikutnya?)

**Methods**: Time series features, LSTM untuk sequential prediction, survival analysis.

**5. Multi-Objective Optimization**

Current model optimize untuk accuracy. Explore multi-objective:
- Objective 1: Maximize recall (catch eligible students)
- Objective 2: Maximize fairness (equal opportunity across demographics)
- Objective 3: Minimize cost (budget constraint untuk total scholarships)

**Methods**: Pareto optimization, constraint optimization, fairness-aware ML.

**6. Explainable AI (XAI) Enhancement**

Beyond decision rules, develop:
- Counterfactual explanations ("Jika IPK Anda 3.3 instead of 3.1, Anda akan eligible")
- Interactive what-if tool untuk mahasiswa (simulate scenarios)
- Visual dashboard untuk komite (tree visualization, confidence heatmaps)

**Contribution**: Increase transparency dan empower students untuk improve.

### 6.2.3 Long-term Research (2-5 tahun)

**7. Federated Learning untuk Multi-University**

Develop framework untuk:
- Training model on data dari multiple universities tanpa sharing raw data
- Learn common patterns while respecting privacy
- Handle heterogeneity (different policies, different student populations)

**Challenge**: Privacy preservation, communication efficiency, fairness across institutions.

**8. Causal Inference untuk Policy Design**

Shift dari prediction ke causal questions:
- Apakah beasiswa causally improve graduation rate? (treatment effect)
- What is optimal beasiswa amount untuk maximize ROI?
- Which intervention most effective untuk struggling students?

**Methods**: Propensity score matching, instrumental variables, difference-in-differences.

**9. Adaptive System dengan Continuous Learning**

Design system yang:
- Learn dari komite decisions over time (feedback loop)
- Automatically adjust thresholds based on economic indicators (inflation, UMR)
- A/B testing untuk model improvements
- Detect distribution shift (concept drift) dan trigger retraining

**Contribution**: Self-improving system yang minimize maintenance burden.

---

## 6.3 Saran untuk Maintenance Model

### 6.3.1 Periodic Retraining

**Frequency**: Minimal 1x per tahun, ideally setiap semester.

**Procedure**:
1. Collect data dari semester sebelumnya (aplikasi + final decisions)
2. Merge dengan historical data (maintain 3-5 tahun rolling window)
3. Split baru 80/20 untuk train/test
4. Retrain model dengan hyperparameters yang sama
5. Validate performance pada test set (ensure tidak degradation)
6. A/B test dengan model lama sebelum full deployment

**Trigger retraining jika**:
- Accuracy drop >5% dari baseline
- Complaint rate increase significantly
- Major policy change (contoh: IPK minimum requirement berubah)

### 6.3.2 Threshold Update

**Economic indicators** (update annually):
- Penghasilan threshold: Adjust berdasarkan inflasi dan UMR
- Contoh: Jika inflasi 5%, threshold 3 juta → 3.15 juta

**Academic standards** (review every 2 years):
- IPK threshold: Adjust berdasarkan average IPK kampus
- Contoh: Jika rata-rata IPK naik dari 3.2 ke 3.3, consider raise threshold

**Process**: Committee meeting untuk review thresholds, justify changes, update code.

### 6.3.3 Documentation Maintenance

**Keep updated**:
- Dataset documentation (distribution changes over time)
- Model card (performance metrics, known limitations, intended use)
- Decision log (why changes were made, rationale)
- Incident log (kasus edge yang gagal di-handle, how resolved)

**Tool**: Version control (Git) untuk track changes, documentation as code.

## 6.4 Saran untuk Pengembangan Model

### 6.4.1 Peningkatan Fitur

**1. Tambahkan Fitur Temporal**

Saat ini model menggunakan snapshot semester 3. Pertimbangkan menambahkan:
- **Trajectory IPK**: Slope dari semester 1 → 2 → 3 (apakah improving atau declining?)
- **SKS velocity**: Rata-rata SKS per semester (apakah consistent atau fluktuatif?)
- **Prestasi trend**: Apakah prestasi akademik meningkat seiring waktu?

**Expected impact**: +2-3 pp accuracy dengan menangkap momentum mahasiswa.

**2. Tambahkan Fitur Kontekstual**

Fitur tambahan yang dapat dipertimbangkan:
- **Program studi**: STEM vs Non-STEM (difficulty adjustment)
- **Asal daerah**: Urban vs rural (opportunity gap consideration)
- **Jarak rumah-kampus**: Commuting cost sebagai hidden expense
- **Saudara kuliah**: Apakah ada saudara yang juga sedang kuliah (double burden)

**Caveat**: Setiap fitur tambahan harus justified dengan domain knowledge dan tested untuk bias.

**3. Fitur Komposit (Scoring)**

Pertimbangkan membuat composite scores:
- **Need Score**: Weighted combination dari penghasilan + tanggungan + jarak
- **Merit Score**: Weighted combination dari IPK + prestasi + keaktifan
- **Overall Score**: Need Score × weight_need + Merit Score × weight_merit

**Benefit**: Lebih robust untuk borderline cases dengan multiple moderate factors.

### 6.4.2 Optimasi Hyperparameter

Meskipun feature engineering lebih impactful, hyperparameter tuning dapat memberikan marginal gains:

**Current settings**:
- MAX_DEPTH = 4
- MIN_SAMPLES_LEAF = 10
- MIN_ENTROPY = 0.3
- MIN_IG = 0.01

**Suggested exploration**:
- MAX_DEPTH: Try 5 (sedikit lebih deep, tapi risk overfit)
- MIN_SAMPLES_LEAF: Try 8 atau 12 (trade-off granularity vs generalization)
- Try cost-sensitive learning (assign higher cost untuk FN vs FP)

**Method**: Grid search dengan cross-validation (5-fold CV).

**Expected gain**: +0.5-1.5 pp accuracy (diminishing returns).

### 6.4.3 Ensemble Approach

Untuk meningkatkan robustness:

**Random Forest** (ensemble dari multiple trees):
- Train 100-500 trees dengan random subsets dari data dan features
- Prediction via majority voting
- Expected accuracy: 85-88% (vs 83% single tree)
- Trade-off: Less interpretable (100+ trees vs 15 rules)

**Boosting** (sequential trees yang correct previous errors):
- AdaBoost atau Gradient Boosting
- Expected accuracy: 86-90%
- Trade-off: More complex, harder to explain

**Recommendation**: Jika target accuracy >85% diperlukan, consider ensemble. Jika interpretability prioritas, stick dengan single tree.

---

## 6.5 Saran Khusus untuk Stakeholder

### 6.5.1 Untuk Komite Beasiswa

**1. Tetap Exercise Human Judgment**

AI adalah tool bantu, bukan replacement:
- Review semua cases dengan confidence <70% (flagged cases)
- Consider context yang tidak captured model (family emergencies, health issues)
- Trust intuition jika ada red flags yang tidak detected oleh model

**2. Document Override Decisions**

Setiap kali override AI recommendation:
- Catat alasan override (untuk future model improvement)
- Track success rate dari override (apakah override umumnya correct?)
- Share feedback dengan technical team untuk model refinement

**3. Establish Appeal Process**

Design fair process untuk mahasiswa yang rejected:
- Submit appeal dengan supporting documents
- Committee review untuk exceptional circumstances
- Response time <2 minggu

### 6.5.2 Untuk Mahasiswa

**1. Fokus pada Faktor yang Controllable**

Dari model, faktor yang paling impactful dan controllable:
- **IPK**: Maintain minimal 3.2, target 3.5+ (kategori Mid-High)
- **Prestasi akademik**: Pursue kompetisi (regional/nasional level)
- **Keaktifan organisasi**: Active participation, target posisi pengurus

**2. Dokumentasi yang Akurat**

Pastikan data yang disubmit accurate:
- Penghasilan orang tua: Jujur (akan diverifikasi)
- Tanggungan keluarga: Include semua dependent (adik, kakak, nenek/kakek)
- Prestasi: Include sertifikat dan bukti

**3. Prepare Justification untuk Borderline Cases**

Jika Anda borderline (contoh: IPK 3.15, penghasilan 5.5 juta):
- Prepare essay yang strong untuk explain circumstances
- Highlight faktor yang tidak captured model (contoh: orang tua sakit, biaya commuting tinggi)
- Request human review jika merasa AI miss important context

### 6.5.3 Untuk Administrasi dan IT

**1. Data Quality Assurance**

Ensure data integrity:
- Validate input ranges (contoh: IPK harus 0-4.0, tidak boleh 4.5)
- Check for missing values (handle or impute properly)
- Detect anomalies (contoh: SKS 100+ tidak mungkin untuk semester 3)

**2. System Monitoring**

Setup monitoring untuk:
- System uptime (availability >99%)
- Prediction latency (<1 detik per prediction)
- Error logs (track crashes atau exceptions)

**3. Backup dan Recovery**

- Daily backup untuk database aplikasi
- Version control untuk model files
- Disaster recovery plan (jika system down selama periode aplikasi)

---

## 6.6 Penutup

### 6.6.1 Ringkasan Saran Prioritas

**Top 5 Recommendations (Immediate Action)**:

1. **Pilot testing dengan data riil** - Validate model performance sebelum full deployment
2. **Establish human-in-the-loop process** - Clear role separation dan override procedures
3. **Conduct fairness audit** - Ensure no systematic bias across demographics
4. **Training untuk stakeholder** - Komite, staff, dan mahasiswa perlu understand sistem
5. **Setup monitoring dan feedback loop** - Track performance dan collect data untuk improvement

**Top 3 Research Directions** (Academic Contribution):

1. **Temporal analysis** - Multi-semester prediction untuk trajectory assessment
2. **Causal inference** - Move from prediction ke understanding impact beasiswa
3. **Federated learning** - Scale ke multiple universities dengan privacy preservation

### 6.6.2 Refleksi Akhir

Implementasi AI dalam sistem beasiswa adalah **partnership antara technology dan humanity**. Model decision tree yang dikembangkan dalam penelitian ini mencapai 83% akurasi dan dapat significantly meningkatkan efisiensi proses seleksi. Namun, keberhasilan implementasi tidak hanya bergantung pada accuracy metrics, tetapi pada:

- **Trust**: Stakeholder percaya bahwa sistem fair dan transparent
- **Accountability**: Clear ownership ketika errors occur
- **Adaptability**: System dapat evolve seiring policy changes dan feedback
- **Ethics**: Fairness dan equity prioritas utama, bukan hanya efficiency

Dengan mengikuti saran-saran di atas, universitas dapat memanfaatkan AI untuk:
- Reduce administrative burden (75% time savings)
- Improve consistency dan fairness
- Provide better transparency untuk mahasiswa
- Scale scholarship program tanpa proportional increase dalam resources

Namun, always remember: **AI augments human judgment, tidak menggantikannya**. Dalam high-stakes decisions seperti beasiswa yang dapat significantly impact student welfare, human empathy, wisdom, dan context understanding tetap irreplaceable.

### 6.6.3 Kata Penutup

Penelitian ini mendemonstrasikan bahwa decision tree implementation dari scratch bukan hanya feasible tetapi juga effective untuk scholarship classification. Dengan akurasi 83%, recall 81%, dan high interpretability (15 clear rules), model ini ready untuk pilot deployment.

**Next steps yang disarankan**:

1. **Jangka pendek** (0-6 bulan): Pilot testing, real data collection, fairness audit
2. **Jangka menengah** (6-12 bulan): System integration, model enhancement, SOP establishment
3. **Jangka panjang** (1-2 tahun): Multi-university scaling, advanced analytics, continuous learning

Dengan implementasi yang thoughtful dan monitoring yang consistent, sistem AI-assisted scholarship dapat menjadi valuable tool untuk democratize access to education dan ensure bahwa beasiswa sampai kepada mahasiswa yang benar-benar membutuhkan dan deserve.

---

**AKHIR BAB 6 - SARAN**

Semua bab akademik (BAB 3-6) telah lengkap. Untuk quick reference, akan dibuat **summary_metrics.md** sebagai ringkasan satu halaman.