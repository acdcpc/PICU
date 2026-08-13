import React, { useState } from 'react';

export default function VentCalc() {
  const [inputs, setInputs] = useState({ age: '', weight: '', indication: 'general' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getRateByAge = (age) => {
    if (age < 0.083) return '40-60';
    if (age < 1) return '30-40';
    if (age < 3) return '24-30';
    if (age < 6) return '20-24';
    if (age < 12) return '16-22';
    return '12-18';
  };

  const getBladeByAge = (age) => {
    if (age < 0.25) return 'Miller 0 (straight)';
    if (age < 1) return 'Miller 1';
    if (age < 3) return 'Miller 1 / Mac 1';
    if (age < 6) return 'Mac 2';
    if (age < 12) return 'Mac 2-3';
    return 'Mac 3-4';
  };

  const calculate = () => {
    const age = parseFloat(inputs.age) || 0;
    const weight = parseFloat(inputs.weight) || 0;
    if (!weight) return;

    const isArds = inputs.indication === 'ards';
    const tvLow = Math.round(6 * weight);
    const tvHigh = Math.round(8 * weight);
    const rateRange = getRateByAge(age);
    const peep = isArds ? 8 : 5;
    const fio2 = isArds ? 60 : 40;
    const peakLimit = isArds ? 30 : 25;
    const minVent = weight * 6 * 20; // approximate for display

    const ettUncuffed = age > 0 ? Math.round((age / 4 + 4) * 10) / 10 : 3.0;
    const ettCuffed = age >= 2 ? Math.round((age / 4 + 3.5) * 10) / 10 : null;
    const depth = age > 0 ? Math.round((age / 2 + 12) * 10) / 10 : 10;
    const blade = getBladeByAge(age);

    setResult({ tvLow, tvHigh, rateRange, peep, fio2, peakLimit, minVent, ettUncuffed, ettCuffed, depth, blade, isArds });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Ventilator Settings Calculator</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age (years)</label>
            <input className="form-input" type="number" step="0.01" name="age" value={inputs.age} onChange={handleChange} placeholder="years" />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" name="weight" value={inputs.weight} onChange={handleChange} placeholder="kg" />
          </div>
          <div className="form-group">
            <label className="form-label">Indication</label>
            <select className="form-select" name="indication" value={inputs.indication} onChange={handleChange}>
              <option value="general">General</option>
              <option value="ards">ARDS</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <>
            <div className="card mt-4">
              <div className="card-head"><h4>Ventilator Settings</h4></div>
              <div className="card-body">
                <div className="rbox">
                  <div className="rrow"><span className="rlbl">Tidal Volume</span><span className="rval">{result.tvLow} – {result.tvHigh} mL ({result.isArds ? '4-6' : '6-8'} mL/kg)</span></div>
                  <div className="rrow"><span className="rlbl">Rate</span><span className="rval">{result.rateRange} /min</span></div>
                  <div className="rrow"><span className="rlbl">PEEP</span><span className="rval">{result.peep} cm H₂O</span></div>
                  <div className="rrow"><span className="rlbl">FiO₂</span><span className="rval">{result.fio2}%</span></div>
                  <div className="rrow"><span className="rlbl">I:E Ratio</span><span className="rval">1:2</span></div>
                  <div className="rrow"><span className="rlbl">Peak Pressure Limit</span><span className="rval">&lt;{result.peakLimit} cm H₂O</span></div>
                  <div className="rrow"><span className="rlbl">Est. Minute Ventilation</span><span className="rval">~{result.minVent} mL/min</span></div>
                </div>
              </div>
            </div>
            <div className="card mt-3">
              <div className="card-head"><h4>Equipment Sizing</h4></div>
              <div className="card-body">
                <div className="rbox">
                  <div className="rrow"><span className="rlbl">ETT (Uncuffed)</span><span className="rval">{result.ettUncuffed} mm</span></div>
                  {result.ettCuffed !== null && (
                    <div className="rrow"><span className="rlbl">ETT (Cuffed)</span><span className="rval">{result.ettCuffed} mm</span></div>
                  )}
                  <div className="rrow"><span className="rlbl">ETT Depth</span><span className="rval">{result.depth} cm (at lips)</span></div>
                  <div className="rrow"><span className="rlbl">Laryngoscope Blade</span><span className="rval">{result.blade}</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
