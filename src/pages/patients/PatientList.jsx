import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';
import { Plus, Eye, LogOut } from 'lucide-react';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('patients').select('*').eq('active', true).order('bed_number')
      .then(({ data }) => { setPatients(data || []); setLoading(false); });
  }, []);

  async function discharge(id) {
    if (!confirm('Mark as discharged? They will be removed from active list.')) return;
    await supabase.from('patients').update({ active: false }).eq('id', id);
    setPatients(prev => prev.filter(p => p.id !== id));
  }

  if (loading) return <div className="loader"><div className="spinner"></div> Loading patients…</div>;

  return (
    <div>
      <div className="flex jc-between items-c mb-3">
        <h3>Patient Directory</h3>
        <button className="btn btn-teal" onClick={() => navigate('/patients/new')}><Plus size={16} /> Add Patient</button>
      </div>

      {patients.length === 0 ? (
        <div className="card"><div className="card-body text-center text-muted p-4">No active patients.</div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Bed</th><th>Age</th><th>Weight</th><th>Diagnosis</th><th>Admitted</th><th>FO%</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {patients.map(p => {
                  const fo = p.latest_fo || 0;
                  const bc = fo > 10 ? 'bg-red' : fo > 5 ? 'bg-amber' : 'bg-green';
                  return (
                    <tr key={p.id}>
                      <td><strong>Bed {p.bed_number}</strong></td>
                      <td>{p.age} yrs</td>
                      <td>{p.weight} kg</td>
                      <td>{p.diagnosis || '—'}</td>
                      <td>{p.admission_date || '—'}</td>
                      <td><span className={`badge ${bc}`}>{fo ? fo.toFixed(1) + '%' : '—'}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-blue btn-sm" onClick={() => navigate(`/patients/${p.id}`)}><Eye size={14} /> View</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => discharge(p.id)}><LogOut size={14} /> Discharge</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
