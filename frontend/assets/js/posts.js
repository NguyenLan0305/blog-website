/**
 * posts.js (Phiên bản gọi API chuẩn xác với BlogResponse DTO + Filter Banner)
 * Post list rendering: filter, sort, card builder, skeletons
 * Depends on: app.js (S, fmtDate, excerpt, initials, toast, callApi)
 */

// ─────────────── 1. HÀM XÂY DỰNG GIAO DIỆN THẺ BÀI VIẾT ───────────────
function buildCard(p) {
    // Lấy tên Category từ object lồng nhau
    var catName = p.category ? p.category.name : 'Chưa phân loại';

    // Xây dựng danh sách Tags
    var tagsHtml = '';
    if (p.tags && p.tags.length > 0) {
        $.each(p.tags, function(_, t){
            tagsHtml += '<span class="tag-pill">#' + t.name + '</span>';
        });
    }

    // Lấy tên Tác giả từ object UserResponse
    var authorName = p.author ? p.author.username : 'Anonymous';

    // Xử lý Đoạn trích (Excerpt) an toàn với Editor.js JSON
    // Nếu có description thì xài, không có thì nhờ app.js bóc tách JSON ra 200 ký tự Text thường
    var plainTextContent = excerpt(p.content, 99999); // Lấy toàn bộ Text thô để đếm từ
    var postExcerpt = p.description ? p.description : excerpt(p.content, 200);

    // Tính thời gian đọc chuẩn xác (1 phút ~ 200 chữ)
    var readingTime = Math.ceil((plainTextContent.split(/\s+/).length || 1) / 200);
    if (readingTime === 0) readingTime = 1;

    return $('<div class="post-card">').html(
        '<div class="pc-meta">' +
        '<span class="cat-badge">' + catName + '</span>' +
        '<span class="pc-date">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        fmtDate(p.createdAt) +
        '</span>' +
        '<span class="pc-rt">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        readingTime + ' min read' +
        '</span>' +
        '</div>' +

        '<div class="pc-title">' + p.title + '</div>' +
        '<div class="pc-author"><span class="ac">' + initials(authorName) + '</span>' + authorName + '</div>' +

        // Đoạn trích (Mô tả)
        '<p class="pc-exc">' + postExcerpt + '</p>' +

        '<div class="pc-foot">' +
        '<div>' + tagsHtml + '</div>' +
        '<span class="read-more">Read article' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</span>' +
        '</div>'
    ).on('click', function(){
        // Kích hoạt chuyển trang (Routing) với URL Slug
        window.location.href = '/post.html?id=' + p.slug;
    });
}

// ─────────────── 2. HIỆU ỨNG LOADING (SKELETON) ───────────────
function skeletons(n) {
    var h = '';
    for (var i = 0; i < n; i++) {
        h += '<div class="skel-card">' +
            '<div class="d-flex gap-2 mb-3"><span class="sk" style="width:80px;height:22px;"></span><span class="sk" style="width:110px;height:22px;"></span></div>' +
            '<span class="sk mb-2" style="width:78%;height:22px;display:block;"></span>' +
            '<span class="sk mb-1" style="width:52%;height:13px;display:block;"></span>' +
            '<span class="sk mb-3" style="width:100%;height:13px;display:block;"></span>' +
            '<span class="sk mb-1" style="width:100%;height:13px;display:block;"></span>' +
            '<span class="sk" style="width:68%;height:13px;display:block;"></span>' +
            '</div>';
    }
    return h;
}

// ─────────────── 3. HÀM CẬP NHẬT BANNER BỘ LỌC ───────────────
function updateFilterBanner() {
    var $banner = $('#active-filter-banner');
    var filterText = '';

    // Kiểm tra xem người dùng đang lọc theo cái gì
    if (S.keyword) {
        filterText = 'Search results for: <strong>"' + S.keyword + '"</strong>';
    } else if (S.cat) {
        filterText = 'Filtered by <strong>Category</strong>';
    } else if (S.tag) {
        filterText = 'Filtered by <strong>Tag</strong>';
    }

    // Nếu có bộ lọc, hiển thị Banner màu tím nhạt
    if (filterText) {
        $banner.html(`
            <div class="d-flex align-items-center justify-content-between p-3 rounded" style="background: rgba(124,111,247,0.08); border: 1px solid rgba(124,111,247,0.2);">
                <div class="d-flex align-items-center" style="color: var(--t1); font-size: 0.95rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2" class="me-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    <span>${filterText}</span>
                </div>
                <button class="btn btn-sm btn-clear-filter d-flex align-items-center gap-1" style="color: var(--purple); font-weight: 500; background: none; border: none; transition: 0.2s;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Clear & View All
                </button>
            </div>
        `).slideDown(200);
    } else {
        // Nếu không có bộ lọc nào, giấu Banner đi
        $banner.slideUp(200);
    }
}

// ─────────────── 4. HÀM CHÍNH ĐỂ RENDER DANH SÁCH BÀI VIẾT ───────────────
function renderPosts() {
    var $list = $('#post-list'), $cnt = $('#pcount');

    // 1. Hiện Skeleton Loading ngay lập tức
    $list.html(skeletons(3));
    $cnt.html('Đang tải bài viết...');

    // 2. Cập nhật trạng thái hiển thị của Banner bộ lọc
    updateFilterBanner();

    // 3. LOGIC CHUẨN XỊN: CHỌN ĐÚNG API ĐỂ GỌI
    let apiUrl = '/blogs'; // Mặc định là lấy tất cả
    if (S.keyword) { // Ưu tiên gọi API tìm kiếm nếu có từ khóa
        apiUrl = '/blogs/search?keyword=' + encodeURIComponent(S.keyword);
    }
    else if (S.cat) {
        apiUrl = '/blogs/category/' + S.cat; // Nếu S.cat có giá trị, gọi API lấy theo Category
    } else if (S.tag) {
        apiUrl = '/blogs/tag/' + S.tag;      // Nếu S.tag có giá trị, gọi API lấy theo Tag
    }

    // 4. Gọi API tương ứng
    callApi(apiUrl, 'GET').done(function(res) {

        // Dữ liệu lúc này đã được lọc SẠCH SẼ từ Backend
        var filteredPosts = res.result || res;

        // Xử lý Sắp xếp dưới Client (Vì số lượng mảng lúc này đã rất nhỏ, sort bằng JS sẽ chớp mắt là xong)
        var parts = S.sort.split(','), f = parts[0], d = parts[1];
        filteredPosts.sort(function(a, b){
            var va = a[f] || '', vb = b[f] || '';
            if (va < vb) return d === 'asc' ? -1 : 1;
            if (va > vb) return d === 'asc' ?  1 : -1;
            return 0;
        });

        $list.empty();

        // Cập nhật dòng thông báo số lượng
        var lbl = '<strong>' + filteredPosts.length + '</strong> article' + (filteredPosts.length !== 1 ? 's' : '');
        $cnt.html('Showing ' + lbl);

        // Nếu rỗng
        if (filteredPosts.length === 0) {
            $list.html(
                '<div class="empty"><div class="empty-g">✦</div>' +
                '<p style="font-size:1rem;color:var(--t2);margin-bottom:.4rem;">Không tìm thấy bài viết nào!</p>' +
                '<p style="font-size:.875rem;">Hãy thử chọn bộ lọc khác xem sao nhé.</p></div>'
            );
            return;
        }

        // In ra giao diện
        $.each(filteredPosts, function(_, p){
            $list.append(buildCard(p));
        });

    });
}

// ─────────────── 5. BẮT SỰ KIỆN NÚT CLEAR FILTER ───────────────
$(document).on('click', '.btn-clear-filter', function() {
    // 1. Reset toàn bộ các biến State về null
    S.keyword = null;
    S.cat = null;
    S.tag = null;

    // 2. Xóa param trên thanh URL của trình duyệt cho sạch sẽ
    window.history.pushState({}, '', window.location.pathname);

    // 3. Xóa nội dung trong ô input tìm kiếm (Nếu có)
    $('#nav-search-input, #mob-search-input').val('');

    // 4. Render lại toàn bộ bài viết và reset giao diện tab/sidebar (nếu có hàm)
    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderTags === 'function') renderTags();

    // Bỏ active ở các tab danh mục bên sidebar (nếu có)
    $('.cat-pill').removeClass('active');

    renderPosts();
});