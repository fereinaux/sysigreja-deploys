using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Data.Context;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using SysIgreja.ViewModels;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class LoginController : Controller
    {
        private readonly IAccountBusiness accountBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;

        public LoginController(IAccountBusiness accountBusiness, IEquipantesBusiness equipantesBusiness,IConfiguracaoBusiness configuracaoBusiness)
            : this(new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext())))
        {
            this.accountBusiness = accountBusiness;
            this.equipantesBusiness = equipantesBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
        }

        public LoginController(UserManager<ApplicationUser> userManager)
        {
            UserManager = userManager;
        }

        public UserManager<ApplicationUser> UserManager { get; private set; }

        [AllowAnonymous]
        public ActionResult Index()
        {

            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            ViewBag.UserHostAddress = Request.UserHostAddress;
            accountBusiness.Seed();
            return View();
            //if (Request.UserHostAddress != "::1")
            //{
            //    Response.SuppressFormsAuthenticationRedirect = true;
            //    return new HttpStatusCodeResult(401, "Não autorizado");
            //}
            //else
            //{

              
            //}
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginViewModel model)
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindAsync(model.UserName.ToLower(), model.Password.ToLower());
                if ((user != null) && (user.Status == StatusEnum.Ativo))
                {
                    await SignInAsync(user, true);

                    return RedirectToAction("Index", "Home");
                }
                else
                    ModelState.AddModelError("", "Usuário e/ou senha inválidos.");

            }

            return View("Index", model);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLogin(LoginViewModel model)
        {

            var user = await UserManager.FindAsync(model.UserName.ToLower(), model.Password.ToLower());
            if ((user != null) && (user.Status == StatusEnum.Ativo))
            {
                await SignInAsync(user, true);
                var equipante = equipantesBusiness.GetEquipanteById(user.EquipanteId.Value);
                return Json(new
                {
                    User = new
                    {
                        Id = user.Id,
                        EquipanteId = user.EquipanteId,
                        Nome = equipante.Nome,
                        Fone = equipante.Fone,
                        DataNascimento = equipante.DataNascimento.Value.ToString("dd/MM/yyyy"),
                        Sexo = equipante.Sexo.GetDescription(),
                        Email = equipante.Email
                    }
                }, JsonRequestBehavior.AllowGet);

            }
            else
                return new HttpStatusCodeResult(401, "Unauthorized");

        }


        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private async Task SignInAsync(ApplicationUser user, bool isPersistent)
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            var identity = await UserManager.CreateIdentityAsync(user, DefaultAuthenticationTypes.ApplicationCookie);
            AuthenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = isPersistent }, identity);
        }

    }
}