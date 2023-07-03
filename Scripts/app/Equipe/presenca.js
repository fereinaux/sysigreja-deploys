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
            buttons: [

                {
                    extend: 'colvis', text: 'Colunas', columns: ':not(.noVis)', action: function (e, dt, node, config) {
                        dt.on('buttons-action', function (e, buttonApi, dataTable, node, config) {

                            if (node[0].className.includes('Visibility')) {
                                dt.draw()
                            }
                        });
                        $.fn.dataTable.ext.buttons.collection.action.call(this, e, dt, node, config);
                        if (typeof (onLoadCampos) == 'function') {
                            onLoadCampos();
                        }
                    }
                },
                {
                    extend: 'pdf', orientation: 'landscape', exportOptions: {
                        columns: isMobile ? ':not(.noExport), .export' : ':not(.noExport):visible, .export', orthogonal: 'export'
                    }, customize: function (doc) {

                        doc.content.splice(0, 1, {
                            columns: [
                                {
                                    margin: [5, 5, 25, 15],
                                    alignment: 'left',
                                    image: `data:image/png;base64, ${config.LogoRelatorio}`,
                                    width: 70
                                },
                                { ...doc.content[0], alignment: 'left', margin: [15, 25, 5, 5], }

                            ]

                        });
                    }
                },
                {

                    extend: 'excelHtml5', title: "Ata de Presença", exportOptions: {
                        columns: [0, 1, 2]
                    }
                },],
            columns: [
                { data: "Nome", name: "Nome", autoWidth: true },
                { data: "Congregacao", name: "Congregacao", autoWidth: true },
                {
                    data: "Id", name: "Id", orderable: false, width: "15%",
                    "render": function (data, type, row) {
                        if (type === 'export') {
                            return row.Presenca ? "SIM" : "NÃO"
                        }
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
                $('#presenca-reuniaoid').append($(`<option value="${reuniao.Id}">${moment(reuniao.DataReuniao).format('DD/MM/YYYY')} - ${reuniao.Titulo}</option>`));
            });
            $("#presenca-reuniaoid").val($("#presenca-reuniaoid option:first").val()).trigger("chosen:updated");
            CarregarTabelaPresenca();
        }
    });
}

function getPresencas() {
    $("#presenca-equipeid").empty();

    $.ajax({
        url: '/Equipe/GetEquipes',
        datatype: "json",
        data: { EventoId: $("#presenca-eventoid").val() },
        type: "POST",
        success: (result) => {
            $('#presenca-equipeid').append($(`<option value="0">Selecione</option>`));
            result.data.forEach(function (equipe) {
                $('#presenca-equipeid').append($(`<option value="${equipe.Id}">${equipe.Equipe}</option>`));
            });
            $("#presenca-equipeid").val($("#presenca-equipeid option:first").val()).trigger("chosen:updated");
        }
    });
}
