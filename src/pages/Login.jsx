import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else onLogin(data.session);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h1 className="text-xl font-bold">Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="w-full border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white w-full py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
