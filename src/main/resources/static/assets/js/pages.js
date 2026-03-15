/**
 * pages.js
 * Secondary pages: Categories page + Tags page
 * Depends on: app.js (S, toast), data.js, nav.js (navigate), filters.js, sidebar.js, posts.js
 */

var CAT_COLORS = {
    tech:      { bg:'rgba(124,111,247,.1)', bd:'rgba(124,111,247,.25)', fg:'var(--purple)' },
    design:    { bg:'rgba(62,207,176,.08)', bd:'rgba(62,207,176,.25)',  fg:'var(--teal)'   },
    science:   { bg:'rgba(233,168,76,.08)', bd:'rgba(233,168,76,.25)', fg:'var(--gold)'   },
    lifestyle: { bg:'rgba(251,191,36,.08)', bd:'rgba(251,191,36,.2)',  fg:'#fbbf24'       },
    travel:    { bg:'rgba(248,113,113,.08)',bd:'rgba(248,113,113,.2)', fg:'#f87171'       },
};

function buildCatPage() {
    var $g = $('#cat-grid').empty();
    $.each(CATEGORIES, function(_, c){
        var col = CAT_COLORS[c.id] || CAT_COLORS.tech;
        $g.append(
            $('<div class="col-sm-6 col-md-4">').append(
                $('<div class="cat-card">').css({
                    background:col.bg, border:'1px solid '+col.bd, borderRadius:'var(--r)'
                }).html(
                    '<div style="font-size:1.35rem;margin-bottom:.5rem;">📂</div>' +
                    '<div style="font-family:Playfair Display,serif;font-size:1.1rem;font-weight:700;color:' + col.fg + ';margin-bottom:.3rem;">' + c.name + '</div>' +
                    '<div style="font-size:.8rem;color:var(--t3);">' + c.postCount + ' articles</div>'
                ).on('click', function(){
                    S.cat = c.id;
                    navigate('home');
                    renderCatTabs();
                    renderPosts();
                    toast('Filtered by: ' + c.name);
                })
            )
        );
    });
}

function buildTagsPage() {
    var $g = $('#tags-grid').empty();
    $.each(TAGS, function(_, t){
        $g.append(
            $('<button class="sb-tag" style="font-size:.9rem;padding:.4rem .85rem;margin:.3rem;">').html(
                '<span style="opacity:.45;">#</span>' + t.name +
                '<span style="font-size:.65rem;opacity:.55;font-family:Inter,sans-serif;margin-left:.15rem;">(' + t.postCount + ')</span>'
            ).on('click', function(){
                S.tag = t.id;
                navigate('home');
                renderTagChips(); renderSbTags(); renderPosts();
                toast('Filtered by tag: #' + t.name);
            })
        );
    });
}
