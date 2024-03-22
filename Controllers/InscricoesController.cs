using System;
//using MercadoPago.Config;
//using MercadoPago.Client.Preference;
//using MercadoPago.Resource.Preference;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using AutoMapper;
using Core.Business.Arquivos;
using Core.Business.Categorias;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.MercadoPago;
using Core.Business.Newsletter;
using Core.Business.Notificacao;
using Core.Business.PagSeguro;
using Core.Business.Participantes;
using Core.Models.Equipantes;
using Core.Models.Participantes;
using CsQuery;
using Data.Entities;
using Microsoft.AspNet.Identity;
using Microsoft.Extensions.Logging;
using Owin.Security.Providers.Orcid.Message;
using QRCoder;
using SysIgreja.ViewModels;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

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
        private readonly IEmailSender emailSender;
        private readonly IMapper mapper;

        public InscricoesController(
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
            public int? BackgroundId { get; set; }
            public string Status { get; set; }
            public string StatusEquipe { get; set; }
            public string Identificador { get; set; }
        }

        public ActionResult DetalhesByNome(string nome)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Where(x => x.Configuracao.Identificador.ToLower() == nome.ToLower())
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            if (evento != null)
            {
                return Detalhes(evento.Id);
            }
            else
            {
                return Index();
            }
        }

        public ActionResult PresencaByNome(string nome)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Where(x => x.Configuracao.Identificador.ToLower() == nome.ToLower())
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            if (evento != null)
            {
                return Presenca(evento.Id);
            }
            else
            {
                return Index();
            }
        }


        public ActionResult GoToEquipe(string nome)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Where(x => x.Configuracao.Identificador.ToLower() == nome.ToLower())
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            if (evento != null)
            {
                return Inscricoes(evento.Id, "Inscrições Equipe");
            }
            else
            {
                return Index();
            }
        }

        [AllowAnonymous]
        public ActionResult LogoByNome(string nome)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Include(x => x.Configuracao.Logo)
                .Where(x => x.Configuracao.Identificador.ToLower() == nome.ToLower())
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            var arquivo = evento?.Configuracao?.Logo;

            if (arquivo != null)
            {
                return File(imageService.ResizeImageByte(arquivo.Conteudo, 50), arquivo.Tipo, arquivo.Nome);
            }
            else
            {
                return null;
            }
        }

        [AllowAnonymous]
        public ActionResult BackgroundByNome(string nome)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Include(x => x.Configuracao.Background)
                .Where(x => x.Configuracao.Identificador.ToLower() == nome.ToLower())
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            var arquivo = evento?.Configuracao?.Background;

            if (arquivo != null)
            {
                return File(imageService.ResizeImageByte(arquivo.Conteudo, 400), arquivo.Tipo, arquivo.Nome);
            }
            else
            {
                return null;
            }
        }

        [AllowAnonymous]
        public ActionResult LogoById(int id)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Include(x => x.Configuracao.Logo)
                .Where(x => x.Id == id)
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            var arquivo =
                evento?.Configuracao?.Logo
                ?? configuracaoBusiness.GetLoginQuery().Include(x => x.Logo).FirstOrDefault().Logo;

            if (arquivo != null)
            {
                return File(arquivo.Conteudo, arquivo.Tipo, arquivo.Nome);
            }
            else
            {
                return null;
            }
        }

        [AllowAnonymous]
        public ActionResult BackgroundById(int id)
        {
            var evento = eventosBusiness
                .GetEventos()
                .Include(x => x.Configuracao.Background)
                .Include(x => x.Arte)
                .Where(x => x.Id == id)
                .OrderByDescending(x => x.DataEvento)
                .FirstOrDefault();

            var arquivo = evento?.Configuracao?.Background ?? evento.Arte;

            if (arquivo != null)
            {
                return File(arquivo.Conteudo, arquivo.Tipo, arquivo.Nome);
            }
            else
            {
                return null;
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult qrcode(int eventoid, int? participanteid, int? equipanteid)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            var texto = $"{eventoid}";
            if (participanteid.HasValue)
            {
                texto += $"|{participanteid.Value}|PARTICIPANTE";
            }
            else
            {
                texto += $"|{equipanteid.Value}|EQUIPANTE";
            }
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(texto, QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);
            Bitmap qrCodeImage = qrCode.GetGraphic(20);
            var stream = new MemoryStream();
            qrCodeImage.Save(stream, System.Drawing.Imaging.ImageFormat.Png);

            return File(stream.ToArray(), "image/png");
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetEventosEndpoint()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            var eventos = eventosBusiness
                .GetEventos()
                .Where(
                    x =>
                        (
                            (
                                (
                                    (
                                        x.Status == StatusEnum.Aberto
                                        || x.Status == StatusEnum.EmBreve
                                    )
                                    || (
                                        x.StatusEquipe == StatusEnum.Aberto
                                        || x.StatusEquipe == StatusEnum.EmBreve
                                    )
                                )
                                || (
                                    x.DataEvento > DateTime.Today
                                    && x.Status == StatusEnum.Informativo
                                )
                            )
                        )
                )
                .ToList()
                .Select(
                    x =>
                        new
                        {
                            x.Id,
                            Data = $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                            x.Valor,
                            x.Numeracao,
                            Identificador = x.Configuracao?.Identificador
                                ?? x.Descricao.ToLower().Trim().Replace(" ", "-"),
                            x.DataEvento,
                            DataCalendar = x.DataEvento.ToString("yyyy-MM-dd"),
                            Titulo = x.Configuracao?.Titulo ?? x.Descricao,
                            Status = x.Status.GetDescription(),
                            StatusEquipe = x.StatusEquipe.GetDescription(),
                            BackgroundId = x.Configuracao?.BackgroundId ?? x.ArteId,
                            x.Configuracao?.CorBotao,
                            x.Conteudo,
                            x.Configuracao?.LogoId,
                            x.DataExtenso,
                            x.LinkLocal,
                            x.NomeLocal
                        }
                )
                .OrderBy(x => x.DataEvento)
                .ToList();

            var json = Json(new { Eventos = eventos }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetLoginInfo()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);

            var json = Json(
                new { Login = configuracaoBusiness.GetLoginResumido() },
                JsonRequestBehavior.AllowGet
            );
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpGet]
        public ActionResult GetBGEventoGlobal(int Id, int? size)
        {

            var evento = eventosBusiness
               .GetEventosGlobais()
               .Where(x => x.Id == Id).FirstOrDefault();

            return File(imageService.ResizeImageByte(evento.Background, size ?? 200), "image/jpeg", "Background");
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetEventosInscricao(
            string type,
            string identificador,
            string search,
            bool? isMobile,
            bool? linkBg = false
        )
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);

            var login = configuracaoBusiness.GetLoginResumido();

            var identificadores = login.Identificadores;

            var eventos = eventosBusiness
                .GetEventosGlobais()
                .Where(
                    x =>
                        (
                            (
                                (
                                    (
                                        x.Status == StatusEnum.Aberto
                                        || x.Status == StatusEnum.EmBreve
                                    )
                                    || (
                                        x.StatusEquipe == StatusEnum.Aberto
                                        || x.StatusEquipe == StatusEnum.EmBreve
                                    )
                                )
                                || (
                                    x.DataEvento > DateTime.Today
                                    && x.Status == StatusEnum.Informativo
                                )
                            )
                            && ((string.IsNullOrEmpty(search)) || UtilServices.RemoveAccents(x.TituloEvento).Contains(UtilServices.RemoveAccents(search)))
                            && (
                                 (identificadores?.Length > 0 && identificadores.Contains(x.Identificador) && identificador == x.Identificador) ||
                                (identificadores?.Length > 0 && identificadores.Contains(x.Identificador) && string.IsNullOrEmpty(identificador))
                                || (identificadores == null || identificadores.Length == 0)
                            )
                        )
                )
                .ToList()
                .Select(
                    x =>
                        new GetEventosInscricaoViewModel
                        {
                            Id = x.Id,
                            UrlDestino =
                                x.UrlExterna
                                ?? $"https://{x.Destino}/Inscricoes/Detalhes/{x.EventoId}",
                            Data =
                                $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                            Valor = type.Contains("Equipe")
                                ? (
                                    x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today)
                                        ? x.EventoLotes.Where(
                                            y => y.DataLote >= System.DateTime.Today
                                        )
                                            .OrderBy(y => y.DataLote)
                                            .FirstOrDefault()
                                            .ValorTaxa
                                        : x.ValorTaxa
                                )
                                : x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today)
                                    ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                                        .OrderBy(y => y.DataLote)
                                        .FirstOrDefault()
                                        .Valor
                                    : x.Valor,
                            Numeracao = x.Numeracao,
                            DataEvento = x.DataEvento,
                            DataCalendar = x.DataEvento.ToString("yyyy-MM-dd"),
                            Descricao = x.Descricao,
                            Identificador = x.Identificador,
                            Titulo = x.TituloEvento,
                            Status = x.Status.GetDescription(),
                            StatusEquipe = x.StatusEquipe.GetDescription(),
                            Background = (!(linkBg ?? false) && x.Background != null)
                                    ? (
                                        isMobile.HasValue && isMobile.Value
                                            ? imageService.ResizeImage(x.Background, 400)
                                            : imageService.ResizeImage(x.Background, 700)
                                    )
                                    : "",
                        }
                )
                .OrderBy(x => x.DataEvento)
                .ToList();

            var json = Json(new { Eventos = eventos }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        public ActionResult Index()
        {
            ViewBag.Action = ViewBag.Action ?? "Inscrições";
            var login = configuracaoBusiness.GetLogin();
            ViewBag.Configuracao = login;
            var igrejas = eventosBusiness
                .GetEventosGlobais()
                .Where(x => (login.Identificadores?.Length > 0 && login.Identificadores.Contains(x.Identificador)))
                .Select(x => x.Identificador)
                .Distinct()
                .ToList();
            ViewBag.Igrejas = igrejas;
            ViewBag.CountIgrejas = igrejas.Count;
            ViewBag.Title = "Inscrições";
            return View("Index");
        }

        public ActionResult Inscricoes(int Id, string Tipo, string email = "")
        {
            ViewBag.Title = Tipo;

            ViewBag.Tipo = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            if (evento == null)
                return RedirectToAction("InscricoesEncerradas", new { Id = Id });
            ViewBag.EventoId = Id;
            var config = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            ViewBag.Evento = evento;
            ViewBag.Login = configuracaoBusiness.GetLogin();
            ViewBag.Igrejas = configuracaoBusiness.GetIgrejas(evento.ConfiguracaoId.Value);
            ViewBag.Email = email;
            switch (Tipo)
            {
                case "Inscrições Equipe":
                    if (evento.StatusEquipe != StatusEnum.Aberto)
                        return RedirectToAction("InscricoesEncerradas", new { Id = Id });
                    ViewBag.Sujeito = "voluntário";
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue
                        ? configuracaoBusiness
                            .GetCamposEquipe(evento.ConfiguracaoId.Value)
                            .Select(x => x.Campo)
                            .ToList()
                        : null;
                    ViewBag.Equipes = evento.Configuracao.Equipes.Any(x => x.ShowInscricao)
                        ? evento
                            .Configuracao.Equipes.Where(x => x.ShowInscricao)
                            .Select(
                                x => new EquipeViewModel { Id = x.EquipeId, Nome = x.Equipe.Nome }
                            )
                            .ToList()
                        : evento
                            .Configuracao.Equipes.Select(
                                x => new EquipeViewModel { Id = x.EquipeId, Nome = x.Equipe.Nome }
                            )
                            .ToList();
                    if (config.TipoEventoId == TipoEventoEnum.Casais)
                        return View("Casal");
                    return View("Inscricoes");
                default:
                    if (evento.Status != StatusEnum.Aberto)
                        return RedirectToAction("InscricoesEncerradas", new { Id = Id });
                    ViewBag.Sujeito = "participante";
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue
                        ? configuracaoBusiness
                            .GetCampos(evento.ConfiguracaoId.Value)
                            .Select(x => x.Campo)
                            .ToList()
                        : null;
                    if (config.TipoEventoId == TipoEventoEnum.Casais)
                        return View("Casal");
                    return View("Inscricoes");
            }
        }

        public ActionResult Presenca(int Id)
        {
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            var reuniao = evento.Reunioes.FirstOrDefault(
                x => x.DataReuniao.Date == DateTime.Today.Date && x.Status != StatusEnum.Deletado
            );

            if (reuniao == null)
            {
                return RedirectToAction("Detalhes", new { Id = Id });
            }

            ViewBag.Reuniao = reuniao;
            ViewBag.Title = "Marcar Presença";

            ViewBag.EventoId = Id;
            var config = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            ViewBag.Login = configuracaoBusiness.GetLogin();
            return View("Presenca");
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetDetalhes(int Id)
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            if (evento.ConfiguracaoId.HasValue)
            {
                ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
                ViewBag.Login = configuracaoBusiness.GetLogin();
            }
            else
            {
                ViewBag.Configuracao = configuracaoBusiness.GetLogin();
                ViewBag.Login = ViewBag.Configuracao;
            }

            if (
                evento.StatusEquipe != StatusEnum.Aberto
                && evento.Status != StatusEnum.Aberto
                && evento.Status != StatusEnum.Informativo
            )
                return RedirectToAction("InscricoesEncerradas", new { Id = Id });

            ViewBag.Reuniao = evento.Reunioes.FirstOrDefault(
                x => x.DataReuniao.Date == DateTime.Today.Date && x.Status != StatusEnum.Deletado
            );
            ViewBag.EventoId = Id;
            evento.Valor = evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today)
                ? evento
                    .EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                    .OrderBy(y => y.DataLote)
                    .FirstOrDefault()
                    .Valor
                : evento.Valor;
            ViewBag.Evento = evento;
            ViewBag.Title = "Inscrições";

            var json = Json(new { Detalhes = new { } }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        public ActionResult Detalhes(int Id)
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            if (evento.ConfiguracaoId.HasValue)
            {
                ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
                ViewBag.Login = configuracaoBusiness.GetLogin();
            }
            else
            {
                ViewBag.Configuracao = configuracaoBusiness.GetLogin();
                ViewBag.Login = ViewBag.Configuracao;
            }

            if (
                evento.StatusEquipe != StatusEnum.Aberto
                && evento.Status != StatusEnum.Aberto
                && evento.Status != StatusEnum.Informativo
            )
                return RedirectToAction("InscricoesEncerradas", new { Id = Id });

            ViewBag.Reuniao = evento.Reunioes.FirstOrDefault(
                x => x.DataReuniao.Date == DateTime.Today.Date && x.Status != StatusEnum.Deletado
            );
            ViewBag.EventoId = Id;
            evento.Valor = evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today)
                ? evento
                    .EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                    .OrderBy(y => y.DataLote)
                    .FirstOrDefault()
                    .Valor
                : evento.Valor;
            ViewBag.Evento = evento;
            ViewBag.Title = "Inscrições";

            return View("Detalhes");
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
            ViewBag.Login = configuracaoBusiness.GetLogin();

            switch (Tipo)
            {
                case "Inscrições Equipe":
                    var eventoAtual = eventosBusiness.GetEventoById(EventoId.Value);
                    ViewBag.EventoId = eventoAtual.Id;
                    var config = configuracaoBusiness.GetConfiguracao(eventoAtual.ConfiguracaoId);
                    Equipante equipante = equipantesBusiness.GetEquipanteById(Id);
                    var ev = equipesBusiness
                        .GetQueryEquipantesEvento(eventoAtual.Id)
                        .Include(x => x.Presencas)
                        .Include(y => y.Presencas.Select(x => x.Reuniao))
                        .FirstOrDefault(x => x.EquipanteId == equipante.Id);
                    var Valor = eventoAtual.EventoLotes.Any(
                        y => y.DataLote >= System.DateTime.Today
                    )
                        ? eventoAtual
                            .EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                            .OrderBy(y => y.DataLote)
                            .FirstOrDefault()
                            .Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"))
                        : eventoAtual.Valor.ToString(
                            "C",
                            CultureInfo.CreateSpecificCulture("pt-BR")
                        );
                    ViewBag.Configuracao = config;
                    ViewBag.MsgConclusao = config
                        .MsgConclusaoEquipe.Replace("${Nome}", equipante.Nome)
                        .Replace("${EventoId}", EventoId.ToString())
                        .Replace("${Id}", equipante.Id.ToString())
                        .Replace("${Evento}", eventoAtual.Configuracao.Titulo)
                        .Replace("${NumeracaoEvento}", eventoAtual.Numeracao.ToString())
                        .Replace("${DescricaoEvento}", eventoAtual.Descricao)
                        .Replace(
                            "${ValorEvento}",
                            eventoAtual.ValorTaxa.ToString(
                                "C",
                                CultureInfo.CreateSpecificCulture("pt-BR")
                            )
                        )
                        .Replace("${DataEvento}", eventoAtual.DataEvento.ToString("dd/MM/yyyy"));
                    if (
                        !ev.Presencas.Any(
                            x =>
                                x.Reuniao.DataReuniao.Date == DateTime.Today.Date
                                && x.Reuniao.Status != StatusEnum.Deletado
                        )
                    )
                    {
                        ViewBag.Reuniao = eventoAtual.Reunioes.FirstOrDefault(
                            x =>
                                x.DataReuniao.Date == DateTime.Today.Date
                                && x.Status != StatusEnum.Deletado
                        );
                    }
                    ViewBag.QRCode =
                        $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={eventoAtual.Id.ToString()}&equipanteid={equipante.Id.ToString()}";

                    if (config.TipoEventoId == TipoEventoEnum.Casais)
                    {
                        var casal = equipantesBusiness
                            .GetEquipantes()
                            .FirstOrDefault(x => x.Conjuge == equipante.Nome);
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace(
                            "${Apelido}",
                            $"{equipante.Apelido} e {casal?.Apelido}"
                        );
                    }
                    else
                    {
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace(
                            "${Apelido}",
                            equipante.Apelido
                        );
                    }
                    ViewBag.MercadoPagoId = ev.MercadoPagoId;
                    ViewBag.MercadoPagoPreferenceId = ev.MercadoPagoPreferenceId;
                    ViewBag.PagSeguroId = ev.PagSeguroId;
                    ViewBag.PagSeguroPreferenceId = ev.PagSeguroPreferenceId;
                    ViewBag.Title = "Inscrição Concluída";
                    ViewBag.EquipanteEvento = ev;
                    return View();
                default:
                    Participante participante = participantesBusiness.GetParticipanteById(Id);
                    var eventoAtualP = eventosBusiness.GetEventoById(participante.EventoId);
                    ViewBag.EventoId = eventoAtualP.Id;
                    var configP = configuracaoBusiness.GetConfiguracao(eventoAtualP.ConfiguracaoId);
                    var ValorParticipante = participante.Evento.EventoLotes.Any(
                        y => y.DataLote >= System.DateTime.Today
                    )
                        ? participante
                            .Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                            .OrderBy(y => y.DataLote)
                            .FirstOrDefault()
                            .Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"))
                        : participante.Evento.Valor.ToString(
                            "C",
                            CultureInfo.CreateSpecificCulture("pt-BR")
                        );
                    var configParticipante = configuracaoBusiness.GetConfiguracao(
                        participante.Evento.ConfiguracaoId
                    );
                    ViewBag.Configuracao = configParticipante;
                    ViewBag.MsgConclusao = configParticipante
                        .MsgConclusao.Replace("${Nome}", participante.Nome)
                        .Replace("${Id}", participante.Id.ToString())
                        .Replace("${EventoId}", participante.EventoId.ToString())
                        .Replace("${Evento}", participante.Evento.Configuracao.Titulo)
                        .Replace("${NumeracaoEvento}", participante.Evento.Numeracao.ToString())
                        .Replace("${DescricaoEvento}", participante.Evento.Descricao)
                        .Replace("${ValorEvento}", ValorParticipante)
                        .Replace(
                            "${DataEvento}",
                            participante.Evento.DataEvento.ToString("dd/MM/yyyy")
                        )
                        .Replace(
                            "${FonePadrinho}",
                            participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? ""
                        )
                        .Replace(
                            "${NomePadrinho}",
                            participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? ""
                        );
                    ViewBag.QRCode =
                        $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={eventoAtualP.Id.ToString()}&participanteid={participante.Id.ToString()}";
                    if (configP.TipoEventoId == TipoEventoEnum.Casais)
                    {
                        var casal = participantesBusiness
                            .GetParticipantes()
                            .FirstOrDefault(
                                x =>
                                    x.Conjuge == participante.Nome
                                    && x.EventoId == participante.EventoId
                            );
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace(
                            "${Apelido}",
                            $"{participante.Apelido} e {casal.Apelido}"
                        );
                    }
                    else
                    {
                        ViewBag.MsgConclusao = ViewBag.MsgConclusao.Replace(
                            "${Apelido}",
                            participante.Apelido
                        );
                    }
                    ViewBag.MercadoPagoId = participante.MercadoPagoId;
                    ViewBag.MercadoPagoPreferenceId = participante.MercadoPagoPreferenceId;
                    ViewBag.PagSeguroId = participante.PagSeguroId;
                    ViewBag.PagSeguroPreferenceId = participante.PagSeguroPreferenceId;
                    ViewBag.Participante = new InscricaoConcluidaViewModel
                    {
                        Apelido = participante.Apelido,
                        Evento =
                            $"{configParticipante.Titulo} "
                            + $"{participante.Evento.Numeracao.ToString()}",
                        DataEvento = participante.Evento.DataEvento.ToString("dd/MM/yyyy"),
                        PadrinhoFone =
                            participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? "",
                        PadrinhoNome = participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? ""
                    };

                    ViewBag.Title = "Inscrição Concluída";
                    return View();
            }
        }

        public ActionResult InscricaoEspera(int Id)
        {
            ViewBag.Login = configuracaoBusiness.GetLogin();
            ViewBag.Title = "Inscrição em Espera";
            Participante participante = participantesBusiness.GetParticipanteById(Id);
            ViewBag.EventoId = participante.EventoId;
            var config = configuracaoBusiness.GetConfiguracao(participante.Evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            var Valor = participante.Evento.EventoLotes.Any(
                y => y.DataLote >= System.DateTime.Today
            )
                ? participante
                    .Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                    .OrderBy(y => y.DataLote)
                    .FirstOrDefault()
                    .Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"))
                : participante.Evento.Valor.ToString(
                    "C",
                    CultureInfo.CreateSpecificCulture("pt-BR")
                );
            var apelido = participante.Apelido;
            if (config.TipoEventoId == TipoEventoEnum.Casais)
            {
                var casal = participantesBusiness
                    .GetParticipantesByEvento(participante.EventoId)
                    .FirstOrDefault(
                        x => x.Conjuge == participante.Nome && x.EventoId == participante.EventoId
                    );
                apelido = $"{participante.Apelido} e {casal?.Apelido}";
            }

            ViewBag.Participante = new InscricaoConcluidaViewModel
            {
                Id = participante.Id,
                Apelido = apelido,
                Logo = participante.Evento.Configuracao.Titulo + ".png",
                Evento =
                    $"{participante.Evento.Numeracao.ToString()}º {participante.Evento.Configuracao.Titulo} {participante.Evento.Descricao}",
                Valor = Valor,
                DataEvento = participante.Evento.DataEvento.ToString("dd/MM/yyyy")
            };

            return View("InscricaoEspera");
        }

        public ActionResult InscricoesEncerradas(int Id)
        {
            ViewBag.Title = "Inscrições Encerradas";
            ViewBag.Login = configuracaoBusiness.GetLogin();
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id);
            var config = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            ViewBag.EventoId = evento.Id;
            return View();
        }

        [HttpPost]
        public ActionResult PostInscricao(PostInscricaoModel model)
        {
            var evento = eventosBusiness.GetEventoById(model.EventoId);
            var equipante = equipantesBusiness
                .GetEquipantes()
                .FirstOrDefault(x => x.Email == model.Email);

            if (!string.IsNullOrEmpty(evento.Configuracao.AccessTokenMercadoPago))
            {
                Guid g = Guid.NewGuid();
                string MercadoPagoId = g.ToString();
                model.MercadoPagoId = MercadoPagoId;
                var preference = MercadoPagoService.createPreference(MercadoPagoId, evento, evento.Valor);

                model.MercadoPagoPreferenceId = preference;
            }

            if (!string.IsNullOrEmpty(evento.Configuracao.TokenPagSeguro))
            {
                Guid g = Guid.NewGuid();
                string PagSeguroId = g.ToString();
                model.PagSeguroId = PagSeguroId;
                var preference = PagSeguroService.createCheckout(PagSeguroId, evento, evento.Valor);

                model.PagSeguroPreferenceId = preference;
            }

            if (equipante != null)
            {
                model.EquipanteId = equipante.Id;
            }

            if (
                evento != null
                && participantesBusiness
                    .GetParticipantesByEvento(model.EventoId)
                    .Where(x => x.Status != StatusEnum.Cancelado)
                    .Count() >= evento.Capacidade
            )
            {
                model.Status = "Espera";

                return Json(
                    Url.Action(
                        "InscricaoEspera",
                        new { Id = participantesBusiness.PostInscricao(model) }
                    )
                );
            }

            var config = evento.Configuracao;
            string body = string.Empty;
            using (
                StreamReader reader = new StreamReader(
                    Server.MapPath("~/EmailTemplates/Inscricao.html")
                )
            )
            {
                body = reader.ReadToEnd();
            }

            var participanteid = participantesBusiness.PostInscricao(model);

            Participante participante = participantesBusiness.GetParticipanteById(participanteid);

            var ValorParticipante = participante.Evento.EventoLotes.Any(
                y => y.DataLote >= System.DateTime.Today
            )
                ? participante
                    .Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                    .OrderBy(y => y.DataLote)
                    .FirstOrDefault()
                    .Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"))
                : participante.Evento.Valor.ToString(
                    "C",
                    CultureInfo.CreateSpecificCulture("pt-BR")
                );

            var msgConclusao = config
                .MsgConclusao.Replace("${Nome}", model.Nome)
                .Replace("${Id}", participanteid.ToString())
                .Replace("${EventoId}", evento.Id.ToString())
                .Replace("${Evento}", evento.Configuracao.Titulo)
                .Replace("${NumeracaoEvento}", evento.Numeracao.ToString())
                .Replace("${DescricaoEvento}", evento.Descricao)
                .Replace("${ValorEvento}", ValorParticipante)
                .Replace("${DataEvento}", evento.DataEvento.ToString("dd/MM/yyyy"))
                .Replace(
                    "${FonePadrinho}",
                    participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? ""
                )
                .Replace(
                    "${NomePadrinho}",
                    participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? ""
                );

            body = body.Replace("{{buttonColor}}", config.CorBotao);
            body = body.Replace(
                "{{logoEvento}}",
                $"https://{Request.Url.Authority}/{config.Identificador}/Logo"
            );
            body = body.Replace(
                "{{qrcodeParticipante}}",
                $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={evento.Id.ToString()}&participanteid={participante.Id.ToString()}"
            );

            if (config.TipoEvento == TipoEventoEnum.Casais)
            {
                var casal = participantesBusiness
                    .GetParticipantes()
                    .FirstOrDefault(
                        x => x.Conjuge == participante.Nome && x.EventoId == participante.EventoId
                    );

                if (casal != null)
                {
                    msgConclusao = msgConclusao.Replace(
                        "${Apelido}",
                        $"{participante.Apelido} e {casal.Apelido}"
                    );
                    body = body.Replace("{{msgConclusao}}", msgConclusao);

                    emailSender.SendEmail(
                        participante.Email,
                        "Confirmar Inscrição",
                        body,
                        config.Titulo
                    );
                    emailSender.SendEmail(casal.Email, "Confirmar Inscrição", body, config.Titulo);
                }
            }
            else
            {
                msgConclusao = msgConclusao.Replace("${Apelido}", participante.Apelido);
                body = body.Replace("{{msgConclusao}}", msgConclusao);

                emailSender.SendEmail(
                    participante.Email,
                    "Confirmar Inscrição",
                    body,
                    config.Titulo
                );
            }

            return Json(Url.Action("InscricaoConcluida", new { Id = participanteid }));
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
                    var equipante = equipantesBusiness
                        .GetEquipantes()
                        .FirstOrDefault(x => x.Email == Email);

                    if (
                        evento.Configuracao.VincularMontagem.HasValue
                        && evento.Configuracao.VincularMontagem.Value == true
                        && (
                            (equipante == null)
                            || (!equipante.Equipes.Any(x => x.EventoId == eventoId))
                        )
                    )
                    {
                        return Json(
                            new
                            {
                                MontagemNegado = true,
                                Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}"
                            },
                            JsonRequestBehavior.AllowGet
                        );
                    }
                    else if (
                        equipante != null
                        && equipante.Equipes != null
                        && equipante.Equipes.Any(
                            x => x.EventoId == eventoId && x.StatusMontagem == StatusEnum.Ativo
                        )
                    )
                    {
                        return Json(
                            new
                            {
                                Participante = equipante.Nome,
                                Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}",
                                Url = Url.Action(
                                    "InscricaoConcluida",
                                    new
                                    {
                                        Id = equipante.Id,
                                        EventoId = eventoId,
                                        Tipo = "Inscrições Equipe"
                                    }
                                )
                            },
                            JsonRequestBehavior.AllowGet
                        );
                    }
                    else if (equipante != null)
                    {
                        return Json(
                            new
                            {
                                Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}",
                                Montagem = equipante.Equipes.Any(
                                    x =>
                                        x.EventoId == eventoId
                                        && x.StatusMontagem == StatusEnum.Montagem
                                ),
                                Participante = mapper.Map<EquipanteListModel>(equipante)
                            },
                            JsonRequestBehavior.AllowGet
                        );
                    }
                    return Json(
                        new
                        {
                            Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}"
                        },
                        JsonRequestBehavior.AllowGet
                    );

                default:
                    var participante = participantesBusiness
                        .GetParticipantesByEvento(eventoId)
                        .FirstOrDefault(
                            x =>
                                x.Email == Email
                                && (
                                    new StatusEnum[]
                                    {
                                        StatusEnum.Confirmado,
                                        StatusEnum.Inscrito,
                                        StatusEnum.Espera
                                    }
                                ).Contains(x.Status)
                        );

                    if (participante != null && participante.Status != StatusEnum.Espera)
                        return Json(
                            new
                            {
                                Participante = participante.Nome,
                                Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}",
                                Url = Url.Action("InscricaoConcluida", new { Id = participante.Id })
                            },
                            JsonRequestBehavior.AllowGet
                        );
                    else if (participante != null && participante.Status == StatusEnum.Espera)
                        return Json(
                            new
                            {
                                Url = Url.Action("InscricaoEspera", new { Id = participante.Id })
                            }
                        );

                    var participanteConsulta = participantesBusiness.GetParticipanteConsulta(Email);

                    if (participanteConsulta != null)
                        return Json(
                            new
                            {
                                Participante = mapper.Map<EquipanteListModel>(participanteConsulta),
                                Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}"
                            },
                            JsonRequestBehavior.AllowGet
                        );

                    return Json(
                        new
                        {
                            Evento = $"{(evento.Numeracao > 0 ? $"{evento.Numeracao.ToString()}º" : "")} {evento.Configuracao.Titulo}"
                        },
                        JsonRequestBehavior.AllowGet
                    );
            }
        }
    }
}
