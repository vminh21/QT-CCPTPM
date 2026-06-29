import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogsApi } from '../../api/blogs';
import { MemberLayout } from '../../components/layout/MemberLayout';
import './Member.css';

function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = 'http://localhost/BTLWeb(PC)/backend';

  useEffect(() => {
    blogsApi.get(id).then(r => {
      if (r.data.success) setBlog(r.data.data);
      else navigate('/member', {replace:true});
    }).catch(() => navigate('/member', {replace:true}))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <MemberLayout title="Đang tải..."><div style={{padding:40,textAlign:'center',color:'#fff'}}>Đang tải tin tức...</div></MemberLayout>;
  if (!blog) return null;

  return (
    <MemberLayout title="Chi tiết bản tin">
      <div style={{maxWidth: 900, background: '#1a1a1a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 32}}>
        <button onClick={() => navigate('/member')} style={{background:'none', border:'none', color:'#f97316', cursor:'pointer', fontSize:'0.95rem', fontWeight:600, display:'flex', alignItems:'center', gap:5, marginBottom:24}}>
          <i className="bx bx-arrow-back"></i> Quay lại Bảng điều khiển
        </button>

        {blog.image && <img src={`${BACKEND_URL}/uploads/${blog.image}`} style={{width:'100%',maxHeight:450,objectFit:'cover',borderRadius:16,marginBottom:28}} alt="" onError={e=>e.target.style.display='none'} />}
        
        <h1 style={{color:'#fff',fontSize:'2.2rem',fontWeight:800,marginBottom:16,lineHeight:1.3}}>{blog.title}</h1>
        
        <div style={{color:'#888',fontSize:'0.9rem',marginBottom:32, display: 'flex', gap: 12, alignItems: 'center'}}>
           <div style={{background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 6}}><i className="bx bx-calendar"></i> {new Date(blog.created_at).toLocaleDateString('vi-VN')}</div>
           <div style={{background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '6px 12px', borderRadius: 6}}><i className="bx bx-pen"></i> FitPhysique Admin</div>
        </div>
        
        <div style={{color:'#e2e8f0',fontSize:'1.05rem',lineHeight:1.8,whiteSpace:'pre-wrap'}} dangerouslySetInnerHTML={{__html: blog.content}}></div>
      </div>
    </MemberLayout>
  );
}

export default BlogDetailPage;
