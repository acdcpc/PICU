import React, { useState } from 'react';

export default function PALSCalc() {
  const [inputs, setInputs] = useState({ weight: '', age: '' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const estimateWeight = (age) => {
    if (age < 1) return Math.round((age * 3.5 + 3.5) * 10) / 10;
    if (age < 5) return Math.round((age * 2 + 11) * 10) / 10;
    if (age < 12) return Math.round((age * 2.5 + 5) * 10) / 10;
    return Math.round((age * 3 + 5) * 10) / 10;
  };

  const getETT = (age) => {
    if (age < 0.5) return { uncuffed: '3.0-3.5', cuffed: '3.0' };
    if (age < 1) return { uncuffed: '3.5-4.0', cuffed: '3.5' };
    if (age < 2) return { uncuffed: '4.0-4.5', cuffed: '4.0' };
    if (age < 4) return { uncuffed: '4.5-5.0', cuffed: '4.5' };
    if (age < 6) return { uncuffed: '5.0-5.5', cuffed: '5.0' };
    if (age < 8) return { uncuffed: '5.5-6.0', cuffed: '5.5' };
    if (age < 10) return { uncuffed: '6.0-6.5', cuffed: '6.0' };
    if (age < 12) return { uncuffed: '6.5-7.0', cuffed: '6.5' };
    return { uncuffed: '7.0-7.5', cuffed: '7.0' };
  };

  const calculate = () => {
    let weight = parseFloat(inputs.weight) || 0;
    const age = parseFloat(inputs.age) || 0;
    if (!weight && age > 0) weight = estimateWeight(age);
    if (!weight) return;

    const drugs = [
      { name: 'Adrenaline (1:10,000)', calc: Math.round(0.01 * weight * 100) / 100, unit: 'mg', max: '1 mg', note: '0.01 mg/kg IV/IO' },
      { name: 'Atropine', calc: Math.max(0.1, Math.min(0.5, Math.round(0.02 * weight * 100) / 100)), unit: 'mg', max: '0.5 mg', note: '0.02 mg/kg (min 0.1)' },
      { name: 'Adenosine', calc: Math.min(6, Math.round(0.1 * weight * 10) / 10), unit: 'mg', max: '6 mg (1st dose)', note: '0.1 mg/kg rapid IV' },
      { name: 'Amiodarone', calc: Math.min(300, Math.round(5 * weight)), unit: 'mg', max: '300 mg', note: '5 mg/kg IV over 20-60 min' },
      { name: 'NaHCO₃', calc: Math.round(1 * weight), unit: 'mEq', max: '—', note: '1 mEq/kg IV' },
      { name: 'Calcium Gluconate 10%', calc: Math.min(20, Math.round(0.6 * weight * 10) / 10), unit: 'mL', max: '20 mL', note: '0.6 mL/kg slow IV' },
      { name: 'Glucose 10%', calc: Math.round(2.5 * weight * 10) / 10, unit: 'mL', max: '—', note: '2.5 mL/kg IV' },
      { name: 'Defibrillation', calc: '2 → 4', unit: 'J/kg', max: '—', note: '2 J/kg initial, 4 J/kg subsequent' },
      { name: 'Cardioversion', calc: '0.5 – 1', unit: 'J/kg', max: '—', note: 'Synchronized' },
      { name: 'Fluid Bolus', calc: `${10 * weight} – ${20 * weight}`, unit: 'mL', max: '—', note: '10-20 mL/kg NS/LR' },
    ];

    const ett = age > 0 ? getETT(age) : { uncuffed: '—', cuffed: '—' };
    const depth = age > 0 ? Math.round((age / 2 + 12) * 10) / 10 : '—';
    const ngSize = age < 1 ? '5-8 Fr' : age < 5 ? '8-10 Fr' : age < 12 ? '10-12 Fr' : '12-14 Fr';
    const cathSize = age < 1 ? '5-8 Fr' : age < 5 ? '8-10 Fr' : age < 12 ? '10-12 Fr' : '12-14 Fr';
    const chestDrain = age < 1 ? '8-12 Fr' : age < 5 ? '12-16 Fr' : age < 12 ? '16-24 Fr' : '24-32 Fr';

    setResult({ weight: Math.round(weight * 10) / 10, estimated: !inputs.weight, drugs, ett, depth, ngSize, cathSize, chestDrain });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>PALS Emergency Reference</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Weight (kg, if known)</label>
            <input className="form-input" type="number" step="0.1" name="weight" value={inputs.weight} onChange={handleChange} placeholder="Leave blank to estimate" />
          </div>
          <div className="form-group">
            <label className="form-label">Age (years, to estimate weight)</label>
            <input className="form-input" type="number" step="0.01" name="age" value={inputs.age} onChange={handleChange} />
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <>
            <div className="card mt-4">
              <div className="card-head">
                <h4>Weight: {result.weight} kg {result.estimated && <span className="badge bg-amber">Estimated</span>}</h4>
              </div>
              <div className="card-body">
                <h5 className="mb-3">Emergency Drugs</h5>
                <div className="pals-grid">
                  {result.drugs.map((d, i) => (
                    <div key={i} className="pals-item card">
                      <div className="card-body">
                        <strong className="drug-name">{d.name}</strong>
                        <div className="drug-dose-big">{d.calc} {d.unit}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{d.note}</div>
                        {d.max !== '—' && <div className="text-muted" style={{ fontSize: '0.75rem' }}>Max: {d.max}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-head"><h4>Equipment Sizing</h4></div>
              <div className="card-body">
                <div className="rbox">
                  <div className="rrow"><span className="rlbl">ETT (Uncuffed)</span><span className="rval">{result.ett.uncuffed} mm</span></div>
                  <div className="rrow"><span className="rlbl">ETT (Cuffed)</span><span className="rval">{result.ett.cuffed} mm</span></div>
                  <div className="rrow"><span className="rlbl">ETT Depth</span><span className="rval">{result.depth} cm</span></div>
                  <div className="rrow"><span className="rlbl">NG Tube</span><span className="rval">{result.ngSize}</span></div>
                  <div className="rrow"><span className="rlbl">Urinary Catheter</span><span className="rval">{result.cathSize}</span></div>
                  <div className="rrow"><span className="rlbl">Chest Drain</span><span className="rval">{result.chestDrain}</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
