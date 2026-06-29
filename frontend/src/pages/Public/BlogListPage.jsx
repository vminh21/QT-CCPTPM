import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogsApi } from '../../api/blogs';
import useAuth from '../../hooks/useAuth';
import './Landing.css';

function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const BACKEND_URL = 'http://localhost/BTLWeb(PC)/backend';

  useEffect(() => {
    blogsApi.list()
      .then(res => setBlogs(res.data.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const getImg = (name) => new URL(`../../assets/${name}`, import.meta.url).href;

  return (
    <div className="landing-page" style={{minHeight:'100vh', background:'#0a0a0a'}}>
      <nav className="landing-nav" style={{background:'rgba(10,10,10,0.95)'}}>
        <div className="landing-nav__bar">
          <div className="landing-nav__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={getImg('logo.png')} alt="FitPhysique" onError={e => e.target.style.display = 'none'} />
            <span>FitPhysique</span>
          </div>
          <ul className="landing-nav__links">
            <li><a href="/" onClick={(e)=>{e.preventDefault();navigate('/');}}>TRANG CHỦ</a></li>
            <li>
              {user?.loggedIn ? (
                <button onClick={() => navigate(user.role==='admin'||user.role==='staff'?'/admin':user.role==='pt'?'/pt':'/member')} className="landing-btn landing-btn-primary" style={{padding: '0.5rem 1.25rem', fontSize: '0.9rem'}}>Hồ sơ của tôi</button>
              ) : (
                <button onClick={() => navigate('/login')} className="landing-btn landing-btn-outline" style={{padding: '0.5rem 1.5rem', fontSize:'0.9rem'}}>ĐĂNG NHẬP</button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <section className="section__container" style={{paddingTop:'120px'}}>
        <h2 className="section__header" style={{marginBottom:'3rem'}}>TẤT CẢ BẢN TIN</h2>
        <div className="blog-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))'}}>
          {loading ? <p style={{ textAlign: 'center', gridColumn: '1 / -1', color:'#71717a' }}>Đang tải tin tức...</p> : blogs.map((b, i) => (
            <div key={b.blog_id} className="blog-card" style={{cursor: 'pointer'}} onClick={() => navigate(`/blog/${b.blog_id}`)}>
              <div className="blog-img-wrapper">
                <img src={b.image ? `${BACKEND_URL}/uploads/${b.image}` : getImg(`blog-${(i%4)+1}.jpg`)} alt={b.title} onError={e=>e.target.src=getImg('blog-1.jpg')} />
              </div>
              <div className="blog-content">
                <span className="blog-date">{new Date(b.created_at).toLocaleDateString('vi-VN', {day:'2-digit', month:'short', year:'numeric'})}</span>
                <h4>{b.title}</h4>
              </div>
            </div>
          ))}
          {!loading && blogs.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1 / -1', color:'#71717a' }}>Chưa có bản tin nào.</p>}
        </div>
      </section>
    </div>
  );
}

export default BlogListPage;
