import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TimeTracker = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('Logged Out');
  const [activeLog, setActiveLog] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
        setStatus('Logged In');
      } else {
        setStatus('Logged Out');
      }
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTimeIn = async () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);

    const { error } = await supabase.from('time_logs').insert([
      {
        user_id: user.id,
        date,
        clock_in: time,
      },
    ]);

    if (!error) {
      fetchLogs();
      setStatus('Logged In');
    }
  };

  const handleTimeOut = async () => {
    const time = new Date().toTimeString().slice(0, 8);
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
      setStatus('Logged Out');
    }
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString();
  };

  const getFirstTimeIn = (logs, date) => {
    const entry = logs.find((log) => log.date === date && log.clock_in);
    return entry?.clock_in || '—';
  };

  const getLastTimeOut = (logs, date) => {
    const outs = logs.filter((log) => log.date === date && log.clock_out);
    return outs.length ? outs[outs.length - 1].clock_out : '—';
  };

  const getTotalHours = (logs, date) => {
    const total = logs
      .filter((log) => log.date === date && log.hours)
      .reduce((sum, log) => sum + parseFloat(log.hours), 0);
    return total.toFixed(2);
  };

  const uniqueDates = [...new Set(entries.map((e) => e.date))];
  const firstName = user.email.split('@')[0];

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white p-6"
      style={{ backgroundImage: "url('/images/corporate-bg.jpg')" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Top Panel */}
        <div className="backdrop-blur-md bg-white/20 text-center text-white rounded-lg p-8 mb-6 shadow-md">
          <h1 className="text-2xl font-bold mb-2">Welcome, {firstName}</h1>
          <p className="text-sm mb-2">Status: {status}</p>
          <p className="text-5xl font-bold my-4">{formatTime()}</p>
          {status === 'Logged Out' ? (
            <button
              onClick={handleTimeIn}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
            >
              Time In
            </button>
          ) : (
            <button
              onClick={handleTimeOut}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded"
            >
              Time Out
            </button>
          )}
        </div>

        {/* Lower Log Section */}
        <div className="backdrop-blur-md bg-white/20 rounded-lg p-6 overflow-auto text-sm">
          <table className="w-full table-fixed text-white">
            <thead className="border-b border-white">
              <tr>
                <th className="text-left pb-2 w-1/3">Date</th>
                <th className="text-left pb-2 w-1/3">First Time In</th>
                <th className="text-left pb-2 w-1/3">Last Time Out</th>
                <th className="text-left pb-2 w-1/3">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {uniqueDates.map((date, idx) => (
                <tr key={idx} className="border-t border-white">
                  <td className="py-2 font-semibold whitespace-nowrap">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2">{getFirstTimeIn(entries, date)}</td>
                  <td className="py-2">{getLastTimeOut(entries, date)}</td>
                  <td className="py-2">{getTotalHours(entries, date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
