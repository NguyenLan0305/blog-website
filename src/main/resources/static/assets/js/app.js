/**
 * app.js
 * Global state + shared helper functions
 * Depends on: data.js
 */

/* ─────────────── STATE ─────────────── */
var S = {
    page:   'home',
    cat:    null,
    tag:    null,
    sort:   'createdAt,desc',
    isAuth: true,
    uname:  'Alex Morgan'
};

/* ─────────────── HELPERS ─────────────── */
function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function excerpt(s, n) {
    n = n || 200;
    s = s.trim();
    if (s.length <= n) return s;
    return s.substring(0, n).split(' ').slice(0,-1).join(' ') + '…';
}

function initials(name) {
    return name.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
}

function getCat(id) {
    return $.grep(CATEGORIES, function(c){ return c.id === id; })[0] || {name:'—', id:''};
}

function getTag(id) {
    return $.grep(TAGS, function(t){ return t.id === id; })[0] || {name:id, id:id};
}

/* ─────────────── TOAST ─────────────── */
function toast(msg) {
    var $el = $('<div class="toast-item"><span class="toast-dot"></span><span></span></div>');
    $el.find('span:last').text(msg);
    $('#toasts').append($el);
    setTimeout(function(){ $el.fadeOut(300, function(){ $el.remove(); }); }, 2800);
}
