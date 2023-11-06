using Arquitetura.Controller;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Cracha;
using Core.Business.Eventos;
using Core.Models.Cracha;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using static Utils.Extensions.EnumExtensions;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class CrachaController : SysIgrejaControllerBase
    {
        private readonly IEventosBusiness eventosBusiness;
        private readonly ICrachaBusiness crachaBusiness;
        private readonly IMapper mapper;

        public CrachaController(IEventosBusiness eventosBusiness, ICrachaBusiness crachaBusiness, IConfiguracaoBusiness configuracaoBusiness, IAccountBusiness accountBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.eventosBusiness = eventosBusiness;
            this.crachaBusiness = crachaBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Customização de Credenciais";
            Response.AddHeader("Title", ViewBag.Title);
            GetConfiguracoes(new string[] { "Admin" });
            return View();
        }

        [HttpPost]
        public ActionResult GetCrachas(int configuracaoId)
        {
            var result = crachaBusiness.GetCrachas()
                .Where(x => x.ConfiguracaoId == configuracaoId). 
                Select(x => new
                {
                    x.Titulo,
                    x.Id
                });
            var json = Json(new { data = result.ToList() }, JsonRequestBehavior.AllowGet);
            return json;
        }

        [HttpPost]
        public ActionResult GetCrachasByEventoId(int eventoId)
        {
            var evento = eventosBusiness.GetEventoById(eventoId);
            if (evento == null)
            {
                return Json(new { data = new { } }, JsonRequestBehavior.AllowGet);
            }
            var result = crachaBusiness
                .GetCrachas()
                .Where(x => x.ConfiguracaoId == evento.ConfiguracaoId)
                .Select(x => new { x.Id, x.Titulo });
            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetCracha(int Id)
        {
            var result = crachaBusiness.GetCrachas().Where(x => x.Id.Equals(Id)).FirstOrDefault();
            return Json(new { Cracha = mapper.Map<PostCrachaModel>(result) }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult DeleteCracha(int Id)
        {
            crachaBusiness.DeleteCracha(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult CloneCracha(int Id)
        {
            crachaBusiness.CloneCracha(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult PostCracha(PostCrachaModel model)
        {
            crachaBusiness.PostCracha(model);

            return new HttpStatusCodeResult(200);
        }

    }
}