import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to the Hostel Management System</h1>
          <p className="hero-description">
            Streamline your hostel operations with our comprehensive management platform.
            Manage rooms, attendance, library, lost items, and doctor visits all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>
      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Room Management</h3>
            <p>Efficiently manage hostel rooms and allocations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Library System</h3>
            <p>Track books and manage library resources.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Doctor Visits</h3>
            <p>Schedule and manage medical appointments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Lost & Found</h3>
            <p>Report and recover lost items easily.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
