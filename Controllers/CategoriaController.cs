﻿using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Categorias;
using Core.Business.Configuracao;
using Core.Business.Eventos;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class CategoriaController : SysIgrejaControllerBase
    {
        private readonly ICategoriaBusiness categoriaBusiness;

        public CategoriaController(
            IEventosBusiness eventosBusiness,
            ICategoriaBusiness categoriaBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IAccountBusiness accountBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.categoriaBusiness = categoriaBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Categorias";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            return View();
        }

        [HttpGet]
        public ActionResult GetCategorias()
        {
            var result = categoriaBusiness
                .GetCategorias()
                .ToList()
                .Select(x => new
                {
                    Nome = x.Nome,
                    Id = x.Id,
                    Imagem = Convert.ToBase64String(x.Imagem.Conteudo)
                });

            return Json(new { result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostCategoria(string Nome, int ArquivoId)
        {
            categoriaBusiness.PostCategoria(Nome, ArquivoId);

            return new HttpStatusCodeResult(200, "OK");
        }
    }
}
