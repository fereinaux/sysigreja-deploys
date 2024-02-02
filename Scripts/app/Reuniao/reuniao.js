rootModal = ReactDOM.createRoot(document.getElementById("root-reunioes"));
loadModal = typeof loadModal !== 'undefined' ? loadModal : function () { }

function CarregarTabelaReuniao() {
    $.fn.dataTable.moment('DD/MM/YYYY HH:mm');
    const tableReuniaoConfig = {
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
        buttons: getButtonsConfig('Reuniões'),
        columns: [
            { data: "Titulo", name: "Titulo", autoWidth: true },
            {
                data: "DataReuniao", name: "DataReuniao", autoWidth: true,
                "render": function (data, type, row) {
                    return `${moment(data).format('DD/MM/YYYY HH:mm')} `;
                }
            },
            { data: "Presenca", name: "Presenca", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "10%",
                "render": function (data, type, row) {
                    return `${GetButton('EditReuniao', data, 'blue', 'fa-edit', 'Editar')}
                               ${GetButton('DeleteReuniao', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [1, "asc"]
        ],
        ajax: {
            url: '/Reuniao/GetReunioes',
            data: { EventoId: SelectedEvent.Id },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-reunioes").DataTable(tableReuniaoConfig);
}

function GetReuniao(id) {

    campos = [
        {
            Campo: "Id",
            Tipo: "Id"
        },
        {
            Titulo: "Título",
            Campo: "Titulo",
            Tipo: "String"
        }, {
            Titulo: "Data da Reunião",
            Campo: "DataReuniao",
            Tipo: "DataHora"
        }
    ]

    if (id > 0) {
        $.ajax({
            url: "/Reuniao/GetReuniao/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                loadModal(rootModal,"modal-reuniao", data.Reuniao.Titulo, campos, data.Reuniao, PostReuniao)
            }
        });
    }
    else {
        loadModal(rootModal,"modal-reuniao", "Nova Reunião", campos, {}, PostReuniao)
    }
}

function PresencaReuniao(equipes) {
    $("#table-ata-presenca").DataTable({
        language: languageConfig,
        lengthMenu: [20],
        colReorder: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfig,
        buttons: getButtonsConfig('Presença'),
        data: equipes,
        columns: [
            { data: "PresencaOrder", name: "PresencaOrder", visible: false },
            { data: "Equipe", name: "Equipe", autoWidth: true },
            { data: "Presenca", name: "Presenca", autoWidth: true, orderData: 0 },

        ],
        order: [
            [1, "asc"]
        ],
    });
    $("#modal-presenca").modal();
}

function EditReuniao(id) {
    GetReuniao(id);
}

function DeleteReuniao(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Reuniao/DeleteReuniao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaReuniao();
                }
            });
        }
    });
}

function PostReuniao() {
    if (ValidateForm(`#form-reuniao`)) {
        $.ajax({
            url: "/Reuniao/PostReuniao/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(getFormData($("#modal-reuniao form"))),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaReuniao();
                $("#modal-reuniao").modal("hide");
            }
        });
    }
}

$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTabelaReuniao();
   
});


