window['open_download_popup'] = function (module_id, file_url = '') {
    if ($('html').hasClass('iphone') || $('html').hasClass('ipad')) {
        iNoBounce.enable();
    }

    module_id = parseInt(module_id, 10);

    var html = '';

    html += '<div class="popup-wrapper popup-module">';
    html += '	<div class="popup-container">';
    html += '		<button class="btn popup-close"></button>';
    html += '		<div class="popup-body">';
    html += '		<div class="popup-inner-body">';
    html += '		</div>';
    html += '		</div>';
    html += '	</div>';
    html += '	<div class="popup-bg popup-bg-closable"></div>';
    html += '</div>';

    // show modal
    $('.popup-wrapper').remove();
    $('body').append(html);

    setTimeout(function () {
        $('html').addClass('popup-open popup-center');
    }, 10);

    $('.popup-container').css('visibility', 'hidden');

    $.ajax({
        url: 'index.php?route=journal3/popup/get&module_id=' + module_id + '&file_url=' + encodeURIComponent(file_url) + '&popup=module',
        success: function (html) {
            var $html = $(html);
            var $popup = $html.siblings('.module-popup');
            var $style = $html.siblings('style');
            var $content = $popup.find('.popup-container');

            $('#popup-style-' + module_id).remove();
            $('head').append($style.attr('id', 'popup-style-' + module_id));
            $('.popup-wrapper').attr('class', $popup.attr('class'));
            $('.popup-container').html($content.html());

            $('.popup-container').css('visibility', 'visible');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(thrownError + '\r\n' + xhr.statusText + '\r\n' + xhr.responseText);
        }
    });
};