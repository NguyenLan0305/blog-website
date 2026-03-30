/**
 * nav.js
 * Page navigation, nav link active state, brand click, auth state toggle
 * Search Logic (Debounce, History, Suggestion cho cả Desktop & Mobile)
 * Depends on: app.js (S, initials, callApi), pages.js, posts.js
 */

function navigate(page) {
    S.page = page;

    // Ẩn tất cả các trang, chỉ hiện trang được chọn
    $('#p-home, #p-categories, #p-tags').hide();
    $('#p-' + page).show();

    // Cập nhật trạng thái active trên menu
    $('[data-page]').removeClass('is-active');
    $('[data-page="' + page + '"]').addClass('is-active');

    // Mở khóa các hàm này nếu bạn đã viết xong ở pages.js
    if (page === 'categories' && typeof buildCatPage === 'function') buildCatPage();
    if (page === 'tags' && typeof buildTagsPage === 'function') buildTagsPage();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────── AUTHENTICATION UI TOGGLE ─────────────── */
function updateNavAuth() {
    const isAuth = S.isAuth;
    const uname = S.uname;

    if (isAuth) {
        $('.nav-guest').attr('style', 'display: none !important');
        $('.nav-user').attr('style', 'display: flex !important');

        $('#nav-username, #mob-nav-username').text(uname);

        const userInitials = typeof initials === 'function' ? initials(uname) : uname.charAt(0).toUpperCase();
        $('#nav-avatar, #mob-nav-avatar').text(userInitials);
    } else {
        $('.nav-guest').attr('style', 'display: flex !important');
        $('.nav-user').attr('style', 'display: none !important');
    }
}

/* ─────────────── EVENT LISTENERS CƠ BẢN ─────────────── */
$(document).ready(function() {
    if (typeof updateNavAuth === 'function') {
        updateNavAuth();
    }
});

$(document).on('click', '[data-page]', function(){
    navigate($(this).data('page'));
});

$(document).on('click', '#nav-brand', function(){
    navigate('home');
});

$(document).on('click', '#btn-logout, #btn-mob-logout', function(e) {
    e.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('username');

    updateNavAuth();
    navigate('home');
    toast("Đã đăng xuất thành công!");

    var mobMenuEl = document.getElementById('mob-menu');
    if (mobMenuEl && typeof bootstrap !== 'undefined') {
        var mobMenu = bootstrap.Offcanvas.getInstance(mobMenuEl);
        if (mobMenu) mobMenu.hide();
    }
});

/* ==========================================
   LOGIC TÌM KIẾM: DEBOUNCE + HISTORY + SUGGESTION (BẢN CHUẨN)
   ========================================== */

let searchTimeout = null;

// Lấy lịch sử từ LocalStorage (Tối đa 5 từ khóa)
function getSearchHistory() {
    return JSON.parse(localStorage.getItem('inkwell_history') || '[]');
}

// Lưu từ khóa mới vào Lịch sử
function saveSearchHistory(keyword) {
    if(!keyword) return;
    let history = getSearchHistory();
    history = history.filter(k => k.toLowerCase() !== keyword.toLowerCase());
    history.unshift(keyword); // Thêm vào đầu mảng
    if(history.length > 5) history.pop();
    localStorage.setItem('inkwell_history', JSON.stringify(history));
}

// Hàm render Dropdown (Thông minh: Biết truyền vào $dd nào)
function renderSearchDropdown($dd, keyword, suggestions = []) {
    $dd.empty();

    if (!keyword) {
        // TRƯỜNG HỢP 1: TRỐNG -> Hiện Lịch sử
        const history = getSearchHistory();
        if (history.length === 0) {
            $dd.hide(); return;
        }
        $dd.append('<div class="sd-title">Recent Searches</div>');
        history.forEach(h => {
            $dd.append(`
                <div class="sd-item btn-history" data-key="${h}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>${h}</span>
                </div>
            `);
        });
    } else {
        // TRƯỜNG HỢP 2: ĐANG GÕ -> Hiện Gợi ý
        $dd.append('<div class="sd-title">Suggestions</div>');
        if (suggestions.length === 0) {
            $dd.append('<div class="px-3 py-2 text-muted" style="font-size:0.85rem;">Không tìm thấy kết quả nào.</div>');
        } else {
            suggestions.forEach(b => {
                // 🔥 SỬA Ở ĐÂY: Đổi thẻ <a> thành thẻ <div> (class="btn-suggestion") để không bị nhảy trang
                $dd.append(`
                    <div class="sd-item text-decoration-none d-flex align-items-center btn-suggestion" data-title="${b.title}">
                        <div style="background: rgba(124,111,247,0.1); border-radius: 6px; padding: 6px; margin-right: 12px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                            <div class="text-truncate fw-semibold" style="color: var(--t1); font-size: 0.9rem;">${b.title}</div>
                            <div class="text-truncate" style="color: var(--t3); font-size: 0.75rem; margin-top: 2px;">
                                <span style="color: var(--purple); font-weight: 500;">@${b.authorName || 'Anonymous'}</span> · ${b.categoryName || 'Khác'}
                            </div>
                        </div>
                    </div>
                `);
            });
        }
    }
    $dd.show();
}

// 1. Lắng nghe sự kiện GÕ PHÍM trên CẢ 2 Ô
$(document).on('input', '#nav-search-input, #mob-search-input', function() {
    clearTimeout(searchTimeout);
    const keyword = $(this).val().trim();

    const isMobile = $(this).attr('id') === 'mob-search-input';
    const $dd = isMobile ? $('#mob-search-dropdown') : $('#desk-search-dropdown');

    if (keyword.length === 0) {
        renderSearchDropdown($dd, '');
        return;
    }

    searchTimeout = setTimeout(() => {
        callApi('/blogs/search/suggestions?keyword=' + encodeURIComponent(keyword), 'GET')
            .done(function(res) {
                renderSearchDropdown($dd, keyword, res.result || res);
            });
    }, 300);
});

// 2. Click vào ô Input -> Hiện lịch sử
$(document).on('focus', '#nav-search-input, #mob-search-input', function() {
    const keyword = $(this).val().trim();
    const isMobile = $(this).attr('id') === 'mob-search-input';
    const $dd = isMobile ? $('#mob-search-dropdown') : $('#desk-search-dropdown');

    if (keyword.length === 0) renderSearchDropdown($dd, '');
});

// 3. Ẩn Dropdown khi click ra ngoài
$(document).on('click', function(e) {
    if (!$(e.target).closest('.search-wrapper').length) {
        $('#desk-search-dropdown, #mob-search-dropdown').hide();
    }
});

// 4. BẮT SỰ KIỆN: BẤM ENTER HOẶC CLICK VÀO LỊCH SỬ / GỢI Ý ĐỂ LỌC DANH SÁCH
function executeSearch(keyword) {
    if(!keyword) return;

    // Điền chữ vào ô input
    $('#nav-search-input, #mob-search-input').val(keyword);

    saveSearchHistory(keyword);
    $('#desk-search-dropdown, #mob-search-dropdown').hide();

    // Lưu vào State và Đổi URL (Dùng ?q= thay vì /search để tránh lỗi 404 trên IntelliJ)
    S.keyword = keyword;
    S.cat = null;
    S.tag = null;
    window.history.pushState({}, '', '?q=' + encodeURIComponent(keyword));

    // Ra lệnh nạp lại Lưới bài viết ở dưới
    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderPosts === 'function') renderPosts();

    // Tự đóng menu Mobile nếu đang tìm bằng đt
    var mobMenuEl = document.getElementById('mob-menu');
    if (mobMenuEl && typeof bootstrap !== 'undefined') {
        var mobMenu = bootstrap.Offcanvas.getInstance(mobMenuEl);
        if (mobMenu) mobMenu.hide();
    }
}

// Khi nhấn Enter
$(document).on('keypress', '#nav-search-input, #mob-search-input', function(e) {
    if (e.which === 13) {
        e.preventDefault();
        executeSearch($(this).val().trim());
    }
});

// Khi bấm vào 1 dòng Lịch sử
$(document).on('click', '.btn-history', function() {
    executeSearch($(this).data('key'));
});

// 🔥 Khi bấm vào 1 dòng Gợi ý (Đổi logic: Lọc danh sách thay vì chuyển trang)
$(document).on('click', '.btn-suggestion', function() {
    executeSearch($(this).data('title'));
});