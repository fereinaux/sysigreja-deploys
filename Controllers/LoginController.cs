using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Data.Context;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using SysIgreja.ViewModels;
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

        public LoginController(
            IAccountBusiness accountBusiness,
            IEquipantesBusiness equipantesBusiness,
            IConfiguracaoBusiness configuracaoBusiness
        )
            : this(
                new UserManager<ApplicationUser>(
                    new UserStore<ApplicationUser>(new ApplicationDbContext())
                )
            )
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
        public ActionResult Index(string returnUrl)
        {
            if (Request.UserLanguages == null)
            {
                Response.SuppressFormsAuthenticationRedirect = true;
                return new HttpStatusCodeResult(401, "Não autorizado");
            }
            else
            {
                ViewBag.Configuracao = configuracaoBusiness.GetLogin();
                ViewBag.ReturnUrl = returnUrl;
                return View();
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginViewModel model)
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindAsync(model.UserName, model.Password);
                if ((user != null) && (user.Status == StatusEnum.Ativo))
                {
                    await SignInAsync(user, true);
                    if (!string.IsNullOrEmpty(model.RerturnUrl))
                    {
                        return Redirect(model.RerturnUrl);
                    }

                    return RedirectToAction("Index", "Home");
                }
                else
                    ModelState.AddModelError("", "Usuário e/ou senha inválidos.");
            }

            return View("Index", model);
        }

        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get { return HttpContext.GetOwinContext().Authentication; }
        }

        private async Task SignInAsync(ApplicationUser user, bool isPersistent)
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie);
            var identity = await UserManager.CreateIdentityAsync(
                user,
                DefaultAuthenticationTypes.ApplicationCookie
            );
            AuthenticationManager.SignIn(
                new AuthenticationProperties() { IsPersistent = isPersistent },
                identity
            );
        }
    }
}
