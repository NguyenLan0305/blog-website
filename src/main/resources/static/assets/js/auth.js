/**
 * auth.js
 * Auth UI: login/logout, avatar dropdown, mobile auth buttons
 * Depends on: app.js (S, initials, toast)
 */

function renderAuth() {
    var $d = $('#auth-area').empty();
    var $m = $('#mob-auth').empty();

    if (S.isAuth) {
        /* Desktop */
        $d.append(
            $('<button class="btn-drafts">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>Drafts'
            ).on('click', function(){ toast('Drafts — coming soon!'); })
        );
        $d.append(
            $('<button class="btn-newpost">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Post'
            ).on('click', function(){ toast('New post editor — coming soon!'); })
        );

        /* Avatar + dropdown */
        var $wrap = $('<div style="position:relative;"></div>');
        var $av   = $('<div class="avatar">').text(initials(S.uname)).attr('title', S.uname);
        var $dd   = $('<div class="user-dd">');

        $dd.append(
            $('<div class="dd-head">').html(
                '<div class="dn">' + S.uname + '</div><div class="dr">Author</div>'
            )
        );
        $dd.append(
            $('<button class="dd-btn">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>My Drafts'
            ).on('click', function(){ toast('Drafts — coming soon!'); $dd.removeClass('open'); })
        );
        $dd.append('<div class="dd-sep"></div>');
        $dd.append(
            $('<button class="dd-btn red">').html(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log Out'
            ).on('click', function(){ S.isAuth = false; renderAuth(); toast('Logged out successfully.'); $dd.removeClass('open'); })
        );

        $av.on('click', function(e){ e.stopPropagation(); $dd.toggleClass('open'); });
        $wrap.append($av, $dd);
        $d.append($wrap);

        /* Mobile */
        $m.append($('<button class="mb-nav-btn">').text('📄  Drafts').on('click', function(){ toast('Drafts — coming soon!'); }));
        $m.append($('<button class="mb-nav-btn">').text('✏️  New Post').on('click', function(){ toast('New post editor — coming soon!'); }));
        $m.append($('<button class="mb-nav-btn" style="color:#f87171;">').text('→  Log Out').on('click', function(){ S.isAuth = false; renderAuth(); toast('Logged out successfully.'); }));

    } else {
        $d.append(
            $('<button class="btn-login">').text('Log In').on('click', function(){
                S.isAuth = true; renderAuth(); toast('Logged in as ' + S.uname + ' ✓');
            })
        );
        $m.append(
            $('<button class="mb-nav-btn">').text('Log In').on('click', function(){
                S.isAuth = true; renderAuth(); toast('Logged in as ' + S.uname + ' ✓');
            })
        );
    }
}

/* Close dropdown on outside click */
$(document).on('click', function(){ $('.user-dd').removeClass('open'); });
