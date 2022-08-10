using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Etiquetas;
using Core.Business.Eventos;
using Core.Models.Etiquetas;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class EtiquetaController : SysIgrejaControllerBase
    {
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEtiquetasBusiness etiquetasBusiness;

        public EtiquetaController(IEventosBusiness eventosBusiness, IEtiquetasBusiness etiquetasBusiness, IConfiguracaoBusiness configuracaoBusiness, IAccountBusiness accountBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.eventosBusiness = eventosBusiness;
            this.etiquetasBusiness = etiquetasBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Marcadores";
            GetConfiguracoes();
            return View();
        }

        [HttpPost]
        public ActionResult GetEtiquetas(int configuracaoId)
        {
            var result = etiquetasBusiness
                .GetEtiquetas(configuracaoId)
                .ToList()
                .Select(x => new
                {
                    Nome = x.Nome,
                    Id = x.Id,
                    Cor = x.Cor
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetEtiquetasByEventoId(int eventoId)
        {            
            var result = etiquetasBusiness
                .GetEtiquetas(eventosBusiness.GetEventoById(eventoId).ConfiguracaoId.Value)
                .ToList()
                .Select(x => new
                {
                    Nome = x.Nome,
                    Id = x.Id,
                    Cor = x.Cor
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEtiqueta(int Id)
        {
            var result = etiquetasBusiness.GetEtiquetaById(Id);

            return Json(new { Etiqueta = new { Id = result.Id, Nome = result.Nome, Cor = result.Cor } }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult PostEtiqueta(PostEtiquetaModel model)
        {
            etiquetasBusiness.PostEtiqueta(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteEtiqueta(int Id)
        {
            etiquetasBusiness.DeleteEtiqueta(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult AddEtiqueta(int destinoId,int etiquetaId, TipoPessoaEnum tipo, int? eventoId)
        {
            etiquetasBusiness.AddEtiqueta(destinoId,etiquetaId,tipo,eventoId);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult RemoveEtiqueta(int destinoId, int etiquetaId, TipoPessoaEnum tipo, int? eventoId)
        {
            etiquetasBusiness.RemoveEtiqueta(destinoId, etiquetaId,tipo, eventoId);

            return new HttpStatusCodeResult(200);
        }
    }
}