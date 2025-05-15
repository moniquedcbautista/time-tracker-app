import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TimeTracker = ({ user }) => {
  const [log, setLog] = useState(null);
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('idle');
  const [loginTime, setLoginTime] = useState(null);
  const [totalHours, setTotalHours] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (data) {
      setEntries(data);
      const todayLog = data.find((entry) => entry.date === today);
      if (todayLog) {
        setLog(todayLog);
        setStatus(todayLog.clock_out ? 'completed' : 'clocked_in');
      }
    }
  };

  useEffect(() => {
    setLoginTime(new Date().toLocaleTimeString());
    fetchLogs();
  }, []);

  const handleTimeIn = async () => {
    const time = new Date().toTimeString().slice(0, 5);

    const { error } = await supabase.from('time_logs').insert([
      {
        user_id: user.id,
        date: today,
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
    const start = new Date(`1970-01-01T${log.clock_in}`);
    const end = new Date(`1970-01-01T${time}`);
    const hours = ((end - start) / (1000 * 60 * 60)).toFixed(2);

    const { error } = await supabase
      .from('time_logs')
      .update({ clock_out: time, hours })
      .eq('id', log.id);

    if (!error) {
      fetchLogs();
      setTotalHours(hours);
      setStatus('completed');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white shadow-md p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Welcome, {user.email}</h2>
        <p>Login time: {loginTime}</p>
        <p>Status: {status === 'idle' ? 'Not clocked in yet' : status === 'clocked_in' ? 'Working' : 'Finished'}</p>

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

        {status === 'completed' && totalHours && (
          <div className="mt-4 text-green-600">
            <p>You worked {totalHours} hours today.</p>
            <p className="text-sm text-gray-500">⏳ Reset will be available on the next day.</p>
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