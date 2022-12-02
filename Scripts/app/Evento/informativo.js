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
<label for="arte${data}" class="inputFile">
                                <span style="font-size:18px" class="${row.ArteId ? 'text-success' : ""} pointer p-l-xs"><i class="fas fa-image" aria-hidden="true" title="Arte"></i></span>
                                <input accept="image/*" onchange='Arte(${JSON.stringify(row)})' style="display: none;" class="custom-file-input inputFile" id="arte${data}" name="arte${data}" type="file" value="">
                            </label>
                            ${GetButton('EditEvento', data, 'blue', 'fa-edit', 'Editar')}
                            ${GetButton('DeleteEvento', data, 'red', 'fa-trash', 'Excluir')}`;
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

    var input = $(`#arte${evento.Id}`)[0]

    const file = input.files[0];


    if (!file) {
        return;
    }

    new Compressor(file, {
        quality: 0.6,
        convertSize: 1000000,
        // The compression process is asynchronous,
        // which means you have to access the `result` in the `success` hook function.
        success(result) {

            var reader = new FileReader();

            reader.onload = function (e) {
                $("#main-cropper").croppie("bind", {
                    url: e.target.result
                });

            };

            reader.readAsDataURL(result);


            $("#modal-arte").modal();
            var boundaryWidth = $("#artecontent").width();

            var boundaryHeight = boundaryWidth * 0.40;

            var viewportWidth = boundaryWidth - (boundaryWidth / 100 * 25);

            var viewportHeight = boundaryHeight - (boundaryHeight / 100 * 25);

            $("#main-cropper").croppie({

                viewport: { width: viewportWidth, height: viewportHeight },
                boundary: { width: boundaryWidth, height: boundaryHeight },
                enableOrientation: true,
                showZoomer: true,
                enableExif: true,
                enableResize: false,

            });
        },
        error(err) {
            console.log(err.message);
        },
    });
}

function ConfirmArte() {

    $("#main-cropper")
        .croppie("result", {
            type: "canvas",
            size: { height: 400, width: 1000 }
        })
        .then(function (resp) {
            var dataToPost = new FormData();
            dataToPost.set('Arquivo', dataURLtoFile(resp, `Arte ${evento.Descricao}.jpg`))
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
        });
}

function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime })

}