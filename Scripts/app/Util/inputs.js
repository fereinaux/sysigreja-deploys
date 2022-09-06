$(document).ready(function () {

    initInputs()

});

(function ($) {
    var originalVal = $.fn.val;
    $.fn.val = function () {
        var prev;
        if (arguments.length > 0) {
            prev = originalVal.apply(this, []);
        }
        var result = originalVal.apply(this, arguments);
        if ($(this).hasClass('full-date-changed') && arguments.length > 0 && prev != originalVal.apply(this, []))
            $(this).change();  // OR with custom event $(this).trigger('value-changed')

        return result;
    };
})(jQuery);

function initInputs() {

    $('.chosen-select').chosen({ width: "100%" });

    $('.full-date').each(function (i, element) {
        $(this).data('index', i)
    })

    $('.full-date').replaceWith(`<div style="position:relative">

<label tab-index="-1" style="position: absolute; top: 10px; right: 10px; cursor: pointer;" for="full-date-changer">

 <span tab-index="-1" id="calendar" class="" aria-hidden="true"> <i style="font-size: 16px; " class="fas fa-calendar"></i></span>
                                                                                      
                                                                                        <input type="text" class="full-date-changer" style="    border: none;
    width: 0;opacity:0;" tab-index="-1" id="full-date-changer" name="full-date-changer" />
                                                                                    </label>

                                
                                ${$('.full-date').prop('outerHTML')}
                            </div>`)


    $('.full-date').each(function (i, element) {
        $(this).removeClass('full-date')
        $(this).addClass('full-date-changed')
    })

    $('[class*="full-date-changer"]').each(function (i, element) {
        $(this).parent().attr("for", `full-date-changer${i}`);
        $(this).attr("id", `full-date-changer${i}`);
        $(this).attr("name", `full-date-changer${i}`);
    })

    $('.full-date-changer').bootstrapMaterialDatePicker({
        time: false, format: "DD/MM/YYYY", shortTime: false, clearButton: false, nowButton: false, lang: 'pt-br'
    })

    $('[id*="full-date-changer"]').on('change', function () {
        $(this).parent().parent().find('.full-date-changed').val($(this).val())
    })

    $('.full-date-changed').on('keyup', function () {
        $(this).parent().find('[id*="full-date-changer"]').val($(this).val())
    })

    $('.full-date-changed').on('change', function () {
        $(this).parent().find('[id*="full-date-changer"]').val($(this).val())
    })

    $('.full-date-time').bootstrapMaterialDatePicker({ time: true, format: "DD/MM/YYYY HH:mm", shortTime: false, clearButton: false, nowButton: false, lang: 'pt-br', })

    $('.full-date').each((i) => {
        IMask($('.full-date')[i], {
            mask: '00/00/0000'
        });
    });

    $('.i-checks-green').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });

    $('.i-checks-brown').iCheck({
        checkboxClass: 'icheckbox_square-brown',
        radioClass: 'iradio_square-brown'
    });

    $('.fone').each((i) => {
        IMask($('.fone')[i], {
            mask: '+{55}(00)0.0000-0000'
        });
    });

    $('.cpf').each((i) => {
        IMask($('.cpf')[i], {
            mask: '000.000.000-00'
        });
    });

    $('.cep').each((i) => {
        IMask($('.cep')[i], {
            mask: '00000-000'
        });
    });
}