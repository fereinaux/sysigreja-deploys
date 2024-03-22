using System.Linq;
using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Business.Igrejas;
using Core.Models.Igreja;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class IgrejaController : SysIgrejaControllerBase
    {
        private readonly IIgrejasBusiness igrejasBusiness;

        public IgrejaController(
            IIgrejasBusiness igrejasBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IEventosBusiness eventosBusiness,
            IAccountBusiness accountBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.igrejasBusiness = igrejasBusiness;
        }

        public ActionResult Index()
        {
            IsGeral();
            ViewBag.Title = "Igrejas";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        [HttpPost]
        public ActionResult GetIgrejas()
        {
            var result = igrejasBusiness.GetIgrejas().Select(x => new { x.Id, x.Nome, });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetIgrejaById(int id)
        {
            return Json(
                new
                {
                    Igreja = igrejasBusiness
                        .GetIgrejas()
                        .Select(x => new { x.Id, x.Nome, })
                        .FirstOrDefault(x => x.Id == id)
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult PostIgreja(PostIgrejaModel model)
        {
            return Json(
                new { Igreja = igrejasBusiness.PostIgreja(model) },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult DeleteIgreja(int Id)
        {
            igrejasBusiness.DeleteIgreja(Id);

            return new HttpStatusCodeResult(200, "OK");
        }
    }
}
