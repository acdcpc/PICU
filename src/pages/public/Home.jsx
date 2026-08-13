import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="pub-hero">
        <div className="text-center">
          <h1>OurPICU</h1>
          <h2>Pediatric Intensive Care Management</h2>
          <p className="text-muted">
            A clinical decision-support platform developed at<br />
            Patan Academy of Health Sciences, Nepal.
          </p>
          <Link
            to={user ? '/dashboard' : '/login'}
            className="btn btn-primary btn-lg mt-2"
          >
            Enter App
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="p-4">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-num">💧</div>
            <div className="stat-label">Fluid Balance Tracking</div>
            <p className="text-muted text-sm mt-1">
              Real-time intake/output monitoring with automatic balance calculations
              and alerts for critically ill children.
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-num">🧮</div>
            <div className="stat-label">Clinical Calculators</div>
            <p className="text-muted text-sm mt-1">
              Weight-based drug dosing, infusion rates, blood gas interpretation,
              and nutritional requirement calculators built for pediatric care.
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-num">💊</div>
            <div className="stat-label">Drug Dosing</div>
            <p className="text-muted text-sm mt-1">
              Comprehensive pediatric drug library with weight-based dosing,
              preparation guides, and administration safety checks.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-4 text-muted text-sm">
        <p>&copy; {new Date().getFullYear()} OurPICU — Patan Academy of Health Sciences</p>
      </footer>
    </div>
  );
}
