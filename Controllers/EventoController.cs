using Arquitetura.Controller;
using Arquitetura.ViewModels;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Models;
using Core.Models.Configuracao;
using Core.Models.Eventos;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class EventoController : SysIgrejaControllerBase
    {
        private readonly IEventosBusiness eventosBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly IArquivosBusiness arquivosBusiness;
        private readonly IMapper mapper;

        public EventoController(IEventosBusiness eventosBusiness, IArquivosBusiness arquivosBusiness, IAccountBusiness accountBusiness, IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.eventosBusiness = eventosBusiness;
            this.arquivosBusiness = arquivosBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Eventos";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        public ActionResult Informativos()
        {
            ViewBag.Title = "Informativos";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }


        [HttpGet]
        public ActionResult GetTipos()
        {
            var result = configuracaoBusiness.GetConfiguracoes().Select(x => new
            {
                x.Id,
                x.Titulo
            }).ToList();


            return Json(new { Tipos = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult PopulateEventosByUser()
        {

            var user = GetApplicationUser();
            var permissoes = user.Claims.Where(x => x.ClaimType == "Permissões").Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                 .Select(x => x.Select(y => new { ConfigId = y.ConfiguracaoId, Eventos = y.Eventos, Role = y.Role })).ToList();
            List<int> eventosId = new List<int>();
            List<int> configId = new List<int>();
            var eventoPermissao = new List<EventoPermissao>();
            permissoes.ForEach(permissao =>
            {
                configId.AddRange(permissao.Where(x => x.Role == "Admin").Select(x => x.ConfigId));
                var eventos = permissao.Where(x => x.Eventos != null).Select(x => x.Eventos);
                eventos.ToList().ForEach(evento =>
                {
                    evento.ToList().ForEach(levento =>
                    {
                        eventosId.Add(levento.EventoId);
                        eventoPermissao.Add(new EventoPermissao { EventoId = levento.EventoId, Role = levento.Role });

                    });

                });

            });

            List<EventoClaimModel> eventosReturn = eventosBusiness
                .GetEventos()
                .OrderByDescending(x => x.DataEvento)
                .Where(x => eventosId.Contains(x.Id) || x.ConfiguracaoId.HasValue && configId.Contains(x.ConfiguracaoId.Value)).ToList().Select(x => new EventoClaimModel
                {
                    Role = configId.Contains(x.ConfiguracaoId.Value) ? "Admin" : eventoPermissao.FirstOrDefault(y => y.EventoId == x.Id).Role,
                    Id = x.Id,
                    ConfiguracaoId = x.ConfiguracaoId,
                    Capacidade = x.Capacidade,
                    DataEvento = x.DataEvento.ToString("dd/MM/yyyy"),
                    Numeracao = x.Numeracao,
                    AccessTokenMercadoPago = x.Configuracao.AccessTokenMercadoPago,
                    BackgroundId = x.Configuracao.BackgroundId,
                    Status = x.Status.GetDescription(),
                    StatusEquipe = x.StatusEquipe.GetDescription(),
                    TipoQuarto = x.Configuracao.TipoQuarto?.GetDescription(),
                    Valor = x.Valor,
                    ValorTaxa = x.ValorTaxa,
                    Coordenador = x.Equipantes.Any(y => y.EquipanteId == user.EquipanteId && y.EventoId == x.Id && y.Tipo == TiposEquipeEnum.Coordenador),
                    CorBotao = x.Configuracao.CorBotao,
                    EquipeCirculo = x.Configuracao.EquipeCirculo?.Nome,
                    Identificador = x.Configuracao.Identificador,
                    LogoId = x.Configuracao.LogoId,
                    LogoRelatorioId = x.Configuracao.LogoRelatorioId,
                    PublicTokenMercadoPago = x.Configuracao.PublicTokenMercadoPago,
                    Titulo = x.Configuracao.Titulo,
                    TipoEvento = x.Configuracao.TipoEvento?.GetDescription(),
                    TipoCirculo = x.Configuracao.TipoCirculo.GetDescription(),
                    Mensagens = x.Configuracao.Mensagens.Select(y => new Core.Models.Mensagem.PostMessageModel
                    {
                        Id = y.Id,
                        Conteudo = y.Conteudo,
                        Titulo = y.Titulo,
                        Tipos = y.Tipos.Split(',')
                    }),
                    MeioPagamentos = x.Configuracao.MeioPagamentos.Select(y => new MeioPagamentoModel
                    {
                        Descricao = y.Descricao,
                        Id = y.Id
                    }),
                    CentroCustos = x.Configuracao.CentroCustos.Select(y => new CentroCustoModel
                    {
                        Descricao = y.Descricao,
                        Tipo = y.Tipo.GetDescription(),
                        Id = y.Id
                    }),
                    Etiquetas = x.Configuracao.Etiquetas.Select(y => new EtiquetaModel
                    {
                        Cor = y.Cor,
                        Id = y.Id,
                        Nome = y.Nome
                    }),
                }).ToList();




            return Json(new
            {
                Eventos = (eventosReturn),
            }, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        public ActionResult PopulateLogin()
        {
            return Json(new
            {
                Login = configuracaoBusiness.GetLoginResumido()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult PopulateConfigByUser()
        {
            var user = GetApplicationUser();
            var permissoes = user.Claims.Where(x => x.ClaimType == "Permissões").Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                 .Select(x => x.Select(y => new { ConfigId = y.ConfiguracaoId, Role = y.Role })).ToList();
            List<int> configId = new List<int>();
            var eventoPermissao = new List<EventoPermissao>();
            permissoes.ForEach(permissao =>
            {
                configId.AddRange(permissao.Where(x => x.Role == "Admin").Select(x => x.ConfigId));
            });

            return Json(new
            {
                Configuracoes = mapper.Map<IEnumerable<EventoClaimModel>>(configuracaoBusiness
                .GetConfiguracoesLight()
                .Where(x => configId.Contains(x.Id))
                .OrderBy(x => x.Id)),
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetEventos()
        {
            var user = GetApplicationUser();
            var permissoes = user.Claims.Where(x => x.ClaimType == "Permissões").Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                .Select(x => x.Select(y => new { ConfigId = y.ConfiguracaoId, Eventos = y.Eventos, Role = y.Role })).ToList();
            List<int> configId = new List<int>();
            permissoes.ForEach(permissao =>
            {
                configId.AddRange(permissao.Where(x => x.Role == "Admin").Select(x => x.ConfigId));
            });


            var result = eventosBusiness.GetEventos()
                .Where(x => configId.Contains(x.ConfiguracaoId.Value) && x.ConfiguracaoId.HasValue)
                .ToList()
                .Select(x => new EventoViewModel
                {
                    Id = x.Id,
                    DataEvento = x.DataEvento,
                    Numeracao = x.Numeracao,
                    Capacidade = x.Capacidade,
                    TipoEvento = x.Configuracao.Titulo,
                    Status = x.Status.GetDescription(),
                    StatusEquipe = x.StatusEquipe.GetDescription(),
                    Valor = x.Valor.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")),
                    ValorTaxa = x.ValorTaxa.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR")),
                    QtdAnexos = arquivosBusiness.GetArquivosByEvento(x.Id).Count()
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult GetPainelEventos(DateTime dtIni, DateTime dtFim)
        {
            var query = eventosBusiness.GetEventos().Include(x => x.Lancamentos).Include(x => x.Participantes).Include(x => x.Equipantes);

            query = query.Where(x => x.DataEvento <= dtFim && x.DataEvento >= dtIni);

            var result = query.Where(x => !string.IsNullOrEmpty(x.Configuracao.Titulo) && x.Status != StatusEnum.Informativo)
                .GroupBy(x => x.ConfiguracaoId)
                .Select(x => new
                {
                    Titulo = x.Select(y => y.Configuracao.Titulo).FirstOrDefault(),
                    Eventos = x.Select(y => y.Id).Distinct().Count(),
                    Participantes = x.Sum(y => y.Participantes.Count(z => z.Status == StatusEnum.Confirmado || z.Status == StatusEnum.Checkin || z.Status == StatusEnum.Inscrito)),
                    Voluntarios = x.Sum(y => y.Equipantes.Count),
                    Total = x.Sum(y => y.Lancamentos.Where(z => z.Tipo == TiposLancamentoEnum.Receber).Select(z => z.Valor).DefaultIfEmpty(0).Sum()),
                    LogoId = x.Select(y => y.Configuracao.LogoRelatorioId != null ? y.Configuracao.LogoRelatorioId : y.Configuracao.LogoId).FirstOrDefault()

                })
                .ToList();

            return Json(new { Eventos = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetInformativos()
        {
            var result = eventosBusiness.GetEventos()
                .Where(x => !x.ConfiguracaoId.HasValue)
                .ToList()
                .Select(x => new EventoViewModel
                {
                    Id = x.Id,
                    DataEvento = x.DataEvento,
                    Descricao = x.Descricao,
                    ArteId = x.ArteId
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEvento(int Id)
        {
            var result = eventosBusiness.GetEventoById(Id);
            return Json(new { Evento = mapper.Map<PostEventoModel>(result) }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public int GetValorEvento(int Id)
        {
            var eventoAtual = eventosBusiness.GetEventoById(Id);
            var Valor = eventoAtual.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? eventoAtual.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().Valor : eventoAtual.Valor;
            return Valor;
        }

        [HttpGet]
        public int GetTaxaEvento(int Id)
        {
            var eventoAtual = eventosBusiness.GetEventoById(Id);
            var Valor = eventoAtual.EventoLotes.Any(y => y.DataLote >= System.DateTime.Today) ? eventoAtual.EventoLotes.Where(y => y.DataLote >= System.DateTime.Today).OrderBy(y => y.DataLote).FirstOrDefault().ValorTaxa : eventoAtual.ValorTaxa;
            return Valor;
        }


        [HttpPost]
        public ActionResult GetLotesEvento(int Id)
        {
            var result = eventosBusiness.GetEventoById(Id);

            var lotes = result.EventoLotes.Select(x => new LoteModel
            {
                Id = x.Id,
                DataLote = x.DataLote,
                EventoId = x.EventoId.Value,
                Valor = x.Valor,
                ValorTaxa = x.ValorTaxa
            }).ToList();

            return Json(new { data = lotes }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ToggleEventoStatusEquipe(int Id)
        {
            eventosBusiness.ToggleEventoStatusEquipe(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleEventoStatus(int Id)
        {
            eventosBusiness.ToggleEventoStatus(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostEvento(PostEventoModel model)
        {
            eventosBusiness.PostEvento(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostInformativo(PostEventoModel model)
        {
            eventosBusiness.PostInformativo(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostArte(PostArteModel model)
        {
            eventosBusiness.PostArte(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult CreateLote(LoteModel model)
        {
            eventosBusiness.CreateLote(model);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult CloneEvento(int id)
        {
            eventosBusiness.CloneEvento(id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteEvento(int Id)
        {
            eventosBusiness.DeleteEvento(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult OfertaEvento(int Id, int Valor)
        {
            eventosBusiness.OfertaEvento(Id, Valor);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteLote(int Id)
        {
            eventosBusiness.DeleteLote(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}