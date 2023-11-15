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
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfigNoButtons,
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            { data: "Data", name: "Data", autoWidth: true },
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
            url: '/Arquivo/GetBoletins',
            datatype: "json",
            type: "POST"
        }
    };


    $("#table-arquivos").DataTable(tableArquivoConfig);

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
    if (ValidateForm(`#frm-boletim`)) {
        var dataToPost = new FormData($('#frm-boletim')[0]);
        var filename = dataToPost.get('arquivo-boletim').name

        var arquivo = new File([dataToPost.get('arquivo-boletim')], `${$('#arquivo-titulo').val()}${filename.substr(filename.indexOf('.'))}`);

        dataToPost.set('Arquivo', arquivo)
        dataToPost.set('Categoria', 'Boletim')
        dataToPost.set('Data', moment($('#arquivo-data').val(), 'DD/MM/YYYY', 'pt-br').toJSON(),)
        $.ajax(
            {
                processData: false,
                contentType: false,
                type: "POST",
                data: dataToPost,
                url: "/Arquivo/PostArquivo",
                success: function () {
                    CarregarTabelaArquivo();
                    $("#modal-boletim").modal("hide");
                }
            });
    }
}

function AddBoletim() {
    $('#arquivo-boletim').val('')
    $('#arquivo-data').val('')
    $('#arquivo-titulo').val('')
    $("#modal-boletim").modal();
}

$(document).ready(function () {
    verifyPermissionsConfig()
    CarregarTabelaArquivo();
});



