using Arquitetura.Controller;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Eventos;
using Core.Business.Mensagem;
using Core.Models.Mensagem;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Utils.Constants;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class MensagemController : SysIgrejaControllerBase
    {
        private readonly IMensagemBusiness mensagemBusiness;
        private readonly IEventosBusiness eventosBusiness;

        public MensagemController(IMensagemBusiness mensagemBusiness, IEventosBusiness eventosBusiness, IConfiguracaoBusiness configuracaoBusiness, IAccountBusiness accountBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.mensagemBusiness = mensagemBusiness;
            this.eventosBusiness = eventosBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Mensagens";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            return View();
        }

        [HttpPost]
        public ActionResult GetMensagens(int configuracaoId)
        {
            var result = mensagemBusiness
                .GetMensagems(configuracaoId)
                .ToList()
                .Select(x => new PostMessageModel
                {
                    Titulo = x.Titulo,
                    Conteudo = x.Conteudo,
                    Tipos = x.Tipos?.Split(','),
                    Id = x.Id
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetMensagensByTipo(int eventoId, string[] tipos)
        {
            var query = mensagemBusiness
                .GetMensagems(eventosBusiness.GetEventoById(eventoId).ConfiguracaoId.Value);

            foreach (var tipo in tipos)
            {
                query = query.Where(x => x.Tipos.Contains(tipo));
            }

            var result = query
                .ToList()
                .Select(x => new PostMessageModel
                {
                    Titulo = x.Titulo,
                    Conteudo = x.Conteudo,
                    Id = x.Id
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetMensagem(int Id)
        {
            var result = mensagemBusiness.GetMensagemById(Id);

            return Json(new { Mensagem = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult PostMensagem(PostMessageModel model)
        {
            mensagemBusiness.PostMensagem(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteMensasgem(int Id)
        {
            mensagemBusiness.DeleteMensagem(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}