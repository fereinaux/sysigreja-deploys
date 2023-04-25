const map = initMap('map')
const markerLayer = createMarkerLayer(map)
map.setView([-8.050000, -34.900002], 13);
setInterval(function () {
    map.invalidateSize();
}, 100);

let circuloId
function CarregarTabelaCirculo() {

    var columnsTb = [
        {
            data: "Titulo", name: "Titulo", autoWidth: true, render: function (data, type, row) {
                return `<div>
<span style="background-color:${row.Cor}" class="dot"></span>
                        <span>${row.Titulo}</br></span>
                       
                    </div>`
            } },
        { data: "QtdParticipantes", name: "QtdParticipantes", autoWidth: true },
        {
            data: "Id", name: "Id", className: "text-center", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `${GetButton('ListarDirigentes', JSON.stringify(row), 'blue', 'fa-list-alt', `Listar Dirigentes do(a) ${config.EquipeCirculo}`)}
                            ${GetButton('PrintCirculo', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditCirculo', JSON.stringify(row), 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteCirculo', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]

    const tableCirculoConfig = {
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
        searchDelay: 750,
        dom: domConfigNoButtons,
        columns: columnsTb,
        order: [
            [0, "asc"]
        ],
        drawCallback: function (settings) {
            if (settings.aoData.length > 0) {

                let column = settings.aoColumns[settings.aaSorting[0][0]].data
                let dir = settings.aaSorting[0][1]
                let search = settings.oPreviousSearch.sSearch

                GetCirculosComParticipantes(column, dir, search);
            }

        },
        ajax: {
            url: '/Circulo/GetCirculos',
            datatype: "json",
            data: { EventoId: $("#circulo-eventoid").val() },
            type: "POST"
        }
    };
    $("#table-circulo").DataTable(tableCirculoConfig);
}

$(document).ready(function () {

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').indexOf(value) > -1)
        });
    });

    loadCirculo()
});

function PrintCirculo(row) {
    $.ajax({
        url: '/Participante/GetParticipantesByCirculo',
        data: { CirculoId: row.Id },
        datatype: "json",
        type: "GET",
        success: (result) => {
            var doc = CriarPDFA4();

            FillDoc(doc, result)


            printDoc(doc);
        }
    });
}

function FillDoc(doc, result) {
    if (logoRelatorio) {
        var img = new Image();
        img.src = `data:image/png;base64,${logoRelatorio}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }


    doc.setFont('helvetica', "normal")
    doc.setFontSize(12);
    doc.text(77, 15, $("#circulo-eventoid option:selected").text());
    doc.text(77, 20, `${$('.title-circulo').first().text()} ${result.data[0].Titulo?.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim() || result.data[0].Cor}`);
    doc.text(77, 25, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')}`);;
    doc.line(10, 38, 195, 38);


    height = 43;
    if (result.data[0].Dirigentes.length > 0) {
        doc.setFont('helvetica', "bold")
        doc.text(12, height, "Dirigentes");
        height += 2
        doc.line(10, height, 195, height);
        height += 5
        doc.setFont('helvetica', "normal")
        $(result.data[0].Dirigentes).each((index, dirigente) => {
            doc.text(12, height, dirigente.Nome);
            height += 6;
        });
    }

    doc.setFont('helvetica', "bold")
    if (config.TipoEvento == "Casais") {
        doc.text(12, height, "Nome");
        doc.text(92, height, "Whatsapp");
    } else {
        doc.text(12, height, "Nome");
        doc.text(117, height, "Apelido");
        doc.text(152, height, "Whatsapp");
    }
    
    height += 2
    doc.line(10, height, 195, height);
    height += 5
    doc.setFont('helvetica', "normal")
    $(result.data).each((index, participante) => {
        if (config.TipoEvento == "Casais") {
            doc.text(12, height, participante.Nome);
            doc.text(92, height, participante.Fone);
        } else {
            doc.text(12, height, participante.Nome);
            doc.text(117, height, participante.Apelido);
            doc.text(152, height, participante.Fone);
        }
    
        height += 6;
    });

    AddCount(doc, result.data, height);
}

function GetCirculo(id) {
    if (id > 0) {
        $.ajax({
            url: "/Circulo/GetCirculo/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#circulo-id").val(data.Circulo.Id);
                $("#circulo-cores").val(data.Circulo.Cor.trim())
                $("#circulo-titulo").val(data.Circulo.Titulo)



            }
        });
    }
    else {
        $("#circulo-id").val(0);
        $("#circulo-titulo").val("");
        $("#circulo-cores").val("#bada55");    
    }
}

function EditCirculo(row) {
    GetCirculo(row.Id)
    $("#modal-circulo").modal();
}


function DeleteCirculo(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Circulo/DeleteCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaCirculo();
                }
            });
        }
    });
}

function PostCirculo() {
    if (ValidateForm(`#form-circulo`)) {
        $.ajax({
            url: "/Circulo/PostCirculo/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#circulo-id").val(),
                    EventoId: $("#circulo-eventoid").val(),
                    Cor: $("#circulo-cores").val(),
                    Titulo: $("#circulo-titulo").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaCirculo();
                $("#modal-circulo").modal("hide");
            }
        });
    }
}

function DistribuirCirculos() {
    $.ajax({
        url: "/Circulo/DistribuirCirculos/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: $("#circulo-eventoid").val()
            }),
        success: function () {
            SuccessMesageOperation();
            loadCirculo()
            $("#modal-circulo").modal("hide");
        }
    });
}

function GetParticipantesSemCirculo() {
    $("#table-participantes").empty();

    $.ajax({
        url: "/Circulo/GetParticipantesSemCirculo/",
        data: { EventoId: $("#circulo-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Participantes.forEach(function (participante, index, array) {
                $('#table-participantes').append($(`<tr><td class="participante" data-id="${participante.Id}">${participante.Nome}</td></tr>`));
            });

            DragDropg();
        }
    });
}


function GetCirculosComParticipantes(column, dir, search) {
    $("#circulos").empty();

    $.ajax({
        url: '/Circulo/GetCirculos',
        datatype: "json",
        data: { EventoId: $("#circulo-eventoid").val(), columnName: column, columnDir: dir, search },
        type: "POST",
        success: function (data) {
            data.data.forEach(function (circulo, index, array) {

                htmlCaecalhoCirculo = circulo.Dirigentes.map(dirigente => `<h4 style="padding-top:5px">${dirigente.Nome}</h4>`).join().replace(/,/g, '')


                $("#circulos").append($(`<div data-id="${circulo.Id}" style="margin-bottom:25px;background-color:${circulo.Cor};background-clip: content-box;border-radius: 28px;" class="p-xs col-xs-12 col-lg-4 pg text-center text-white">                     
                       ${htmlCaecalhoCirculo}
${circulo.Titulo ? `<h4 style="padding-top:5px">${circulo.Titulo}</h4>` : ""}
                                    <table class="table">
                                        <tbody id="pg-${circulo.Id}">
                                            
                                        </tbody>
                                    </table>
 <button type="button" class="btn btn-rounded btn-default print-button" onclick='PrintCirculo(${JSON.stringify(circulo)})'><i class="fa fa-2x fa-print"></i></button>
                                </div>`));
            });

            $.ajax({
                url: "/Circulo/GetCirculosComParticipantes/",
                data: { EventoId: $("#circulo-eventoid").val() },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    data.Circulos.forEach(function (circulo, index, array) {
                        if (circulo.Latitude && circulo.Longitude) {
                            addMapa(circulo.Latitude, circulo.Longitude, circulo.Nome, circulo.Cor, circulo.ParticipanteId, 'circulo')
                                .bindPopup(`<h4>Nome: ${circulo.Nome}</h4><div><span>${circulo.Endereco} - ${circulo.Bairro}</span></div>`);
                        }
                        $(`#pg-${circulo.CirculoId}`).append($(`<tr><td class="participante" data-id="${circulo.ParticipanteId}">${circulo.Nome}</td></tr>`));
                    });
                    $('.div-map').css('display', 'block')
                    DragDropg();
                }
            });
        }
    });
}

function addMapa(lat, long, nome, cor, id, type) {
    return L.marker([lat, long], { icon: getIcon(cor.trim()) }).addTo(markerLayer);


}


function DragDropg() {
    Drag();

    $('.pg').droppable({
        drop: function (event, ui) {
            $(ui.draggable).parent().remove();
            ChangeCirculo($(ui.draggable).data('id'), $(this).data('id'));
            if ($(this).data('id')) {
                $(`#pg-${$(this).data('id')}`).append($(`<tr><td class="participante" data-id="${$(ui.draggable).data('id')}">${$(ui.draggable).text()}</td></tr>`));
            } else {
                $('#table-participantes').append($(`<tr><td class="participante" data-id="${$(ui.draggable).data('id')}">${$(ui.draggable).text()}</td></tr>`));
            }
            Drag();
        }
    });
}

function Drag() {
    $('.participante').each(function () {
        $(this).css("cursor", "move");
        $(this).draggable({
            zIndex: 999,
            revert: true,
            revertDuration: 0
        });
    });
}

function ChangeCirculo(participanteId, destinoId) {
    $.ajax({
        url: "/Circulo/ChangeCirculo/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                ParticipanteId: participanteId,
                DestinoId: destinoId
            }),
        success: function () {
            CarregarTabelaCirculo();
        }
    });
}
function PrintAll() {
    var doc = CriarPDFA4()
    $.ajax({
        url: '/Circulo/GetCirculos',
        datatype: "json",
        data: { EventoId: $("#circulo-eventoid").val() },
        type: "POST",
        success: function (data) {
            var arrPromises = []
            data.data.forEach(element => {
                if (element.QtdParticipantes > 0) {
                    arrPromises.push($.ajax({
                        url: '/Participante/GetParticipantesByCirculo',
                        data: { CirculoId: element.Id },
                        datatype: "json",
                        type: "GET"

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


function AddDirigente() {
    if ($("#circulo-dirigentes").val() != "Pesquisar") {
        $.ajax({
            url: "/Circulo/AddDirigente/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    EquipanteId: $("#circulo-dirigentes").val(),
                    CirculoId: circuloId,
                }),
            success: function () {
                SuccessMesageOperation();
                $("#circulo-dirigentes").val("Pesquisar").trigger("chosen:updated");
                CarregarTabelaDirigentes(circuloId)
            }
        });
    }
}


function DeleteDirigente(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Circulo/DeleteDirigente/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaDirigentes(circuloId)
                }
            });
        }
    });
}

$("#modal-dirigentes").on('hidden.bs.modal', function () {
    CarregarTabelaCirculo();
    GetParticipantesSemCirculo();
});

function ListarDirigentes(row) {
    $("#circulo-dirigentes").val("Pesquisar").trigger("chosen:updated");
    circuloId = row.Id
    CarregarTabelaDirigentes(circuloId);

    $("#modal-dirigentes").modal();
}


function CarregarTabelaDirigentes(circuloId) {
    const tableDirigentesConfig = {
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
        buttons: getButtonsConfig('Dirigentes'),
        columns: [
            { data: "Nome", name: "Nome", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "35%",
                "render": function (data, type, row) {
                    var color = !(Coordenador == row.Tipo) ? 'info' : 'yellow';

                    return `
                            ${GetButton('DeleteDirigente', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Circulo/GetDirigentes',
            data: { CirculoId: circuloId },
            datatype: "json",
            type: "POST"
        }
    };
    GetDirigentes();
    $("#table-dirigentes").DataTable(tableDirigentesConfig);
}


function GetDirigentes() {

    $("#circulo-dirigentes").empty();
    $('#circulo-dirigentes').append($('<option>Pesquisar</option>'));

    $.ajax({
        url: "/Circulo/GetEquipantes/",
        data: { EventoId: $("#circulo-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#circulo-dirigentes').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $("#circulo-dirigentes").val("Pesquisar").trigger("chosen:updated");
        }
    });

}

function loadCirculo() {
    CarregarTabelaCirculo();
    GetParticipantesSemCirculo();
}