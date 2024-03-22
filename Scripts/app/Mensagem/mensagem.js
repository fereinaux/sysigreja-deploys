function CarregarTabelaMensagem() {
    const tableMensagemConfig = {
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
        buttons: getButtonsConfig('Mensagens'),
        columns: [
            { data: "Titulo", name: "Titulo", autoWidth: true },
            {
                data: "Tipos", name: "Tipos", autoWidth: true, "render": function (data, type, row) {
                    return data.map(tipo => `<span class="badge m-r-xs">${tipo}</span>`).join().replace(/,/g, '')
                }
            },
            {
                data: "Id", name: "Id", orderable: false, width: "25%",
                "render": function (data, type, row) {

                    return `${GetButton('EditMensagem', data, 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteMensagem', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [1, "asc"]
        ],
        ajax: {
            url: '/Mensagem/GetMensagens',
            data: { ConfiguracaoId: SelectedConfig.Id },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-mensagem").DataTable(tableMensagemConfig);

    if (SelectedConfig.AccessTokenMercadoPago) {
        $('#mercado-pago-link').css('display', 'block')
    } else {
        $('#mercado-pago-link').css('display', 'none')
    }

    if (SelectedConfig.TokenPagSeguro) {
        $('#pagseguro-link').css('display', 'block')
    } else {
        $('#pagseguro-link').css('display', 'none')
    }


}

function GetMensagem(id) {
    if (id > 0) {
        $.ajax({
            url: "/Mensagem/GetMensagem/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#mensagem-id").val(data.Mensagem.Id);
                $("#mensagem-titulo").val(data.Mensagem.Titulo);
                $.each($('.mensagem-tipo'), function () {
                    if (data.Mensagem.Tipos.includes($(this).attr('value'))) {

                        $(this).iCheck('check')
                    }
                });
                $("#mensagem-conteudo").val(data.Mensagem.Conteudo);
            }
        });
    }
    else {
        $("#mensagem-id").val(0);
        $("#mensagem-titulo").val("");
        $.each($('.mensagem-tipo'), function () {

                $(this).iCheck('uncheck')
        });
        $("#mensagem-conteudo").val("");
    }
}

function EditMensagem(id) {
    GetMensagem(id);
    $("#modal-mensagem").modal();
}

function DeleteMensagem(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Mensagem/DeleteMensasgem/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaMensagem();
                }
            });
        }
    });
}

function AddText(text) {
    var cursorPos = $('#mensagem-conteudo').prop('selectionStart');
    var v = $('#mensagem-conteudo').val();
    var textBefore = v.substring(0, cursorPos);
    var textAfter = v.substring(cursorPos, v.length);

    $('#mensagem-conteudo').val(textBefore + text + textAfter);
}

function PostMensagem() {
    if (ValidateForm(`#form-mensagem`)) {
        var tipos = [];
        $.each($('.mensagem-tipo:checked'), function () {
            tipos.push($(this).val());
        });
        $.ajax({
            url: "/Mensagem/PostMensagem/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#mensagem-id").val(),
                    Titulo: $("#mensagem-titulo").val(),
                    Tipos: tipos,
                    ConfiguracaoId: SelectedConfig.Id,
                    Conteudo: $("#mensagem-conteudo").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaMensagem();
                $("#modal-mensagem").modal("hide");
            }
        });
    }
}

$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTabelaMensagem();


    $('.i-checks-green').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });
});


