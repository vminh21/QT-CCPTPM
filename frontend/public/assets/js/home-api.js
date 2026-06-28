/**
 * home-api.js
 * Fetch dữ liệu từ API cho trang chủ (Trainers và Blogs)
 * File này được load sau main.js trên index.php
 */

// ── Load trainers ────────────────────────────────────────────────────────
async function loadTrainers() {
    const grid = document.getElementById('trainer-grid');
    if (!grid) return;

    try {
        const res = await fetch('api/trainers.php?limit=4');
        const json = await res.json();

        if (!json.success || !json.data.length) {
            grid.innerHTML = '<p style="text-align:center;color:#888;">Chưa có dữ liệu huấn luyện viên.</p>';
            return;
        }

        const isLoggedIn = SESSION && SESSION.loggedIn;
        const reviewUrl = isLoggedIn ? 'rate_trainers.php' : 'Form_Login_Logout/login.php';

        grid.innerHTML = json.data.map(t => {
            const rating = parseFloat(t.calculated_rating || 5).toFixed(1);
            const ratingInt = Math.round(rating);
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += i <= ratingInt
                    ? '<i class="ri-star-fill"></i>'
                    : '<i class="ri-star-line"></i>';
            }

            const img = t.image ? `assets/${t.image}` : 'assets/banner-3.png';

            // Các social links (chỉ hiện nếu không rỗng / không #)
            let socials = '';
            if (t.facebook_url && t.facebook_url !== '#')
                socials += `<a href="${escHtml(t.facebook_url)}"><i class="ri-facebook-fill"></i></a>`;
            if (t.twitter_url && t.twitter_url !== '#')
                socials += `<a href="${escHtml(t.twitter_url)}"><i class="ri-twitter-fill"></i></a>`;
            if (t.youtube_url && t.youtube_url !== '#')
                socials += `<a href="${escHtml(t.youtube_url)}"><i class="ri-youtube-fill"></i></a>`;

            return `
                <div class="trainer__card">
                    <img src="${escHtml(img)}" alt="trainer" />
                    <h4>${escHtml(t.full_name)}</h4>
                    <p>${escHtml(t.specialty)}</p>
                    <div class="trainer__rating">
                        ${stars}
                        <span>${rating}</span>
                    </div>
                    <div class="trainer__socials">${socials}</div>
                    <a href="${escHtml(reviewUrl)}" class="trainer__review-btn">
                        <i class="ri-star-smile-line"></i> Đánh giá HLV
                    </a>
                </div>
            `;
        }).join('');

        // Nút CTA bên dưới
        const ctaArea = document.getElementById('trainer-cta');
        if (ctaArea) {
            if (isLoggedIn) {
                ctaArea.innerHTML = `
                    <a href="rate_trainers.php" class="btn btn__primary">
                        <i class="ri-star-smile-line"></i>&nbsp;Đánh giá tất cả HLV
                    </a>`;
            } else {
                ctaArea.innerHTML = `
                    <a href="Form_Login_Logout/login.php" class="btn btn__primary">
                        <i class="ri-login-box-line"></i>&nbsp;Đăng nhập để đánh giá HLV
                    </a>`;
            }
        }

        // Kích hoạt lại ScrollReveal cho trainer cards
        if (typeof ScrollReveal !== 'undefined') {
            ScrollReveal().reveal('.trainer__card', {
                distance: '50px', origin: 'bottom', duration: 1000, interval: 500
            });
        }
    } catch (err) {
        console.error('[home-api] loadTrainers error:', err);
        grid.innerHTML = '<p style="text-align:center;color:#e74c3c;">Không thể tải dữ liệu. Vui lòng thử lại.</p>';
    }
}

// ── Load blogs ───────────────────────────────────────────────────────────
async function loadBlogs() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    try {
        const res = await fetch('api/blogs.php?limit=4');
        const json = await res.json();

        if (!json.success || !json.data.length) {
            grid.innerHTML = '<p style="text-align:center;color:#888;">Chưa có bài viết nào.</p>';
            return;
        }

        grid.innerHTML = json.data.map(b => {
            const img = b.image ? `assets/${b.image}` : 'assets/banner-3.png';
            // Cắt ngắn content, strip tags giả bản
            const preview = (b.content || '')
                .replace(/<[^>]*>/g, '')
                .replace(/\*/g, '')
                .substring(0, 80) + '...';

            return `
                <a href="blog_Notification/blog-detail.php?id=${escHtml(b.blog_id)}" class="blog__card">
                    <img src="${escHtml(img)}" alt="blog" />
                    <h4>${escHtml(b.title)}</h4>
                    <p>${escHtml(preview)}</p>
                </a>
            `;
        }).join('');

        // Kích hoạt lại ScrollReveal cho blog cards
        if (typeof ScrollReveal !== 'undefined') {
            ScrollReveal().reveal('.blog__card', {
                distance: '50px', origin: 'bottom', duration: 1000, interval: 500
            });
        }
    } catch (err) {
        console.error('[home-api] loadBlogs error:', err);
        grid.innerHTML = '<p style="text-align:center;color:#e74c3c;">Không thể tải bài viết. Vui lòng thử lại.</p>';
    }
}

// ── Escape HTML helper ───────────────────────────────────────────────────
function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ── Init ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadTrainers();
    loadBlogs();
});
