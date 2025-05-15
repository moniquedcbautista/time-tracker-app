import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import TimeTracker from './pages/TimeTracker';
import Login from './pages/Login';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return <Login onLogin={() => {}} />;

  return (
    <div>
      <div className="p-4 bg-gray-200 text-right">
        <button onClick={handleLogout} className="text-blue-600 underline">
          Logout
        </button>
      </div>
      <TimeTracker user={session.user} />
    </div>
  );
}

export default App;
