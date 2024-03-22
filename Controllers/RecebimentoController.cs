using System;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Categorias;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Newsletter;
using Core.Business.Notificacao;
using Core.Business.Participantes;
using Data.Entities;
using Utils.Constants;
using Utils.Enums;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class RecebimentoController : Controller
    {
            private readonly IParticipantesBusiness participantesBusiness;
        private readonly ICategoriaBusiness categoriaBusiness;
        private readonly INotificacaoBusiness notificacaoBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly ILancamentoBusiness lancamentoBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IMeioPagamentoBusiness meioPagamentoBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly INewsletterBusiness newsletterBusiness;
        private readonly IImageService imageService;
        private readonly IEmailSender emailSender;
        private readonly IMapper mapper;

        public RecebimentoController(
            IParticipantesBusiness participantesBusiness,
            IEmailSender emailSender,
            IImageService imageService,
            INotificacaoBusiness notificacaoBusiness,
            ICategoriaBusiness categoriaBusiness,
            IEquipesBusiness equipesBusiness,
            IEquipantesBusiness equipantesBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IEventosBusiness eventosBusiness,
            INewsletterBusiness newsletterBusiness,
            ILancamentoBusiness lancamentoBusiness,
            IMeioPagamentoBusiness meioPagamentoBusiness
        )
        {
            this.participantesBusiness = participantesBusiness;
            this.emailSender = emailSender;
            this.notificacaoBusiness = notificacaoBusiness;
            this.imageService = imageService;
            this.categoriaBusiness = categoriaBusiness;
            this.equipesBusiness = equipesBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            this.equipantesBusiness = equipantesBusiness;
            this.meioPagamentoBusiness = meioPagamentoBusiness;
            this.lancamentoBusiness = lancamentoBusiness;
            this.eventosBusiness = eventosBusiness;
            this.newsletterBusiness = newsletterBusiness;
            mapper = new MapperRealidade().mapper;
        }

        [AllowAnonymous]
        public ActionResult Index(string external_reference, string payment_id)
        {
            ViewBag.Login = configuracaoBusiness.GetLogin();

            if (
            participantesBusiness
                    .GetParticipantes()
                    .Any(x => x.MercadoPagoId == external_reference && !string.IsNullOrEmpty(external_reference))
                || equipesBusiness
            .GetQueryEquipantesEventoSemFiltro()
                    .Any(x => x.MercadoPagoId == external_reference && !string.IsNullOrEmpty(external_reference))
            )
            {
                ViewBag.MeioPagamento = "Mercado Pago";

                Participante participante = participantesBusiness
                    .GetParticipantes()
                    .FirstOrDefault(x => x.MercadoPagoId == external_reference && !string.IsNullOrEmpty(external_reference));

                if (participante != null)
                {
                    var eventoAtualP = eventosBusiness.GetEventoById(participante.EventoId);
                    ViewBag.EventoId = eventoAtualP.Id;
                    if (participante.Status == StatusEnum.Inscrito)
                    {
                        lancamentoBusiness.PostPagamento(
                            new Core.Models.Lancamento.PostPagamentoModel
                            {
                                Data = TimeZoneInfo.ConvertTime(
                                    DateTime.Now,
                                    TimeZoneInfo.FindSystemTimeZoneById(
                                        "E. South America Standard Time"
                                    )
                                ),
                                Valor = eventoAtualP.Valor,
                                Origem = "Mercado Pago",
                                ParticipanteId = participante.Id,
                                MeioPagamentoId = lancamentoBusiness
                                    .GetMercadoPago(eventoAtualP.ConfiguracaoId.Value)
                                    .Id,
                                EventoId = eventoAtualP.Id
                            }
                        );
                    }

                    var configP = configuracaoBusiness.GetConfiguracao(eventoAtualP.ConfiguracaoId);
                    ViewBag.Configuracao = configP;
                    ViewBag.Participante = participante;
                    ViewBag.Casal = participantesBusiness
                        .GetParticipantes()
                        .FirstOrDefault(
                            x =>
                                x.Conjuge == participante.Nome
                                && x.EventoId == participante.EventoId
                        );
                    ViewBag.Evento = eventoAtualP;
                    ViewBag.Padrinho = participante.Padrinho?.EquipanteEvento?.Equipante;
                    ViewBag.QRCode =
                        $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={eventoAtualP.Id.ToString()}&participanteid={participante.Id.ToString()}";
                }
                else
                {
                    EquipanteEvento ev = equipesBusiness
                        .GetQueryEquipantesEventoSemFiltro()
                        .Include(x => x.Equipante)
                        .Include(x => x.Equipante.Lancamentos)
                        .Include(x => x.Equipante.Lancamentos.Select(y => y.MeioPagamento))
                        .FirstOrDefault(x => x.MercadoPagoId == external_reference && !string.IsNullOrEmpty(external_reference));

                    Equipante equipante = ev.Equipante;

                    if (equipante != null)
                    {
                        var eventoAtualP = eventosBusiness.GetEventoById(ev.EventoId.Value);
                        ViewBag.EventoId = eventoAtualP.Id;

                        if (!equipante.Lancamentos.Any(x => x.EventoId == eventoAtualP.Id && x.Status != StatusEnum.Deletado && x.MeioPagamento.Descricao == "Mercado Pago"))
                        {
                            lancamentoBusiness.PostPagamento(
                                new Core.Models.Lancamento.PostPagamentoModel
                                {
                                    Data = TimeZoneInfo.ConvertTime(
                                        DateTime.Now,
                                        TimeZoneInfo.FindSystemTimeZoneById(
                                            "E. South America Standard Time"
                                        )
                                    ),
                                    Valor = eventoAtualP.ValorTaxa,
                                    Origem = "Mercado Pago",
                                    EquipanteId = equipante.Id,
                                    MeioPagamentoId = lancamentoBusiness
                                        .GetMercadoPago(eventoAtualP.ConfiguracaoId.Value)
                                        .Id,
                                    EventoId = eventoAtualP.Id
                                }
                            );
                        }

                        var configP = configuracaoBusiness.GetConfiguracao(
                            eventoAtualP.ConfiguracaoId
                        );
                        ViewBag.Configuracao = configP;
                        ViewBag.Participante = equipante;
                        ViewBag.Casal = equipantesBusiness
                            .GetEquipantes()
                            .FirstOrDefault(x => x.Conjuge == equipante.Nome);
                        ViewBag.Evento = eventoAtualP;
                        ViewBag.QRCode =
                            $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={eventoAtualP.Id.ToString()}&equipanteid={equipante.Id.ToString()}";
                    }
                }
                ViewBag.Title = "Pagamento Concluído";
                return View("~/Views/Inscricoes/PagamentoConcluido.cshtml");
            }
            else if (participantesBusiness
                    .GetParticipantes()
                    .Any(x => x.PagSeguroId == payment_id && !string.IsNullOrEmpty(payment_id))
                || equipesBusiness
            .GetQueryEquipantesEventoSemFiltro()
                    .Any(x => x.PagSeguroId == payment_id && !string.IsNullOrEmpty(payment_id)))
            {
                ViewBag.MeioPagamento = "PagoSeguro";
                Participante participante = participantesBusiness
       .GetParticipantes()
       .FirstOrDefault(x => x.PagSeguroId == payment_id && !string.IsNullOrEmpty(payment_id));
                if (participante != null)
                {
                    var eventoAtualP = eventosBusiness.GetEventoById(participante.EventoId);
                    ViewBag.EventoId = eventoAtualP.Id;
                    if (participante.Status == StatusEnum.Inscrito)
                    {
                        lancamentoBusiness.PostPagamento(
                            new Core.Models.Lancamento.PostPagamentoModel
                            {
                                Data = TimeZoneInfo.ConvertTime(
                                    DateTime.Now,
                                    TimeZoneInfo.FindSystemTimeZoneById(
                                        "E. South America Standard Time"
                                    )
                                ),
                                Valor = eventoAtualP.Valor,
                                Origem = "PagSeguro",
                                ParticipanteId = participante.Id,
                                MeioPagamentoId = lancamentoBusiness
                                    .GetPagSeguro(eventoAtualP.ConfiguracaoId.Value)
                                    .Id,
                                EventoId = eventoAtualP.Id
                            }
                        );
                    }

                    var configP = configuracaoBusiness.GetConfiguracao(eventoAtualP.ConfiguracaoId);
                    ViewBag.Configuracao = configP;
                    ViewBag.Participante = participante;
                    ViewBag.Casal = participantesBusiness
                        .GetParticipantes()
                        .FirstOrDefault(
                            x =>
                                x.Conjuge == participante.Nome
                                && x.EventoId == participante.EventoId
                        );
                    ViewBag.Evento = eventoAtualP;
                    ViewBag.Padrinho = participante.Padrinho?.EquipanteEvento?.Equipante;
                    ViewBag.QRCode =
                        $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={eventoAtualP.Id.ToString()}&participanteid={participante.Id.ToString()}";
                }
                else
                {
                    EquipanteEvento ev = equipesBusiness
                        .GetQueryEquipantesEventoSemFiltro()
                        .Include(x => x.Equipante)
                        .Include(x => x.Equipante.Lancamentos)
                        .Include(x => x.Equipante.Lancamentos.Select(y => y.MeioPagamento))
                        .FirstOrDefault(x => x.PagSeguroId == payment_id && !string.IsNullOrEmpty(payment_id));

                    Equipante equipante = ev.Equipante;

                    if (equipante != null)
                    {
                        var eventoAtualP = eventosBusiness.GetEventoById(ev.EventoId.Value);
                        ViewBag.EventoId = eventoAtualP.Id;
                        if (!equipante.Lancamentos.Any(x => x.EventoId == eventoAtualP.Id && x.Status != StatusEnum.Deletado && x.MeioPagamento.Descricao == "PagSeguro"))
                        {
                            lancamentoBusiness.PostPagamento(
                            new Core.Models.Lancamento.PostPagamentoModel
                            {
                                Data = TimeZoneInfo.ConvertTime(
                                    DateTime.Now,
                                    TimeZoneInfo.FindSystemTimeZoneById(
                                        "E. South America Standard Time"
                                    )
                                ),
                                Valor = eventoAtualP.ValorTaxa,
                                Origem = "PagSeguro",
                                EquipanteId = equipante.Id,
                                MeioPagamentoId = lancamentoBusiness
                                    .GetPagSeguro(eventoAtualP.ConfiguracaoId.Value)
                                    .Id,
                                EventoId = eventoAtualP.Id
                            }
                        );
                        }

                        var configP = configuracaoBusiness.GetConfiguracao(
                            eventoAtualP.ConfiguracaoId
                        );
                        ViewBag.Configuracao = configP;
                        ViewBag.Participante = equipante;
                        ViewBag.Casal = equipantesBusiness
                            .GetEquipantes()
                            .FirstOrDefault(x => x.Conjuge == equipante.Nome);
                        ViewBag.Evento = eventoAtualP;
                        ViewBag.QRCode =
                            $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={eventoAtualP.Id.ToString()}&equipanteid={equipante.Id.ToString()}";
                    }
                }
                ViewBag.Title = "Pagamento Concluído";
                return View("~/Views/Inscricoes/PagamentoConcluido.cshtml");
            }

            return View("~/Views/NaoAutorizado/Index.cshtml");
        }



    }
}
