using Arquitetura.Controller;
using Arquitetura.ViewModels;
using AutoMapper;
using Core.Business.Account;
using Core.Business.Arquivos;
using Core.Business.Configuracao;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Etiquetas;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Quartos;
using Core.Business.Reunioes;
using Core.Models.Equipantes;
using Data.Entities;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;
using Z.EntityFramework.Plus;

namespace SysIgreja.Controllers
{

    [Authorize]
    public class EquipanteController : SysIgrejaControllerBase
    {
        private readonly IEquipantesBusiness equipantesBusiness;
        private readonly IEtiquetasBusiness etiquetasBusiness;
        private readonly IQuartosBusiness quartosBusiness;
        private readonly IArquivosBusiness arquivoBusiness;
        private readonly IEventosBusiness eventosBusiness;
        private readonly IEquipesBusiness equipesBusiness;
        private readonly IReunioesBusiness reunioesBusiness;
        private readonly ILancamentoBusiness lancamentoBusiness;
        private readonly IMeioPagamentoBusiness meioPagamentoBusiness;
        private readonly IConfiguracaoBusiness configuracaoBusiness;
        private readonly IDatatableService datatableService;
        private readonly IMapper mapper;


        public EquipanteController(IEquipantesBusiness equipantesBusiness, IAccountBusiness accountBusiness, IEtiquetasBusiness etiquetasBusiness, IConfiguracaoBusiness configuracaoBusiness, IQuartosBusiness quartosBusiness, IDatatableService datatableService, IEventosBusiness eventosBusiness, IEquipesBusiness equipesBusiness, ILancamentoBusiness lancamentoBusiness, IReunioesBusiness reunioesBusiness, IMeioPagamentoBusiness meioPagamentoBusiness, IArquivosBusiness arquivoBusiness) : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.quartosBusiness = quartosBusiness;
            this.etiquetasBusiness = etiquetasBusiness;
            this.configuracaoBusiness = configuracaoBusiness;
            this.equipantesBusiness = equipantesBusiness;
            this.eventosBusiness = eventosBusiness;
            this.equipesBusiness = equipesBusiness;
            this.arquivoBusiness = arquivoBusiness;
            this.lancamentoBusiness = lancamentoBusiness;
            this.meioPagamentoBusiness = meioPagamentoBusiness;
            this.reunioesBusiness = reunioesBusiness;
            this.datatableService = datatableService;
            mapper = new MapperRealidade().mapper;
        }



        public ActionResult Index()
        {
            ViewBag.Title = "Equipantes";
            GetEventos();

            return View();
        }

        [HttpPost]
        public ActionResult getEquipantesExcel(int eventoid)
        {
            Guid g = Guid.NewGuid();

            Session[g.ToString()] = datatableService.GenerateExcel(mapper.Map<IEnumerable<EquipanteExcelModel>>(equipesBusiness.GetQueryEquipantesEvento(eventoid)
                        .IncludeOptimized(x => x.Equipante)
                .IncludeOptimized(x => x.Equipante.Arquivos)
                .IncludeOptimized(x => x.Equipante.Lancamentos)
                .IncludeOptimized(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                .IncludeOptimized(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                .IncludeOptimized(x => x.Equipe).OrderBy(x => x.Equipante.Nome)));

            return Content(g.ToString());
        }

        [HttpPost]
        public ActionResult GetCracha(FilterModel model)
        {
            var result = equipesBusiness.GetQueryEquipantesEvento(model.EventoId.Value)
                        .IncludeOptimized(x => x.Equipante)
                .IncludeOptimized(x => x.Equipante.Arquivos)
                .IncludeOptimized(x => x.Equipante.Lancamentos)
                .IncludeOptimized(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                .IncludeOptimized(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                .IncludeOptimized(x => x.Equipe)
                .IncludeOptimized(x => x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId))
                        .IncludeOptimized(x => x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId).Select(y => y.Etiqueta));

            if (model.Foto)
            {
                result = result.Where(x => x.Equipante.Arquivos.Any(y => y.IsFoto));
            }

            if (model.Ids != null)
            {
                result = result.Where(x => model.Ids.Contains(x.EquipanteId.Value));
            }
            else
            {
                if (model.Etiquetas != null && model.Etiquetas.Count > 0)
                {
                    model.Etiquetas.ForEach(etiqueta =>
                    result = result.Where(x => x.Equipante.ParticipantesEtiquetas.Any(y => y.EtiquetaId.ToString() == etiqueta)));

                }

                if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
                {
                    model.NaoEtiquetas.ForEach(etiqueta =>
                 result = result.Where(x => !x.Equipante.ParticipantesEtiquetas.Any(y => y.EtiquetaId.ToString() == etiqueta)));
                }

                if (model.Status != null)
                {
                    if (!(model.Status.Contains("pendente") && model.Status.Contains("pago")))
                    {
                        if (model.Status.Contains("pendente"))
                        {
                            result = result.Where(x => (!x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId)));
                        }
                        else if (model.Status.Contains("pago"))
                        {
                            result = result.Where(x => (x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId)));

                        }
                    }
                }

                if (model.Equipe != null)
                {
                    result = result.Where(x => model.Equipe.Contains(x.EquipeId.Value));
                }

                if (model.search != null && !string.IsNullOrEmpty(model.search.value))
                {
                    result = result.Where(x => (x.Equipante.Nome.ToLower().Contains(model.search.value.ToLower())));
                }

            }

            try
            {
                if (model.columns[model.order[0].column].name == "HasOferta")
                {
                    if (model.order[0].dir == "asc")
                    {
                        result = result.OrderBy(x => new
                        {
                            Order = x.Equipante.Lancamentos.Where(y => y.EventoId == model.EventoId).Any()
                        });

                    }
                    else
                    {
                        result = result.OrderByDescending(x => new
                        {
                            Order = x.Equipante.Lancamentos.Where(y => y.EventoId == model.EventoId).Any()
                        });
                    }

                }
                else if (model.columns[model.order[0].column].name == "Faltas")
                {
                    if (model.order[0].dir == "asc")
                    {
                        result = result.OrderBy(x => new
                        {
                            Order = x.Presencas.Count()
                        });

                    }
                    else
                    {
                        result = result.OrderByDescending(x => new
                        {
                            Order = x.Presencas.Count()
                        });
                    }

                }
                else if (model.columns[model.order[0].column].name == "Equipe")
                {
                    if (model.order[0].dir == "asc")
                    {
                        result = result.OrderBy(x => new
                        {
                            Order = x.Equipe.Nome
                        });

                    }
                    else
                    {
                        result = result.OrderByDescending(x => new
                        {
                            Order = x.Equipe.Nome
                        });
                    }

                }
                else
                {
                    if (model.order[0].dir == "asc")
                    {
                        result = result.OrderByDynamic(x => "x.Equipante." + model.columns[model.order[0].column].name);

                    }
                    else
                    {
                        result = result.OrderByDescendingDynamic(x => "x.Equipante." + model.columns[model.order[0].column].name);
                    }

                }
            }
            catch (Exception)
            {
            }


            var json = Json(new
            {
                data = mapper.Map<IEnumerable<CrachaModel>>(result),
            }, JsonRequestBehavior.AllowGet);
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpPost]
        public ActionResult GetEquipantesDataTable(FilterModel model)
        {

            var extract = Request.QueryString["extract"];


            if (model.EventoId.HasValue)
            {

                var result = equipesBusiness.GetQueryEquipantesEvento(model.EventoId.Value)
                    .IncludeOptimized(x => x.Equipante)
            .IncludeOptimized(x => x.Equipante.Arquivos)
            .IncludeOptimized(x => x.Equipante.Lancamentos)
            .IncludeOptimized(x => x.Equipante.Lancamentos.Select(y => y.Evento))
            .IncludeOptimized(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
            .IncludeOptimized(x => x.Equipe)
            .IncludeOptimized(x => x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId))
                    .IncludeOptimized(x => x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId).Select(y => y.Etiqueta));

                var totalResultsCount = result.Count();
                var filteredResultsCount = totalResultsCount;

                if (model.Etiquetas != null && model.Etiquetas.Count > 0)
                {
                    model.Etiquetas.ForEach(etiqueta =>
                    result = result.Where(x => x.Equipante.ParticipantesEtiquetas.Any(y => y.EtiquetaId.ToString() == etiqueta)));

                }

                if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
                {
                    model.NaoEtiquetas.ForEach(etiqueta =>
                 result = result.Where(x => !x.Equipante.ParticipantesEtiquetas.Any(y => y.EtiquetaId.ToString() == etiqueta)));
                }

                if (model.Status != null)
                {
                    if (!(model.Status.Contains("pendente") && model.Status.Contains("pago")))
                    {
                        if (model.Status.Contains("pendente"))
                        {
                            result = result.Where(x => (!x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId)));
                        }
                        else if (model.Status.Contains("pago"))
                        {
                            result = result.Where(x => (x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId)));

                        }
                    }
                    filteredResultsCount = result.Count();
                }


                if (model.Equipe != null)
                {
                    result = result.Where(x => model.Equipe.Contains(x.EquipeId.Value));
                }

                if (model.search != null && model.search.value != null)
                {
                    result = result.Where(x => (x.Equipante.Nome.ToLower().Contains(model.search.value.ToLower())));
                    filteredResultsCount = result.Count();
                }


                filteredResultsCount = result.Count();

                if (extract == "excel")
                {
                    Guid g = Guid.NewGuid();
                    var data = mapper.Map<IEnumerable<EquipanteExcelModel>>(result);

                    Session[g.ToString()] = datatableService.GenerateExcel(data.ToList(), model.Campos);

                    return Content(g.ToString());
                }

                try
                {
                    if (model.columns[model.order[0].column].name == "HasOferta")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => new
                            {
                                Order = x.Equipante.Lancamentos.Where(y => y.EventoId == model.EventoId).Any()
                            });

                        }
                        else
                        {
                            result = result.OrderByDescending(x => new
                            {
                                Order = x.Equipante.Lancamentos.Where(y => y.EventoId == model.EventoId).Any()
                            });
                        }

                    }
                    else if (model.columns[model.order[0].column].name == "Faltas")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => new
                            {
                                Order = x.Presencas.Count()
                            });

                        }
                        else
                        {
                            result = result.OrderByDescending(x => new
                            {
                                Order = x.Presencas.Count()
                            });
                        }

                    }
                    else if (model.columns[model.order[0].column].name == "Equipe")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => new
                            {
                                Order = x.Equipe.Nome
                            });

                        }
                        else
                        {
                            result = result.OrderByDescending(x => new
                            {
                                Order = x.Equipe.Nome
                            });
                        }

                    }
                    else
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderByDynamic(x => "x.Equipante." + model.columns[model.order[0].column].name);

                        }
                        else
                        {
                            result = result.OrderByDescendingDynamic(x => "x.Equipante." + model.columns[model.order[0].column].name);
                        }

                    }
                }
                catch (Exception)
                {
                }

                result = result.Skip(model.Start)
      .Take(model.Length);

                return Json(new
                {
                    data = mapper.Map<IEnumerable<EquipanteListModel>>(result),
                    recordsTotal = totalResultsCount,
                    recordsFiltered = filteredResultsCount,
                }, JsonRequestBehavior.AllowGet);


            }
            else
            {

                var result = equipantesBusiness.GetEquipantes();

                var totalResultsCount = result.Count();
                var filteredResultsCount = totalResultsCount;

                if (model.search.value != null)
                {
                    result = result.Where(x => (x.Nome.Contains(model.search.value)));
                    filteredResultsCount = result.Count();
                }


                if (model.order[0].dir == "asc")
                {
                    result = result.OrderByDynamic(x => "x." + model.columns[model.order[0].column].name);

                }
                else
                {
                    result = result.OrderByDescendingDynamic(x => "x." + model.columns[model.order[0].column].name);
                }

                result = result.Skip(model.Start)
      .Take(model.Length);

                return Json(new
                {
                    data = mapper.Map<IEnumerable<EquipanteListModel>>(result),
                    recordsTotal = totalResultsCount,
                    recordsFiltered = filteredResultsCount,
                }, JsonRequestBehavior.AllowGet);


            }
        }


        [HttpPost]
        public ActionResult GetEquipantes()
        {

            var result = equipantesBusiness.GetEquipantes();

            return Json(new { data = mapper.Map<IEnumerable<EquipanteListModel>>(result) }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipante(int Id, int? eventoId)
        {
            var query = equipantesBusiness.GetEquipantes();

            if (eventoId.HasValue)
            {
                query = query.IncludeFilter(x => x.ParticipantesEtiquetas.Where(y => y.EventoId == eventoId))
                        .IncludeFilter(x => x.ParticipantesEtiquetas.Where(y => y.EventoId == eventoId).Select(y => y.Etiqueta));
            }

            var result = mapper.Map<EquipanteListModel>(query.FirstOrDefault(x => x.Id == Id));

            var dadosAdicionais = new
            {
                Status = result.Status.GetDescription(),
                Quarto = eventoId.HasValue ? (quartosBusiness.GetQuartosComParticipantes(eventoId.Value, TipoPessoaEnum.Equipante).Where(x => x.EquipanteId == Id).FirstOrDefault()?.Quarto?.Titulo) : ""
            };

            return Json(new { Equipante = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipanteEvento(int Id, int eventoId)
        {
            var result = mapper.Map<PostEquipanteModel>(equipesBusiness.GetEquipanteEvento(Id));

            result.Quarto = quartosBusiness.GetQuartosComParticipantes(eventoId, TipoPessoaEnum.Equipante).Where(x => x.EquipanteId == result.EquipanteId).FirstOrDefault()?.Quarto?.Titulo ?? "";

            return Json(new { Equipante = result }, JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult PostEquipante(PostEquipanteModel model)
        {
            var equipante = equipantesBusiness.PostEquipante(model);

            if (model.Inscricao)
            {
                return Json(Url.Action("InscricaoConcluida", "Inscricoes", new { Id = equipante.Id, EventoId = model.EventoId, Tipo = "Inscrições Equipe" }));
            }
            else
            {
                return new HttpStatusCodeResult(200);
            }

        }

        [HttpPost]
        public ActionResult PostEtiquetas(string[] etiquetas, int id, string obs, int eventoId)
        {
            equipantesBusiness.PostEtiquetas(etiquetas, id, obs, eventoId);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult DeleteEquipante(int Id)
        {
            equipantesBusiness.DeleteEquipante(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleSexo(int Id)
        {
            equipantesBusiness.ToggleSexo(Id);

            return new HttpStatusCodeResult(200);
        }


        [HttpPost]
        public ActionResult ToggleTeste(int Id)
        {
            equipantesBusiness.ToggleTeste(Id);

            return new HttpStatusCodeResult(200);
        }

        [HttpPost]
        public ActionResult ToggleCheckin(int Id, int eventoid)
        {
            equipantesBusiness.ToggleCheckin(Id);

            return new HttpStatusCodeResult(200);
        }
    }
}