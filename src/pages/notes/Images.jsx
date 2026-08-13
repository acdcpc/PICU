import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';
import { ArrowLeft, Upload } from 'lucide-react';

const IMG_TYPES = ['Radiology', 'Ultrasound', 'Clinical Photo', 'ECG', 'Other'];

export default function Images() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [images, setImages] = useState([]);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('Radiology');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from('patients').select('*').eq('id', id).single().then(({ data }) => setPatient(data));
    loadImages();
  }, [id]);

  async function loadImages() {
    const { data } = await supabase.from('patient_images').select('*').eq('patient_id', id).order('created_at', { ascending: false });
    setImages(data || []);
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = e.target.imgFile?.files?.[0];
    if (!file) return;
    if (file.size > 500000) { alert('File too large — max 500 KB'); return; }

    setUploading(true);
    const filePath = `patients/${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('patient-images').upload(filePath, file);
    if (uploadError) { alert('Upload error: ' + uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('patient-images').getPublicUrl(filePath);
    const url = urlData?.publicUrl;

    if (url) {
      await supabase.from('patient_images').insert({
        patient_id: id, storage_url: url, description: desc, type, file_name: file.name,
      });
    }

    e.target.reset(); setDesc('');
    setUploading(false);
    loadImages();
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-3" onClick={() => navigate(`/patients/${id}`)}><ArrowLeft size={16} /> Back</button>
      <h3>Patient Images — Bed {patient?.bed_number || '—'}</h3>

      <div className="card mt-3" style={{maxWidth: 500}}>
        <div className="card-head"><h4>Upload Image</h4></div>
        <div className="card-body">
          <form onSubmit={handleUpload}>
            <div className="form-group"><label className="form-label">File (max 500 KB)</label>
              <input className="form-input" type="file" name="imgFile" accept="image/*" /></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                {IMG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Description</label>
              <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <button type="submit" className="btn btn-teal btn-block" disabled={uploading}>
              <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-3">
        {images.length === 0 ? <p className="text-muted">No images uploaded.</p> : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12}}>
            {images.map(img => (
              <div key={img.id} style={{textAlign: 'center'}}>
                <a href={img.storage_url} target="_blank" rel="noreferrer">
                  <img src={img.storage_url} alt={img.description} style={{width:'100%', borderRadius: 8, border: '1px solid var(--border)'}} loading="lazy" />
                </a>
                <p className="text-sm text-muted mt-2">{img.type}: {img.description || ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
