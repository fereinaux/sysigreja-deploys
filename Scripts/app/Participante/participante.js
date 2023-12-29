﻿
function CarregarTabelaParticipante(callbackFunction) {
    loadCampos(SelectedEvent.Id)
    casal = false
    handleParticipantes(casal)
    GetCrachas()
    $('#btn_bulk').css('display', 'none')
    if (SelectedEvent.Id != eventoId) {
        var filtros = getFiltros()
        $.ajax({
            url: '/Participante/GetPadrinhos',
            data: { eventoId: SelectedEvent.Id },
            datatype: "json",
            type: "GET",
            success: (result) => {
                eventoId = SelectedEvent.Id
                $("#participante-padrinhoid").html(`
${result.Padrinhos.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $("#participante-padrinhoid").val(filtros.PadrinhoId)
                $("#participante-padrinhoid").select2()
            }
        });

        $.ajax({
            url: '/Circulo/GetCirculos',
            data: { eventoId: SelectedEvent.Id },
            datatype: "json",
            type: "POST",
            success: (result) => {
                eventoId = SelectedEvent.Id
                $("#participante-circuloid").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Titulo || p.Cor}</option>`)}
`)
                $("#participante-circuloid").val(filtros.CirculoId)
                $("#participante-circuloid").select2()
            }
        });

        $.ajax({
            url: '/Quarto/GetQuartos',
            data: { eventoId: SelectedEvent.Id },
            datatype: "json",
            type: "POST",
            success: (result) => {
                eventoId = SelectedEvent.Id
                $("#participante-quartoid").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`)

                $("#participante-quartoid").val(filtros.QuartoId)
                $("#participante-quartoid").select2()
            }
        });

        $.ajax({
            url: '/Carona/GetCaronas',
            data: { eventoId: SelectedEvent.Id },
            datatype: "json",
            type: "POST",
            success: (result) => {
                eventoId = SelectedEvent.Id
                $("#participante-motoristaid").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Motorista}</option>`)}
`)
                $("#participante-motoristaid").val(filtros.CaronaId)
                $("#participante-motoristaid").select2()
            }
        });

        $.ajax({
            url: '/Etiqueta/GetEtiquetasByEventoId',
            data: { eventoId: SelectedEvent.Id },
            datatype: "json",
            type: "POST",
            success: (result) => {
                eventoId = SelectedEvent.Id
                $("#participante-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $("#participante-nao-marcadores").html(`
${result.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
                $('#participante-marcadores').val(filtros.Etiquetas);
                $('#participante-nao-marcadores').val(filtros.NaoEtiquetas);
                $('#participante-marcadores').select2();
                $('#participante-nao-marcadores').select2();
                $('#participante-status').val(filtros.Status);
                $('#participante-status').select2();

            }
        });

        $.ajax({
            url: "/Mensagem/GetMensagensByTipo/",
            datatype: "json",
            data: JSON.stringify(
                {
                    eventoId: SelectedEvent.Id, tipos: ["Participante"]
                }),
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            success: function (dataMsg) {
                $("#bulk-mensagem").html(`
${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`)

            }
        })

        $.ajax({
            url: "/Mensagem/GetMensagensByTipo/",
            datatype: "json",
            data: JSON.stringify(
                {
                    eventoId: SelectedEvent.Id, tipos: ["Contato"]
                }),
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            success: function (dataMsg) {
                $(".bulk-mensagem-contato").html(`
${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`)

            }
        })
    } else {
        setFiltros()
    }



    const tableParticipanteConfig = {
        language: languageConfig,
        searchDelay: 300,
        lengthMenu: [10, 30, 50, 100, 200],
        colReorder: true,
        serverSide: true,
        scrollX: true,
        scrollXollapse: true,
        orderCellsTop: true,
        fixedHeader: true,
        filter: true,
        createdRow: function (row, data, dataIndex) {
            if (data.HasFoto) {
                $(row).addClass('foto')
                $(row).data('id', data.Id)
            }
        },
        orderMulti: false,
        responsive: true, stateSave: true, stateSaveCallback: stateSaveCallback, stateLoadCallback: stateLoadCallback,
        destroy: true,
        dom: domConfig,
        buttons: getButtonsConfig(`Participantes ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}`),
        colReorder: {
            fixedColumnsLeft: 1
        },
        columns: [
            {
                data: "Id", name: "Id", title: '<div class="checkbox i-checks-green"><label> <input type="checkbox" id="select-all" data-id="all"> <i></i></label></div>', orderable: false, width: "2%", className: 'noVis',
                "render": function (data, type, row) {
                    return (row.Status != Cancelado && row.Status != Espera) ? GetCheckBox(data, false) : '';
                }
            },
            { data: "Sexo", name: "Sexo", title: "Sexo", visible: false, className: 'noVis' },
            {
                data: "Sexo", orderData: 0, name: "Sexo", title: "Sexo", className: "text-center", width: "5%",
                "render": function (data, type, row) {
                    var icon, cor
                    if (data == "Masculino") {
                        icon = "fa-male";
                        cor = "#0095ff";
                    }
                    else {
                        icon = "fa-female";
                        cor = "#ff00d4";
                    }
                    return `<span style = "font-size:18px;color:${cor};" class="p-l-xs pointer"> <i class="fa ${icon}" aria-hidden="true" title="${data}"></i></span >`;
                }
            },
            {
                data: "Nome", name: "Nome", title: "Nome", width: "25%", render: function (data, type, row) {
                    var reg = /^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/i
                    var titulo = row.Circulo?.trim()
                    var isCor = reg.test(titulo)
                    var isEmoji = titulo?.match(/\p{Emoji}+/gu)


                    return `<div>
  ${isCor ? `<span style="background-color:${row.Circulo.trim()}" class="dot"></span>` : (isEmoji ? titulo.match(/\p{Emoji}+/gu) : "")}
                        <span>${row.Nome}</br></span>
                        ${row.Etiquetas.map(etiqueta => `<span  class="badge m-r-xs" style="background-color:${etiqueta.Cor};color:#fff">${etiqueta.Nome}</span>`).join().replace(/,/g, '')}
                    </div>`
                }
            },
            { data: "Apelido", name: "Apelido", title: "Apelido", autoWidth: true, visible: false },
            { data: "Conjuge", title: "Cônjuge", name: "Conjuge", autoWidth: true, visible: false },
            { data: "NomeMae", name: "NomeMae", title: "NomeMae", autoWidth: true, visible: false },
            { data: "FoneMae", name: "FoneMae", title: "FoneMae", autoWidth: true, visible: false },
            { data: "NomePai", name: "NomePai", title: "NomePai", autoWidth: true, visible: false },
            { data: "FonePai", name: "FonePai", title: "FonePai", autoWidth: true, visible: false },
            { data: "NomeContato", name: "NomeContato", title: "NomeContato", autoWidth: true, visible: false },
            { data: "FoneContato", name: "FoneContato", title: "FoneContato", autoWidth: true, visible: false },
            { data: "NomeConvite", name: "NomeConvite", title: "NomeConvite", autoWidth: true, visible: false },
            { data: "FoneConvite", name: "FoneConvite", title: "FoneConvite", autoWidth: true, visible: false },
            { data: "Idade", name: "Idade", title: "Idade", width: "5%", },
            { data: "Padrinho", name: "Padrinho", title: "Padrinho", width: "25%" },
            {
                data: "Status", name: "Status", title: "Status", width: "5%", render: function (data, type, row) {
                    var data, cor
                    if (row.Checkin) {
                        data = "Presente";
                        cor = "warning";
                    }
                    else if (data === Confirmado)
                        cor = "primary";
                    else if (data === Cancelado)
                        cor = "danger";
                    else if (data === Inscrito)
                        cor = "success";
                    else if (data === Espera)
                        cor = "default";
                    return `<span style="font-size:13px" class="text-center label label-${cor}">${data}</span>`;
                }
            },
            { data: "Email", title: "Email", name: "Email", autoWidth: true, visible: false },
            { data: "CEP", title: "CEP", name: "CEP", autoWidth: true, visible: false },
            { data: "Logradouro", title: "Logradouro", name: "Logradouro", autoWidth: true, visible: false },
            { data: "Bairro", title: "Bairro", name: "Bairro", autoWidth: true, visible: false },
            { data: "Cidade", title: "Cidade", name: "Cidade", autoWidth: true, visible: false },
            { data: "Estado", title: "Estado", name: "Estado", autoWidth: true, visible: false },
            { data: "Numero", title: "Numero", name: "Numero", autoWidth: true, visible: false },

            { data: "Complemento", title: "Complemento", name: "Complemento", autoWidth: true, visible: false },
            { data: "Referencia", title: "Referência", name: "Referencia", autoWidth: true, visible: false },
            { data: "RestricaoAlimentar", title: "Restrição Alimentar", name: "RestricaoAlimentar", autoWidth: true, visible: false },
            { data: "Medicacao", title: "Medicação", name: "Medicacao", autoWidth: true, visible: false },
            { data: "Convenio", title: "Convênio", name: "Convenio", autoWidth: true, visible: false },
            { data: "DataCasamento", title: "Data de Casamento", name: "DataCasamento", autoWidth: true, visible: false },
            { data: "Hospitais", title: "Hospitais", name: "Hospitais", autoWidth: true, visible: false },
            { data: "Parente", title: "Parente", name: "Parente", autoWidth: true, visible: false },
            { data: "Quarto", title: "Quarto", name: "Quarto", autoWidth: true, visible: false },
            { data: "Motorista", title: "Motorista", name: "Motorista", autoWidth: true, visible: false },
            { data: "DataCadastro", visible: false, title: "Data Inscrição", name: "DataCadastro", autoWidth: true },
            {
                data: "Id", name: "Id", title: "Ações", orderable: false, width: "25%", className: 'noVis',
                "render": function (data, type, row) {
                    return row.Status != Cancelado && row.Status != Espera ?

                        `<form enctype="multipart/form-data" id="frm-vacina${data}" method="post" novalidate="novalidate">
${GetButton('Pagamentos', JSON.stringify({ Nome: row.Nome, Id: row.Id, Fone: row.Fone }), 'verde', 'far fa-money-bill-alt', 'Pagamentos')}
                                            
                        ${!row.HasFoto ? ` <label for="foto${data}" class="inputFile">
                                <span style="font-size:18px" class="text-mutted pointer p-l-xs"><i class="fa fa-camera" aria-hidden="true" title="Foto"></i></span>
                                <input accept="image/*" onchange='Foto(${JSON.stringify({ Nome: row.Nome, Id: row.Id })})' style="display: none;" class="custom-file-input inputFile" id="foto${data}" name="foto${data}" type="file" value="">
                            </label>`: `<span style="font-size:18px" class="text-success p-l-xs pointer" onclick="toggleFoto(${data})"><i class="fa fa-camera" aria-hidden="true" title="Foto"></i></span>`
                        }
                            ${GetAnexosButton('Anexos', data, row.QtdAnexos)}
                            ${GetIconWhatsApp(row.Fone)}
                            ${GetButton('EditParticipante', data, 'blue', 'fa-edit', 'Editar')}                               
                            ${GetButton('Opcoes', data, 'cinza', 'fas fa-info-circle', 'Opções')}                            
                            ${GetButton('CancelarInscricao', JSON.stringify({ Nome: row.Nome, Id: row.Id }), 'red', 'fa-times', 'Cancelar Inscrição')}
                    </form>`
                        : `${(SelectedEvent.Role == 'Admin') ? ` ${GetLabel('AtivarInscricao', JSON.stringify({ Nome: row.Nome, Id: row.Id }), 'green', 'Ativar Inscrição')}
${row.Status == Cancelado ? GetLabel('DeletarInscricao', JSON.stringify({ Nome: row.Nome, Id: row.Id }), 'red', 'Deletar Inscrição') : ''}` : ''}`
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

            tippy(`.foto`, {
                content: '',
                allowHTML: true,
                followCursor: true,
                onTrigger: (instance, event) => {
                    instance.setContent(`<img id="foto-participante" style="width:200px" src="/Arquivo/GetFotoByParticipanteId/${$(event.target).data('id')}" />`)
                },
            });
        },
        ajax: {
            url: '/Participante/GetParticipantesDatatable',
            data: getFiltros(),
            datatype: "json",
            type: "POST"
        }
    };

    tableParticipanteConfig.buttons.forEach(function (o) {
        if (o.extend === "excel") {
            let equipe = $('.title-circulo').first().text()
            o.action = function (e, dt, button, config) {
                var div = document.createElement("div");
                selected = false
                first = false
                div.innerHTML = `<div class="checkbox i-checks-green"  style="margin-left:20px;text-align:left">
<div class="row">
<div class="col-md-6 col-xs-12">
<label style="display:block"> <input id="select-all" type="checkbox" onChange="selectAll()" value="all"> Selecionar Todos <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="SequencialEvento"> Sequencial <i></i></label>
<label style="display:${$('#participante-nome').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Nome"> Nome <i></i></label>
<label style="display:${$('#participante-apelido').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Apelido"> Apelido <i></i></label>
<label style="display:${$('#participante-data-nascimento').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="DataNascimento"> Data de Nascimento <i></i></label>
<label style="display:${$('#participante-data-nascimento').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Idade"> Idade <i></i></label>
<label style="display:${$('#participante-sexo').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Sexo"> Sexo <i></i></label>
<label style="display:${$('#participante-email').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Email"> Email <i></i></label>
<label style="display:${$('#participante-fone').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Fone"> Fone <i></i></label>
<label style="display:${$('#participante-conjuge').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Conjuge"> Cônjuge <i></i></label>
<label style="display:${$('#participante-instagram').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Instagram"> Instagram <i></i></label>
<label style="display:${$('#participante-camisa').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Camisa"> Tamanho da Camisa <i></i></label>
<label style="display:${$('#participante-cep').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="CEP"> CEP <i></i></label>
<label style="display:${$('#participante-logradouro').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Logradouro"> Logradouro <i></i></label>
<label style="display:${$('#participante-bairro').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Bairro"> Bairro <i></i></label>
<label style="display:${$('#participante-cidade').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Cidade"> Cidade <i></i></label>
<label style="display:${$('#participante-estado').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Estado"> Estado <i></i></label>
<label style="display:${$('#participante-numero').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Numero"> Número <i></i></label>
<label style="display:${$('#participante-complemento').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Complemento"> Complemento <i></i></label>
<label style="display:${$('#participante-referencia').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Referencia"> Referência <i></i></label>
<label style="display:${$('#participante-parente').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Parente"> Parente <i></i></label>
</div>
<div class="col-md-6 col-xs-12">
<label style="display:${$('#participante-nomepai').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="NomePai"> Nome do Pai <i></i></label>
<label style="display:${$('#participante-fonepai').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="FonePai"> Fone do Pai <i></i></label>
<label style="display:${$('#participante-nomemae').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="NomeMae"> Nome da Mãe <i></i></label>
<label style="display:${$('#participante-fonemae').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="FoneMae"> Fone da Mãe <i></i></label>
<label style="display:${$('#participante-nomecontato').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="NomeContato"> Nome do Contato <i></i></label>
<label style="display:${$('#participante-fonecontato').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="FoneContato"> Fone do Contato <i></i></label>
<label style="display:${$('#participante-nomeconvite').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="NomeConvite"> Nome de quem Convidou <i></i></label>
<label style="display:${$('#participante-foneconvite').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="FoneConvite"> Fone de quem Convidou <i></i></label>
<label style="display:${$('#has-restricaoalimentar').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="RestricaoAlimentar"> Restrição Alimentar <i></i></label>
<label style="display:${$('#has-medicacao').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Medicacao"> Medicação<i></i></label>
<label style="display:${$('#has-alergia').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Alergia"> Alergia<i></i></label>
<label style="display:${$('#has-convenio').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Convenio"> Convênio <i></i></label>
<label style="display:${$('#has-convenio').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Hospitais"> Hospitais <i></i></label>
<label style="display:${$('#is-casado').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="DataCasamento"> Data de Casamento <i></i></label>
<label style="display:${$('#participante-congregacao').length > 0 ? 'block' : 'none'}"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Congregacao"> Congregação <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Situacao"> Situação <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel " type="checkbox" value="Circulo"><span class="title-circulo"> ${equipe} </span><i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Quarto"> Quarto <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Motorista"> Carona <i></i></label>

<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="Padrinho"> Padrinho <i></i></label>
<label style="display:block"> <input id="campos-excel" class="campos-excel" type="checkbox" value="DataCadastro"> Data/Hora Inscrição <i></i></label>
</div>
</div>
</div>`;
                CustomSwal({
                    title: "Excel de Participantes",
                    icon: "logo",
                    text: "Escolha os campos que deseja exportar",
                    content: div,
                    className: "button-center",
                    dangerMode: true,
                    buttons: {
                        export: {
                            text: "Exportar",
                            value: "export",
                            className: "btn-primary w-150 btn-all"
                        }
                    }
                }).then(res => {
                    if (res) {
                        const data = getFiltros()
                        data.campos = $('#campos-excel:checked').map(function () {
                            return $(this).val();
                        }).get().join();
                        $.post(
                            tableParticipanteConfig.ajax.url + "?extract=excel",
                            data,
                            function (o) {
                                window.location = `/Participante/DownloadTempFile?fileName=Participantes ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}.xlsx&g=` + o;
                            }
                        );
                    };
                })
            }
        }
    });

    if (!$.fn.DataTable.isDataTable('#table-participante')) {
        table = $("#table-participante").DataTable(tableParticipanteConfig);
    } else {

        table = $("#table-participante").DataTable()

        table.on('preXhr.dt', function (e, settings, data) {
            var filtros = getFiltros()
            Object.keys(filtros).forEach(k => data[k] = filtros[k])
        })

        table.draw()
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

function ConfirmFoto() {

    $("#main-cropper")
        .croppie("result", {
            type: "canvas",
            size: { height: 750, width: 500 }
        })
        .then(function (resp) {
            var dataToPost = new FormData();
            dataToPost.set('ParticipanteId', realista.Id)
            dataToPost.set('Arquivo', dataURLtoFile(resp, `Foto ${realista.Nome}.jpg`))
            dataToPost.set('IsFoto', true)
            $.ajax(
                {
                    processData: false,
                    contentType: false,
                    type: "POST",
                    data: dataToPost,
                    url: "/Arquivo/PostArquivo",
                    success: function () {
                        $("#modal-fotos").modal("hide");
                        CarregarTabelaParticipante()

                    }
                });
        });
}

function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime })

}


function Foto(row) {

    realista = row

    var input = $(`#foto${realista.Id}`)[0]

    const file = input.files[0];


    if (!file) {
        return;
    }

    new Compressor(file, {
        quality: 0.6,
        convertSize: 1000000,
        // The compression process is asynchronous,
        // which means you have to access the `result` in the `success` hook function.
        success(result) {

            var reader = new FileReader();

            reader.onload = function (e) {
                $("#main-cropper").croppie("bind", {
                    url: e.target.result
                });

            };

            reader.readAsDataURL(result);


            $("#modal-fotos").modal();
            var boundaryWidth = $("#fotocontent").width();

            var boundaryHeight = boundaryWidth * 1.5;

            var viewportWidth = boundaryWidth - (boundaryWidth / 100 * 25);

            var viewportHeight = boundaryHeight - (boundaryHeight / 100 * 25);

            $("#main-cropper").croppie({

                viewport: { width: viewportWidth, height: viewportHeight },
                boundary: { width: boundaryWidth, height: boundaryHeight },
                enableOrientation: true,
                showZoomer: true,
                enableExif: true,
                enableResize: false,

            });
        },
        error(err) {
            console.log(err.message);
        },
    });
}


function GetAnexosLancamento(id) {
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
            url: '/Arquivo/GetArquivosLancamento',
            data: { id: id ? id : $("#LancamentoIdModal").val() },
            datatype: "json",
            type: "POST"
        }
    };

    $("#table-anexos").DataTable(tableArquivoConfig);
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
            url: '/Arquivo/GetArquivosParticipante',
            data: { participanteid: id ? id : $("#ParticipanteIdModal").val() },
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
                    GetAnexos();
                }
            });
        }
    });
}

function toggleFoto(id) {
    ConfirmMessage("Essa ação removerá a foto, deseja continuar?").then((result) => {
        if (result) {
            $.ajax(
                {
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    url: "/Arquivo/DeleteFotoParticipante",
                    data: JSON.stringify(
                        {
                            Id: id
                        }),

                    success: function () {
                        CarregarTabelaParticipante()

                    }
                });
        }
    }
    )
}


function MakeEquipante(id) {
    ConfirmMessage("Transformar em Equipante?").then((result) => {
        if (result) {
            $.ajax(
                {
                    datatype: "json",
                    type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    url: "Participante/MakeEquipante",
                    data: JSON.stringify(
                        {
                            Id: id
                        }),

                    success: function () {


                    }
                });
        }
    })
}


function PostArquivo() {

    var dataToPost = new FormData($('#frm-upload-arquivo-modal')[0]);
    var filename = dataToPost.get('arquivo-modal').name
    if (realista.Nome) {
        var arquivo = new File([dataToPost.get('arquivo-modal')], 'Pagamento ' + realista.Nome + filename.substr(filename.indexOf('.')));
    } else {
        var arquivo = new File([dataToPost.get('arquivo-modal')], filename);
    }
    dataToPost.set('Arquivo', arquivo)
    dataToPost.set('ParticipanteId', dataToPost.get('ParticipanteIdModal'))
    dataToPost.set('LancamentoId', dataToPost.get('LancamentoIdModal'))
    $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            data: dataToPost,
            url: "/Arquivo/PostArquivo",
            success: function () {
                if (dataToPost.get('LancamentoIdModal')) {
                    GetAnexosLancamento();
                } else {
                    $('#arquivo-modal').val("")
                    GetAnexos();
                }

            }
        });
}

function Anexos(id) {
    $("#ParticipanteIdModal").val(id);
    $("#LancamentoIdModal").val('');
    GetAnexos(id);
    $("#modal-anexos").modal();
}

function AnexosLancamento(row) {
    $("#LancamentoIdModal").val(row.Id);
    $("#ParticipanteIdModal").val(row.ParticipanteId);
    GetAnexosLancamento(row.Id)
    $("#modal-pagamentos").modal('hide');
    $("#modal-anexos").modal();
}


$("#arquivo-modal").change(function () {
    PostArquivo();
});

$("#modal-anexos").on('hidden.bs.modal', function () {
    CarregarTabelaParticipante()
});

var tipoGlobal = 'pagamento'
$(`.${tipoGlobal}`).addClass('moldura-modal')
var destinatarioGlobal = 'realista'
$(`.${destinatarioGlobal}`).addClass('moldura-modal')

function enviar() {
    if (getNome(destinatarioGlobal)) {

        var windowReference = window.open('_blank');
        $.ajax({
            url: "/Mensagem/GetMensagem/",
            data: { Id: $("#msg-list").val() },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                var text = data.Mensagem.Conteudo.replaceAll('${Nome Contato}', getNome(destinatarioGlobal)).replaceAll('${Nome Participante}', getNome('realista')).replaceAll('${Link do MercadoPago}', `https://www.mercadopago.com.br/checkout/v1/payment/redirect/?preference-id=${realista.MercadoPagoPreferenceId}`);
                windowReference.location = GetLinkWhatsApp(getTelefone(destinatarioGlobal), text)

            }
        });
    } else {
        ErrorMessage('Você deve escolher o destinatário da mensagem')

    }


}

function select2(destinatario) {
    $('.realista').removeClass('moldura-modal')
    $('.mae').removeClass('moldura-modal')
    $('.pai').removeClass('moldura-modal')
    $('.convite').removeClass('moldura-modal')
    $('.contato').removeClass('moldura-modal')
    $('.realista').removeClass('moldura-modal')
    destinatarioGlobal = destinatario
    $(`.${destinatario}`).addClass('moldura-modal')
    $('.btn-ligar').attr("href", `tel:${getTelefone(destinatario)}`)
    getMensagensByTipo(destinatario == 'realista' ? ["Participante"] : ['Contato'])
}


function getNome(destinatario) {
    switch (destinatario) {
        case 'realista':
            return realista.Nome.trim()
            break;
        case 'mae':
            return realista.NomeMae.trim()
            break;
        case 'pai':
            return realista.NomePai.trim()
            break;
        case 'convite':
            return realista.NomeConvite.trim()
            break;
        case 'contato':
            return realista.NomeContato.trim()
            break;
        default:
            break;
    }
}

function getTelefone(destinatario) {
    switch (destinatario) {
        case 'realista':
            return realista.Fone
            break;
        case 'mae':
            return realista.FoneMae
            break;
        case 'pai':
            return realista.FonePai
            break;
        case 'convite':
            return realista.FoneConvite
            break;
        case 'contato':
            return realista.FoneContato
            break;
        default:
            break;
    }
}

function CarregarTabelaPagamentos(id) {
    const tablePagamentosConfig = {
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
            { data: "FormaPagamento", name: "FormaPagamento", autoWidth: true },
            { data: "Valor", name: "Valor", autoWidth: true },
            { data: "DataLancamento", name: "DataLancamento", autoWidth: true },
            { data: "Origem", name: "Origem", autoWidth: true },
            {
                data: "Id", name: "Id", orderable: false, width: "15%",
                "render": function (data, type, row) {
                    return `${GetAnexosButton('AnexosLancamento', JSON.stringify(row), row.QtdAnexos)}
                            ${GetButton('DeletePagamento', data, 'red', 'fa-trash', 'Excluir')}`;
                }
            }
        ],
        order: [
            [0, "asc"]
        ],
        ajax: {
            url: '/Lancamento/GetPagamentos',
            data: { ParticipanteId: id },
            datatype: "json",
            type: "POST"
        }
    };
    $("#table-pagamentos").DataTable(tablePagamentosConfig);
}

$(document).off('ready-ajax').on('ready-ajax', () => {
    realista = {}
    selected = false
    eventoId = 0
    HideMenu()
    CarregarTabelaParticipante();
    const searchParams = new URLSearchParams(window.location.search)
    const queryId = searchParams.get('Id')
    if (queryId) {
        Opcoes({ Id: queryId })
    }
});


function Pagamentos(row) {
    realista = row;
    $("#pagamentos-whatsapp").val(row.Fone);
    $("#pagamentos-valor").val($("#pagamentos-valor").data("valor-realista"));
    $("#pagamentos-origem").val('')
    $("#pagamentos-data").val(moment().format('DD/MM/YYYY'));
    $("#pagamentos-participanteid").val(row.Id);
    $("#pagamentos-meiopagamento").val($("#pagamentos-meiopagamento option:first").val());
    CarregarTabelaPagamentos(row.Id);
    $("#modal-pagamentos").modal();
}

$("#modal-pagamentos").on('hidden.bs.modal', function () {
    if (!$('#LancamentoIdModal').val()) {
        CarregarTabelaParticipante();
    }
})

function DeletePagamento(id) {
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
                    CarregarTabelaPagamentos($("#pagamentos-participanteid").val());
                }
            });
        }
    });
}

function ToggleSexo(id) {
    ConfirmMessage("Confirma a mudança de gênero?").then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/ToggleSexo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}

function CancelarInscricao(row) {
    ConfirmMessageCancelar(row.Nome).then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/CancelarInscricao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: row.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}


function DeletarInscricao(row) {
    ConfirmMessage(`Deseja deletar permanentemente a inscrição de ${row.Nome}?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/DeletarInscricao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: row.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}

function AtivarInscricao(row) {
    ConfirmMessage(`Deseja ativar a inscrição de ${row.Nome}?`).then((result) => {
        if (result) {
            $.ajax({
                url: "/Participante/AtivarInscricao/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        Id: row.Id
                    }),
                success: function () {
                    SuccessMesageOperation();
                    CarregarTabelaParticipante();
                }
            });
        }
    });
}

function PostPagamento() {
    if (ValidateForm(`#form-pagamento`)) {
        $.ajax({
            url: "/Lancamento/PostPagamento/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Origem: $("#pagamentos-origem").val(),
                    EventoId: SelectedEvent.Id,
                    ParticipanteId: $("#pagamentos-participanteid").val(),
                    Data: moment($("#pagamentos-data").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    MeioPagamentoId: $("#pagamentos-meiopagamento").val(),
                    ContaBancariaId: $('.contabancaria').hasClass('d-none') ? 0 : $("#pagamentos-contabancaria").val(),
                    Valor: Number($("#pagamentos-valor").val())
                }),
            success: function () {
                $("#pagamentos-origem").val('')
                $("#pagamentos-data").val(moment().format('DD/MM/YYYY'));
                CarregarTabelaPagamentos($("#pagamentos-participanteid").val());
                SuccessMesageOperation();
            }
        });
    }
}

function getMensagensByTipo(tipos) {
    $.ajax({
        url: "/Mensagem/GetMensagensByTipo/",
        data: JSON.stringify({ eventoId: SelectedEvent.Id, tipos: tipos }),
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        success: function (dataMsg) {
            $("#msg-list").html(`
${dataMsg.data.map(p => `<option value=${p.Id}>${p.Titulo}</option>`)}
`)

        }
    })
}

function Opcoes(id) {
    $('.participante-etiquetas').select2({ dropdownParent: $("#form-opcoes") });
    $.ajax({
        url: "/Participante/GetParticipante/",
        data: { Id: id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            realista = data.Participante
            $('.maetext').text(realista.NomeMae)
            $('.realista-nome').text(realista.Nome)
            $('.paitext').text(realista.NomePai)
            $('.convitetext').text(realista.NomeConvite)
            $('.contatotext').text(realista.NomeContato)
            $('#participante-obs').val(realista.Observacao)
            $('.btn-ligar').attr("href", `tel:${getTelefone('realista')}`)
            if ($('#modal-opcoes').is(":hidden")) {
                getMensagensByTipo(["Participante"])
            }

            $('#participante-etiquetas').val(data.Participante.EtiquetasList.map(etiqueta => etiqueta.Id))
            $('.participante-etiquetas').select2({ ...createTagOptions, dropdownParent: $("#form-opcoes") }).off('select2:select').on('select2:select', function (e) {
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
                            $(`#participante-marcadores,#participante-nao-marcadores`).append(otherOption).trigger('change');

                            $(`#participante-etiquetas`).find("option[value='" + e.params.data.id + "']").remove()
                            $(`#participante-etiquetas`).append(new Option(data.Etiqueta.Nome, data.Etiqueta.Id, true, true)).trigger('change');
                            e.params.data.newTag = false
                        }
                    });
                }

            });

            arrayData = table.data().toArray()
            let index = arrayData.findIndex(r => r.Id == id)

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

function GetParticipante(id) {
    if (id > 0) {
        $.ajax({
            url: "/Participante/GetParticipante/",
            data: { Id: id },
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $("#participante-id").val(data.Participante.Id);
                $(`#participante-nome`).val(data.Participante.Nome);
                $(`#participante-apelido`).val(data.Participante.Apelido);
                $("#participante-data-nascimento").val(moment(data.Participante.DataNascimento).format('DD/MM/YYYY'));
                $(`#participante-email`).val(data.Participante.Email);
                $(`#participante-nomepai`).val(data.Participante.NomePai);
                $(`#participante-camisa`).val(data.Participante.Camisa);
                $(`#participante-instagram`).val(data.Participante.Instagram);
                $(`#participante-nomemae`).val(data.Participante.NomeMae);
                $(`#participante-nomeconvite`).val(data.Participante.NomeConvite);

                setNumber('participante-fone', data.Participante.Fone)
                setNumber('participante-fonemae', data.Participante.FoneMae)
                setNumber('participante-fonepai', data.Participante.FonePai)
                setNumber('participante-foneconvite', data.Participante.FoneConvite)
                setNumber('participante-fonecontato', data.Participante.FoneContato)

                $(`#participante-nomecontato`).val(data.Participante.NomeContato);
                $(`#participante-restricaoalimentar`).val(data.Participante.RestricaoAlimentar);
                $(`#participante-medicacao`).val(data.Participante.Medicacao);

                if (data.Participante.HasMedicacao) {
                    $('.medicacao').removeClass('d-none')
                } else {
                    $('.medicacao').addClass('d-none')
                }

                if (data.Participante.HasConvenio) {
                    $('.convenio').removeClass('d-none')
                } else {
                    $('.convenio').addClass('d-none')
                }

                if (data.Participante.HasAlergia) {
                    $('.alergia').removeClass('d-none')
                } else {
                    $('.alergia').addClass('d-none')
                }

                if (data.Participante.HasRestricaoAlimentar) {
                    $('.restricaoalimentar').removeClass('d-none')
                } else {
                    $('.restricaoalimentar').addClass('d-none')
                }
                $(`#participante-convenio`).val(data.Participante.Convenio);
                $(`#participante-hospitais`).val(data.Participante.Hospitais);
                $(`input[type=radio][name=participante-iscasado][value=${data.Participante.IsCasado}]`).iCheck('check');
                $("#participante-data-casamento").val(moment(data.Participante.DataCasamento).format('DD/MM/YYYY'));
                $(`#participante-alergia`).val(data.Participante.Alergia);
                $(`#participante-parente`).val(data.Participante.Parente);
                $(`#participante-congregacao`).val(data.Participante.Congregacao);
                $(`input[type=radio][name=participante-sexo][value=${data.Participante.Sexo}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasparente][value=${data.Participante.HasParente}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasalergia][value=${data.Participante.HasAlergia}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasmedicacao][value=${data.Participante.HasMedicacao}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasconvenio][value=${data.Participante.HasConvenio}]`).iCheck('check');
                $(`input[type=radio][name=participante-hasrestricaoalimentar][value=${data.Participante.HasRestricaoAlimentar}]`).iCheck('check');
                $(`#participante-cep`).val(data.Participante.CEP);
                $(`#participante-logradouro`).val(data.Participante.Logradouro);
                $(`#participante-bairro`).val(data.Participante.Bairro);
                $(`#participante-cidade`).val(data.Participante.Cidade);
                $(`#participante-estado`).val(data.Participante.Estado);
                $(`#participante-numero`).val(data.Participante.Numero);
                $(`#participante-complemento`).val(data.Participante.Complemento);
                $(`#participante-conjuge`).val(data.Participante.Conjuge);
                $(`#participante-referencia`).val(data.Participante.Referencia);

                $(`#participante-latitude`).val((data.Participante.Latitude || '').replaceAll(',', '.'));
                $(`#participante-longitude`).val((data.Participante.Longitude || '').replaceAll(',', '.'));
                if ($('#map').length > 0) {
                    montarMapa()
                }
                $("#participante-numeracao").val(data.Participante.Numeracao);
            }
        });
    }
    else {
        $("#participante-id").val(0);
        $(`#participante-nome`).val("");
        $(`#participante-apelido`).val("");
        $("#participante-data-nascimento").val("");

        $(`#participante-email`).val("");
        $(`#participante-restricaoalimentar`).val("");
        $(`#participante-medicacao`).val("");
        $(`#participante-convenio`).val("");
        $(`#participante-hospitais`).val("");
        $(`#participante-alergia`).val("");
        $(`#participante-nomepai`).val("");
        $(`#participante-nomemae`).val("");
        $(`#participante-nomeconvite`).val("");
        $(`#participante-nomecontato`).val("");

        setNumber('participante-fone', "")
        setNumber('participante-fonemae', "")
        setNumber('participante-fonepai', "")
        setNumber('participante-foneconvite', "")
        setNumber('participante-fonecontato', "")

        $(`#participante-cep`).val("");
        $(`#participante-logradouro`).val("");
        $(`#participante-bairro`).val('');
        $(`#participante-cidade`).val('');
        $(`#participante-estado`).val('');
        $(`#participante-numero`).val('');
        $(`#participante-complemento`).val('');
        $(`#participante-conjuge`).val('');
        $(`#participante-referencia`).val('');
        $(`input[type=radio][name=participante-sexo][value=1]`).iCheck('check');
        $(`input[type=radio][name=participante-iscasado][value=false]`).iCheck('check');
        $("#participante-data-casamento").val("");
        $(`input[type=radio][name=participante-hasalergia][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-parente][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-hasmedicacao][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-hasconvenio][value=false]`).iCheck('check');
        $(`input[type=radio][name=participante-hasrestricaoalimentar][value=false]`).iCheck('check');
    }

    $('#has-medicacao').on('ifChecked', function (event) {
        $('.medicacao').removeClass('d-none');
        $("#participante-medicacao").addClass('required');
    });

    $('#not-medicacao').on('ifChecked', function (event) {
        $('.medicacao').addClass('d-none');
        $("#participante-medicacao").removeClass('required');
    });

    $('#has-convenio').on('ifChecked', function (event) {
        $('.convenio').removeClass('d-none');
        $("#participante-convenio").addClass('required');
    });

    $('#not-convenio').on('ifChecked', function (event) {
        $('.convenio').addClass('d-none');
        $("#participante-convenio").removeClass('required');
    });


    $('#has-alergia').on('ifChecked', function (event) {
        $('.alergia').removeClass('d-none');
        $("#participante-alergia").addClass('required');
    });

    $('#not-alergia').on('ifChecked', function (event) {
        $('.alergia').addClass('d-none');
        $("#participante-alergia").removeClass('required');
    });

    $('#has-restricaoalimentar').on('ifChecked', function (event) {
        $('.restricaoalimentar').removeClass('d-none');
        $("#participante-restricaoalimentar").addClass('required');
    });

    $('#not-restricaoalimentar').on('ifChecked', function (event) {
        $('.restricaoalimentar').addClass('d-none');
        $("#participante-restricaoalimentar").removeClass('required');
    });


    $('#has-parente').on('ifChecked', function (event) {
        $('.parente').removeClass('d-none');
        $("#participante-parente").addClass('required');
    });

    $('#not-parente').on('ifChecked', function (event) {
        $('.parente').addClass('d-none');
        $("#participante-parente").removeClass('required');
    });

    $('#is-casado').on('ifChecked', function (event) {
        $('.casado').removeClass('d-none');
        $("#participante-data-casamento").addClass('required');
    });

    $('#not-casado').on('ifChecked', function (event) {
        $('.casado').addClass('d-none');
        $("#participante-data-casamento").removeClass('required');
    });
}

function EditParticipante(id) {
    $(`#participante-nome`).prop("disabled", !(SelectedEvent.Role == 'Admin'));
    $(`#participante-logradouro`).prop("disabled", true);
    $(`#participante-bairro`).prop("disabled", true);
    $(`#participante-cidade`).prop("disabled", true);
    $(`#participante-estado`).prop("disabled", true);
    GetParticipante(id);
    $("#modal-participantes").modal();
}


function PostParticipante() {
    if (ValidateForm(`#form-participante`)) {
        $.ajax({
            url: "/Inscricoes/PostInscricao/",
            datatype: "json",
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(
                {
                    Id: $("#participante-id").val(),
                    EventoId: SelectedEvent.Id,
                    Nome: $(`#participante-nome`).val(),
                    Apelido: $(`#participante-apelido`).val(),
                    Instagram: $('#participante-instagram').val(),
                    DataNascimento: moment($("#participante-data-nascimento").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    Email: $(`#participante-email`).val(),
                    NomePai: $(`#participante-nomepai`).val(),
                    Fone: getNumber('participante-fone'),
                    FonePai: getNumber('participante-fonepai'),
                    FoneMae: getNumber('participante-fonemae'),
                    FoneConvite: getNumber('participante-foneconvite'),
                    FoneContato: getNumber('participante-fonecontato'),
                    NomeConvite: $(`#participante-nomeconvite`).val(),
                    NomeContato: $(`#participante-nomecontato`).val(),
                    NomeMae: $(`#participante-nomemae`).val(),
                    Camisa: $(`#participante-camisa`).val(),
                    CEP: $(`#participante-cep`).val(),
                    Logradouro: $(`#participante-logradouro`).val(),
                    Bairro: $(`#participante-bairro`).val(),
                    Cidade: $(`#participante-cidade`).val(),
                    Estado: $(`#participante-estado`).val(),
                    Numero: $(`#participante-numero`).val(),
                    Complemento: $(`#participante-complemento`).val(),
                    Conjuge: $(`#participante-conjuge`).val(),
                    Referencia: $(`#participante-referencia`).val(),
                    Latitude: $(`#participante-latitude`).val(),
                    Longitude: $(`#participante-longitude`).val(),
                    HasRestricaoAlimentar: $("input[type=radio][name=participante-hasrestricaoalimentar]:checked").val(),
                    RestricaoAlimentar: $(`#participante-restricaoalimentar`).val(),
                    HasMedicacao: $("input[type=radio][name=participante-hasmedicacao]:checked").val(),
                    Medicacao: $(`#participante-medicacao`).val(),
                    HasAlergia: $("input[type=radio][name=participante-hasalergia]:checked").val(),
                    Alergia: $(`#participante-alergia`).val(),
                    HasConvenio: $("input[type=radio][name=participante-hasconvenio]:checked").val(),
                    Convenio: $(`#participante-convenio`).val(),
                    Hospitais: $(`#participante-hospitais`).val(),
                    IsCasado: $("input[type=radio][name=participante-iscasado]:checked").val(),
                    DataCasamento: moment($("#participante-data-casamento").val(), 'DD/MM/YYYY', 'pt-br').toJSON(),
                    HasParente: $("input[type=radio][name=participante-hasparente]:checked").val(),
                    Parente: $(`#participante-parente`).val(),
                    Congregacao: $(`#participante-congregacao`).val(),
                    Sexo: $("input[type=radio][name=participante-sexo]:checked").val()
                }),
            success: function () {
                SuccessMesageOperation();
                CarregarTabelaParticipante();
                $("#modal-participantes").modal("hide");
            }
        });
    }
}



function previous() {
    PostInfo(function () {
        arrayData = table.data().toArray()
        let index = arrayData.findIndex(r => r.Id == realista.Id)
        if (index > 0) {
            Opcoes(arrayData[index - 1])
        }
    })
}

function next() {
    PostInfo(function () {
        arrayData = table.data().toArray()
        let index = arrayData.findIndex(r => r.Id == realista.Id)
        if (index + 1 < arrayData.length) {
            Opcoes(arrayData[index + 1])
        }
    })
}


$("#modal-opcoes").on('hidden.bs.modal', function () {
    PostInfo()
});

function PostInfo(callback) {
    $.ajax({
        url: "/Participante/PostInfo/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                Id: realista.Id,
                Observacao: $('#participante-obs').val(),
                MsgPagamento: $(`#participante-msgpagamento`).prop("checked"),
                MsgNoitita: $(`#participante-msgnoitita`).prop("checked"),
                MsgGeral: $(`#participante-msggeral`).prop("checked"),
                MsgFoto: $(`#participante-msgfoto`).prop("checked"),
                Etiquetas: $('.participante-etiquetas').val()
            }),
        success: function () {
            CarregarTabelaParticipante(callback)
        }
    });
}

function montarMapa() {
    markerLayer.getLayers().forEach(mark => mark.remove())
    var marker = L.marker([$(`#participante-latitude`).val().toString(), $(`#participante-longitude`).val().toString()], { icon: getIcon('vermelho') }).addTo(markerLayer);
    marker.bindPopup(`<h4>${$(`#participante-nome`).val()}</h4>`).openPopup();
    $('.div-map').css('display', 'block')
    map.setView([$(`#participante-latitude`).val(), $(`#participante-longitude`).val()], 18);
}

function verificaCep(input) {
    let cep = $(input).val()
    if (cep.length == 9) {
        $.ajax({
            url: `https://api.iecbeventos.com.br/api/cep/${cep.replaceAll('-', '')}`,
            datatype: "json",
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                $(`#participante-logradouro`).prop("disabled", typeof (data.logradouro) == "string");
                $(`#participante-logradouro`).val(data.logradouro)
                $(`#participante-bairro`).prop("disabled", typeof (data.bairro) == "string");
                $(`#participante-bairro`).val(data.bairro)
                $(`#participante-cidade`).prop("disabled", typeof (data.localidade) == "string");
                $(`#participante-cidade`).val(data.localidade)
                $(`#participante-estado`).prop("disabled", typeof (data.uf) == "string");
                $(`#participante-estado`).val(data.uf)
                $(`#participante-latitude`).val(data.lat)
                $(`#participante-longitude`).val(data.lon)
                montarMapa()
            }
        })
    }
}

function selectAll() {
    selected = !selected
    $('.campos-excel').attr('checked', selected)
}

$('body').on('DOMNodeInserted', '.swal-overlay', function () {
    tippy('.btn-export', {
        content: `Exporta os campos selecionados`,
        interactive: true,
        allowHTML: true,
        zIndex: 10005,
        trigger: 'mouseenter'
    });
});


function onLoadCampos() {
    $('button span:contains("Apelido")').parent().css('display', $('#participante-apelido').length > 0 ? 'block' : 'none')
    $('button span:contains("Cônjuge")').parent().css('display', $('#participante-conjuge').length > 0 ? 'block' : 'none')
    $('button span:contains("Idade")').parent().css('display', $('#participante-data-nascimento').length > 0 ? 'block' : 'none')
    $('button span:contains("CEP")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Logradouro")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Bairro")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Cidade")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Numero")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Complemento")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Referência")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Estado")').parent().css('display', $('#participante-cep').length > 0 ? 'block' : 'none')
    $('button span:contains("Restrição Alimentar")').parent().css('display', $('#participante-hasrestricao').length > 0 ? 'block' : 'none')
    $('button span:contains("Medicação")').parent().css('display', $('#participante-hasmedicacao').length > 0 ? 'block' : 'none')
    $('button span:contains("Convênio")').parent().css('display', $('#participante-hasconvenio').length > 0 ? 'block' : 'none')
    $('button span:contains("Casado")').parent().css('display', $('#participante-iscasado').length > 0 ? 'block' : 'none')
    $('button span:contains("Parente")').parent().css('display', $('#participante-hasparente').length > 0 ? 'block' : 'none')
    $('button span:contains("Hospitais")').parent().css('display', $('#participante-hasconvenio').length > 0 ? 'block' : 'none')
    $('button span:contains("Nome da Mãe")').parent().css('display', $('#participante-nomemae').length > 0 ? 'block' : 'none')
    $('button span:contains("Fone da Mãe")').parent().css('display', $('#participante-nomemae').length > 0 ? 'block' : 'none')
    $('button span:contains("Nome do Pai")').parent().css('display', $('#participante-nomepai').length > 0 ? 'block' : 'none')
    $('button span:contains("Fone do Pai")').parent().css('display', $('#participante-nomepai').length > 0 ? 'block' : 'none')
    $('button span:contains("Nome do Contato")').parent().css('display', $('#participante-nomecontato').length > 0 ? 'block' : 'none')
    $('button span:contains("Fone do Contato")').parent().css('display', $('#participante-nomecontato').length > 0 ? 'block' : 'none')
    $('button span:contains("Nome do Convite")').parent().css('display', $('#participante-nomeconvite').length > 0 ? 'block' : 'none')
    $('button span:contains("Fone do Convite")').parent().css('display', $('#participante-nomeconvite').length > 0 ? 'block' : 'none')
}

function loadCampos() {
    $.ajax({
        url: "/Configuracao/GetCamposByEventoId/",
        data: { Id: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            campos = data.Campos
            $('button span:contains("Apelido")').parent().css('display', campos.find(x => x.Campo == "Apelido") ? 'block' : 'none')
            $('button span:contains("CEP")').parent().css('display', campos.find(x => x.Campo == "CEP") ? 'block' : 'none')
            $('.contato-convite').css('display', campos.find(x => x.Campo == "Dados do Convite") ? 'block' : 'none')
            $('.contato-pai').css('display', campos.find(x => x.Campo == "Dados do Pai") ? 'block' : 'none')
            $('.contato-contato').css('display', campos.find(x => x.Campo == "Dados do Contato") ? 'block' : 'none')
            $('.contato-mae').css('display', campos.find(x => x.Campo == "Dados da Mãe") ? 'block' : 'none')
            $('.campos-cadastro').html(`
          <input type="hidden" id="participante-id" />
<div class="col-sm-12" style="display: flex">
<img id="logo-relatorio-participante" style="max-width: 60%;
display:none;
    max-height: 100px;        margin: 20px auto auto auto;" src="">
 </div>
${campos.find(x => x.Campo == "Nome completo") ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome</h5>

                                <input type="text" class="form-control required" id="participante-nome" data-field="Nome" />
                            </div>` : ""}

${campos.find(x => x.Campo == "Apelido") ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Apelido</h5>

                                <input type="text" class="form-control required" id="participante-apelido" data-field="Apelido" />
                            </div>` : ""}
${campos.find(x => x.Campo == 'Data Nascimento') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Data de Nascimento</h5>

                                <input type="text" class="form-control full-date required" id="participante-data-nascimento" data-field="Data de Nascimento" />
                            </div>` : ''}
${campos.find(x => x.Campo == 'Gênero') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Sexo</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="participante-sexo" checked="" value="1" name="participante-sexo"> <i></i> Masculino </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="participante-sexo" value="2" name="participante-sexo"> <i></i> Feminino </label></div>
                            </div>` : ''}
${campos.find(x => x.Campo == 'Email') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Email</h5>

                                <input type="email" class="form-control" id="participante-email" data-field="Email" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Fone') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>WhatsApp</h5>

                                <input type="text" class="form-control fone" id="participante-fone" data-field="WhatsApp" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Cônjuge') ? `  <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Cônjuge</h5>

                                <input type="text" class="form-control required" id="participante-conjuge" data-field="Cônjuge" />
                            </div>` : ''}


${campos.find(x => x.Campo == 'Instagram') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Instagram</h5>

                                <input type="text" class="form-control" id="participante-instagram" data-field="Apelido" />
                            </div>` : ''}

     ${campos.find(x => x.Campo == 'Camisa') ? `        <div class="col-sm-12 p-w-md m-t-md text-center">
                            <h5>Tamanho da Camisa</h5>

                            <select class="form-control" id="participante-camisa">
 <option value="8">8</option>
                                    <option value="10">10</option>
                                    <option value="12">12</option>
                                    <option value="14">14</option>
                                <option value="PP">PP</option>
                                <option value="P">P</option>
                                <option value="M">M</option>
                                <option value="G">G</option>
                                <option value="GG">GG</option>
                                <option value="XGG">XGG</option>
                            </select>
                        </div>` : ''}

${campos.find(x => x.Campo == 'Endereço') ? `<div class="col-sm-3 p-w-md m-t-md text-center">
                                <h5>CEP</h5>

                                <input type="text" class="form-control required cep" id="participante-cep" data-field="CEP" onkeyup="verificaCep(this)" />
                                <input type="hidden" id="participante-latitude" />
                                <input type="hidden" id="participante-longitude" />
                            </div>

                            <div class="col-sm-9 p-w-md m-t-md text-center">
                                <h5>Logradouro</h5>

                                <input type="text" class="form-control required" disabled id="participante-logradouro" data-field="Logradouro" />
                            </div>

                            <div class="col-sm-5 p-w-md m-t-md text-center">
                                <h5>Bairro</h5>

                                <input type="text" class="form-control required" disabled id="participante-bairro" data-field="Bairro" />
                            </div>

                            <div class="col-sm-5 p-w-md m-t-md text-center">
                                <h5>
                                    Cidade
                                </h5>

                                <input type="text" class="form-control required" disabled id="participante-cidade" data-field="Cidade" />
                            </div>

                            <div class="col-sm-2 p-w-md m-t-md text-center">
                                <h5>
                                    Estado
                                </h5>

                                <input type="text" class="form-control required" disabled id="participante-estado" data-field="Estado" />
                            </div>

                            <div class="col-sm-4 p-w-md m-t-md text-center">
                                <h5>
                                    Número
                                </h5>

                                <input type="text" class="form-control" id="participante-numero" data-field="Número" />
                            </div>


                            <div class="col-sm-8 p-w-md m-t-md text-center">
                                <h5>
                                    Complemento
                                </h5>

                                <input type="text" class="form-control" id="participante-complemento" data-field="Complemento" />
                            </div>


                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>
                                    Ponto de Referência
                                </h5>

                                <input type="text" class="form-control" id="participante-referencia" data-field="Ponto de Referência" />
                            </div>

                            <div class="col-sm-12 p-w-md m-t-md text-center div-map" style="display: none">
                                <div id="map" style="height:300px;">
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados da Mãe') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome da Mãe</h5>

                                <input type="text" class="form-control required" id="participante-nomemae" data-field="Nome da Mã" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone da Mãe</h5>

                                <input type="text" class="form-control fone" id="participante-fonemae" data-field="Fone da Mãe"  />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Pai') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Nome do Pai</h5>

                                <input type="text" class="form-control required" id="participante-nomepai" data-field="Nome do Pai" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone do Pai</h5>

                                <input type="text" class="form-control fone" id="participante-fonepai" data-field="Fone do Pai"  />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Contato') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Pessoa de Contato</h5>

                                <input type="text" class="form-control required" id="participante-nomecontato" data-field="Pessoa de Contato" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone do Contato</h5>

                                <input type="text" class="form-control fone" id="participante-fonecontato" data-field="Fone do Contato"  />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Dados do Convite') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Pessoa que Convidou</h5>

                                <input type="text" class="form-control required" id="participante-nomeconvite" data-field="Pessoa de Convite" />
                            </div>
                            <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Fone de quem convidou</h5>

                                <input type="text" class="form-control fone" id="participante-foneconvite" data-field="Fone do Convite"  />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Parente') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem algum Parente fazendo o ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-parente" value="true" name="participante-hasparente"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-parente" checked="" value="false" name="participante-hasparente"> <i></i> Não </label></div>

                                <div class="parente d-none">
                                    <h5>Nome do Parente</h5>
                                    <input type="text" class="form-control" id="participante-parente" data-field="Nome do Parente" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Congregação') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Participa de qual Congregação?</h5>
                                    <input type="text" class="form-control" id="participante-congregacao" data-field="Congregação" />
                            </div>` : ''}

${campos.find(x => x.Campo == 'Convênio') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Possui convênio médico?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-convenio" value="true" name="participante-hasconvenio"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-convenio" checked="" value="false" name="participante-hasconvenio"> <i></i> Não </label></div>

                                <div class="convenio d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-convenio" data-field="Convênio" />
                     <h5>Quais hospitais atendem?</h5>
                                <input type="text" class="form-control" id="participante-hospitais" data-field="Hospitais" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Casamento') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>É casado(a)?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="is-casado" value="true" name="participante-iscasado"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-casado" checked="" value="false" name="participante-iscasado"> <i></i> Não </label></div>

                                <div class="casado d-none">
                                    <h5>Qual a sua data de casamento?</h5>
                                   <input type="text" class="form-control full-date" id="participante-data-casamento" data-field="Data de Casamento" />
                    
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Medicação') ? ` <div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Toma alguma medicação?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-medicacao" value="true" name="participante-hasmedicacao"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-medicacao" checked="" value="false" name="participante-hasmedicacao"> <i></i> Não </label></div>

                                <div class="medicacao d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-medicacao" data-field="Medicação" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Alergia') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem alguma alergia?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-alergia" value="true" name="participante-hasalergia"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-alergia" checked="" value="false" name="participante-hasalergia"> <i></i> Não </label></div>

                                <div class="alergia d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-alergia" data-field="Alergia" />
                                </div>
                            </div>` : ''}

${campos.find(x => x.Campo == 'Restrição Alimentar') ? `<div class="col-sm-12 p-w-md m-t-md text-center">
                                <h5>Tem alguma restrição alimentar?</h5>

                                <div class="radio i-checks-green inline"><label> <input type="radio" id="has-restricaoalimentar" value="true" name="participante-hasrestricaoalimentar"> <i></i> Sim </label></div>
                                <div class="radio i-checks-green inline"><label> <input type="radio" id="not-restricaoalimentar" checked="" value="false" name="participante-hasrestricaoalimentar"> <i></i> Não </label></div>

                                <div class="restricaoalimentar d-none">
                                    <h5>Qual?</h5>
                                    <input type="text" class="form-control" id="participante-restricaoalimentar" data-field="Restrição Alimentar" />
                                </div>
                            </div>` : ''}
`)


            initInputs()


            if ($('#map').length > 0) {

                map = initMap('map')
                markerLayer = createMarkerLayer(map)


            }



        }
    });
}


async function loadCrachaImprimir(Foto) {
    let ids = getCheckedIds()
    const result = await $.ajax(
        {
            processData: false,
            contentType: false,
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify($.extend(ids.length > 0 ? { Ids: ids, Foto: Foto, EventoId: SelectedEvent.Id } : getFiltros(Foto), $("#table-participante").DataTable().ajax.params())),
            url: "Participante/GetCracha",
        });

    return result.data
}

function setFiltros() {
    localStorage.setItem(`filtros-participante${SelectedEvent.Id}`, JSON.stringify({
        EventoId: SelectedEvent.Id,
        CirculoId: $("#participante-circuloid").val(),
        PadrinhoId: $("#participante-padrinhoid").val(),
        Status: $("#participante-status").val(),
        Etiquetas: $("#participante-marcadores").val(),
        NaoEtiquetas: $("#participante-nao-marcadores").val(),
        QuartoId: $("#participante-quartoid").val(),
        CaronaId: $("#participante-motoristaid").val(),
        Foto: Foto
    }))
}

function getFiltros(Foto) {
    var filtros = JSON.parse(localStorage.getItem(`filtros-participante${SelectedEvent.Id}`))
    if (!filtros) {
        setFiltros()
        return JSON.parse(localStorage.getItem(`filtros-participante${SelectedEvent.Id}`))
    } else return filtros

}

function checkBulkActions() {
    if ($('input[type=checkbox][id!=select-all]:checked').length > 0) {
        $('#btn_bulk').css('display', 'inline-block')
    } else {
        $('#btn_bulk').css('display', 'none')
    }
}

async function openBulkActions() {
    let ids = getCheckedIds()
    const quartos = await $.ajax({
        url: '/Quarto/GetQuartos',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id, Tipo: 1 },
        type: "POST"
    })

    const caronas = await $.ajax({
        url: '/Carona/GetCaronas',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id, Tipo: 1 },
        type: "POST"
    })

    const circulos = await $.ajax({
        url: '/Circulo/GetCirculos',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST"
    })

    const padrinhos = await $.ajax({
        url: '/Padrinho/GetPadrinhos',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "POST"
    })

    const etiquetas = await $.ajax({
        url: '/Etiqueta/GetEtiquetasByEventoId',
        data: { eventoId: SelectedEvent.Id },
        datatype: "json",
        type: "POST",
    });

    $("#bulk-circulo").html(`
<option value=999>Selecione</option>
        ${circulos.data.map(p => `<option value=${p.Id}>${p.Titulo || p.Cor}</option>`)}
        `)

    $("#bulk-padrinho").html(`
<option value=999>Selecione</option>
        ${padrinhos.data.map(p => `<option value=${p.Id}>${p.Padrinho}</option>`)}
        `)

    if (caronas.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length).length == 0) {
        $('.carona').css('display', 'none')
    } else {
        $('.carona').css('display', 'block')
    }

    $("#bulk-carona").html(`
<option value=999>Selecione</option>
        ${caronas.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length).map(p => `<option value=${p.Id}>${p.Motorista}</option>`)}
        `)

    arrayData = table.data().toArray()
    let idsM = ids.filter(x => arrayData.find(y => y.Id == x && y.Sexo == "Masculino"))
    let idsF = ids.filter(x => arrayData.find(y => y.Id == x && y.Sexo == "Feminino"))

    if ((quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsM.length && x.Sexo == "Masculino").length == 0) || idsM.length == 0) {
        $('.quarto-m').css('display', 'none')
    } else {
        $('.quarto-m').css('display', 'block')
    }

    $("#bulk-quarto-m").html(`
<option value=999>Selecione</option>
        ${quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsM.length && x.Sexo == "Masculino").map(p => `<option value=${p.Id}>${p.Titulo} ${p.Equipante}</option>`)}
        `)

    if ((quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsF.length && x.Sexo == "Feminino").length == 0) || idsF.length == 0) {
        $('.quarto-f').css('display', 'none')
    } else {
        $('.quarto-f').css('display', 'block')
    }

    $("#bulk-quarto-f").html(`
<option value=999>Selecione</option>
        ${quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= idsF.length && x.Sexo == "Feminino").map(p => `<option value=${p.Id}>${p.Titulo} ${p.Equipante}</option>`)}
        `)


    if (quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length && x.Sexo == "Misto").length == 0) {
        $('.quarto-misto').css('display', 'none')
    } else {
        $('.quarto-misto').css('display', 'block')
    }

    $("#bulk-quarto-misto").html(`
<option value=999>Selecione</option>
        ${quartos.data.filter(x => x.CapacidadeInt - x.Quantidade >= ids.length && x.Sexo == "Misto").map(p => `<option value=${p.Id}>${p.Titulo} ${p.Equipante}</option>`)}
        `)

    $("#bulk-add-etiqueta").html(`
<option value=999>Selecione</option>
${etiquetas.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)
    $("#bulk-remove-etiqueta").html(`
<option value=999>Selecione</option>
${etiquetas.data.map(p => `<option value=${p.Id}>${p.Nome}</option>`)}
`)

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

        if (($("#bulk-quarto-m").val() != 999) && arrayData.find(x => x.Id == id).Sexo == "Masculino") {
            arrPromises.push($.ajax({
                url: "/Quarto/ChangeQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-quarto-m").val(),
                        EventoId: SelectedEvent.Id,
                        tipo: 1
                    }),
            }))
        }

        if (($("#bulk-quarto-f").val() != 999) && arrayData.find(x => x.Id == id).Sexo == "Feminino") {
            arrPromises.push($.ajax({
                url: "/Quarto/ChangeQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-quarto-f").val(),
                        EventoId: SelectedEvent.Id,
                        tipo: 1
                    }),
            }))
        }

        if (($("#bulk-quarto-misto").val() != 999)) {
            arrPromises.push($.ajax({
                url: "/Quarto/ChangeQuarto/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-quarto-misto").val(),
                        EventoId: SelectedEvent.Id,
                        tipo: 1
                    }),
            }))
        }

        if ($("#bulk-circulo").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Circulo/ChangeCirculo/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-circulo").val()
                    }),
            }))
        }

        if ($("#bulk-carona").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Carona/ChangeCarona/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-carona").val()
                    }),

            }))
        }


        if ($("#bulk-add-etiqueta").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Etiqueta/AddEtiqueta/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        destinoId: id,
                        etiquetaId: $("#bulk-add-etiqueta").val(),
                        tipo: 1
                    }),

            }))
        }

        if ($("#bulk-remove-etiqueta").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Etiqueta/RemoveEtiqueta/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        destinoId: id,
                        etiquetaId: $("#bulk-remove-etiqueta").val(),
                        tipo: 1
                    }),

            }))
        }

        if ($("#bulk-padrinho").val() != 999) {
            arrPromises.push($.ajax({
                url: "/Padrinho/ChangePadrinho/",
                datatype: "json",
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(
                    {
                        ParticipanteId: id,
                        DestinoId: $("#bulk-padrinho").val()
                    }),

            }))
        }
    })

    await Promise.all(arrPromises);
    SuccessMesageOperation();
    CarregarTabelaParticipante()
}


async function printFicha() {
    var element = document.getElementById('form-participante');
    $('#form-participante').find('.col-sm-12').addClass('col-sm-6')
    $('#logo-relatorio-participante').attr('src', `/Arquivo/GetArquivo/${SelectedEvent.LogoRelatorioId}`)
    $('#logo-relatorio-participante').css('display', 'block')
    changeMap = $('#map').css('display') == 'block'
    $('#map').css('display', 'none')
    html2pdf().set({ margin: 0.5, jsPDF: { unit: 'cm' } }).from(element).toPdf().get('pdf').then(function (pdfObj) {
        // pdfObj has your jsPDF object in it, use it as you please!
        // For instance (untested):
        pdfObj.autoPrint();
        if (changeMap) {
            $('#map').css('display', 'block')
        }
        $('#logo-relatorio-participante').css('display', 'none')
        $('#form-participante').find('.col-sm-12').removeClass('col-sm-6')
        window.open(pdfObj.output('bloburl'), '_blank');
    });
}

async function loadMensagens(tipo) {

    let ids = getCheckedIds()
    let msgId

    switch (tipo) {
        case 'mae':
            msgId = $("#bulk-mensagem-mae").val();
            tipo = "Mae"
            break;
        case 'pai':
            msgId = $("#bulk-mensagem-pai").val();
            tipo = "Pai"
            break;
        case 'contato':
            msgId = $("#bulk-mensagem-contato").val();
            tipo = "Contato"
            break;
        case 'convite':
            msgId = $("#bulk-mensagem-convite").val();
            tipo = "Convite"
            break;
        default:
            msgId = $("#bulk-mensagem").val()
            tipo = ""
            break;
    }

    await enviarMensagens(msgId, ids, tipo, 'Participante')

}

