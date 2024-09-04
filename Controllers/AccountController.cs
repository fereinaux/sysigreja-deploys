using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Eventos;
using Core.Models.Equipantes;
using Data.Context;
using Data.Entities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        private readonly IAccountBusiness accountBusiness;
        private readonly IEmailSender emailSender;
        private readonly IImageService imageService;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly IMapper mapper;

        public AccountController(
            IAccountBusiness accountBusiness,
            IEquipantesBusiness equipantesBusiness,
            IImageService imageService,
            IEmailSender emailSender,
            IEventosBusiness eventosBusiness,
            IConfiguracaoBusiness configuracaoBusiness
        )
            : this(
                new UserManager<ApplicationUser>(
                    new UserStore<ApplicationUser>(new ApplicationDbContext())
                )
            )
        {
            this.accountBusiness = accountBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            this.equipantesBusiness = equipantesBusiness;
            this.eventosBusiness = eventosBusiness;
            this.emailSender = emailSender;
            this.imageService = imageService;
            mapper = new MapperRealidade().mapper;
        }

        public AccountController(UserManager<ApplicationUser> userManager)
        {
            UserManager = userManager;

            UserManager.UserValidator = new UserValidator<ApplicationUser>(UserManager)
            {
                AllowOnlyAlphanumericUserNames = false
            };
        }

        public UserManager<ApplicationUser> UserManager { get; private set; }

        public ActionResult Index()
        {
            ViewBag.Title = "Organizadores";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            var user = accountBusiness.GetUsuarioById(User.Identity.GetUserId());
            if (!user.Claims.Any(x => x.ClaimType == ClaimTypes.Role && x.ClaimValue == "Geral"))
            {
                return View("~/Views/NaoAutorizado/Index.cshtml");
            }
            return View();
        }

        [HttpGet]
        public ActionResult GetEquipantesByEvento(int eventoid, string Search)
        {
            var result = accountBusiness
                .GetEquipantesByEventoUsuario(eventoid, Search)
                .Select(x => new { id = x.Id, text = $"{x.Nome} - {x.Apelido}" })
                .OrderBy(x => x.text);

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetUsuariosByEvento(int eventoid)
        {
            var query = accountBusiness
                .GetUsuarios()
                .ToList()
                .Where(x =>
                    x.EquipanteId.HasValue
                    && x.Claims.Any(y => y.ClaimType == "Permissões")
                    && JsonConvert
                        .DeserializeObject<List<Permissoes>>(
                            x.Claims.Where(y => y.ClaimType == "Permissões")
                                .FirstOrDefault()
                                .ClaimValue
                        )
                        .Any(z => z.Eventos != null && z.Eventos.Any(a => a.EventoId == eventoid))
                )
                .Select(x => new
                {
                    Id = x.Id,
                    UserName = x.UserName,
                    Status = x.Status.GetDescription(),
                    Nome = x.Equipante.Nome,
                    EquipanteId = x.EquipanteId,
                    Perfil = JsonConvert.DeserializeObject<List<Permissoes>>(
                        x.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue
                    )
                });

            return Json(new { data = query }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetUsuarios()
        {
            var query = accountBusiness
                .GetUsuarios()
                .Where(x =>
                    x.Claims.Any(y =>
                        y.ClaimType == ClaimTypes.Role
                        && new string[] { "Admin", "Geral" }.Contains(y.ClaimValue)
                    )
                )
                .ToList()
                .Select(x => new UsuarioViewModel
                {
                    Id = x.Id,
                    UserName = x.UserName,
                    Status = x.Status.GetDescription(),
                    EquipanteId = x.EquipanteId,
                    Perfil = x.Claims.Any(y =>
                        y.ClaimType == ClaimTypes.Role && y.ClaimValue == "Geral"
                    )
                        ? "Administrador Geral"
                        : "Administrador de Eventos"
                });

            return Json(new { data = query }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetUsuario(string Id)
        {
            var result = accountBusiness
                .GetUsuarios()
                .ToList()
                .Select(x => new
                {
                    Id = x.Id,
                    Senha = x.Senha,
                    EquipanteId = x.EquipanteId,
                    UserName = x.UserName,
                    Perfil = x.Claims.Any(y =>
                        y.ClaimType == ClaimTypes.Role && y.ClaimValue == "Geral"
                    )
                        ? "Geral"
                        : "Admin",
                    Nome = x.Equipante != null ? $"{x.Equipante.Nome} - {x.Equipante.Apelido}" : "",
                    Eventos = x
                        .Claims.Where(y => y.ClaimType == "Permissões")
                        .Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                        .FirstOrDefault()
                        ?.Where(y => y.Role == "Admin" || y.Eventos.Any(z => z.Role == "Admin"))
                        .Select(z => z.ConfiguracaoId)
                })
                .FirstOrDefault(x => x.Id == Id);

            return Json(new { Usuario = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetUsuarioByEquipanteId(int Id)
        {
            var result = accountBusiness
                .GetUsuarios()
                .ToList()
                .Select(x => new
                {
                    Id = x.Id,
                    Senha = x.Senha,
                    EquipanteId = x.EquipanteId.HasValue ? x.EquipanteId.Value : 0,
                    UserName = x.UserName,
                    Perfil = x.Claims.Any(y =>
                        y.ClaimType == ClaimTypes.Role && y.ClaimValue == "Geral"
                    )
                        ? "Geral"
                        : "Admin",
                    Nome = x.Equipante != null ? $"{x.Equipante.Nome} - {x.Equipante.Apelido}" : "",
                    Eventos = x
                        .Claims.Where(y => y.ClaimType == "Permissões")
                        .Select(z => JsonConvert.DeserializeObject<List<Permissoes>>(z.ClaimValue))
                        .FirstOrDefault()
                        ?.Select(z => z.ConfiguracaoId)
                        .ToList()
                })
                .FirstOrDefault(x => x.EquipanteId == Id);

            if (result == null)
            {
                var equipante = equipantesBusiness.GetEquipanteById(Id);

                result = new
                {
                    Id = "",
                    Senha = Membership.GeneratePassword(6, 1),
                    EquipanteId = equipante.Id,
                    UserName = equipante.Email,
                    Perfil = "Admin",
                    Nome = equipante.Nome,
                    Eventos = new List<int>()
                };
            }

            return Json(new { Usuario = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipantes(string Id, string Search)
        {
            var result = accountBusiness
                .GetEquipantesUsuario(Id, Search)
                .Select(x => new { id = x.Id, text = $"{x.Nome} - {x.Apelido}" })
                .OrderBy(x => x.text);

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetAvatar()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user.FotoId.HasValue)
            {
                var jsonRes = Json(
                    Convert.ToBase64String(user.Foto.Conteudo),
                    JsonRequestBehavior.AllowGet
                );
                jsonRes.MaxJsonLength = Int32.MaxValue;
                return jsonRes;
            }
            return new HttpStatusCodeResult(404, "Não encontrado");
        }

        [HttpGet]
        public ActionResult GetUsuarioLogado()
        {
            var userId = User.Identity.GetUserId();
            var result = accountBusiness.GetUsuarios().FirstOrDefault(x => x.Id == userId);
            var user = mapper.Map<EquipanteUser>(result);
            user.IsGeral = User.IsInRole("Geral");

            return Json(new { Usuario = user }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ChangePass(string senha)
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            var oldPassword = user.Senha;
            user.Senha = senha;
            user.HasChangedPassword = true;

            UserManager.Update(user);
            UserManager.ChangePassword(User.Identity.GetUserId(), oldPassword, senha);
            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult ExternalDelete()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            accountBusiness.DeleteUsuario(user.Id);
            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult setAvatar(int arquivoId)
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            user.FotoId = arquivoId;

            UserManager.Update(user);
            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult AddUsuarioEvento(int EquipanteId, int EventoId, string Perfil)
        {
            var user = accountBusiness
                .GetUsuarios()
                .FirstOrDefault(x => x.EquipanteId == EquipanteId);
            var evento = eventosBusiness.GetEventoById(EventoId);
            var config = configuracaoBusiness.GetConfiguracaoByEventoId(EventoId);

            var equipante = equipantesBusiness.GetEquipanteById(EquipanteId);
            List<Permissoes> permissoes = new List<Permissoes>();
            if (user == null)
            {
                string fullName = equipante.Nome;
                var names = fullName.Split(' ');
                string firstName = names[0];
                string lastName = names[names.Length - 1];
                string senha = Membership.GeneratePassword(6, 1);
                user = new ApplicationUser()
                {
                    UserName = equipante.Email,
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
                permissoes = user.Claims.Any(y => y.ClaimType == "Permissões")
                    ? JsonConvert.DeserializeObject<List<Permissoes>>(
                        user.Claims.Where(y => y.ClaimType == "Permissões")
                            .FirstOrDefault()
                            .ClaimValue
                    )
                    : permissoes;
                var claims = UserManager.GetClaims(user.Id);
                if (claims.Any(x => x.Type == "Permissões"))
                {
                    UserManager.RemoveClaim(
                        user.Id,
                        claims.Where(x => x.Type == "Permissões").FirstOrDefault()
                    );
                }
            }

            var configPermissao = permissoes.FirstOrDefault(x =>
                x.ConfiguracaoId == evento.ConfiguracaoId
            );
            var eventoPermissao = new EventoPermissao { EventoId = EventoId, Role = Perfil };

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
                permissoes.Add(
                    new Permissoes
                    {
                        ConfiguracaoId = evento.ConfiguracaoId.Value,
                        Eventos = new List<EventoPermissao> { eventoPermissao }
                    }
                );
            }

            UserManager.AddClaim(
                user.Id,
                new Claim("Permissões", JsonConvert.SerializeObject(permissoes))
            );

            accountBusiness.sendUser(user, equipante, config, Perfil, evento);

            return Json(
                new
                {
                    User = accountBusiness
                        .GetUsuarios()
                        .Where(x => x.Id == user.Id)
                        .ToList()
                        .Select(x => new
                        {
                            Id = x.Id,
                            Senha = x.Senha,
                            hasChangedPassword = x.HasChangedPassword,
                            EquipanteId = x.EquipanteId,
                            UserName = x.UserName,
                            Fone = x.Equipante.Fone,
                            Nome = x.Equipante.Nome,
                            Evento = new
                            {
                                Titulo = evento.Configuracao.Titulo,
                                Numeracao = evento.Numeracao
                            },
                            Perfil = Perfil
                        })
                        .FirstOrDefault()
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult DelUsuarioEvento(int EquipanteId, int EventoId, string Perfil)
        {
            var user = accountBusiness
                .GetUsuarios()
                .FirstOrDefault(x => x.EquipanteId == EquipanteId);
            var evento = eventosBusiness.GetEventoById(EventoId);
            List<Permissoes> permissoes = JsonConvert.DeserializeObject<List<Permissoes>>(
                user.Claims.Where(y => y.ClaimType == "Permissões").FirstOrDefault().ClaimValue
            );
            var claims = UserManager.GetClaims(user.Id);
            if (claims.Any(x => x.Type == "Permissões"))
            {
                UserManager.RemoveClaim(
                    user.Id,
                    claims.Where(x => x.Type == "Permissões").FirstOrDefault()
                );
            }

            var configPermissao = permissoes.FirstOrDefault(x =>
                x.ConfiguracaoId == evento.ConfiguracaoId
            );

            configPermissao.Eventos.Remove(
                configPermissao.Eventos.FirstOrDefault(x =>
                    x.EventoId == EventoId && x.Role == Perfil
                )
            );

            UserManager.AddClaim(
                user.Id,
                new Claim("Permissões", JsonConvert.SerializeObject(permissoes))
            );

            return Json(
                new
                {
                    User = accountBusiness
                        .GetUsuarios()
                        .Where(x => x.Id == user.Id)
                        .ToList()
                        .Select(x => new
                        {
                            Id = x.Id,
                            Senha = x.Senha,
                            hasChangedPassword = x.HasChangedPassword,
                            EquipanteId = x.EquipanteId,
                            UserName = x.UserName,
                            Fone = x.Equipante.Fone,
                            Nome = x.Equipante.Nome,
                            Evento = new
                            {
                                Titulo = evento.Configuracao.Titulo,
                                Numeracao = evento.Numeracao
                            },
                            Perfil = Perfil
                        })
                        .FirstOrDefault()
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult Register(RegisterViewModel model)
        {
            model.EquipanteId = model.EquipanteId > 0 ? model.EquipanteId : null;
            var configs = configuracaoBusiness.GetConfiguracoesLight().OrderBy(x => x.Id).ToList();

            ApplicationUser user = null;

            if (string.IsNullOrEmpty(model.Id))
            {
                user = new ApplicationUser()
                {
                    UserName = model.UserName,
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
                user.UserName = model.UserName;
                user.Senha = model.Password;

                UserManager.Update(user);
                UserManager.ChangePassword(model.Id, model.OldPassword, model.Password);
                var claims = UserManager.GetClaims(user.Id);
                UserManager.RemoveClaim(
                    user.Id,
                    claims.Where(x => x.Type == ClaimTypes.Role).FirstOrDefault()
                );
            }

            List<Permissoes> permissoes = new List<Permissoes>();
            List<Permissoes> permissoesNaoAdm = new List<Permissoes>();
            if (user != null)
            {
                permissoes = (
                    user.Claims.Any(y => y.ClaimType == "Permissões")
                        ? JsonConvert.DeserializeObject<List<Permissoes>>(
                            user.Claims.Where(y => y.ClaimType == "Permissões")
                                .FirstOrDefault()
                                .ClaimValue
                        )
                        : permissoes
                );
                permissoesNaoAdm = permissoes
                    .Where(x => x.Role != "Admin" && !x.Eventos.Any(y => y.Role == "Admin"))
                    .ToList();
                permissoes = permissoes
                    .Where(x => x.Role == "Admin" || x.Eventos.Any(y => y.Role == "Admin"))
                    .ToList();
                var claims = UserManager.GetClaims(user.Id);
                if (claims.Any(x => x.Type == "Permissões"))
                {
                    UserManager.RemoveClaim(
                        user.Id,
                        claims.Where(x => x.Type == "Permissões").FirstOrDefault()
                    );
                }
            }

            if (model.Perfil == "Admin")
            {
                model.Eventos.ForEach(evento =>
                {
                    permissoes.Add(new Permissoes { ConfiguracaoId = evento, Role = "Admin" });
                });
            }
            else
            {
                configs.ForEach(config =>
                {
                    permissoes.Add(new Permissoes { ConfiguracaoId = config.Id, Role = "Admin" });
                });
            }

            permissoes.AddRange(permissoesNaoAdm);

            UserManager.AddClaim(user.Id, new Claim(ClaimTypes.Role, model.Perfil));
            UserManager.AddClaim(
                user.Id,
                new Claim("Permissões", JsonConvert.SerializeObject(permissoes))
            );

            var novoUser = accountBusiness
                .GetUsuarios()
                .Include(x => x.Equipante)
                .Where(x => x.Id == user.Id)
                .ToList()
                .Select(x => new
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
                })
                .FirstOrDefault();

            return Json(new { User = novoUser }, JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        public ActionResult RecuperarSenha(string id)
        {
            ViewBag.Configuracao = configuracaoBusiness.GetLogin();
            if (!string.IsNullOrEmpty(id))
            {
                var usuario = accountBusiness
                    .GetUsuarios()
                    .FirstOrDefault(x => x.RecoveryKey == id);
                if (usuario != null)
                {
                    ViewBag.Tipo = "Recovery";
                    ViewBag.RecoveryKey = id;
                }
                else
                {
                    return View("~/Views/NaoAutorizado/Index.cshtml");
                }
            }
            else
            {
                ViewBag.Tipo = "Forgot";
            }
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult ResetPassword(string RecoveryKey, string Password)
        {
            var usuario = accountBusiness
                .GetUsuarios()
                .FirstOrDefault(x =>
                    x.RecoveryKey == RecoveryKey && !string.IsNullOrEmpty(RecoveryKey)
                );
            if (usuario != null)
            {
                var user = UserManager.FindById(usuario.Id);
                var oldPassword = user.Senha;
                user.Senha = Password;
                user.HasChangedPassword = true;
                user.RecoveryKey = null;

                UserManager.ChangePassword(user.Id, oldPassword, Password);
                UserManager.Update(user);
                return new HttpStatusCodeResult(200, "OK");
            }
            else
            {
                return new HttpStatusCodeResult(404, "Usuário não encontrado");
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult ForgotPassword(string email)
        {
            var usuario = accountBusiness
                .GetUsuarios()
                .FirstOrDefault(x => x.Equipante.Email == email);
            if (usuario != null)
            {
                var config = configuracaoBusiness.GetLogin();
                string body = string.Empty;
                using (
                    StreamReader reader = new StreamReader(
                        Server.MapPath("~/EmailTemplates/ForgotPassword.html")
                    )
                )
                {
                    body = reader.ReadToEnd();
                }

                body = body.Replace("{{logoEvento}}", $"https://{Request.Url.Host}/logoLogin");
                body = body.Replace("{{name}}", usuario.Equipante.Nome);
                body = body.Replace("{{buttonColor}}", config.CorBotao);
                body = body.Replace("{{identificador}}", config.Identificador);
                Guid g = Guid.NewGuid();
                body = body.Replace(
                    "{{url}}",
                    $"https://{Request.Url.Host}/Account/RecuperarSenha/{g}"
                );
                var user = UserManager.FindById(usuario.Id);
                user.RecoveryKey = g.ToString();
                UserManager.Update(user);
                emailSender.SendEmail(email, "Recuperação de senha", body, config.Identificador);

                return new HttpStatusCodeResult(200, "OK");
            }
            else
            {
                return new HttpStatusCodeResult(404, "Usuário não encontrado");
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLogin(LoginViewModel model)
        {
            var login = model.UserName;
            if (UtilServices.IsValidEmail(model.UserName))
            {
                try
                {
                    var equipanteEmail = equipantesBusiness
                        .GetEquipantes()
                        .FirstOrDefault(x => x.Email == model.UserName);
                    var userEmail = accountBusiness
                        .GetUsuarios()
                        .FirstOrDefault(x => x.EquipanteId == equipanteEmail.Id);
                    ;
                    login = userEmail.UserName;
                }
                catch (Exception)
                {
                    return new HttpStatusCodeResult(401, "Unauthorized");
                    throw;
                }
            }
            var user = await UserManager.FindAsync(login, model.Password);
            if ((user != null) && (user.Status == StatusEnum.Ativo))
            {
                await SignInAsync(user, true);
                var equipante = equipantesBusiness.GetEquipanteById(user.EquipanteId.Value);
                return Json(
                    new
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
                    },
                    JsonRequestBehavior.AllowGet
                );
            }
            else
                return new HttpStatusCodeResult(401, "Unauthorized");
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult ExternalRegister(RegisterExternalViewModel model)
        {
            ApplicationUser user = accountBusiness.GetUsuarioDeletado(model.UserName, model.Email);

            if (string.IsNullOrEmpty(model.UserName))
                return new HttpStatusCodeResult(400, "Username é obrigatório");

            if (string.IsNullOrEmpty(model.Email))
                return new HttpStatusCodeResult(400, "Email é obrigatório");

            if (string.IsNullOrEmpty(model.Password))
                return new HttpStatusCodeResult(400, "Password é obrigatório");

            if (model.Password.Length < 6)
                return new HttpStatusCodeResult(400, "Password deve conter 6 caracteres");

            if (string.IsNullOrEmpty(model.Nome))
                return new HttpStatusCodeResult(400, "Nome é obrigatório");

            if (string.IsNullOrEmpty(model.Id) && user == null)
            {
                if (accountBusiness.GetUsuarios().Any(x => x.UserName == model.UserName))
                    return new HttpStatusCodeResult(400, "Username já cadastrado");

                if (accountBusiness.GetUsuarios().Any(x => x.Equipante.Email == model.Email))
                {
                    return new HttpStatusCodeResult(400, "Email já cadastrado");
                }

                DateTime? dtnasc = null;

                if (!string.IsNullOrEmpty(model.DataNascimento))
                {
                    dtnasc = DateTime.ParseExact(
                        model.DataNascimento,
                        "dd/MM/yyyy",
                        System.Globalization.CultureInfo.InvariantCulture
                    );
                }

                var equipante = equipantesBusiness.PostEquipante(
                    new Core.Models.Participantes.PostInscricaoModel
                    {
                        Nome = model.Nome,
                        Sexo = model.Sexo == "Masculino" ? SexoEnum.Masculino : SexoEnum.Feminino,
                        Apelido = model.Nome,
                        Fone = model.Fone,
                        DataNascimento = dtnasc,
                        Email = model.Email
                    }
                );

                user = new ApplicationUser()
                {
                    UserName = model.UserName,
                    EquipanteId = equipante.Id,
                    Status = StatusEnum.Ativo,
                    Senha = model.Password,
                    HasChangedPassword = true,
                    Tipo = "Aplicativo"
                };
                UserManager.Create(user, model.Password);
                user = UserManager.FindByName(user.UserName);
            }
            else
            {
                if (user != null)
                {
                    user = UserManager.FindById(user.Id);
                    UserManager.ChangePassword(user.Id, user.Senha, model.Password);
                    user.Status = StatusEnum.Ativo;
                    user.Senha = model.Password;
                    user.UserName = model.UserName;
                    user.HasChangedPassword = false;
                    UserManager.Update(user);
                }
                else
                {
                    user = UserManager.FindById(model.Id);
                }

                DateTime? dtnasc = null;

                if (!string.IsNullOrEmpty(model.DataNascimento))
                {
                    dtnasc = DateTime.ParseExact(
                        model.DataNascimento,
                        "dd/MM/yyyy",
                        System.Globalization.CultureInfo.InvariantCulture
                    );
                }

                equipantesBusiness.PostEquipante(
                    new Core.Models.Participantes.PostInscricaoModel
                    {
                        Id = user.EquipanteId.Value,
                        Nome = model.Nome,
                        Sexo = model.Sexo == "Masculino" ? SexoEnum.Masculino : SexoEnum.Feminino,
                        Apelido = model.Nome,
                        Fone = model.Fone,
                        DataNascimento = dtnasc,
                        Email = model.Email
                    }
                );
                var claims = UserManager.GetClaims(user.Id);
                UserManager.RemoveClaim(
                    user.Id,
                    claims.Where(x => x.Type == ClaimTypes.Role).FirstOrDefault()
                );
            }

            List<Permissoes> permissoes = new List<Permissoes>();
            if (user != null)
            {
                var claims = UserManager.GetClaims(user.Id);
                if (claims.Any(x => x.Type == "Permissões"))
                {
                    UserManager.RemoveClaim(
                        user.Id,
                        claims.Where(x => x.Type == "Permissões").FirstOrDefault()
                    );
                }
            }

            permissoes.Add(
                new Permissoes
                {
                    ConfiguracaoId = 0,
                    Role = "Membro",
                    Eventos = new List<EventoPermissao>()
                }
            );

            UserManager.AddClaim(user.Id, new Claim(ClaimTypes.Role, "Membro"));
            UserManager.AddClaim(
                user.Id,
                new Claim("Permissões", JsonConvert.SerializeObject(permissoes))
            );

            return Json(
                new
                {
                    User = accountBusiness
                        .GetUsuarios()
                        .Where(x => x.Id == user.Id)
                        .ToList()
                        .Select(x => new
                        {
                            Id = x.Id,
                            EquipanteId = x.EquipanteId,
                            Nome = x.Equipante.Nome,
                            Fone = x.Equipante.Fone,
                            DataNascimento = x.Equipante.DataNascimento.HasValue
                                ? x.Equipante.DataNascimento.Value.ToString("dd/MM/yyyy")
                                : "",
                            Sexo = x.Equipante.Sexo.GetDescription(),
                            Email = x.Equipante.Email
                        })
                        .FirstOrDefault()
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult ToggleUsuarioStatus(string Id)
        {
            accountBusiness.ToggleUsuarioStatus(Id);
            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult DeleteUsuario(string Id)
        {
            accountBusiness.DeleteUsuario(Id);
            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Disassociate(string loginProvider, string providerKey)
        {
            ManageMessageId? message = null;
            IdentityResult result = await UserManager.RemoveLoginAsync(
                User.Identity.GetUserId(),
                new UserLoginInfo(loginProvider, providerKey)
            );
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
            return new ChallengeResult(
                provider,
                Url.Action("LinkLoginCallback", "Account"),
                User.Identity.GetUserId()
            );
        }

        //
        // GET: /Account/LinkLoginCallback
        public async Task<ActionResult> LinkLoginCallback()
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync(
                XsrfKey,
                User.Identity.GetUserId()
            );
            if (loginInfo == null)
            {
                return RedirectToAction("Manage", new { Message = ManageMessageId.Error });
            }
            var result = await UserManager.AddLoginAsync(
                User.Identity.GetUserId(),
                loginInfo.Login
            );
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

        public ActionResult NaoAutorizado()
        {
            return View("~/Views/NaoAutorizado/Index.cshtml");
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
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null) { }

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
                context
                    .HttpContext.GetOwinContext()
                    .Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
}
