import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

function downloadExcel(wb, filename) {
  XLSX.writeFile(wb, filename);
}

export default function ExportCenter() {
  const today = new Date().toISOString().split('T')[0];
  const [patients, setPatients] = useState([]);
  const [selPt, setSelPt] = useState('');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    supabase.from('patients').select('id,bed_number,diagnosis').eq('active', true).order('bed_number')
      .then(({ data }) => setPatients(data || []));
  }, []);

  async function exportAll() {
    setExporting(true);
    const { data: pts } = await supabase.from('patients').select('*').eq('active', true);
    if (!pts?.length) { alert('No active patients.'); setExporting(false); return; }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pts.map(p => ({
      Bed: p.bed_number, Age: p.age, Weight: p.weight,
      'Adm.Wt': p.admission_weight, Diagnosis: p.diagnosis,
      Admitted: p.admission_date, 'FO%': p.latest_fo,
    }))), 'Patients');
    downloadExcel(wb, `OurPICU_All_Patients_${today}.xlsx`);
    setExporting(false);
  }

  async function exportSingle() {
    if (!selPt) { alert('Select a patient.'); return; }
    setExporting(true);
    const pid = selPt;
    const { data: pt } = await supabase.from('patients').select('*').eq('id', pid).single();
    if (!pt) { alert('Patient not found.'); setExporting(false); return; }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      Bed: pt.bed_number, Age: pt.age, Weight: pt.weight,
      'Adm.Weight': pt.admission_weight, Diagnosis: pt.diagnosis, Admitted: pt.admission_date,
    }]), 'Patient Info');

    try {
      const { data: fb } = await supabase.from('fluid_balance').select('*').eq('patient_id', pid).order('date');
      if (fb?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fb.map(d => ({
        Date: d.date, Input: d.total_input, Output: d.total_output, Net: d.net_balance,
        'ISL(mL)': d.isl_daily, 'FO%': d.fluid_overload_pct, Status: d.fo_status,
      }))), 'Fluid Balance');
    } catch (e) { console.error(e); }

    try {
      const { data: dr } = await supabase.from('patient_drugs').select('*').eq('patient_id', pid);
      if (dr?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dr.map(d => ({
        Drug: d.drug_name, 'Dose/kg': d.dose_per_kg, Max: d.max_dose,
        Freq: d.frequency, Route: d.route, Start: d.start_date,
      }))), 'Drugs');
    } catch (e) { console.error(e); }

    try {
      const { data: inv } = await supabase.from('investigations').select('*').eq('patient_id', pid);
      const irows = [];
      if (inv?.length) inv.forEach(d => {
        Object.entries(d.lab_values || {}).forEach(([t, v]) => {
          irows.push({ Date: d.date, Test: t, Value: v.value, Unit: v.unit });
        });
      });
      if (irows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(irows), 'Investigations');
    } catch (e) { console.error(e); }

    try {
      const { data: nt } = await supabase.from('patient_notes').select('*').eq('patient_id', pid).order('created_at');
      if (nt?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nt.map(d => ({
        Date: new Date(d.created_at).toLocaleDateString('en-GB'),
        Type: d.type, Note: d.text,
      }))), 'Clinical Notes');
    } catch (e) { console.error(e); }

    const cleanDiag = (pt.diagnosis || 'Patient').replace(/[^a-zA-Z0-9-_ ]/g, '_');
    downloadExcel(wb, `Bed_${pt.bed_number}_${cleanDiag}_${today}.xlsx`);
    setExporting(false);
  }

  async function exportRange() {
    if (!from || !to) { alert('Select date range.'); return; }
    setExporting(true);
    const wb = XLSX.utils.book_new();
    const allFB = [];

    for (const p of patients) {
      try {
        const { data: fb } = await supabase.from('fluid_balance').select('*').eq('patient_id', p.id).gte('date', from).lte('date', to);
        fb?.forEach(d => allFB.push({
          Bed: p.bed_number, Diagnosis: p.diagnosis, Date: d.date,
          Input: d.total_input, Output: d.total_output, Net: d.net_balance,
          'ISL(mL)': d.isl_daily, 'FO%': d.fluid_overload_pct, Status: d.fo_status,
        }));
      } catch (e) {}
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      allFB.length ? allFB : [{ Note: 'No data records found for this date range.' }]
    ), 'Fluid Balance');
    downloadExcel(wb, `OurPICU_Range_${from}_to_${to}.xlsx`);
    setExporting(false);
  }

  return (
    <div>
      <h3>Export Centre</h3>

      <div className="flex gap-3 flex-wrap mt-3">
        <div className="card" style={{flex: '1 1 300px'}}>
          <div className="card-head"><h4>Export All Patients</h4></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-3">Download summary of all active patients</p>
            <button className="btn btn-blue btn-block" onClick={exportAll} disabled={exporting}>
              <Download size={16} /> {exporting ? 'Exporting…' : 'Export All (.xlsx)'}
            </button>
          </div>
        </div>

        <div className="card" style={{flex: '1 1 300px'}}>
          <div className="card-head"><h4>Export Single Patient</h4></div>
          <div className="card-body">
            <div className="form-group">
              <select className="form-select" value={selPt} onChange={e => setSelPt(e.target.value)}>
                <option value="">Select patient…</option>
                {patients.map(p => <option key={p.id} value={p.id}>Bed {p.bed_number} — {p.diagnosis}</option>)}
              </select>
            </div>
            <p className="text-sm text-muted mb-3">Includes FB, drugs, labs, notes</p>
            <button className="btn btn-teal btn-block" onClick={exportSingle} disabled={exporting || !selPt}>
              <Download size={16} /> {exporting ? 'Exporting…' : 'Export Single (.xlsx)'}
            </button>
          </div>
        </div>

        <div className="card" style={{flex: '1 1 300px'}}>
          <div className="card-head"><h4>Export by Date Range</h4></div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">From</label><input className="form-input" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">To</label><input className="form-input" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
            </div>
            <p className="text-sm text-muted mb-3">Fluid balance data across all patients</p>
            <button className="btn btn-ghost btn-block" onClick={exportRange} disabled={exporting}>
              <Download size={16} /> {exporting ? 'Exporting…' : 'Export Range (.xlsx)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
