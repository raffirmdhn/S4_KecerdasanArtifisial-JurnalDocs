// Decision Tree Classification System
// Based on Enhanced Model V2 + Policy Override

// Categorization functions
function categorizeIPK(ipk) {
    if (ipk < 3.2) return 'Low';
    if (ipk < 3.8) return 'Mid';
    return 'High';
}

function categorizeTanggungan(tanggungan) {
    if (tanggungan <= 2) return 'Low';
    if (tanggungan <= 4) return 'Mid';
    return 'High';
}

function categorizePenghasilan(penghasilan) {
    if (penghasilan <= 3000000) return 'Low';
    if (penghasilan <= 7000000) return 'Mid';
    return 'High';
}

function categorizeSKS(sks) {
    if (sks < 60) return 'Low';
    if (sks < 65) return 'Mid';
    return 'High';
}

// Decision Tree Rules Implementation
function classifyBeasiswa(data) {
    const decisionPath = [];
    let prediction = 'Tidak Layak';
    let confidence = 0;
    let ruleUsed = '';

    // Categorize features
    const ipkKat = categorizeIPK(data.ipk);
    const tanggunganKat = categorizeTanggungan(data.tanggungan);
    const penghasilanKat = categorizePenghasilan(data.penghasilan);
    const sksKat = categorizeSKS(data.sks);

    decisionPath.push(`Penghasilan Kategori: ${penghasilanKat}`);

    // Root split: Penghasilan_Kategori
    if (penghasilanKat === 'Low') {
        decisionPath.push(`IPK Kategori: ${ipkKat}`);
        
        // Low Income Branch
        if (ipkKat === 'High') {
            // Rule 1: Low Income + High IPK
            prediction = 'Layak';
            confidence = 95;
            ruleUsed = 'Rule 1: Penghasilan Low + IPK High';
        } else if (ipkKat === 'Mid') {
            decisionPath.push(`Tanggungan Kategori: ${tanggunganKat}`);
            
            if (tanggunganKat === 'High') {
                // Rule 2: Low Income + Mid IPK + High Tanggungan
                prediction = 'Layak';
                confidence = 88;
                ruleUsed = 'Rule 2: Penghasilan Low + IPK Mid + Tanggungan High';
            } else if (tanggunganKat === 'Mid') {
                decisionPath.push(`Prestasi: ${data.prestasi}`);
                
                if (data.prestasi === 'Nasional') {
                    // Rule 3: National Achievement
                    prediction = 'Layak';
                    confidence = 92;
                    ruleUsed = 'Rule 3: Penghasilan Low + IPK Mid + Prestasi Nasional';
                } else if (data.organisasi === 'Pengurus') {
                    // Rule 4: Leadership role
                    prediction = 'Layak';
                    confidence = 82;
                    ruleUsed = 'Rule 4: Penghasilan Low + IPK Mid + Pengurus Organisasi';
                } else {
                    // Rule 5: No special achievements
                    prediction = 'Tidak Layak';
                    confidence = 73;
                    ruleUsed = 'Rule 5: Penghasilan Low + IPK Mid + Tidak ada prestasi khusus';
                }
            } else {
                // Rule 6: Low Tanggungan
                prediction = 'Tidak Layak';
                confidence = 78;
                ruleUsed = 'Rule 6: Penghasilan Low + IPK Mid + Tanggungan Low';
            }
        } else {
            // Low IPK
            if (data.prestasi === 'Nasional') {
                // Rule 7: National achievement compensates
                prediction = 'Layak';
                confidence = 85;
                ruleUsed = 'Rule 7: Penghasilan Low + Prestasi Nasional (kompensasi IPK)';
            } else {
                // Rule 8: Academic concern
                prediction = 'Tidak Layak';
                confidence = 68;
                ruleUsed = 'Rule 8: Penghasilan Low + IPK Low + Tidak ada prestasi khusus';
            }
        }
    } else if (penghasilanKat === 'Mid') {
        decisionPath.push(`IPK: ${data.ipk}`);
        
        // Mid Income Branch
        if (data.ipk > 3.45) {
            if (data.prestasi === 'Nasional') {
                // Rule 9: Exceptional merit
                prediction = 'Layak';
                confidence = 90;
                ruleUsed = 'Rule 9: Penghasilan Mid + IPK Tinggi + Prestasi Nasional';
            } else if (tanggunganKat === 'High' && data.organisasi === 'Pengurus') {
                // Rule 10: High burden + leadership
                prediction = 'Layak';
                confidence = 84;
                ruleUsed = 'Rule 10: Penghasilan Mid + IPK Tinggi + Tanggungan High + Pengurus';
            } else {
                // Rule 11: Comfortable condition
                prediction = 'Tidak Layak';
                confidence = 81;
                ruleUsed = 'Rule 11: Penghasilan Mid + IPK Tinggi + Kondisi cukup mampu';
            }
        } else if (data.ipk >= 3.20) {
            if (tanggunganKat === 'High') {
                // Rule 12: Large family burden
                prediction = 'Layak';
                confidence = 79;
                ruleUsed = 'Rule 12: Penghasilan Mid + IPK Mid + Tanggungan High';
            } else {
                // Rule 13: Standard condition
                prediction = 'Tidak Layak';
                confidence = 86;
                ruleUsed = 'Rule 13: Penghasilan Mid + IPK Mid + Tanggungan Low/Mid';
            }
        } else {
            // Rule 14: Below threshold
            prediction = 'Tidak Layak';
            confidence = 82;
            ruleUsed = 'Rule 14: Penghasilan Mid + IPK < 3.2';
        }
    } else {
        // High Income
        // Rule 15: High income = low priority
        prediction = 'Tidak Layak';
        confidence = 92;
        ruleUsed = 'Rule 15: Penghasilan High (>7 juta) - prioritas rendah';
    }

    // Policy Override Layer
    const override = applyPolicyOverride(data, ipkKat, tanggunganKat, penghasilanKat, prediction);
    if (override.applied) {
        prediction = override.prediction;
        confidence = override.confidence;
        ruleUsed = override.rule;
        decisionPath.push('⚠️ Policy Override Applied');
    }

    return {
        prediction,
        confidence,
        ruleUsed,
        decisionPath,
        categories: {
            ipk: ipkKat,
            tanggungan: tanggunganKat,
            penghasilan: penghasilanKat,
            sks: sksKat
        }
    };
}

// Policy Override Rules
function applyPolicyOverride(data, ipkKat, tanggunganKat, penghasilanKat, currentPrediction) {
    // Rule A: High-need exception
    if (data.ipk >= 3.3 && data.penghasilan <= 5000000) {
        if (data.tanggungan >= 6) {
            return {
                applied: true,
                prediction: 'Layak',
                confidence: 88,
                rule: 'Policy Override A: IPK ≥3.3 + Penghasilan ≤5jt + Tanggungan ≥6'
            };
        }
        if (data.prestasi === 'Nasional' && data.tanggungan >= 3 && data.organisasi === 'Pengurus') {
            return {
                applied: true,
                prediction: 'Layak',
                confidence: 90,
                rule: 'Policy Override A: Prestasi Nasional + Multiple positive factors'
            };
        }
    }

    // Rule B: High achiever + High need
    if (ipkKat === 'High' && tanggunganKat === 'High' && 
        data.penghasilan >= 5100000 && data.penghasilan <= 7000000) {
        return {
            applied: true,
            prediction: 'Layak',
            confidence: 85,
            rule: 'Policy Override B: IPK High + Tanggungan High + Penghasilan 5.1-7jt'
        };
    }

    return { applied: false };
}

// Format currency
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Form validation and submission
document.getElementById('beasiswaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    
    // Get form data
    const formData = {
        ipk: parseFloat(document.getElementById('ipk').value),
        sks: parseInt(document.getElementById('sks').value),
        penghasilan: parseInt(document.getElementById('penghasilan').value),
        tanggungan: parseInt(document.getElementById('tanggungan').value),
        prestasi: document.getElementById('prestasi').value,
        organisasi: document.getElementById('organisasi').value
    };
    
    // Validate
    let isValid = true;
    
    if (formData.ipk < 2.5 || formData.ipk > 4.0) {
        document.getElementById('ipk-error').textContent = 'IPK harus antara 2.50 - 4.00';
        isValid = false;
    }
    
    if (formData.sks < 54 || formData.sks > 72) {
        document.getElementById('sks-error').textContent = 'SKS harus antara 54 - 72';
        isValid = false;
    }
    
    if (formData.penghasilan < 1500000 || formData.penghasilan > 8000000) {
        document.getElementById('penghasilan-error').textContent = 'Penghasilan harus antara Rp 1.500.000 - Rp 8.000.000';
        isValid = false;
    }
    
    if (formData.tanggungan < 1 || formData.tanggungan > 6) {
        document.getElementById('tanggungan-error').textContent = 'Tanggungan harus antara 1 - 6 orang';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Classify
    const result = classifyBeasiswa(formData);
    
    // Display result
    displayResult(formData, result);
});

// Display classification result
function displayResult(data, result) {
    const resultBox = document.getElementById('result');
    const resultContent = document.getElementById('result-content');
    
    const statusClass = result.prediction === 'Layak' ? 'status-layak' : 'status-tidak-layak';
    const statusIcon = result.prediction === 'Layak' ? '✅' : '❌';
    
    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div class="status-badge ${statusClass}">
                ${statusIcon} ${result.prediction}
            </div>
        </div>
        
        <div class="confidence">
            <h4>Tingkat Keyakinan (Confidence)</h4>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${result.confidence}%">
                    ${result.confidence}%
                </div>
            </div>
        </div>
        
        <div class="detail-item">
            <span class="detail-label">IPK:</span>
            <span class="detail-value">${data.ipk} (${result.categories.ipk})</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">SKS Lulus:</span>
            <span class="detail-value">${data.sks} SKS (${result.categories.sks})</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Penghasilan Orang Tua:</span>
            <span class="detail-value">${formatRupiah(data.penghasilan)} (${result.categories.penghasilan})</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Tanggungan Keluarga:</span>
            <span class="detail-value">${data.tanggungan} orang (${result.categories.tanggungan})</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Prestasi Akademik:</span>
            <span class="detail-value">${data.prestasi}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Keaktifan Organisasi:</span>
            <span class="detail-value">${data.organisasi}</span>
        </div>
        
        <div class="decision-path">
            <h4>🌳 Decision Path (Jalur Keputusan)</h4>
            <ul>
                ${result.decisionPath.map(path => `<li>${path}</li>`).join('')}
            </ul>
            <p style="margin-top: 15px; color: #667eea; font-weight: 600;">
                ${result.ruleUsed}
            </p>
        </div>
    `;
    
    resultContent.innerHTML = html;
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset form
document.getElementById('beasiswaForm').addEventListener('reset', function() {
    document.getElementById('result').style.display = 'none';
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
});