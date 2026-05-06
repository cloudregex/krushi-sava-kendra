import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import authService from '../../services/authService';
import logo from '../../../assets/logo.png';
import '../../../mastermodel/styles/MasterModel.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else {
      const checkAdmin = async () => {
        const exists = await authService.checkAdminExists();
        if (!exists) {
          navigate('/register-admin');
        }
      };
      checkAdmin();
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f1f5f9',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        background: 'white', 
        borderRadius: '24px', 
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ 
            width: '90px', 
            height: '90px', 
            background: 'white', 
            borderRadius: '20px', 
            margin: '0 auto 15px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
            border: '1px solid #f1f5f9'
          }}>
            <img src={logo} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          </div>
          
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: '800', 
            color: '#10b981', 
            margin: '0 0 5px 0',
            letterSpacing: '-0.5px'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            color: '#475569', 
            fontSize: '14px', 
            fontWeight: '500',
            margin: 0 
          }}>
            Sign in to manage your Kendra
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label style={{ 
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '10px', 
              display: 'block' 
            }}>
              Email Address
            </label>
            <input 
              type="email" 
              className="form-control" 
              style={{ 
                height: '55px', 
                borderRadius: '15px', 
                fontSize: '15px', 
                padding: '0 20px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                transition: 'all 0.3s'
              }}
              placeholder="e.g. admin@krushi.com"
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{ 
              fontSize: '15px', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '10px', 
              display: 'block' 
            }}>
              Password
            </label>
            <input 
              type="password" 
              className="form-control" 
              style={{ 
                height: '55px', 
                borderRadius: '15px', 
                fontSize: '15px', 
                padding: '0 20px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                transition: 'all 0.3s'
              }}
              placeholder="Enter your password"
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px 15px', 
              background: '#fff1f2', 
              border: '1px solid #fecdd3', 
              borderRadius: '12px', 
              color: '#e11d48', 
              fontSize: '13px', 
              fontWeight: '600' 
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-agro btn-primary" style={{ 
            height: '55px', 
            borderRadius: '15px', 
            fontSize: '16px', 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '10px',
            boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            color: 'white'
          }}>
            <LogIn size={20} />
            Login
          </button>
        </form>

        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#64748b',
          fontWeight: '500'
        }}>
          Only users created by Admin can login.
        </div>
      </div>
    </div>
  );
};

export default Login;
