$(document).ready(() => {
   
    $('#eventoid').val($('#eventoid option:first').val())
    CarregarTela()
});

function CarregarTela() {
    $.ajax({
        url: '/Home/CoordenadorGet',
        datatype: "json",
        data: { eventoId: $('#eventoid').val() },
        type: "GET",
        success: (data) => {
            $('.equipe').text(data.result.Equipe)
            $('#img-logo').attr('src', `data:image/png;base64,${data.result.Configuracao.Logo}`)
            $('.qtd-membros').text(data.result.QtdMembros)
            $('.navy-bg').css('background-color', data.result.Configuracao.Cor)
            $('.membros').html(`${data.result.Membros.map(membro => `
<tr>
    <td data-label="Sexo"><span style="font-size:24px;" class="p-l-xs"> <i class="fa  ${membro.Sexo == "Masculino" ? "fa-male" : "fa-female"} " aria-hidden="true"></i></span></td>
    <td data-label="Nome">${membro.Foto ? `<img src="data:image/png;base64,${membro.Foto}" class="avatar-membro"/>` : ''}${membro.Nome}</td>
    <td data-label="Idade">${membro.Idade}</td>
    <td data-label="Oferta"> <span style="font-size:24px;"> <i class="fa ${membro.Oferta ? "fa-check" : "fa-times"} " aria-hidden="true"></i></span></td>
    <td data-label="Faltas">${membro.Faltas}</td>
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
            CarregarTabelaArquivos(data.result.EquipeEnum, data.result.Configuracao.Id)
            CarregarTabelaPresenca()
        }
    });
}

function CarregarTabelaArquivos(id, configID) {
    $.ajax({
        url: '/Arquivo/GetArquivosEquipe',
        datatype: "json",
        data: { Equipe: id, IsComunEquipe: true, ConfiguracaoId: configID },
        type: "POST",
        success: (data) => {
            html = '';
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
            $(data.result).each((i, element) => {
                html += `<tr>                        
                        <td>${element.Nome}</td>                        
                        <td class="membro-fone"><div class="checkbox i-checks-green"><label> <input type="checkbox" data-id="${element.Id}" value="" ${element.Presenca ? 'checked=""' : ''}> <i></i></label></div></td>
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