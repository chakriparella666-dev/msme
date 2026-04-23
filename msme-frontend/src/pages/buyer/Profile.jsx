import React, { useState, useEffect } from 'react'
import axios from 'axios'
import BuyerNavbar from '../../components/BuyerNavbar'
import { useAuth } from '../../context/AuthContext'
import { FaUserEdit, FaEnvelope, FaIdBadge, FaCalendarAlt, FaSave, FaSync } from 'react-icons/fa'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState({ ...user })
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  
  useEffect(() => {
    if (user) setProfile({ ...user })
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check for 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large! Maximum limit is 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setUploading(true)
    try {
      const payload = { 
        ...profile,
        profileImage: preview || profile.profileImage
      }
      const { data } = await axios.put('/api/auth/update-profile', payload, { withCredentials: true })
      if (data.success) {
        setUser(data.user)
        setIsEditing(false)
        setPreview(null)
        alert('Profile updated successfully!')
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setUploading(false)
    }
  }

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '16 April 2026'

  return (
    <div style={{ background: '#f8f9fc', minHeight: '100vh', paddingBottom: '80px' }}>
      <BuyerNavbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Premium Header Card - Full Width Black */}
        <div style={{ 
          background: '#000', 
          padding: '80px 40px', 
          textAlign: 'center', 
          color: 'white',
          position: 'relative',
          marginBottom: '0'
        }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 32px' }}>
            <img 
              src={preview || profile.profileImage || profile.avatar || 'https://via.placeholder.com/150'} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} 
            />
            <label style={{ 
              position: 'absolute', bottom: '10px', right: '10px', 
              background: 'white', color: '#000', width: '40px', height: '40px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}>
              <FaUserEdit size={18} />
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
            {profile.name || 'CHAKRI PARELLA'}
          </h1>
          <div style={{ 
            fontSize: '0.9rem', 
            fontWeight: 800, 
            color: '#94A3B8', 
            textTransform: 'uppercase', 
            letterSpacing: '3px'
          }}>
            PREMIUM ACCOUNT
          </div>
        </div>

        {/* Content Section */}
        <div style={{ background: 'white', padding: '60px 40px', borderTop: '1px solid #eee' }}>
          
          {/* Info Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
            
            {/* Name Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ background: '#F1F5F9', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                <FaIdBadge size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>ACCOUNT NAME</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>{profile.name || 'CHAKRI PARELLA'}</div>
              </div>
            </div>

            {/* Email Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ background: '#F1F5F9', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                <FaEnvelope size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>EMAIL CONTACT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{profile.email || 'chakriparella666@gmail.com'}</div>
              </div>
            </div>

            {/* Join Date Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ background: '#F1F5F9', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                <FaCalendarAlt size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>JOIN DATE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{joinDate}</div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
            <p style={{ color: '#94A3B8', fontSize: '1rem', fontWeight: 600 }}>Manage your personal details and security.</p>
            <button 
              onClick={handleSave} 
              disabled={uploading}
              style={{ 
                background: '#000', color: 'white', border: 'none', 
                padding: '16px 40px', borderRadius: '12px', fontWeight: 800, 
                fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {uploading ? 'Updating...' : 'Update Details'}
            </button>
          </div>

          {preview && (
            <div style={{ marginTop: '40px', background: '#F8FAFC', padding: '24px', borderRadius: '24px', display: 'inline-block' }}>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>New Profile Preview</label>
               <img src={preview} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
