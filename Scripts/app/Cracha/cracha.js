let lid = 0;

let arquivos = 1
let selected
let razao = 37.79

let eventoId
function CarregarTabelaCracha() {
    const tableCrachaConfig = {
        language: languageConfig,
        lengthMenu: [200, 500, 1000],
        colReorder: false,
        serverSide: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfig,
        buttons: getButtonsConfig('Credenciais'),
        columns: [
            { data: "Titulo", name: "Titulo", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "25%",
                "render": function (data, type, row) {

                    return `${GetButton('CloneCracha', data, 'green', 'fa-clone', 'Editar')}
${GetButton('EditCracha', data, 'blue', 'fa-edit', 'Editar')}
                            ${GetButton('DeleteCracha', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [1, "desc"]
        ],
        ajax: {
            url: '/Cracha/GetCrachas',
            data: { ConfiguracaoId: $('#cracha-configId').val() },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-cracha").DataTable(tableCrachaConfig);
}

function EditCracha(id) {
    GetCracha(id);
    $("#modal-cracha").modal();
}



function GetCracha(id) {
    lid = id
    if (id > 0) {
        $.ajax({
            url: "/Cracha/GetCracha/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                cracha = data.Cracha
                $('#margin-w').val(cracha.MargemHorizontal)
                $('#margin-h').val(cracha.MargemVertical)
                $('#cols').val(cracha.Colunas)
                $('#rows').val(cracha.Linhas)
                $('#titulo').val(cracha.Titulo)
                $('#largura').val(cracha.Largura)
                $('#altura').val(cracha.Altura)
                $('#paper').val(cracha.Papel)
                $(`input[type=radio][id=orientation][value=${cracha.Orientacao}]`).iCheck('check');
                $(`input[type=radio][id=background][value=${cracha.Background}]`).iCheck('check');
                $('.nome-font #font-picker')
                    .val(cracha.Nome.Family).trigger('change')
                $('.equipe-font #font-picker')
                    .val(cracha.Equipe.Family).trigger('change')
                $('.apelido-font #font-picker')
                    .val(cracha.Apelido.Family).trigger('change')

                $('.apelido-font #font-size').val(cracha.Apelido.Size)
                $('.apelido-font #font-padding').val(cracha.Apelido.Margin)
                $('.apelido-font #font-color').val(cracha.Apelido.Color)
                Align(cracha.Apelido.Align, 'nome')
                $('.nome-font #font-size').val(cracha.Nome.Size)
                $('.nome-font #font-padding').val(cracha.Nome.Margin)
                $('.nome-font #font-color').val(cracha.Nome.Color)
                Align(cracha.Nome.Align, 'nome')
                $('.equipe-font #font-size').val(cracha.Equipe.Size)
                $('.equipe-font #font-padding').val(cracha.Equipe.Margin)
                $('.equipe-font #font-color').val(cracha.Equipe.Color)
                Align(cracha.Equipe.Align, 'nome')
                $('#cracha').html(cracha.Conteudo)
                arquivos = $('.arquivos-cracha').length + 1
                renderCracha()
                dragResize()
            }
        });
    }
    else {
        $('#margin-w').val(1)
        $('#margin-h').val(1)
        $('#cols').val(5)
        $('#rows').val(2)
        $('#titulo').val('')
        $('#largura').val(8)
        $('#altura').val(12)
        $('#paper').val('a3')
        $(`input[type=radio][id=orientation][value=l]`).iCheck('check');
        $(`input[type=radio][id=background][value=foto]`).iCheck('check');
        $('.nome-font #font-picker')
            .val('Roboto:500').trigger('change')
        $('.equipe-font #font-picker')
            .val('Roboto:700').trigger('change')
        $('.apelido-font #font-picker')
            .val('Roboto:400').trigger('change')

        $('.apelido-font #font-size').val(35)
        $('.apelido-font #font-padding').val(5)
        $('.apelido-font #font-color').val('#FFFFFF')
        Align('left', 'apelido')
        $('.nome-font #font-size').val(20)
        $('.nome-font #font-padding').val(5)
        $('.nome-font #font-color').val('#FFFFFF')
        Align('left', 'nome')
        $('.equipe-font #font-size').val(15)
        $('.equipe-font #font-padding').val(5)
        $('.equipe-font #font-color').val('#FFFFFF')
        Align('left', 'equipe')
        $('#cracha').html(`<img src="./Images/profile.jpg" class="background" style="position:absolute;left:0;top:0;height:100%;width:100%;z-index:0" />
                                <span style="white-space:normal;display: block;position: relative; z-index: 999; top: 50%; font-size:30px;" class="apelido-cracha text-cracha">{Apelido}</span>
                                <span style="white-space:normal;display:block;position:relative;z-index:999; top:50%; font-size:20px" class="nome-cracha text-cracha">{Nome}</span>
                                <span style="white-space:normal;display: block;position: relative; z-index: 999; top: 50%; font-size:30px;" class="equipe-cracha text-cracha">{Equipe}</span>`)
        renderCracha()
        dragResize()
    }
}

function DeleteCracha(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Cracha/DeleteCracha/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaCracha();
                }
            });
        }
    });
}

function CloneCracha(id) {
    $.ajax({
        url: "/Cracha/CloneCracha/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: id
            }),
        success: function () {
            SuccessMesageOperation();
            CarregarTabelaCracha();
        }
    });

}


function PostCracha() {
    if (ValidateForm(`#form-cracha`)) {
        $.ajax({
            url: "/Cracha/PostCracha/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: lid,
                    Titulo: $('#titulo').val(),
                    Largura: parseFloat($('#largura').val()),
                    Altura: parseFloat($('#altura').val()),
                    MargemHorizontal: parseFloat($('#margin-w').val()),
                    MargemVertical: parseFloat($('#margin-h').val()),
                    Colunas: $('#cols').val(),
                    Linhas: $('#rows').val(),
                    Orientacao: $('#orientation:checked').val(),
                    Papel: $('#paper').val(),
                    Background: $('#background:checked').val(),
                    Conteudo: $('#cracha').html(),
                    ConfiguracaoId: $('#cracha-configId').val(),
                    Nome: {
                        Family: $('.nome-font #font-picker').val(),
                        Size: parseFloat($('.nome-font #font-size').val()),
                        Color: $('.nome-font #font-color').val(),
                        Align: $('.nome-font .active').attr('class').split(/\s+/)[1].split('-')[2],
                        Margin: parseFloat($('.nome-font #font-padding').val()),
                    },
                    Apelido: {
                        Family: $('.apelido-font #font-picker').val(),
                        Size: parseFloat($('.apelido-font #font-size').val()),
                        Color: $('.apelido-font #font-color').val(),
                        Align: $('.apelido-font .active').attr('class').split(/\s+/)[1].split('-')[2],
                        Margin: parseFloat($('.apelido-font #font-padding').val()),
                    },
                    Equipe: {
                        Family: $('.equipe-font #font-picker').val(),
                        Size: parseFloat($('.equipe-font #font-size').val()),
                        Color: $('.equipe-font #font-color').val(),
                        Align: $('.equipe-font .active').attr('class').split(/\s+/)[1].split('-')[2],
                        Margin: parseFloat($('.equipe-font #font-padding').val()),
                    }
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaCracha();
                $("#modal-cracha").modal("hide");
            }
        });
    }
}


function Align(side, type) {
    $(`span.${type}-cracha`).css('text-align', side)
    var sides = ['left', 'center', 'right']

    sides.map(x => {
        if (side == x) {

            $(`.${type}-font .fa-align-${x}`).addClass('active')
        } else {
            $(`.${type}-font .fa-align-${x}`).removeClass('active')
        }
    })


}

function print() {
    $('span.nome-cracha').text('Felipe Reinaux')
    $('span.apelido-cracha').text('Renô')
    $('span.equipe-cracha').text('Secretaria')
    $('#cracha').toggleClass('moldura-modal')
    html2canvas($("#cracha")[0]).then(canvas => {
        var imgData = canvas.toDataURL(
            'image/png');
        var formatArray = $('#paper').val() == 'custom' ? new Array(Number($('#largura').val()), Number($('#altura').val())) : $('#paper').val()
        var doc = new jsPDF($('#paper').val() == 'custom' ? 'p' : $('#orientation:checked').val(), 'cm', formatArray);
        for (var i = 0; i < Number($('#rows').val()); i++) {
            for (var z = 0; z < Number($('#cols').val()); z++) {
                doc.addImage(imgData, 'PNG', Number($('#margin-h').val()) + (z * Number($('#largura').val())), Number($('#margin-w').val()) + (i * Number($('#altura').val())));
            }
        }
        printDoc(doc)
        $('#cracha').toggleClass('moldura-modal')
        $('span.nome-cracha').text('{Nome}')
        $('span.apelido-cracha').text('{Apelido}')
        $('span.equipe-cracha').text('{Equipe}')
    });
}

function selectFile(evt) {
    selected = evt
}

$('html').keyup(function (e) {
    if (e.keyCode == 46 && selected) {
        $(selected).remove()
    }
});

function AddArquivo() {
    const [file] = $('#arquivo')[0].files

    if (file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            var container = $(`<div onclick='selectFile(this)' class="arquivos-cracha" id="arquivo-container${arquivos}" style="position:absolute;top:0;left:0;display:inline-block;z-index:${arquivos}">
        <img style="top:0;left:0;max-width:100%; cursor: grab" id="img-arquivo${arquivos}" src="${reader.result}" />
    </div>`)
            container.appendTo("#cracha")
            dragResize()

        }
        reader.readAsDataURL(file);

        arquivos++
    }
}

function dragResize() {

    $("*[id*='arquivo-container']").draggable({
        containment: "#cracha"
    });


    function loadResizable() {
        $("*[id*='img-arquivo']").resizable({
            containment: "#cracha"
        })

    }

    setTimeout(loadResizable, 500)
}


function renderCracha() {
    $("#container-cracha").height($("#altura").val() * razao)
    $("#cracha").height($("#altura").val() * razao)
    $("#cracha").width($("#largura").val() * razao)

    $('.text-cracha').draggable({
        containment: "#cracha"
    })

    $('span.apelido-cracha').css('font-size', `${$('.apelido-font #font-size').val()}px`)
    $('span.apelido-cracha').css('padding-left', `${$('.apelido-font #font-padding').val()}px`)
    $('span.apelido-cracha').css('padding-right', `${$('.apelido-font #font-padding').val()}px`)
    $('span.apelido-cracha').css('color', `${$('.apelido-font #font-color').val()}`)

    $('span.equipe-cracha').css('font-size', `${$('.equipe-font #font-size').val()}px`)
    $('span.equipe-cracha').css('padding-left', `${$('.equipe-font #font-padding').val()}px`)
    $('span.equipe-cracha').css('padding-right', `${$('.equipe-font #font-padding').val()}px`)
    $('span.equipe-cracha').css('color', `${$('.equipe-font #font-color').val()}`)

    $('span.nome-cracha').css('padding-left', `${$('.nome-font #font-padding').val()}px`)
    $('span.nome-cracha').css('font-size', `${$('.nome-font #font-size').val()}px`)
    $('span.nome-cracha').css('color', `${$('.nome-font #font-color').val()}`)
    $('span.nome-cracha').css('padding-right', `${$('.nome-font #font-padding').val()}px`)


}


$(document).ready(function () {
    CarregarTabelaCracha()
    $('.nome-font #font-picker')
        .fontpicker({ parentElement: '#form-cracha' }).on('change', function () {
            $('.nome-cracha').css(getCss(this.value));
        });
    $('.apelido-font #font-picker')
        .fontpicker({ parentElement: '#form-cracha' }).on('change', function () {
            $('.apelido-cracha').css(getCss(this.value));
        });
    $('.equipe-font #font-picker')
        .fontpicker({ parentElement: '#form-cracha' }).on('change', function () {
            $('.equipe-cracha').css(getCss(this.value));
        });
    $('input[type=radio][id=background]').on('ifChecked', function (event) {

        if (this.value == 'foto') {
            $('.background').removeClass('d-none')
        } else {
            $('.background').addClass('d-none')
        }
    });
});

function getCss(value) {
    var tmp = value.split(':'),
        family = tmp[0],
        variant = tmp[1] || '400',
        weight = parseInt(variant, 10),
        italic = /i$/.test(variant);

    // Set selected font on body
    return {
        fontFamily: "'" + family + "'",
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal'
    };
}




