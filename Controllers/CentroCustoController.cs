using System.Linq;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.CentroCusto;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Models.CentroCusto;
using SysIgreja.ViewModels;
using Utils.Enums;
using static Utils.Extensions.EnumExtensions;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class CentroCustoController : SysIgrejaControllerBase
    {
        private readonly ICentroCustoBusiness centroCustoBusiness;
        private readonly IEventosBusiness eventosBusiness;

        public CentroCustoController(
            ICentroCustoBusiness centroCustoBusiness,
            IEventosBusiness eventosBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IAccountBusiness accountBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.centroCustoBusiness = centroCustoBusiness;
            this.eventosBusiness = eventosBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Centros de Custo";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            ViewBag.Tipos = GetDescriptions<TiposCentroCustoEnum>().ToList();

            return View();
        }

        [HttpPost]
        public ActionResult GetCentroCustos(int configuracaoId)
        {
            var result = centroCustoBusiness
                .GetCentroCustos(configuracaoId)
                .ToList()
                .Select(x => new CentroCustoViewModel
                {
                    Descricao = x.Descricao,
                    Id = x.Id,
                    Tipo = x.Tipo.GetDescription()
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetCentroCustosByEventoId(int eventoid)
        {
            var result = centroCustoBusiness
                .GetCentroCustos(eventosBusiness.GetEventoById(eventoid).ConfiguracaoId.Value)
                .ToList()
                .Select(x => new CentroCustoViewModel
                {
                    Descricao = x.Descricao,
                    Id = x.Id,
                    Tipo = x.Tipo.GetDescription()
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetCentroCusto(int Id)
        {
            var result = centroCustoBusiness.GetCentroCustoById(Id);

            return Json(new { CentroCusto = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostCentroCusto(PostCentroCustoModel model)
        {
            return Json(
                new { CentroCusto = centroCustoBusiness.PostCentroCusto(model) },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult DeleteCentroCusto(int Id)
        {
            centroCustoBusiness.DeleteCentroCusto(Id);

            return new HttpStatusCodeResult(200, "OK");
        }
    }
}
