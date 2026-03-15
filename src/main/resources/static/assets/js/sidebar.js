/**
 * sidebar.js
 * Sidebar widgets: Trending + Tags
 * Depends on: app.js (S, getCat, toast), data.js, filters.js (renderTagChips), posts.js (renderPosts)
 */

function renderSbTrending() {
    var $el = $('#sb-trending').empty();
    $.each(POSTS.slice(0,5), function(i, p){
        $el.append(
            $('<div class="tr-item">').html(
                '<div class="tr-n">0' + (i+1) + '</div>' +
                '<div>' +
                '<div class="tr-ttl">' + p.title + '</div>' +
                '<div class="tr-meta">' + p.readingTime + ' min · ' + getCat(p.categoryId).name + '</div>' +
                '</div>'
            ).on('click', function(){ toast('Opening: "' + p.title + '"'); })
        );
    });
}

function renderSbTags() {
    var $el = $('#sb-tags').empty();
    $.each(TAGS, function(_, t){
        $el.append(
            $('<button class="sb-tag' + (S.tag === t.id ? ' on' : '') + '">').html(
                '<span style="opacity:.45;font-size:.7rem;">#</span>' + t.name +
                '<span style="font-size:.64rem;opacity:.55;font-family:Inter,sans-serif;margin-left:.15rem;">(' + t.postCount + ')</span>'
            ).on('click', function(){
                S.tag = (S.tag === t.id) ? null : t.id;
                renderTagChips(); renderSbTags(); renderPosts();
            })
        );
    });
}
