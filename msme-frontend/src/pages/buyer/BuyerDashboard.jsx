import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import {
  FaSearch, FaShoppingCart, FaUserCircle, FaBars, FaChevronLeft, FaChevronRight,
  FaMapMarkerAlt, FaStar, FaShoppingBag, FaTimes, FaExchangeAlt, FaHeart, FaRegHeart
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import BuyerNavbar from '../../components/BuyerNavbar'
import ScrollingBanner from '../../components/ScrollingBanner'

const ProductCard = ({ p, handleAddToCart, wishlistIds = [], toggleWishlist }) => {
  const [currentImg, setCurrentImg] = useState(0)
  const navigate = useNavigate()

  const nextImg = (e) => {
    e.stopPropagation()
    setCurrentImg((prev) => (prev + 1) % p.images.length)
  }

  const prevImg = (e) => {
    e.stopPropagation()
    setCurrentImg((prev) => (prev - 1 + p.images.length) % p.images.length)
  }

  return (
    <div
      onClick={() => navigate(`/product/${p._id}`, { state: { product: p } })}
      style={{ 
        background: 'white', 
        borderRadius: '32px',
        overflow: 'hidden', 
        border: '1px solid var(--border-soft)', 
        display: 'flex', 
        flexDirection: 'column', 
        cursor: 'pointer', 
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '320px', borderRadius: '28px', margin: '10px', overflow: 'hidden' }}>
        <img
          src={p.images[currentImg] || 'https://via.placeholder.com/400x500?text=No+Image'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt={p.name}
        />
        
        {/* Wishlist Overlay */}
        <div
          onClick={(e) => { e.stopPropagation(); toggleWishlist(p._id) }}
          style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            zIndex: 10,
            cursor: 'pointer'
          }}
        >
          {wishlistIds.includes(p._id) ? <FaHeart color="#ef4444" size={20} /> : <FaRegHeart color="white" size={20} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px 24px 24px' }}>
        <div style={{ 
          fontSize: '0.9rem', 
          fontWeight: 800, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          {p.category}
        </div>
        
        <h3 style={{ 
          fontSize: '1.375rem', 
          fontWeight: 800, 
          marginBottom: '8px',
          color: 'var(--text-main)'
        }}>
          {p.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <div style={{ background: '#F1F5F9', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <FaShoppingBag size={10} color="var(--text-main)" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>{p.seller?.businessName || 'MSME Direct'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Sora', sans-serif" }}>
              ₹{p.price.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <FaStar color="#FFB800" size={12} />
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>{p.rating || '4.8'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProductSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '32px', border: '1px solid var(--border-soft)', overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: '320px', margin: '10px', borderRadius: '28px' }}></div>
    <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton" style={{ height: '14px', width: '30%' }}></div>
      <div className="skeleton" style={{ height: '28px', width: '80%' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '40%' }}></div>
      <div style={{ marginTop: '10px' }}>
        <div className="skeleton" style={{ height: '48px', width: '100%', borderRadius: '12px' }}></div>
      </div>
    </div>
  </div>
)


export default function BuyerDashboard() {
  const { user, logout, location } = useAuth()
  const navigate = useNavigate()
  
  // Initialize from cache for "instant" feel
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_buyer_products')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(products.length === 0)
  const [category, setCategory] = useState('All')
  const [wishlistIds, setWishlistIds] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchWishlist()
  }, [search, category, location]) // Refetch when location changes

  const requestCounter = useRef(0)

  const fetchProducts = async () => {
    const requestId = ++requestCounter.current
    if (products.length === 0) setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category && category !== 'All') params.append('category', category)
      if (location) params.append('district', location)
      
      const { data } = await axios.get(`/api/products?${params.toString()}`)

      
      if (requestId === requestCounter.current) {
        const fetchedProducts = data.data || []
        setProducts(fetchedProducts)
        setLoading(false)
        
        if (!search && category === 'All') {
          if (fetchedProducts.length > 0) {
            localStorage.setItem('cached_buyer_products', JSON.stringify(fetchedProducts))
          } else {
            localStorage.removeItem('cached_buyer_products')
          }
        }
      }
    } catch (err) { 
      console.error("[Dashboard] Fetch Error:", err)
      if (requestId === requestCounter.current) {
        setLoading(false)
      }
    }
  }

  const handleAddToCart = async (productId, size) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1, size }, { withCredentials: true })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) { alert('Sign in to start shopping') }
  }

  const fetchWishlist = async () => {
    try {
      if (!user) return
      const { data } = await axios.get('/api/user/wishlist', { withCredentials: true })
      setWishlistIds(data.data.map(i => i._id))
    } catch (err) { console.error(err) }
  }

  const toggleWishlist = async (productId) => {
    try {
      if (!user) return alert('Please sign in to add to wishlist')
      await axios.post('/api/user/wishlist/toggle', { productId }, { withCredentials: true })
      setWishlistIds(prev =>
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <BuyerNavbar
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        currentSearch={search}
        currentCategory={category}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
        
        <ScrollingBanner products={products} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.925rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {category === 'All' ? (search ? `Results for "${search}"` : 'Our Best Collection') : `Latest in ${category}`}
            </h2>
            {(!loading || products.length > 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                Found {products.length} products {location ? `in ${location}` : 'curated for you'}.
              </p>
            )}
          </div>

        </div>


        {loading && products.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '32px', border: '1px solid var(--border-soft)' }}>
            <p style={{ fontSize: '1.375rem', color: 'var(--text-muted)', fontWeight: 600 }}>No matches found in {category}.</p>
            <button className="btn-outline" style={{ marginTop: '24px' }} onClick={() => { setCategory('All'); setSearch(''); }}>Back to Home</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
            {products.map(p => (
              <ProductCard 
                key={p._id} 
                p={p}
                handleAddToCart={handleAddToCart} 
                wishlistIds={wishlistIds} 
                toggleWishlist={toggleWishlist} 
              />
            ))}

          </div>
        )}
      </main>

    </div>
  )
}
