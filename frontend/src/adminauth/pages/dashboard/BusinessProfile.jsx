import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, Mail, FileText, Save, Camera, User } from 'lucide-react';

const BusinessProfile = () => {
  const [profile, setProfile] = useState({
    shopName: 'KRUSHI SEVA KENDRA',
    ownerName: 'Admin',
    gstin: '27AAAAA0000A1Z5',
    address: 'Main Road, Near Bus Stand, Pune, Maharashtra',
    mobile: '9876543210',
    altMobile: '',
    email: 'contact@krushiseva.com',
    website: 'www.krushiseva.com'
  });

  const [logo, setLogo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, we would send this to the backend
    alert('Business Profile Updated Successfully!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agro-container"
      style={{ padding: '20px' }}
    >
      <style>
        {`
          .business-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }

          @media (max-width: 1024px) {
            .business-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
            .business-header {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 10px;
            }
            .form-row {
              grid-template-columns: 1fr;
            }
            .save-btn-container {
              justify-content: center !important;
            }
            .save-btn-container button {
              width: 100%;
            }
          }
        `}
      </style>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }} className="business-header">
          <Store size={32} /> Business Profile
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Manage your shop details and settings</p>
      </div>

      <div className="business-grid">
        {/* Left Column - Logo & Stats */}
        <div className="agro-unified-card" style={{ padding: '30px', textAlign: 'center', background: 'white' }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            background: 'var(--background)', 
            margin: '0 auto 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            border: '2px dashed var(--primary)',
            overflow: 'hidden'
          }}>
            {logo ? (
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Store size={60} color="var(--primary)" />
            )}
            <label style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '10px', 
              background: 'var(--primary)', 
              width: '35px', 
              height: '35px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <Camera size={18} />
              <input type="file" style={{ display: 'none' }} onChange={(e) => setLogo(URL.createObjectURL(e.target.files[0]))} />
            </label>
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{profile.shopName}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>GSTIN: {profile.gstin}</p>
          
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: 'var(--primary-soft)', padding: '15px', borderRadius: '12px', textAlign: 'left' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-muted)' }}>System Status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details Form */}
        <div className="agro-unified-card" style={{ padding: '30px', background: 'white' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Store size={14} /> Shop Name
                </label>
                <input 
                  type="text" 
                  name="shopName"
                  value={profile.shopName}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="Enter shop name"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <User size={14} /> Owner Name
                </label>
                <input 
                  type="text" 
                  name="ownerName"
                  value={profile.ownerName}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="Enter owner name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <FileText size={14} /> GSTIN Number
                </label>
                <input 
                  type="text" 
                  name="gstin"
                  value={profile.gstin}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="Enter GSTIN"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Store size={14} /> Website (Optional)
                </label>
                <input 
                  type="text" 
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="www.example.com"
                />
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                <MapPin size={14} /> Shop Address
              </label>
              <textarea 
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="form-control" 
                rows="3"
                placeholder="Enter full address"
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Phone size={14} /> Contact Number
                </label>
                <input 
                  type="text" 
                  name="mobile"
                  value={profile.mobile}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Phone size={14} /> Alternate Mobile
                </label>
                <input 
                  type="text" 
                  name="altMobile"
                  value={profile.altMobile}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="Enter alternate number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="form-control" 
                  placeholder="Enter email"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Camera size={14} /> Shop Image / Logo
                </label>
                <div style={{ position: 'relative' }}>
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '10px 15px', 
                      border: '2px dashed var(--border)', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      transition: 'all 0.3s ease',
                      background: '#fafafa'
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-soft)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fafafa'; }}
                  >
                    <Camera size={18} color="var(--primary)" />
                    <span>{logo ? 'Change Shop Logo' : 'Upload Shop Logo'}</span>
                    <input 
                      type="file" 
                      onChange={(e) => setLogo(URL.createObjectURL(e.target.files[0]))}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="save-btn-container">
              <button type="submit" className="btn-agro btn-primary">
                <Save size={18} /> Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessProfile;
