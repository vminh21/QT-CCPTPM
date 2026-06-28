import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { trainersApi } from '../../api/trainers';
import { blogsApi } from '../../api/blogs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Landing.css';

function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3500);
  };

  // States for BMI
  const [bmiInput, setBmiInput] = useState({ height: '', weight: '', age: '', gender: '' });
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiError, setBmiError] = useState({ height: '', weight: '' });

  const BACKEND_URL = 'http://localhost/BTLWeb(PC)/backend';

  const dashboardPath = user?.role === 'admin' || user?.role === 'staff' ? '/admin' : user?.role === 'pt' ? '/pt' : '/member';

  useEffect(() => {
    Promise.all([
      trainersApi.list({ limit: 4 }),
      blogsApi.list({ limit: 4 })
    ]).then(([resT, resB]) => {
      setTrainers(resT.data.data || []);
      setBlogs(resB.data.data || []);
    }).finally(() => setLoadingTop(false));
  }, []);

  const handleBmiCalc = () => {
    const { height, weight } = bmiInput;
    let err = { height: '', weight: '' };
    if (!height || isNaN(height)) err.height = 'Cần điền đầy đủ';
    else if (height < 50 || height > 280) err.height = 'Chiều cao không hợp lệ';

    if (!weight || isNaN(weight)) err.weight = 'Cần điền đầy đủ';
    else if (weight < 20 || weight > 300) err.weight = 'Cân nặng không hợp lệ';

    setBmiError(err);
    if (err.height || err.weight) return;

    let hM = height / 100;
    let bmi = (weight / (hM * hM)).toFixed(1);
    let status = '';
    if (bmi < 18.5) status = 'Thiếu cân';
    else if (bmi >= 18.5 && bmi < 24.9) status = 'Khỏe mạnh';
    else if (bmi >= 25 && bmi < 29.9) status = 'Thừa cân';
    else status = 'Béo phì';

    setBmiResult(`Chỉ số BMI: ${bmi} — Bạn đang ở trạng thái ${status.toUpperCase()}`);
  };

  const getImg = (name) => new URL(`../../assets/${name}`, import.meta.url).href;

  const handleMembershipClick = () => {
    if (user?.loggedIn) {
      navigate('/member/payment');
    } else {
      showToast('Vui lòng đăng nhập để có thể mua khóa học!');
    }
  };

  return (
    <div className="landing-page">
      {toast.show && (
        <div style={{position:'fixed',top:100,right:20,padding:'14px 20px',borderRadius:10,zIndex:9999,background:'rgba(249, 115, 22, 0.15)',backdropFilter:'blur(10px)',border:'1px solid rgba(249, 115, 22, 0.5)',color:'#fff',boxShadow:'0 4px 20px rgba(0,0,0,0.5)',animation:'fadeUp 0.3s ease', display:'flex', alignItems:'center', gap:10, fontWeight:500}}>
          <i className="bx bxs-error-circle" style={{color:'#f97316', fontSize:'1.3rem'}}></i> {toast.msg}
        </div>
      )}
      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="landing-nav__bar">
          <div className="landing-nav__logo" onClick={() => window.scrollTo(0, 0)} style={{ cursor: 'pointer' }}>
            <img src={getImg('logo.png')} alt="FitPhysique" onError={e => e.target.style.display = 'none'} />
            <span>FitPhysique</span>
          </div>
          <ul className="landing-nav__links">
            <li><a href="#home">HOME</a></li>
            <li><a href="#about">ABOUT</a></li>
            <li><a href="#trainer">TRAINERS</a></li>
            <li><a href="#client">REVIEWS</a></li>
            <li><a href="#blog">BLOGS</a></li>
            <li>
              {user?.loggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#a1a1aa' }}>Xin chào, <strong style={{color:'#fff', fontWeight:600}}>{user.full_name}</strong></span>
                  <button onClick={() => navigate(dashboardPath)} className="landing-btn landing-btn-primary" style={{padding: '0.5rem 1.25rem', fontSize: '0.9rem'}}>Hồ sơ của tôi</button>
                  <button onClick={() => logout()} style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer', fontSize:'1.2rem', padding:'0.4rem 0.6rem', borderRadius:'8px', transition:'0.3s'}}><i className="bx bx-log-out"></i></button>
                </div>
              ) : (
                <button onClick={() => navigate('/login')} className="landing-btn landing-btn-outline" style={{padding: '0.5rem 1.5rem', fontSize:'0.9rem'}}>ĐĂNG NHẬP</button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* HEADER HERO */}
      <header className="landing-hero" id="home">
        <div className="landing-hero-bg"></div>
        <div className="landing-hero-overlay"></div>
        <div className="landing-hero-content">
          <h1>HARD WORK</h1>
          <h2>IS FOR EVERY SUCCESS</h2>
          <p>Bắt đầu bằng việc lấy cảm hứng, tiếp tục thiết lập kỷ luật để truyền cảm hứng tới tương lai của chính bạn.</p>
          <div style={{display:'flex', gap:20, animation: 'fadeUp 1s ease 0.8s both'}}>
            <button className="landing-btn landing-btn-primary" onClick={() => navigate(user?.loggedIn ? dashboardPath : '/login')}>GET STARTED NOW</button>
            <a href="#about" className="landing-btn landing-btn-outline">KHÁM PHÁ CHI TIẾT <i className="bx bx-down-arrow-alt" style={{marginLeft:8}}></i></a>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section className="section__container" id="about">
        <h2 className="section__header">VỀ CHÚNG TÔI</h2>
        <p className="section__description">Sứ mệnh của chúng tôi là truyền cảm hứng và hỗ trợ mọi người đạt được các mục tiêu về sức khỏe và thể chất, với những công nghệ máy móc tối tân nhất.</p>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon"><i className="bx bx-trophy"></i></div>
            <h4>Winner Coaches</h4>
            <p>Chúng tôi tự hào sở hữu đội ngũ huấn luyện viên vô địch, tận tâm và giàu kinh nghiệm, cam kết đẩy bạn vượt qua giới hạn bản thân.</p>
          </div>
          <div className="about-card">
            <div className="about-card-icon"><i className="bx bx-wallet"></i></div>
            <h4>Affordable Price</h4>
            <p>Cam kết mang lại môi trường tập luyện thể hình chuyên nghiệp nhất với mức giá tối ưu và hợp lý nhất cho tất cả mọi người.</p>
          </div>
          <div className="about-card">
            <div className="about-card-icon"><i className="bx bx-dumbbell"></i></div>
            <h4>Modern Equipments</h4>
            <p>Luôn dẫn đầu xu hướng thế giới với hệ thống trang thiết bị nhập khẩu 100% châu Âu, tối đa hóa hiệu quả của bạn.</p>
          </div>
        </div>
      </section>

      {/* SESSIONS */}
      <section className="section__container" style={{paddingTop: 0}}>
        <h2 className="section__header" style={{marginBottom:'3rem'}}>MỤC TIÊU CỦA BẠN</h2>
        <div className="session-grid">
          <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/exercise/all'); }} className="session-card">
            <img src={getImg('session-1.jpg')} alt="Body Building" />
            <div className="session-content">
              <h4>BODY BUILDING</h4>
              <p>Phá vỡ kiến tạo, xây dựng khối cơ bắp sắc nét và hoàn hảo nhất.</p>
              <span>Tham gia ngay <i className="bx bx-right-arrow-alt"></i></span>
            </div>
          </a>
          <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/exercise/all'); }} className="session-card">
            <img src={getImg('session-2.jpg')} alt="Cardio" />
            <div className="session-content">
              <h4>CARDIO</h4>
              <p>Thúc đẩy nhịp tim, đốt mỡ tối đa và tăng cường sức bền tuyệt đỉnh.</p>
              <span>Tham gia ngay <i className="bx bx-right-arrow-alt"></i></span>
            </div>
          </a>
          <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/exercise/all'); }} className="session-card">
            <img src={getImg('session-3.jpg')} alt="Fitness" />
            <div className="session-content">
              <h4>FITNESS</h4>
              <p>Môn thể thao định hình phong cách sống khỏe, dẻo dai và toàn diện.</p>
              <span>Tham gia ngay <i className="bx bx-right-arrow-alt"></i></span>
            </div>
          </a>
          <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/exercise/all'); }} className="session-card">
            <img src={getImg('session-4.jpg')} alt="Crossfit" />
            <div className="session-content">
              <h4>CROSSFIT</h4>
              <p>Trải nghiệm các lớp học cường độ cao ngắt quãng, vượt chướng ngại.</p>
              <span>Tham gia ngay <i className="bx bx-right-arrow-alt"></i></span>
            </div>
          </a>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="section__container" id="trainer" style={{paddingTop: 0}}>
        <h2 className="section__header">MEET OUR TRAINERS</h2>
        <p className="section__description">Gặp gỡ đội ngũ Chuyên gia hàng đầu của chúng tôi, những người sẽ trực tiếp thay đổi cơ thể bạn.</p>
        <div className="trainer-grid">
          {loadingTop ? <p style={{ textAlign: 'center', gridColumn: 'span 4', color:'#71717a' }}>Đang nạp dữ liệu Hệ thống...</p> : trainers.map((t, i) => (
            <div key={t.trainer_id} className="trainer-card">
              <div style={{overflow:'hidden'}}><img src={t.image ? `${BACKEND_URL}/uploads/${t.image}` : getImg(`trainer-${(i%4)+1}.jpg`)} alt={t.full_name} className="trainer-image" onError={e=>e.target.src=getImg(`trainer-${(i%4)+1}.jpg`)} /></div>
              <h4>{t.full_name}</h4>
              <p>{t.specialty}</p>
              <div className="trainer-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <i key={star} className={star <= Math.round(t.calculated_rating || t.rating || 5) ? 'bx bxs-star' : 'bx bx-star'} style={{color: star <= Math.round(t.calculated_rating || t.rating || 5) ? '#f59e0b' : '#3f3f46'}}></i>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="membership-sec">
        <div className="section__container">
          <h2 className="section__header" style={{textShadow:'0 2px 10px rgba(0,0,0,0.5)'}}>MEMBERSHIP PLANS</h2>
          <p className="section__description" style={{color:'#e4e4e7'}}>Chọn lựa thẻ đặc quyền phù hợp nhất với hành trình chinh phục sức khỏe của bạn.</p>
          <div className="membership-grid">
            {/* Standard */}
            <div className="membership-card">
              <h4>STANDARD</h4>
              <h3>500.000<sup>đ</sup><span>/THÁNG</span></h3>
              <ul>
                <li><i className="bx bx-check-circle"></i> Truy cập toàn bộ khu vực máy tập chuẩn.</li>
                <li><i className="bx bx-check-circle"></i> Miễn phí tham gia Yoga, Zumba, Pilates.</li>
                <li><i className="bx bx-check-circle"></i> 1 Buổi định hướng với PT.</li>
                <li><i className="bx bx-check-circle"></i> Sử dụng Tủ đồ & Phòng tắm cao cấp.</li>
              </ul>
              <button className="landing-btn landing-btn-outline" style={{width:'100%'}} onClick={handleMembershipClick}>ĐĂNG KÝ NGAY</button>
            </div>
            {/* Prof */}
            <div className="membership-card featured">
              <span className="membership-badge">PHỔ BIẾN NHẤT</span>
              <h4>PROFESSIONAL</h4>
              <h3>1.350.000<sup>đ</sup><span>/3 THÁNG</span></h3>
              <ul>
                <li><i className="bx bx-check-circle"></i> Mọi quyền lợi của thẻ Standard.</li>
                <li><i className="bx bx-check-circle"></i> Quét khuôn mặt ra vào VIP.</li>
                <li><i className="bx bx-check-circle"></i> Giảm 20% khi mua gói PT huấn luyện.</li>
                <li><i className="bx bx-check-circle"></i> Nhận lịch trình Dinh dưỡng độc quyền.</li>
                <li><i className="bx bx-check-circle"></i> Ghế Massage sau tập miễn phí.</li>
              </ul>
              <button className="landing-btn landing-btn-primary" style={{width:'100%'}} onClick={handleMembershipClick}>ĐĂNG KÝ NGAY</button>
            </div>
            {/* Ultimate */}
            <div className="membership-card">
              <h4>ULTIMATE VIP</h4>
              <h3>5.000.000<sup>đ</sup><span>/NĂM</span></h3>
              <ul>
                <li><i className="bx bx-check-circle"></i> Đặc quyền tối thượng mọi dịch vụ tập luyện.</li>
                <li><i className="bx bx-check-circle"></i> Dịch vụ giặt gửi đồ tập cá nhân riêng.</li>
                <li><i className="bx bx-check-circle"></i> Đỗ xe Ôtô khu vực VIP.</li>
                <li><i className="bx bx-check-circle"></i> 12 Voucher vé cho Khách đi kèm mỗi năm.</li>
              </ul>
              <button className="landing-btn landing-btn-outline" style={{width:'100%', marginTop:'auto'}} onClick={handleMembershipClick}>ĐĂNG KÝ NGAY</button>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT REVIEWS */}
      <section className="section__container" id="client" style={{ overflow: 'hidden' }}>
        <h2 className="section__header">OUR TESTIMONIALS</h2>
        <div style={{ marginTop: '3rem', paddingBottom: '3rem' }}>
          <Swiper 
            modules={[Pagination, Autoplay]} 
            pagination={{ clickable: true }} 
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            spaceBetween={50} 
            slidesPerView={1}
          >
            <SwiperSlide>
              <div className="client-card">
                <i className="bx bxs-quote-alt-right quote"></i>
                <p>"Tôi đã là hội viên tại FitPhysique hơn một năm nay và cực kỳ hài lòng với trải nghiệm của mình. Không gian sạch sẽ, máy móc hiện đại và đội ngũ nhân viên cư xử trên cả tuyệt vời."</p>
                <div className="client-author">
                  <img src={getImg('client-1.jpg')} alt="client" />
                  <h4>Sarah Johnson</h4>
                  <div style={{color:'#f97316', marginTop:5}}><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i></div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="client-card">
                <i className="bx bxs-quote-alt-right quote"></i>
                <p>"Các lớp học luôn được lên kế hoạch kỹ lưỡng. Tôi từng là một người rất lười vận động, nhưng nguồn năng lượng tại phòng tập đã hoàn toàn biến đổi con người tôi. Cảm ơn FitPhysique."</p>
                <div className="client-author">
                  <img src={getImg('client-2.jpg')} alt="client" />
                  <h4>Michael Wong</h4>
                  <div style={{color:'#f97316', marginTop:5}}><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i></div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="client-card">
                <i className="bx bxs-quote-alt-right quote"></i>
                <p>"Tôi đã đi nhiều phòng tập, kể cả các chuỗi lớn, nhưng sự chăm sóc tận tâm chuyên nghiệp từ Huấn luyên viên cá nhân ở đây là thứ tôi chưa từng thấy ở nơi khác."</p>
                <div className="client-author">
                  <img src={getImg('client-3.jpg')} alt="client" />
                  <h4>Emily Davis</h4>
                  <div style={{color:'#f97316', marginTop:5}}><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star"></i><i className="bx bxs-star-half"></i></div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* BLOGS */}
      <section className="section__container" id="blog" style={{paddingTop: 0}}>
        <h2 className="section__header" style={{marginBottom:'3rem'}}>KIẾN THỨC BỔ ÍCH</h2>
        <div className="blog-grid">
          {loadingTop ? <p style={{ textAlign: 'center', gridColumn: 'span 4', color:'#71717a' }}>Đang tải tin tức...</p> : blogs.map((b, i) => (
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
        </div>
        <div style={{textAlign: 'center', margin: '3rem 0 1rem'}}>
           <button className="landing-btn landing-btn-outline" onClick={() => navigate('/blog')}>Xem tất cả Bản tin <i className="bx bx-right-arrow-alt" style={{marginLeft:8}}></i></button>
        </div>
      </section>

      {/* BMI */}
      <section className="bmi-sec" id="bmi">
        <div className="section__container bmi-container">
          <div className="bmi-left">
             <div className="bmi-img"><img src={getImg('bmi.png')} alt="BMI" style={{width:'100%'}} /></div>
          </div>
          <div className="bmi-right">
             <h2 className="section__header" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>TÍNH BMI CHUẨN Y KHOA</h2>
             <p style={{ color: '#a1a1aa', marginBottom: '2.5rem', fontSize:'1.1rem' }}>Sử dụng công thức tính toán khoa học để xác định chính xác tỷ lệ phân phối khối lượng cơ thể của bạn đang ở mức thâm hụt hay dư thừa.</p>
             
             <div className="bmi-form">
               <div>
                  <input type="number" className={`bmi-input ${bmiError.height ? 'border-red' : ''}`} placeholder="Chiều cao (cm)" value={bmiInput.height} onChange={e => setBmiInput({ ...bmiInput, height: e.target.value })} />
                  {bmiError.height && <small style={{ color: '#ef4444', display:'block', marginTop:5, marginLeft:5 }}>{bmiError.height}</small>}
               </div>
               <div>
                  <input type="number" className={`bmi-input ${bmiError.weight ? 'border-red' : ''}`} placeholder="Cân nặng (kg)" value={bmiInput.weight} onChange={e => setBmiInput({ ...bmiInput, weight: e.target.value })} />
                  {bmiError.weight && <small style={{ color: '#ef4444', display:'block', marginTop:5, marginLeft:5 }}>{bmiError.weight}</small>}
               </div>
               <div><input type="number" className="bmi-input" placeholder="Độ tuổi" value={bmiInput.age} onChange={e => setBmiInput({ ...bmiInput, age: e.target.value })} /></div>
               <div>
                  <select className="bmi-input bmi-select" value={bmiInput.gender} onChange={e => setBmiInput({ ...bmiInput, gender: e.target.value })}>
                    <option value="" disabled>Giới tính của bạn</option>
                    <option value="male">Nam giới</option>
                    <option value="female">Nữ giới</option>
                  </select>
               </div>
               
               {bmiResult && <div className="bmi-result-box">{bmiResult}</div>}

               <div style={{ gridColumn: 'span 2', display: 'flex', gap: 15, marginTop: 10 }}>
                  <button className="landing-btn landing-btn-primary" style={{flex: 1}} onClick={handleBmiCalc}>NHẬN KẾT QUẢ ĐÁNH GIÁ</button>
                  <button className="landing-btn landing-btn-outline" style={{padding:'0 1.5rem'}} onClick={() => { setBmiInput({ height: '', weight: '', age: '', gender: '' }); setBmiResult(null); setBmiError({ height: '', weight: '' }); }}><i className="bx bx-refresh" style={{fontSize:'1.5rem'}}></i></button>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer" id="contact">
        <div className="section__container" style={{padding:'4rem 1.5rem'}}>
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <img src={getImg('logo.png')} alt="logo" />
                <span>FitPhysique</span>
              </div>
              <p style={{ color: '#a1a1aa', maxWidth: 350, lineHeight: 1.8 }}>Chúng tôi tin rằng mọi hành trình đến với thể hình đều độc đáo, đầy sức mạnh và là cách tốt nhất để thay đổi bản thân từ sâu thẳm bên trong.</p>
              <div className="footer-socials">
                <a href="#!"><i className="bx bxl-facebook"></i></a>
                <a href="#!"><i className="bx bxl-instagram"></i></a>
                <a href="#!"><i className="bx bxl-youtube"></i></a>
                <a href="#!"><i className="bx bxl-tiktok"></i></a>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#fff', fontSize:'1.2rem', marginBottom:'1.5rem' }}>THÔNG TIN LIÊN HỆ</h4>
              <ul className="footer-links">
                <li><i className="bx bxs-map"></i> 243 Đường Nguyễn Xiển<br />Thanh Xuân, Hà Nội</li>
                <li><i className="bx bxs-phone"></i> +84 985 772 330</li>
                <li><i className="bx bxs-envelope"></i> admin@fitphysique.vn</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#fff', fontSize:'1.2rem', marginBottom:'1.5rem' }}>GALLERY</h4>
              <div className="footer-gallery">
                <img src={getImg('gallery-1.jpg')} alt="gal" />
                <img src={getImg('gallery-2.jpg')} alt="gal" />
                <img src={getImg('gallery-3.jpg')} alt="gal" />
                <img src={getImg('gallery-4.jpg')} alt="gal" />
                <img src={getImg('gallery-5.jpg')} alt="gal" />
                <img src={getImg('gallery-6.jpg')} alt="gal" />
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            Copyright © 2026 FitPhysique Corporation. Designed with passion.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
