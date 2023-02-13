arrayCaronas = []
arrayCaroneiros = []
const map = initMap('map')
const markerLayer = createMarkerLayer(map)
map.setView([-8.050000, -34.900002], 13);
setInterval(function () {
    map.invalidateSize();
}, 100);

function CarregarTabelaCarona() {

    $('#gerenciar').text("Gerenciar Caronas");
    $('#participantes-sem').text("Participantes sem Carona");
    var columnsTb = [
        { data: "Motorista", name: "Motorista", autoWidth: true },
        { data: "Capacidade", name: "Capacidade", autoWidth: true },
        {
            data: "Id", name: "Id", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `
                            ${GetButton('PrintCarona', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditCarona', JSON.stringify(row), 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteCarona', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]


    const tableCaronaConfig = {
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
        columns: columnsTb,
        order: [
            [0, "asc"]
        ],
        drawCallback: function (settings) {
            var api = this.api();
            var dataArray = api.rows().data().toArray()
            if (dataArray.length > 0) {

                $('#carona-motoristas').html('')
                $('#carona-motoristas').append($(`<option value="0">Selecione</option>`));
                dataArray.forEach(function (carona, index, array) {
                    $('#carona-motoristas').append($(`<option value="${carona.Id}">${carona.Motorista}</option>`));
                });
                $("#carona-motoristas").val($("#carona-motoristas option:first").val()).trigger("chosen:updated");
            }
        },
        ajax: {
            url: '/Carona/GetCaronas',
            datatype: "json",
            data: { EventoId: $("#carona-eventoid").val() },
            type: "POST"
        }
    };
    $("#table-carona").DataTable(tableCaronaConfig);
}

$(document).ready(function () {

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    CaronaRefresh()
});


function CaronaRefresh(destinoId) {

    CarregarTabelaCarona();
    GetParticipantesSemCarona();
    GetCaronasComParticipantes();
    getChangeCarona(destinoId)
}

function PrintCarona(row) {
    $.ajax({
        url: '/Carona/GetParticipantesByCarona',
        data: { CaronaId: row.Id },
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
    doc.text(77, 15, $("#carona-eventoid option:selected").text());



    doc.text(77, 20, `Relação de Carona`);
    doc.text(77, 25, `${result.data[0].Motorista}`);

    doc.text(77, 30, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')}`);;
    doc.line(10, 38, 195, 38);

    doc.setFont('helvetica', "bold")
    doc.text(12, 43, "Nome");
    doc.text(107, 43, "Apelido");
    doc.text(152, 43, "Whatsapp");

    doc.line(10, 45, 195, 45);
    doc.setFont('helvetica', "normal")
    height = 50;

    $(result.data).each((index, participante) => {
        doc.text(12, height, participante.Nome);
        doc.text(107, height, participante.Apelido);
        doc.text(152, height, participante.Fone);
        height += 6;
        doc.setFont('helvetica', "bold")
        doc.text(12, height, "Endereço:");
        doc.setFont('helvetica', "normal")
        doc.text(34, height, participante.Endereco);
        height += 8;
    });

    AddCount(doc, result.data, height);
}

function GetCarona(id) {
    if (id > 0) {
        $.ajax({
            url: "/Carona/GetCarona/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#carona-id").val(data.Carona.Id);
                $('#carona-motorista').append($(`<option value="${data.Carona.MotoristaId}">${data.Carona.Motorista}</option>`));
                $("#carona-motorista").val(data.Carona.MotoristaId).trigger("chosen:updated");
                $("#carona-capacidade").val(data.Carona.Capacidade)


            }
        });
    }
    else {
        $("#carona-id").val(0);
    }
}

function getChangeCarona(destinoId) {

    $.ajax({
        url: '/Carona/GetCaronas',
        datatype: "json",
        data: { EventoId: $("#carona-eventoid").val() },
        type: "POST",
        success: function (data) {
            arrayCaroneiros = []
            data.data.forEach(function (carona, index, array) {
                arrayCaroneiros.push(carona);
            });
            if (destinoId) {
                $("#carona-motoristas").val(destinoId).trigger("chosen:updated");

            }
            $.ajax({
                url: "/Carona/GetCaronasComParticipantes/",
                data: { EventoId: $("#carona-eventoid").val() },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {

                    arrayCaronas = []
                    data.Caronas.forEach(function (carona, index, array) {
                        arrayCaronas.push({ CaronaId: carona.CaronaId, Endereco: carona.Endereco, ParticipanteId: carona.ParticipanteId, Latitude: carona.Latitude, Longitude: carona.Longitude, Nome: carona.Nome })
                    });

                    let caroneiro = arrayCaroneiros.find(x => x.Id == $("#carona-motoristas").val())
                    let caronistas = arrayCaronas.filter(x => x.CaronaId == $("#carona-motoristas").val())
                    markerLayer.getLayers().forEach(mark => mark.remove())
                    if (x => x.Id == $("#carona-motoristas").val() == 0) {
                        arrayCaroneiros.forEach(caroneiro => {
                            if (caroneiro.Latitude && caroneiro.Longitude) {

                                addMapa(caroneiro.Latitude, caroneiro.Longitude, caroneiro.Motorista, 'carpng', caroneiro.MotoristaId, 'motorista')
                                    .bindPopup(`<h4>Motorista: ${caroneiro.Motorista}</h4> <span>${caroneiro.Endereco}<i style="cursor:pointer;margin-left:3px;font-size:15px" onclick="copyContent('${caroneiro.Endereco}')" class="fas fa-clipboard"></i></span>`);
                                map.setView([caroneiro.Latitude, caroneiro.Longitude], 14);
                            }
                        })
                    } else if (caroneiro) {
                        if (caroneiro.Latitude && caroneiro.Longitude) {
                            addMapa(caroneiro.Latitude, caroneiro.Longitude, caroneiro.Motorista, 'carpng', caroneiro.MotoristaId, 'motorista')
                                .bindPopup(`<h4>Motorista: ${caroneiro.Motorista}</h4> <span>${caroneiro.Endereco}<i style="cursor:pointer;margin-left:3px;font-size:15px" onclick="copyContent('${caroneiro.Endereco}')" class="fas fa-clipboard"></i></span>`);
                            map.setView([caroneiro.Latitude, caroneiro.Longitude], 14);
                        }
                    }
                    caronistas.forEach(carona => {
                        let addCarona = true
                        map.eachLayer(function (layer) {

                            if (layer._latlng?.lat == carona.Latitude && layer._latlng?.lng == carona.Longitude) {
                                addCarona = false
                                layer.bindPopup(layer._popup?._content + `<h4>Participante: ${carona.Nome}</h4>
                        <span>${carona.Endereco}</span>`)
                            }
                        })
                        if (addCarona) {

                            addMapa(carona.Latitude, carona.Longitude, carona.Nome, '#d93c3c', carona.ParticipanteId, 'carona')
                                .bindPopup(`<h4>Participante: ${carona.Nome}</h4>
                        <span>${carona.Endereco}</span>`)
                        }
                    })

                    mapaSemCarona.forEach(participante => {

                        if (participante.Latitude && participante.Longitude) {
                            addMapa(participante.Latitude, participante.Longitude, participante.Nome, '#939393', participante.Id, 'carona')
                                .bindPopup(`<h4>Participante: ${participante.Nome}</h4>
                        <span>${participante.Endereco}</span>`)
                        }

                    })
                    $('.div-map').css('display', 'block')
                }
            });
        }
    });



}

function EditCarona(row) {
    GetEquipantes();
    GetCarona(row.Id);
    $("#modal-carona").modal();
}


function DeleteCarona(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Carona/DeleteCarona/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaCarona();
                }
            });
        }
    });
}

function PostCarona() {
    if (ValidateForm(`#form-carona`)) {
        $.ajax({
            url: "/Carona/PostCarona/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#carona-id").val(),
                    EventoId: $("#carona-eventoid").val(),
                    MotoristaId: $("#carona-motorista").val(),
                    Capacidade: $("#carona-capacidade").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaCarona();
                GetCaronasComParticipantes();
                $("#modal-carona").modal("hide");
            }
        });
    }
}

function DistribuirCaronas() {
    $.ajax({
        url: "/Carona/DistribuirCaronas/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: $("#carona-eventoid").val()
            }),
        success: function () {
            SuccessMesageOperation();
            CaronaRefresh()
        }
    });
}


function GetEquipantes(id) {
    $("#carona-motorista").empty();

    $.ajax({
        url: "/Carona/GetEquipantes/",
        data: { EventoId: $("#carona-eventoid").val(), },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#carona-motorista').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $("#carona-motorista").val($("#carona-motorista option:first").val()).trigger("chosen:updated");
            if ($("#carona-equipantes option").length === 0 && id == 0) {
                ErrorMessage("Não existem Equipantes disponíveis");
                $("#modal-carona").modal("hide");
            }
        }
    });
}

mapaSemCarona = []

function GetParticipantesSemCarona() {
    $("#table-participantes").empty();

    $.ajax({
        url: "/Carona/GetParticipantesSemCarona/",
        data: { EventoId: $("#carona-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            mapaSemCarona = []
            data.Participantes.forEach(function (participante, index, array) {
                $('#table-participantes').append($(`<tr><td class="participante" data-id="${participante.Id}">${participante.Nome}</td></tr>`));
                mapaSemCarona.push(participante)

            });

            DragDropg();
        }
    });
}



function addMapa(lat, long, nome, cor, id, type) {
    return L.marker([lat, long], { icon: getIcon(cor.toLowerCase().replaceAll(' ', '-')) }).addTo(markerLayer);


}

$("#modal-cores").on('hidden.bs.modal', function () {
    ChangeCarona($("#participante-id").val(), $('#participante-cor').val())
});



function GetCaronasComParticipantes() {
    $("#caronas").empty();

    $.ajax({
        url: '/Carona/GetCaronas',
        datatype: "json",
        data: { EventoId: $("#carona-eventoid").val() },
        type: "POST",
        success: function (data) {
            data.data.forEach(function (carona, index, array) {
                $("#caronas").append($(`<div data-id="${carona.Id}" style="margin-bottom:25px;background-color:#424242;background-clip: content-box;border-radius: 28px;" class="p-xs col-xs-12 col-lg-4 pg text-center text-white">
                  <h4 style="padding-top:5px">${carona.Motorista}</h4>
                                    <table class="table">
                                        <tbody id="pg-${carona.Id}">
                                            
                                        </tbody>
                                    </table>
 <button type="button" class="btn btn-rounded btn-default print-button" onclick='PrintCarona(${JSON.stringify(carona)})'><i class="fa fa-2x fa-print"></i></button>
                                </div>`));
            });

            $.ajax({
                url: "/Carona/GetCaronasComParticipantes/",
                data: { EventoId: $("#carona-eventoid").val() },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {

                    data.Caronas.forEach(function (carona, index, array) {
                        $(`#pg-${carona.CaronaId}`).append($(`<tr><td class="participante" data-id="${carona.ParticipanteId}">${carona.Nome}</td></tr>`));
                    });
                    DragDropg();
                }
            });
        }
    });
}

function DragDropg() {
    Drag();

    $('.pg').droppable({
        drop: function (event, ui) {
            $(ui.draggable).parent().remove();
            ChangeCarona($(ui.draggable).data('id'), $(this).data('id'));
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

function ChangeCarona(participanteId, destinoId) {
    $.ajax({
        url: "/Carona/ChangeCarona/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                ParticipanteId: participanteId,
                DestinoId: destinoId
            }),
        success: function () {
            CaronaRefresh(destinoId);
        }
    });
}


function PrintAll() {
    var doc = CriarPDFA4()
    $.ajax({
        url: '/Carona/GetCaronas',
        datatype: "json",
        data: { EventoId: $("#carona-eventoid").val() },
        type: "POST",
        success: function (data) {
            var arrPromises = []
            data.data.forEach(carona => {
                if (carona.Quantidade > 0) {
                    arrPromises.push($.ajax({
                        url: '/Carona/GetParticipantesByCarona',
                        data: { CaronaId: carona.Id },
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