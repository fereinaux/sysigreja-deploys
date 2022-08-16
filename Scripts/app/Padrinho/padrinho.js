
function CarregarTabelaPadrinho() {

    $('#gerenciar').text("Gerenciar Padrinhos");
    $('#participantes-sem').text("Participantes sem Padrinho");
    var columnsTb = [
        { data: "Padrinho", name: "Padrinho", autoWidth: true },
        { data: "Quantidade", name: "Quantidade", autoWidth: true },
        {
            data: "Id", name: "Id", orderable: false, width: "15%",
            "render": function (data, type, row) {
                return `
                            ${GetButton('PrintPadrinho', JSON.stringify(row), 'green', 'fa-print', 'Imprimir')}  
                            ${GetButton('DeletePadrinho', data, 'red', 'fa-trash', 'Excluir')}`;
            }
        }
    ]


    const tablePadrinhoConfig = {
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
        drawCallback: function (settings) {
            if (settings.aoData.length > 0) {
                let column = settings.aoColumns[settings.aaSorting[0][0]].data
                let dir = settings.aaSorting[0][1]
                let search = settings.oPreviousSearch.sSearch

                GetPadrinhosComParticipantes(column, dir, search);
            }

        },
        ajax: {
            url: '/Padrinho/GetPadrinhos',
            datatype: "json",
            data: { EventoId: $("#padrinho-eventoid").val() },
            type: "POST"
        }
    };
    $("#table-padrinho").DataTable(tablePadrinhoConfig);
}

$(document).ready(function () {

    $("#Participante").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#table-participantes tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    PadrinhoRefresh()
});


function PadrinhoRefresh() {

    CarregarTabelaPadrinho();
    GetParticipantesSemPadrinho();
    
}

function PrintPadrinho(row) {
    $.ajax({
        url: '/Padrinho/GetParticipantesByPadrinhos',
        data: { PadrinhoId: row.Id },
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
    doc.text(77, 15, $("#padrinho-eventoid option:selected").text());



    doc.text(77, 20, `Relação de Padrinho`);
    doc.text(77, 25, `${result.data[0].Padrinho}`);

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
    });

    AddCount(doc, result.data, height);
}

function GetPadrinho(id) {

    $("#padrinho-id").val(0);

}

function EditPadrinho(row) {
    GetEquipantes();
    GetPadrinho(row.Id);
    $("#modal-padrinho").modal();
}


function DeletePadrinho(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Padrinho/DeletePadrinho/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    PadrinhoRefresh();
                    GetPadrinhosComParticipantes()
                }
            });
        }
    });
}

function PostPadrinho() {
    if (ValidateForm(`#form-padrinho`)) {
        $.ajax({
            url: "/Padrinho/PostPadrinho/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#padrinho-id").val(),
                    EquipanteEventoId: $("#padrinho-equipante").val(),
                }),
            success: function () {
                SuccessMesageOperation();
                PadrinhoRefresh();
                $("#modal-padrinho").modal("hide");
            }
        });
    }
}

function DistribuirPadrinhos() {
    $.ajax({
        url: "/Padrinho/DistribuirPadrinhos/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EventoId: $("#padrinho-eventoid").val()
            }),
        success: function () {
            SuccessMesageOperation();
            PadrinhoRefresh()
        }
    });
}


function GetEquipantes(id) {
    $("#padrinho-equipante").empty();

    $.ajax({
        url: "/Padrinho/GetEquipantes/",
        data: { EventoId: $("#padrinho-eventoid").val(), },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#padrinho-equipante').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $("#padrinho-equipante").val($("#padrinho-equipante option:first").val()).trigger("chosen:updated");
            if ($("#padrinho-equipantes option").length === 0 && id == 0) {
                ErrorMessage("Não existem Equipantes disponíveis");
                $("#modal-padrinho").modal("hide");
            }
        }
    });
}


function GetParticipantesSemPadrinho() {
    $("#table-participantes").empty();

    $.ajax({
        url: "/Padrinho/GetParticipantesSemPadrinho/",
        data: { EventoId: $("#padrinho-eventoid").val() },
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


function GetPadrinhosComParticipantes(column, dir, search) {
    $("#padrinhos").empty();
    $.ajax({
        url: '/Padrinho/GetPadrinhos',
        datatype: "json",
        data: { EventoId: $("#padrinho-eventoid").val(), columnName: column, columnDir: dir, search },
        type: "POST",
        success: function (data) {
            data.data.forEach(function (padrinho, index, array) {
                $("#padrinhos").append($(`<div data-id="${padrinho.Id}" style="margin-bottom:25px;background-color:#424242;background-clip: content-box;border-radius: 28px;" class="p-xs col-xs-12 col-lg-4 pg text-center text-white">
                  <h4 style="padding-top:5px">${padrinho.Padrinho}</h4>
                                    <table class="table">
                                        <tbody id="pg-${padrinho.Id}">
                                            
                                        </tbody>
                                    </table>
 <button type="button" class="btn btn-rounded btn-default print-button" onclick='PrintPadrinho(${JSON.stringify(padrinho)})'><i class="fa fa-2x fa-print"></i></button>
                                </div>`));
            });

            $.ajax({
                url: "/Padrinho/GetPadrinhosComParticipantes/",
                data: { EventoId: $("#padrinho-eventoid").val() },
                datatype: "json",
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {

                    data.Padrinhos.forEach(function (padrinho, index, array) {
                        $(`#pg-${padrinho.PadrinhoId}`).append($(`<tr><td class="participante" data-id="${padrinho.ParticipanteId}">${padrinho.Nome}</td></tr>`));
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
            ChangePadrinho($(ui.draggable).data('id'), $(this).data('id'));
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

function ChangePadrinho(participanteId, destinoId) {
    $.ajax({
        url: "/Padrinho/ChangePadrinho/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                ParticipanteId: participanteId,
                DestinoId: destinoId || null
            }),
        success: function () {
            PadrinhoRefresh(destinoId);
        }
    });
}


function PrintAll() {
    var doc = CriarPDFA4()
    $.ajax({
        url: '/Padrinho/GetPadrinhos',
        datatype: "json",
        data: { EventoId: $("#padrinho-eventoid").val() },
        type: "POST",
        success: function (data) {
            var arrPromises = []
            data.data.forEach(padrinho => {
                if (padrinho.Quantidade > 0) {
                    arrPromises.push($.ajax({
                        url: '/Padrinho/GetParticipantesByPadrinhos',
                        data: { PadrinhoId: padrinho.Id },
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