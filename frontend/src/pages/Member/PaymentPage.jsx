import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { packagesApi } from '../../api/packages';
import { trainersApi } from '../../api/trainers';
import { profileApi } from '../../api/profile';
import { paymentsApi } from '../../api/payments';
import useAuth from '../../hooks/useAuth';
import { MemberLayout } from '../../components/layout/MemberLayout';
import './Member.css';

const coursesList = [
  'Body Building',
  'Cardio - Giảm mỡ tĩnh',
  'Yoga Hatha',
  'CrossFit Kháng Lực',
  'Zumba Dance',
  'Khác'
];

function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proc, setProc] = useState(false);

  // Custom Modal State
  const [modalData, setModalData] = useState({ 
    show: false, type: 'success', title: '', message: '', onClose: null 
  });

  const showModal = (type, title, message, onClose = null) => {
    setModalData({ show: true, type, title, message, onClose });
  };

  // Checkout states
  const [checkoutPkg, setCheckoutPkg] = useState(null);
  const [form, setForm] = useState({
    trainer_id: '',
    course_name: coursesList[0],
    payment_method: 'Tiền mặt'
  });

  const [qrModal, setQrModal] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    Promise.all([
      packagesApi.list(),
      trainersApi.list(),
      profileApi.get()
    ])
      .then(([resPkg, resTrn, resProf]) => {
        setPackages(resPkg.data.data || []);
        setTrainers(resTrn.data.data || []);
        setActiveSub(resProf.data.data?.active_sub);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setProc(true);

    const payload = {
      package_id: checkoutPkg.package_id,
      trainer_id: form.trainer_id || null,
      course_name: form.course_name,
      payment_method: form.payment_method
    };

    try {
      const res = await paymentsApi.initiate(payload);

      if (form.payment_method === 'Tiền mặt') {
        showModal('success', 'Đăng Ký Thành Công', res.data.message || 'Yêu cầu thanh toán tiền mặt của bạn đã được ghi nhận. Vui lòng thanh toán tại quầy!', () => navigate('/member'));
      } else if (form.payment_method === 'Momo') {
        if (res.data.payUrl) {
          window.location.href = res.data.payUrl;
        } else {
          showModal('error', 'Lỗi Thanh Toán MoMo', 'Không nhận được link thanh toán từ hệ thống. Vui lòng thử lại sau.');
        }
      } else if (form.payment_method === 'Chuyển khoản') {
        setQrModal(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Lỗi kết nối mạng khi xử lý thanh toán. Xin thử lại!';
      showModal('error', 'Thao Tác Thất Bại', 'Lỗi: ' + msg);
    } finally {
      setProc(false);
    }
  };

  const confirmTransfer = async () => {
    if (!qrModal) return;
    try {
      const payload = {
        package_id: qrModal.package_id,
        trainer_id: qrModal.trainer_id || null,
        course_name: qrModal.course_name ?? '',
        payment_method: 'Chuyển khoản'
      };
      
      const res = await paymentsApi.confirmTransfer(payload);
      if (res.data.success) {
        setQrModal(null);
        showModal('success', 'Hoàn Tất Kích Hoạt', 'Gói tập đã được kích hoạt thành công, chúc bạn tập luyện hiệu quả!', () => navigate('/member'));
      } else {
        showModal('error', 'Lỗi Xác Nhận', (res.data.message || res.data.error || 'Quá trình xác nhận bị lỗi.'));
      }
    } catch (e) {
      showModal('error', 'Lỗi Mạng', 'Mất kết nối với máy chủ khi xác nhận giao dịch!');
    }
  };

  return (
    <MemberLayout title="Đăng Ký & Mua Gói Tập">
      <div style={{ maxWidth: 1000, margin: '0 auto', gridColumn: '1 / -1' }}>

        {!checkoutPkg ? (
          <>
            <h2 style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Chọn gói tập phù hợp</h2>
            <p style={{ color: '#6b7280', marginBottom: 32 }}>Kích hoạt hoặc gia hạn thẻ hội viên để trải nghiệm hệ thống FitPhysique, truy cập tất cả dịch vụ.</p>

            {activeSub && (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px 20px', borderRadius: 12, marginBottom: 32, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bx bxs-error-circle" style={{ fontSize: '1.5rem' }}></i>
                <div>
                  <strong style={{ display: 'block', marginBottom: 4 }}>Chú ý: Bạn đang có gói "{activeSub.package_name}" đang kích hoạt!</strong>
                  <span style={{ fontSize: '0.9rem' }}>Lưu ý: Tại một thời điểm chỉ có thể sử dụng một thẻ Hội viên. Vui lòng vào trang <b>Hồ sơ của tôi</b> để Huỷ gói tập hiện tại trước khi chuyển sang gói mới.</span>
                </div>
              </div>
            )}

            {loading ? <p style={{ color: '#6b7280' }}>Đang tải gói tập...</p> : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                 {packages.map((p, index) => (
                   <div key={p.package_id} style={{ background: '#ffffff', border: `1px solid ${index === 1 ? 'rgba(249,115,22,0.4)' : '#e5e7eb'}`, borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s, box-shadow 0.3s', position: 'relative', overflow: 'hidden', cursor: 'grab', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = index === 1 ? '0 20px 25px -5px rgba(249,115,22,0.15)' : '0 20px 25px -5px rgba(0,0,0,0.1)'; }} 
                     onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}>

                     {index === 1 && <div style={{ position: 'absolute', top: 16, right: -30, background: '#ea580c', color: '#fff', padding: '4px 30px', fontSize: '0.7rem', fontWeight: 700, transform: 'rotate(45deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>HOT</div>}

                     <h3 style={{ color: '#111827', fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>{p.package_name.toUpperCase()}</h3>
                     <div style={{ color: index === 1 ? '#ea580c' : '#111827', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
                       {Number(p.price).toLocaleString('vi-VN')}<span>đ</span>
                     </div>
                     <span style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 24 }}>/ {Math.round((p.duration_days || 30) / 30)} tháng</span>

                     <ul style={{ color: '#4b5563', fontSize: '0.88rem', margin: '0 0 32px 0', padding: 0, listStyle: 'none', width: '100%' }}>
                       <li style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 0', display: 'flex', gap: 10 }}><i className="bx bx-check" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i> Truy cập phòng tập 5 sao</li>
                       <li style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 0', display: 'flex', gap: 10 }}><i className="bx bx-check" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i> Lựa chọn thỏa thích bộ môn luyện tập</li>
                       <li style={{ padding: '10px 0', display: 'flex', gap: 10 }}><i className="bx bx-check" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i> Trải nghiệm tủ đồ và khu để xe VIP</li>
                     </ul>

                     <button onClick={() => setCheckoutPkg(p)} disabled={proc || !!activeSub}
                       style={{ width: '100%', background: activeSub ? '#f3f4f6' : (index === 1 ? 'linear-gradient(135deg,#ea580c,#dc2626)' : '#f9fafb'), color: activeSub ? '#9ca3af' : (index === 1 ? '#fff' : '#111827'), border: (index === 1 && !activeSub) ? 'none' : '1px solid #e5e7eb', padding: '12px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: (proc || activeSub) ? 'not-allowed' : 'pointer', marginTop: 'auto', transition: '0.2s' }}>
                       {activeSub ? 'Đã khóa chọn' : 'Chọn mua gói này'}
                     </button>
                   </div>
                 ))}
               </div>
            )}
          </>
        ) : (
           <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
             <button onClick={() => setCheckoutPkg(null)} disabled={proc} style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 24, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#dc2626'} onMouseLeave={e => e.currentTarget.style.color = '#ea580c'}>
               <i className="bx bx-arrow-back"></i> Quay lại chọn gói
             </button>

             <h2 style={{ color: '#111827', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Thanh toán & Cấu hình</h2>
             <p style={{ color: '#6b7280', marginBottom: 32 }}>Thiết lập quá trình tập luyện theo nhu cầu của bạn dưới đây.</p>

             <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

               <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', padding: 20, borderRadius: 12 }}>
                 <strong style={{ color: '#ea580c', fontSize: '1.1rem', display: 'block', marginBottom: 6 }}>{checkoutPkg.package_name.toUpperCase()}</strong>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Thời hạn: <span style={{color: '#111827', fontWeight: 600}}>{Math.round((checkoutPkg.duration_days || 30) / 30)} tháng</span></span>
                   <span style={{ color: '#111827', fontSize: '1.3rem', fontWeight: 800 }}>{Number(checkoutPkg.price).toLocaleString('vi-VN')} đ</span>
                 </div>
               </div>

               <div>
                 <label style={{ display: 'block', color: '#374151', marginBottom: 10, fontSize: '0.95rem', fontWeight: 600 }}>Môn tập mong muốn (Khóa học)</label>
                 <select required value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827', borderRadius: 8, outline: 'none', fontSize: '1rem', transition: 'border 0.2s, box-shadow 0.2s' }} onFocus={e => {e.target.style.border = '1px solid #ea580c'; e.target.style.boxShadow = '0 0 0 2px rgba(234,88,12,0.2)'}} onBlur={e => {e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'}}>
                   {coursesList.map(c => <option key={c} value={c} style={{ background: '#fff' }}>{c}</option>)}
                 </select>
               </div>

               <div>
                 <label style={{ display: 'block', color: '#374151', marginBottom: 10, fontSize: '0.95rem', fontWeight: 600 }}>Huấn luyện viên (Không bắt buộc)</label>
                 <select value={form.trainer_id} onChange={e => setForm({ ...form, trainer_id: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827', borderRadius: 8, outline: 'none', fontSize: '1rem', transition: 'border 0.2s, box-shadow 0.2s' }} onFocus={e => {e.target.style.border = '1px solid #ea580c'; e.target.style.boxShadow = '0 0 0 2px rgba(234,88,12,0.2)'}} onBlur={e => {e.target.style.border = '1px solid #d1d5db'; e.target.style.boxShadow = 'none'}}>
                   <option value="" style={{ background: '#fff' }}>Tự tập (Không cần định hướng PT)</option>
                   {trainers.map(t => <option key={t.trainer_id} value={t.trainer_id} style={{ background: '#fff' }}>{t.full_name} ({t.specialty})</option>)}
                 </select>
               </div>

               <div>
                 <label style={{ display: 'block', color: '#374151', marginBottom: 12, fontSize: '0.95rem', fontWeight: 600 }}>Hình thức thanh toán</label>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                   {['Tiền mặt', 'Chuyển khoản', 'Momo'].map(method => (
                     <label key={method} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: form.payment_method === method ? 'rgba(249,115,22,0.05)' : '#f9fafb', border: form.payment_method === method ? '1px solid #ea580c' : '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: form.payment_method === method ? '0 4px 12px rgba(234,88,12,0.1)' : 'none' }}>
                       <input type="radio" value={method} checked={form.payment_method === method} onChange={e => setForm({ ...form, payment_method: e.target.value })} style={{ accentColor: '#ea580c', transform: 'scale(1.2)' }} />
                       <span style={{ color: form.payment_method === method ? '#111827' : '#4b5563', fontWeight: 600 }}>{method}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                 <button type="submit" disabled={proc} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 8, fontSize: '1.05rem', fontWeight: 700, cursor: proc ? 'not-allowed' : 'pointer', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(239, 68, 68, 0.35)'}} onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.25)'}}>
                   {proc ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
                 </button>
               </div>
             </form>
           </div>
        )}
      </div>

      {/* Modal QR Chuyển khoản */}
      {qrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#ffffff', padding: 30, borderRadius: 24, width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ color: '#111827', marginBottom: 20, fontSize: '1.4rem', fontWeight: 700 }}>Hóa đơn Chuyển khoản</h2>
            <img src={qrModal.qrUrl} style={{ width: '100%', maxWidth: 300, marginBottom: 20, borderRadius: 12, border: '1px solid #e5e7eb', padding: 8 }} alt="QR Code" />

            <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 24, textAlign: 'left', border: '1px solid #f3f4f6' }}>
              <p style={{ marginBottom: 8, fontSize: '0.95rem', color: '#4b5563' }}>Ngân hàng: <strong style={{color: '#111827'}}>{qrModal.bank}</strong></p>
              <p style={{ marginBottom: 8, fontSize: '0.95rem', color: '#4b5563' }}>Số TK: <strong style={{color: '#111827'}}>{qrModal.account}</strong></p>
              <p style={{ marginBottom: 8, fontSize: '0.95rem', color: '#4b5563' }}>Chủ TK: <strong style={{color: '#111827'}}>{qrModal.accountName}</strong></p>
              <p style={{ marginBottom: 8, fontSize: '0.95rem', color: '#4b5563' }}>Số tiền: <strong style={{ color: '#dc2626', fontSize: '1.2rem' }}>{Number(qrModal.price).toLocaleString('vi-VN')} đ</strong></p>
              <p style={{ fontSize: '0.95rem', color: '#4b5563' }}>Nội dung CK: <strong style={{ color: '#2563eb' }}>{qrModal.content}</strong></p>
            </div>

            <button onClick={confirmTransfer} style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 6px rgba(22,163,74,0.25)' }}>
              Xác Nhận Đã Chuyển Tiền
            </button>
            <button onClick={() => setQrModal(null)} style={{ width: '100%', padding: '14px', background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#e5e7eb'} onMouseLeave={e => e.currentTarget.style.background='#f3f4f6'}>
              Hủy bỏ giao dịch
            </button>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {modalData.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div style={{ background: '#ffffff', padding: '40px 32px', borderRadius: 24, width: '100%', maxWidth: 420, textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: modalData.type === 'success' ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 0 30px ${modalData.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <i className={modalData.type === 'success' ? "bx bx-check" : "bx bx-x"} style={{ fontSize: '3rem', color: modalData.type === 'success' ? '#16a34a' : '#dc2626' }}></i>
            </div>
            <h2 style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 800, marginBottom: 14 }}>{modalData.title}</h2>
            <p style={{ color: '#4b5563', fontSize: '1rem', lineHeight: 1.6, marginBottom: 32 }}>{modalData.message}</p>
            <button onClick={() => {
              const cb = modalData.onClose;
              setModalData({ ...modalData, show: false });
              if (cb) cb();
            }} style={{ width: '100%', background: modalData.type === 'success' ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s, transform 0.1s', fontSize: '1.05rem', boxShadow: `0 8px 16px ${modalData.type === 'success' ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}` }} onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
              {modalData.type === 'success' ? 'Tiếp tục' : 'Đã hiểu & Quay lại'}
            </button>
          </div>
        </div>
      )}
    </MemberLayout>
  );
}

export default PaymentPage;
