/**
 * posts.js (Phiên bản gọi API chuẩn xác với BlogResponse DTO + Filter Banner)
 * Post list rendering: filter, sort, card builder, skeletons
 * Depends on: app.js (S, fmtDate, excerpt, initials, toast, callApi)
 */

// ─────────────── 1. HÀM XÂY DỰNG GIAO DIỆN THẺ BÀI VIẾT ───────────────
function buildCard(p) {
    var catName = p.category ? p.category.name : 'Chưa phân loại';

    var tagsHtml = '';
    if (p.tags && p.tags.length > 0) {
        $.each(p.tags, function(_, t){
            tagsHtml += '<span class="tag-pill">#' + t.name + '</span>';
        });
    }

    var authorName = p.author ? p.author.username : 'Anonymous';

    var plainTextContent = excerpt(p.content, 99999);
    var postExcerpt = p.description ? p.description : excerpt(p.content, 200);

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

        '<p class="pc-exc">' + postExcerpt + '</p>' +

        '<div class="pc-foot">' +
        '<div>' + tagsHtml + '</div>' +
        '<span class="read-more">Read article' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</span>' +
        '</div>'
    ).on('click', function(){
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

// ─────────────── HÀM CẬP NHẬT BANNER BỘ LỌC (NÂNG CẤP) ───────────────
function updateFilterBanner() {
    var $banner = $('#active-filter-banner');
    var activeFiltersHtml = '';

    if (S.keyword) {
        activeFiltersHtml += `
            <span class="badge bg-light text-dark border p-2 me-2 d-inline-flex align-items-center gap-2" style="font-size: 0.85rem;">
                <span class="text-muted">Search:</span> <strong>${S.keyword}</strong>
                <span class="btn-remove-filter" data-type="keyword" style="cursor:pointer; color: var(--red);">✖</span>
            </span>`;
    }

    if (S.cat) {
        // 🔥 Lấy tên Category đang active từ biến toàn cục CATEGORIES (nếu có)
        var activeCatName = 'Active';
        if (typeof CATEGORIES !== 'undefined') {
            var foundCat = CATEGORIES.find(c => c.id === S.cat);
            if (foundCat) activeCatName = foundCat.name;
        }

        activeFiltersHtml += `
            <span class="badge bg-light text-dark border p-2 me-2 d-inline-flex align-items-center gap-2" style="font-size: 0.85rem;">
                <span class="text-muted">Category:</span> <strong>${activeCatName}</strong>
                <span class="btn-remove-filter" data-type="cat" style="cursor:pointer; color: var(--red);">✖</span>
            </span>`;
    }

    if (activeFiltersHtml !== '') {
        $banner.html(`
            <div class="d-flex align-items-center justify-content-between p-3 rounded mb-3" style="background: rgba(124,111,247,0.05); border: 1px dashed rgba(124,111,247,0.3);">
                <div class="d-flex align-items-center flex-wrap">
                    <span class="me-3" style="color: var(--t2); font-size: 0.9rem;">Active filters:</span>
                    ${activeFiltersHtml}
                </div>
                <button class="btn btn-sm btn-clear-filter text-muted" style="background: none; border: none; font-size: 0.85rem; text-decoration: underline;">
                    Clear All
                </button>
            </div>
        `).slideDown(200);
    } else {
        $banner.slideUp(200);
    }
}

// Bắt sự kiện XÓA TỪNG BỘ LỌC
$(document).on('click', '.btn-remove-filter', function() {
    var type = $(this).data('type');

    if (type === 'keyword') {
        S.keyword = null;
        $('#nav-search-input, #mob-search-input').val('');
    } else if (type === 'cat') {
        S.cat = null;
    }

    // Cập nhật lại URL bằng hàm ở filters.js (nếu có)
    if (typeof updateUrlWithFilters === 'function') {
        updateUrlWithFilters();
    } else {
        window.history.pushState({}, '', window.location.pathname);
    }

    // Cập nhật lại giao diện các nút
    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderSbCategories === 'function') renderSbCategories();

    renderPosts();
});

// Bắt sự kiện XÓA TẤT CẢ (Clear All)
$(document).on('click', '.btn-clear-filter', function() {
    S.keyword = null; S.cat = null; S.tag = null;

    $('#nav-search-input, #mob-search-input').val('');

    if (typeof updateUrlWithFilters === 'function') {
        updateUrlWithFilters();
    } else {
        window.history.pushState({}, '', window.location.pathname);
    }

    // Cập nhật lại giao diện các nút
    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderSbCategories === 'function') renderSbCategories();
    if (typeof renderTags === 'function') renderTags();

    renderPosts();
});

// ─────────────── HÀM CHÍNH ĐỂ RENDER DANH SÁCH BÀI VIẾT ───────────────
function renderPosts() {
    var $list = $('#post-list'), $cnt = $('#pcount');
    $list.html(skeletons(3));
    $cnt.html('Đang tải bài viết...');

    updateFilterBanner();

    // 🔥 LOGIC GỌI API LỌC TỔNG
    let apiUrl = '/blogs/filter?';
    if (S.keyword) apiUrl += 'keyword=' + encodeURIComponent(S.keyword) + '&';
    if (S.cat) apiUrl += 'categoryId=' + encodeURIComponent(S.cat) + '&';

    callApi(apiUrl, 'GET').done(function(res) {
        var filteredPosts = res.result || res;

        var parts = S.sort.split(','), f = parts[0], d = parts[1];
        filteredPosts.sort(function(a, b){
            var va = a[f] || '', vb = b[f] || '';
            if (va < vb) return d === 'asc' ? -1 : 1;
            if (va > vb) return d === 'asc' ?  1 : -1;
            return 0;
        });

        $list.empty();
        $cnt.html('Showing <strong>' + filteredPosts.length + '</strong> article' + (filteredPosts.length !== 1 ? 's' : ''));

        if (filteredPosts.length === 0) {
            $list.html('<div class="empty"><div class="empty-g">✦</div><p>Không tìm thấy bài viết nào thỏa mãn bộ lọc!</p></div>');
            return;
        }

        $.each(filteredPosts, function(_, p){
            $list.append(buildCard(p));
        });
    });
}