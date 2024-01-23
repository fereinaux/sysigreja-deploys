
table = undefined
function CarregarTabelaPresenca() {
    if (SelectedEvent.Id && $("#presenca-equipeid").val()) {
        $.ajax({
            url: '/Equipe/GetPresenca',
            datatype: "json",
            data: {
                EventoId: SelectedEvent.Id,
                EquipeId: $("#presenca-equipeid").val(),
            },
            type: "POST",
            success: function (data) {
                if (table) {

                    table.destroy();
                    $('#table-ata-presenca').empty(); // empty in case the columns change
                }

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
                    data: data.data,
                    buttons: [

                        {
                            extend: 'colvis', text: 'Colunas', columns: ':not(.noVis)', action: function (e, dt, node, config) {
                                dt.on('buttons-action', function (e, buttonApi, dataTable, node, config) {

                                    if (node[0].className.includes('Visibility')) {
                                        dt.draw(false)
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
                                            image: `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`,
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
                        { title: "Nome", data: "Nome", name: "Nome", autoWidth: true },
                        ...data.colunas.map((coluna, index) => ({
                            title: coluna.Data, data: "Id", name: "Id", orderable: false, width: "15%",
                            "render": function (data, type, row, meta) {
                                if (type === 'export') {
                                    return row.Reunioes[index].Presenca ? (row.Reunioes[index].Justificada ? "!" : '√') : "X"
                                }

                                return `<span id="${data}${coluna.Id}" onclick='handlePresenca(${JSON.stringify({ RowIndex: meta.row, ColIndex: meta.col, Id: `${data}${coluna.Id}`, EquipanteId: data, ReuniaoId: coluna.Id, ReuniaoIndex: index })})' class="i-checks-green icheckbox_square-green ${row.Reunioes[index].Justificada ? "indeterminate" : (row.Reunioes[index].Presenca ? "checked" : "")}"></span>`
                            }
                        }))
                    ],
                    order: [
                        [0, "asc"]
                    ],
                    drawCallback: function () {


                    },

                };

                table = $("#table-ata-presenca").DataTable(tablePresencaConfig);
            }
        })


    }
}

async function loadScreen() {
    await Promise.all([getReunioes(), getPresencas()])
    CarregarTabelaPresenca()
}

function handlePresenca(obj) {
    if ($(`#${obj.Id}`).hasClass('checked')) {
        ConfirmMessage("Deseja justificar a falta?").then((result) => {
            if (result) {
                Justificar(obj);
            }
        })
    } else {
        TogglePresenca(obj);
    }

}

$(document).off('ready-ajax').on('ready-ajax', () => {
    loadScreen()
});

function TogglePresenca(obj) {
    let data = table.row(obj.RowIndex).data()



    $.ajax({
        url: "/Equipe/TogglePresenca/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EquipanteEventoId: obj.EquipanteId,
                ReuniaoId: obj.ReuniaoId
            }),
        success: function () {

            if ($(`#${obj.Id}`).hasClass('indeterminate')) {

                data.Reunioes[obj.ReuniaoIndex].Justificada = false;

                data.Reunioes[obj.ReuniaoIndex].Presenca = false
            } else {
                data.Reunioes[obj.ReuniaoIndex].Justificada = false;

                data.Reunioes[obj.ReuniaoIndex].Presenca = true
            }

            table.row(obj.RowIndex).data(data).draw(false)
        }
    });
}

function Justificar(obj) {

    $.ajax({
        url: "/Equipe/Justificar/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EquipanteEventoId: obj.EquipanteId,
                ReuniaoId: obj.ReuniaoId
            }),
        success: function () {

            let data = table.row(obj.RowIndex).data()

            data.Reunioes[obj.ReuniaoIndex].Justificada = true

            table.row(obj.RowIndex).data(data).draw(false)
        }
    });
}

async function getReunioes() {
    $("#presenca-reuniaoid").empty();

    await $.ajax({
        url: "/Equipe/GetReunioes/",
        data: { EventoId: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Reunioes.forEach(function (reuniao, index, array) {
                $('#presenca-reuniaoid').append($(`<option value="${reuniao.Id}">${moment(reuniao.DataReuniao).format('DD/MM/YYYY')} - ${reuniao.Titulo}</option>`));
            });
            $("#presenca-reuniaoid").val($("#presenca-reuniaoid option:first").val()).trigger("chosen:updated");
        }
    });
}

async function getPresencas() {
    $("#presenca-equipeid").empty();

    await $.ajax({
        url: '/Equipe/GetEquipes',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
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
