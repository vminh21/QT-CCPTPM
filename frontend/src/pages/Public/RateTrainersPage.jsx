import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainersApi } from '../../api/trainers';
import { profileApi } from '../../api/profile';
import useAuth from '../../hooks/useAuth';
import '../Member/Member.css'; // Has profile-page styles, etc.

function RateTrainersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalTrainer, setModalTrainer] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trainersApi.list().then(r => setTrainers(r.data.data||[])).finally(()=>setLoading(false));
  }, []);

  const openModal = async (t) => {
    setModalTrainer(t);
    setLoadingModal(true);
    setReviews([]);
    setCanReview(false);
    setForm({ rating: 5, comment: '' });
    try {
      const resReviews = await trainersApi.getReviews(t.trainer_id);
      if (resReviews.data.success) setReviews(resReviews.data.data);
      if (user?.loggedIn && user?.role === 'member') {
         const resCan = await profileApi.canReview(t.trainer_id);
         if (resCan.data.success) setCanReview(resCan.data.can_review);
      }
    } catch(e) { console.error(e); }
    finally { setLoadingModal(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'member') { 
      alert('Chỉ tài khoản Hội viên mới được phép gửi đánh giá!'); 
      return navigate('/login'); 
    }
    setSubmitting(true);
    try {
      const r = await profileApi.submitReview({ trainer_id: modalTrainer.trainer_id, rating: form.rating, comment: form.comment });
      if (r.data.success) { 
        alert('Cảm ơn bạn đã đánh giá!'); 
        setForm({ rating:5, comment: '' });
        const resReviews = await trainersApi.getReviews(modalTrainer.trainer_id);
        if (resReviews.data.success) setReviews(resReviews.data.data);
      } else {
        alert('Lỗi: ' + (r.data.error || 'Không thể gửi'));
      }
    } catch(err) { 
        alert('Lỗi server: ' + (err.response?.data?.error || err.message)); 
    } finally {
        setSubmitting(false);
    }
  };

  const BACKEND_URL = 'http://localhost/BTLWeb(PC)/backend';

  const Stars = ({ rating }) => (
    <div style={{display:'inline-flex', gap: 2}}>
      {[1, 2, 3, 4, 5].map(star => (
        <i key={star} className={`bx ${star <= Math.round(rating) ? 'bxs-star' : 'bx-star'}`} style={{color: star <= Math.round(rating) ? '#f59e0b' : '#555', fontSize: '1rem'}}></i>
      ))}
    </div>
  );

  return (
    <div className="profile-page" style={{minHeight:'100vh', background:'#0a0a0a'}}>
      <nav className="member-navbar">
        <div className="member-nav-brand" onClick={() => navigate(-1)} style={{cursor:'pointer'}}><span className="brand-name">FitPhysique</span></div>
        <div className="member-nav-links">
           <button onClick={() => navigate(-1)} style={{background:'none',border:'none',color:'#f97316',cursor:'pointer',fontSize:'0.9rem', fontWeight:600}}><i className="bx bx-arrow-back"></i> Quay lại</button>
        </div>
      </nav>
      
      <div className="profile-content" style={{maxWidth: 1100}}>
        <h1 style={{color:'#fff',textAlign:'center',marginBottom:10, fontSize:'2rem', fontWeight:800}}>Đội ngũ Huấn Luyện Viên</h1>
        <p style={{color:'#a1a1aa', textAlign:'center', marginBottom:40, fontSize:'1.05rem'}}>Đọc đánh giá của những hội viên khác và chia sẻ cảm nhận của bạn về quá trình tập luyện.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {loading ? <p style={{color:'#888', textAlign:'center', gridColumn:'1/-1'}}>Đang tải danh sách PT...</p> : trainers.map(t => (
            <div key={t.trainer_id} style={{background:'#141414', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:24, display:'flex', flexDirection:'column', alignItems:'center', transition:'transform 0.3s'}}
                 onMouseEnter={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              {t.image ? <img src={`${BACKEND_URL}/uploads/${t.image}`} style={{width:100,height:100,borderRadius:'50%',objectFit:'cover',marginBottom:16, border:'3px solid rgba(249,115,22,0.2)'}} alt="" onError={e=>e.target.style.display='none'} />
              : <div style={{width:100,height:100,borderRadius:'50%',background:'rgba(249,115,22,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}><i className="bx bxs-user" style={{fontSize:'3.5rem',color:'#f97316'}}></i></div>}
              
              <strong style={{color:'#fff',fontSize:'1.15rem',marginBottom:4}}>{t.full_name}</strong>
              <span style={{color:'#f97316',fontSize:'0.85rem',marginBottom:8, fontWeight:600}}>{t.specialty || 'General Training'}</span>
              
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom: 20}}>
                <span style={{color:'#fff', fontWeight:700}}>{Number(t.calculated_rating).toFixed(1)}</span>
                <Stars rating={t.calculated_rating} />
                <span style={{color:'#888', fontSize:'0.8rem'}}>({t.total_reviews})</span>
              </div>
              
              <button onClick={() => openModal(t)} style={{marginTop:'auto',width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',padding:'10px',borderRadius:8,cursor:'pointer',fontSize:'0.9rem', transition:'0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#f97316'; e.currentTarget.style.borderColor='#f97316'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
                Xem & Đánh giá
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalTrainer && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(5px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000, padding: 20}} onClick={()=>setModalTrainer(null)}>
          <div style={{background:'#18181b',padding:0,borderRadius:20,width:'100%',maxWidth:700, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', border:'1px solid rgba(255,255,255,0.1)'}} onClick={e=>e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{padding:'24px 32px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#141414'}}>
               <div style={{display:'flex', alignItems:'center', gap:16}}>
                 {modalTrainer.image ? <img src={`${BACKEND_URL}/uploads/${modalTrainer.image}`} style={{width:60,height:60,borderRadius:'50%',objectFit:'cover'}} alt="" />
                  : <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(249,115,22,0.1)'}}></div>}
                 <div>
                   <h2 style={{color:'#fff', fontSize:'1.2rem'}}>{modalTrainer.full_name}</h2>
                   <div style={{display:'flex', alignItems:'center', gap:5, marginTop:4}}>
                      <span style={{color:'#f59e0b', fontWeight:700}}>{Number(modalTrainer.calculated_rating).toFixed(1)}</span>
                      <Stars rating={modalTrainer.calculated_rating} />
                   </div>
                 </div>
               </div>
               <button onClick={()=>setModalTrainer(null)} style={{background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', width:36, height:36, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><i className="bx bx-x" style={{fontSize:'1.5rem'}}></i></button>
            </div>

            {/* Modal Body */}
            <div style={{padding:'32px', overflowY:'auto'}}>
               {loadingModal ? <p style={{color:'#888', textAlign:'center'}}>Đang tải đánh giá...</p> : (
                 <>
                    {/* Form Đánh giá */}
                    <div style={{background:'rgba(255,255,255,0.02)', padding:24, borderRadius:12, border:'1px solid rgba(255,255,255,0.04)', marginBottom:32}}>
                       <h3 style={{color:'#fff', marginBottom:16, fontSize:'1.1rem'}}><i className="bx bx-edit-alt" style={{marginRight:8, color:'#f97316'}}></i>Viết cảm nhận của bạn</h3>
                       
                       {!user?.loggedIn ? (
                          <div style={{textAlign:'center', padding:'20px 0'}}>
                             <p style={{color:'#a1a1aa', marginBottom:16}}>Vui lòng đăng nhập để gửi nhận xét về PT này.</p>
                             <button onClick={() => navigate('/login')} className="btn-primary" style={{padding:'8px 20px', borderRadius:8}}>Đăng nhập ngay</button>
                          </div>
                       ) : !canReview ? (
                          <div style={{padding:'16px', background:'rgba(239, 68, 68, 0.1)', borderRadius:8, color:'#fca5a5', fontSize:'0.95rem', border:'1px solid rgba(239,68,68,0.2)'}}>
                             <i className="bx bxs-info-circle" style={{marginRight:6}}></i> Bạn chỉ có thể đánh giá Huấn luyện viên này sau khi đã đăng ký và tham gia tập luyện cùng họ.
                          </div>
                       ) : (
                          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
                            <div>
                              <div style={{display:'flex',gap:6,marginBottom:12}}>
                                {[1,2,3,4,5].map(star => (
                                  <i key={star} 
                                     className={`bx ${star <= (hoverRating || form.rating) ? 'bxs-star' : 'bx-star'}`}
                                     style={{fontSize:'2.2rem', cursor:'pointer', color: star <= (hoverRating || form.rating) ? '#f59e0b' : '#3f3f46', transition: 'color 0.2s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}
                                     onMouseEnter={() => setHoverRating(star)}
                                     onMouseLeave={() => setHoverRating(0)}
                                     onClick={() => setForm(f => ({...f, rating: star}))}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <div>
                              <textarea required placeholder="Chia sẻ trải nghiệm tập luyện của bạn..." value={form.comment} onChange={e=>setForm(f=>({...f,comment:e.target.value}))} style={{width:'100%',padding:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',borderRadius:12,outline:'none',minHeight:100, fontSize:'0.95rem', resize:'vertical'}}></textarea>
                            </div>
                            <button type="submit" disabled={submitting} style={{alignSelf:'flex-end', padding:'12px 24px',background:'#f97316',border:'none',color:'#fff',borderRadius:8,cursor:submitting?'not-allowed':'pointer', fontWeight:600}}>{submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}</button>
                          </form>
                       )}
                    </div>

                    {/* Danh sách Review */}
                    <div>
                       <h3 style={{color:'#fff', marginBottom:20, fontSize:'1.1rem'}}><i className="bx bx-comment-detail" style={{marginRight:8, color:'#f97316'}}></i>Đánh giá từ Hội viên ({reviews.length})</h3>
                       {reviews.length === 0 ? <p style={{color:'#71717a', fontStyle:'italic'}}>HLV này chưa có đánh giá nào.</p> : (
                          <div style={{display:'flex', flexDirection:'column', gap:16}}>
                             {reviews.map(r => (
                                <div key={r.review_id} style={{background:'rgba(255,255,255,0.01)', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:16}}>
                                   <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                                      <strong style={{color:'#fff', fontSize:'0.95rem'}}>{r.reviewer_name || 'Hội viên ẩn danh'}</strong>
                                      <span style={{color:'#71717a', fontSize:'0.8rem'}}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                                   </div>
                                   <div style={{marginBottom:8}}>
                                      <Stars rating={r.rating} />
                                   </div>
                                   <p style={{color:'#d4d4d8', fontSize:'0.9rem', lineHeight:1.5}}>{r.comment}</p>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 </>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default RateTrainersPage;
