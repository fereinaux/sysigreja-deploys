﻿realista = undefined;
table = undefined

oldEventoId = undefined
newEventoId = undefined

isConvite = SelectedEvent.Role == "Convites"
HideMenu();
$(document).off('ready-ajax').on('ready-ajax', () => {
    tippy('#btn_Adicionar', { content: "Irá incluir um vountário no banco de dados com os campos essenciais" })
    
    $('.not-convite').css('display', isConvite ? 'none' : 'block')
    loadMontagem()
    loadCampos(999)
    tippy(`div:has(> #btn_bulk)`, {
        content: 'Você deve selecionar registros para habilitar as ações',
        followCursor: true, trigger: 'mouseenter',
        onShow(instance) {

            if (!$('#btn_bulk').attr('disabled'))
                return false; // cancels it
        }
    });
})
$('.search-data').attr('disabled', true)
$('.search-data').on('keyup change clear', _.debounce(function () {
    if ($('#table-montagem').DataTable().column($(this).data('column')).search() !== this.value) {
        $('#table-montagem').DataTable().column($(this).data('column')).search(this.value).draw(false)
    }

}, 500))

function loadSearch() {
    $('.search-data').each((i, elm) => {
        $(elm).val($('#table-montagem').DataTable().state().columns[$(elm).data('column')].search.search)
        $(elm).attr('disabled', false)
    })
}


function loadMontagem() {
    tippy('#btn_addEquipe', { content: `Irá adicionar um voluntário a uma equipe no ${SelectedEvent.Numeracao}º ${SelectedEvent.Titulo}` })
    $.ajax({
        url: '/Etiqueta/GetEtiquetasByEventoId',
        data: { eventoId: SelectedEvent.Id },
        datatype: "json",
        type: "POST",
        success: (result) => {
            $("#equipante-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
            $("#equipante-nao-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
            $('#equipante-marcadores').select2({ placeholder: "Pesquisar", });
            $('#equipante-nao-marcadores').select2({ placeholder: "Pesquisar", });
            $('#equipante-status').select2({ placeholder: "Pesquisar", });
        }
    });
    $('#equipante-status-montagem').select2({ multiple: true, maximumSelectionLength: 1, placeholder: "Pesquisar" });
    $('#eventoid').select2()
    $('#listagem').select2({
        ajax: {
            delay: 750,
            url: '/Equipante/GetEquipanteTipoEvento',
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
                    results: data.Items
                };
            }
        },
        placeholder: "Pesquisar",
        minimumInputLength: 3,

        templateSelection: function (data) {
            tipo = data.Tipo
            $('#getHistButton').css('display', tipo == "Equipante" ? 'block' : 'none')
            return data.text;
        }
    });
    $.ajax({
        url: '/Equipe/GetEquipes',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST",
        success: (result) => {
            $("#equipe-select").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
`)
            $('#equipe-select').select2({ placeholder: "Pesquisar" });
            $("#equipe-select-filtro").html(`
    ${result.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
    `)
            $('#equipe-select-filtro').select2({ placeholder: "Pesquisar" });
        }
    });
    CarregarTabelaEquipante()

}

function CarregarTabelaEquipante(callbackFunction) {
    newEventoId = SelectedEvent.Id
    

    const tableEquipanteConfig = {
        language: languageConfig,
        searchDelay: 1000,
        lengthMenu: [10, 30, 50, 100, 200, 500],
        colReorder: true,
        serverSide: true,
        scrollX: true,
        createdCell: function (td, cellData, rowData, row, col) {

            $(td).css('cursor', 'pointer')
            if (td._tippy) {
                rotdw._tippy.destroy()
            }
            tippyProfile(td, rowData.Id, "Quartos", function () {
                rootProfile = []
                tippy.hideAll()
                CarregarTabelaEquipante();
            }, "Equipante")

        }, 
        scrollXollapse: true,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        orderMulti: false,
        responsive: true,
        stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        colReorder: {
            fixedColumnsLeft: 1
        },
        dom: '<"html5buttons"B>lTgitp',
        buttons: getButtonsConfig(`Montagem`),
        columns: [
            {
                data: "Id", name: "Id", orderable: false, width: "2%", className: 'noVis noSearch noExport', title: '<div class="checkbox i-checks-green"><label> <input type="checkbox" id="select-all" data-id="all"> <i></i></label></div>',
                "render": function (data, type, row) {
                    return `${GetCheckBox(data, false)}`;
                }
            },
            { data: "Sexo", name: "Sexo", visible: false, className: 'noVis noSearch noExport', },
            {
                data: "Sexo", title: "Sexo", orderData: 1, name: "Sexo", className: "text-center noSearch noExport", width: "5%",
                "render": function (data, type, row) {
                    if (data == "Masculino") {
                        icon = "fa-male";
                        cor = "#0095ff";
                    }
                    else {
                        icon = "fa-female";
                        cor = "#ff00d4";
                    }
                    return `<span onclick="ToggleSexo(${row.Id})" style="font-size:18px;color:${cor};" class="p-l-xs pointer"> <i class="fa ${icon}" aria-hidden="true" title="${data}"></i></span >`;
                }
            },
            {
                data: "Nome", title: "Nome", name: "Nome", autoWidth: true
            },
            {
                data: "Apelido", title: "Apelido", name: "Apelido", autoWidth: true, class: "noSearch"            
            },
            {
                data: "Etiquetas", title: "Etiquetas", orderable: false, name: "Etiquetas", className: 'noSearch', render: function (data, type, row) {
                    if (type === 'export') {
                        return `<div>

        ${row.Etiquetas.map(etiqueta => {
                            if (etiqueta) {
                                return etiqueta.Nome.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/, '')
                            }
                        })}</div>`
                    }

                    return `<div>
        ${SelectedEvent.Id != 999 ? row.Etiquetas.map(etiqueta => {
                        if (etiqueta) {
                            return `<span  class="badge m-r-xs" style="background-color:${etiqueta.Cor};color:#fff">${etiqueta.Nome}</span>`
                        }
                    }).join().replace(/,/g, '') : ""}
    </div>`
                }
            },
            { data: "Fone", title: "Fone", name: "Fone", class: "noSearch" },
            { data: "Email", title: "Email", name: "Email", class: "noSearch" },

            { data: "Idade", title: "Idade", name: "Idade", class: "noSearch" },
            {
                data: "Equipe", title: "Equipe", name: "Equipe", autoWidth: true
            },
            { data: "Bairro", title: "Bairro", name: "Bairro", class: "noSearch" },
            { data: "Cidade", title: "Cidade", name: "Cidade", class: "noSearch" },


            {
                data: "StatusMontagem", title: "Status", orderable: false, name: "StatusMontagem", class: "noSearch", render: (data, type, row) =>
                    GetLabel('ToggleStatusMontagem', JSON.stringify(row), data == 'Ativo' ? 'green' : 'blue', data)

            },
            {
                data: "Presenca", title: "Presença", name: "Presenca", orderable: false, className: 'noSearch', render: function (data, type, row) {
                    if (type === 'export') {
                        return `<div>

        ${data?.map(presenca => {
                            return presenca ? '√' : "X"
                        }).join(' - ')}</div>`
                    }

                    return `<div style="    text-wrap: nowrap;">
                    ${data?.map(presenca => {

                        return `   <i class="fas fa-${presenca ? "check" : "times"}"></i>`

                    }).join().replace(/,/g, '')}
    </div>`
                }
            },

            {
                data: "Id", title: "Ações", name: "Id", orderable: false, width: "20%", className: 'noVis noSearch noExport',
                "render": function (data, type, row) {
                    var color = !(Coordenador == row.Tipo) ? 'info' : 'yellow';
                    return `

    ${!isConvite ? GetLabel('ToggleMembroEquipeTipo', JSON.stringify(row), color, row.Tipo) : ""
                        }
    ${GetIconWhatsApp(row.Fone)}
    ${GetIconTel(row.Fone)}
    ${!isConvite ? GetButton('GetHistorico', data, 'green', 'fas fa-history', 'Histórico') : ""}
    ${GetButton('Opcoes', data, 'cinza', 'fas fa-info-circle', 'Opções')}
    ${GetButton('EditEquipante', data, 'blue', 'fa-edit', 'Editar')}
    ${!isConvite ? GetButton('DeleteMembroEquipe', data, 'red', 'fa-trash', 'Excluir') : ""}

    `;
                }
            }
        ],
        order: [
            [2, "asc"]
        ],
        drawCallback: function () {          
            if (callbackFunction) {
                callbackFunction()
            }
            if (SelectedEvent.Id != 999) {
                $('.hide-tipoevento').removeClass('d-none')
            } else {
                $('.hide-tipoevento').addClass('d-none')
            }          

          
            newEventoId = SelectedEvent.Id
            loadSearch()
        },
        ajax: {
            url: '/Equipante/GetEquipantesDataTable',
            data: getFiltros(),
            datatype: "json",
            type: "POST"
        }
    };

    if (!$.fn.DataTable.isDataTable('#table-montagem')) {
        table = $("#table-montagem").DataTable(tableEquipanteConfig);
    } else {
        table = $("#table-montagem").DataTable()

        table.on('preXhr.dt', function (e, settings, data) {
            var filtros = getFiltros()
            Object.keys(filtros).forEach(k => data[k] = filtros[k])
        })

        table.draw(false)
    }

    table.on('draw', function () {
        $('.i-checks-green').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green'
        });
        $('.i-checks-green').on('ifToggled', function (event) {
            checkBulkActions()
        });
        $('#select-all').on('ifClicked', function (event) {
            $('.i-checks-green').iCheck($('#select-all').iCheck('update')[0].checked ? 'uncheck' : 'check')
        });
    });
}

function getFiltros() {
    return {
        EventoId: SelectedEvent.Id,
        Origem: "Montagem",
        Etiquetas: $("#equipante-marcadores").val(),
        NaoEtiquetas: $("#equipante-nao-marcadores").val(),
        Equipe: $("#equipe-select-filtro").val() != 999 ? $("#equipe-select-filtro").val() : null,
        StatusMontagem: $("#equipante-status-montagem").val() != 999 ? $("#equipante-status-montagem").val() : null,
    }
}


function GetHistorico(id) {

    CarregarTabelaHistorico(id);
    $("#modal-historico").modal();

}


function CarregarTabelaHistorico(id) {
    const tableHistoricoConfig = {
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
        buttons: getButtonsConfig('Histórico'),
        columns: [
            { data: "Evento", name: "Evento", autoWidth: true },
            {
                data: "Equipe", name: "Equipe", autoWidth: true, render: function (data, type, row) {
                    return `<i class="fas fa-${row.Coordenador == " Coordenador" ? "star" : "user"}"></i> ${data} `
                }
            },
        ],

        order: [
            [0, "asc"]
        ],
        ajax: {
            data: { id: id },
            url: '/Equipante/GetHistorico',
            datatype: "json",
            type: "POST"
        }
    };

    const tableHistoricoParticipacaoConfig = {
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
        buttons: getButtonsConfig('Histórico'),
        columns: [
            { data: "Evento", name: "Evento", autoWidth: true },
        ],

        order: [
            [0, "asc"]
        ],
        ajax: {
            data: { id: id },
            url: '/Equipante/GetHistoricoParticipacao',
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-historico").DataTable(tableHistoricoConfig);
    $("#table-historico-participacao").DataTable(tableHistoricoParticipacaoConfig);
}

function checkBulkActions() {
    if ($('input[type=checkbox][id!=select-all]:checked').length > 0) {
        $('#btn_bulk').attr('disabled', false)
    } else {
        $('#btn_bulk').attr('disabled', true)
    }
}


function Opcoes(row) {
    $('.equipante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
    $.ajax({
        url: "/Equipante/GetEquipante/",
        data: { Id, eventoId: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            equipante = data.Equipante
            if ($('#modal-opcoes').is(":hidden")) {
                $.ajax({
                    url: "/Mensagem/GetMensagensByTipo/",
                    datatype: "json",
                    data: JSON.stringify(
                        {
                            eventoId: SelectedEvent.Id, tipos: ["Equipe"]
                        }),
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    success: function (dataMsg) {
                        $("#msg-list").html(`
${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`)

                    }
                })
            }
            $('.realista-nome').text(equipante.Nome)

            $('#equipante-etiquetas').val(data.Equipante.Etiquetas.map(etiqueta => etiqueta.Id))
            $('.equipante-etiquetas').select2({ ...createTagOptions, dropdownParent: $("#form-opcoes") }).off('select2:select').on('select2:select', function (e) {
                if (e.params.data.newTag) {
                    $.ajax({
                        url: "/Etiqueta/PostEtiqueta/",
                        datatype: "json",
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify(
                            {
                                Id: null,
                                Nome: e.params.data.id,
                                Cor: generateColor(),
                                ConfiguracaoId: SelectedEvent.ConfiguracaoId
                            }),
                        success: function (data) {
                            // Append it to the select


                            var otherOption = new Option(data.Etiqueta.Nome, data.Etiqueta.Id, false, false);
                            // Append it to the select
                            $(`#equipante-marcadores,#equipante-nao-marcadores`).append(otherOption).trigger('change');

                            $(`#equipante-etiquetas`).find("option[value='" + e.params.data.id + "']").remove()
                            $(`#equipante-etiquetas`).append(new Option(data.Etiqueta.Nome, data.Etiqueta.Id, true, true)).trigger('change');
                            e.params.data.newTag = false
                        }
                    });
                }

            });;
            $('#equipante-obs').val(data.Equipante.Observacao)

            arrayData = table.data().toArray()
            let index = arrayData.findIndex(r => r.Id == row.Id)

            $('#btn-previous').css('display', 'block')
            $('#btn-next').css('display', 'block')
            if (index == 0) {

                $('#btn-previous').css('display', 'none')
            }

            if (index == arrayData.length - 1) {
                $('#btn-next').css('display', 'none')
            }

            $("#modal-opcoes").modal();
        }
    });


}


function DeleteMembroEquipe(id) {
    ConfirmMessageDelete().then((result) => {
        if (result) {
            $.ajax({
                url: "/Equipe/DeleteMembroEquipeByEquipante/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id,
                        EventoId: SelectedEvent.Id
                    }),
                success: function () {
                    SuccessMesageDelete();
                    CarregarTabelaEquipante();
                },
                error: function (data) {
                    ErrorMessage("O Equipante está vinculado a um registro de Padrinho, não será possível deletá-lo")
                }
            });
        }
    });
}

function AddMembroEquipe() {
    if ($("#listagem").val()) {
        $.ajax({
            url: "/Equipe/AddMembroEquipe/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    EquipanteId: $("#listagem").val(),
                    EventoId: SelectedEvent.Id,
                    EquipeId: $("#equipe-select").val(),
                    Tipo: tipo,
                    Origem: "Montagem"
                }),
            success: function () {
                $("#listagem").val('');
                $("#listagem").trigger('change');
                CarregarTabelaEquipante()
                $("#listagem").select2('open')
            }
        });
    }
}

tipo = undefined


async function openBulkActions() {
    let ids = getCheckedIds()

    if (SelectedEvent.Id == 999) {
        $('.evento-bulk').css('display', 'block');
        $('.not-evento-bulk').css('display', 'none');
    } else {
        $('.evento-bulk').css('display', 'none');
        $('.not-evento-bulk').css('display', 'block');
    }

    await loadEquipesBulk()

    $.ajax({
        url: "/Mensagem/GetMensagensByTipo/",
        datatype: "json",
        data: JSON.stringify(
            {
                eventoId: SelectedEvent.Id, tipos: ["Equipe"]
            }),
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        success: function (dataMsg) {
            $("#bulk-mensagem").html(`
                                                                  ${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`).select2({
                width: 'resolve',
                dropdownParent: $('#modal-bulk')
            })

        }
    })

    $("#modal-actions").modal();
}

function getCheckedIds() {
    let ids = [];
    $('input[type=checkbox]:checked').each((index, input) => {
        if ($(input).data('id') != 'all') {
            ids.push($(input).data('id'))
        }

    })
    return ids
}

async function applyBulk() {
    let ids = getCheckedIds()

    let arrPromises = []
    arrayData = table.data().toArray()
    ids.forEach(id => {
        if ($("#bulk-change-equipe").val()) {
            arrPromises.push($.ajax({
                url: "/Equipe/AddMembroEquipe/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        EquipanteId: id,
                        EventoId: SelectedEvent.Id,
                        EquipeId: $("#bulk-change-equipe").val(),
                        Origem: "Montagem"
                    }),

            }))
        }
    })

    await Promise.all(arrPromises);
    SuccessMesageOperation();
    CarregarTabelaEquipante()
}


async function loadEquipesBulk() {
    const equipes = await $.ajax({
        url: '/Equipe/GetEquipes',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST"
    })

    $("#bulk-change-equipe").html(`
                                                                  ${equipes.data.map(p => `<option value=${p.Id}>${p.Equipe}</option>`)}
`).select2({
        width: 'resolve',
        dropdownParent: $('#modal-bulk')
    })
}

async function loadMensagens() {
    let ids = getCheckedIds()
    await enviarMensagens($("#bulk-mensagem").val(), ids,'', 'Equipante')
}


function enviar() {
    var windowReference = window.open('_blank');
    $.ajax({
        url: "/Mensagem/GetMensagem/",
        data: { Id: $("#msg-list").val() },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            var text = data.Mensagem.Conteudo.replaceAll('${Nome Participante}', equipante.Nome);
            windowReference.location = GetLinkWhatsApp(equipante.Fone, text)
        }
    });


}

function ToggleMembroEquipeTipo(row) {
    if (Membro == row.Tipo) {
        var windowReference = window.open('_blank');

    }
    $.ajax({
        url: "/Equipe/ToggleMembroEquipeTipoByEquipante/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: row.Id,
                EventoId: SelectedEvent.Id
            }),
        success: function (data) {
            CarregarTabelaEquipante();
            if (data) {

                windowReference.location = GetLinkWhatsApp(data.User.Fone, MsgUsuario(data.User))
            }

        },       
    });
}


function ToggleStatusMontagem(row) {
    $.ajax({
        url: "/Equipante/ToggleStatusMontagem/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: row.Id,
                EventoId: SelectedEvent.Id
            }),
        success: function (data) {
            CarregarTabelaEquipante();
        },       
    });
}

$("#modal-opcoes").on('hidden.bs.modal', function () {
    PostInfo()
});

function PostInfo(callback) {
    $.ajax({
        url: "/Equipante/PostEtiquetas/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: equipante.Id,
                eventoId: SelectedEvent.Id,
                Etiquetas: $('.equipante-etiquetas').val(),
                Obs: $('#equipante-obs').val(),
            }),
        success: function () {
            CarregarTabelaEquipante(callback)
        }
    });
}

function loadCampos(id) {
    $.ajax({
        url: "/Configuracao/GetCamposEquipeByEventoId/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            campos = data.Campos
            $('.campos-cadastro').html(`
                              <input type="hidden" id="equipante-id" />
${campos.find(x => x.Campo == "Nome completo") ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Nome</h5>

                                                    <input type="text" class="form-control required" id="equipante-nome" data-field="Nome" />
                                                </div>` : ""}

${campos.find(x => x.Campo == "Apelido") ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Apelido</h5>

                                                    <input type="text" class="form-control required" id="equipante-apelido" data-field="Apelido" />
                                                </div>` : ""}
${campos.find(x => x.Campo == 'Data Nascimento') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Data de Nascimento</h5>

                                                    <input type="text" class="form-control full-date required" id="equipante-data-nascimento" data-field="Data de Nascimento" />
                                                </div><div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Sexo</h5>

                                                    <div class="radio i-checks-green inline"><label> <input type="radio" id="equipante-sexo" checked="" value="1" name="equipante-sexo"> <i></i> Masculino </label></div>
                                                    <div class="radio i-checks-green inline"><label> <input type="radio" id="equipante-sexo" value="2" name="equipante-sexo"> <i></i> Feminino </label></div>
                                                </div>` : ''}
${campos.find(x => x.Campo == 'Email') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>Email</h5>

                                                    <input type="email" class="form-control" id="equipante-email" data-field="Email" />
                                                </div>` : ''}

${campos.find(x => x.Campo == 'Fone') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                                    <h5>WhatsApp</h5>

                                                    <input type="text" class="form-control fone" id="equipante-fone" data-field="WhatsApp"  />
                                                </div>` : ''}`)


            initInputs()

        }
    });
}


function PostEquipante() {
    if (ValidateForm(`#form-equipante`)) {
        $.ajax({
            url: "/Equipante/PostEquipante/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#equipante-id").val(),
                    Nome: $(`#equipante-nome`).val(),
                    DataNascimento: moment($("#equipante-data-nascimento").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    Email: $(`#equipante-email`).val(),
                    Fone: getNumber('equipante-fone'),
                    Sexo: $("input[type=radio][name=equipante-sexo]:checked").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaEquipante();
                $("#modal-equipantes").modal("hide");
            }
        });
    }
}

function EditEquipante(id) {
    GetEquipante(id);
    $("#modal-equipantes").modal();
}


function GetEquipante(id) {
    $('.equipante-etiquetas').select2({ dropdownParent: $("#form-equipante") });
    if (id > 0) {
        $.ajax({
            url: "/Equipante/GetEquipante/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#equipante-id").val(data.Equipante.Id);
                $(`#equipante-nome`).val(data.Equipante.Nome);
                $(`#equipante-apelido`).val(data.Equipante.Apelido);
                $("#equipante-data-nascimento").val(moment(data.Equipante.DataNascimento, 'DD/MM/YYYY').format('DD/MM/YYYY'));
                $("#equipante-data-casamento").val(moment(data.Equipante.DataCasamento, 'DD/MM/YYYY').format('DD/MM/YYYY'));
                $(`#equipante-email`).val(data.Equipante.Email);
                setNumber('equipante-fone', data.Equipante.Fone)
                $(`input[type=radio][name=equipante-sexo][value=${data.Equipante.Sexo == 'Feminino' ? 2 : 1}]`).iCheck('check');
            }
        });
    }
    else {
        $("#equipante-id").val(0);
        $(`#equipante-nome`).val("");
        $(`#equipante-apelido`).val("");
        $("#equipante-data-nascimento").val("");
        $(`#equipante-email`).val("");
        setNumber('equipante-fone', '')
        $(`input[type=radio][name=equipante-sexo][value=1]`).iCheck('check');
    }

}

function ToggleSexo(id) {
    ConfirmMessage("Confirma a mudança de gênero?").then((result) => {
        if (result) {
            $.ajax({
                url: "/Equipante/ToggleSexo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaEquipante();
                }
            });
        }
    });
}
