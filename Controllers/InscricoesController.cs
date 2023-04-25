
using AutoMapper;
using Core.Business.Categorias;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Newsletter;
using Core.Business.Participantes;
using Core.Models.Equipantes;
using Core.Models.Participantes;
using Data.Entities;
using SysIgreja.ViewModels;
using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web.Mvc;
using Utils.Enums;
using Utils.Extensions;
//using MercadoPago.Config;
//using MercadoPago.Client.Preference;
//using MercadoPago.Resource.Preference;
using System.Collections.Generic;
using Core.Business.Notificacao;
using Utils.Services;
using System.Drawing.Imaging;
using CsQuery;

namespace SysIgreja.Controllers
{
    public class InscricoesController : Controller
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
        private readonly IMapper mapper;

        public InscricoesController(IParticipantesBusiness participantesBusiness, IImageService imageService, INotificacaoBusiness notificacaoBusiness, ICategoriaBusiness categoriaBusiness, IEquipesBusiness equipesBusiness, IEquipantesBusiness equipantesBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, INewsletterBusiness newsletterBusiness, ILancamentoBusiness lancamentoBusiness, IMeioPagamentoBusiness meioPagamentoBusiness)
        {
            this.participantesBusiness = participantesBusiness;
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
            //MercadoPagoConfig.AccessToken = "APP_USR-6615847238519666-091214-ae37fc001760151942cc1fa7ca689e3b-221658192";
        }

        public class GetEventosInscricaoViewModel
        {
            public int Id { get; set; }
            public string Data { get; set; }
            public string DataCalendar { get; set; }
            public DateTime DataEvento { get; set; }
            public int Valor { get; set; }
            public int Numeracao { get; set; }
            public string Descricao { get; set; }
            public string UrlDestino { get; set; }
            public string Titulo { get; set; }
            public string Logo { get; set; }
            public string Background { get; set; }
            public string Status { get; set; }
            public string StatusEquipe { get; set; }
            public string Identificador { get; set; }
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetEventosInscricao(string type, string identificador, string search, bool? isMobile)
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            var eventos = eventosBusiness.GetEventosGlobais().AsEnumerable().Where(x =>
            (
              (
                (
                  (x.Status == StatusEnum.Aberto || x.Status == StatusEnum.EmBreve) ||
                  (x.StatusEquipe == StatusEnum.Aberto || x.StatusEquipe == StatusEnum.EmBreve)
                ) ||
                (
              x.DataEvento > DateTime.Today && x.Status == StatusEnum.Informativo)
              ) &&
              (
                (string.IsNullOrEmpty(search)) ||
                x.TituloEvento.RemoveAccents().Contains(search.RemoveAccents())
              ) &&
              (
                (identificador == x.Identificador || x.Global) ||
                string.IsNullOrEmpty(identificador)
              )
            )).ToList().Select(x => new GetEventosInscricaoViewModel
            {
                Id = x.Id,
                UrlDestino = x.UrlExterna ?? $"https://{x.Destino}/Inscricoes/Detalhes/{x.EventoId}",
                Data = $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                Valor = type.Contains("Equipe") ? (x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().ValorTaxa : x.ValorTaxa) :
                     x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : x.Valor,
                Numeracao = x.Numeracao,
                DataEvento = x.DataEvento,
                DataCalendar = x.DataEvento.ToString("yyyy-MM-dd"),
                Descricao = x.Descricao,
                Identificador = x.Identificador ?? "Interdenominacional",
                Titulo = x.TituloEvento,
                Status = x.Status.GetDescription(),
                StatusEquipe = x.StatusEquipe.GetDescription(),
                Background = x.Background != null ? (isMobile.HasValue && isMobile.Value ? imageService.ResizeImage(x.Background, 400) : imageService.ResizeImage(x.Background, 700)) : "",
                Logo = "",
            }).OrderBy(x => x.DataEvento).ToList();

            var json = Json(new { Eventos = eventos }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        public ActionResult Index()
        {
            ViewBag.Action = ViewBag.Action ?? "Inscrições";
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            var igrejas = eventosBusiness.GetEventosGlobais().Where(x => !string.IsNullOrEmpty(x.Identificador)).Select(x => x.Identificador).Distinct().ToList();
            ViewBag.Igrejas = igrejas;
            ViewBag.CountIgrejas = igrejas.Count;
            return View("Index");
        }

        public ActionResult Inscricoes(int Id, string Tipo)
        {
            ViewBag.Title = Tipo;

            ViewBag.Tipo = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            if (evento == null)
                return RedirectToAction("InscricoesEncerradas", new { Id = Id });
            ViewBag.EventoId = Id;
            var config = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            ViewBag.Igrejas = configuracaoBusiness.GetIgrejas(evento.ConfiguracaoId.Value);
            switch (Tipo)
            {
                case "Inscrições Equipe":
                    if (evento.StatusEquipe != StatusEnum.Aberto)
                        return RedirectToAction("InscricoesEncerradas", new { Id = Id });
                    ViewBag.Sujeito = "voluntário";
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue ? configuracaoBusiness.GetCamposEquipe(evento.ConfiguracaoId.Value).Select(x => x.Campo).ToList() : null;
                    ViewBag.Equipes = evento.Configuracao.Equipes.Any(x => x.ShowInscricao) ? evento.Configuracao.Equipes.Where(x => x.ShowInscricao).Select(x => new EquipeViewModel { Id = x.EquipeId, Nome = x.Equipe.Nome }).ToList() : equipesBusiness.GetEquipes(Id).Select(x => new EquipeViewModel { Id = x.Id, Nome = x.Nome }).ToList();
                    if (config.TipoEventoId == TipoEventoEnum.Casais)
                        return View("Casal");
                    return View();
                default:
                    if (evento.Status != StatusEnum.Aberto)
                        return RedirectToAction("InscricoesEncerradas", new { Id = Id });
                    ViewBag.Sujeito = "participante";
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue ? configuracaoBusiness.GetCampos(evento.ConfiguracaoId.Value).Select(x => x.Campo).ToList() : null;
                    if (config.TipoEventoId == TipoEventoEnum.Casais)
                        return View("Casal");
                    return View();
            }
        }


        public ActionResult Detalhes(int Id, string Tipo, int? ConjugeId)
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            ViewBag.Title = Tipo;
            ViewBag.Tipo = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            if (evento.ConfiguracaoId.HasValue)
            {
                ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            }
            else
            {
                ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            }
            ViewBag.UrlDestino = Url.Action("Inscricoes", "Inscricoes", new
            {
                id = Id,
                Tipo = Tipo
            });
            ViewBag.EventoId = Id;
            evento.Valor = evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : evento.Valor;
            ViewBag.Evento = evento;

            switch (Tipo)
            {
                case "Inscrições Equipe":
                    ViewBag.Sujeito = "equipante";
                    ViewBag.Equipes = equipesBusiness.GetEquipes(Id).Select(x => new EquipeViewModel { Id = x.Id, Nome = x.Nome }).ToList();
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue ? configuracaoBusiness.GetCamposEquipe(evento.ConfiguracaoId.Value).Select(x => x.Campo).ToList() : null;
                    if (ConjugeId.HasValue)
                    {
                        Equipante equipante = equipantesBusiness.GetEquipanteById(ConjugeId.Value);
                        ViewBag.CEP = equipante.CEP;
                        ViewBag.Numero = equipante.Numero;
                        ViewBag.Complemento = equipante.Complemento;
                        ViewBag.Referencia = equipante.Referencia;
                    }
                    return View("Inscricoes");
                default:
                    ViewBag.Sujeito = "participante";
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue ? configuracaoBusiness.GetCampos(evento.ConfiguracaoId.Value).Select(x => x.Campo).ToList() : null;
                    if (ConjugeId.HasValue)
                    {
                        Participante participante = participantesBusiness.GetParticipanteById(ConjugeId.Value);
                        ViewBag.Nome = participante.Conjuge;
                        ViewBag.Conjuge = participante.Nome;
                        ViewBag.CEP = participante.CEP;
                        ViewBag.Numero = participante.Numero;
                        ViewBag.Complemento = participante.Complemento;
                        ViewBag.Referencia = participante.Referencia;
                        ViewBag.NomeConvite = participante.NomeConvite;
                        ViewBag.FoneConvite = participante.FoneConvite;
                    }
                    break;
            }
            return View();
        }

        public ActionResult Equipe()
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            ViewBag.Action = "Inscrições Equipe";
            return View("Index");
        }
        private bool CapacidadeUltrapassada(Evento evento, StatusEnum[] arrStatus)
        {
            return participantesBusiness
                            .GetParticipantesByEvento(evento.Id)
                            .Where(x => (arrStatus).Contains(x.Status))
                            .Count() >= evento.Capacidade;
        }

        public ActionResult InscricaoConcluida(int Id, int? EventoId, string Tipo)
        {
            switch (Tipo)
            {
                case "Inscrições Equipe":
                    var eventoAtual = eventosBusiness.GetEventoById(EventoId.Value);
                    var config = configuracaoBusiness.GetConfiguracao(eventoAtual.ConfiguracaoId);
                    Equipante equipante = equipantesBusiness.GetEquipanteById(Id);
                    var Valor = eventoAtual.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? eventoAtual.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : eventoAtual.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
                    ViewBag.Configuracao = config;
                    ViewBag.MsgConclusao = config.MsgConclusaoEquipe
                         .Replace("${Nome}", equipante.Nome)
                          .Replace("${EventoId}", EventoId.ToString())
                                          .Replace("${Id}", equipante.Id.ToString())

                       .Replace("${Evento}", eventoAtual.Configuracao.Titulo)
                          .Replace("${NumeracaoEvento}", eventoAtual.Numeracao.ToString())
                           .Replace("${DescricaoEvento}", eventoAtual.Descricao)
                 .Replace("${ValorEvento}", eventoAtual.ValorTaxa.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")))
                 .Replace("${DataEvento}", eventoAtual.DataEvento.ToString("dd/MM/yyyy"));

                    if (config.TipoEventoId == TipoEventoEnum.Casais)
                    {
                        var casal = equipantesBusiness.GetEquipantes().FirstOrDefault(x => x.Conjuge == equipante.Nome);
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace("${Apelido}", $"{equipante.Apelido} e {casal?.Apelido}");
                    }
                    else
                    {
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace("${Apelido}", equipante.Apelido);
                    }
                    ViewBag.Title = "Inscrição Concluída";
                    return View();
                default:
                    Participante participante = participantesBusiness.GetParticipanteById(Id);
                    var eventoAtualP = eventosBusiness.GetEventoById(participante.EventoId);
                    var configP = configuracaoBusiness.GetConfiguracao(eventoAtualP.ConfiguracaoId);
                    var ValorParticipante = participante.Evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? participante.Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : participante.Evento.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
                    var configParticipante = configuracaoBusiness.GetConfiguracao(participante.Evento.ConfiguracaoId);
                    ViewBag.Configuracao = configParticipante;
                    ViewBag.MsgConclusao = configParticipante.MsgConclusao
                                 .Replace("${Nome}", participante.Nome)
                                          .Replace("${Id}", participante.Id.ToString())
                                          .Replace("${EventoId}", participante.EventoId.ToString())
                 .Replace("${Evento}", participante.Evento.Configuracao.Titulo)
                          .Replace("${NumeracaoEvento}", participante.Evento.Numeracao.ToString())
                           .Replace("${DescricaoEvento}", participante.Evento.Descricao)
                 .Replace("${ValorEvento}", ValorParticipante)
                 .Replace("${DataEvento}", participante.Evento.DataEvento.ToString("dd/MM/yyyy"))
                 .Replace("${FonePadrinho}", participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? "")
                 .Replace("${NomePadrinho}", participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? "");
                    if (configP.TipoEventoId == TipoEventoEnum.Casais)
                    {
                        var casal = participantesBusiness.GetParticipantes().FirstOrDefault(x => x.Conjuge == participante.Nome);
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace("${Apelido}", $"{participante.Apelido} e {casal.Apelido}");
                    }
                    else
                    {
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace("${Apelido}", participante.Apelido);
                    }
                    ViewBag.Participante = new InscricaoConcluidaViewModel
                    {
                        Apelido = participante.Apelido,
                        Evento = $"{configParticipante.Titulo} " +
                        $"{participante.Evento.Numeracao.ToString()}",
                        DataEvento = participante.Evento.DataEvento.ToString("dd/MM/yyyy"),
                        PadrinhoFone = participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? "",
                        PadrinhoNome = participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? ""
                    };
                    if (participante.Status == StatusEnum.Inscrito)
                    {
                        ViewBag.Title = "Inscrição Concluída";
                        return View();
                    }
                    else
                    {
                        ViewBag.Title = "Inscrição Completa";
                        return View("InscricaoCompleta");
                    }
            }


        }

        public ActionResult InscricaoEspera(int Id)
        {
            ViewBag.Title = "Inscrição em Espera";
            Participante participante = participantesBusiness.GetParticipanteById(Id);
            var config = configuracaoBusiness.GetConfiguracao(participante.Evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            var Valor = participante.Evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? participante.Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : participante.Evento.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
            var apelido = participante.Apelido;
            if (config.TipoEventoId == TipoEventoEnum.Casais)
            {
                var casal = participantesBusiness.GetParticipantesByEvento(participante.EventoId).FirstOrDefault(x => x.Conjuge == participante.Nome);
                apelido = $"{participante.Apelido} e {casal?.Apelido}";
            }

            ViewBag.Participante = new InscricaoConcluidaViewModel
            {
                Id = participante.Id,
                Apelido = apelido,
                Logo = participante.Evento.Configuracao.Titulo + ".png",
                Evento = $"{participante.Evento.Numeracao.ToString()}º {participante.Evento.Configuracao.Titulo} {participante.Evento.Descricao}",
                Valor = Valor,
                DataEvento = participante.Evento.DataEvento.ToString("dd/MM/yyyy")
            };


            return View("InscricaoEspera");
        }

        public ActionResult InscricoesEncerradas(int Id)
        {
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            ViewBag.Title = "Inscrições Encerradas";
            ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            return View();
        }

        [HttpPost]
        public ActionResult PostInscricao(PostInscricaoModel model)
        {

            var evento = eventosBusiness.GetEventoById(model.EventoId);
            var equipante = equipantesBusiness.GetEquipantes().FirstOrDefault(x => x.Fone == model.Fone || x.Email == model.Email);
            if (equipante != null)
            {
                model.EquipanteId = equipante.Id;
            }

            if (evento != null && participantesBusiness.GetParticipantesByEvento(model.EventoId).Where(x => x.Status != StatusEnum.Cancelado).Count() >= evento.Capacidade)
            {
                model.Status = "Espera";

                return Json(Url.Action("InscricaoEspera", new { Id = participantesBusiness.PostInscricao(model) }));
            }

            return Json(Url.Action("InscricaoConcluida", new { Id = participantesBusiness.PostInscricao(model) }));
        }

        [HttpPost]
        public ActionResult Checkin(PostInscricaoModel model)
        {
            return Json(new { Id = participantesBusiness.PostInscricao(model) });
        }

        [HttpPost]
        public ActionResult VerificaCadastro(string Email, int eventoId, string Tipo)
        {
            var evento = eventosBusiness.GetEventoById(eventoId);

            switch (Tipo)
            {
                case "Inscrições Equipe":
                    var equipante = equipantesBusiness.GetEquipantes().FirstOrDefault(x => x.Fone == Email);
                    if (equipante != null && equipante.Equipes != null && equipante.Equipes.Any(x => x.EventoId == eventoId))
                    {
                        return Json(new { Participante = equipante.Nome, Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}", Url = Url.Action("InscricaoConcluida", new { Id = equipante.Id, EventoId = eventoId, Tipo = "Inscrições Equipe" }) }, JsonRequestBehavior.AllowGet);
                    }
                    else if (equipante != null)
                    {
                        return Json(new { Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}", Participante = mapper.Map<EquipanteListModel>(equipante) }, JsonRequestBehavior.AllowGet);
                    }
                    return Json(new { Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}" }, JsonRequestBehavior.AllowGet);

                default:
                    var participante = participantesBusiness.GetParticipantesByEvento(eventoId).FirstOrDefault(x => x.Email == Email && (new StatusEnum[] { StatusEnum.Confirmado, StatusEnum.Inscrito, StatusEnum.Espera }).Contains(x.Status));

                    if (participante != null && participante.Status != StatusEnum.Espera)
                        return Json(new { Participante = participante.Nome, Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}", Url = Url.Action("InscricaoConcluida", new { Id = participante.Id }) }, JsonRequestBehavior.AllowGet);

                    else if (participante != null && participante.Status == StatusEnum.Espera)
                        return Json(new { Url = Url.Action("InscricaoEspera", new { Id = participante.Id }) });

                    var participanteConsulta = participantesBusiness.GetParticipanteConsulta(Email);

                    if (participanteConsulta != null)
                        return Json(new { Participante = participanteConsulta, Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}" }, JsonRequestBehavior.AllowGet);

                    return Json(new { Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}" }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}