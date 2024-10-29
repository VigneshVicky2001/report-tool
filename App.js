import logo from './logo.svg';
import './App.css';
import Content from './Components/content';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Start from './Components/Start';
import Login from './Components/Login';
import { Box } from '@mui/material';
import { AuthProvider } from './Components/AuthContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
          <BrowserRouter>
            <Header />
              <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/start' index element={<Start />} />
                <Route path="/content" element={<Content />} />
              </Routes>
            <Footer />
            </BrowserRouter>
          </Box>
      </AuthProvider>
    </div>
  );
}

export default App;
