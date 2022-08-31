$(document).ready(() => {
    HideMenu();
    GetResultadosAdmin();
});

function getEquipantesExcel() {
    $.ajax({
        url: "/Equipante/getEquipantesExcel/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            { EventoId: $("#eventoid").val() }),
        success: (data) => {

            window.location = `DownloadTempFile?fileName=Equipe ${$("#eventoid option:selected").text()}.xlsx&g=` + data;
        }
    });
}

function GetResultadosAdmin() {
    $.ajax({
        url: '/Home/GetResultadosAdmin',
        datatype: "json",
        data: { EventoId: $("#eventoid").val() },
        type: "GET",
        success: (data) => {
            result = data.result;
            if (result.Evento == InscricoesEncerradas) {
                $('.detalhamento-equipes').show();
                $.ajax({
                    url: '/Home/GetDetalhamentoEvento',
                    datatype: "json",
                    data: { EventoId: $("#eventoid").val() },
                    type: "GET",
                    success: (data2) => {
                        result2 = data2.result;
                        htmlDetalhamento = '';
                        htmlDetalhamentoMobile = '';
                        equipe = '';
                        totalEquipe = 0;
                        totalGeral = 0;
                        $(result2.Equipantes).each((i, element) => {
                            if (equipe != element.Equipe) {
                                if (totalEquipe > 0) {
                                    htmlDetalhamento += `<tr>                        
                                        <td class="font-bold">Total: ${totalEquipe}</td>                        
                                        <td></td>                                                
                                    </tr>`;
                                    htmlDetalhamentoMobile += `<div class="col col-xs-12 m-b-md">
                                                                <h2>Total: ${totalEquipe}</h2>
                                                            </div>
                                                            `

                                    totalEquipe = 0;
                                }
                                htmlDetalhamento += `<tr>                        
                                    <td class="font-bold">Equipe: ${element.Equipe}</td>                        
                                    <td></td>                                                
                                </tr>`;
                                htmlDetalhamentoMobile += `<div class="col col-xs-12 m-b-md">
                                                                <h2>${element.Equipe}</h2>
                                                            </div>
                                                            `


                                if (element.Tipo == "Coordenador") {
                                    htmlDetalhamento += `<tr>                        
                                    <td class="font-bold">Coordenador: ${element.Nome}</td>                        
                                    <td class="equipante-fone">${element.Fone}</td>                                                
                                </tr>`;

                                } else {
                                    htmlDetalhamento += `<tr>                        
                                    <td>${element.Nome}</td>                        
                                    <td class="equipante-fone">${element.Fone}</td>                                                
                                </tr>`;
                                }

                                equipe = element.Equipe;
                            } else {
                                if (element.Tipo == "Coordenador") {
                                    htmlDetalhamento += `<tr>                        
                                    <td class="font-bold">Coordenador: ${element.Nome}</td>                        
                                    <td class="equipante-fone">${element.Fone}</td>                                                
                                </tr>`;
                                } else {
                                    htmlDetalhamento += `<tr>                        
                                    <td>${element.Nome}</td>                        
                                    <td class="equipante-fone">${element.Fone}</td>                                                
                                </tr>`;
                                }
                            }

                            htmlDetalhamentoMobile += `<div class="col col-xs-6">
                                                                <div class="equipe-mobile black-bg">                                                              
                                                                    <div class="mobile-content">
                                                                        <h4>${element.Nome}</h4>
                                                                    </div>
                                                                  
                                                                </div>
                                                            </div>
                                                            `

                            totalEquipe++;
                            totalGeral++;
                        });
                        htmlDetalhamento += `<tr>                        
                                        <td class="font-bold">Total: ${totalEquipe}</td>                        
                                        <td></td>                                                
                                    </tr>`;
                        htmlDetalhamentoMobile += `<div class="col col-xs-12 m-b-md">
                                                                <h2>Total: ${totalEquipe}</h2>
                                                            </div>
                                                            `

                        htmlDetalhamento += `<tr>                        
                                        <td class="font-bold">Total Geral: ${totalGeral}</td>                        
                                        <td></td>                                                
                                    </tr>`;

                        htmlDetalhamentoMobile += `<div class="col col-xs-12 m-b-md">
                                                                <h2>Total Geral: ${totalGeral}</h2>
                                                            </div>
                                                            `

                        $('#tb-detalhamento-equipes').html(htmlDetalhamento);
                        $('.detalhamento-mobile-container').html(htmlDetalhamentoMobile);
                    }
                })
            } else
                $('.detalhamento-equipes').hide();
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
            $("#boletos").text(result.Boletos);
            $("#contatos").text(result.Contatos);
            $("#saldo").text(result.SaldoGeral);
            $("#saldodinheiro").text(result.SaldoDinheir);
            $("#saldopix").text(result.SaldoPix);
            $("#receita").text(result.TotalReceber);
            $("#despesa").text(result.TotalPagar);

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


            htmlInscritos = '';
            $(result.UltimosInscritos).each((i, element) => {
                htmlInscritos += `<tr>                        
                        <td>${element.Nome}</td>                        
                        <td>${element.Idade}</td>                                                
                    </tr>`;
            });

            $('#ultimos-inscritos').html(htmlInscritos);

            htmlEquipes = '';
            htmlEquipesMobile = '';
            totalEquipe = 0;
            $(result.Equipes).each((i, element) => {
                totalEquipe += element.QuantidadeMembros;
                htmlEquipesMobile += `  <div class="col col-xs-6">
                                <div class="equipe-mobile black-bg">
                                    <div class="mobile-content">
                                        <h3>${element.QuantidadeMembros}</h3>
                                        <p>${element.Equipe}</p>
                                    </div>
                                </div>
                            </div>`
                htmlEquipes += `<tr>                        
                        <td>${element.Equipe}</td>                        
                        <td>${element.QuantidadeMembros}</td>                                                
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

            htmlReunioes = '';
            $(result.Reunioes).each((i, element) => {
                htmlReunioes += `<tr>
                        <td>${element.Titulo}</td>
                        <td>${moment(element.DataReuniao).format('DD/MM/YYYY HH:mm')}</td>                        
                        <td>${element.Presenca}</td>                                                
                    </tr>`;
            });

            if ($('#eventoid option:selected').data('role') == "Administrativo") {
                $('#resumo-financeiro-bloco').css('display', 'none')
            } else {
                $('#resumo-financeiro-bloco').css('display', 'block')
            }
            $('#tb-reunioes').html(htmlReunioes);

            if ($('#eventoid option:selected').data('pendente') == "True") {
                $('.event-title').text($('#eventoid option:selected').text())
                $('.event-value').text(`R$ ${result.EventoOferta.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`)
                $('.evento-cobranca').css('display', 'block')
            } else {
                $('.evento-cobranca').css('display', 'none')
            }
        }
    });
}

function ofertar() {
    $.ajax({
        url: "/Evento/OfertaEvento/",
        datatype: "json",
        type: "POST",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(
            { Id: $("#eventoid").val() }),
        success: (data) => {
            window.location.reload()
        }
    });
}
