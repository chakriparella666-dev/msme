import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const DEFAULT_BANNERS = [
  { id: 'def1', image: '/banner1.png', title: 'MSME Marketplace', subtitle: 'Supporting Local Business', description: 'Discover unique products from boutique sellers across India.', tag: 'Featured' },
  { id: 'def2', image: '/banner2.png', title: 'Handcrafted Quality', subtitle: 'Artisanal Excellence', description: 'Every product tells a story of craftsmanship and dedication.', tag: 'Handmade' }
]

export default function ScrollingBanner({ products = [] }) {
  const [current, setCurrent] = useState(0)

  // Derive dynamic banners from products
  const dynamicBanners = products.length > 0 
    ? products.slice(0, 5).map((p, idx) => ({
      id: p._id,
      image: p.images?.[0] || '/banner1.png',
      title: p.name,
      subtitle: `${p.category} from ${p.seller?.businessName || p.district || 'MSME'}`,
      description: p.description?.length > 100 ? p.description.substring(0, 100) + '...' : p.description || 'Premium quality MSME product.',
      tag: idx === 0 ? 'Latest Arrival' : 'Featured Product',
      link: `/product/${p._id}`
    }))
    : DEFAULT_BANNERS

  const activeBanners = dynamicBanners

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [activeBanners.length])

  const next = () => setCurrent((prev) => (prev + 1) % activeBanners.length)
  const prev = () => setCurrent((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  
  if (activeBanners.length === 0) return null;

  return (
    <div className="scrolling-banner" style={{ 
      position: 'relative', 
      height: '500px', 
      width: '100%', 
      overflow: 'hidden', 
      borderRadius: '24px',
      marginBottom: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: `translateX(-${current * 100}%)`
      }}>
        {activeBanners.map((b) => (
          <div key={b.id} style={{ 
            minWidth: '100%', 
            height: '100%', 
            position: 'relative' 
          }}>
            <img 
              src={b.image} 
              alt={b.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => { e.target.src = '/banner1.png' }}
            />
            {/* Premium Neutral Overlay */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%)' 
            }} />
            
            {/* Content */}
            <div style={{ 
              position: 'absolute', 
              left: '80px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'white',
              maxWidth: '600px'
            }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.12)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-block', 
                padding: '6px 14px', 
                borderRadius: '8px', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '1.2px',
                marginBottom: '16px',
                color: 'white'
              }}>
                {b.tag}
              </div>
              <h1 style={{ 
                fontSize: '3.6rem', 
                fontWeight: 900, 
                margin: '0 0 10px 0', 
                lineHeight: 1,
                fontFamily: "'Sora', sans-serif",
                letterSpacing: '-1.5px'
              }}>
                {b.title}
              </h1>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                margin: '0 0 16px 0',
                color: 'white',
                opacity: 0.9,
                letterSpacing: '0.5px'
              }}>
                {b.subtitle}
              </h3>
              <p style={{ 
                fontSize: '1.05rem', 
                opacity: 0.7, 
                marginBottom: '32px',
                lineHeight: 1.6
              }}>
                {b.description}
              </p>
              <button 
                onClick={() => b.link && (window.location.href = b.link)}
                style={{ 
                  padding: '14px 44px', 
                  fontSize: '0.95rem', 
                  borderRadius: '12px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.1)'
                }}
              >
                Explore Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeBanners.length > 1 && (
        <>
          {/* Controls */}
          <button 
            onClick={prev} 
            style={{ 
              position: 'absolute', 
              left: '30px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <FaChevronLeft size={20} />
          </button>
          <button 
            onClick={next} 
            style={{ 
              position: 'absolute', 
              right: '30px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <FaChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div style={{ 
            position: 'absolute', 
            bottom: '30px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '12px' 
          }}>
            {activeBanners.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrent(i)}
                style={{ 
                  width: i === current ? '30px' : '10px', 
                  height: '10px', 
                  borderRadius: '5px', 
                  background: i === current ? 'var(--primary)' : 'rgba(255,255,255,0.3)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
