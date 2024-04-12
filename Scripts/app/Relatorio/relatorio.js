function CarregarTabelaRelatorio() {
    const tableRelatorioConfig = {
        language: languageConfig,
        lengthMenu: [200,500,1000],
        colReorder: false,
        serverSide: false,
        deferloading: 0,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        ordering: false,
        responsive: true,stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfigNoButtons, 
        columns: [
            { autoWidth: true },
            { orderable: false, width: "5%" }            
        ],
        
    };

    $("#table-relatorios").DataTable(tableRelatorioConfig);
}

$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTabelaRelatorio();
    MontarBotoes();
    getCentroCustoRel()
});

function MontarBotoes() {
    $('.aniversariantes').html(`${GetButton('PrintAniversariantes', '', 'green', 'fa-print', 'Imprimir Aniversariantes')}`);
    $('.restricoes').html(`${GetButton('PrintRestricoes', '', 'green', 'fa-print', 'Imprimir Restrições Alimentares')}`);
    $('.parentes').html(`${GetButton('PrintParentes', '', 'green', 'fa-print', 'Imprimir Relação de Parentes')}`);
    $('.financeiro').html(`${GetButton('PrintFinanceiro', '', 'green', 'fa-print', 'Imprimir Relatório Financeiro')}`);
    $('.historico').html(`${GetButton('ExportHistorico', '', 'green', 'fa-file-excel', 'Exportar Histórico de Equipes')}`);
}


function ExportHistorico() {
    $.ajax(
        {
            type: "GET",
            url: `/Equipante/GetHistoricoEquipes?EventoId=${SelectedEvent.Id}`,
            success: function (data) {
                window.location = `/Participante/DownloadTempFile?fileName=Histórico Equipes ${SelectedEvent.Titulo}.xlsx&g=` + data;

            }
        });

}
