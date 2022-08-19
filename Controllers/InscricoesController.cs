
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Newsletter;
using Core.Business.Participantes;
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
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly ILancamentoBusiness lancamentoBusiness;
        private readonly IMeioPagamentoBusiness meioPagamentoBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly INewsletterBusiness newsletterBusiness;

        public InscricoesController(IParticipantesBusiness participantesBusiness, IEquipantesBusiness equipantesBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, INewsletterBusiness newsletterBusiness, ILancamentoBusiness lancamentoBusiness, IMeioPagamentoBusiness meioPagamentoBusiness)
        {
            this.participantesBusiness = participantesBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            this.equipantesBusiness = equipantesBusiness;
            this.meioPagamentoBusiness = meioPagamentoBusiness;
            this.lancamentoBusiness = lancamentoBusiness;
            this.eventosBusiness = eventosBusiness;
            this.newsletterBusiness = newsletterBusiness;
        }


        public ActionResult loadLP(string action)
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);
            ViewBag.Title = action;
            ViewBag.Action = action;
            var eventos = eventosBusiness.GetEventos().Where(x => x.Status == StatusEnum.Aberto).ToList().Select(x => new InscricoesViewModel
            {
                Id = x.Id,
                Data = $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                Valor = x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : x.Valor,
                ValorTaxa = x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().ValorTaxa : x.ValorTaxa,
                Numeracao = x.Numeracao,
                DataEvento = x.DataEvento,
                Descricao = x.Descricao,
                UrlDestino = Url.Action("Detalhes", "Inscricoes", new
                {
                    id = x.Id,
                    Tipo = action
                }),
                Configuracao = configuracaoBusiness.GetConfiguracao(x.ConfiguracaoId)
            }).ToList();

            eventos.AddRange(eventosBusiness.GetEventosGlobais().Where(x => x.Status == StatusEnum.Aberto && !eventos.Any(y => y.Id == x.EventoId && x.Destino == System.Web.HttpContext.Current.Request.Url.Authority)).ToList().Select(x => new InscricoesViewModel
            {
                Id = x.Id,
                UrlDestino = $"https://{x.Destino}/Detalhes/{x.EventoId}?Tipo={action}",
                Data = $"{x.DataEvento.ToString("dd")} de {x.DataEvento.ToString("MMMM")} de {x.DataEvento.ToString("yyyy")}",
                Valor = x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : x.Valor,
                ValorTaxa = x.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? x.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().ValorTaxa : x.ValorTaxa,
                Numeracao = x.Numeracao,
                DataEvento = x.DataEvento,
                Descricao = x.Descricao,
                Configuracao = new Core.Models.Configuracao.PostConfiguracaoModel
                {
                    Titulo = x.TituloEvento,
                    Background = Convert.ToBase64String(x.Background),
                    Logo = Convert.ToBase64String(x.Logo),
                }
            }).ToList());

            if (eventos.Count == 0)
                return RedirectToAction("InscricoesEncerradas");
            else if (eventos.Count == 1)
                return RedirectToAction("Inscricoes", new { Id = eventos.FirstOrDefault().Id, Tipo = action });
            ViewBag.Eventos = eventos.OrderBy(x => x.DataEvento);
            ViewBag.Destaque = eventos.OrderBy(x => x.DataEvento).First();
            return View("Index");
        }

        public ActionResult Index()
        {
            ViewBag.Login = configuracaoBusiness.GetLogin();
            return loadLP("Inscrições");
        }

        public ActionResult Inscricoes(int Id, string Tipo, int? ConjugeId)
        {
            ViewBag.Title = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id && x.Status == StatusEnum.Aberto);
            if (evento == null)
                return RedirectToAction("InscricoesEncerradas");
            ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(evento.ConfiguracaoId);
            ViewBag.Campos = evento.ConfiguracaoId.HasValue ? configuracaoBusiness.GetCampos(evento.ConfiguracaoId.Value).Select(x => x.Campo).ToList() : null;
            ViewBag.EventoId = Id;

            switch (Tipo)
            {
                case "Inscrições Equipe":
                    if (ConjugeId.HasValue)
                    {
                        Equipante equipante = equipantesBusiness.GetEquipanteById(ConjugeId.Value);
                        ViewBag.CEP = equipante.CEP;
                        ViewBag.Numero = equipante.Numero;
                        ViewBag.Complemento = equipante.Complemento;
                        ViewBag.Referencia = equipante.Referencia;
                    }
                    return View("Equipe");
                default:
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

        public ActionResult Detalhes(int Id, string Tipo)
        {
            ViewBag.Title = Tipo;
            var evento = eventosBusiness.GetEventos().FirstOrDefault(x => x.Id == Id && x.Status == StatusEnum.Aberto);
            if (evento == null)
                return RedirectToAction("InscricoesEncerradas");
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
                    return View("Equipe");
                default:
                    return View();
            }
        }

        public ActionResult Equipe()
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            return loadLP("Inscrições Equipe");
        }
        private bool CapacidadeUltrapassada(Evento evento, StatusEnum[] arrStatus)
        {
            return participantesBusiness
                            .GetParticipantesByEvento(evento.Id)
                            .Where(x => (arrStatus).Contains(x.Status))
                            .Count() >= evento.Capacidade;
        }

        public ActionResult InscricaoConcluida(int Id)
        {
            Participante participante = participantesBusiness.GetParticipanteById(Id);
            var Valor = participante.Evento.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? participante.Evento.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")) : participante.Evento.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));
            var config = configuracaoBusiness.GetConfiguracao(participante.Evento.ConfiguracaoId);
            ViewBag.Configuracao = config;
            ViewBag.MsgConclusao = config.MsgConclusao
                         .Replace("${Nome}", participante.Nome)
                                  .Replace("${Id}", participante.Id.ToString())
                                  .Replace("${EventoId}", participante.EventoId.ToString())
         .Replace("${Apelido}", participante.Apelido)
         .Replace("${Evento}", participante.Evento.Configuracao.Titulo)
                  .Replace("${NumeracaoEvento}", participante.Evento.Numeracao.ToString())
                   .Replace("${DescricaoEvento}", participante.Evento.Descricao)
         .Replace("${ValorEvento}", Valor)
         .Replace("${DataEvento}", participante.Evento.DataEvento.ToString("dd/MM/yyyy"))
         .Replace("${FonePadrinho}", participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? "")
         .Replace("${NomePadrinho}", participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? "");
            ViewBag.Participante = new InscricaoConcluidaViewModel
            {
                Apelido = participante.Apelido,
                Evento = $"{config.Titulo} " +
                $"{participante.Evento.Numeracao.ToString()}",
                DataEvento = participante.Evento.DataEvento.ToString("dd/MM/yyyy"),
                PadrinhoFone = participante.Padrinho?.EquipanteEvento?.Equipante?.Fone ?? "",
                PadrinhoNome = participante.Padrinho?.EquipanteEvento?.Equipante?.Nome ?? ""
            };
            if (participante.Status == StatusEnum.Inscrito)
            {

                return View("InscricaoConcluida");
            }
            else
                return View("InscricaoCompleta");
        }

        public ActionResult InscricaoEspera(int Id)
        {
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

        public ActionResult InscricoesEncerradas()
        {
            ViewBag.Configuracao = configuracaoBusiness.GetConfiguracao(null);
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
        public ActionResult VerificaCadastro(string Email, int eventoId)
        {
            var participante = participantesBusiness.GetParticipantesByEvento(eventoId).FirstOrDefault(x => x.Email == Email && (new StatusEnum[] { StatusEnum.Confirmado, StatusEnum.Inscrito }).Contains(x.Status));

            if (participante != null)
                return Json(Url.Action("InscricaoConcluida", new { Id = participante.Id }));

            var participanteConsulta = participantesBusiness.GetParticipanteConsulta(Email);

            if (participanteConsulta != null)
                return Json(new { Participante = participanteConsulta }, JsonRequestBehavior.AllowGet);

            return new HttpStatusCodeResult(200);
        }


    }
}