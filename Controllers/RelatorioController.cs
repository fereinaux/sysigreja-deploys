using System.Web;
using System.Web.Mvc;
using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class RelatorioController : SysIgrejaControllerBase
    {
        public RelatorioController(
            IEventosBusiness eventosBusiness,
            IAccountBusiness accountBusiness,
            IConfiguracaoBusiness configuracaoBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness) { }

        public ActionResult Index()
        {
            ViewBag.Title = "Relatórios";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        public ActionResult Painel()
        {
            IsGeral();
            ViewBag.Title = "Painel de Eventos";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }
    }
}
