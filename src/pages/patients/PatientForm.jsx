import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';

export default function PatientForm() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    bed_number: '', age: '', weight: '', admission_weight: '',
    diagnosis: '', admission_date: today, sex: 'Male', height: ''
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.bed_number || !form.age || !form.weight) { alert('Bed, age, and weight are required.'); return; }
    setSaving(true);
    const { error } = await supabase.from('patients').insert({
      bed_number: parseInt(form.bed_number),
      age: parseFloat(form.age),
      weight: parseFloat(form.weight),
      admission_weight: parseFloat(form.admission_weight) || parseFloat(form.weight),
      diagnosis: form.diagnosis,
      admission_date: form.admission_date,
      sex: form.sex,
      height: parseFloat(form.height) || null,
      active: true, latest_fo: 0,
    });
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    navigate('/patients');
  }

  return (
    <div className="card" style={{maxWidth: 600}}>
      <div className="card-head"><h3>Add New Patient</h3></div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bed Number *</label>
              <input className="form-input" type="number" required value={form.bed_number} onChange={e => update('bed_number', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Age (years) *</label>
              <input className="form-input" type="number" step="0.01" required value={form.age} onChange={e => update('age', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight (kg) *</label>
              <input className="form-input" type="number" step="0.1" required value={form.weight} onChange={e => update('weight', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Admission Weight (kg)</label>
              <input className="form-input" type="number" step="0.1" value={form.admission_weight} onChange={e => update('admission_weight', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select className="form-select" value={form.sex} onChange={e => update('sex', e.target.value)}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="form-input" type="number" step="0.1" value={form.height} onChange={e => update('height', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Diagnosis</label>
            <input className="form-input" value={form.diagnosis} onChange={e => update('diagnosis', e.target.value)} placeholder="e.g. Pneumonia, Septic Shock…" />
          </div>
          <div className="form-group">
            <label className="form-label">Admission Date</label>
            <input className="form-input" type="date" value={form.admission_date} onChange={e => update('admission_date', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/patients')}>Cancel</button>
            <button type="submit" className="btn btn-teal" disabled={saving}>
              {saving ? 'Saving…' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
