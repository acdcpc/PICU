import React, { useState } from 'react';

export default function PRISMCalc() {
  const [inputs, setInputs] = useState({
    ageMo: '', postOpCardiac: 'no', sbp: '', hr: '', temp: '',
    gcs: '', pupils: '0', ph: '', tco2: '', pao2: '', paco2: '',
    glucose: '', potassium: '', creatinine: '', bun: '', wbc: '',
    platelets: '', pt: '', ptt: '',
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    const ageMo = parseFloat(inputs.ageMo) || 0;
    const ageYr = ageMo / 12;
    const sbp = parseFloat(inputs.sbp) || 0;
    const hr = parseFloat(inputs.hr) || 0;
    const temp = parseFloat(inputs.temp) || 37;
    const gcs = parseInt(inputs.gcs) || 15;
    const pupils = parseInt(inputs.pupils) || 0;
    const ph = parseFloat(inputs.ph) || 7.4;
    const tco2 = parseFloat(inputs.tco2) || 25;
    const pao2 = parseFloat(inputs.pao2) || 100;
    const paco2 = parseFloat(inputs.paco2) || 40;
    const glucose = parseFloat(inputs.glucose) || 100;
    const potassium = parseFloat(inputs.potassium) || 4;
    const creatinine = parseFloat(inputs.creatinine) || 0.5;
    const bun = parseFloat(inputs.bun) || 15;
    const wbc = parseFloat(inputs.wbc) || 10;
    const platelets = parseFloat(inputs.platelets) || 200;
    const pt = parseFloat(inputs.pt) || 12;
    const ptt = parseFloat(inputs.ptt) || 30;

    let score = 0;
    const breakdown = [];

    // SBP thresholds by age
    let sbpLow, sbpVlow;
    if (ageYr < 1) { sbpLow = 55; sbpVlow = 45; }
    else if (ageYr < 12) { sbpLow = 65; sbpVlow = 55; }
    else { sbpLow = 75; sbpVlow = 65; }
    if (sbp > 0 && sbp <= sbpVlow) { score += 7; breakdown.push({ label: `SBP ≤ ${sbpVlow} (very low)`, pts: 7 }); }
    else if (sbp > 0 && sbp <= sbpLow) { score += 3; breakdown.push({ label: `SBP ≤ ${sbpLow} (low)`, pts: 3 }); }

    // HR high
    if (ageYr < 1 && hr > 195) { score += 4; breakdown.push({ label: 'HR > 195', pts: 4 }); }
    else if (ageYr < 12 && hr > 150) { score += 4; breakdown.push({ label: 'HR > 150', pts: 4 }); }
    else if (ageYr >= 12 && hr > 150) { score += 4; breakdown.push({ label: 'HR > 150', pts: 4 }); }

    // Pupils
    if (pupils === 11) { score += 11; breakdown.push({ label: 'Pupils unequal / one fixed', pts: 11 }); }
    else if (pupils === 7) { score += 7; breakdown.push({ label: 'Pupils both fixed', pts: 7 }); }

    // GCS
    if (gcs <= 8) { score += 6; breakdown.push({ label: 'GCS ≤ 8', pts: 6 }); }

    // pH
    if (ph < 7.0) { score += 6; breakdown.push({ label: 'pH < 7.0', pts: 6 }); }
    else if (ph < 7.3 && ph >= 7.0) { score += 2; breakdown.push({ label: 'pH 7.0-7.28', pts: 2 }); }

    // TCO2
    if (tco2 > 34) { score += 4; breakdown.push({ label: 'TCO₂ > 34', pts: 4 }); }

    // PaO2
    if (pao2 < 42) { score += 6; breakdown.push({ label: 'PaO₂ < 42', pts: 6 }); }
    else if (pao2 < 50) { score += 3; breakdown.push({ label: 'PaO₂ 42-49', pts: 3 }); }

    // PCO2
    if (paco2 > 90) { score += 1; breakdown.push({ label: 'PCO₂ > 90', pts: 1 }); }

    // Glucose
    if (glucose < 40 || glucose > 400) { score += 6; breakdown.push({ label: 'Glucose <40 or >400', pts: 6 }); }
    else if (glucose >= 200) { score += 2; breakdown.push({ label: 'Glucose 200-400', pts: 2 }); }

    // K
    if (potassium > 6.9) { score += 3; breakdown.push({ label: 'K > 6.9', pts: 3 }); }

    // Creatinine
    let crElev, crMarked;
    if (ageYr < 1) { crElev = 0.45; crMarked = 0.8; }
    else if (ageYr < 12) { crElev = 0.65; crMarked = 1.2; }
    else { crElev = 0.85; crMarked = 1.5; }
    if (creatinine > crMarked) { score += 6; breakdown.push({ label: `Creatinine > ${crMarked} (markedly elevated)`, pts: 6 }); }
    else if (creatinine > crElev) { score += 2; breakdown.push({ label: `Creatinine > ${crElev} (elevated)`, pts: 2 }); }

    // BUN
    let bunElev;
    if (ageYr < 1) bunElev = 17;
    else if (ageYr < 12) bunElev = 19;
    else bunElev = 23;
    if (bun > bunElev) { score += 3; breakdown.push({ label: `BUN > ${bunElev}`, pts: 3 }); }

    // WBC
    if (wbc < 3) { score += 4; breakdown.push({ label: 'WBC < 3', pts: 4 }); }

    // Platelets
    if (platelets < 100) { score += 4; breakdown.push({ label: 'Platelets < 100', pts: 4 }); }
    else if (platelets < 200) { score += 2; breakdown.push({ label: 'Platelets 100-200', pts: 2 }); }

    // PT/PTT
    if (pt > 22 || ptt > 57) { score += 3; breakdown.push({ label: 'PT > 22 or PTT > 57', pts: 3 }); }

    // Post-op cardiac
    if (inputs.postOpCardiac === 'yes') { score += 3; breakdown.push({ label: 'Post-op cardiac', pts: 3 }); }

    // Temperature
    if (temp > 38.6 || temp < 35.6) { score += 3; breakdown.push({ label: 'Temp <35.6 or >38.6', pts: 3 }); }

    const logit = -5.776 + 0.415 * score;
    const mortality = Math.round(100 / (1 + Math.exp(-logit)) * 10) / 10;

    let riskLabel = 'Low Risk';
    let riskClass = 'badge bg-green';
    if (mortality >= 5) { riskLabel = 'Moderate Risk'; riskClass = 'badge bg-amber'; }
    if (mortality >= 20) { riskLabel = 'High Risk'; riskClass = 'badge bg-red'; }
    if (mortality >= 50) { riskLabel = 'Very High Risk'; riskClass = 'badge bg-red'; }

    setResult({ score, mortality, riskLabel, riskClass, breakdown });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>PRISM-IV Score</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age (months)</label>
            <input className="form-input" type="number" step="0.1" name="ageMo" value={inputs.ageMo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Post-op Cardiac</label>
            <select className="form-select" name="postOpCardiac" value={inputs.postOpCardiac} onChange={handleChange}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">SBP (mmHg)</label>
            <input className="form-input" type="number" name="sbp" value={inputs.sbp} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">HR (bpm)</label>
            <input className="form-input" type="number" name="hr" value={inputs.hr} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Temperature (°C)</label>
            <input className="form-input" type="number" step="0.1" name="temp" value={inputs.temp} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">GCS</label>
            <input className="form-input" type="number" min="3" max="15" name="gcs" value={inputs.gcs} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Pupils</label>
            <select className="form-select" name="pupils" value={inputs.pupils} onChange={handleChange}>
              <option value="0">Both reactive</option>
              <option value="7">Both fixed</option>
              <option value="11">Unequal / one fixed</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">pH</label>
            <input className="form-input" type="number" step="0.01" name="ph" value={inputs.ph} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Total CO₂ (mmol/L)</label>
            <input className="form-input" type="number" step="0.1" name="tco2" value={inputs.tco2} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">PaO₂ (mmHg)</label>
            <input className="form-input" type="number" name="pao2" value={inputs.pao2} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">PCO₂ (mmHg)</label>
            <input className="form-input" type="number" name="paco2" value={inputs.paco2} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Glucose (mg/dL)</label>
            <input className="form-input" type="number" name="glucose" value={inputs.glucose} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Potassium (mEq/L)</label>
            <input className="form-input" type="number" step="0.1" name="potassium" value={inputs.potassium} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Creatinine (mg/dL)</label>
            <input className="form-input" type="number" step="0.01" name="creatinine" value={inputs.creatinine} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">BUN (mg/dL)</label>
            <input className="form-input" type="number" name="bun" value={inputs.bun} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">WBC (×10³/µL)</label>
            <input className="form-input" type="number" step="0.1" name="wbc" value={inputs.wbc} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Platelets (×10³/µL)</label>
            <input className="form-input" type="number" name="platelets" value={inputs.platelets} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">PT (sec)</label>
            <input className="form-input" type="number" step="0.1" name="pt" value={inputs.pt} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">PTT (sec)</label>
            <input className="form-input" type="number" step="0.1" name="ptt" value={inputs.ptt} onChange={handleChange} />
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>Results</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow">
                  <span className="rlbl">PRISM-IV Score</span>
                  <span className="rval"><span className="big-num">{result.score}</span></span>
                </div>
                <div className="rrow">
                  <span className="rlbl">Mortality Risk</span>
                  <span className="rval"><span className={result.riskClass}>{result.mortality}%</span></span>
                </div>
                <div className="rrow">
                  <span className="rlbl">Risk Level</span>
                  <span className="rval"><span className={result.riskClass}>{result.riskLabel}</span></span>
                </div>
              </div>
              <h5 className="mt-3">Score Breakdown</h5>
              <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                {result.breakdown.map((b, i) => (
                  <span key={i} className="badge bg-navy">{b.label}: +{b.pts}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
