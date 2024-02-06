jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "num-br-pre": function (data) {
        return parseFloat(data.replace("R$", "").replace("&nbsp;", "").replace(/\./g, "").replace(",", "."));
    },
    "num-br-asc": function (a, b) {
        console.log(a);
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "num-br-desc": function (a, b) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    },
    "mesano-br-pre": function (data) {
        var partes = data.split("/");
        return partes[1] + partes[0];
    },
    "mesano-br-asc": function (a, b) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "mesano-br-desc": function (a, b) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    },
    "data-br-pre": function (a) {
        if (a == null || a == "") { return 0; }
        var dataBR = a.split('/');
        return (dataBR[2] + dataBR[1] + dataBR[0]) * 1;
    },
    "data-br-asc": function (a, b) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    },
    "data-br-desc": function (a, b) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    },
});

const languageConfig = {
    decimal: ",",
    thousands: ".",
    emptyTable: "Nenhum registro encontrado",
    info: "Apresentando _START_ até _END_ de _TOTAL_ registro(s)",
    infoEmpty: "",
    infoFiltered: "(filtrado de _MAX_ registros)",
    infoPostFix: "",
    lengthMenu: "Mostrar _MENU_ registros",
    loadingRecords: "Carregando...",
    processing: "Processando...",
    search: "Pesquisar:",
    zeroRecords: "Nenhum registro encontrado",
    paginate: {
        "first": "Primeira",
        "last": "Última",
        "next": "Próxima",
        "previous": "Anterior"
    },
    aria: {
        sortAscending: ": ative para ordenar a coluna em ordem crescente",
        sortDescending: ": ative para ordenar a coluna em ordem decrescente"
    }
};

const domConfig = '<"html5buttons"B>lfTgitp';
const domConfigNoButtons = 'lfTgitpr';
const defaultLengthMenu = [100, 1000, 10000, 100000];
const defaultScrollY = 400;




function getButtonsConfig(fileName) {
    return [
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
            extend: 'excel', title: fileName, exportOptions: {
                columns: ':not(.noExport):visible, .export', orthogonal: 'export'
            }
        },
        {
            extend: 'pdf', orientation: 'landscape', exportOptions: {
                columns: isMobile ? ':not(.noExport), .export' : ':not(.noExport):visible, .export', orthogonal: 'export'
            }, customize: function (doc) {

                //doc.content.images = {
                //    logo: `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`
                //}
                doc.content.splice(0, 1, {
                    columns: [
                        //{
                        //    margin: [5, 5, 25, 15],
                        //    alignment: 'left',
                        //    image: "logo",
                        //    width: 70
                        //},
                        { ...doc.content[0], alignment: 'left', margin: [15, 25, 5, 5], }

                    ]

                });

                doc.defaultStyle.icon = { font: 'emoji' }


            }
        },
        {
            extend: 'print', title: fileName, text: "Imprimir", exportOptions: {
                columns: ':not(.noExport):visible, .export', orthogonal: 'export'
            }
        },
    ];
}


function stateSaveCallback(settings, data) {
    localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data))
}

function stateLoadCallback(settings, callback) {
    callback(JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance)))

    $("div.dataTables_filter input").unbind();
    $("div.dataTables_filter input").on('keyup change clear', _.debounce(function () {
        input_filter_value = this.value;
        if ($(this).parent().parent().parent().find('table').DataTable().search() !== input_filter_value) {
            $(this).parent().parent().parent().find('table').DataTable().search(input_filter_value).draw()
        }

    }, 750))
}
