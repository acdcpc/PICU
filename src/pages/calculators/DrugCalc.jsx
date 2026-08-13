import React, { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

const defaultDrugs = [
  { name: 'Morphine', dose: '0.05-0.1 mg/kg/dose', maxDose: '5 mg/dose', freq: 'q2-4h PRN', route: 'IV/SC', prep: 'Dilute to 1 mg/mL' },
  { name: 'Fentanyl', dose: '1-5 mcg/kg/dose', maxDose: '100 mcg/dose', freq: 'q1-2h', route: 'IV', prep: 'Undiluted or dilute to 10 mcg/mL' },
  { name: 'Midazolam', dose: '0.05-0.1 mg/kg/dose', maxDose: '5 mg/dose', freq: 'q1-2h PRN', route: 'IV', prep: 'Undiluted 5 mg/mL' },
  { name: 'Ketamine', dose: '0.5-2 mg/kg/dose', maxDose: '100 mg/dose', freq: 'q5-10min PRN', route: 'IV', prep: 'Undiluted 50 mg/mL' },
  { name: 'Dopamine', dose: '5-20 mcg/kg/min', maxDose: '20 mcg/kg/min', freq: 'Continuous', route: 'IV infusion', prep: '6×wt(mg) in 100mL D5W' },
  { name: 'Dobutamine', dose: '5-20 mcg/kg/min', maxDose: '20 mcg/kg/min', freq: 'Continuous', route: 'IV infusion', prep: '6×wt(mg) in 100mL D5W' },
  { name: 'Adrenaline', dose: '0.05-1 mcg/kg/min', maxDose: '1 mcg/kg/min', freq: 'Continuous', route: 'IV infusion', prep: '0.3×wt(mg) in 50mL NS' },
  { name: 'Noradrenaline', dose: '0.05-1 mcg/kg/min', maxDose: '2 mcg/kg/min', freq: 'Continuous', route: 'IV infusion', prep: '0.3×wt(mg) in 50mL D5W' },
  { name: 'Furosemide', dose: '0.5-2 mg/kg/dose', maxDose: '40 mg/dose', freq: 'q6-12h', route: 'IV', prep: 'Undiluted 10 mg/mL' },
  { name: 'Mannitol', dose: '0.25-1 g/kg/dose', maxDose: '80 g/dose', freq: 'q4-6h', route: 'IV', prep: '20% solution over 20-30 min' },
  { name: 'Phenobarbitone', dose: '10-20 mg/kg load', maxDose: '1 g/dose', freq: 'Load then 5 mg/kg/day', route: 'IV/PO', prep: 'Slow IV over 10-15 min' },
  { name: 'Phenytoin', dose: '15-20 mg/kg load', maxDose: '1 g/dose', freq: 'Load then 5-10 mg/kg/day', route: 'IV', prep: 'In NS, max 50 mg/min' },
  { name: 'Vancomycin', dose: '10-15 mg/kg/dose', maxDose: '2 g/dose', freq: 'q6-8h', route: 'IV', prep: 'Dilute to 5 mg/mL, infuse over 60 min' },
  { name: 'Meropenem', dose: '20-40 mg/kg/dose', maxDose: '2 g/dose', freq: 'q8h', route: 'IV', prep: 'Reconstitute, dilute to 50 mg/mL' },
  { name: 'Ceftriaxone', dose: '50-100 mg/kg/day', maxDose: '2 g/day', freq: 'q12-24h', route: 'IV/IM', prep: 'Reconstitute to 100 mg/mL' },
  { name: 'Gentamicin', dose: '5-7.5 mg/kg/dose', maxDose: '400 mg/dose', freq: 'q24h', route: 'IV', prep: 'Dilute in NS, infuse over 30 min' },
  { name: 'Paracetamol', dose: '10-15 mg/kg/dose', maxDose: '1 g/dose', freq: 'q4-6h', route: 'IV/PO', prep: 'Undiluted 10 mg/mL IV over 15 min' },
  { name: 'Ibuprofen', dose: '5-10 mg/kg/dose', maxDose: '400 mg/dose', freq: 'q6-8h', route: 'PO', prep: 'Oral suspension 100 mg/5mL' },
  { name: 'Hydrocortisone', dose: '1-2 mg/kg/dose', maxDose: '100 mg/dose', freq: 'q6h', route: 'IV', prep: 'Reconstitute, dilute in NS' },
  { name: 'Dexamethasone', dose: '0.15-0.6 mg/kg/dose', maxDose: '10 mg/dose', freq: 'q6-12h', route: 'IV/PO', prep: 'Undiluted 4 mg/mL IV' },
  { name: 'Insulin', dose: '0.05-0.1 U/kg/h', maxDose: 'Titrate to BG', freq: 'Continuous', route: 'IV infusion', prep: '1U/mL in NS (50U in 50mL)' },
  { name: 'Calcium gluconate', dose: '0.6 mL/kg/dose', maxDose: '20 mL/dose', freq: 'Once, may repeat', route: 'IV', prep: '10% solution slow IV push' },
  { name: 'Sodium bicarbonate', dose: '1 mEq/kg/dose', maxDose: '50 mEq/dose', freq: 'Once, may repeat', route: 'IV', prep: '8.4% solution, dilute 1:1' },
  { name: 'KCl', dose: '0.5-1 mEq/kg/dose', maxDose: '20 mEq/dose', freq: 'Once', route: 'IV', prep: 'Dilute ≤40 mEq/L, max 0.5 mEq/kg/h' },
  { name: 'Magnesium sulphate', dose: '25-50 mg/kg/dose', maxDose: '2 g/dose', freq: 'q4-6h', route: 'IV', prep: '10% solution over 20-30 min' },
  { name: 'Adenosine', dose: '0.1 mg/kg/dose', maxDose: '6 mg/dose', freq: 'May double, max 12 mg', route: 'IV', prep: 'Rapid IV push with flush' },
  { name: 'Amiodarone', dose: '5 mg/kg load', maxDose: '300 mg/dose', freq: 'Load then 5-10 mcg/kg/min', route: 'IV', prep: 'Dilute in D5W, central line preferred' },
  { name: 'Atropine', dose: '0.02 mg/kg/dose', maxDose: '0.5 mg/dose', freq: 'May repeat ×1', route: 'IV', prep: 'Undiluted 0.5 mg/mL' },
  { name: 'Suxamethonium', dose: '1-2 mg/kg/dose', maxDose: '150 mg/dose', freq: 'Once', route: 'IV', prep: 'Undiluted 50 mg/mL' },
  { name: 'Vecuronium', dose: '0.08-0.1 mg/kg/dose', maxDose: '10 mg/dose', freq: 'q1-2h PRN', route: 'IV', prep: 'Reconstitute to 1 mg/mL' },
];

function parseRange(str) {
  const nums = str.match(/[\d.]+/g);
  if (!nums || nums.length === 0) return { low: 0, high: 0, unit: '' };
  const unitMatch = str.match(/(mcg\/kg\/min|mg\/kg\/dose|mg\/kg\/day|mg\/kg\/h|mg\/kg\/load|mL\/kg\/dose|mEq\/kg\/dose|g\/kg\/dose|U\/kg\/h|mg\/kg|mcg\/kg|mg\/dose|g\/dose)/i);
  const unit = unitMatch ? unitMatch[0] : '';
  const low = parseFloat(nums[0]) || 0;
  const high = nums.length > 1 ? parseFloat(nums[1]) : low;
  return { low, high, unit };
}

export default function DrugCalc() {
  const [weight, setWeight] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('');
  const [result, setResult] = useState(null);
  const [drugs, setDrugs] = useState(defaultDrugs);

  useEffect(() => {
    const fetchDrugs = async () => {
      const { data, error } = await supabase.from('drug_library').select('*');
      if (data && data.length > 0) setDrugs(data);
    };
    fetchDrugs();
  }, []);

  const calculate = () => {
    const wt = parseFloat(weight) || 0;
    if (!wt || !selectedDrug) return;
    const drug = drugs.find(d => d.name === selectedDrug);
    if (!drug) return;
    const { low, high, unit } = parseRange(drug.dose);
    const maxParsed = parseRange(drug.maxDose);
    const lowCalc = Math.round(low * wt * 100) / 100;
    const highCalc = Math.round(high * wt * 100) / 100;
    setResult({ drug, wt, lowCalc, highCalc, unit, maxDose: drug.maxDose });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Drug Dose Calculator</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Patient Weight (kg)</label>
            <input className="form-input" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="kg" />
          </div>
          <div className="form-group">
            <label className="form-label">Drug</label>
            <select className="form-select" value={selectedDrug} onChange={e => { setSelectedDrug(e.target.value); setResult(null); }}>
              <option value="">-- Select Drug --</option>
              {drugs.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>{result.drug.name}</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow"><span className="rlbl">Dose Range</span><span className="rval">{result.drug.dose}</span></div>
                <div className="rrow"><span className="rlbl">Calculated Dose</span><span className="rval"><span className="big-num">{result.lowCalc}{result.lowCalc !== result.highCalc ? ` – ${result.highCalc}` : ''}</span> {result.unit}</span></div>
                <div className="rrow"><span className="rlbl">Max Dose</span><span className="rval">{result.drug.maxDose}</span></div>
                <div className="rrow"><span className="rlbl">Frequency</span><span className="rval">{result.drug.freq}</span></div>
                <div className="rrow"><span className="rlbl">Route</span><span className="rval">{result.drug.route}</span></div>
                <div className="rrow"><span className="rlbl">Preparation</span><span className="rval">{result.drug.prep}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
