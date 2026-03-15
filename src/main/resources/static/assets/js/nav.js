/**
 * nav.js
 * Page navigation: navigate(), nav link active state, brand click
 * Depends on: app.js (S), pages.js (buildCatPage, buildTagsPage)
 */

function navigate(page) {
    S.page = page;

    $('#p-home, #p-categories, #p-tags').hide();
    $('#p-' + page).show();

    $('[data-page]').removeClass('is-active');
    $('[data-page="' + page + '"]').addClass('is-active');

    if (page === 'categories') buildCatPage();
    if (page === 'tags')       buildTagsPage();

    window.scrollTo({ top:0, behavior:'smooth' });
}

/* Wire up all [data-page] buttons and brand logo */
$(document).on('click', '[data-page]', function(){
    navigate($(this).data('page'));
});

$('#nav-brand').on('click', function(){ navigate('home'); });
