import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { FaStar, FaShoppingCart, FaBolt, FaArrowLeft, FaCheck, FaShieldAlt, FaTruck, FaUndo, FaShoppingBag, FaHeart, FaRegHeart } from 'react-icons/fa'
import BuyerNavbar from '../../components/BuyerNavbar'

// Inline toast — no browser alert() ever
function Toast({ message, type }) {
  if (!message) return null
  const bg = type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#eff6ff'
  const color = type === 'error' ? '#dc2626' : type === 'success' ? '#166534' : '#1d4ed8'
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', background: bg, color, padding: '14px 20px', borderRadius: '12px', fontWeight: 700, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: '340px', animation: 'slideIn 0.3s ease' }}>
      {message}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [product, setProduct] = useState(state?.product || null)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(!state?.product)
  const [addingToCart, setAddingToCart] = useState(false)
  const [added, setAdded] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [isWished, setIsWished] = useState(false)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 3000)
  }

  useEffect(() => { setAdded(false) }, [selectedSize, quantity])
  useEffect(() => { 
    // Always fetch fresh data but don't set loading if we have state
    fetchProduct() 
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`)
      setProduct(data.data)
      const firstInStock = data.data.sizes.find(s => s.stock > 0)
      if (firstInStock) setSelectedSize(firstInStock.size)
      
      // Also check wishlist status for user
      try {
        const wishRes = await axios.get('/api/user/wishlist', { withCredentials: true })
        if (wishRes.data.data.some(w => w._id === id || w === id)) setIsWished(true)
      } catch (err) { /* Not logged in or error */ }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleWishlist = async () => {
    try {
      await axios.post('/api/user/wishlist/toggle', { productId: id }, { withCredentials: true })
      setIsWished(!isWished)
      showToast(isWished ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'success')
    } catch (err) {
      showToast('Please log in to add to wishlist', 'error')
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSize) return showToast('Please select a size first', 'error')
    const sizeStock = product.sizes.find(s => s.size === selectedSize)?.stock || 0
    if (sizeStock === 0) return showToast(`Size ${selectedSize} is out of stock`, 'error')
    setAddingToCart(true)
    try {
      await axios.post('/api/cart/add', { productId: id, quantity, size: selectedSize }, { withCredentials: true })
      setAdded(true)
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to cart. Please log in.'
      showToast(msg, 'error')
    }
    finally { setAddingToCart(false) }
  }

  const handleBuyNow = async () => {
    if (!selectedSize) return showToast('Please select a size first', 'error')
    const sizeStock = product.sizes.find(s => s.size === selectedSize)?.stock || 0
    if (sizeStock === 0) return showToast(`Size ${selectedSize} is out of stock`, 'error')
    try {
      await axios.post('/api/cart/add', { productId: id, quantity, size: selectedSize }, { withCredentials: true })
      navigate('/checkout')
    } catch (err) {
      const msg = err.response?.data?.message || 'Please log in to continue.'
      showToast(msg, 'error')
    }
  }

  // Cap quantity at selected size stock
  const selectedSizeStock = selectedSize ? (product?.sizes?.find(s => s.size === selectedSize)?.stock || 0) : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #ddd', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  )

  if (!product) return <div style={{ textAlign: 'center', padding: '80px' }}>Product not found.</div>

  const totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0)

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <BuyerNavbar />
      <Toast message={toast.message} type={toast.type} />

      {/* Breadcrumb Nav */}
      <div style={{ padding: '20px 60px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
        <button onClick={() => navigate('/buyer')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaArrowLeft size={9} /> STORE
        </button>
        <span style={{ color: '#E2E8F0' }}>/</span>
        <span style={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{product.category}</span>
        <span style={{ color: '#E2E8F0' }}>/</span>
        <span style={{ fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '10px auto 40px', padding: '0 60px', display: 'grid', gridTemplateColumns: '380px 1fr', gap: '120px' }}>
        {/* Left: Image Gallery */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: '0px', overflow: 'hidden', padding: '0', textAlign: 'center' }}>
            <img
              src={product.images[selectedImg] || 'https://via.placeholder.com/800?text=No+Image'}
              style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain', margin: '0 auto' }}
              alt={product.name}
              loading="eager"
              onError={e => { e.target.src = 'https://via.placeholder.com/800?text=Error' }}
            />
          </div>
          
          {/* Wishlist Floating Right Centered in Gap */}
          <div 
            onClick={toggleWishlist}
            style={{ 
              position: 'absolute', top: '20px', right: '-85px', zIndex: 10, 
              background: 'white', borderRadius: '50%', width: '56px', height: '56px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.1)', cursor: 'pointer' 
            }}
          >
            {isWished ? <FaHeart color="#000" size={20} /> : <FaRegHeart color="#000" size={20} />}
          </div>

          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px', overflowX: 'auto', paddingBottom: '12px' }}>
              {product.images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImg(i)}
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${i === selectedImg ? 'var(--text-main)' : 'transparent'}`,
                    transition: 'var(--transition)',
                    flexShrink: 0
                  }}
                >
                  <img 
                    src={img} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    loading="lazy" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div style={{ padding: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
             <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
             <div style={{ background: '#FFF7ED', color: '#C2410C', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                <FaStar color="#F59E0B" size={10} /> 4.5
             </div>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '2px', color: 'var(--text-main)', textTransform: 'lowercase' }}>{product.name}</h1>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 600 }}>
            Sold by <strong style={{ color: 'var(--text-main)', fontWeight: 800 }}>{product.seller?.businessName || 'brk'}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{product.price.toLocaleString()}</span>
            <div style={{ background: '#F0FDF4', color: '#166534', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Free Delivery</div>
          </div>

          {/* Size Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Select Size</span>
              <button style={{ background: 'none', border: 'none', color: '#94A3B8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}>Size Guide</button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {product.sizes.map(s => {
                const isOutOfStock = s.stock === 0;
                return (
                  <button
                    key={s.size}
                    onClick={() => !isOutOfStock && setSelectedSize(s.size)}
                    disabled={isOutOfStock}
                    style={{
                      minWidth: '68px',
                      height: '48px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: selectedSize === s.size ? '#000' : isOutOfStock ? '#F8FAFC' : '#F1F5F9',
                      background: selectedSize === s.size ? '#000' : 'white',
                      color: selectedSize === s.size ? 'white' : isOutOfStock ? '#CBD5E1' : '#000',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: '12px' }}>
              <button 
                onClick={handleAddToCart} 
                disabled={addingToCart || totalStock === 0} 
                style={{ 
                  height: '52px', borderRadius: '12px', fontSize: '0.95rem', 
                  fontWeight: 800, background: 'white', border: '1.5px solid #F1F5F9',
                  color: '#000', cursor: 'pointer', transition: 'all 0.2s ease',
                  textTransform: 'uppercase'
                }}
              >
                {addingToCart ? 'Adding...' : 'Add to Bag'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: '12px', overflow: 'hidden', height: '52px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#94A3B8' }}>−</button>
                <span style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedSizeStock || 99, quantity + 1))}
                  style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#000' }}
                >+</button>
              </div>
            </div>

            <button 
              onClick={handleBuyNow} 
              disabled={totalStock === 0} 
              style={{ 
                height: '56px', borderRadius: '12px', fontSize: '1.1rem', 
                width: '100%', background: '#000', color: 'white', 
                border: 'none', fontWeight: 800, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}
            >
              Purchase Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
