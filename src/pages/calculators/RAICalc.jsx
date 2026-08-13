import React, { useState } from 'react';

export default function RAICalc() {
  const [inputs, setInputs] = useState({ tier: '1', fo: '', baseCr: '', currentCr: '' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    const tier = parseInt(inputs.tier) || 1;
    const fo = parseFloat(inputs.fo) || 0;
    const baseCr = parseFloat(inputs.baseCr) || 0;
    const currentCr = parseFloat(inputs.currentCr) || 0;

    const rai = tier * fo;
    const positive = rai >= 8;

    let akiStage = null;
    let akiStageLabel = '';
    if (baseCr > 0 && currentCr > 0) {
      const ratio = currentCr / baseCr;
      if (ratio >= 3) { akiStage = 3; akiStageLabel = 'Stage 3 AKI (Cr ratio ≥ 3)'; }
      else if (ratio >= 2) { akiStage = 2; akiStageLabel = 'Stage 2 AKI (Cr ratio 2-3)'; }
      else if (ratio >= 1.5) { akiStage = 1; akiStageLabel = 'Stage 1 AKI (Cr ratio 1.5-2)'; }
      else { akiStage = 0; akiStageLabel = 'No AKI'; }
    }

    setResult({
      rai: Math.round(rai * 10) / 10,
      positive,
      akiStage,
      akiStageLabel,
      crRatio: baseCr > 0 ? Math.round((currentCr / baseCr) * 100) / 100 : null,
    });
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Renal Angina Index</h3></div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Risk Tier (1-5)</label>
            <select className="form-select" name="tier" value={inputs.tier} onChange={handleChange}>
              <option value="1">1 — Standard risk (no ICU, no MV)</option>
              <option value="2">2</option>
              <option value="3">3 — Moderate risk</option>
              <option value="4">4</option>
              <option value="5">5 — Very high risk (MV + vasopressors)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fluid Overload % (FO%)</label>
            <input className="form-input" type="number" step="0.1" name="fo" value={inputs.fo} onChange={handleChange} placeholder="%" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Baseline Creatinine (mg/dL)</label>
            <input className="form-input" type="number" step="0.01" name="baseCr" value={inputs.baseCr} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Current Creatinine (mg/dL)</label>
            <input className="form-input" type="number" step="0.01" name="currentCr" value={inputs.currentCr} onChange={handleChange} />
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={calculate}>Calculate</button>

        {result && (
          <div className="card mt-4">
            <div className="card-head"><h4>Results</h4></div>
            <div className="card-body">
              <div className="rbox">
                <div className="rrow">
                  <span className="rlbl">Renal Angina Index</span>
                  <span className="rval">
                    <span className="big-num">{result.rai}</span>{' '}
                    <span className={`badge ${result.positive ? 'bg-red' : 'bg-green'}`}>
                      {result.positive ? 'POSITIVE (≥8)' : 'NEGATIVE'}
                    </span>
                  </span>
                </div>
                {result.crRatio !== null && (
                  <>
                    <div className="rrow">
                      <span className="rlbl">Cr Ratio (current/baseline)</span>
                      <span className="rval">{result.crRatio}</span>
                    </div>
                    <div className="rrow">
                      <span className="rlbl">AKI Stage</span>
                      <span className="rval">
                        <span className={`badge ${result.akiStage >= 2 ? 'bg-red' : result.akiStage === 1 ? 'bg-amber' : 'bg-green'}`}>
                          {result.akiStageLabel}
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>
              {result.positive && (
                <div className="alert alert-warn mt-3">
                  RAI positive — high risk for severe AKI. Consider early nephrology consultation, fluid optimization, and avoid nephrotoxins.
                </div>
              )}
              {!result.positive && (
                <div className="alert alert-info mt-3">
                  RAI negative. Continue routine monitoring.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
