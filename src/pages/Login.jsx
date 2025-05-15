import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const customMessage =
        error.message === 'missing email or phone'
          ? 'Please enter your email.'
          : error.message === 'invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message;
      setError(customMessage);
    } else onLogin(data.session);
  };

  const handleForgotPassword = () => {
    alert('Forgot password feature is not available. Please contact the administrator.');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/corporate-bg.jpg')" }}
    >
      <div className="flex w-full max-w-4xl backdrop-blur-md bg-white/20 rounded-lg overflow-hidden">
        {/* Left side logo */}
        <div className="w-full md:w-1/2 p-8 text-white text-center flex flex-col justify-center">
          <img
            src="/images/logo.png"
            alt="Time Tracker Logo"
            className="w-48 h-48 object-contain mx-auto mb-8"
          />
          <h2 className="text-2xl font-bold">Time Tracking System</h2>
          <p className="text-sm mt-2">Built to Work. Designed for You.</p>
        </div>

        {/* Right side login form */}
        <div className="w-full md:w-1/2 bg-white bg-opacity-90 p-8">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-xl font-bold text-blue-700">Login</h1>
          </div>

          {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

          <input
            className="w-full border p-2 mb-3 rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border p-2 mb-3 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <button type="button" onClick={handleForgotPassword} className="text-blue-500 hover:underline">
              Forgot Password
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
