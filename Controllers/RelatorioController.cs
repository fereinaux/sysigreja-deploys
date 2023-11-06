using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using System.Web.Mvc;
using Utils.Constants;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class RelatorioController : SysIgrejaControllerBase
    {
        public RelatorioController(IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IConfiguracaoBusiness configuracaoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Relatórios";
            Response.AddHeader("Title", ViewBag.Title);
            GetEventos(new string[] { "Admin" });

            return View();
        }

    }
}