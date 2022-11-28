﻿using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Eventos;
using Core.Models;
using Data.Context;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        private readonly IAccountBusiness accountBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;

        public AccountController(IAccountBusiness accountBusiness, IEquipantesBusiness equipantesBusiness, IEventosBusiness eventosBusiness, IConfiguracaoBusiness configuracaoBusiness)
            : this(new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext())))
        {
            this.accountBusiness = accountBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            this.equipantesBusiness = equipantesBusiness;
            this.eventosBusiness = eventosBusiness;
        }

        public AccountController(UserManager<ApplicationUser> userManager)
        {
            UserManager = userManager;
        }

        public UserManager<ApplicationUser> UserManager { get; private set; }

        public ActionResult Index()
        {
            ViewBag.Title = "Administradores";
            var user = accountBusiness.GetUsuarioById(User.Identity.GetUserId());
            if (!user.Claims.Any(x => x.ClaimType == ClaimTypes.Role && (x.ClaimValue == "Master" || x.ClaimValue == "Geral")))
            {
                return View("~/Views/NaoAutorizado/Index.cshtml");
            }
            return View();
        }


        [HttpGet]
        public ActionResult GetEquipantesByEvento(int eventoid)
        {
            var result = accountBusiness.GetEquipantesByEventoUsuario(eventoid).Select(x => new { x.Id, x.Nome }).OrderBy(x => x.Nome);

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
        }





        [HttpPost]
        public ActionResult GetUsuariosByEvento(int eventoid)
        {
            var query = accountBusiness
                .GetUsuarios()
                .ToList().Where(x => x.EquipanteId.HasValue && x.Claims.Any(y => y.ClaimType == "Permissões") && JsonConvert.DeserializeObject<List<Permissoes>>(x.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue).Any(z => z.Eventos != null && z.Eventos.Any(a => a.EventoId == eventoid))).Select(x => new
                {
                    Id = x.Id,
                    UserName = UtilServices.CapitalizarNome(x.UserName),
                    Status = x.Status.GetDescription(),
                    Nome = x.Equipante.Nome,
                    EquipanteId = x.EquipanteId,
                    Perfil = JsonConvert.DeserializeObject<List<Permissoes>>(x.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue)
                });

            return Json(new { data = query }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetUsuarios()
        {

            var query = accountBusiness
                .GetUsuarios()
                .Where(x => x.Claims.Any(y => y.ClaimType == ClaimTypes.Role && new string[] { "Admin", "Geral" }.Contains(y.ClaimValue)))
                .ToList()
                .Select(x => new UsuarioViewModel
                {
                    Id = x.Id,
                    UserName = UtilServices.CapitalizarNome(x.UserName),
                    Status = x.Status.GetDescription(),
                    EquipanteId = x.EquipanteId,
                    Perfil = x.Claims.Any(y => y.ClaimType == ClaimTypes.Role && y.ClaimValue == "Geral") ? "Administrador Geral" : "Administrador de Eventos"
                });

            return Json(new { data = query }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetUsuario(string Id)
        {
            var result = accountBusiness.GetUsuarios().ToList().Select(x => new
            {
                Id = x.Id,
                Senha = x.Senha,
                EquipanteId = x.EquipanteId,
                UserName = x.UserName,
                Perfil = x.Claims.Any(y => y.ClaimType == ClaimTypes.Role && y.ClaimValue == "Geral") ? "Geral" : "Admin",
                Eventos = x.Claims
                .Where(y => y.ClaimType == "Permissões")
                .Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                .FirstOrDefault()?.Select(z =>
                    z.ConfiguracaoId)
            }).FirstOrDefault(x => x.Id == Id);

            return Json(new { Usuario = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipantes(string Id)
        {
            var result = accountBusiness.GetEquipantesUsuario(Id).Select(x => new { x.Id, x.Nome, UserId = x.Usuario != null ? x.Usuario.Id : "", UserName = x.Usuario != null ? x.Usuario.UserName : "" }).OrderBy(x => x.Nome);

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetAvatar()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user.FotoId.HasValue)
            {
                var jsonRes = Json(Convert.ToBase64String(user.Foto.Conteudo), JsonRequestBehavior.AllowGet);
                jsonRes.MaxJsonLength = Int32.MaxValue;
                return jsonRes;
            }
            return new HttpStatusCodeResult(404);
        }

        [HttpPost]
        public ActionResult ChangePass(string senha)
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            var oldPassword = user.Senha;
            user.Senha = senha.ToLower();
            user.HasChangedPassword = true;

            UserManager.Update(user);
            UserManager.ChangePassword(User.Identity.GetUserId(), oldPassword, senha.ToLower());
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult setAvatar(int arquivoId)
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            user.FotoId = arquivoId;

            UserManager.Update(user);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult AddUsuarioEvento(int EquipanteId, int EventoId, string Perfil)
        {
            var user = accountBusiness
                .GetUsuarios().FirstOrDefault(x => x.EquipanteId == EquipanteId);
            var evento = eventosBusiness.GetEventoById(EventoId);

            List<Permissoes> permissoes = new List<Permissoes>();
            if (user == null)
            {
                var equipante = equipantesBusiness.GetEquipanteById(EquipanteId);
                string fullName = equipante.Nome;
                var names = fullName.Split(' ');
                string firstName = names[0];
                string lastName = names[names.Length - 1];
                string senha = Membership.GeneratePassword(6, 1).ToLower();
                user = new ApplicationUser()
                {
                    UserName = UtilServices.RemoveAccents($"{firstName}{lastName}".ToLower()),
                    EquipanteId = EquipanteId,
                    Status = StatusEnum.Ativo,
                    HasChangedPassword = false,
                    Senha = senha
                };
                UserManager.Create(user, senha);
                user = UserManager.FindByName(user.UserName);
                UserManager.AddClaim(user.Id, new Claim(ClaimTypes.Role, "User"));
            }
            else
            {

                permissoes = user.Claims.Any(y => y.ClaimType == "Permissões") ? JsonConvert.DeserializeObject<List<Permissoes>>(user.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue) : permissoes;
                var claims = UserManager.GetClaims(user.Id);
                if (claims.Any(x => x.Type == "Permissões"))
                {
                    UserManager.RemoveClaim(user.Id, claims.Where(x => x.Type == "Permissões").FirstOrDefault());
                }
            }

            var configPermissao = permissoes.FirstOrDefault(x => x.ConfiguracaoId == evento.ConfiguracaoId);
            var eventoPermissao = new EventoPermissao
            {
                EventoId = EventoId,
                Role = Perfil
            };


            if (configPermissao != null)
            {
                if (configPermissao.Eventos != null)
                {

                    configPermissao.Eventos.Add(eventoPermissao);
                }
                else
                {
                    configPermissao.Eventos = new List<EventoPermissao> { eventoPermissao };
                }
            }
            else
            {
                permissoes.Add(new Permissoes { ConfiguracaoId = evento.ConfiguracaoId.Value, Eventos = new List<EventoPermissao> { eventoPermissao } });

            }

            UserManager.AddClaim(user.Id, new Claim("Permissões", JsonConvert.SerializeObject(permissoes)));



            return Json(new
            {
                User = accountBusiness.GetUsuarios().Where(x => x.Id == user.Id).ToList().Select(x => new
                {
                    Id = x.Id,
                    Senha = x.Senha,
                    hasChangedPassword = x.HasChangedPassword,
                    EquipanteId = x.EquipanteId,
                    UserName = x.UserName,
                    Fone = x.Equipante.Fone,
                    Nome = x.Equipante.Nome,
                    Evento = new { Titulo = evento.Configuracao.Titulo, Numeracao = evento.Numeracao },
                    Perfil = Perfil

                }
                ).FirstOrDefault()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult DelUsuarioEvento(int EquipanteId, int EventoId, string Perfil)
        {
            var user = accountBusiness
                .GetUsuarios().FirstOrDefault(x => x.EquipanteId == EquipanteId);
            var evento = eventosBusiness.GetEventoById(EventoId);
            List<Permissoes> permissoes = JsonConvert.DeserializeObject<List<Permissoes>>(user.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue);
            var claims = UserManager.GetClaims(user.Id);
            if (claims.Any(x => x.Type == "Permissões"))
            {
                UserManager.RemoveClaim(user.Id, claims.Where(x => x.Type == "Permissões").FirstOrDefault());
            }

            var configPermissao = permissoes.FirstOrDefault(x => x.ConfiguracaoId == evento.ConfiguracaoId);

            configPermissao.Eventos.Remove(configPermissao.Eventos.FirstOrDefault(x => x.EventoId == EventoId && x.Role == Perfil));

            UserManager.AddClaim(user.Id, new Claim("Permissões", JsonConvert.SerializeObject(permissoes)));


            return Json(new
            {
                User = accountBusiness.GetUsuarios().Where(x => x.Id == user.Id).ToList().Select(x => new
                {
                    Id = x.Id,
                    Senha = x.Senha,
                    hasChangedPassword = x.HasChangedPassword,
                    EquipanteId = x.EquipanteId,
                    UserName = x.UserName,
                    Fone = x.Equipante.Fone,
                    Nome = x.Equipante.Nome,
                    Evento = new { Titulo = evento.Configuracao.Titulo, Numeracao = evento.Numeracao },
                    Perfil = Perfil

                }
                ).FirstOrDefault()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Register(RegisterViewModel model)
        {
            model.EquipanteId = model.EquipanteId > 0 ? model.EquipanteId : null;

            ApplicationUser user = null;

            if (string.IsNullOrEmpty(model.Id))
            {
                user = new ApplicationUser()
                {
                    UserName = model.UserName.ToLower(),
                    EquipanteId = model.EquipanteId,
                    Status = StatusEnum.Ativo,
                    Senha = model.Password,
                    HasChangedPassword = false
                };
                UserManager.Create(user, model.Password);
                user = UserManager.FindByName(user.UserName);

            }
            else
            {
                user = UserManager.FindById(model.Id);
                user.EquipanteId = model.EquipanteId;
                user.UserName = model.UserName.ToLower();
                user.Senha = model.Password;

                UserManager.Update(user);
                UserManager.ChangePassword(model.Id, model.OldPassword, model.Password);
                var claims = UserManager.GetClaims(user.Id);
                UserManager.RemoveClaim(user.Id, claims.Where(x => x.Type == ClaimTypes.Role).FirstOrDefault());
            }


            List<Permissoes> permissoes = new List<Permissoes>();
            if (user != null)
            {
                permissoes = user.Claims.Any(y => y.ClaimType == "Permissões") ? JsonConvert.DeserializeObject<List<Permissoes>>(user.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue) : permissoes;
                var claims = UserManager.GetClaims(user.Id);
                if (claims.Any(x => x.Type == "Permissões"))
                {
                    UserManager.RemoveClaim(user.Id, claims.Where(x => x.Type == "Permissões").FirstOrDefault());
                }
            }

            if (model.Perfil == "Admin")
            {
                model.Eventos.ForEach(evento =>
                {
                    permissoes.Add(new Permissoes
                    {
                        ConfiguracaoId = evento,
                        Role = "Admin"
                    });
                });
            }
            else
            {
                configuracaoBusiness.GetConfiguracoes().ToList().ForEach(config =>
                {
                    permissoes.Add(new Permissoes
                    {
                        ConfiguracaoId = config.Id,
                        Role = "Admin"
                    });
                });
            }


            UserManager.AddClaim(user.Id, new Claim(ClaimTypes.Role, model.Perfil));
            UserManager.AddClaim(user.Id, new Claim("Permissões", JsonConvert.SerializeObject(permissoes)));
            return Json(new
            {
                User = accountBusiness.GetUsuarios().Where(x => x.Id == user.Id).ToList().Select(x => new
                {
                    Id = x.Id,
                    Senha = x.Senha,
                    hasChangedPassword = x.HasChangedPassword,
                    EquipanteId = x.EquipanteId,
                    Fone = x.Equipante.Fone,
                    Nome = x.Equipante.Nome,
                    UserName = x.UserName,
                    Perfil = model.Perfil,
                    Eventos = model.Eventos
                }
                ).FirstOrDefault()
            }, JsonRequestBehavior.AllowGet);
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

        [AllowAnonymous]
        [HttpPost]
        public ActionResult ExternalRegister(RegisterExternalViewModel model)
        {
            ApplicationUser user = null;

            if (string.IsNullOrEmpty(model.Id))
            {
                var equipante = equipantesBusiness.PostEquipante(new Core.Models.Participantes.PostInscricaoModel
                {
                    Nome = model.Nome,
                    Sexo = model.Sexo == "Masculino" ? SexoEnum.Masculino : SexoEnum.Feminino,
                    Apelido = model.Nome,
                    Fone = model.Fone,
                    DataNascimento = DateTime.ParseExact(model.DataNascimento, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture),
                    Email = model.Email
                });


                user = new ApplicationUser()
                {
                    UserName = model.UserName.ToLower(),
                    EquipanteId = equipante.Id,
                    Status = StatusEnum.Ativo,
                    Senha = model.Password,
                    HasChangedPassword = false
                };
                UserManager.Create(user, model.Password);
                user = UserManager.FindByName(user.UserName);

                
            }
            else
            {
                user = UserManager.FindById(model.Id);

                equipantesBusiness.PostEquipante(new Core.Models.Participantes.PostInscricaoModel
                {
                    Id = user.EquipanteId.Value,
                    Nome = model.Nome,
                    Sexo = model.Sexo == "Masculino" ? SexoEnum.Masculino : SexoEnum.Feminino,
                    Apelido = model.Nome,
                    Fone = model.Fone,
                    DataNascimento = DateTime.ParseExact(model.DataNascimento, "dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture),
                    Email = model.Email
                });
                var claims = UserManager.GetClaims(user.Id);
                UserManager.RemoveClaim(user.Id, claims.Where(x => x.Type == ClaimTypes.Role).FirstOrDefault());
            }

            List<Permissoes> permissoes = new List<Permissoes>();
            if (user != null)
            {
                var claims = UserManager.GetClaims(user.Id);
                if (claims.Any(x => x.Type == "Permissões"))
                {
                    UserManager.RemoveClaim(user.Id, claims.Where(x => x.Type == "Permissões").FirstOrDefault());
                }
            }

            permissoes.Add(new Permissoes
            {
                ConfiguracaoId = 0,
                Role = "Membro",
                Eventos = new List<EventoPermissao>()
            });

            UserManager.AddClaim(user.Id, new Claim(ClaimTypes.Role, "Membro"));
            UserManager.AddClaim(user.Id, new Claim("Permissões", JsonConvert.SerializeObject(permissoes)));

            return Json(new
            {
                User = accountBusiness.GetUsuarios().Where(x => x.Id == user.Id).ToList().Select(x => new
                {
                    Id = x.Id,
                    EquipanteId = x.EquipanteId,
                    Nome = x.Equipante.Nome,
                    Fone = x.Equipante.Fone,
                    DataNascimento = x.Equipante.DataNascimento.Value.ToString("dd/MM/yyyy"),
                    Sexo = x.Equipante.Sexo.GetDescription(),
                    Email = x.Equipante.Email
                }
                ).FirstOrDefault()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ToggleUsuarioStatus(string Id)
        {
            accountBusiness.ToggleUsuarioStatus(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteUsuario(string Id)
        {
            accountBusiness.DeleteUsuario(Id);
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Disassociate(string loginProvider, string providerKey)
        {
            ManageMessageId? message = null;
            IdentityResult result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(), new UserLoginInfo(loginProvider, providerKey));
            if (result.Succeeded)
            {
                message = ManageMessageId.RemoveLoginSuccess;
            }
            else
            {
                message = ManageMessageId.Error;
            }
            return RedirectToAction("Manage", new { Message = message });
        }
        //
        // POST: /Account/LinkLogin
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LinkLogin(string provider)
        {
            // Request a redirect to the external login provider to link a login for the current user
            return new ChallengeResult(provider, Url.Action("LinkLoginCallback", "Account"), User.Identity.GetUserId());
        }

        //
        // GET: /Account/LinkLoginCallback
        public async Task<ActionResult> LinkLoginCallback()
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync(XsrfKey, User.Identity.GetUserId());
            if (loginInfo == null)
            {
                return RedirectToAction("Manage", new { Message = ManageMessageId.Error });
            }
            var result = await UserManager.AddLoginAsync(User.Identity.GetUserId(), loginInfo.Login);
            if (result.Succeeded)
            {
                return RedirectToAction("Manage");
            }
            return RedirectToAction("Manage", new { Message = ManageMessageId.Error });
        }

        //
        // POST: /Account/LogOff
        [HttpPost]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut();
            return RedirectToAction("Index", "Home");
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        [ChildActionOnly]
        public ActionResult RemoveAccountList()
        {
            var linkedAccounts = UserManager.GetLogins(User.Identity.GetUserId());
            ViewBag.ShowRemoveButton = HasPassword() || linkedAccounts.Count > 1;
            return (ActionResult)PartialView("_RemoveAccountPartial", linkedAccounts);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && UserManager != null)
            {
                UserManager.Dispose();
                UserManager = null;
            }
            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
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

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private bool HasPassword()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                return user.PasswordHash != null;
            }
            return false;
        }

        public enum ManageMessageId
        {
            ChangePasswordSuccess,
            SetPasswordSuccess,
            RemoveLoginSuccess,
            Error
        }

        private class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri) : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties() { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
}
