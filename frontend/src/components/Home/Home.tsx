import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { fetchUserToken } from '../../loader/loader';

// importer UI
import NewPost from '../../ui/NewPost/NewPost';

// importer Component
import Feed from '../Feed/Feed';
import NavBar from '../NavBar/NavBar';
import Login from '../Log-in/Log-in';
import Signin from '../Sign-in/Sign-in';
import Backoffice from '../Backoffice/Backoffice';

export default function Home() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserToken()
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to fetch user data');
        })
        .then((data) => {
          setIsAuthenticated(true);
          setIsVerified(data.user.isVerified);
          if (!data.user.isVerified) {
            alert('Your account is not verified. Please verify your account to post.');
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error.message);
          setIsAuthenticated(false);
          setIsVerified(false);
        });
    } else {
      setIsAuthenticated(false);
      setIsVerified(false);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <div className='flex flex-col md:flex-row'>
              <div className='flex-1'></div>
              {isVerified ? <NewPost /> : <p className='text-center text-red-500 font-semibold mt-4'>Your account is not verified. You cannot post.</p>}
              <Feed />
            </div>
            <NavBar />
          </>
        } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/backoffice" element={<Backoffice />} />
      </Routes>
    </Router>
  );
}