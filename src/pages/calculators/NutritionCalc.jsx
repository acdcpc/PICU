import React, { useState } from 'react';

export default function NutritionCalc() {
  const [inputs, setInputs] = useState({ age: '', weight: '', sex: 'm', stress: '1.0', route: 'enteral' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const schofieldBMR = (age, weight, sex) => {
    const wt = weight;
    if (age < 3) {
      return sex === 'm' ? 59.5 * wt - 30 : 58.3 * wt - 31;
    } else if (age < 10) {
      return sex === 'm' ? 22.7 * wt + 505 : 20.3 * wt + 486;
    } else if (age < 18) {
      return sex === 'm' ? 17.7 * wt + 659 : 13.4 * wt + 693;
    }
    return sex === 'm' ? 15.1 * wt + 692 : 14.8 * wt + 487;
  };

  const getProtein = (age) => {
    if (age < 1) return 2.5;
    if (age < 3) return 2.0;
    if (age < 6) return 1.8;
    if (age < 12) return 1.5;
    return 1.2;
  };

  const hollidaySegar = (weight) => {
    if (weight <= 10) return weight * 100;
    if (weight <= 20) return 1000 + (weight - 10) * 50;
    return 1500 + (weight - 20) * 20;
  };

  const calculate = () => {
    const age = parseFloat(inputs.age) || 0;
    const weight = parseFloat(inputs.weight) || 0;
    const stress = parseFloat(inputs.stress) || 1;
    if (!weight) return;

    const bmr = schofieldBMR(age, weight, inputs.sex);
    const target = Math.round(bmr * stress);
    const proteinPerKg = getProtein(age);
    const protein = Math.round(proteinPerKg * weight);
    const fluid = hollidaySegar(weight);
    const feedRate = Math.round(fluid / 24 * 10) / 10;
    const concNeeded = fluid > 0 ? Math.round((target / fluid) * 100) / 100 : 0;
    const gir = Math.round((target * 0.5 / 4) * 1000 / (1440 * weight) * 100) / 100;
    const lipid = Math.round((target * 0.3 / 9) / weight * 100) / 100;
    const aa = Math.round(protein / weight * 100) / 100;

    setResult({ bmr: Math.round(bmr), target, protein, proteinPerKg, fluid, feedRate, concNeeded, gir, lipid, aa, route: inputs.route });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Nutrition Calculator (Schofield)</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age (years)</label>
            <input className="form-input" type="number" step="0.01" name="age" value={inputs.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" name="weight" value={inputs.weight} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Sex</label>
            <select className="form-select" name="sex" value={inputs.sex} onChange={handleChange}>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stress Factor</label>
            <select className="form-select" name="stress" value={inputs.stress} onChange={handleChange}>
              <option value="1.0">1.0 — Maintenance</option>
              <option value="1.1">1.1 — Mild stress</option>
              <option value="1.2">1.2 — Post-surgery</option>
              <option value="1.3">1.3 — Infection</option>
              <option value="1.5">1.5 — Sepsis</option>
              <option value="1.7">1.7 — Trauma</option>
              <option value="2.0">2.0 — Burns/Severe</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Route</label>
            <select className="form-select" name="route" value={inputs.route} onChange={handleChange}>
              <option value="enteral">Enteral</option>
              <option value="parenteral">Parenteral</option>
              <option value="combined">Combined</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>Nutrition Plan</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow"><span className="rlbl">Schofield BMR</span><span className="rval">{result.bmr} kcal/day</span></div>
                <div className="rrow"><span className="rlbl">Target Calories</span><span className="rval"><span className="big-num">{result.target}</span> kcal/day</span></div>
                <div className="rrow"><span className="rlbl">Protein</span><span className="rval">{result.protein}g/day ({result.proteinPerKg} g/kg)</span></div>
                <div className="rrow"><span className="rlbl">Fluid (Holliday-Segar)</span><span className="rval">{result.fluid} mL/day</span></div>
                {(result.route === 'enteral' || result.route === 'combined') && (
                  <>
                    <div className="rrow"><span className="rlbl">Feed Rate</span><span className="rval">{result.feedRate} mL/hr</span></div>
                    <div className="rrow"><span className="rlbl">Concentration Needed</span><span className="rval">{result.concNeeded} kcal/mL</span></div>
                  </>
                )}
                {(result.route === 'parenteral' || result.route === 'combined') && (
                  <>
                    <div className="rrow"><span className="rlbl">GIR</span><span className="rval">{result.gir} mg/kg/min</span></div>
                    <div className="rrow"><span className="rlbl">Lipid</span><span className="rval">{result.lipid} g/kg/day</span></div>
                    <div className="rrow"><span className="rlbl">Amino Acids</span><span className="rval">{result.aa} g/kg/day</span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
