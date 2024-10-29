import React from 'react';
import { useAuth } from './AuthContext';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert(`Welcome!`);
      navigate('/start');
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      {user ? (
        <h2>You are already logged in</h2>
      ) : (
        <>
          <h2>Login</h2>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        </>
      )}
    </div>
  );
};

export default Login;
