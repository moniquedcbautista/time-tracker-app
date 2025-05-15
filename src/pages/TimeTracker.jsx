import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TimeTracker = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('idle');
  const [loginTime, setLoginTime] = useState(null);
  const [activeLog, setActiveLog] = useState(null);
  const [totalHours, setTotalHours] = useState(null);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (data) {
      setEntries(data);
      const openLog = data.find((entry) => !entry.clock_out);
      if (openLog) {
        setActiveLog(openLog);
        setStatus('clocked_in');
      } else {
        setStatus('idle');
      }
    }
  };

  useEffect(() => {
    setLoginTime(new Date().toLocaleTimeString());
    fetchLogs();
  }, []);

  const handleTimeIn = async () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);

    const { error } = await supabase.from('time_logs').insert([
      {
        user_id: user.id,
        date,
        clock_in: time,
      },
    ]);

    if (!error) {
      fetchLogs();
      setStatus('clocked_in');
    }
  };

  const handleTimeOut = async () => {
    const time = new Date().toTimeString().slice(0, 5);
    const start = new Date(`1970-01-01T${activeLog.clock_in}`);
    const end = new Date(`1970-01-01T${time}`);
    const hours = ((end - start) / (1000 * 60 * 60)).toFixed(2);

    const { error } = await supabase
      .from('time_logs')
      .update({ clock_out: time, hours })
      .eq('id', activeLog.id);

    if (!error) {
      setTotalHours(hours);
      fetchLogs();
      setStatus('idle');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white shadow-md p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Welcome, {user.email}</h2>
        <p>Login time: {loginTime}</p>
        <p>Status: {status === 'idle' ? 'Ready to log' : 'Working session in progress'}</p>

        {status === 'idle' && (
          <button onClick={handleTimeIn} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
            Time In
          </button>
        )}

        {status === 'clocked_in' && (
          <button onClick={handleTimeOut} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
            Time Out
          </button>
        )}

        {status === 'idle' && totalHours && (
          <div className="mt-4 text-green-600">
            <p>You worked {totalHours} hours in your last session.</p>
          </div>
        )}
      </div>

      {status === 'clocked_in' && (
        <div className="text-yellow-600">
          ⚠️ Reminder: You haven’t timed out yet.
        </div>
      )}

      <div className="bg-white shadow-md p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Your Time Logs</h2>
        {entries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className="border-b py-2">
              <p><strong>{entry.date}</strong></p>
              <p>Clock In: {entry.clock_in || '—'} | Clock Out: {entry.clock_out || '—'}</p>
              <p>Total Hours: {entry.hours || '—'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
