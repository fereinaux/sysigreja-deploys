$(document).ready(() => {
    $(".membro-fone").each((i, element) => {
        $(element).html(`${GetIconWhatsApp($(element).text())}
                            ${GetIconTel($(element).text())}`);
    });

    CarregarTabelaPresenca();
    CarregarTabelaArquivos();
});

function CarregarTabelaArquivos() {
    $.ajax({
        url: '/Arquivo/GetArquivosEquipe',
        datatype: "json",
        data: { Equipe: $("#table-arquivos").data('equipe'),  IsComunEquipe: true },
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
            console.log(html);
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