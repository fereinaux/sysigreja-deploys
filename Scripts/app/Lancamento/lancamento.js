function CarregarTabelaLancamento(id, tipo) {

    var columns = [

        { title: "Descricao", data: "Descricao", name: "Descricao", autoWidth: true },
        { title: "Origem", data: "Origem", name: "Origem", autoWidth: true },
        { title: "Centro de Custo", data: "CentroCusto", name: "CentroCusto", autoWidth: true },
        { title: "Forma de Pagamento", data: "FormaPagamento", name: "FormaPagamento", autoWidth: true },
        { title: "Valor", data: "Valor", name: "Valor", autoWidth: true },
        { title: "Data do Lançamento", data: "DataLancamento", name: "DataLancamento", autoWidth: true },
        {
            title: "Ações",
            data: "Id", name: "Id", orderable: false, width: "10%",
            "render": function (data, type, row) {
                return `${GetAnexosButton('AnexosLancamento', JSON.stringify(row), row.QtdAnexos)}
                            ${GetButton('EditLancamento', JSON.stringify({ Id: data, Tipo: tipo }), 'blue', 'fa-edit', 'Editar')}   
                            ${row.Observacao != null ? GetButton('PrintRecibo', data, 'yellow', 'fa-print', 'Imprimir Recibo') : ""}
                            ${GetButton('DeleteLancamento', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]

    if (Usuario.IsGeral) {
        columns = [{ title: "Evento", data: "Evento", name: "Evento", autoWidth: true }, ...columns]
    }

    var ajaxOptions = {
        url: '/Lancamento/GetPagamentosDatatable',
        data:
        {
            ConfiguracaoId: Usuario.IsGeral ? SelectedConfig.Id : null,
            CentroCustoId: $('#busca-centrocusto').val() == 0 ? null : $('#busca-centrocusto').val(),
            EventoId: !Usuario.IsGeral ? SelectedEvent.Id : null,
            MeioPagamentoId: $('#busca-meiopagamento').val() == 0 ? null : $('#busca-meiopagamento').val(),
            Tipo: tipo == "Receber" ? 1 : 2,
            DataIni: moment($("#data-inicial").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
            DataFim: moment($("#data-final").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
        },
        datatype: "json",
        type: "POST"
    };

    var tableLancamentoConfig = {
        language: languageConfig,
        lengthMenu: [10, 50, 100, 200, 1000],
        colReorder: false,
        serverSide: true,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfig,
        buttons: getButtonsConfig('A Receber'),
        columns,
        order: [
            [1, "asc"]
        ],
        ajax: ajaxOptions,
        drawCallback: function (row, data, start, end, display) {
            //var api = this.api(), data;
            //var intVal = function (i) {
            //    return typeof i === 'string' ?
            //        Number(i.replace('R$', '').replace('.', '').replace(',', '.')) * 1 :
            //        typeof i === 'number' ?
            //            i : 0;
            //};

            //total = api
            //    .column(4, { selected: true, search: 'applied' })
            //    .data()
            //    .reduce(function (a, b) {
            //        return intVal(a) + intVal(b);
            //    }, 0);


            //$(api.column(4).footer()).html(
            //    total.toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })
            //);
        }
    };

    $(id).DataTable(tableLancamentoConfig);
}

function GetLancamento(id) {
    if (id > 0) {
        $.ajax({
            url: "/Lancamento/GetLancamento/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                handleSelect()
                $("#lancamento-id").val(data.Lancamento.Id);
                $("#lancamento-centrocusto").val(data.Lancamento.CentroCustoId).trigger('change');
                $("#lancamento-descricao").val(data.Lancamento.Descricao);
                $("#lancamento-origem").val(data.Lancamento.Origem);
                $("#lancamento-observacao").val(data.Lancamento.Observacao);
                $("#lancamento-meiopagamento").val(data.Lancamento.MeioPagamentoId);
                $("#lancamento-data").val(moment(data.Lancamento.DataLancamento).format('DD/MM/YYYY'));
                $("#lancamento-contabancaria").val(data.Lancamento.ContaBancariaId > 0 ? data.Lancamento.ContaBancariaId : 0);
                $("#lancamento-valor").val(data.Lancamento.Valor);
            }
        });
    }
    else {
        handleSelect()
        $("#lancamento-id").val(0);
        $("#lancamento-meiopagamento").val($("#lancamento-meiopagamento option:first").val());
        $("#lancamento-descricao").val("");
        $("#lancamento-origem").val("");
        $("#lancamento-observacao").val("");
        $("#lancamento-valor").val(0);
        $("#lancamento-data").val(moment().format('DD/MM/YYYY'));
        $("#lancamento-centrocusto").val($("#lancamento-centrocusto option").not(".d-none").first().val()).trigger('change');
    }
}


function EditLancamento(params) {
    $("#lancamento-tipo").val(params.Tipo == "Receber" ? 1 : 2);
    GetLancamento(params.Id);

}

function handleSelect() {
    $('#lancamento-eventoid').select2({ dropdownParent: $('#form-lancamento') })

    $('#lancamento-centrocusto').empty().trigger("change").select2({ ...createTagOptions, data: SelectedEvent.CentroCustos.filter(x => x.Tipo == ($("#lancamento-tipo").val() == 1 ? "Receita" : "Despesa")).map(x => ({ id: x.Id, text: x.Descricao })), dropdownParent: $('#form-lancamento') }).off('select2:select').on('select2:select', function (e) {
        if (e.params.data.newTag) {
            $.ajax({
                url: "/CentroCusto/PostCentroCusto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: null,
                        Descricao: e.params.data.id,
                        Tipo: $("#lancamento-tipo").val(),
                        ConfiguracaoId: SelectedEvent.ConfiguracaoId
                    }),
                success: function (data) {
                    $(`#lancamento-centrocusto`).find("option[value='" + e.params.data.id + "']").attr('value', data.CentroCusto.Id).trigger('change');

                }
            });
        }

    });

    $("#modal-lancamentos").modal();
}

function DeleteLancamento(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Lancamento/DeletePagamento/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    Filtrar();
                }
            });
        }
    });
}

function PostLancamento() {
    if (ValidateForm(`#form-lancamento`)) {
        $.ajax({
            url: "/Lancamento/PostLancamento/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#lancamento-id").val(),
                    Descricao: $("#lancamento-descricao").val(),
                    Origem: $("#lancamento-origem").val(),
                    Observacao: $("#lancamento-observacao").val(),
                    Tipo: $("#lancamento-tipo").val(),
                    Data: moment($("#lancamento-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    MeioPagamentoId: $("#lancamento-meiopagamento").val(),
                    EventoId: SelectedEvent.Id,
                    CentCustoId: $("#lancamento-centrocusto").val(),
                    ContaBancariaId: $('.contabancaria').hasClass('d-none') ? 0 : $("#lancamento-contabancaria").val(),
                    Valor: Number($("#lancamento-valor").val())
                }),
            success: function () {
                SuccessMesageOperation();
                Filtrar();
                $("#modal-lancamentos").modal("hide");
            }
        });
    }
}

$('.adm').css('display', 'none')
$(".configId").css('display', 'none')

$(document).off('ready-ajax').on('ready-ajax', () => {
    $('.adm').css('display', Usuario.IsGeral ? 'block' : 'none')
    $('.notAdm').css('display', !Usuario.IsGeral ? 'block' : 'none')
    Filtrar();
});

function Filtrar() {
    CarregarTabelaLancamento("#table-lancamentos-receber", 'Receber');
    CarregarTabelaLancamento("#table-lancamentos-pagar", 'Pagar');
}

var lancamento = {}

function AnexosLancamento(row) {
    lancamento = row
    $("#LancamentoId").val(row.Id);
    GetAnexos(row.Id);
    $("#modal-anexos").modal();
}

function GetAnexos(id) {
    const tableArquivoConfig = {
        language: languageConfig,
        lengthMenu: [10, 50, 100, 200, 1000],
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
            { data: "Extensao", name: "Extensao", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
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
            url: '/Arquivo/GetArquivosLancamento',
            data: { Id: id },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-anexos").DataTable(tableArquivoConfig);
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
                    GetAnexos($("#LancamentoId").val());
                }
            });
        }
    });
}

function PostArquivo() {
    var dataToPost = new FormData($('#frm-upload-arquivos')[0]);
    dataToPost.set('ParticipanteId', lancamento.ParticipanteId)

    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "/Arquivo/PostArquivo",
            success: function () {
                GetAnexos($("#LancamentoId").val());
            }
        });
}

$("#arquivo").change(function () {
    PostArquivo();
});


$("#modal-anexos").on('hidden.bs.modal', function () {
    Filtrar();
});


function PrintRecibo(id) {
    $.ajax({
        url: "/Lancamento/GetLancamento/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var doc = CriarPDFA4();
            var text = `Recebi do ${$("#lancamento-eventoid option:selected").text()}, a importância de ${data.Lancamento.Valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} referente a ${data.Lancamento.Descricao}.`;
            var valor = data.Lancamento.Valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            moment.locale("pt-br");
            var dataExtenso = `${moment().format('D')} de ${moment().format('MMMM')} de ${moment().format('YYYY')}`;

            doc.setFont('helvetica', "bold")
            doc.text(94, 20, "RECIBO");
            doc.text(150, 30, `Valor: ${valor}`);

            doc.setFont('helvetica', "normal")
            splitText = doc.splitTextToSize(text, 160);
            doc.text(20, 50, splitText);
            doc.text(110, 83, `Recife, ${dataExtenso}`);

            doc.line(20, 98, 100, 98);
            doc.text(20, 105, data.Lancamento.Observacao);

            printDoc(doc);
        }
    });
}