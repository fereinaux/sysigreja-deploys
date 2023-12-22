﻿using System.Linq;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Reunioes;
using Core.Models.Reunioes;
using SysIgreja.ViewModels;
using Utils.Constants;
using Utils.Extensions;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class ReuniaoController : SysIgrejaControllerBase
    {
        private readonly IReunioesBusiness reuniaosBusiness;
        private readonly IEquipesBusiness equipesBusiness;

        public ReuniaoController(
            IReunioesBusiness ReuniaosBusiness,
            IEquipesBusiness equipesBusiness,
            IEventosBusiness eventosBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IAccountBusiness accountBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.reuniaosBusiness = ReuniaosBusiness;
            this.equipesBusiness = equipesBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Reuniões";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        [HttpPost]
        public ActionResult GetReunioes(int EventoId)
        {
            var result = reuniaosBusiness
                .GetReunioes(EventoId)
                .Select(
                    x =>
                        new ReuniaoViewModel
                        {
                            Id = x.Id,
                            DataReuniao = x.DataReuniao,
                            Presenca = x.Presenca.Count(),
                            Pauta = x.Pauta,
                            Titulo = x.Titulo
                        }
                );

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetReuniao(int Id)
        {
            var result = reuniaosBusiness
                .GetQueryReunioes()
                .Where(x => x.Id == Id)
                .Select(
                    x =>
                        new ReuniaoViewModel
                        {
                            Id = x.Id,
                            DataReuniao = x.DataReuniao,
                            Presenca = x.Presenca.Count(),
                            Pauta = x.Pauta,
                            Titulo = x.Titulo
                        }
                )
                .FirstOrDefault();

            return Json(new { Reuniao = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostReuniao(PostReuniaoModel model)
        {
            reuniaosBusiness.PostReuniao(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteReuniao(int Id)
        {
            reuniaosBusiness.DeleteReuniao(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}
