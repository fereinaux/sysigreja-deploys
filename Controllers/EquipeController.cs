using Arquitetura.Controller;
using Arquitetura.ViewModels;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Reunioes;
using Core.Models;
using Core.Models.Equipe;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web.Mvc;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class EquipeController : SysIgrejaControllerBase
    {
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IReunioesBusiness reunioesBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IArquivosBusiness arquivosBusiness;
        private readonly IAccountBusiness accountBusiness;

        public EquipeController(IEquipesBusiness equipesBusiness, IArquivosBusiness arquivosBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IReunioesBusiness reunioesBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.equipesBusiness = equipesBusiness;
            this.reunioesBusiness = reunioesBusiness;
            this.accountBusiness = accountBusiness;
            this.eventosBusiness = eventosBusiness;
            this.arquivosBusiness = arquivosBusiness;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Equipes";
            GetEventos();

            return View();
        }

        public ActionResult Presenca()
        {
            ViewBag.Title = "Ata de Presença";
            GetEventos();
            return View();
        }

        [HttpGet]
        public ActionResult GetEquipesByUser(int EventoId)
        {
            var user = GetApplicationUser();

            if (user.Claims.Any(x => x.ClaimType == ClaimTypes.Role && x.ClaimValue == $"Coordenador{EventoId.ToString()}"))
            {
                return Json(new
                {
                    Equipes = equipesBusiness.GetEquipes(EventoId).Select(x => new EquipeViewModel { Id = x.Id, Nome = x.Nome }).ToList()
                    .Where(x =>
                    x.Id == equipesBusiness.GetEquipanteEventoByUser(EventoId, user.Id)
                        .EquipeId)
                        .ToList()
                }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { Equipes = equipesBusiness.GetEquipes(EventoId).Select(x => new { x.Id, x.Nome }).ToList() }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult TogglePresenca(int EquipanteEventoId, int ReuniaoId)
        {
            equipesBusiness.TogglePresenca(EquipanteEventoId, ReuniaoId);

            return new HttpStatusCodeResult(200);
        }

        [HttpGet]
        public ActionResult GetReunioes(int EventoId)
        {
            var result = reunioesBusiness.GetReunioes(EventoId)
                .ToList()
                .OrderBy(x => TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")).Subtract(x.DataReuniao).TotalDays < 0 ? TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")).Subtract(x.DataReuniao).TotalDays * -1 : TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")).Subtract(x.DataReuniao).TotalDays)
                .Select(x => new ReuniaoViewModel { DataReuniao = x.DataReuniao, Id = x.Id, Titulo = x.Titulo });

            return Json(new { Reunioes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetEquipes(int EventoId)
        {
            var evento = eventosBusiness.GetEventoById(EventoId);

            var result = equipesBusiness.GetEquipes(EventoId).ToList().Select(x => new ListaEquipesViewModel
            {
                Id = x.Id,
                Equipe = x.Nome,
                QuantidadeMembros = equipesBusiness.GetMembrosEquipe(EventoId, x.Id).Count(),
                QtdAnexos = arquivosBusiness.GetArquivosByEquipe(x.Id, false, evento.ConfiguracaoId.Value).Count()
            });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetEquipesConfig()
        {
            var result = equipesBusiness.GetEquipesConfig().Select(x => new
            {
                x.Id,
                x.Nome,
            });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetPresenca(int EventoId, int EquipeId, int ReuniaoId)
        {
            var presenca = equipesBusiness.GetPresenca(ReuniaoId).Select(x => x.EquipanteEventoId).ToList();

            var result = equipesBusiness
                .GetMembrosEquipe(EventoId, EquipeId).ToList().Select(x => new PresencaViewModel
                {
                    Id = x.Id,
                    Nome = x.Equipante.Nome,
                    Congregacao = x.Equipante.Congregacao,
                    Presenca = presenca.Contains(x.Id)
                });

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipantes(int EventoId, string Search)
        {
            var query = equipesBusiness.GetEquipantesEventoSemEquipe(EventoId, Search);

            var result = query.ToList().Select(x => new {id = x.Id, text = $"{x.Nome} - {x.Apelido}" }).OrderBy(x => x.text);

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipantesByEventoSelect(int EventoId)
        {
            var result = equipesBusiness.GetEquipantesEvento(EventoId)
                .OrderBy(x => x.Equipante.Nome)
                .Select(x => new
                {
                    Id = x.Id,
                    Nome = UtilServices.CapitalizarNome(x.Equipante.Nome),
                    Apelido = UtilServices.CapitalizarNome(x.Equipante.Apelido),
                });

            var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpGet]
        public ActionResult GetEquipantesByEvento(int EventoId)
        {
            var result = equipesBusiness.GetEquipantesEvento(EventoId)
                .Select(x => new
                {
                    Id = x.Id,
                    Sexo = x.Equipante.Sexo.GetDescription(),
                    Fone = x.Equipante.Fone,
                    Idade = UtilServices.GetAge(x.Equipante.DataNascimento),
                    Equipe = x.Equipe.Nome,
                    Nome = UtilServices.CapitalizarNome(x.Equipante.Nome),
                    Apelido = UtilServices.CapitalizarNome(x.Equipante.Apelido),
                    Foto = x.Equipante.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Equipante.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""
                }).ToList().OrderBy(x => x.Equipe).ThenBy(x => x.Nome);

            var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }


        [HttpPost]
        public ActionResult GetMembrosEquipeDatatable(int EventoId, int EquipeId)
        {
            var query = equipesBusiness
                .GetMembrosEquipeDatatable(EventoId, EquipeId)
                .ToList();

            var result = query
            .Select(x => new
            {
                Id = x.Id,
                Nome = UtilServices.CapitalizarNome(x.Equipante.Nome),
                Apelido = UtilServices.CapitalizarNome(x.Equipante.Apelido),
                Fone = x.Equipante.Fone,
                Equipe = x.Equipe.Nome,
                Idade = UtilServices.GetAge(x.Equipante.DataNascimento),
                Tipo = x.Tipo.GetDescription(),
            });

            var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpPost]
        public ActionResult GetMembrosEquipe(int EventoId, int EquipeId)
        {
            var query = equipesBusiness
                .GetMembrosEquipe(EventoId, EquipeId)
                .ToList();

            var result = query
            .Select(x => new
            {
                Id = x.Id,
                Nome = x.Equipante.Nome,
                Apelido = x.Equipante.Apelido,
                Equipe = x.Equipe.Nome,
                Idade = UtilServices.GetAge(x.Equipante.DataNascimento),
                Tipo = x.Tipo.GetDescription(),
                x.Equipante.Fone,
                Foto = x.Equipante.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Equipante.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""
            });

            var json = Json(new { data = result }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpPost]
        public ActionResult ToggleMembroEquipeTipo(int Id)
        {
            var user = equipesBusiness.ToggleMembroEquipeTipo(Id);
            var evento = equipesBusiness.GetEquipanteEvento(Id).Evento;


            if (user != null && user.UserName != null)
            {
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
                        Perfil = "Coordenador"

                    }
                ).FirstOrDefault()
                }, JsonRequestBehavior.AllowGet);
            }
            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult AddMembroEquipe(PostEquipeMembroModel model)
        {
            equipesBusiness.ChangeEquipe(model);
            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult DeleteMembroEquipe(int Id)
        {
            var result = equipesBusiness.DeleteMembroEquipe(Id);
            if (result == "ok")
                return new HttpStatusCodeResult(200);
            else
            {
                return new HttpStatusCodeResult(400, result);
            }
        }

        [HttpGet]
        public ActionResult GetEquipe(int id)
        {

            return Json(new
            {
                Equipe = equipesBusiness.GetEquipesConfig().Select(x => new
                {
                    x.Id,
                    x.Nome,
                }).FirstOrDefault(x => x.Id == id)
            }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult PostEquipe(PostEquipeModel model)
        {
            equipesBusiness.PostEquipe(model);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult DeleteEquipe(int Id)
        {
            equipesBusiness.DeleteEquipe(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}