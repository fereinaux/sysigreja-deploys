$(document).off('ready-ajax').on('ready-ajax', () => {
    CarregarTela()
    loadCampos()
})


function ExportarExcel() {
    $.ajax({
        url: "/Equipante/GetEquipantesDataTable?extract=excel",
        dataType: "text",
        data: {
            EventoId: SelectedEvent.Id,
            Equipe: [EquipeId],
            Campos: mapCampos(campos.map(campo => campo.Campo)).concat(["Quarto", "Equipe", "Situacao"]).flatMap(campo => campo).join(','),
            columns:
                campos.map(campo => ({ name: campo.Campo, search: { value: "" } }))
            ,
            order: [{
                column: 0,
                dir: "asc"
            }]
        },
        type: "POST",
        success: function (o) {
            window.location = `/Equipante/DownloadTempFile?fileName=${$('.equipe').text()} - ${$("#eventoid option:selected").text()}.xlsx&g=` + o;
        }

    })
}

EquipeId = null

function CarregarTabelaArquivos(id) {
    $.ajax({
        url: '/Arquivo/GetArquivosEquipeByEventoId',
        datatype: "json",
        data: { Equipe: id, IsComunEquipe: true, EventoId: SelectedEvent.Id, },
        type: "POST",
        success: (data) => {
            html = '';
            if (data.data.length == 0) {
                $('.col-arquivo').css('display', 'none')
            } else {
                $('.col-arquivo').css('display', 'block')
            }
            $('.qtd-arquivos').text(`Quantidade: ${data.data.length}`)
            $(data.data).each((i, element) => {
                html += `<tr>                        
                        <td>${element.Nome}</td>
                        <td>${GetButton('GetArquivo', element.Id, 'blue', 'fa-download', 'Download')}</td>
                    </tr>`;
            });
            $('.tbarquivos').html(html);

            $("td.fa").css("font-size", "25px");
            $("td").css("font-size", "15px");
            $("th").css("font-size", "15px");
        }
    });
}

function loadCampos() {
    $.ajax({
        url: "/Configuracao/GetCamposEquipeByEventoId/",
        data: { Id: SelectedEvent.Id },
        datatype: "json",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            campos = data.Campos
        }
    })
}

var membros = []

function CarregarTela() {
    $.ajax({
        url: '/Home/CoordenadorGet',
        datatype: "json",
        data: { eventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {
            EquipeId = data.result.EquipeEnum
            $('#col-equipe').css('display', data.result.EquipePai ? 'block' : 'none' )
            $('.equipe').text(data.result.Equipe)
            $('#btn-excel').prop('disabled', false)
            
            $('.qtd-membros').text(data.result.QtdMembros)
            membros = data.result.Membros;
            $('.membros').html(`${data.result.Membros.map(membro => `
<tr class="${membro.HasFoto ? 'foto' : ''}" data-id="${membro.Id}">
    <td data-label="Sexo"><span style="font-size:24px;" class="p-l-xs"> <i class="fa  ${membro.Sexo == "Masculino" ? "fa-male" : "fa-female"} " aria-hidden="true"></i></span></td>
    <td data-label="Nome">${membro.Nome}</td>
    <td data-label="Idade">${membro.Idade}</td>
    ${data.result.EquipePai ? `    <td data-label="Equipe">${membro.Equipe}</td>` : ""}
    
    <td data-label="Oferta"> <span style="font-size:24px;"> <i class="fa ${membro.Oferta ? "fa-check" : "fa-times"} " aria-hidden="true"></i></span></td>
    <td data-label="Faltas">${membro.Presenca.filter(x => x == false).length}</td>
    <td data-label="Contato" class="membro-fone">${membro.Fone}</td>
</tr>
`)}`)
            $(".membro-fone").each((i, element) => {
                $(element).html(`${GetIconWhatsApp($(element).text())}
                            ${GetIconTel($(element).text())}`);
            });
            $('#reuniaoid').html(`${data.result.Reunioes.map(reuniao => `
<option value="${reuniao.Id}">${reuniao.DataReuniao}</option>
`)}`)

            tippy(`.foto`, {
                content: '',
                allowHTML: true,
                followCursor: true,
                onTrigger: (instance, event) => {
                    instance.setContent(`<img id="foto-participante" style="width:200px" src="/Arquivo/GetFotoByEquipanteId/${$(event.target).data('id')}" />`)
                },
            });
            CarregarTabelaArquivos(data.result.EquipeEnum)
            CarregarTabelaPresenca()
        }
    });
}

function GetArquivo(id) {
    window.open(`/Arquivo/GetArquivo/${id}`)
}

function CarregarTabelaPresenca() {
    $.ajax({
        url: '/Home/GetPresenca',
        datatype: "json",
        data: { ReuniaoId: $("#reuniaoid").val() },
        type: "GET",
        success: (data) => {
            html = '';
            $(membros).each((i, element) => {
                html += `<tr>                        
                        <td>${element.Nome}</td>                        
                        <td class="membro-fone"><div class="checkbox i-checks-green"><label> <input type="checkbox" data-id="${element.EquipanteEventoId}" value="" ${data.presenca.indexOf(element.EquipanteEventoId) > 0 ? 'checked=""' : ''}> <i></i></label></div></td>
                    </tr>`;
            });

            $('.tbpresenca').html(html);

            $('.i-checks-green').iCheck({
                checkboxClass: 'icheckbox_square-green',
                radioClass: 'iradio_square-green'
            });
            $('.i-checks-green').on('ifClicked', function (event) {
                TogglePresenca($(event.target).data("id"));
            });

            $("td.fa").css("font-size", "25px");
            $("td").css("font-size", "15px");
            $("th").css("font-size", "15px");
        }
    });
}


function TogglePresenca(id) {
    $.ajax({
        url: "/Equipe/TogglePresenca/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            {
                EquipanteEventoId: id,
                ReuniaoId: $("#reuniaoid").val()
            })
    });
}