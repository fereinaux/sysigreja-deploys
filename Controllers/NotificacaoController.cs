using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Eventos;
using Core.Business.Notificacao;
using Core.Models;
using Data.Context;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class NotificacaoController : Controller
    {
        private readonly INotificacaoBusiness notificacaoBusiness;
        private readonly IAccountBusiness account;
        private readonly IEventosBusiness eventosBusiness;

        public NotificacaoController(INotificacaoBusiness notificacaoBusiness, IAccountBusiness account, IEventosBusiness eventosBusiness)
        {
            this.notificacaoBusiness = notificacaoBusiness;
            this.account = account;
            this.eventosBusiness = eventosBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Notificações";
            Response.AddHeader("Title", ViewBag.Title);

            return View();
        }

        [HttpGet]
        public ActionResult GetNotificacoesNaoLidas()
        {
            var result = notificacaoBusiness.queryNotificacoes().Where(x => x.Status == StatusEnum.NaoLido)
                .GroupBy(x => x.Tipo)
                .Select(group => new
                {
                    Titulo = group.Key,
                    Quantidade = group.Count()
                }).ToList();
            var userId = Thread.CurrentPrincipal.Identity.GetUserId();
            var configs = account.GetUsuarios().Where(x => x.Id == userId).ToList().Select(x => x.Claims
                .Where(y => y.ClaimType == "Permissões")
                .Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                .FirstOrDefault()?.Select(z =>
                    z.ConfiguracaoId)
            ).FirstOrDefault().ToList();

            var eventos = eventosBusiness.GetEventos().Where(x => x.ConfiguracaoId.HasValue && configs.Contains(x.ConfiguracaoId.Value) && x.IsPendente).ToList().Select(x => new { Id = x.Id, Valor = x.Valor, Evento = $"{x.Numeracao}º {x.Configuracao.Titulo}" }
            );

            return Json(new { Notificacoes = result, Eventos = eventos }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetNotificacoes()
        {
            var result = notificacaoBusiness.queryNotificacoes()
                .ToList()
                .Select(x => new
                {
                    x.Titulo,
                    DataCadastro = x.DataCadastro.Value.ToString("MM/dd/yyyy HH:mm:ss"),
                    x.Link
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult SetNotificacoesLidas()
        {
            notificacaoBusiness.SetNotificacoesLidas();

            return new HttpStatusCodeResult(200);
        }
    }
}
