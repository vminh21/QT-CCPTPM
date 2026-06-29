import { useEffect, useState, useRef, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import '../../components/layout/AdminLayout.css';
import { blogsApi } from '../../api/blogs';
import { getBlogImageUrl } from '../../config';

function Toast({ t }) {
  if (!t.show) return null;
  return <div style={{position:'fixed',top:20,right:20,padding:'12px 20px',borderRadius:10,zIndex:9999,background:t.type==='success'?'#1a2d1a':'#2d1a1a',border:`1px solid ${t.type==='success'?'#22c55e':'#ef4444'}`,color:t.type==='success'?'#86efac':'#fca5a5'}}>{t.msg}</div>;
}

function BlogPage() {
  const [blogs, setBlogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ id: '', title: '', content: '' });
  const [toast, setToast]     = useState({ show:false, msg:'', type:'success' });
  const [previewImg, setPreviewImg] = useState(null); // preview ảnh mới chọn
  const formRef = useRef(null);
  const fileRef = useRef(null);

  const showToast = (msg, type='success') => { setToast({show:true,msg,type}); setTimeout(()=>setToast({show:false,msg:'',type:'success'}),3500); };

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try { const res = await blogsApi.list(); setBlogs(res.data.data||[]); }
    catch { showToast('Lỗi tải dữ liệu!','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài viết này?')) return;
    try {
      await blogsApi.delete(id);
      showToast('Đã xóa!'); fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Lỗi xóa bài viết!','error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    try {
      await (form.id ? blogsApi.update(form.id, fd) : blogsApi.create(fd));
      showToast('Lưu thành công!');
      setForm({id:'', title:'', content:''});
      setPreviewImg(null);
      formRef.current.reset();
      fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Lưu thất bại!','error');
    }
  };

  const handleEdit = (b) => {
    setForm({ id: b.blog_id, title: b.title, content: b.content });
    setPreviewImg(getBlogImageUrl(b.image));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm({id:'', title:'', content:''});
    setPreviewImg(null);
    if (formRef.current) formRef.current.reset();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImg(URL.createObjectURL(file));
    else setPreviewImg(null);
  };

  return (
    <AdminLayout title="Quản lý tin tức">
      <Toast t={toast} />

      <div style={{background:'#fff', borderRadius:12, padding:'24px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <h2 style={{fontSize:'1.2rem', color:'#111', marginBottom:20}}>{form.id ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h2>
        <form ref={formRef} onSubmit={handleSave} encType="multipart/form-data">
          <div className="form-row">
            <div className="form-group">
              <label style={{color:'#444'}}>Tiêu đề bài viết</label>
              <input name="title" required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Nhập tiêu đề..." style={{background:'#fff', border:'1px solid #ddd', color:'#333'}} />
            </div>
            <div className="form-group">
              <label style={{color:'#444'}}>Hình ảnh (Chấp nhận .jpg, .png)</label>
              <input type="file" name="image_file" ref={fileRef} accept="image/jpeg,image/png" onChange={handleFileChange}
                style={{background:'#fff', border:'1px solid #ddd', color:'#333', padding:'7px'}} />
              {previewImg && (
                <div style={{marginTop:8}}>
                  <img src={previewImg} alt="preview" style={{maxHeight:80, borderRadius:6, border:'1px solid #ddd', objectFit:'cover'}}
                    onError={e => e.target.style.display='none'} />
                  <span style={{marginLeft:8, fontSize:'0.8rem', color:'#888'}}>
                    {form.id ? 'Ảnh hiện tại (chọn file mới để thay)' : 'Preview'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label style={{color:'#444'}}>Nội dung bài viết (Dùng *text* để in đậm)</label>
            <textarea name="content" required value={form.content} onChange={e => setForm(f=>({...f,content:e.target.value}))} placeholder="Nhập nội dung chi tiết..."
              style={{width:'100%',minHeight:140,background:'#fff',border:'1px solid #ddd',borderRadius:8,color:'#333',padding:'10px 14px',fontSize:'0.9rem',outline:'none',resize:'vertical'}}></textarea>
          </div>
          <div style={{display:'flex', gap:10}}>
            <button type="submit" className="btn-primary" style={{background:'#ff5252', padding:'10px 24px'}}>{form.id ? 'Cập nhật bài viết' : 'Đăng bài viết'}</button>
            {form.id && <button type="button" className="btn-cancel" onClick={handleCancel} style={{background:'#f1f1f1', color:'#333'}}>Hủy sửa</button>}
          </div>
        </form>
      </div>

      <div className="admin-table-wrap" style={{background:'#fff', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
        <div className="table-header-row" style={{borderBottom:'none', paddingBottom:10}}>
          <h2 style={{color:'#111'}}>Danh sách Bài viết / Tin tức</h2>
        </div>
        <div style={{padding:'0 24px 20px', color:'#555'}}>
          <table className="admin-table">
            <thead><tr><th>ẢNH</th><th>TIÊU ĐỀ</th><th>NGÀY TẠO</th><th>THAO TÁC</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={4} style={{textAlign:'center',padding:24,color:'#555'}}>Đang tải...</td></tr>
                : blogs.length === 0
                  ? <tr><td colSpan={4} style={{textAlign:'center',padding:24,color:'#555'}}>Không có bài viết</td></tr>
                  : blogs.map(b => {
                    const imgUrl = getBlogImageUrl(b.image);
                    return (
                      <tr key={b.blog_id}>
                        <td>
                          {imgUrl
                            ? <img src={imgUrl} alt="" style={{width:70, height:45, objectFit:'cover', borderRadius:6}}
                                onError={e => e.target.style.display='none'} />
                            : <span style={{color:'#999',fontSize:'0.8rem'}}>Không ảnh</span>
                          }
                        </td>
                        <td style={{textAlign:'left'}}>
                          <strong style={{color:'#333'}}>{b.title}</strong>
                          <br/><small style={{color:'#999'}}>{(b.content||'').substring(0,60)}...</small>
                        </td>
                        <td style={{color:'#666'}}>{b.created_at ? new Date(b.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                        <td>
                          <button className="btn-icon edit" title="Sửa" onClick={() => handleEdit(b)}><i className="bx bxs-edit"></i></button>
                          <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(b.blog_id)}><i className="bx bxs-trash"></i></button>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default BlogPage;
