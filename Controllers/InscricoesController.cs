
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

namespace SysIgreja.Controllers
{
    public class InscricoesController : Controller
    {
        private readonly IParticipantesBusiness participantesBusiness;
        private readonly ICategoriaBusiness categoriaBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly ILancamentoBusiness lancamentoBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IMeioPagamentoBusiness meioPagamentoBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly INewsletterBusiness newsletterBusiness;
        private readonly IMapper mapper;

        public InscricoesController(IParticipantesBusiness participantesBusiness, ICategoriaBusiness categoriaBusiness, IEquipesBusiness equipesBusiness, IEquipantesBusiness equipantesBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, INewsletterBusiness newsletterBusiness, ILancamentoBusiness lancamentoBusiness, IMeioPagamentoBusiness meioPagamentoBusiness)
        {
            this.participantesBusiness = participantesBusiness;
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

        public class GetEventosInscricaoViewModel
        {
            public int Id { get; set; }
            public string Data { get; set; }
            public DateTime DataEvento { get; set; }
            public int Valor { get; set; }
            public int Numeracao { get; set; }
            public string Descricao { get; set; }
            public string UrlDestino { get; set; }
            public string Titulo { get; set; }
            public string Logo { get; set; }
            public string Background { get; set; }
            public string Status { get; set; }
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetEventosInscricao(string type)
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            var eventos = eventosBusiness.GetEventos().Where(x => x.DataEvento > System.DateTime.Today &&
            x.Configuracao.LogoId.HasValue &&
            x.Configuracao.BackgroundId.HasValue &&
            !string.IsNullOrEmpty(x.Configuracao.MsgConclusao)
            ).ToList().Select(x =>
            {
                var configuracao = configuracaoBusiness.GetConfiguracao(x.ConfiguracaoId);
                return new GetEventosInscricaoViewModel
                {
                    Id = x.Id,
                    Data = $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                    Valor = type.Contains("Equipe") ? (x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().ValorTaxa : x.ValorTaxa ) :
                    x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : x.Valor,
                    Numeracao = x.Numeracao,
                    Status = x.Status.GetDescription(),
                    DataEvento = x.DataEvento,
                    Descricao = x.Descricao,
                    UrlDestino = Url.Action("Detalhes", "Inscricoes", new
                    {
                        id = x.Id,
                        Tipo = type
                    }),
                    Titulo = configuracao.Titulo,
                    Logo = configuracao.Logo,
                    Background = configuracao.Background
                };
            }).ToList();

            eventos.AddRange(eventosBusiness.GetEventosGlobais().Where(x => x.Status == StatusEnum.Aberto && !eventos.Any(y => y.Id == x.EventoId && x.Destino == System.Web.HttpContext.Current.Request.Url.Authority)).ToList().Select(x => new GetEventosInscricaoViewModel
            {
                Id = x.Id,
                UrlDestino = $"https://{x.Destino}/Inscricoes/Detalhes/{x.EventoId}?Tipo={type}",
                Data = $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                Valor = type.Contains("Equipe") ? (x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().ValorTaxa : x.ValorTaxa) :
                    x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : x.Valor,
                Numeracao = x.Numeracao,
                DataEvento = x.DataEvento,
                Descricao = x.Descricao,
                Titulo = x.TituloEvento,
                Background = Convert.ToBase64String(x.Background),
                Logo = Convert.ToBase64String(x.Logo),
            }).ToList());

            var json = Json(new { Eventos = eventos.OrderBy(x => x.DataEvento) }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }      

        public ActionResult Index()
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            return View("Index");
        }

        public ActionResult Inscricoes(int Id, string Tipo, int? ConjugeId)
        {
            ViewBag.Title = Tipo;

            ViewBag.Tipo = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id && x.Status == StatusEnum.Aberto);
            if (evento == null)
                return RedirectToAction("InscricoesEncerradas", new { Id = Id });
            ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.EventoId = Id;

            switch (Tipo)
            {
                case "Inscrições Equipe":
                    ViewBag.Sujeito = "equipante";
                    ViewBag.Campos = evento.ConfiguracaoId.HasValue ? configuracaoBusiness.GetCamposEquipe(evento.ConfiguracaoId.Value).Select(x => x.Campo).ToList() : null;
                    ViewBag.Equipes = equipesBusiness.GetEquipes(Id).Select(x => new EquipeViewModel { Id = x.Id, Nome = x.Nome }).ToList();
                    if (ConjugeId.HasValue)
                    {
                        Equipante equipante = equipantesBusiness.GetEquipanteById(ConjugeId.Value);
                        ViewBag.CEP = equipante.CEP;
                        ViewBag.Numero = equipante.Numero;
                        ViewBag.Complemento = equipante.Complemento;
                        ViewBag.Referencia = equipante.Referencia;
                    }
                    return View();
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
                    return View();
            }
        }

        public ActionResult Detalhes(int Id, string Tipo, int? ConjugeId)
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            ViewBag.Title = Tipo;
            ViewBag.Tipo = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id && x.Status == StatusEnum.Aberto);
            if (evento == null)
                return RedirectToAction("InscricoesEncerradas", new
                {
                    Id = Id
                });
            ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.UrlDestino = Url.Action("Inscricoes", "Inscricoes", new
            {
                id = Id,
                Tipo = Tipo
            });
            ViewBag.EventoId = Id;
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
                    Equipante equipante = equipantesBusiness.GetEquipanteById(Id);
                    var eventoAtual = eventosBusiness.GetEventoById(EventoId.Value);
                    var config = configuracaoBusiness.GetConfiguracao(eventoAtual.ConfiguracaoId);
                    var Valor = eventoAtual.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? eventoAtual.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : eventoAtual.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
                    ViewBag.Configuracao = config;
                    ViewBag.MsgConclusao = config.MsgConclusaoEquipe
                         .Replace("${Nome}", equipante.Nome)
                          .Replace("${EventoId}", EventoId.ToString())
                                          .Replace("${Id}", equipante.Id.ToString())
                 .Replace("${Apelido}", equipante.Apelido)
                       .Replace("${Evento}", eventoAtual.Configuracao.Titulo)
                          .Replace("${NumeracaoEvento}", eventoAtual.Numeracao.ToString())
                           .Replace("${DescricaoEvento}", eventoAtual.Descricao)
                 .Replace("${ValorEvento}", eventoAtual.ValorTaxa.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")))
                 .Replace("${DataEvento}", eventoAtual.DataEvento.ToString("dd/MM/yyyy"));
                    ViewBag.Title = "Inscrição Concluída";
                    return View();
                default:
                    Participante participante = participantesBusiness.GetParticipanteById(Id);
                    var ValorParticipante = participante.Evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? participante.Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : participante.Evento.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
                    var configParticipante = configuracaoBusiness.GetConfiguracao(participante.Evento.ConfiguracaoId);
                    ViewBag.Configuracao = configParticipante;
                    ViewBag.MsgConclusao = configParticipante.MsgConclusao
                                 .Replace("${Nome}", participante.Nome)
                                          .Replace("${Id}", participante.Id.ToString())
                                          .Replace("${EventoId}", participante.EventoId.ToString())
                 .Replace("${Apelido}", participante.Apelido)
                 .Replace("${Evento}", participante.Evento.Configuracao.Titulo)
                          .Replace("${NumeracaoEvento}", participante.Evento.Numeracao.ToString())
                           .Replace("${DescricaoEvento}", participante.Evento.Descricao)
                 .Replace("${ValorEvento}", ValorParticipante)
                 .Replace("${DataEvento}", participante.Evento.DataEvento.ToString("dd/MM/yyyy"))
                 .Replace("${FonePadrinho}", participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? "")
                 .Replace("${NomePadrinho}", participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? "");
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
            ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(participante.Evento.ConfiguracaoId);
            var Valor = participante.Evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? participante.Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : participante.Evento.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
            ViewBag.Participante = new InscricaoConcluidaViewModel
            {
                Id = participante.Id,
                Apelido = participante.Apelido,
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

            switch (Tipo)
            {
                case "Inscrições Equipe":
                    var equipante = equipantesBusiness.GetEquipantes().FirstOrDefault(x => x.Fone == Email);
                    if (equipante != null && equipante.Equipes != null && equipante.Equipes.Any(x => x.EventoId == eventoId))
                    {
                        return Json(Url.Action("InscricaoConcluida", new { Id = equipante.Id, EventoId = eventoId, Tipo = "Inscrições Equipe" }));
                    }
                    else if (equipante != null)
                    {
                        return Json(new { Participante = mapper.Map<EquipanteListModel>(equipante) }, JsonRequestBehavior.AllowGet);
                    }
                    return new HttpStatusCodeResult(200);

                default:
                    var participante = participantesBusiness.GetParticipantesByEvento(eventoId).FirstOrDefault(x => x.Email == Email && (new StatusEnum[] { StatusEnum.Confirmado, StatusEnum.Inscrito, StatusEnum.Espera }).Contains(x.Status));

                    if (participante != null && participante.Status != StatusEnum.Espera)
                        return Json(Url.Action("InscricaoConcluida", new { Id = participante.Id }));
                    else if (participante != null && participante.Status == StatusEnum.Espera)
                        return Json(Url.Action("InscricaoEspera", new { Id = participante.Id }));

                    var participanteConsulta = participantesBusiness.GetParticipanteConsulta(Email);

                    if (participanteConsulta != null)
                        return Json(new { Participante = participanteConsulta }, JsonRequestBehavior.AllowGet);

                    return new HttpStatusCodeResult(200);
            }

        }
    }
}