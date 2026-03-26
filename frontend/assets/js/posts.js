/**
 * posts.js (Phiên bản gọi API chuẩn xác với BlogResponse DTO)
 * Post list rendering: filter, sort, card builder, skeletons
 * Depends on: app.js (S, fmtDate, excerpt, initials, toast, callApi)
 */

// ─────────────── 1. HÀM LỌC VÀ SẮP XẾP BÀI VIẾT ───────────────
function getFiltered(allPosts) {
    var res = allPosts.slice();

    // Lọc theo Category ID (UUID)
    if (S.cat) {
        res = $.grep(res, function(p) {
            return p.category && p.category.id === S.cat;
        });
    }

    // Lọc theo Tag ID (UUID)
    if (S.tag) {
        res = $.grep(res, function(p) {
            var hasTag = false;
            if (p.tags) {
                $.each(p.tags, function(_, t) {
                    if (t.id === S.tag) hasTag = true;
                });
            }
            return hasTag;
        });
    }

    // Sắp xếp (Dựa trên biến S.sort, ví dụ: 'createdAt,desc')
    var parts = S.sort.split(','), f = parts[0], d = parts[1];
    res.sort(function(a, b){
        var va = a[f] || '', vb = b[f] || '';
        if (va < vb) return d === 'asc' ? -1 : 1;
        if (va > vb) return d === 'asc' ?  1 : -1;
        return 0;
    });

    return res;
}

// ─────────────── 2. HÀM XÂY DỰNG GIAO DIỆN THẺ BÀI VIẾT ───────────────
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

    // 🔥 CẬP NHẬT 1: Xử lý Đoạn trích (Excerpt) an toàn với Editor.js JSON
    // Nếu có description thì xài, không có thì nhờ app.js bóc tách JSON ra 200 ký tự Text thường
    var plainTextContent = excerpt(p.content, 99999); // Lấy toàn bộ Text thô để đếm từ
    var postExcerpt = p.description ? p.description : excerpt(p.content, 200);

    // 🔥 CẬP NHẬT 2: Tính thời gian đọc chuẩn xác (1 phút ~ 200 chữ)
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
        // 🔥 CẬP NHẬT 3: Kích hoạt chuyển trang (Routing) với URL Slug
        // Slug này được Backend sinh tự động (VD: lap-trinh-java-123e4567...)
        window.location.href = '/post.html?id=' + p.slug;
    });
}

// ─────────────── 3. HIỆU ỨNG LOADING (SKELETON) ───────────────
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

// ─────────────── 4. HÀM CHÍNH ĐỂ RENDER DANH SÁCH BÀI VIẾT ───────────────
function renderPosts() {
    var $list = $('#post-list'), $cnt = $('#pcount');

    // 1. Hiện Skeleton Loading ngay lập tức để User không phải chờ màn hình trắng
    $list.html(skeletons(3));
    $cnt.html('Đang tải bài viết...');

    // 2. Gọi API lấy dữ liệu từ Backend Spring Boot
    callApi('/blogs', 'GET').done(function(res) {

        // Dữ liệu mảng trả về từ ApiResponse của bạn
        var allPosts = res.result || res;

        // 3. Tiến hành Lọc và Sắp xếp ngay dưới Client
        var resFiltered = getFiltered(allPosts);
        $list.empty();

        // Cập nhật lại dòng thông báo trạng thái lọc (VD: Showing 5 articles)
        var lbl = '<strong>' + resFiltered.length + '</strong> article' + (resFiltered.length !== 1 ? 's' : '');
        $cnt.html('Showing ' + lbl);

        // Nếu không có bài viết nào khớp
        if (resFiltered.length === 0) {
            $list.html(
                '<div class="empty"><div class="empty-g">✦</div>' +
                '<p style="font-size:1rem;color:var(--t2);margin-bottom:.4rem;">Không tìm thấy bài viết nào!</p>' +
                '<p style="font-size:.875rem;">Hãy thử chọn bộ lọc khác xem sao nhé.</p></div>'
            );
            return;
        }

        // 4. Render từng thẻ HTML nhét vào danh sách
        $.each(resFiltered, function(_, p){
            $list.append(buildCard(p));
        });

    });
}