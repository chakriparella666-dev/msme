import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaSearch, FaShoppingCart, FaUserCircle, FaBars, FaChevronRight, FaMapMarkerAlt, FaTimes, FaExchangeAlt, FaShoppingBag, FaCrosshairs, FaHeart, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

import { fetchStates, fetchDistricts } from '../services/locationService'

export default function BuyerNavbar({ onSearchChange, onCategoryChange, currentSearch, currentCategory }) {
  const { user, logout, buyerLocation, setBuyerLocation } = useAuth()
  const navigate = useNavigate()
  
  const [localSearch, setLocalSearch] = useState(currentSearch || '')
  const [cart, setCart] = useState({ items: [] })
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedStateForLoc, setSelectedStateForLoc] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [apiStates, setApiStates] = useState([])
  const [apiDistricts, setApiDistricts] = useState([])

  useEffect(() => {
    fetchStates().then(setApiStates)
  }, [])

  useEffect(() => {
    if (selectedStateForLoc) fetchDistricts(selectedStateForLoc).then(setApiDistricts)
    else setApiDistricts([])
  }, [selectedStateForLoc])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        if (res.data && res.data.address) {
          const addr = res.data.address
          const resolvedCity = addr.city || addr.town || addr.village || addr.county || addr.suburb || ''
          
          if (addr.state) {
            setSelectedStateForLoc(addr.state)
            if (resolvedCity) {
              setBuyerLocation(resolvedCity)
              setShowLocationModal(false)
            }
          } else {
            if (resolvedCity) {
              setBuyerLocation(resolvedCity)
              setShowLocationModal(false)
            }
          }
        }
      } catch (err) {
        console.error('Geo error', err)
      } finally {
        setGettingLocation(false)
      }
    }, (err) => {
      alert('Unable to retrieve your location. Check browser permissions.')
      setGettingLocation(false)
    })
  }

  useEffect(() => {
    fetchCategories()
    fetchCart()
    const handleCartUpdate = () => fetchCart()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])
  
  useEffect(() => {
    if (currentSearch !== undefined) setLocalSearch(currentSearch)
  }, [currentSearch])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/products/categories')
      setCategories(data.data)
    } catch (err) { console.error(err) }
  }

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/api/cart', { withCredentials: true })
      setCart(data.data)
    } catch (err) { console.error(err) }
  }
  
  const handleSearchCommit = () => {
    if (onSearchChange) {
      onSearchChange(localSearch)
    } else {
      navigate('/buyer') // Ideally would pass search query
    }
  }

  const handleCategorySelect = (cat) => {
    if (onCategoryChange) {
      onCategoryChange(cat)
      if (onSearchChange) { onSearchChange(''); setLocalSearch(''); }
    } else {
      navigate('/buyer')
    }
    setSidebarOpen(false)
  }

  const handleHomeClick = () => {
    if (onCategoryChange) onCategoryChange('All')
    if (onSearchChange) onSearchChange('')
    setLocalSearch('')
    navigate('/buyer')
  }

  const activeCategory = currentCategory || 'All'

  return (
    <>
      <nav className="buyer-nav" style={{ 
        background: '#000000', 
        height: '68px', 
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
        color: 'white'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }} 
          onClick={handleHomeClick}
        >
          <div style={{ background: 'white', width: '32px', height: '32px', borderRadius: '7.2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaShoppingBag size={14} color="#000" />
          </div>
          <span style={{ 
            fontSize: '1.35rem', 
            fontWeight: 800, 
            color: 'white', 
            letterSpacing: '-0.5px', 
            fontFamily: "'Sora', sans-serif" 
          }}>
            MSME<span style={{ color: '#94A3B8', fontWeight: 400 }}>Market</span>
          </span>
        </div>

        {/* Search Bar Center */}
        <div className="nav-search-container" style={{ 
          maxWidth: '585px', 
          flex: 1, 
          margin: '0 36px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '14.4px',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          height: '47px'
        }}>
          <input 
            type="text" 
            className="nav-search-input" 
            placeholder="Search products or business names..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              if (onSearchChange) onSearchChange(e.target.value)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
            style={{ 
              background: 'transparent', 
              padding: '10px 18px', 
              fontSize: '1rem',
              color: 'white',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontWeight: 600
            }}
          />
          <button 
            className="nav-search-btn" 
            onClick={handleSearchCommit} 
            style={{ background: 'transparent', color: '#94A3B8', padding: '0 16px', border: 'none', cursor: 'pointer' }}
          >
            <FaSearch size={14} />
          </button>
        </div>

        {/* Right Section Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          
          {/* Delivery Section */}
          <div 
            style={{ cursor: 'pointer', textAlign: 'left' }}
            onClick={() => setShowLocationModal(true)}
          >
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1.8px' }}>Delivery to</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5.4px', color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>
              <FaMapMarkerAlt size={12.6} color="white" /> {buyerLocation || 'Set Location'}
            </div>
          </div>

            {/* Account Section */}
            <div 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              onClick={() => setSidebarOpen(true)}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.8px' }}>ACCOUNT</div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'white', textTransform: 'uppercase' }}>{user?.name ? user.name.split(' ')[0] : 'GUEST'}</div>
              </div>
              <div style={{ width: '36px', height: '36px' }}>
                {user?.profileImage || user?.avatar ? (
                  <img 
                    src={user.profileImage || user.avatar} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.2)' }} 
                    alt="Profile"
                  />
                ) : (
                  <FaUserCircle size={40} color="#475569" />
                )}
              </div>
            </div>

          {/* Wishlist */}
          <div onClick={() => navigate('/wishlist')} style={{ cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
            <FaHeart size={18} />
          </div>

          {/* Bag Button */}
          <div 
            onClick={() => navigate('/cart')} 
            style={{ 
              position: 'relative', 
              cursor: 'pointer',
              background: 'white',
              color: '#000',
              padding: '9px 20px',
              borderRadius: '89px',
              display: 'flex',
              alignItems: 'center',
              gap: '10.8px',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontWeight: 800,
              fontSize: '1rem'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FaShoppingCart size={16} />
            Bag
            <span style={{ 
              background: '#0F172A', 
              color: 'white', 
              borderRadius: '50%', 
              width: '20px', 
              height: '20px', 
              fontSize: '11px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800
            }}>
              {cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
            </span>
          </div>
        </div>
      </nav>

      {/* Subnav */}
      <div className="buyer-subnav" style={{ alignItems: 'center', gap: '20px', padding: '12px 40px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRight: '1.5px solid #eee', paddingRight: '18px', color: 'var(--primary)', fontWeight: 800, fontSize: '1.05rem' }} 
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars /> All
        </div>
        
        <div 
          className={`subnav-link ${activeCategory === 'All' ? 'active' : ''}`} 
          onClick={() => handleCategorySelect('All')}
          style={{ 
            color: activeCategory === 'All' ? 'var(--primary)' : 'inherit', 
            borderBottom: activeCategory === 'All' ? '2.5px solid var(--primary)' : 'none',
            whiteSpace: 'nowrap',
            fontSize: '1.05rem',
            fontWeight: 700,
            padding: '4px 0'
          }}
        >
          All Products
        </div>

        <div style={{ display: 'flex', gap: '28px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <div 
              key={cat} 
              className={`subnav-link ${activeCategory === cat ? 'active' : ''}`} 
              onClick={() => handleCategorySelect(cat)}
              style={{ 
                color: activeCategory === cat ? 'var(--primary)' : 'inherit', 
                borderBottom: activeCategory === cat ? '2.5px solid var(--primary)' : 'none',
                whiteSpace: 'nowrap',
                fontSize: '1.05rem',
                fontWeight: 700,
                padding: '4px 0'
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(4px)', zIndex: 1999, 
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          opacity: isSidebarOpen ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      ></div>

      {/* Premium Sidebar Drawer */}
      <div 
        className={`buyer-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{ 
          position: 'fixed', top: 0, left: 0, right: 'auto', bottom: 0, width: '340px', 
          background: 'white', zIndex: 2000, 
          boxShadow: '20px 0 60px rgba(0,0,0,0.1)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex', flexDirection: 'column',
          willChange: 'transform'
        }}
      >
        <div style={{ background: '#000000', padding: '24px 32px 20px', color: 'white', position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }} 
            style={{ 
              position: 'absolute', top: '16px', right: '16px', 
              background: 'rgba(255,255,255,0.08)', border: 'none', 
              color: 'white', cursor: 'pointer', width: '28px', height: '28px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <FaTimes size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <FaUserCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '2px' }}>Account</div>
          <div style={{ fontSize: '1.21rem', fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{user?.name || 'Guest User'}</div>
        </div>

        <div style={{ padding: '20px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Orders', icon: <FaShoppingBag />, path: '/my-orders' },
              { label: 'My Bag', icon: <FaShoppingCart />, path: '/cart' },
              { label: 'Wishlist', icon: <FaHeart />, path: '/wishlist' },
              { label: 'Addresses', icon: <FaMapMarkerAlt />, path: '/addresses' },
              { label: 'Settings', icon: <FaUserCircle />, path: '/profile' },
            ].map(item => (
              <div 
                key={item.label} 
                onClick={() => { setSidebarOpen(false); navigate(item.path) }}
                style={{ 
                  padding: '12px 0', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  fontWeight: 600, color: 'var(--text-main)', fontSize: '0.935rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </span>
                <FaChevronRight size={8} color="#CBD5E1" />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: '#F8FAFC', border: '1px dashed var(--border)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExchangeAlt size={10} color="var(--primary)" /> Merchant Mode
            </h4>
            <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Switch to manage inventory.</p>
            <button 
              onClick={() => { setSidebarOpen(false); navigate('/seller'); }} 
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
            >
              Go to Seller Hub
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button 
              onClick={() => { logout(); setSidebarOpen(false); }}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.935rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}
            >
              <FaSignOutAlt size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowLocationModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Select Delivery Location</h2>
              <FaTimes style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowLocationModal(false)} />
            </div>

            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              style={{ width: '100%', background: gettingLocation ? '#f1f5f9' : '#EFF6FF', color: gettingLocation ? '#94a3b8' : '#2563EB', border: `1.5px solid ${gettingLocation ? '#e2e8f0' : '#3B82F6'}`, padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: gettingLocation ? 'default' : 'pointer', fontWeight: 700, marginBottom: '24px', transition: 'all 0.3s ease' }}
            >
              <FaCrosshairs color={gettingLocation ? '#94a3b8' : '#3B82F6'} /> {gettingLocation ? 'Locating via GPS...' : 'Auto-detect my location'}
            </button>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>-- OR SELECT MANUALLY --</div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>1. Select State</label>
              <select 
                value={selectedStateForLoc} 
                onChange={(e) => { setSelectedStateForLoc(e.target.value) }}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
              >
                <option value="">-- Choose State --</option>
                {apiStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {selectedStateForLoc && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>2. Select District</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {apiDistricts.map(dist => (
                    <button 
                      key={dist}
                      onClick={() => { setLocation(dist); setShowLocationModal(false); }}
                      style={{ padding: '12px', background: location === dist ? 'var(--primary)' : '#f8fafc', color: location === dist ? 'white' : 'var(--text-main)', border: location === dist ? 'none' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', textAlign: 'left' }}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
