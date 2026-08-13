import React, { useState } from 'react';

export default function PhoenixCalc() {
  const [inputs, setInputs] = useState({
    infection: 'no',
    resp: '0',
    lactate: '0',
    vasopressor: '0',
    coag: '0',
    neuro: '0',
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    const infection = inputs.infection === 'yes';
    const resp = parseInt(inputs.resp) || 0;
    const lactate = parseInt(inputs.lactate) || 0;
    const vasopressor = parseInt(inputs.vasopressor) || 0;
    const coag = parseInt(inputs.coag) || 0;
    const neuro = parseInt(inputs.neuro) || 0;

    const cardio = Math.min(lactate + vasopressor, 6);
    const total = resp + cardio + coag + neuro;
    const sepsis = infection && total >= 2;
    const septicShock = sepsis && cardio >= 1;

    let status, statusClass;
    if (!infection) { status = 'No Infection Documented'; statusClass = 'badge bg-amber'; }
    else if (!sepsis) { status = 'No Sepsis (score {"<"} 2)'; statusClass = 'badge bg-amber'; }
    else if (septicShock) { status = 'SEPTIC SHOCK'; statusClass = 'badge bg-red'; }
    else { status = 'SEPSIS'; statusClass = 'badge bg-red'; }

    setResult({ resp, cardio, coag, neuro, total, sepsis, septicShock, status, statusClass, infection });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Phoenix Sepsis Score (2024)</h3></div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label">Infection Confirmed</label>
          <select className="form-select" name="infection" value={inputs.infection} onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="form-row mt-3">
          <div className="form-group">
            <label className="form-label">Respiratory Score (0-3)</label>
            <select className="form-select" name="resp" value={inputs.resp} onChange={handleChange}>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lactate Score (0-2)</label>
            <select className="form-select" name="lactate" value={inputs.lactate} onChange={handleChange}>
              <option value="0">0 — Lactate &lt; 5 mmol/L</option>
              <option value="1">1 — Lactate 5-10.9 mmol/L</option>
              <option value="2">2 — Lactate ≥ 11 mmol/L</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Vasopressor Score (0-2)</label>
            <select className="form-select" name="vasopressor" value={inputs.vasopressor} onChange={handleChange}>
              <option value="0">0 — None</option>
              <option value="1">1 — 1 agent</option>
              <option value="2">2 — ≥ 2 agents</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Coagulation Score (0-2)</label>
            <select className="form-select" name="coag" value={inputs.coag} onChange={handleChange}>
              <option value="0">0 — Plt ≥ 100 &amp; INR &lt; 1.3</option>
              <option value="1">1 — Plt {"<"} 100 or INR ≥ 1.3</option>
              <option value="2">2 — Plt {"<"} 100 and INR ≥ 1.3</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Neurological Score (0-2)</label>
            <select className="form-select" name="neuro" value={inputs.neuro} onChange={handleChange}>
              <option value="0">0 — GCS &gt; 10 / reactive pupils</option>
              <option value="1">1 — GCS ≤ 10 or fixed pupils</option>
              <option value="2">2 — GCS ≤ 10 and fixed pupils</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>Results</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow">
                  <span className="rlbl">Total Score</span>
                  <span className="rval"><span className="big-num">{result.total}</span> / 13</span>
                </div>
                <div className="rrow">
                  <span className="rlbl">Respiratory</span>
                  <span className="rval">{result.resp} / 3</span>
                </div>
                <div className="rrow">
                  <span className="rlbl">Cardiovascular</span>
                  <span className="rval">{result.cardio} / 6</span>
                </div>
                <div className="rrow">
                  <span className="rlbl">Coagulation</span>
                  <span className="rval">{result.coag} / 2</span>
                </div>
                <div className="rrow">
                  <span className="rlbl">Neurological</span>
                  <span className="rval">{result.neuro} / 2</span>
                </div>
                <div className="rrow">
                  <span className="rlbl"><strong>Diagnosis</strong></span>
                  <span className="rval"><span className={result.statusClass}>{result.status}</span></span>
                </div>
              </div>
              {result.sepsis && (
                <div className={result.septicShock ? 'alert alert-danger mt-3' : 'alert alert-warn mt-3'}>
                  {result.septicShock
                    ? 'Septic shock identified — initiate sepsis bundle immediately: blood culture, lactate, antibiotics within 1 hour, fluid resuscitation, vasopressors if needed.'
                    : 'Sepsis identified — initiate sepsis bundle: blood culture, lactate, antibiotics within 1 hour, fluid resuscitation.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
