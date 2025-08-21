import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Tournament from './components/Tournament';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    // Local storage'dan verileri yükle (initial state olarak)
    const savedUsers = localStorage.getItem('registeredUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [currentView, setCurrentView] = useState('register'); // 'register', 'tournament', 'admin'

  // Local storage'a verileri kaydet
  useEffect(() => {
    if (registeredUsers.length > 0) {
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
    // Global olarak erişilebilir hale getir (TC kimlik kontrolü için)
    window.registeredUsers = registeredUsers;
  }, [registeredUsers]);

  const handleRegister = (userData) => {
    setRegisteredUsers([...registeredUsers, userData]);
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'register':
        return <Register onRegister={handleRegister} />;
      case 'tournament':
        return <Tournament registeredUsers={registeredUsers} />;
      case 'admin':
        return <AdminDashboard registeredUsers={registeredUsers} />;
      default:
        return <Register onRegister={handleRegister} />;
    }
  };

  return (
    <div className="App">
      <nav className="navigation">
        <div className="nav-container">
          <h1 className="app-title">Turnuva Yönetim Sistemi</h1>
          <div className="nav-buttons">
            <button 
              className={`nav-btn ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => setCurrentView('register')}
            >
              📝 Kayıt
            </button>
            <button 
              className={`nav-btn ${currentView === 'tournament' ? 'active' : ''}`}
              onClick={() => setCurrentView('tournament')}
            >
              👥 Katılımcılar
            </button>
            <button 
              className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              ⚙️ Admin Dashboard
            </button>
          </div>
          <div className="user-count">
            Kayıtlı Katılımcı: {registeredUsers.length}
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;