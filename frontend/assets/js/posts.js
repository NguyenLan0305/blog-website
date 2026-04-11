/**
 * posts.js (Đã cập nhật giao diện List Ngang, Category sáng hơn, Border rõ hơn, Tim bấm được)
 */

// ─────────────── HÀM XỬ LÝ TEXT THÔNG MINH ───────────────
function extractText(content, len) {
    if (!content) return '';
    let plainText = "";

    try {
        const parsed = JSON.parse(content);
        if (parsed && parsed.blocks) {
            parsed.blocks.forEach(b => {
                if (b.data && b.data.text) plainText += b.data.text + " ";
            });
        } else {
            plainText = content;
        }
    } catch (e) {
        plainText = content;
    }

    var div = document.createElement("div");
    div.innerHTML = plainText;
    var text = div.textContent || div.innerText || "";
    text = text.trim();

    return text.length > len ? text.substring(0, len) + '...' : text;
}

// ─────────────── 1. HÀM XÂY DỰNG GIAO DIỆN THẺ BÀI VIẾT ───────────────
function buildCard(p) {
    var catName = p.category ? p.category.name : 'Chưa phân loại';
    var authorName = p.author ? p.author.username : 'Anonymous';
    var dateStr = fmtDate(p.createdAt);

    // Trích xuất mô tả
    var postExcerpt = p.description ? p.description : extractText(p.content, 180);

    // Ảnh thumbnail
    var bannerUrl = p.banner ? p.banner : 'https://placehold.co/600x400/151a22/a5abba?text=No+Image';

    // Tính thời gian đọc
    let plainTextContent = extractText(p.content, 99999);
    let readingTime = Math.ceil((plainTextContent.split(/\s+/).length || 1) / 200);
    if (readingTime === 0) readingTime = 1;

    // Khởi tạo Card
    // 🔥 CẬP NHẬT 1: Viền bottom đậm hơn (rgba(66,72,85,0.4))
    var $card = $('<article class="d-flex flex-column flex-sm-row gap-3 gap-sm-4 py-4 border-bottom" style="border-color: rgba(66,72,85,0.4) !important; border-bottom-width: 1px !important; cursor: pointer; transition: background 0.2s;">')
        .hover(
            function() { $(this).css('background-color', 'rgba(255,255,255,0.03)'); },
            function() { $(this).css('background-color', 'transparent'); }
        )
        .on('click', function(){
            window.location.href = 'post.html?id=' + p.slug;
        });

    var cardHtml = `
        <div class="flex-grow-1 order-2 order-sm-1">
            
            <div class="d-flex align-items-center gap-2 mb-2" style="font-size: 0.85rem; color: #a5abba;">
                <span class="text-white fw-bold">${authorName}</span>
                <span>@${authorName}</span>
                <span>•</span>
                <span>${dateStr}</span>
            </div>

            <h2 class="mb-2" style="font-family: 'Newsreader', serif; font-size: 1.5rem; font-weight: 700; color: #e0e5f5; line-height: 1.3;">
                ${p.title}
            </h2>

            <p class="mb-3" style="color: #a5abba; font-size: 0.95rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${postExcerpt}
            </p>

            <div class="d-flex align-items-center gap-3" style="font-size: 0.8rem; color: #a5abba;">
                <span style="background: rgba(224, 229, 245, 0.15); padding: 0.3rem 0.8rem; border-radius: 9999px; color: #ffffff; font-weight: 500;">
                    ${catName}
                </span>
                <span>${readingTime} min read</span>
                
                <div class="ms-auto d-flex align-items-center">
                    <span class="like-btn d-flex align-items-center gap-1" style="cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 4px; transition: color 0.2s;" title="Like">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span class="like-count">${p.totalLikes || 0}</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="flex-shrink-0 order-1 order-sm-2 mb-3 mb-sm-0">
            <img src="${bannerUrl}" alt="${p.title}" style="width: 100%; max-width: 150px; height: 130px; object-fit: cover; border-radius: 8px; background: #1b202a; display: block;">
        </div>
    `;

    $card.html(cardHtml);

    // Gắn sự kiện hover và click riêng cho nút Tim
    $card.find('.like-btn')
        .hover(
            function(e) { $(this).css('color', '#ff4757'); },
            function(e) { $(this).css('color', '#a5abba'); }
        )
        .on('click', function(e) {
            e.stopPropagation(); // Ngăn chặn click lan ra thẻ cha (không chuyển trang)

            // Ở đây bạn có thể gọi API like bài viết
            // Tạm thời mình làm hiệu ứng tăng số đếm tĩnh
            let countSpan = $(this).find('.like-count');
            let currentCount = parseInt(countSpan.text());

            // Giả lập toggle like
            if ($(this).data('liked')) {
                $(this).find('svg').attr('fill', 'none');
                countSpan.text(currentCount - 1);
                $(this).data('liked', false);
            } else {
                $(this).find('svg').attr('fill', '#ff4757');
                countSpan.text(currentCount + 1);
                $(this).data('liked', true);
            }

            // TODO: callApi('/blogs/' + p.id + '/like', 'POST')...
        });

    return $card;
}

// ─────────────── 2. HIỆU ỨNG LOADING (SKELETON) ───────────────
function skeletons(n) {
    var h = '';
    for (var i = 0; i < n; i++) {
        // Đồng bộ viền đậm với card thật
        h += '<div class="d-flex gap-4 py-4 border-bottom" style="border-color: rgba(66,72,85,0.4) !important; border-bottom-width: 1px !important;">' +
            '<div class="flex-grow-1">' +
            '<span class="sk mb-2" style="width:150px;height:16px;display:block;"></span>' +
            '<span class="sk mb-2" style="width:78%;height:28px;display:block;"></span>' +
            '<span class="sk mb-2" style="width:100%;height:16px;display:block;"></span>' +
            '<span class="sk" style="width:68%;height:16px;display:block;"></span>' +
            '</div>' +
            '<div class="flex-shrink-0 d-none d-sm-block">' +
            '<span class="sk" style="width:150px;height:130px;display:block;border-radius:8px;"></span>' +
            '</div>' +
            '</div>';
    }
    return h;
}

// ─────────────── 3. HÀM CẬP NHẬT BANNER BỘ LỌC ───────────────
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
                    <span class="me-3" style="color: #e0e5f5; font-size: 0.9rem;">Active filters:</span>
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
    if (typeof updateUrlWithFilters === 'function') updateUrlWithFilters();
    else window.history.pushState({}, '', window.location.pathname);

    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderSbCategories === 'function') renderSbCategories();
    renderPosts();
});

// Bắt sự kiện XÓA TẤT CẢ (Clear All)
$(document).on('click', '.btn-clear-filter', function() {
    S.keyword = null; S.cat = null; S.tag = null;
    $('#nav-search-input, #mob-search-input').val('');
    if (typeof updateUrlWithFilters === 'function') updateUrlWithFilters();
    else window.history.pushState({}, '', window.location.pathname);

    if (typeof renderCatTabs === 'function') renderCatTabs();
    if (typeof renderSbCategories === 'function') renderSbCategories();
    if (typeof renderTags === 'function') renderTags();
    renderPosts();
});

// ─────────────── 4. HÀM CHÍNH ĐỂ RENDER DANH SÁCH BÀI VIẾT ───────────────
function renderPosts() {
    var $list = $('#post-list'), $cnt = $('#pcount');
    $list.html(skeletons(3));
    $cnt.html('Đang tải bài viết...');

    updateFilterBanner();

    let apiUrl = '/blogs/filter?';
    if (S.keyword) apiUrl += 'keyword=' + encodeURIComponent(S.keyword) + '&';
    if (S.cat) apiUrl += 'categoryId=' + encodeURIComponent(S.cat) + '&';

    callApi(apiUrl, 'GET').done(function(res) {
        var filteredPosts = res.result || res;

        var parts = S.sort.split(',');
        var f = parts[0]; // Tên trường (VD: createdAt, title)
        var d = parts[1]; // Hướng sắp xếp (VD: asc, desc)

        filteredPosts.sort(function(a, b){
            var va = a[f] || '';
            var vb = b[f] || '';

            // Nếu sắp xếp theo Tiêu đề, chuyển về chữ thường để xếp A-Z không bị lỗi phân biệt hoa/thường
            if (f === 'title') {
                va = va.toString().toLowerCase();
                vb = vb.toString().toLowerCase();
            }

            if (va < vb) return d === 'asc' ? -1 : 1;
            if (va > vb) return d === 'asc' ?  1 : -1;
            return 0;
        });

        $list.empty();
        $cnt.html('Showing <strong>' + filteredPosts.length + '</strong> article' + (filteredPosts.length !== 1 ? 's' : ''));

        if (filteredPosts.length === 0) {
            $list.html('<div class="text-center py-5" style="color: #a5abba;"><span class="material-symbols-outlined" style="font-size:3rem; opacity:0.5;">search_off</span><p class="mt-3">Không tìm thấy bài viết nào thỏa mãn bộ lọc!</p></div>');
            return;
        }

        $.each(filteredPosts, function(_, p){
            $list.append(buildCard(p));
        });
    });

    // ─────────────── 5. XỬ LÝ SỰ KIỆN SẮP XẾP (SORT) ───────────────
    $(document).ready(function() {
        // Nếu biến S.sort chưa có giá trị, đặt mặc định là Mới nhất
        if (!S.sort) {
            S.sort = 'createdAt,desc';
        }

        // Đảm bảo thẻ select hiển thị đúng giá trị mặc định lúc mới tải trang
        $('#sort-sel').val(S.sort);
    });

// Bắt sự kiện khi người dùng chọn một mục khác trong Dropdown
    $(document).on('change', '#sort-sel', function() {
        S.sort = $(this).val(); // Cập nhật biến toàn cục S (VD: 'title,asc')
        renderPosts();          // Gọi hàm vẽ lại danh sách bài viết
    });
}