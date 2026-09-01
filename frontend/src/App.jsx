import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AttendanceHistory } from './pages/AttendanceHistory';
import { LeaveManagement } from './pages/LeaveManagement';
import { HRDashboard } from './pages/HRDashboard';
import { HRAttendanceLogs } from './pages/HRAttendanceLogs';
import { EmployeeDirectory } from './pages/EmployeeDirectory';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  
  // Default tab based on role
  const isHR = user?.role === 'HR_ADMIN';
  const [activeTab, setActiveTab] = useState(isHR ? 'hr_dashboard' : 'dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update default activeTab when user changes
  React.useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'HR_ADMIN' ? 'hr_dashboard' : 'dashboard');
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-medium">Initializing AttendEase Portal...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === 'REGISTER') {
      return <Register onNavigateLogin={() => setAuthView('LOGIN')} />;
    }
    return <Login onNavigateRegister={() => setAuthView('REGISTER')} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EmployeeDashboard onNavigateTab={setActiveTab} />;
      case 'history':
        return <AttendanceHistory />;
      case 'leaves':
        return <LeaveManagement />;
      case 'hr_dashboard':
        return <HRDashboard onNavigateTab={setActiveTab} />;
      case 'hr_attendance':
        return <HRAttendanceLogs />;
      case 'hr_leaves':
        return <LeaveManagement />;
      case 'hr_employees':
        return <EmployeeDirectory />;
      default:
        return isHR ? <HRDashboard onNavigateTab={setActiveTab} /> : <EmployeeDashboard onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-semibold shadow-inner flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>You are currently offline. Changes will sync once connection is restored.</span>
        </div>
      )}
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
