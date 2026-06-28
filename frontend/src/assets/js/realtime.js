/**
 * FitPhysique Real-time Engine
 * ===========================
 * Polling-based real-time updates cho gym website.
 * Hoạt động với PHP/Apache (không cần WebSocket).
 *
 * Tính năng:
 *  - Auto-update notification badge (30s)
 *  - Toast pop-up khi có thông báo mới
 *  - Cập nhật lịch tập member (15s)
 *  - PT Dashboard live update (20s)
 */

;(function (window) {
    'use strict';

    /* =====================================================================
       CONFIG
       ===================================================================== */
    const RT_CONFIG = {
        POLL_INTERVAL_NOTIF:    30 * 1000,   // 30 giây — thông báo
        POLL_INTERVAL_SCHEDULE: 15 * 1000,   // 15 giây — lịch tập member
        POLL_INTERVAL_PT:       20 * 1000,   // 20 giây — PT dashboard
        API_REALTIME:           'api/realtime.php?action=poll',
        API_NOTIFICATIONS:      'api/notifications.php',
        API_PT_SCHEDULE:        '../api/pt.php?action=schedules',
        API_MEMBER_SCHEDULE:    '../api/notifications.php?action=list',
        TOAST_DURATION:         5000,        // 5 giây
    };

    /* =====================================================================
       STATE
       ===================================================================== */
    let _lastNotifId   = null;
    let _lastSchedCnt  = null;   // PT: tổng số lịch dạy
    let _intervals     = [];

    /* =====================================================================
       TOAST SYSTEM (Drop-down from top-center)
       ===================================================================== */

    /** Tạo container toast nếu chưa có */
    function _ensureToastContainer() {
        if (document.getElementById('rt-toast-container')) return;
        const container = document.createElement('div');
        container.id = 'rt-toast-container';
        container.style.cssText = `
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            pointer-events: none;
            width: max-content;
            max-width: 90vw;
        `;
        document.body.appendChild(container);
    }

    /**
     * Hiển thị toast notification (drop from top-center)
     * @param {string} title
     * @param {string} message
     * @param {'info'|'success'|'warning'|'error'} type
     */
    function showToast(title, message, type = 'info') {
        _ensureToastContainer();
        const container = document.getElementById('rt-toast-container');

        const colors = {
            info:    { bg: '#1e293b', accent: '#3b82f6', icon: '🔔' },
            success: { bg: '#14532d', accent: '#22c55e', icon: '✅' },
            warning: { bg: '#431407', accent: '#f59e0b', icon: '⚠️' },
            error:   { bg: '#450a0a', accent: '#ef4444', icon: '❌' },
        };
        const c = colors[type] || colors.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${c.bg};
            border-left: 4px solid ${c.accent};
            color: #f8fafc;
            padding: 14px 20px;
            border-radius: 12px;
            min-width: 280px;
            max-width: 420px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            pointer-events: all;
            cursor: pointer;
            transform: translateY(-120%);
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
            font-family: 'Poppins', sans-serif;
            text-align: center;
        `;
        toast.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:10px;">
                <span style="font-size:1.3rem;flex-shrink:0;line-height:1.3">${c.icon}</span>
                <div style="flex:1;min-width:0;text-align:left;">
                    <p style="font-weight:700;font-size:0.92rem;margin:0 0 3px;color:#fff;">${title}</p>
                    <p style="font-size:0.82rem;margin:0;color:#cbd5e1;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${message}</p>
                </div>
                <button onclick="this.closest('div').parentElement.remove()" style="background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;padding:0;line-height:1;flex-shrink:0;margin-top:-2px;" title="Đóng">×</button>
            </div>
        `;

        // Click vào toast → mở dropdown
        toast.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') return;
            const bell = document.getElementById('notif-bell');
            if (bell) bell.click();
            toast.remove();
        });

        container.appendChild(toast);

        // Animate xuống
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.transform = 'translateY(0)';
                toast.style.opacity   = '1';
            });
        });

        // Tự đóng sau TOAST_DURATION
        setTimeout(() => {
            toast.style.transform = 'translateY(-120%)';
            toast.style.opacity   = '0';
            setTimeout(() => toast.remove(), 400);
        }, RT_CONFIG.TOAST_DURATION);
    }

    /* =====================================================================
       NOTIFICATION BADGE UPDATER
       ===================================================================== */

    /**
     * Cập nhật badge số thông báo trên navbar
     */
    function _updateBadge(count) {
        const badge = document.getElementById('notif-count');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /* =====================================================================
       POLLING: MEMBER — thông báo + lịch tập
       ===================================================================== */

    async function _pollMember() {
        try {
            // Dùng endpoint thực tế chứa trong index.php — path tương đối
            const BASE = (window.RT_BASE_PATH || '');
            const res  = await fetch(BASE + 'api/realtime.php?action=poll', { cache: 'no-store' });
            if (!res.ok) return;
            const json = await res.json();
            if (!json.success) return;

            const data = json.data;

            // 1) Cập nhật badge
            _updateBadge(data.notif_count || 0);

            // 2) Phát hiện thông báo MỚI → hiện toast
            if (data.latest_notif_id !== null) {
                if (_lastNotifId === null) {
                    // Lần đầu poll — chỉ ghi nhớ, không toast
                    _lastNotifId = data.latest_notif_id;
                } else if (data.latest_notif_id > _lastNotifId) {
                    // Có thông báo mới!
                    _lastNotifId = data.latest_notif_id;
                    showToast(
                        '🔔 Thông báo mới từ FitPhysique',
                        'Bạn có thông báo mới. Nhấn để xem.',
                        'info'
                    );
                }
            }

            // 3) Phát hiện lịch tập MỚI cần xác nhận → toast cho member
            if (data.pending_schedules > 0 && data.pending_schedules !== _lastPendingCount) {
                if (_lastPendingCount !== null && data.pending_schedules > _lastPendingCount) {
                    showToast(
                        '📅 Lịch tập mới cần xác nhận!',
                        `Bạn có ${data.pending_schedules} lịch tập chờ xác nhận.`,
                        'warning'
                    );
                }
                _lastPendingCount = data.pending_schedules;
            } else if (data.pending_schedules === 0) {
                _lastPendingCount = 0;
            }

        } catch (e) {
            // Silent fail — không crash UI
        }
    }

    let _lastPendingCount = null;

    /* =====================================================================
       POLLING: PT DASHBOARD — lịch dạy
       ===================================================================== */

    let _ptTableCallback = null;  // callback để render lại bảng

    async function _pollPT() {
        try {
            const BASE   = (window.RT_BASE_PATH || '');
            const res    = await fetch(BASE + 'api/realtime.php?action=poll', { cache: 'no-store' });
            if (!res.ok) return;
            const json = await res.json();
            if (!json.success) return;

            const data = json.data;
            const total = data.total_schedules ?? null;

            if (total === null) return;

            if (_lastSchedCnt === null) {
                _lastSchedCnt = total;
            } else if (total !== _lastSchedCnt) {
                const diff = total - _lastSchedCnt;
                _lastSchedCnt = total;

                if (diff > 0) {
                    showToast('📅 Lịch dạy cập nhật', `Có ${diff} lịch mới vừa được thêm.`, 'info');
                }

                // Gọi callback để refresh bảng
                if (typeof _ptTableCallback === 'function') {
                    _ptTableCallback();
                }
            }
        } catch (e) {
            // Silent fail
        }
    }

    /* =====================================================================
       POLLING: MEMBER SCHEDULE SECTION (member_profile.php)
       ===================================================================== */

    let _scheduleCallback = null;

    async function _pollMemberSchedule() {
        if (typeof _scheduleCallback === 'function') {
            try {
                await _scheduleCallback();
            } catch (e) { /* silent */ }
        }
    }

    /* =====================================================================
       PUBLIC API
       ===================================================================== */

    const Realtime = {

        /**
         * Khởi động polling cho member (index.php)
         * @param {string} [basePath=''] đường dẫn gốc tới api/
         */
        startMemberPolling(basePath = '') {
            window.RT_BASE_PATH = basePath;
            _pollMember(); // Chạy ngay lập tức
            const id = setInterval(_pollMember, RT_CONFIG.POLL_INTERVAL_NOTIF);
            _intervals.push(id);
        },

        /**
         * Khởi động polling cho PT dashboard
         * @param {Function} refreshCallback hàm sẽ được gọi khi có lịch mới
         * @param {string}   [basePath='']
         */
        startPTPolling(refreshCallback, basePath = '') {
            window.RT_BASE_PATH = basePath;
            _ptTableCallback = refreshCallback;
            _pollPT();
            const id = setInterval(_pollPT, RT_CONFIG.POLL_INTERVAL_PT);
            _intervals.push(id);
        },

        /**
         * Khởi động polling cho member schedule tab (member_profile.php)
         * @param {Function} refreshCallback  async hàm refresh danh sách lịch
         */
        startSchedulePolling(refreshCallback) {
            _scheduleCallback = refreshCallback;
            const id = setInterval(_pollMemberSchedule, RT_CONFIG.POLL_INTERVAL_SCHEDULE);
            _intervals.push(id);
        },

        /** Dừng tất cả polling (cleanup) */
        stop() {
            _intervals.forEach(clearInterval);
            _intervals = [];
        },

        /** Expose showToast ra ngoài để dùng ở nơi khác */
        showToast,
    };

    window.FitRealtime = Realtime;

})(window);
