function CarregarTabelaPresenca() {
    if ($("#presenca-eventoid").val() && $("#presenca-equipeid").val()) {
        const tablePresencaConfig = {
            language: languageConfig,
            lengthMenu: [200, 500, 1000],
             colReorder: true,
        serverSide: false,
        scrollX: true,
        scrollXollapse: true,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
            dom: domConfig,
            buttons: [{
                extend: 'excelHtml5', title: "Ata de Presença", exportOptions: {
                    columns: [0, 1]
                }
            },],
            columns: [
                { data: "Nome", name: "Nome", autoWidth: true },
                {
                    data: "Id", name: "Id", visible: false, className: 'noVis noSearch',
                    "render": function (data, type, row) {
                        return `${row.Presenca ? "✔": ""}`;
                    }
                },
                {
                    data: "Id", name: "Id", orderable: false, width: "15%",
                    "render": function (data, type, row) {
                        return `${GetCheckBox(data, row.Presenca)}`;
                    }
                }
            ],
            order: [
                [0, "asc"]
            ],
            drawCallback: function () {
                $('.i-checks-green').iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'
                });
                $('.i-checks-green').on('ifClicked', function (event) {
                    TogglePresenca($(event.target).data("id"));
                });
            },
            initComplete: function () {
                $('.i-checks-green').iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'
                });
                $('.i-checks-green').on('ifClicked', function (event) {
                    TogglePresenca($(event.target).data("id"));
                });
            },
            ajax: {
                url: '/Equipe/GetPresenca',
                datatype: "json",
                data: {
                    EventoId: $("#presenca-eventoid").val(),
                    EquipeId: $("#presenca-equipeid").val(),
                    ReuniaoId: $("#presenca-reuniaoid").val() || 0
                },
                type: "POST"
            }
        };
        $("#table-presenca").DataTable(tablePresencaConfig);
    }
}

function loadScreen() {
    getReunioes();
    getPresencas();
    CarregarTabelaPresenca()
}

$(document).ready(function () {
    loadScreen()
});

function TogglePresenca(id) {
    $.ajax({
        url: "/Equipe/TogglePresenca/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EquipanteEventoId: id,
                ReuniaoId: $("#presenca-reuniaoid").val()
            })
    });
}

function getReunioes() {
    $("#presenca-reuniaoid").empty();

    $.ajax({
        url: "/Equipe/GetReunioes/",
        data: { EventoId: $("#presenca-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Reunioes.forEach(function (reuniao, index, array) {
                $('#presenca-reuniaoid').append($(`<option value="${reuniao.Id}">${moment(reuniao.DataReuniao).format('DD/MM/YYYY')}</option>`));
            });
            $("#presenca-reuniaoid").val($("#presenca-reuniaoid option:first").val()).trigger("chosen:updated");
            CarregarTabelaPresenca();
        }
    });
}

function getPresencas() {
    $("#presenca-equipeid").empty();

    $.ajax({
        url: "/Equipe/GetEquipesByUser/",
        data: { EventoId: $("#presenca-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            $('#presenca-equipeid').append($(`<option value="0">Selecione</option>`));
            data.Equipes.forEach(function (equipe, index, array) {
                $('#presenca-equipeid').append($(`<option value="${equipe.Id}">${equipe.Nome}</option>`));
            });
            $("#presenca-equipeid").val($("#presenca-equipeid option:first").val()).trigger("chosen:updated");
            CarregarTabelaPresenca();
        }
    });
}
