﻿function CarregarTabelaCirculo() {

    $('#gerenciar').text("Gerenciar Círculos");
    $('#participantes-sem').text("Participantes sem Círculo");
    var columnsTb = [
        { data: "Dirigente1", name: "Dirigente1", autoWidth: true },
        { data: "Dirigente2", name: "Dirigente2", autoWidth: true },
        { data: "Cor", name: "Cor", autoWidth: true },
        { data: "QtdParticipantes", name: "QtdParticipantes", autoWidth: true },
        {
            data: "Id", name: "Id", className: "text-center", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `
                            ${GetButton('PrintCirculo', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('EditCirculo', JSON.stringify(row), 'blue', 'fa-edit', 'Editar')}                            
                            ${GetButton('DeleteCirculo', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]

    $("#circulo-dirigentes").html(` <div class="col-sm-6 p-w-md m-b-sm">
                                <h5>Dirigente 1</h5>
                                <select class="form-control chosen-select" id="circulo-dirigente1"></select>
                            </div>
                            <div class="col-sm-6 p-w-md m-b-sm">
                                <h5>Dirigente 2</h5>
                                <select class="form-control chosen-select" id="circulo-dirigente2"></select>
                            </div>`)

    $("#circulo-cabecalho").html(`<th>Dirigente 1</th>
                        <th>Dirigente 2</th>
                        <th>Cor</th>
                        <th>Membros </th>
                        <th>Ações</th>`)


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
        responsive: true, stateSave: true,
        destroy: true,
        dom: domConfigNoButtons,
        columns: columnsTb,
        order: [
            [0, "asc"]
        ],
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
        var value = $(this).val().toLowerCase();
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    CarregarTabelaCirculo();
    GetParticipantesSemCirculo();
    GetCirculosComParticipantes();
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

function FillDoc(doc,result) {
    if (logoRelatorio) {
        var img = new Image();
        img.src = `data:image/png;base64,${logoRelatorio}`;
        doc.addImage(img, 'PNG', 10, 10, 50, 21);
    }


    doc.setFont('helvetica', "normal")
    doc.setFontSize(12);
    doc.text(77, 15, $("#circulo-eventoid option:selected").text());

    doc.text(77, 20, `Círculo ${result.data[0].Cor}`);
    doc.text(77, 25, `${result.data[0].Dirigente1} / ${result.data[0].Dirigente2}`);

    doc.text(77, 30, `Data de Impressão: ${moment().format('DD/MM/YYYY HH:mm')}`);;
    doc.line(10, 38, 195, 38);

    doc.setFont('helvetica', "bold")
    doc.text(12, 43, "Nome");
    doc.text(117, 43, "Apelido");
    doc.text(152, 43, "Whatsapp");

    doc.line(10, 45, 195, 45);
    doc.setFont('helvetica', "normal")
    height = 50;

    $(result.data).each((index, participante) => {
        doc.text(12, height, participante.Nome);
        doc.text(117, height, participante.Apelido);
        doc.text(152, height, participante.Fone);
        height += 6;
    });

    AddCount(doc, result.data, height);
}

function GetCirculo(id, cor) {
    if (id > 0) {
        $.ajax({
            url: "/Circulo/GetCirculo/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#circulo-id").val(data.Circulo.Id);

                $('#circulo-cores').append($(`<option value="${data.Circulo.Cor}">${cor}</option>`));
                $("#circulo-cores").val(data.Circulo.Cor).trigger("chosen:updated");

                $("#circulo-dirigente1").val(data.Circulo.Dirigente1Id).trigger("chosen:updated");

                $("#circulo-dirigente2").val(data.Circulo.Dirigente2Id).trigger("chosen:updated");


            }
        });
    }
    else {
        $("#circulo-id").val(0);
    }
}

function EditCirculo(row) {
    GetEquipantes(row)
    GetCores();

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
                    Dirigente1Id: $("#circulo-dirigente1").val(),
                    Dirigente2Id: $("#circulo-dirigente2").val(),
                    Cor: $("#circulo-cores").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaCirculo();
                GetCirculosComParticipantes();
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
            CarregarTabelaCirculo();
            GetParticipantesSemCirculo();
            GetCirculosComParticipantes();
            $("#modal-circulo").modal("hide");
        }
    });
}


function GetEquipantes(row) {
    $("#circulo-equipantes").empty();

    $.ajax({
        url: "/Circulo/GetEquipantes/",
        data: { EventoId: $("#circulo-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#circulo-dirigente1').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
                $('#circulo-dirigente2').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $("#circulo-dirigente1").val($("#circulo-dirigente1 option:first").val()).trigger("chosen:updated");
            $("#circulo-dirigente2").val($("#circulo-dirigente2 option:eq(1)").val()).trigger("chosen:updated");
            GetCirculo(row.Id, row.Cor);
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


function GetCirculosComParticipantes() {
    $("#circulos").empty();

    $.ajax({
        url: '/Circulo/GetCirculos',
        datatype: "json",
        data: { EventoId: $("#circulo-eventoid").val() },
        type: "POST",
        success: function (data) {
            data.data.forEach(function (circulo, index, array) {

                htmlCaecalhoCirculo = `<h4 style="padding-top:5px">${circulo.Dirigente1}</h4>
                        <h4 style="padding-bottom:5px">${circulo.Dirigente2}</h4>`


                $("#circulos").append($(`<div data-id="${circulo.Id}" style="margin-bottom:25px;background-color:${GetCor(circulo.Cor)};background-clip: content-box;border-radius: 28px;" class="p-xs col-xs-12 col-lg-4 pg text-center text-white">                     
                       ${htmlCaecalhoCirculo}                        
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
                        $(`#pg-${circulo.CirculoId}`).append($(`<tr><td class="participante" data-id="${circulo.ParticipanteId}">${circulo.Nome}</td></tr>`));
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

function GetCores(id) {
    $("#circulo-cores").empty();

    $.ajax({
        url: "/Circulo/GetCores/",
        data: { EventoId: $("#circulo-eventoid").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Cores.forEach(function (cor, index, array) {
                $('#circulo-cores').append($(`<option value="${cor.Id}">${cor.Description}</option>`));
            });
            if (id == 0) {
                $("#circulo-cores").val($("#circulo-cores option:first").val()).trigger("chosen:updated");
            } else {
                $("#circulo-cores").trigger("chosen:updated");
            }

            if ($("#circulo-cores option").length === 0 && id == 0) {
                ErrorMessage("Não existem Cores disponíveis");
                $("#modal-circulo").modal("hide");
            }
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