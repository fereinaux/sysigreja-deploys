$(document).off('ready-ajax').on('ready-ajax', () => {
    HideMenu();
    GetResultadosAdmin();
    //GetResultadosGeral();
});

function getEquipantesExcel() {
    $.ajax({
        url: "/Equipante/getEquipantesExcel/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            { EventoId: SelectedEvent.Id }),
        success: (data) => {

            window.location = `DownloadTempFile?fileName=Equipe ${SelectedEvent.Titulo} ${SelectedEvent.Numeracao}.xlsx&g=` + data;
        }
    });
}

function GetResultadosGeral() {
    if ($('.bloco-adm-geral').length > 0) {


        $.ajax({
            url: '/Home/GetResultadosGeral',
            datatype: "json",
            data: { EventoId: SelectedEvent.Id },
            type: "GET",
            success: (data) => {
                result = data.result;
                var calendarEl = document.getElementById('calendar');
                var calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'listMonth',
                    locale: 'pt-br',
                    height: 400,
                    buttons: {
                        today: false
                    },
                    events: result.Eventos.map(e => {
                        return {
                            title: e.Evento,
                            start: e.Data,
                            color: 'transparent',
                            extendedProps: {
                                logo: e.Logo,
                                bg: e.Background,
                                cor: e.Cor,
                                hover: e.CorHover,
                                id: e.Id
                            }
                        }
                    }),
                    eventContent: function (arg) {
                        let div = document.createElement('div')
                        let overlay = document.createElement('div')
                        let spanContainer = document.createElement('div')
                        let span = document.createElement('span')
                        let img = document.createElement('img')
                        let bg = document.createElement('img')
                        img.classList.add('img-calendar')
                        bg.classList.add('bg-calendar')
                        div.classList.add('div-calendar')
                        div.dataset.id = arg.event.extendedProps.id
                        span.classList.add('span-calendar')
                        spanContainer.classList.add('span-container-calendar')
                        span.innerHTML = arg.event.title
                        img.src = `data:image/png;base64,${arg.event.extendedProps.logo}`
                        bg.src = `data:image/png;base64,${arg.event.extendedProps.bg}`
                        if (arg.event.extendedProps.logo) {

                            div.append(img)
                        }
                        if (arg.event.extendedProps.bg) {

                            div.append(bg)
                            div.append(overlay)
                        }
                        spanContainer.append(span)
                        div.append(spanContainer)
                        return { domNodes: [div] }
                    }
                    //eventContent: function (arg) {
                    //    console.log(arg);
                    //    var element = $(arg.el);
                    //    console.log(element);

                    //    let img = document.createElement('img')

                    //    img.src = `data:image/png;base64,${arg.event.extendedProps.logo}`
                    //    element.append(img)
                    //}

                });
                calendar.render();
            }
        })


    }
}

$('body').on('DOMNodeInserted', '.div-calendar', function () {
    var element = $(this)
    element.parent().parent().css('cursor', 'pointer')
    element.parent().parent().css('background-color', 'transparent')
    element.parent().parent().css('border-color', 'transparent')

    element.parent().parent().click(function () {
        $('#eventoid').val($(this).find('.div-calendar').data('id')).trigger('change');

    })


});



function GetResultadosAdmin() {
    if (SelectedEvent.Role == 'Coordenador') {
        window.location.href = '/Home/Coordenador'
    }

    if (SelectedEvent.Role == "Administrativo" || SelectedEvent.Role == "Padrinho") {
        $('#resumo-financeiro-bloco').css('display', 'none')
    } else {
        $('#resumo-financeiro-bloco').css('display', 'block')
    }
    $.ajax({
        url: '/Home/GetResumoFinanceiroEvento',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {          
            result = data.result;            
            htmlResumoFinanc = ''
            receberTotal = 0
            pagarTotal = 0
            result.MeiosPagamento.map(mp => {
                receber = result.Financeiro.find(f => f.Tipo == 'Receber' && f.MeioPagamento == mp)
                pagar = result.Financeiro.find(f => f.Tipo == 'Pagar' && f.MeioPagamento == mp)
                receberValor = receber ? receber.Valor : 0
                receberTotal += receberValor
                pagarValor = pagar ? pagar.Valor : 0
                pagarTotal += pagarValor
                saldo = receberValor - pagarValor
                htmlResumoFinanc += `<tr>                        
                        <td>${mp}</td>
                        <td>R$ ${receberValor.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</td>
<td>R$ ${pagarValor.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</td>
<td>R$ ${saldo.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</td>
                    </tr>$`
            })
            $('#resumo-financeiro').html(htmlResumoFinanc);
            $('#receberTotal').text(`R$ ${receberTotal.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`)
            $('#pagarTotal').text(`R$ ${pagarTotal.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`)
            $('#saldoTotal').text(`R$ ${(receberTotal - pagarTotal).toLocaleString('pt-br', { minimumFractionDigits: 2 })}`)           
        }
    });


    $.ajax({
        url: '/Home/GetEquipesEvento',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {
            result = data.result; 

            $("#equipe-male").text(result.filter(x => x.Sexo == 1).length);
            $("#equipe-female").text(result.filter(x => x.Sexo == 2).length);
          

            htmlEquipes = '';
            htmlEquipesMobile = '';
            totalEquipe = 0;

            var equipes = $.unique(result.map(x => x.Nome).sort())
         

            $(equipes).each((i, element) => {
                var qtd = result.filter(x => x.Nome == element).length
                totalEquipe += qtd;
                htmlEquipesMobile += `  <div class="col col-xs-6">
                                <div class="equipe-mobile black-bg">
                                    <div class="mobile-content">
                                        <h3>${qtd}</h3>
                                        <p>${element}</p>
                                    </div>
                                </div>
                            </div>`
                htmlEquipes += `<tr>                        
                        <td>${element}</td>                        
                        <td>${qtd}</td>                                                
                    </tr>`;
            });

            htmlEquipesMobile += `  <div class="col col-xs-6">
                                <div class="equipe-mobile navy-bg">
                                    <div class="mobile-content">
                                        <h3>${totalEquipe}</h3>
                                        <p>Total</p>
                                    </div>
                                </div>
                            </div>`

            $('#tb-equipes').html(htmlEquipes);
            $('.equipe-mobile-container').html(htmlEquipesMobile);
            $('#totalEquipe').text(totalEquipe);




        }
    });

    $.ajax({
        url: '/Home/GetReunioesEvento',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {

            result = data.result;
     

            htmlReunioes = '';
            $(result.Reunioes).each((i, element) => {
                htmlReunioes += `<tr>
                        <td>${element.Titulo}</td>
                        <td>${moment(element.DataReuniao).format('DD/MM/YYYY HH:mm')}</td>                        
                        <td>${element.Presenca}</td>                                                
                    </tr>`;
            });
            $('#tb-reunioes').html(htmlReunioes);

    

        }
    });

    $.ajax({
        url: '/Home/GetUltimosInscritosEvento',
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {

            result = data.result;
           
            htmlInscritos = '';
            $(result.UltimosInscritos).each((i, element) => {
                htmlInscritos += `<tr>                        
                        <td>${element.Nome}</td>                        
                        <td class="td-idade">${element.Idade}</td>                                                
                    </tr>`;
            });

            $('#ultimos-inscritos').html(htmlInscritos);


        }
    });
    $('.zero-participantes').css('display', 'none')
  
 

    $.ajax({
        url: "/Home/GetParticipantesEvento",
        datatype: "json",
        data: { EventoId: SelectedEvent.Id },
        type: "GET",
        success: (data) => {

            result = data.result;
            if (result.Total == 0) {
                $('.zero-participantes').css('display', 'none')
            } else {
                $('.zero-participantes').css('display', 'block')
            }
            $("#total").text(result.Total);
            $("#espera").text(result.Espera);
            $("#confirmados").text(result.Confirmados);
            $("#isencoes").text(result.Isencoes);
            $("#presentes").text(result.Presentes);
            $("#cancelados").text(result.Cancelados);
            $("#meninos").text(result.Meninos);
            $("#meninas").text(result.Meninas);
            $("#equipe-male").text(result.EquipeMeninos);
            $("#equipe-female").text(result.EquipeMeninas);


            if (result.Tipo == "Casais") {
                $('#total~small').text('Casais')
                $('#meninos').parent().parent().css('display', 'none')
                $('#meninas').parent().parent().css('display', 'none')
                $('.td-idade').css('display', 'none')
            } else {
                $('#total~small').text('Participantes')
                $('#meninos').parent().parent().css('display', 'block')
                $('#meninas').parent().parent().css('display', 'block')
                $('.td-idade').css('display', 'block')
            }
            
        }
    });
}
