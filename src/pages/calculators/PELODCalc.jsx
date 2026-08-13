import React, { useState } from 'react';

export default function PELODCalc() {
  const [inputs, setInputs] = useState({
    age: '', gcs: '', pupils: '1', pf: '', paco2: '', lactate: '',
    map: '', creatinine: '', platelets: '', wbc: '',
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    const age = parseFloat(inputs.age) || 0;
    const gcs = parseInt(inputs.gcs) || 15;
    const pupils = parseInt(inputs.pupils) || 1;
    const pf = parseFloat(inputs.pf) || 400;
    const paco2 = parseFloat(inputs.paco2) || 40;
    const lactate = parseFloat(inputs.lactate) || 1;
    const map = parseFloat(inputs.map) || 70;
    const creatinine = parseFloat(inputs.creatinine) || 0.5;
    const platelets = parseFloat(inputs.platelets) || 200;
    const wbc = parseFloat(inputs.wbc) || 10;

    let score = 0;
    const breakdown = [];

    if (pupils === 0) { score += 4; breakdown.push({ label: 'Pupils fixed', pts: 4 }); }
    if (gcs <= 5) { score += 4; breakdown.push({ label: 'GCS ≤ 5', pts: 4 }); }
    else if (gcs <= 10) { score += 1; breakdown.push({ label: 'GCS 6-10', pts: 1 }); }

    let mapLow;
    if (age < 1) mapLow = 46;
    else if (age < 12) mapLow = 58;
    else mapLow = 65;
    if (map < mapLow) { score += 4; breakdown.push({ label: `MAP < ${mapLow}`, pts: 4 }); }

    if (pf < 100) { score += 3; breakdown.push({ label: 'P/F < 100', pts: 3 }); }
    else if (pf < 200) { score += 2; breakdown.push({ label: 'P/F 100-200', pts: 2 }); }

    if (paco2 > 58) { score += 2; breakdown.push({ label: 'PaCO₂ > 58', pts: 2 }); }

    let crLow;
    if (age < 1) crLow = 0.62;
    else if (age < 7) crLow = 0.85;
    else crLow = 1.13;
    if (creatinine > crLow) { score += 2; breakdown.push({ label: `Creatinine > ${crLow}`, pts: 2 }); }

    if (wbc < 2) { score += 2; breakdown.push({ label: 'WBC < 2', pts: 2 }); }
    if (platelets < 50) { score += 2; breakdown.push({ label: 'Platelets < 50', pts: 2 }); }
    else if (platelets < 100) { score += 1; breakdown.push({ label: 'Platelets 50-100', pts: 1 }); }

    if (lactate >= 11) { score += 4; breakdown.push({ label: 'Lactate ≥ 11', pts: 4 }); }
    else if (lactate >= 5) { score += 3; breakdown.push({ label: 'Lactate 5-11', pts: 3 }); }
    else if (lactate >= 2) { score += 1; breakdown.push({ label: 'Lactate 2-5', pts: 1 }); }

    let mortality;
    if (score <= 1) mortality = 1.1;
    else if (score <= 5) mortality = 5;
    else if (score <= 10) mortality = 12;
    else if (score <= 15) mortality = 27;
    else if (score <= 20) mortality = 50;
    else mortality = 75;

    let riskClass = 'badge bg-green';
    if (mortality >= 10) riskClass = 'badge bg-amber';
    if (mortality >= 30) riskClass = 'badge bg-red';

    setResult({ score, mortality, riskClass, breakdown });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>PELOD-2 Score</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age (years)</label>
            <input className="form-input" type="number" step="0.01" name="age" value={inputs.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">GCS</label>
            <input className="form-input" type="number" min="3" max="15" name="gcs" value={inputs.gcs} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Pupils</label>
            <select className="form-select" name="pupils" value={inputs.pupils} onChange={handleChange}>
              <option value="1">Reactive</option>
              <option value="0">Fixed</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">P/F Ratio</label>
            <input className="form-input" type="number" name="pf" value={inputs.pf} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">PaCO₂ (mmHg)</label>
            <input className="form-input" type="number" name="paco2" value={inputs.paco2} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Lactate (mmol/L)</label>
            <input className="form-input" type="number" step="0.1" name="lactate" value={inputs.lactate} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MAP (mmHg)</label>
            <input className="form-input" type="number" name="map" value={inputs.map} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Creatinine (mg/dL)</label>
            <input className="form-input" type="number" step="0.01" name="creatinine" value={inputs.creatinine} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Platelets (×10³/µL)</label>
            <input className="form-input" type="number" name="platelets" value={inputs.platelets} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">WBC (×10³/µL)</label>
            <input className="form-input" type="number" step="0.1" name="wbc" value={inputs.wbc} onChange={handleChange} />
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>Results</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow"><span className="rlbl">PELOD-2 Score</span><span className="rval"><span className="big-num">{result.score}</span></span></div>
                <div className="rrow"><span className="rlbl">Estimated Mortality</span><span className="rval"><span className={result.riskClass}>{result.mortality}%</span></span></div>
              </div>
              <h5 className="mt-3">Score Breakdown</h5>
              <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                {result.breakdown.map((b, i) => (
                  <span key={i} className="badge bg-blue">{b.label}: +{b.pts}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
