using Arquitetura.Controller;
using Arquitetura.ViewModels;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Reunioes;
using Core.Models;
using Core.Models.Equipe;
using Core.Models.Quartos;
using Data.Entities;
using Newtonsoft.Json;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Web;
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
        private readonly IMapper mapper;

        public EquipeController(IEquipesBusiness equipesBusiness, IArquivosBusiness arquivosBusiness, IConfiguracaoBusiness configuracaoBusiness, IEventosBusiness eventosBusiness, IAccountBusiness accountBusiness, IReunioesBusiness reunioesBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.equipesBusiness = equipesBusiness;
            this.reunioesBusiness = reunioesBusiness;
            this.accountBusiness = accountBusiness;
            this.eventosBusiness = eventosBusiness;
            this.arquivosBusiness = arquivosBusiness;
            mapper = new MapperRealidade().mapper;
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Equipes";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        public ActionResult Presenca()
        {
            ViewBag.Title = "Ata de Presença";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            return View();
        }

        [HttpPost]
        public ActionResult TogglePresenca(int EquipanteEventoId, int ReuniaoId)
        {
            equipesBusiness.TogglePresenca(EquipanteEventoId, ReuniaoId);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult Justificar(int EquipanteEventoId, int ReuniaoId)
        {
            equipesBusiness.Justificar(EquipanteEventoId, ReuniaoId);

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

            var result = equipesBusiness.GetEquipesGrouped(EventoId)
            .Select(x => new ListaEquipesViewModel
            {
                QuantidadeMembros = x.Equipe.EquipanteEventos.Where(z => z.EventoId == EventoId).Count(),
                QtdAnexos = x.Equipe.Arquivos.Where(z => z.EventoId == EventoId).Count(),
                Equipe = x.Equipe.Nome,
                Id = x.EquipeId
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
        public ActionResult GetPresenca(int EventoId, int EquipeId)
        {
            var evento = eventosBusiness.GetEventos().Where(x => x.Id == EventoId).Include(x => x.Reunioes).Include(x => x.Reunioes.Select(y => y.Presenca)).FirstOrDefault();
            var colunas = evento.Reunioes.Where(x => x.Tipo == Utils.Enums.TipoPessoaEnum.Equipante && x.Status != StatusEnum.Deletado).OrderBy(x => x.DataReuniao).Select(x => new { Data = x.DataReuniao.ToString("dd/MM"), Id = x.Id }).ToList();

            var result = new List<PresencaViewModel>();

            if (EquipeId != 0)
            {
                result = equipesBusiness
                    .GetMembrosEquipe(EventoId, GetEquipesFilhas(EquipeId, EventoId)).Include(x => x.Evento).Include(x => x.Presencas)
                    .Include(x => x.Evento.Reunioes).ToList().Select(x => new PresencaViewModel
                    {
                        Id = x.Id,
                        Nome = x.Equipante.Nome,
                        Reunioes = x.Evento.Reunioes.OrderBy(y => y.DataReuniao).Where(y => y.Status != StatusEnum.Deletado && y.Tipo == TipoPessoaEnum.Equipante).Select(y => new PresencaModel { Presenca = x.Presencas.Any(z => z.ReuniaoId == y.Id), Justificada = x.Presencas.Any(z => z.ReuniaoId == y.Id && z.Justificada.HasValue && z.Justificada.Value == true) }).ToList()
                    }).ToList();
            }
            else
            {
                result = equipesBusiness
                    .GetQueryEquipantesEvento(EventoId).Include(x => x.Evento).Include(x => x.Equipante)
                    .Include(x => x.Evento.Reunioes).ToList().Select(x => new PresencaViewModel
                    {
                        Id = x.Id,
                        Nome = x.Equipante.Nome,
                        Reunioes = x.Evento.Reunioes.OrderBy(y => y.DataReuniao).Where(y => y.Status != StatusEnum.Deletado && y.Tipo == TipoPessoaEnum.Equipante).Select(y => new PresencaModel { Presenca = x.Presencas.Any(z => z.ReuniaoId == y.Id), Justificada = x.Presencas.Any(z => z.ReuniaoId == y.Id && z.Justificada.HasValue && z.Justificada.Value == true) }).ToList()
                    }).ToList();
            }

            return Json(new { data = result, colunas }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipantes(int EventoId, string Search)
        {
            var query = equipesBusiness.GetEquipantesEventoSemEquipe(EventoId, Search);

            var result = query.ToList().Select(x => new { id = x.Id, text = $"{x.Nome} - {x.Apelido}" }).OrderBy(x => x.text);

            return Json(new { Equipantes = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipantesByEventoSelect(int EventoId)
        {
            var result = equipesBusiness.GetQueryEquipantesEvento(EventoId).Include(x => x.Equipante);


            var json = Json(new { data = mapper.Map< IEnumerable<PessoaSelectModel>>(result), }, JsonRequestBehavior.AllowGet);
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
                .GetMembrosEquipe(EventoId, GetEquipesFilhas(EquipeId, EventoId))
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
        public ActionResult ToggleMembroEquipeTipoByEquipante(int Id, int EventoId)
        {
            var equipanteEvento = equipesBusiness.GetQueryEquipantesEvento(EventoId).Where(x => x.EquipanteId == Id).FirstOrDefault();

            return ToggleMembroEquipeTipo(equipanteEvento.Id);

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

        [HttpPost]
        public ActionResult DeleteMembroEquipeByEquipante(int Id, int EventoId)
        {
            var equipanteEvento = equipesBusiness.GetQueryEquipantesEvento(EventoId).Where(x => x.EquipanteId == Id).FirstOrDefault();

            return DeleteMembroEquipe(equipanteEvento.Id);
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
        public ActionResult SaveGrupo(string grupoId, int eventoId, int equipeId)
        {
            equipesBusiness.SaveGrupo(grupoId,eventoId, equipeId);

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