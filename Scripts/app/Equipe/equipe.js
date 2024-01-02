EquipeId = 0
Titulo = ''

function CarregarTabelaEquipe() {
    const tableEquipeConfig = {
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
        buttons: getButtonsConfig(`Equipes ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`),
        columns: [
            { data: "Equipe", name: "Equipe", autoWidth: true },
            { data: "QuantidadeMembros", name: "QuantidadeMembros", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `${GetButton('ListarEquipe', JSON.stringify(row), 'blue', 'fa-list-alt', 'Listar membros da Equipe')}
 ${GetButton('PrintEquipe', data, 'green', 'fa-print', 'Imprimir')}
  ${GetAnexosButton('Anexos', data, row.QtdAnexos)}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Equipe/GetEquipes',
            datatype: "json",
            data: { EventoId: function () { return SelectedEvent.Id } },
            type: "POST"
        }
    };

    if (!$.fn.DataTable.isDataTable('#table-equipe')) {
        $('#table-equipe').DataTable(tableEquipeConfig)
    } else {

        $("#table-equipe").DataTable().ajax.reload()
    }

}

function PrintAll() {
    var doc = new jsPDF('l', 'mm', "a4");
    $.ajax({
        url: '/Equipe/GetEquipes',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST",
        success: function (data) {
            var arrPromises = []
            data.data.forEach(equipe => {
                if (equipe.QuantidadeMembros > 0) {
                    arrPromises.push($.ajax({
                        url: '/Equipe/GetMembrosEquipeDatatable',
                        data: { EventoId: SelectedEvent.Id, EquipeId: equipe.Id },
                        datatype: "json",
                        type: "POST"

                    }))
                }
            })
            Promise.all(arrPromises).then(result => {
                result.forEach((data, index) => {
                    if (data.data.length > 0) {
                        if (index > 0) {
                            doc.addPage()
                        } FillDoc(doc, data)
                    }
                })
                printDoc(doc);
            })

        }
    })

}

function GetAnexos(id) {
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
            { data: "Extensao", name: "Extensao", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `${GetButton('GetArquivo', data, 'blue', 'fa-download', 'Download')}
                            ${GetButton('DeleteArquivoEquipe', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Arquivo/GetArquivosEquipe',
            data: { Equipe: id ? id : $("#Equipe").val(), IsComunEquipe: false, EventoId: function () { return SelectedEvent.ConfiguracaoId } },
            datatype: "json",
            type: "POST"
        }
    };
    
    if (!$.fn.DataTable.isDataTable('#table-anexos')) {
        $('#table-anexos').DataTable(tableArquivoConfig)
    } else {

        $("#table-anexos").DataTable().ajax.reload()
    }
}

function GetArquivo(id) {
    window.open(`/Arquivo/GetArquivo/${id}`)
}

$("#arquivo-modal").change(function () {
    PostArquivoEquipe();
});

$("#modal-anexos").on('hidden.bs.modal', function () {
    CarregarTabelaEquipe()
});


function PostArquivoEquipe() {

    var dataToPost = new FormData($('#frm-upload-arquivo-normal-modal')[0]);
    dataToPost.set('Arquivo', dataToPost.get('arquivo-modal'))
    dataToPost.set('EquipeId', dataToPost.get('Equipe'))
    dataToPost.set('ConfiguracaoId', SelectedEvent.ConfiguracaoId)
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "/Arquivo/PostArquivo",
            success: function () {
                $('#arquivo-modal').val("")
                GetAnexos();


            }
        });
}

function Anexos(id) {
    $("#Equipe").val(id);
    GetAnexos(id);
    $("#modal-anexos").modal();
}


function DeleteArquivoEquipe(id) {
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
                    GetAnexos();
                    SuccessMesageDelete();
                }
            });
        }
    });
}

function header(doc, evento, page, equipe) {
    if (SelectedEvent.LogoRelatorioId) {
        var img = new Image();
        img.src = `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(64, 14, evento);
    doc.text(64, 22, equipe || Titulo);
    doc.text(64, 30, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')} - Página ${page}`);

    var widthP = 285
    doc.line(10, 38, widthP, 38);

    doc.setFont('helvetica', "bold")
    doc.text(17, 43, "Nome completo");
    doc.text(127, 43, "Credencial");
    doc.text(172, 43, "Idade/Data de Nascimento");
    doc.text(240, 43, "Whatsapp");

    doc.line(10, 45, widthP, 45);
    doc.setFont('helvetica', "normal")
}

function PrintEquipe(id) {
    $.ajax({
        url: '/Equipe/GetMembrosEquipeDatatable',
        data: { EventoId: SelectedEvent.Id, EquipeId: id },
        datatype: "json",
        type: "POST",
        success: (result) => {
            var doc = new jsPDF('l', 'mm', "a4");
            FillDoc(doc, result)

            printDoc(doc);
        }
    });
}

function FillDoc(doc, result) {

    var widthP = 285
    var evento = `${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`;
    header(doc, evento, 1, result.data[0].Equipe)


    height = 50;

    $(result.data).each((index, participante) => {
        if (index > 0 && index % 19 == 0 ) {
            doc.addPage()
            header(doc, evento, (index/19)+1, result.data[0].Equipe)
            height = 50;
        }

        doc.setFont()

        doc.setFont("helvetica", participante.Tipo == 'Coordenador' ? "bold" : "normal");
        doc.text(17, height, participante.Tipo == 'Coordenador' ? `Coord: ${participante.Nome}` : participante.Nome);
        doc.text(127, height, participante.Apelido);
        doc.text(195, height, `${participante.Idade}`);
        doc.text(240, height, `${participante.Fone}`);
        height += 2;
        doc.line(10, height, widthP, height);
        height += 6;

    });

    for (var i = height; i < 192; i += 8) {
        doc.line(10, i, widthP, i);
    }

    AddCount(doc, result.data, 200, widthP);
}

function CarregarTabelaMembrosEquipe(equipeId, titulo) {
    const tableMembrosEquipeConfig = {
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
        buttons: getButtonsConfig(titulo),
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            { data: "Idade", name: "Idade", width: "5%" },
            {
                data: "Id", name: "Id", orderable: false, width: "35%",
                "render": function (data, type, row) {
                    var color = !(Coordenador == row.Tipo) ? 'info' : 'yellow';

                    return `${GetLabel('ToggleMembroEquipeTipo', JSON.stringify(row), color, row.Tipo)}
                            ${GetButton('DeleteMembroEquipe', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Equipe/GetMembrosEquipeDatatable',
            data: { EventoId: SelectedEvent.Id, EquipeId: equipeId },
            datatype: "json",
            type: "POST"
        }
    };
    $("#table-membros-equipe").DataTable(tableMembrosEquipeConfig);
}

$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTabelaEquipe();
    CarregarTabelaArquivo();
    $('#equipe-equipantes').select2({
        ajax: {
            delay: 750,
            url: "/Equipe/GetEquipantes/",
            data: function (params) {
                var query = {
                    Search: params.term,
                    EventoId: SelectedEvent.Id
                }

                // Query parameters will be ?search=[term]&type=public
                return query;
            },
            processResults: function (data) {
                // Transforms the top-level key of the response object from 'items' to 'results'
                return {
                    results: data.Equipantes
                };
            }
        },
        placeholder: "Pesquisar",
        minimumInputLength: 3,
        dropdownParent: $("#frm-equipe-membros") 
    });
});

$("#modal-membros-equipe").on('hidden.bs.modal', function () {
    CarregarTabelaEquipe();
});

function ListarEquipe(row) {
    $("#equipe-equipantes").val("Pesquisar").trigger("chosen:updated");
    EquipeId = row.Id
    Titulo = `${row.Equipe} - ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`;
    CarregarTabelaMembrosEquipe(row.Id, Titulo);
    $("#equipe-id").val(row.Id);
    $('.titulo-equipe').text(Titulo);
    $("#modal-membros-equipe").modal();
}

function AddMembroEquipe() {
    if ($("#equipe-equipantes").val()) {
        $.ajax({
            url: "/Equipe/AddMembroEquipe/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    EquipanteId: $("#equipe-equipantes").val(),
                    EventoId: SelectedEvent.Id,
                    EquipeId: $("#equipe-id").val()
                }),
            success: function () {
                SuccessMesageOperation();
                $("#equipe-equipantes").val('');
                $("#equipe-equipantes").trigger('change');
                CarregarTabelaMembrosEquipe($("#equipe-id").val(), $('.titulo-equipe').text());
            }
        });
    }
}

function ToggleMembroEquipeTipo(row) {
    if (Membro == row.Tipo) {
        var windowReference = window.open('_blank');

    }
    $.ajax({
        url: "/Equipe/ToggleMembroEquipeTipo/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: row.Id
            }),
        success: function (data) {
            CarregarTabelaMembrosEquipe($("#equipe-id").val(), $('.titulo-equipe').text());
            if (data) {

                windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
            }

        },      
    });
}

function DeleteMembroEquipe(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Equipe/DeleteMembroEquipe/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaMembrosEquipe($("#equipe-id").val(), $('.titulo-equipe').text());
                },
                error: function (data) {
                    ErrorMessage("O Equipante está vinculado a um registro de Padrinho, não será possível deletá-lo")
                }
            });
        }
    });
}


function loadEquipe() {
    CarregarTabelaEquipe()
    CarregarTabelaArquivo();
}