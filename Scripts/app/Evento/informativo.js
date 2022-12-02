let eventoId
function CarregarTabelaEvento() {
    const tableEventoConfig = {
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
        buttons: getButtonsConfig('Eventos'),
        columns: [
            {
                data: "Descricao", name: "Descricao", autoWidth: true,
            },
            {
                data: "DataEvento", name: "DataEvento", autoWidth: true,
                "render": function (data, type, row) {
                    return `${moment(data).format('DD/MM/YYYY')} `;
                }
            },
            {
                data: "Id", name: "Id", orderable: false, width: "30%",
                "render": function (data, type, row) {

                    return `
       <form enctype="multipart/form-data" id="frm-arte${data}" method="post" novalidate="novalidate">
<label for="arte${data}" class="inputFile">
                                <span style="font-size:18px" class="${row.ArteId ? 'text-success' : ""} pointer p-l-xs"><i class="fas fa-image" aria-hidden="true" title="Arte"></i></span>
                                <input accept="image/*" onchange='Arte(${JSON.stringify(row)})' style="display: none;" class="custom-file-input inputFile" id="arte${data}" name="arte${data}" type="file" value="">
                            </label>
                            ${GetButton('EditEvento', data, 'blue', 'fa-edit', 'Editar')}
                            ${GetButton('DeleteEvento', data, 'red', 'fa-trash', 'Excluir')}
</form>`;
                }
            }
        ],
        order: [
            [2, "desc"]
        ],
        ajax: {
            url: '/Evento/GetInformativos',
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-eventos").DataTable(tableEventoConfig);
}

function GetEvento(id) {
    if (id > 0) {
        $.ajax({
            url: "/Evento/GetEvento/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#evento-id").val(data.Evento.Id);
                $("#evento-descricao").val(data.Evento.Descricao);
                $("#evento-urlexterna").val(data.Evento.UrlExterna);
                $("#evento-numeracao").val(data.Evento.Numeracao);
                $("#evento-nomelocal").val(data.Evento.NomeLocal);
                $("#evento-linklocal").val(data.Evento.LinkLocal);
                $("#evento-capacidade").val(data.Evento.Capacidade);
                $(`#evento-conteudo`).summernote({
                    height: 300,
                    lang: 'pt-BR',
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['font', ['strikethrough', 'superscript', 'subscript']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']],
                        ['insert', ['link']],
                        ['view', ['codeview']]],

                }).summernote('code', data.Evento.Conteudo)
                $("#evento-valor").val(data.Evento.Valor);
                $('#evento-global').iCheck((data.Evento.Global ? 'check' : 'uncheck'))
                $("#evento-taxa").val(data.Evento.ValorTaxa);
                $("#evento-data").val(moment(data.Evento.DataEvento).format('DD/MM/YYYY'));
                $("#evento-tipo").val(data.Evento.ConfiguracaoId).trigger("chosen:updated");
            }
        });
    }
    else {
        $("#evento-id").val(0);
        $("#evento-numeracao").val("");
        $("#evento-urlexterna").val("");
        $('#evento-global').iCheck('uncheck')
        $("#evento-descricao").val("");
        $("#evento-nomelocal").val("");
        $("#evento-linklocal").val("");
        $("#evento-capacidade").val("");
        $("#evento-data").val("");
        $("#evento-valor").val("");
        $(`#evento-conteudo`).summernote({
            height: 300,
            lang: 'pt-BR',
            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['font', ['strikethrough', 'superscript', 'subscript']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['height', ['height']],
                ['insert', ['link']],
                ['view', ['codeview']]],

        }).summernote('code', "")
        $("#evento-taxa").val("");
    }
}

function EditEvento(id) {
    GetEvento(id);
    $("#modal-eventos").modal();
}

function DeleteEvento(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Evento/DeleteEvento/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaEvento();
                }
            });
        }
    });
}

function PostEvento() {
    if (ValidateForm(`#form-evento`)) {
        $.ajax({
            url: "/Evento/PostInformativo/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#evento-id").val(),
                    NomeLocal: $("#evento-nomelocal").val(),
                    LinkLocal: $("#evento-linklocal").val(),
                    Descricao: $("#evento-descricao").val(),
                    UrlExterna: $("#evento-urlexterna").val(),
                    Conteudo: $('#evento-conteudo').summernote('code'),
                    DataEvento: moment($("#evento-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaEvento();
                $("#modal-eventos").modal("hide");
            }
        });
    }
}

$(document).ready(function () {
    CarregarTabelaEvento();
});

$("#arquivo").change(function () {
    PostArquivo();
});


function Arte(row) {

    evento = row
    var dataToPost = new FormData($(`#frm-arte${evento.Id}`)[0]);
    dataToPost.set('Arquivo', dataToPost.get('arte${evento.Id}'))
    dataToPost.set('EventoId', evento.Id)
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "/Arquivo/PostArquivo",
            success: function (data) {
                $.ajax({
                    url: "/Evento/PostArte/",
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(
                        {
                            EventoId: evento.Id,
                            ArteId: data
                        }),
                    success: function () {
                        SuccessMesageOperation();
                        $("#modal-arte").modal("hide");
                    }
                });

            }
        });
}