import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { reportsApi } from '../../api/reports';

function ReportsPage() {
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [years,   setYears]   = useState([]);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.years().then(r => {
      const yrs = r.data.data || [];
      setYears(yrs);
      if (yrs.length > 0 && !yrs.includes(year)) setYear(yrs[0]);
    });
  }, []);

  useEffect(() => {
    if (!year) return;
    setLoading(true);
    reportsApi.get(year).then(r => {
      setData(r.data.data);
    }).finally(() => setLoading(false));
  }, [year]);

  const formatMoney = (n) => Number(n||0).toLocaleString('vi-VN') + 'đ';

  const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

  const monthly = data?.monthly_revenue || [];
  const maxRev  = Math.max(...monthly.map(m => Number(m.revenue||0)), 1);

  // Gender Stats processing
  const genderStats = data?.gender_stats || { Male: 0, Female: 0 };
  const totalUsers = genderStats.Male + genderStats.Female;
  const malePercent = totalUsers > 0 ? (genderStats.Male / totalUsers) * 100 : 0;
  const femalePercent = totalUsers > 0 ? (genderStats.Female / totalUsers) * 100 : 0;

  // Package Stats processing
  const packageStats = data?.package_stats || [];
  const maxPkgCount = Math.max(...packageStats.map(p => p.count), 1);

  return (
    <AdminLayout title="Báo cáo & Thống kê">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <h2 style={{color:'#111',fontSize:'1.1rem'}}>Dữ liệu năm:</h2>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          style={{background:'#fff',border:'1px solid #ddd',borderRadius:8,color:'#333',padding:'8px 14px',outline:'none',fontSize:'0.95rem',boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
          {!years.includes(year) && <option value={year}>{year}</option>}
        </select>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{marginBottom:28}}>
        {[
          { label:'Tổng doanh thu', value: loading?'...':formatMoney(data?.total_revenue??0), icon:'bx-credit-card-alt', color:'#f97316', bg:'rgba(249,115,22,0.1)' },
          { label:'Tổng giao dịch', value: loading?'...': (data?.total_transactions??0), icon:'bx-receipt', color:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
          { label:'Đăng ký mới',    value: loading?'...': (data?.new_registrations??0), icon:'bx-user-plus', color:'#22c55e', bg:'rgba(34,197,94,0.1)' },
          { label:'Lượt gia hạn',   value: loading?'...': (data?.renewals??0), icon:'bx-refresh', color:'#a855f7', bg:'rgba(168,85,247,0.1)' },
        ].map((s,i) => (
          <div className="stat-card" key={i} style={{background:'#fff',padding:24,borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'flex-start',boxShadow:'0 2px 8px rgba(0,0,0,0.02)',border:'1px solid #f1f1f1'}}>
            <div>
              <p style={{color:'#666',fontSize:'0.9rem',marginBottom:8,fontWeight:500}}>{s.label}</p>
              <h3 style={{color:'#111',fontSize:'1.5rem',fontWeight:700}}>{s.value}</h3>
            </div>
            <div style={{width:48,height:48,borderRadius:12,background:s.bg,display:'flex',justifyContent:'center',alignItems:'center'}}>
              <i className={`bx ${s.icon}`} style={{fontSize:'1.8rem',color:s.color}}></i>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24,marginBottom:24}}>
        {/* Monthly Revenue Chart */}
        <div className="admin-table-wrap" style={{padding:'24px',background:'#fff',border:'none',boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
          <h2 style={{color:'#111',fontSize:'1.1rem',marginBottom:24}}>Doanh thu theo tháng</h2>
          {loading ? <p style={{color:'#666',textAlign:'center',padding:30}}>Đang tải...</p> : (
            <div style={{display:'flex',alignItems:'flex-end',gap:12,height:220}}>
              {MONTHS.map((m, i) => {
                const row = monthly.find(r => Number(r.month)===i+1);
                const rev = Number(row?.revenue||0);
                const h   = maxRev > 0 ? (rev / maxRev) * 180 : 0;
                return (
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                    <div style={{fontSize:'0.75rem',color:'#666',fontWeight:600}} title={formatMoney(rev)}>
                      {rev > 0 ? (rev/1000000).toFixed(1)+'M' : ''}
                    </div>
                    <div style={{width:'100%',maxWidth:40,height:`${h}px`,background:'linear-gradient(180deg,#f97316,#ff9c5a)',borderRadius:'6px 6px 0 0',minHeight: rev>0?4:0,transition:'height 0.5s ease',cursor:'pointer'}} title={`${m}: ${formatMoney(rev)}`}></div>
                    <span style={{fontSize:'0.85rem',color:'#888',fontWeight:500}}>{m}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Demographics */}
        <div className="admin-table-wrap" style={{padding:'24px',background:'#fff',border:'none',boxShadow:'0 2px 8px rgba(0,0,0,0.02)',display:'flex',flexDirection:'column'}}>
          <h2 style={{color:'#111',fontSize:'1.1rem',marginBottom:24}}>Phân bố giới tính</h2>
          {loading ? <p style={{color:'#666',textAlign:'center'}}>Đang tải...</p> : (
            <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,color:'#333'}}>
                <strong>Nam: {genderStats.Male}</strong>
                <strong>Nữ: {genderStats.Female}</strong>
              </div>
              <div style={{width:'100%',height:24,borderRadius:12,background:'#f1f1f1',display:'flex',overflow:'hidden',marginBottom:16}}>
                <div style={{width:`${malePercent}%`,background:'#3b82f6',transition:'width 0.5s ease'}} title={`Nam: ${malePercent.toFixed(1)}%`}></div>
                <div style={{width:`${femalePercent}%`,background:'#ec4899',transition:'width 0.5s ease'}} title={`Nữ: ${femalePercent.toFixed(1)}%`}></div>
              </div>
              <div style={{display:'flex',justifyContent:'center',gap:16,fontSize:'0.9rem',color:'#666'}}>
                <span style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:12,height:12,borderRadius:'50%',background:'#3b82f6'}}></div> Nam ({malePercent.toFixed(1)}%)</span>
                <span style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:12,height:12,borderRadius:'50%',background:'#ec4899'}}></div> Nữ ({femalePercent.toFixed(1)}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
        {/* Package Popularity */}
        <div className="admin-table-wrap" style={{padding:'24px',background:'#fff',border:'none',boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
          <h2 style={{color:'#111',fontSize:'1.1rem',marginBottom:24}}>Mức độ phổ biến của gói tập</h2>
          {loading ? <p style={{color:'#666'}}>Đang tải...</p> : (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {packageStats.map((p, i) => (
                <div key={i}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.9rem',marginBottom:6,color:'#333'}}>
                    <span>{p.name}</span>
                    <strong style={{color:'#f97316'}}>{p.count} lượt</strong>
                  </div>
                  <div style={{width:'100%',height:8,background:'#f1f1f1',borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:`${(p.count/maxPkgCount)*100}%`,height:'100%',background:'linear-gradient(90deg,#f97316,#ff9c5a)',borderRadius:4}}></div>
                  </div>
                </div>
              ))}
              {packageStats.length === 0 && <p style={{color:'#888',fontSize:'0.9rem'}}>Chưa có dữ liệu</p>}
            </div>
          )}
        </div>

        {/* Top Spenders */}
        <div className="admin-table-wrap" style={{background:'#fff',border:'none',boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
          <div style={{padding:'24px 24px 10px'}}><h2 style={{color:'#111',fontSize:'1.1rem'}}>Top 5 Hội viên chi tiêu</h2></div>
          {loading ? <p style={{padding:'0 24px 24px',color:'#666'}}>Đang tải...</p> : (
            <table className="admin-table">
              <thead><tr><th>Hội viên</th><th style={{textAlign:'right'}}>Tổng chi tiêu</th></tr></thead>
              <tbody>
                {(data?.top_spenders||[]).map((t, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(249,115,22,0.1)',color:'#f97316',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.9rem'}}>{i+1}</div>
                        <strong style={{color:'#333'}}>{t.full_name}</strong>
                      </div>
                    </td>
                    <td style={{textAlign:'right',color:'#22c55e',fontWeight:600}}>{formatMoney(t.total)}</td>
                  </tr>
                ))}
                {!(data?.top_spenders?.length) && <tr><td colSpan={2} style={{textAlign:'center',color:'#888'}}>Không có dữ liệu</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="admin-table-wrap" style={{background:'#fff',border:'none',boxShadow:'0 2px 8px rgba(0,0,0,0.02)',marginBottom:30}}>
        <div style={{padding:'24px 24px 10px'}}><h2 style={{color:'#111',fontSize:'1.1rem'}}>Giao dịch gần đây</h2></div>
        {loading ? <p style={{padding:'0 24px 24px',color:'#666'}}>Đang tải...</p> : (
          <table className="admin-table">
            <thead><tr><th>Hội viên</th><th>Loại</th><th>Gói tập</th><th>Số tiền</th><th>Ngày giao dịch</th></tr></thead>
            <tbody>
              {(data?.recent_transactions||[]).map((rt, i) => (
                <tr key={i}>
                  <td><strong style={{color:'#333'}}>{rt.full_name}</strong></td>
                  <td>
                    <span style={{padding:'4px 10px',background:rt.transaction_type==='Registration'?'rgba(34,197,94,0.1)':'rgba(59,130,246,0.1)',color:rt.transaction_type==='Registration'?'#16a34a':'#2563eb',borderRadius:6,fontSize:'0.85rem',fontWeight:600}}>
                      {rt.transaction_type === 'Registration' ? 'Đăng ký mới' : 'Gia hạn'}
                    </span>
                  </td>
                  <td style={{color:'#666'}}>{rt.package_name || '—'}</td>
                  <td style={{color:'#22c55e',fontWeight:600}}>{formatMoney(rt.amount)}</td>
                  <td style={{color:'#888'}}>{new Date(rt.transaction_date).toLocaleDateString('vi-VN')} {new Date(rt.transaction_date).toLocaleTimeString('vi-VN')}</td>
                </tr>
              ))}
              {!(data?.recent_transactions?.length) && <tr><td colSpan={5} style={{textAlign:'center',color:'#888'}}>Không có giao dịch</td></tr>}
            </tbody>
          </table>
        )}
      </div>

    </AdminLayout>
  );
}

export default ReportsPage;
