/**
 * filters.js
 * Filter panel: category tabs + tag chips
 * Depends on: app.js (S, CATEGORIES, TAGS), posts.js (renderPosts), sidebar.js (renderSbTags)
 */

function renderCatTabs() {
    var $el = $('#cat-tabs').empty();

    $el.append(
        $('<button class="cat-btn' + (!S.cat ? ' on' : '') + '">').html(
            'All Posts <span style="font-size:.68rem;opacity:.65;margin-left:.25rem;">(' + POSTS.length + ')</span>'
        ).on('click', function(){ S.cat = null; renderCatTabs(); renderPosts(); })
    );

    $.each(CATEGORIES, function(_, c){
        $el.append(
            $('<button class="cat-btn' + (S.cat === c.id ? ' on' : '') + '">').html(
                c.name + '<span style="font-size:.68rem;opacity:.65;margin-left:.28rem;">(' + c.postCount + ')</span>'
            ).on('click', function(){
                S.cat = (S.cat === c.id) ? null : c.id;
                renderCatTabs(); renderPosts();
            })
        );
    });
}

function renderTagChips() {
    var $el = $('#tag-chips').empty();
    $.each(TAGS, function(_, t){
        $el.append(
            $('<button class="tc-btn' + (S.tag === t.id ? ' on' : '') + '">').html(
                '#' + t.name + '<span style="font-size:.64rem;opacity:.6;margin-left:.2rem;font-family:Inter,sans-serif;">(' + t.postCount + ')</span>'
            ).on('click', function(){
                S.tag = (S.tag === t.id) ? null : t.id;
                renderTagChips(); renderSbTags(); renderPosts();
            })
        );
    });
}
