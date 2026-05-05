import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, Mail, FileText, Save, Camera } from 'lucide-react';

const BusinessProfile = () => {
  const [profile, setProfile] = useState({
    shopName: 'KRUSHI SEVA KENDRA',
    ownerName: 'Admin',
    gstin: '27AAAAA0000A1Z5',
    address: 'Main Road, Near Bus Stand, Pune, Maharashtra',
    mobile: '9876543210',
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
      style={{ padding: '40px' }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Store size={32} /> Business Profile
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Manage your shop details and settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column - Logo & Stats */}
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', background: 'white' }}>
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
        <div className="glass-card" style={{ padding: '40px', background: 'white' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Store size={14} /> Shop Name
                </label>
                <input 
                  type="text" 
                  name="shopName"
                  value={profile.shopName}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="Enter shop name"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <FileText size={14} /> GSTIN Number
                </label>
                <input 
                  type="text" 
                  name="gstin"
                  value={profile.gstin}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="Enter GSTIN"
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
                className="input-field" 
                rows="3"
                placeholder="Enter full address"
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Phone size={14} /> Contact Number
                </label>
                <input 
                  type="text" 
                  name="mobile"
                  value={profile.mobile}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
