﻿using Arquitetura.Controller;
using Arquitetura.ViewModels;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Models;
using Core.Models.Eventos;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System.Collections.Generic;
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
            GetConfiguracoes();
            ViewBag.Title = "Eventos";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        public ActionResult Informativos()
        {
            GetConfiguracoes();
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
                    AccessTokenMercadoPago = x.Configuracao.AccessTokenMercadoPago,
                    BackgroundId = x.Configuracao.BackgroundId,
                    Capacidade = x.Capacidade,
                    CorBotao = x.Configuracao.CorBotao,
                    DataEvento = x.DataEvento.ToString("dd/MM/yyyy"),
                    EquipeCirculo = x.Configuracao.EquipeCirculo.Nome,
                    Identificador = x.Configuracao.Identificador,
                    LogoId = x.Configuracao.LogoId,
                    LogoRelatorioId = x.Configuracao.LogoRelatorioId,
                    Numeracao = x.Numeracao,
                    PublicTokenMercadoPago = x.Configuracao.PublicTokenMercadoPago,
                    Status = x.Status.GetDescription(),
                    StatusEquipe = x.StatusEquipe.GetDescription(),
                    Titulo = x.Configuracao.Titulo,
                    TipoEvento = x.Configuracao.TipoEvento?.GetDescription(),
                    TipoCirculo = x.Configuracao.TipoCirculo.GetDescription(),
                    Valor = x.Valor,
                    ValorTaxa = x.ValorTaxa,
                    Coordenador = x.Equipantes.Any(y => y.EquipanteId == user.EquipanteId && y.EventoId == x.Id && y.Tipo == TiposEquipeEnum.Coordenador)
                }).ToList();

            return Json(new { Eventos = (eventosReturn) }, JsonRequestBehavior.AllowGet);
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