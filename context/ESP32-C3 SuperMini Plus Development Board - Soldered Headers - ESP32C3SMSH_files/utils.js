var isenselabs_gdpr_path = 'extension/module/isenselabs_gdpr';

$(document).ready(function() {
    $.ajax({
        url: 'index.php?route=' + isenselabs_gdpr_path + '/getOptinsSettings',
        type: 'get',
        data: {},
        dataType: 'json',
        success: function(resp) {
            if (!resp.error && resp.data.enabled && ($('form[action*="information/contact"]').length == 1 || $('form textarea[name="enquiry"]').length == 1)) {
                var checkbox_html = '<label><input type="checkbox" name="optin_agree" value="1" /> ' + resp.data.text_optin_checkbox + '</label>';
                var form = $('textarea[name="enquiry"]').parents('form');
                var textarea = form.find('textarea[name=enquiry]');
                if(textarea.next('.text-danger').length > 0) {
                    textarea.next('.text-danger').after(checkbox_html);
                } else {
                    textarea.after(checkbox_html);
                }
				if(typeof Journal == 'object') {
					form.find('input[name=optin_agree]').parent('label').css('width', '100%');
				}

                form.on('submit', function(e) {
                    e.preventDefault();

                    var option_checkbox = form.find('input[name="optin_agree"]');
                    if (!option_checkbox.is(':checked')) {
                        alert(resp.data.text_optin_error);
                    } else {
						this.submit();
                    }
                });
                
            }
        }
    });
});