import { useEffect, useState } from 'react';
import { PTLayout } from '../../components/layout/PTLayout';
import '../../components/layout/AdminLayout.css';
import './PT.css';
import { ptApi } from '../../api/pt';

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    ptApi.getStudents()
      .then(r => setStudents(r.data.data||[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PTLayout title="Học viên của tôi">
      <div className="admin-table-wrap">
        <div className="table-header-row"><h2>Danh sách học viên ({students.length})</h2></div>
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Họ tên</th><th>Điện thoại</th><th>Địa chỉ</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{textAlign:'center',padding:24,color:'#555'}}>Đang tải...</td></tr>
            : students.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',padding:24,color:'#555'}}>Chưa có học viên</td></tr>
            : students.map(s => (
              <tr key={s.member_id}>
                <td style={{color:'#555'}}>#{s.member_id}</td>
                <td><strong style={{color:'#333'}}>{s.full_name}</strong></td>
                <td style={{color:'#888'}}>{s.phone_number||s.phone||'—'}</td>
                <td style={{color:'#888'}}>{s.address||'—'}</td>
                <td><span className="pt-badge">Đang tập</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PTLayout>
  );
}

export default StudentsPage;
