function CarregarTabelaArquivo() {
    const tableArquivoConfig = {
        language: languageConfig,
        lengthMenu: [200, 500, 1000],
        colReorder: false,
        serverSide: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true,
        destroy: true,
        dom: domConfigNoButtons,
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            { data: "Extensao", name: "Extensao", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "10%",
                "render": function (data, type, row) {
                    return `${GetButton('GetArquivo', data, 'blue', 'fa-download', 'Download')}
                            ${GetButton('DeleteArquivo', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: $("#table-arquivos").length > 0 ? '/Arquivo/GetArquivos' : '/Arquivo/GetArquivosComunEquipe',
            data: {
                EventoId: $("#table-arquivos").length > 0 ? null : $("[id$='eventoid']").val()
            }, 
            datatype: "json",
            type: "POST"
        }
    };

    if ($("#table-arquivos").length > 0) {

        $("#table-arquivos").DataTable(tableArquivoConfig);
    } else {
        $("#table-arquivos-comuns").DataTable(tableArquivoConfig);
    }
}

function GetArquivo(id) {
    window.open(`/Arquivo/GetArquivo/${id}`)
}

function DeleteArquivo(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Arquivo/DeleteArquivo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaArquivo();
                }
            });
        }
    });
}

function PostArquivo() {
    var dataToPost = new FormData($('#frm-upload-arquivos')[0]);
    dataToPost.set('IsComunEquipe', $("#table-arquivos-comuns").length > 0)
    dataToPost.set('ConfiguracaoId', config.Id)
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "Arquivo/PostArquivo",
            success: function () {
                CarregarTabelaArquivo();
            }
        });
}

$("#arquivo").change(function () {
    PostArquivo();
});

$(document).ready(function () {
    CarregarTabelaArquivo();
});



