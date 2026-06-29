import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogsApi } from '../../api/blogs';
import useAuth from '../../hooks/useAuth';
import './Landing.css';

function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const BACKEND_URL = 'http://localhost/BTLWeb(PC)/backend';

  useEffect(() => {
    blogsApi.get(id).then(r => {
      if (r.data.success) setBlog(r.data.data);
      else navigate('/blog', {replace:true});
    }).catch(() => navigate('/blog', {replace:true}))
      .finally(() => setLoading(false));
  }, [id, navigate]);

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
            <li><a href="/blog" onClick={(e)=>{e.preventDefault();navigate('/blog');}}>BẢNG TIN</a></li>
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

      <section className="section__container" style={{paddingTop:'120px', maxWidth: 900}}>
        {loading ? <p style={{textAlign:'center', color:'#fff'}}>Đang tải tin tức...</p> : blog ? (
          <div style={{background: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 40}}>
            <button onClick={() => navigate('/blog')} style={{background:'none', border:'none', color:'#f97316', cursor:'pointer', fontSize:'0.95rem', fontWeight:600, display:'flex', alignItems:'center', gap:5, marginBottom:24}}>
              <i className="bx bx-arrow-back"></i> Quay lại Bảng tin
            </button>

            {blog.image && <img src={`${BACKEND_URL}/uploads/${blog.image}`} style={{width:'100%',maxHeight:500,objectFit:'cover',borderRadius:16,marginBottom:28}} alt="" onError={e=>e.target.style.display='none'} />}
            
            <h1 style={{color:'#fff',fontSize:'2.5rem',fontWeight:800,marginBottom:16,lineHeight:1.3}}>{blog.title}</h1>
            
            <div style={{color:'#888',fontSize:'0.9rem',marginBottom:32, display: 'flex', gap: 12, alignItems: 'center'}}>
               <div style={{background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 6}}><i className="bx bx-calendar"></i> {new Date(blog.created_at).toLocaleDateString('vi-VN')}</div>
               <div style={{background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '6px 12px', borderRadius: 6}}><i className="bx bx-pen"></i> FitPhysique Admin</div>
            </div>
            
            <div style={{color:'#e2e8f0',fontSize:'1.1rem',lineHeight:1.8,whiteSpace:'pre-wrap'}} dangerouslySetInnerHTML={{__html: blog.content}}></div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default BlogDetailPage;
