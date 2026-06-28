import { useEffect, useState } from 'react';
import { PTLayout } from '../../components/layout/PTLayout';
import '../../components/layout/AdminLayout.css';
import './PT.css';
import { ptApi } from '../../api/pt';
import useAuth from '../../hooks/useAuth';

function Stars({ n }) {
  return <span>{[1,2,3,4,5].map(i => <i key={i} className={`bx ${i<=Math.round(n)?'bxs-star star-filled':'bxs-star'}`} style={{color:i<=Math.round(n)?'#f59e0b':'#333',fontSize:'1rem'}}></i>)}</span>;
}

function ReviewsPage() {
  const { user } = useAuth();
  const [reviews,   setReviews]   = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [dist,      setDist]      = useState({5:0,4:0,3:0,2:0,1:0});

  useEffect(() => {
    ptApi.getReviews()
      .then(r => {
        const data = r.data.data || [];
        setReviews(data);
        if (data.length > 0) {
          const avg = data.reduce((s,r) => s + Number(r.rating||0), 0) / data.length;
          setAvgRating(avg);
          const d = {5:0,4:0,3:0,2:0,1:0};
          data.forEach(r => { const k = Math.round(r.rating); if (d[k]!==undefined) d[k]++; });
          setDist(d);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <PTLayout title="Đánh giá từ học viên">
      {/* Overview */}
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:24,marginBottom:28,background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:24}}>
        <div style={{textAlign:'center',borderRight:'1px solid rgba(255,255,255,0.06)',paddingRight:24}}>
          <div style={{fontSize:'3rem',fontWeight:700,color:'#fff',lineHeight:1}}>{loading?'...':avgRating.toFixed(1)}</div>
          <Stars n={avgRating} />
          <div style={{color:'#555',fontSize:'0.82rem',marginTop:8}}>{reviews.length} đánh giá</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,justifyContent:'center'}}>
          {[5,4,3,2,1].map(star => {
            const count = dist[star] || 0;
            const pct   = reviews.length > 0 ? (count/reviews.length)*100 : 0;
            return (
              <div key={star} style={{display:'flex',alignItems:'center',gap:10,fontSize:'0.82rem'}}>
                <span style={{color:'#888',width:16,textAlign:'right'}}>{star}</span>
                <i className="bx bxs-star star-filled" style={{color:'#f59e0b'}}></i>
                <div className="rating-bar-bg"><div className="rating-bar-fill" style={{width:`${pct}%`}}></div></div>
                <span style={{color:'#555',width:20}}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
        {loading ? <p style={{color:'#555'}}>Đang tải...</p>
        : reviews.length===0 ? <p style={{color:'#555'}}>Chưa có đánh giá nào</p>
        : reviews.map((r,i) => (
          <div key={i} style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <strong style={{color:'#fff'}}>{r.full_name||r.member_name||'Ẩn danh'}</strong>
              <Stars n={Number(r.rating||0)} />
            </div>
            <p style={{color:'#888',fontSize:'0.88rem',lineHeight:1.6}}>{r.comment||r.review_text||'Không có nhận xét'}</p>
            <div style={{color:'#444',fontSize:'0.78rem',marginTop:10}}>
              {r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : ''}
            </div>
          </div>
        ))}
      </div>
    </PTLayout>
  );
}

export default ReviewsPage;
