/**
 * nav.js
 * Page navigation: navigate(), nav link active state, brand click, auth state toggle
 * Depends on: app.js (S, initials), pages.js
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
    // Đọc trực tiếp từ kho để đảm bảo dữ liệu mới nhất (Giờ dùng luôn S.isAuth và S.uname từ app.js cho chuẩn)
    const isAuth = S.isAuth;
    const uname = S.uname;

    if (isAuth) {
        // TRẠNG THÁI: ĐÃ ĐĂNG NHẬP
        $('.nav-guest').attr('style', 'display: none !important'); // Ẩn triệt để
        $('.nav-user').attr('style', 'display: flex !important');  // Hiện cụm user

        // Đổ dữ liệu vào cả Desktop và Mobile
        $('#nav-username, #mob-nav-username').text(uname);

        // Dùng hàm initials từ app.js
        const userInitials = typeof initials === 'function' ? initials(uname) : uname.charAt(0).toUpperCase();
        $('#nav-avatar, #mob-nav-avatar').text(userInitials);
    } else {
        // TRẠNG THÁI: CHƯA ĐĂNG NHẬP
        $('.nav-guest').attr('style', 'display: flex !important');
        $('.nav-user').attr('style', 'display: none !important');
    }
}

/* ─────────────── EVENT LISTENERS ─────────────── */
$(document).ready(function() {
    // Gọi thử 1 lần để update navbar khi vừa load trang
    if (typeof updateNavAuth === 'function') {
        updateNavAuth();
    }
});

// Bắt sự kiện chuyển trang (Event Delegation)
$(document).on('click', '[data-page]', function(){
    navigate($(this).data('page'));
});

// Bắt sự kiện click vào logo
$(document).on('click', '#nav-brand', function(){
    navigate('home');
});

// Xử lý nút ĐĂNG XUẤT (Bắt sự kiện an toàn bằng Event Delegation)
$(document).on('click', '#btn-logout, #btn-mob-logout', function(e) {
    e.preventDefault();

    // 1. Chỉ cần xóa sạch Token và Username trong localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    // 🔥 ĐÃ XÓA: S.isAuth = false; S.uname = 'Guest';
    // Vì khi localStorage bị xóa, các Getters trong app.js sẽ tự động trả về false và 'Guest'

    // 2. Cập nhật lại giao diện
    updateNavAuth();
    navigate('home');
    toast("Đã đăng xuất thành công!");

    // 3. Đóng Offcanvas Menu trên Mobile (nếu đang mở)
    var mobMenuEl = document.getElementById('mob-menu');
    if (mobMenuEl) {
        // Kiểm tra xem bootstrap có tồn tại không để tránh lỗi
        if (typeof bootstrap !== 'undefined') {
            var mobMenu = bootstrap.Offcanvas.getInstance(mobMenuEl);
            if (mobMenu) mobMenu.hide();
        }
    }
});