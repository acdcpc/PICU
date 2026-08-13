import React, { useState } from 'react';

export default function ISLCalc() {
  const [inputs, setInputs] = useState({
    age: '',
    weight: '',
    admWt: '',
    temp: '37',
    vent: 'none',
    crrt: 'no',
    cumIn: '',
    cumOut: '',
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const getBaseISL = (age) => {
    if (age < 0.083) return 50;
    if (age < 0.25) return 35;
    if (age < 1) return 27.5;
    if (age < 3) return 22.5;
    if (age < 6) return 20;
    if (age < 12) return 16.5;
    return 14;
  };

  const calculate = () => {
    const age = parseFloat(inputs.age) || 0;
    const weight = parseFloat(inputs.weight) || 0;
    const admWt = parseFloat(inputs.admWt) || weight;
    const temp = parseFloat(inputs.temp) || 37;
    const cumIn = parseFloat(inputs.cumIn) || 0;
    const cumOut = parseFloat(inputs.cumOut) || 0;

    if (!weight || !admWt) return;

    const base = getBaseISL(age);
    let ventAdj = 0;
    if (inputs.vent === 'hfnc') ventAdj = -4;
    else if (inputs.vent === 'mv_hum') ventAdj = -7;
    else if (inputs.vent === 'mv_hme') ventAdj = -2.5;

    const tempAdj = temp > 37 ? (temp - 37) * 0.12 : 0;
    const crrtAdj = inputs.crrt === 'yes' ? -5 : 0;
    const adjusted = base + ventAdj + base * tempAdj + crrtAdj;
    const dailyTotal = adjusted * weight;
    const fo = admWt ? ((cumIn - cumOut) / (admWt * 1000)) * 100 : 0;

    let foClass = 'badge bg-green';
    let foText = 'Euvolemic — fluid balance within normal limits.';
    if (fo >= 5) { foClass = 'badge bg-amber'; foText = 'Mild fluid overload — monitor closely.'; }
    if (fo >= 10) { foClass = 'badge badge bg-red'; foText = 'Moderate fluid overload — consider diuresis or fluid restriction.'; }
    if (fo >= 15) { foClass = 'badge bg-red'; foText = 'Severe fluid overload — urgent intervention indicated.'; }

    setResult({ base, ventAdj, tempAdj: Math.round(base * tempAdj * 10) / 10, crrtAdj, adjusted: Math.round(adjusted * 10) / 10, dailyTotal: Math.round(dailyTotal), fo: Math.round(fo * 10) / 10, foClass, foText });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Insensible Fluid Loss Calculator</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age (years)</label>
            <input className="form-input" type="number" step="0.01" name="age" value={inputs.age} onChange={handleChange} placeholder="e.g. 0.5" />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" name="weight" value={inputs.weight} onChange={handleChange} placeholder="kg" />
          </div>
          <div className="form-group">
            <label className="form-label">Admission Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" name="admWt" value={inputs.admWt} onChange={handleChange} placeholder="kg" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Temperature (°C)</label>
            <input className="form-input" type="number" step="0.1" name="temp" value={inputs.temp} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Ventilation</label>
            <select className="form-select" name="vent" value={inputs.vent} onChange={handleChange}>
              <option value="none">None / Room Air</option>
              <option value="hfnc">HFNC</option>
              <option value="mv_hum">MV with Humidifier</option>
              <option value="mv_hme">MV with HME</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">CRRT</label>
            <select className="form-select" name="crrt" value={inputs.crrt} onChange={handleChange}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cumulative Input (mL)</label>
            <input className="form-input" type="number" name="cumIn" value={inputs.cumIn} onChange={handleChange} placeholder="mL" />
          </div>
          <div className="form-group">
            <label className="form-label">Cumulative Output (mL)</label>
            <input className="form-input" type="number" name="cumOut" value={inputs.cumOut} onChange={handleChange} placeholder="mL" />
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>Results</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow"><span className="rlbl">Base ISL</span><span className="rval">{result.base} mL/kg/day</span></div>
                <div className="rrow"><span className="rlbl">Vent Adjustment</span><span className="rval">{result.ventAdj >= 0 ? '+' : ''}{result.ventAdj} mL/kg/day</span></div>
                <div className="rrow"><span className="rlbl">Temperature Adjustment</span><span className="rval">+{result.tempAdj} mL/kg/day</span></div>
                <div className="rrow"><span className="rlbl">CRRT Adjustment</span><span className="rval">{result.crrtAdj} mL/kg/day</span></div>
                <div className="rrow"><span className="rlbl"><strong>Adjusted ISL</strong></span><span className="rval"><strong>{result.adjusted} mL/kg/day</strong></span></div>
                <div className="rrow"><span className="rlbl"><strong>Daily ISL Total</strong></span><span className="rval"><strong>{result.dailyTotal} mL/day</strong></span></div>
                <div className="rrow"><span className="rlbl">Fluid Overload %</span><span className="rval"><span className={result.foClass}>{result.fo}%</span></span></div>
              </div>
              <div className="alert alert-info mt-3">{result.foText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
