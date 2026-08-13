import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

const TABS = ['Videos', 'Teaching Notes', 'MCQs'];

export default function Education() {
  const [edu, setEdu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Videos');
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqScore, setMcqScore] = useState(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  useEffect(() => {
    fetchEducation();
  }, []);

  async function fetchEducation() {
    setLoading(true);
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      setEdu(data);
    } else {
      // Insert empty row if none exists
      const { data: inserted, error: insertErr } = await supabase
        .from('education')
        .insert({
          videos: [],
          teaching_notes: [],
          mcqs: [],
          social_media: {},
        })
        .select('*')
        .single();
      if (!insertErr && inserted) setEdu(inserted);
    }
    setLoading(false);
  }

  function handleMcqSelect(idx, optIdx) {
    if (mcqSubmitted) return;
    setMcqAnswers((prev) => ({ ...prev, [idx]: optIdx }));
  }

  function handleMcqSubmit() {
    const mcqs = edu?.mcqs || [];
    let correct = 0;
    mcqs.forEach((q, i) => {
      if (mcqAnswers[i] === q.correct) correct++;
    });
    const score = mcqs.length > 0 ? Math.round((correct / mcqs.length) * 100) : 0;
    setMcqScore({ correct, total: mcqs.length, pct: score });
    setMcqSubmitted(true);
  }

  function resetMcq() {
    setMcqAnswers({});
    setMcqScore(null);
    setMcqSubmitted(false);
  }

  if (loading) {
    return (
      <div className="flex items-c jc-between p-4">
        <div className="loader"></div>
        <span className="ml-2 text-muted">Loading education content…</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2>Education &amp; Training</h2>

      {/* Tab Bar */}
      <div className="flex gap-2 mt-2 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---- VIDEOS ---- */}
      {activeTab === 'Videos' && (
        <div>
          {(!edu?.videos || edu.videos.length === 0) ? (
            <div className="card">
              <div className="card-body text-center text-muted">
                No videos added yet.
              </div>
            </div>
          ) : (
            <div className="vid-grid">
              {edu.videos.map((vid, i) => (
                <div key={i} className="vid-card">
                  <div className="vid-embed">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.youtube_id}`}
                      title={vid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="vid-info p-2">
                    <strong>{vid.title}</strong>
                    {vid.description && (
                      <p className="text-muted text-sm mt-1">{vid.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- TEACHING NOTES ---- */}
      {activeTab === 'Teaching Notes' && (
        <div>
          {(!edu?.teaching_notes || edu.teaching_notes.length === 0) ? (
            <div className="card">
              <div className="card-body text-center text-muted">
                No teaching notes added yet.
              </div>
            </div>
          ) : (
            edu.teaching_notes.map((note, i) => (
              <div key={i} className="card mb-2">
                <div className="card-head">
                  <strong>{note.title}</strong>
                  {note.created_at && (
                    <span className="text-muted text-sm ml-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="card-body" style={{ whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- MCQs ---- */}
      {activeTab === 'MCQs' && (
        <div>
          {(!edu?.mcqs || edu.mcqs.length === 0) ? (
            <div className="card">
              <div className="card-body text-center text-muted">
                No MCQs added yet.
              </div>
            </div>
          ) : (
            <>
              {edu.mcqs.map((q, qi) => (
                <div key={qi} className="mcq-card card mb-2">
                  <div className="card-head">
                    <strong>Q{qi + 1}.</strong> {q.question}
                  </div>
                  <div className="card-body">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="mcq-opt">
                        <input
                          type="radio"
                          name={`mcq-${qi}`}
                          checked={mcqAnswers[qi] === oi}
                          onChange={() => handleMcqSelect(qi, oi)}
                          disabled={mcqSubmitted}
                        />
                        <span
                          className={
                            mcqSubmitted
                              ? oi === q.correct
                                ? 'bg-green'
                                : mcqAnswers[qi] === oi
                                ? 'bg-red'
                                : ''
                              : ''
                          }
                        >
                          {opt}
                        </span>
                      </label>
                    ))}
                    {mcqSubmitted && (
                      <div className="mcq-exp alert alert-info mt-1">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-c jc-between mt-2">
                {!mcqSubmitted ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleMcqSubmit}
                    disabled={Object.keys(mcqAnswers).length !== (edu?.mcqs || []).length}
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button className="btn btn-ghost" onClick={resetMcq}>
                    Try Again
                  </button>
                )}

                {!mcqSubmitted && Object.keys(mcqAnswers).length !== (edu?.mcqs || []).length && (
                  <span className="text-muted text-sm">
                    Answer all questions to submit
                  </span>
                )}
              </div>

              {mcqScore && (
                <div className={`alert mt-2 ${mcqScore.pct >= 70 ? 'alert-success' : mcqScore.pct >= 40 ? 'alert-warn' : 'alert-danger'}`}>
                  Score: {mcqScore.correct}/{mcqScore.total} ({mcqScore.pct}%)
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
