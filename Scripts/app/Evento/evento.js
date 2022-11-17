let eventoId
function CarregarTabelaEvento() {
    const tableEventoConfig = {
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
        buttons: getButtonsConfig('Eventos'),
        columns: [
            {
                data: "TipoEvento", name: "TipoEvento", autoWidth: true,
                "render": function (data, type, row) {
                    return `${row.TipoEvento} ${row.Numeracao}`;
                }
            },
            { data: "Capacidade", name: "Capacidade", autoWidth: true },
            { data: "Valor", name: "Valor", autoWidth: true },
            { data: "ValorTaxa", name: "ValorTaxa", autoWidth: true },
            {
                data: "DataEvento", name: "DataEvento", autoWidth: true,
                "render": function (data, type, row) {
                    return `${moment(data).format('DD/MM/YYYY')} `;
                }
            },

            {
                data: "Id", name: "Id", orderable: false, autoWidth: true,
                "render": function (data, type, row) {
                    var color = 'green'

                    switch (row.Status) {
                        case InscricoesAbertas:
                            color = 'green'
                            break;
                        case InscricoesEncerradas:
                            color = 'red'
                            break;
                        default:
                            color = 'yellow'
                            break;
                    }

                    return `${GetLabel('ToggleEventoStatus', data, color, row.Status)}`
                }
            },
            {
                data: "Id", name: "Id", orderable: false, autoWidth: true,
                "render": function (data, type, row) {

                    var colorEquipe = 'green'


                    switch (row.StatusEquipe) {
                        case InscricoesAbertas:
                            colorEquipe = 'green'
                            break;
                        case InscricoesEncerradas:
                            colorEquipe = 'red'
                            break;
                        default:
                            colorEquipe = 'yellow'
                            break;
                    }

                    return `
${GetLabel('ToggleEventoStatusEquipe', data, colorEquipe, row.StatusEquipe)}`;
                }
            },
            {
                data: "Id", name: "Id", orderable: false, width: "30%",
                "render": function (data, type, row) {

                    return `
${GetButton('GetUsers', data, 'blue', 'fa-users-cog', 'Usuários')}
                            ${GetButton('exibirQrCode', data, '', 'fas fa-qrcode', 'QR Code')}
                            ${GetButton('Lotes', data, 'green', 'far fa-calendar-check', 'Editar')}
                            ${GetAnexosButton('AnexosEvento', data, row.QtdAnexos)}
                            ${GetButton('EditEvento', data, 'blue', 'fa-edit', 'Editar')}
                            ${GetButton('DeleteEvento', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [2, "desc"]
        ],
        ajax: {
            url: '/Evento/GetEventos',
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-eventos").DataTable(tableEventoConfig);
}

function GetEvento(id) {
    if (id > 0) {
        $.ajax({
            url: "/Evento/GetEvento/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#evento-id").val(data.Evento.Id);
                $("#evento-descricao").val(data.Evento.Descricao);
                $("#evento-urlexterna").val(data.Evento.UrlExterna);
                $("#evento-numeracao").val(data.Evento.Numeracao);
                $("#evento-capacidade").val(data.Evento.Capacidade);
                $(`#evento-conteudo`).summernote({
                    height: 300,
                    lang: 'pt-BR',
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['font', ['strikethrough', 'superscript', 'subscript']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']],
                        ['insert', ['link']],
                        ['view', ['codeview']]],

                }).summernote('code', data.Evento.Conteudo)
                $("#evento-valor").val(data.Evento.Valor);
                $('#evento-global').iCheck((data.Evento.Global ? 'check' : 'uncheck'))
                $("#evento-taxa").val(data.Evento.ValorTaxa);
                $("#evento-data").val(moment(data.Evento.DataEvento).format('DD/MM/YYYY'));
                $("#evento-tipo").val(data.Evento.ConfiguracaoId).trigger("chosen:updated");
            }
        });
    }
    else {
        $("#evento-id").val(0);
        $("#evento-numeracao").val("");
        $("#evento-urlexterna").val("");
        $('#evento-global').iCheck('uncheck')
        $("#evento-descricao").val("");
        $("#evento-capacidade").val("");
        $("#evento-data").val("");
        $("#evento-valor").val("");
        $(`#evento-conteudo`).summernote({
            height: 300,
            lang: 'pt-BR',
            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['font', ['strikethrough', 'superscript', 'subscript']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['height', ['height']],
                ['insert', ['link']],
                ['view', ['codeview']]],

        }).summernote('code', "")
        $("#evento-taxa").val("");
    }
}

function resetLote() {

}

function GetLotesEvento(id) {
    eventoId = id;
    const tableLotesConfig = {
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
        buttons: getButtonsConfig('Eventos'),
        columns: [
            {
                data: "DataLote", name: "DataLote", autoWidth: true,
                "render": function (data, type, row) {
                    return `${moment(data).format('DD/MM/YYYY')} `;
                }
            },
            { data: "Valor", name: "Valor", autoWidth: true },
            { data: "ValorTaxa", name: "ValorTaxa", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "30%",
                "render": function (data, type, row) {
                    return `
                            ${GetButton('DeleteLote', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [2, "desc"]
        ],
        ajax: {
            url: '/Evento/GetLotesEvento',
            data: { Id: eventoId },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-lotes").DataTable(tableLotesConfig);
    $("#lote-data").val("");
    $("#lote-valor").val("");
    $("#lote-taxa").val("");
}


function EditEvento(id) {
    GetEvento(id);
    $("#modal-eventos").modal();
}

function Lotes(id) {
    GetLotesEvento(id);
    $("#modal-lotes").modal();
}

function ToggleEventoStatus(id) {
    $.ajax({
        url: "/Evento/ToggleEventoStatus/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: id
            }),
        success: function () {
            CarregarTabelaEvento();
        },
        error: function (error) {
            ErrorMessage(error.statusText);
        }
    });
}

function ToggleEventoStatusEquipe(id) {
    $.ajax({
        url: "/Evento/ToggleEventoStatusEquipe/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: id
            }),
        success: function () {
            CarregarTabelaEvento();
        },
        error: function (error) {
            ErrorMessage(error.statusText);
        }
    });
}

function DeleteEvento(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Evento/DeleteEvento/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaEvento();
                }
            });
        }
    });
}

function PostEvento() {
    if (ValidateForm(`#form-evento`)) {
        $.ajax({
            url: "/Evento/PostEvento/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#evento-id").val(),
                    Global: $('#evento-global:checked').length > 0,
                    ConfiguracaoId: $("#evento-tipo").val(),
                    Numeracao: $("#evento-numeracao").val(),
                    Descricao: $("#evento-descricao").val(),
                    UrlExterna: $("#evento-urlexterna").val(),
                    Conteudo: $('#evento-conteudo').summernote('code'),
                    Capacidade: $("#evento-capacidade").val(),
                    Valor: $("#evento-valor").val(),
                    ValorTaxa: $("#evento-taxa").val(),
                    DataEvento: moment($("#evento-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaEvento();
                $("#modal-eventos").modal("hide");
            }
        });
    }
}

$(document).ready(function () {
    CarregarTabelaEvento();
});


function AnexosEvento(id) {
    $("#EventoId").val(id);
    GetAnexos(id);
    $("#modal-anexos").modal();
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
                            ${GetButton('DeleteArquivo', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Arquivo/GetArquivosEvento',
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
                    GetAnexos($("#EventoId").val());
                }
            });
        }
    });
}

function PostArquivo() {
    var dataToPost = new FormData($('#frm-upload-arquivos')[0]);
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "Arquivo/PostArquivo",
            success: function () {
                GetAnexos($("#EventoId").val());
            }
        });
}

$("#arquivo").change(function () {
    PostArquivo();
});

$("#modal-anexos").on('hidden.bs.modal', function () {
    CarregarTabelaEvento();
});

function GetUsers(id) {
    eventoId = id;
    $("#modal-usuarios").modal();
    GetUsuarios(id)
    GetEquipantes(id)
}


function GetUsuarios(id) {
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
            {
                data: "Perfil", name: "Perfil", autoWidth: true, render: function (data, type, row) {
                    return row.Perfil.find(x => {

                        if (x.Eventos) {
                            return x.Eventos.find(y => y.EventoId == id)
                        }

                    }).Eventos[0].Role
                }
            },
            {
                data: "EquipanteId", name: "EquipanteId", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `
                            ${GetButton('DeleteUsuario', JSON.stringify(row), 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: "/Account/GetUsuariosByEvento/",
            data: { eventoid: id },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-usuarios").DataTable(tableArquivoConfig);
}

function GetEquipantes(id) {
    $("#usuario-equipanteid").empty();
    $('#usuario-equipanteid').append($('<option>Selecione</option>'));

    $.ajax({
        url: "/Account/GetEquipantesByEvento/",
        data: { eventoid: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            data.Equipantes.forEach(function (equipante, index, array) {
                $('#usuario-equipanteid').append($(`<option value="${equipante.Id}">${equipante.Nome}</option>`));
            });
            $('#usuario-equipanteid').trigger("chosen:updated")
        }
    });

}


function saveUser() {
    var windowReference = window.open('_blank');
    $.ajax({
        url: "/Account/AddUsuarioEvento/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EquipanteId: $('#usuario-equipanteid').val(),
                EventoId: eventoId,
                Perfil: $("input[type=radio][name=usuario-perfil]:checked").val(),
            }),
        success: function (data) {
            SuccessMesageOperation()
            GetUsers(eventoId);
            if (data) {

                windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
            }
        }
    });
}

function DeleteUsuario(row) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Account/DelUsuarioEvento/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        EquipanteId: row.EquipanteId,
                        EventoId: eventoId,
                        Perfil: row.Perfil.find(x => {

                            if (x.Eventos) {
                                return x.Eventos.find(y => y.EventoId == eventoId)
                            }

                        }).Eventos[0].Role,
                    }),
                success: function (data) {
                    SuccessMesageOperation()
                    GetUsers(eventoId);
                }
            });
        }
    })

}


function DeleteLote(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Evento/DeleteLote/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function (data) {
                    SuccessMesageOperation()
                    GetLotesEvento(eventoId)
                }
            });
        }
    })

}


function PostLote() {
    if (ValidateForm(`#form-lote`)) {
        $.ajax({
            url: "/Evento/CreateLote/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    EventoId: eventoId,
                    Valor: $("#lote-valor").val(),
                    ValorTaxa: $("#lote-taxa").val(),
                    DataLote: moment($("#lote-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON()
                }),
            success: function () {
                SuccessMesageOperation();
                GetLotesEvento(eventoId);
            }
        });
    }
}

function exibirQrCode(id) {
    eventoId = id
    loadQRCode(eventoId)
}

function loadQRCode(id) {
    $.ajax({
        url: "/Configuracao/GetConfiguracaoByEventoId/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            $('#qrcode').empty()
            switch ($("input[type=radio][name=qrcode-tipo]:checked").val()) {
                case '0':
                    const qrCode = new QRCodeStyling({
                        width: 300,
                        height: 300,
                        data: `https://${window.location.host}/Inscricoes/Detalhes/${id}?Tipo=Inscrições`,
                    });

                    qrCode.append(document.getElementById("qrcode"));
                    break;
                case '2':
                    logoRelatorio = data.Configuracao.LogoRelatorio
                    buildColors(`data:image/png;base64,${logoRelatorio}`).then(colors => {
                        const qrCode = new QRCodeStyling(
                            {
                                "width": 300,
                                "height": 300,
                                "data": `https://${window.location.host}/Inscricoes/Detalhes/${id}?Tipo=Inscrições`,
                                "margin": 0,
                                "qrOptions": {
                                    "typeNumber": "0",
                                    "mode": "Byte",
                                    "errorCorrectionLevel": "Q"
                                },
                                "imageOptions": {
                                    "hideBackgroundDots": true,
                                    "imageSize": 0.3,
                                    "margin": 0
                                },
                                "dotsOptions": {
                                    "type": "square",
                                    "color": colors[0],
                                    "gradient": {
                                        "type": "linear",
                                        "rotation": 1.5707963267948966, "colorStops": [
                                            {
                                                "offset": 0,
                                                "color": colors[0]
                                            }, {
                                                "offset": 1,
                                                "color": colors[2]
                                            }]
                                    }
                                }, "backgroundOptions": {
                                    "color": "#ffffff",
                                    "gradient": null
                                }, "image": `data:image/png;base64,${logoRelatorio}`,
                                "dotsOptionsHelper": {
                                    "colorType": {
                                        "single": true,
                                        "gradient": false
                                    }, "gradient":
                                    {
                                        "linear": true,
                                        "radial": false,
                                        "color1": "#6a1a4c",
                                        "color2": "#6a1a4c",
                                        "rotation": "0"
                                    }
                                }, "cornersSquareOptions": {
                                    "type": "square",
                                    "color": colors[2],
                                    "gradient": null
                                }, "cornersSquareOptionsHelper": {
                                    "colorType": {
                                        "single": true,
                                        "gradient": false
                                    }, "gradient": {
                                        "linear": true,
                                        "radial": false,
                                        "color1": "#000000",
                                        "color2": "#000000",
                                        "rotation": "0"
                                    }
                                }, "cornersDotOptions": {
                                    "type": "",
                                    "color": colors[0]
                                }, "cornersDotOptionsHelper": {
                                    "colorType": {
                                        "single": true,
                                        "gradient": false
                                    }, "gradient": {
                                        "linear": true,
                                        "radial": false,
                                        "color1": "#000000",
                                        "color2": "#000000",
                                        "rotation": "0"
                                    }
                                }, "backgroundOptionsHelper": {
                                    "colorType": {
                                        "single": true,
                                        "gradient": false
                                    }, "gradient": {
                                        "linear": true,
                                        "radial": false,
                                        "color1": "#ffffff",
                                        "color2": "#ffffff",
                                        "rotation": "0"
                                    }
                                }
                            })
                        qrCode.append(document.getElementById("qrcode"));

                    })
                    break;
            }
            $("#canvas").css("display", "none")
            $("#modal-qrcode").modal();
        }
    })
}

function downloadQR() {
    const a = document.createElement("a");
    a.href = $('#qrcode img').attr('src');
    a.download = "QRCode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

$('#qrcode-tipo-0').on('ifChecked', function (event) {
    exibirQrCode(eventoId)
});

$('#qrcode-tipo-1').on('ifChecked', function (event) {
    exibirQrCode(eventoId)

});

$('#qrcode-tipo-2').on('ifChecked', function (event) {
    exibirQrCode(eventoId)
});

