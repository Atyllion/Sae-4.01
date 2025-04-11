import React, { useState } from 'react';
import { loginUser } from '../../loader/loader';

export default function LogInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Email:', email);
    console.log('Password:', password);

    try {
      const response = await loginUser({ email, password });

      if (response.ok) {
        const data = await response.json();
        console.log('Token:', data.token);
        setSuccess('Login successful!');
        localStorage.setItem('token', data.token);
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (response.status === 401) {
          setError('Invalid email or password');
        } else if (response.status === 403) {
          setError('Account is banned or access denied');
        } else {
          setError(`Login failed with status: ${response.status}`);
        }
        console.error('Login error details:', errorData);
      }
    } catch (err) {
      setError(`${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error logging in:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 rounded-md w-full">
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}
      <label className="flex flex-col">
        Email
        <input
          required
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded-md border border-gray-300 text-bg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-fg fg-bg"
        />
      </label>
      <label className="flex flex-col">
        Password
        <input
          required
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded-md border border-gray-300 text-fg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <button
        type="submit"
        className="p-2 rounded-md font-bold cursor-pointer hover:bg-fg hover:text-bg bg-bg text-white transition-all duration-200"
      >
        Log in
      </button>
    </form>
  );
}