using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Utils.Constants;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class AjudaController : SysIgrejaControllerBase
    {
        public AjudaController(
            IEventosBusiness eventosBusiness,
            IAccountBusiness accountBusiness,
            IConfiguracaoBusiness configuracaoBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness) { }

        public ActionResult Index()
        {
            ViewBag.Title = "Central de Ajuda";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }
    }
}
