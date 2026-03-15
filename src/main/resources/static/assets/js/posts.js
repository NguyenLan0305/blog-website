/**
 * posts.js
 * Post list rendering: filter, sort, card builder, skeletons
 * Depends on: app.js (S, fmtDate, excerpt, initials, getCat, getTag, toast), data.js
 */

function getFiltered() {
    var res = POSTS.slice();

    if (S.cat) res = $.grep(res, function(p){ return p.categoryId === S.cat; });
    if (S.tag) res = $.grep(res, function(p){ return $.inArray(S.tag, p.tagIds) !== -1; });

    var parts = S.sort.split(','), f = parts[0], d = parts[1];
    res.sort(function(a, b){
        var va = a[f] || '', vb = b[f] || '';
        if (va < vb) return d === 'asc' ? -1 : 1;
        if (va > vb) return d === 'asc' ?  1 : -1;
        return 0;
    });

    return res;
}

function buildCard(p) {
    var cat = getCat(p.categoryId);

    var tagsHtml = '';
    $.each(p.tagIds, function(_, tid){
        tagsHtml += '<span class="tag-pill">' + getTag(tid).name + '</span>';
    });

    return $('<div class="post-card">').html(
        '<div class="pc-meta">' +
        '<span class="cat-badge">' + cat.name + '</span>' +
        '<span class="pc-date">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        fmtDate(p.createdAt) +
        '</span>' +
        '<span class="pc-rt">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        p.readingTime + ' min read' +
        '</span>' +
        '</div>' +
        '<div class="pc-title">' + p.title + '</div>' +
        '<div class="pc-author"><span class="ac">' + initials(p.author) + '</span>' + p.author + '</div>' +
        '<p class="pc-exc">' + excerpt(p.content) + '</p>' +
        '<div class="pc-foot">' +
        tagsHtml +
        '<span class="read-more">Read article' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</span>' +
        '</div>'
    ).on('click', function(){ toast('Opening: "' + p.title + '"'); });
}

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

function renderPosts() {
    var $list = $('#post-list'), $cnt = $('#pcount');
    $list.html(skeletons(3));

    setTimeout(function(){
        var res = getFiltered();
        $list.empty();

        /* count text */
        var lbl = '<strong>' + res.length + '</strong> article' + (res.length !== 1 ? 's' : '');
        if (S.cat) {
            var fc = $.grep(CATEGORIES, function(c){ return c.id === S.cat; })[0];
            if (fc) lbl += ' in <strong>' + fc.name + '</strong>';
        }
        if (S.tag) {
            var ft = $.grep(TAGS, function(t){ return t.id === S.tag; })[0];
            if (ft) lbl += ' tagged <strong>#' + ft.name + '</strong>';
        }
        $cnt.html('Showing ' + lbl);

        if (res.length === 0) {
            $list.html(
                '<div class="empty"><div class="empty-g">✦</div>' +
                '<p style="font-size:1rem;color:var(--t2);margin-bottom:.4rem;">No articles found</p>' +
                '<p style="font-size:.875rem;">Try adjusting your filters.</p></div>'
            );
            return;
        }

        $.each(res, function(_, p){ $list.append(buildCard(p)); });
    }, 420);
}
