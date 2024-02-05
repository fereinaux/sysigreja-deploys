using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Dynamic;
using System.Threading;
using System.Web;
using System.Web.Mvc;
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
using Core.Business.Participantes;
using Core.Business.Quartos;
using Core.Business.Reunioes;
using Core.Models.Equipantes;
using Core.Models.Participantes;
using CsQuery;
using Data.Entities;
using Data.Entities.Base;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Preference;
using Microsoft.Extensions.Logging;
using SysIgreja.ViewModels;
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
        private readonly IParticipantesBusiness participantesBusiness;
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
        private readonly IEmailSender emailSender;

        public EquipanteController(
            IEquipantesBusiness equipantesBusiness,
            IEmailSender emailSender,
            IParticipantesBusiness participantesBusiness,
            IAccountBusiness accountBusiness,
            IEtiquetasBusiness etiquetasBusiness,
            IConfiguracaoBusiness configuracaoBusiness,
            IQuartosBusiness quartosBusiness,
            IDatatableService datatableService,
            IEventosBusiness eventosBusiness,
            IEquipesBusiness equipesBusiness,
            ILancamentoBusiness lancamentoBusiness,
            IReunioesBusiness reunioesBusiness,
            IMeioPagamentoBusiness meioPagamentoBusiness,
            IArquivosBusiness arquivoBusiness
        )
            : base(eventosBusiness, accountBusiness, configuracaoBusiness)
        {
            this.quartosBusiness = quartosBusiness;
            this.emailSender = emailSender;
            this.participantesBusiness = participantesBusiness;
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
            ViewBag.Title = "Listagem de Voluntários";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        public ActionResult Duplicados()
        {
            ViewBag.Title = "Remover Duplicados";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            GetEventos(new string[] { "Admin" });

            return View();
        }

        public ActionResult Montagem()
        {
            ViewBag.Title = "Montagem";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));

            return View();
        }

        public ActionResult Casais()
        {
            ViewBag.Title = "Casais";
            Response.AddHeader("Title", HttpUtility.HtmlEncode(ViewBag.Title));
            GetConfiguracao();

            return View();
        }

        [HttpPost]
        public ActionResult getEquipantesExcel(int eventoid)
        {
            Guid g = Guid.NewGuid();

            Session[g.ToString()] = datatableService.GenerateExcel(
                mapper.Map<IEnumerable<EquipanteExcelModel>>(
                    equipesBusiness
                        .GetQueryEquipantesEvento(eventoid)
                        .Include(x => x.Equipante)
                        .Include(x => x.Equipante.Arquivos)
                        .Include(x => x.Equipante.Lancamentos)
                        .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                        .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                        .Include(x => x.Equipe)
                        .OrderBy(x => x.Equipante.Nome)
                )
            );

            return Content(g.ToString());
        }

        [HttpPost]
        public ActionResult GetCracha(Core.Models.Equipantes.FilterModel model)
        {
            var result = equipesBusiness
                .GetQueryEquipantesEvento(model.EventoId.Value)
                .Include(x => x.Equipante)
                .Include(x => x.Equipante.Arquivos)
                .Include(x => x.Equipante.Lancamentos)
                .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                .Include(x => x.Equipe)
                .IncludeOptimized(
                    x => x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId)
                )
                .IncludeOptimized(
                    x =>
                        x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId)
                            .Select(y => y.Etiqueta)
                );

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
                    model.Etiquetas.ForEach(
                        etiqueta =>
                            result = result.Where(
                                x =>
                                    x.Equipante.ParticipantesEtiquetas.Any(
                                        y => y.EtiquetaId.ToString() == etiqueta
                                    )
                            )
                    );
                }

                if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
                {
                    model.NaoEtiquetas.ForEach(
                        etiqueta =>
                            result = result.Where(
                                x =>
                                    !x.Equipante.ParticipantesEtiquetas.Any(
                                        y => y.EtiquetaId.ToString() == etiqueta
                                    )
                            )
                    );
                }

                if (model.Origem != "Montagem")
                {
                    model.StatusMontagem = 1;
                }

                if (model.StatusMontagem.HasValue)
                {
                    result = result.Where(
                        x => x.StatusMontagem == (StatusEnum)model.StatusMontagem.Value
                    );
                }

                if (model.Status != null)
                {
                    if (!(model.Status.Contains("pendente") && model.Status.Contains("pago")))
                    {
                        if (model.Status.Contains("pendente"))
                        {
                            result = result.Where(
                                x => (!x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId))
                            );
                        }
                        else if (model.Status.Contains("pago"))
                        {
                            result = result.Where(
                                x => (x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId))
                            );
                        }
                    }
                }

                if (model.Equipe != null)
                {
                    model.Equipe = GetEquipesFilhas(model.Equipe, model.EventoId.Value);

                    result = result.Where(x => model.Equipe.Contains(x.EquipeId.Value));
                }

                if (model.search != null && !string.IsNullOrEmpty(model.search.value))
                {
                    result = result.Where(x => (x.Equipante.Nome.Contains(model.search.value)));
                }
            }

            var json = Json(
                new { data = mapper.Map<IEnumerable<CrachaModel>>(result), },
                JsonRequestBehavior.AllowGet
            );
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpPost]
        public ActionResult GetCrachaCasal(Core.Models.Equipantes.FilterModel model)
        {
            var result = equipesBusiness
                .GetQueryEquipantesEvento(model.EventoId.Value)
                .Include(x => x.Equipante)
                .Include(x => x.Equipante.Arquivos)
                .Include(x => x.Equipante.Lancamentos)
                .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                .Include(x => x.Equipe)
                .Include(x => x.Equipante.Quartos)
                .Include(x => x.Equipante.Quartos.Select(y => y.Quarto))
                .IncludeOptimized(
                    x => x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId)
                )
                .IncludeOptimized(
                    x =>
                        x.Equipante.ParticipantesEtiquetas.Where(y => y.EventoId == model.EventoId)
                            .Select(y => y.Etiqueta)
                );

            var queryCasais = result
                .AsEnumerable()
                .GroupJoin(
                    result,
                    x => x.Equipante.Nome.RemoveAccents().Trim(),
                    y => y.Equipante.Conjuge?.RemoveAccents().Trim(),
                    (q1, q2) => new { q1, q2 }
                )
                .Select(
                    x =>
                        new
                        {
                            Conjuge = x.q1.Equipante.Nome
                            == new List<string>
                            {
                                x.q1.Equipante.Nome,
                                x.q2.Any() ? x.q2.FirstOrDefault().Equipante.Nome : ""
                            }.Min()
                                ? x.q1
                                : x.q2.FirstOrDefault(),
                            Nome = x.q1.Equipante.Nome
                            == new List<string>
                            {
                                x.q1.Equipante.Nome,
                                x.q2.Any() ? x.q2.FirstOrDefault().Equipante.Nome : ""
                            }.Max()
                                ? x.q1
                                : x.q2.FirstOrDefault(),
                        }
                )
                .Select(
                    x =>
                        new
                        {
                            Homem = x.Nome.Equipante.Sexo == SexoEnum.Masculino
                                ? x.Nome
                                : (x.Conjuge != null ? x.Conjuge : null),
                            Mulher = x.Nome.Equipante.Sexo == SexoEnum.Feminino
                                ? x.Nome
                                : (x.Conjuge != null ? x.Conjuge : null),
                        }
                )
                .Distinct();

            if (model.Foto)
            {
                queryCasais = queryCasais.Where(
                    x => x.Homem != null && x.Homem.Equipante.Arquivos.Any(y => y.IsFoto)
                );
            }

            if (model.Ids != null)
            {
                queryCasais = queryCasais.Where(
                    x =>
                        model.Ids.Contains(x.Homem.EquipanteId.Value)
                        || model.Ids.Contains(x.Mulher.EquipanteId.Value)
                );
            }
            else if (model.Etiquetas != null && model.Etiquetas.Count > 0)
            {
                model.Etiquetas.ForEach(
                    etiqueta =>
                        queryCasais = queryCasais.Where(
                            x =>
                                (
                                    x.Homem?.Equipante
                                        ?.ParticipantesEtiquetas
                                        ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                )
                                || (
                                    x.Mulher?.Equipante
                                        ?.ParticipantesEtiquetas
                                        ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                )
                        )
                );
            }

            if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
            {
                model.NaoEtiquetas.ForEach(
                    etiqueta =>
                        queryCasais = queryCasais.Where(
                            x =>
                                (
                                    !x.Homem?.Equipante
                                        ?.ParticipantesEtiquetas
                                        ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                )
                                && (
                                    !x.Mulher?.Equipante
                                        ?.ParticipantesEtiquetas
                                        ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                )
                        )
                );
            }

            if (model.Status != null)
            {
                if (!(model.Status.Contains("pendente") && model.Status.Contains("pago")))
                {
                    if (model.Status.Contains("pendente"))
                    {
                        queryCasais = queryCasais.Where(
                            x =>
                                (
                                    !x.Homem?.Equipante
                                        ?.Lancamentos
                                        ?.Any(y => y.EventoId == x.Homem.EventoId) ?? false
                                )
                                || (
                                    !x.Mulher?.Equipante
                                        ?.Lancamentos
                                        ?.Any(y => y.EventoId == x.Mulher.EventoId) ?? false
                                )
                        );
                    }
                    else if (model.Status.Contains("pago"))
                    {
                        queryCasais = queryCasais.Where(
                            x =>
                                (
                                    (
                                        x.Homem?.Equipante
                                            ?.Lancamentos
                                            ?.Any(y => y.EventoId == x.Homem.EventoId)
                                    ) ?? false
                                )
                                || (
                                    (
                                        x.Mulher?.Equipante
                                            ?.Lancamentos
                                            ?.Any(y => y.EventoId == x.Mulher.EventoId) ?? false
                                    )
                                )
                        );
                    }
                }
            }

            if (model.Equipe != null)
            {
                model.Equipe = GetEquipesFilhas(model.Equipe, model.EventoId.Value);

                queryCasais = queryCasais.Where(
                    x =>
                        (x.Homem != null && model.Equipe.Contains(x.Homem.EquipeId.Value))
                        || (x.Mulher != null && model.Equipe.Contains(x.Mulher.EquipeId.Value))
                );
            }

            var queryNova = queryCasais
                .Where(x => (x.Homem != null & x.Mulher != null))
                .Select(
                    x =>
                        new
                        {
                            Dupla = x.Homem.Equipante.Apelido + " de " + x.Mulher.Equipante.Apelido,
                            x.Homem,
                            x.Mulher,
                        }
                );

            List<Data.Entities.EquipanteEvento> resultCasais =
                new List<Data.Entities.EquipanteEvento>();

            queryNova
                .ToList()
                .ForEach(casal =>
                {
                    if (casal.Homem != null)
                    {
                        casal.Homem.Equipante.Dupla =
                            casal.Homem.Equipante.Apelido + " de " + casal.Mulher.Equipante.Apelido;
                        resultCasais.Add(casal.Homem);
                    }
                    if (casal.Mulher != null)
                    {
                        casal.Mulher.Equipante.Dupla =
                            casal.Mulher.Equipante.Apelido + " de " + casal.Homem.Equipante.Apelido;
                        resultCasais.Add(casal.Mulher);
                    }
                });

            var json = Json(
                new { data = mapper.Map<IEnumerable<CrachaCasalModel>>(resultCasais), },
                JsonRequestBehavior.AllowGet
            );
            json.MaxJsonLength = Int32.MaxValue;
            return json;
        }

        [HttpPost]
        public ActionResult GetCasaisDatatable(Core.Models.Equipantes.FilterModel model)
        {
            var extract = Request.QueryString["extract"];
            Thread.CurrentThread.CurrentCulture = new CultureInfo("pt-BR", true);

            if (model.EventoId.HasValue)
            {
                var result = equipesBusiness
                    .GetQueryEquipantesEvento(model.EventoId.Value)
                    .Include(x => x.Equipante)
                    .Include(x => x.Equipante.Arquivos)
                    .Include(x => x.Equipante.Lancamentos)
                    .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                    .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                    .Include(x => x.Equipe)
                    .Include(x => x.Equipante.Quartos)
                    .Include(x => x.Equipante.Quartos.Select(y => y.Quarto))
                    .IncludeOptimized(
                        x =>
                            x.Equipante.ParticipantesEtiquetas.Where(
                                y => y.EventoId == model.EventoId
                            )
                    )
                    .IncludeOptimized(
                        x =>
                            x.Equipante.ParticipantesEtiquetas.Where(
                                y => y.EventoId == model.EventoId
                            )
                                .Select(y => y.Etiqueta)
                    );

                var queryCasais = result
                    .AsEnumerable()
                    .GroupJoin(
                        result,
                        x => x.Equipante.Nome.RemoveAccents().Trim(),
                        y => y.Equipante.Conjuge?.RemoveAccents().Trim(),
                        (q1, q2) => new { q1, q2 }
                    )
                    .Select(
                        x =>
                            new
                            {
                                Conjuge = x.q1.Equipante.Nome
                                == new List<string>
                                {
                                    x.q1.Equipante.Nome,
                                    x.q2.Any() ? x.q2.FirstOrDefault().Equipante.Nome : ""
                                }.Min()
                                    ? x.q1
                                    : x.q2.FirstOrDefault(),
                                Nome = x.q1.Equipante.Nome
                                == new List<string>
                                {
                                    x.q1.Equipante.Nome,
                                    x.q2.Any() ? x.q2.FirstOrDefault().Equipante.Nome : ""
                                }.Max()
                                    ? x.q1
                                    : x.q2.FirstOrDefault(),
                            }
                    )
                    .Select(
                        x =>
                            new
                            {
                                Homem = x.Nome.Equipante.Sexo == SexoEnum.Masculino
                                    ? x.Nome
                                    : (x.Conjuge != null ? x.Conjuge : null),
                                Mulher = x.Nome.Equipante.Sexo == SexoEnum.Feminino
                                    ? x.Nome
                                    : (x.Conjuge != null ? x.Conjuge : null),
                            }
                    )
                    .Distinct();

                var totalResultsCount = result.Count();
                var filteredResultsCount = totalResultsCount;

                if (model.Etiquetas != null && model.Etiquetas.Count > 0)
                {
                    model.Etiquetas.ForEach(
                        etiqueta =>
                            queryCasais = queryCasais.Where(
                                x =>
                                    (
                                        x.Homem?.Equipante
                                            ?.ParticipantesEtiquetas
                                            ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                    )
                                    || (
                                        x.Mulher?.Equipante
                                            ?.ParticipantesEtiquetas
                                            ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                    )
                            )
                    );
                }

                if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
                {
                    model.NaoEtiquetas.ForEach(
                        etiqueta =>
                            queryCasais = queryCasais.Where(
                                x =>
                                    (
                                        !x.Homem?.Equipante
                                            ?.ParticipantesEtiquetas
                                            ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                    )
                                    && (
                                        !x.Mulher?.Equipante
                                            ?.ParticipantesEtiquetas
                                            ?.Any(y => y.EtiquetaId.ToString() == etiqueta) ?? false
                                    )
                            )
                    );
                }

                if (model.Status != null)
                {
                    if (!(model.Status.Contains("pendente") && model.Status.Contains("pago")))
                    {
                        if (model.Status.Contains("pendente"))
                        {
                            queryCasais = queryCasais.Where(
                                x =>
                                    (
                                        !x.Homem?.Equipante
                                            ?.Lancamentos
                                            ?.Any(y => y.EventoId == x.Homem.EventoId) ?? false
                                    )
                                    || (
                                        !x.Mulher?.Equipante
                                            ?.Lancamentos
                                            ?.Any(y => y.EventoId == x.Mulher.EventoId) ?? false
                                    )
                            );
                        }
                        else if (model.Status.Contains("pago"))
                        {
                            queryCasais = queryCasais.Where(
                                x =>
                                    (
                                        (
                                            x.Homem?.Equipante
                                                ?.Lancamentos
                                                ?.Any(y => y.EventoId == x.Homem.EventoId)
                                        ) ?? false
                                    )
                                    || (
                                        (
                                            x.Mulher?.Equipante
                                                ?.Lancamentos
                                                ?.Any(y => y.EventoId == x.Mulher.EventoId) ?? false
                                        )
                                    )
                            );
                        }
                    }

                    filteredResultsCount = result.Count();
                }

                if (model.Equipe != null)
                {
                    model.Equipe = GetEquipesFilhas(model.Equipe, model.EventoId.Value);

                    queryCasais = queryCasais.Where(
                        x =>
                            (x.Homem != null && model.Equipe.Contains(x.Homem.EquipeId.Value))
                            || (x.Mulher != null && model.Equipe.Contains(x.Mulher.EquipeId.Value))
                    );
                }

                if (model.columns != null)
                {
                    for (int i = 0; i < model.columns.Count; i++)
                    {
                        if (model.columns[i].search.value != null)
                        {
                            var searchValue = model.columns[i].search.value.RemoveAccents();
                            if (
                                model.columns[i].name == "Nome"
                                && model.columns[i].search.value != null
                            )
                            {
                                queryCasais = queryCasais.Where(
                                    x =>
                                        (
                                            (
                                                x.Homem?.Equipante
                                                    ?.Nome
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                        || (
                                            (
                                                x.Mulher?.Equipante
                                                    ?.Nome
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                );
                            }
                            if (
                                model.columns[i].name == "Equipe"
                                && model.columns[i].search.value != null
                            )
                            {
                                queryCasais = queryCasais.Where(
                                    x =>
                                        (
                                            (
                                                x.Homem?.Equipe
                                                    ?.Nome
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                        || (
                                            (
                                                x.Mulher?.Equipe
                                                    ?.Nome
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                );
                            }

                            if (
                                model.columns[i].name == "Congregacao"
                                && model.columns[i].search.value != null
                            )
                            {
                                queryCasais = queryCasais.Where(
                                    x =>
                                        (
                                            (
                                                x.Homem?.Equipante
                                                    ?.Congregacao
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                        || (
                                            (
                                                x.Mulher?.Equipante
                                                    ?.Congregacao
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                );
                            }
                        }
                    }
                }

                if (extract == "excel")
                {
                    Guid g = Guid.NewGuid();
                    var data = mapper.Map<IEnumerable<EquipanteExcelModel>>(result);

                    Session[g.ToString()] = datatableService.GenerateExcel(
                        data.ToList(),
                        model.Campos
                    );

                    return Content(g.ToString());
                }

                filteredResultsCount = result.Count();

                var queryNova = queryCasais.Select(
                    x =>
                        new
                        {
                            Dupla = (x.Homem != null & x.Mulher != null)
                                ? x.Homem.Equipante.Apelido + " e " + x.Mulher.Equipante.Apelido
                                : null,
                            x.Homem,
                            x.Mulher,
                        }
                );

                queryNova = queryNova.OrderBy(x => x.Dupla).Skip(model.Start).Take(model.Length);

                List<Data.Entities.EquipanteEvento> resultCasais =
                    new List<Data.Entities.EquipanteEvento>();

                queryNova
                    .ToList()
                    .ForEach(casal =>
                    {
                        if (casal.Homem != null)
                        {
                            casal.Homem.Equipante.Dupla = casal.Dupla;
                            resultCasais.Add(casal.Homem);
                        }
                        if (casal.Mulher != null)
                        {
                            casal.Mulher.Equipante.Dupla = casal.Dupla;
                            resultCasais.Add(casal.Mulher);
                        }
                    });

                return Json(
                    new
                    {
                        data = mapper.Map<IEnumerable<EquipanteListModel>>(resultCasais),
                        recordsTotal = totalResultsCount,
                        recordsFiltered = filteredResultsCount,
                    },
                    JsonRequestBehavior.AllowGet
                );
            }
            else
            {
                var result = equipantesBusiness.GetEquipantes().AsEnumerable();

                var queryCasais = result
                    .AsEnumerable()
                    .GroupJoin(
                        result,
                        x => x.Nome.RemoveAccents().Trim(),
                        y => y.Conjuge?.RemoveAccents().Trim(),
                        (q1, q2) => new { q1, q2 }
                    )
                    .Select(
                        x =>
                            new
                            {
                                Conjuge = x.q1.Nome
                                == new List<string>
                                {
                                    x.q1.Nome,
                                    x.q2.Any() ? x.q2.FirstOrDefault().Nome : ""
                                }.Min()
                                    ? x.q1
                                    : x.q2.FirstOrDefault(),
                                Nome = x.q1.Nome
                                == new List<string>
                                {
                                    x.q1.Nome,
                                    x.q2.Any() ? x.q2.FirstOrDefault().Nome : ""
                                }.Max()
                                    ? x.q1
                                    : x.q2.FirstOrDefault(),
                            }
                    )
                    .Select(
                        x =>
                            new
                            {
                                Homem = x.Nome.Sexo == SexoEnum.Masculino
                                    ? x.Nome
                                    : (x.Conjuge != null ? x.Conjuge : null),
                                Mulher = x.Nome.Sexo == SexoEnum.Feminino
                                    ? x.Nome
                                    : (x.Conjuge != null ? x.Conjuge : null),
                            }
                    )
                    .Distinct();

                var totalResultsCount = result.Count();
                var filteredResultsCount = totalResultsCount;

                if (model.search.value != null)
                {
                    result = result.Where(
                        x => (x.Nome.RemoveAccents().Contains(model.search.value.RemoveAccents()))
                    );
                    filteredResultsCount = result.Count();
                }

                if (model.columns != null)
                {
                    for (int i = 0; i < model.columns.Count; i++)
                    {
                        if (model.columns[i].search.value != null)
                        {
                            var searchValue = model.columns[i].search.value.RemoveAccents();
                            if (
                                model.columns[i].name == "Nome"
                                && model.columns[i].search.value != null
                            )
                            {
                                queryCasais = queryCasais.Where(
                                    x =>
                                        (
                                            (x.Homem?.Nome?.RemoveAccents().Contains(searchValue))
                                            ?? false
                                        )
                                        || (
                                            (x.Mulher?.Nome?.RemoveAccents().Contains(searchValue))
                                            ?? false
                                        )
                                );
                            }
                            if (
                                model.columns[i].name == "Congregacao"
                                && model.columns[i].search.value != null
                            )
                            {
                                queryCasais = queryCasais.Where(
                                    x =>
                                        (
                                            (
                                                x.Homem?.Congregacao
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                        || (
                                            (
                                                x.Mulher?.Congregacao
                                                    ?.RemoveAccents()
                                                    .Contains(searchValue)
                                            ) ?? false
                                        )
                                );
                            }
                        }
                    }
                }

                filteredResultsCount = queryCasais.Count();

                var queryNova = queryCasais.Select(
                    x =>
                        new
                        {
                            Dupla = (x.Homem != null & x.Mulher != null)
                                ? x.Homem.Apelido + " e " + x.Mulher.Apelido
                                : null,
                            x.Homem,
                            x.Mulher,
                        }
                );
                queryNova = queryNova.OrderBy(x => x.Dupla).Skip(model.Start).Take(model.Length);

                List<Data.Entities.Equipante> resultCasais = new List<Data.Entities.Equipante>();

                queryNova
                    .ToList()
                    .ForEach(casal =>
                    {
                        if (casal.Homem != null)
                        {
                            casal.Homem.Dupla = casal.Dupla;
                            resultCasais.Add(casal.Homem);
                        }
                        if (casal.Mulher != null)
                        {
                            casal.Mulher.Dupla = casal.Dupla;
                            resultCasais.Add(casal.Mulher);
                        }
                    });

                return Json(
                    new
                    {
                        data = mapper.Map<IEnumerable<EquipanteListModel>>(resultCasais),
                        recordsTotal = totalResultsCount,
                        recordsFiltered = filteredResultsCount,
                    },
                    JsonRequestBehavior.AllowGet
                );
            }
        }

        [HttpPost]
        public ActionResult GetEquipantesDataTable(Core.Models.Equipantes.FilterModel model)
        {
            var extract = Request.QueryString["extract"];

            if (model.EventoId.HasValue)
            {
                var result = equipesBusiness
                    .GetQueryEquipantesEvento(model.EventoId.Value)
                    .Include(x => x.Equipante)
                    .Include(x => x.Evento)
                    .Include(x => x.Evento.Reunioes)
                    .Include(x => x.Equipante.Arquivos)
                    .Include(x => x.Equipante.Lancamentos)
                    .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                    .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                    .Include(x => x.Equipe)
                    .Include(x => x.Equipante.Quartos)
                    .Include(x => x.Equipante.Quartos.Select(y => y.Quarto))
                    .IncludeOptimized(
                        x =>
                            x.Equipante.ParticipantesEtiquetas.Where(
                                y => y.EventoId == model.EventoId
                            )
                    )
                    .IncludeOptimized(
                        x =>
                            x.Equipante.ParticipantesEtiquetas.Where(
                                y => y.EventoId == model.EventoId
                            )
                                .Select(y => y.Etiqueta)
                    );

                var totalResultsCount = result.Count();
                var filteredResultsCount = totalResultsCount;

                if (model.Etiquetas != null && model.Etiquetas.Count > 0)
                {
                    model.Etiquetas.ForEach(
                        etiqueta =>
                            result = result.Where(
                                x =>
                                    x.Equipante.ParticipantesEtiquetas.Any(
                                        y => y.EtiquetaId.ToString() == etiqueta && y.EventoId == model.EventoId
                                    )
                            )
                    );
                }

                if (model.NaoEtiquetas != null && model.NaoEtiquetas.Count > 0)
                {
                    model.NaoEtiquetas.ForEach(
                        etiqueta =>
                            result = result.Where(
                                x =>
                                    !x.Equipante.ParticipantesEtiquetas.Any(
                                        y => y.EtiquetaId.ToString() == etiqueta && y.EventoId == model.EventoId
                                    )
                            )
                    );
                }

                if (model.Origem != "Montagem")
                {
                    model.StatusMontagem = 1;
                }

                if (model.StatusMontagem.HasValue)
                {
                    result = result.Where(
                        x => x.StatusMontagem == (StatusEnum)model.StatusMontagem.Value
                    );
                }

                if (model.Status != null)
                {
                    if (!(model.Status.Contains("pendente") && model.Status.Contains("pago")))
                    {
                        if (model.Status.Contains("pendente"))
                        {
                            result = result.Where(
                                x => (!x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId))
                            );
                        }
                        else if (model.Status.Contains("pago"))
                        {
                            result = result.Where(
                                x => (x.Equipante.Lancamentos.Any(y => y.EventoId == x.EventoId))
                            );
                        }
                    }
                    filteredResultsCount = result.Count();
                }

                if (model.QuartoId != null)
                {
                    result = result.Where(
                        x => (x.Equipante.Quartos.Any(y => model.QuartoId.Contains(y.QuartoId)))
                    );
                    filteredResultsCount = result.Count();
                }

                if (model.Equipe != null)
                {
                    model.Equipe = GetEquipesFilhas(model.Equipe, model.EventoId.Value);

                    result = result.Where(x => model.Equipe.Contains(x.EquipeId.Value));
                }

                if (model.search != null && model.search.value != null)
                {
                    result = result.Where(x => (x.Equipante.Nome.Contains(model.search.value)));
                    filteredResultsCount = result.Count();
                }

                if (model.columns != null)
                {
                    for (int i = 0; i < model.columns.Count; i++)
                    {
                        if (model.columns[i].search.value != null)
                        {
                            var searchValue = model.columns[i].search.value;
                            if (
                                model.columns[i].name == "Nome"
                                && model.columns[i].search.value != null
                            )
                            {
                                result = result.Where(
                                    x => (x.Equipante.Nome.Contains(searchValue))
                                );
                            }
                            if (
                                model.columns[i].name == "Equipe"
                                && model.columns[i].search.value != null
                            )
                            {
                                result = result.Where(x => (x.Equipe.Nome.Contains(searchValue)));
                            }

                            if (
                                model.columns[i].name == "Congregacao"
                                && model.columns[i].search.value != null
                            )
                            {
                                result = result.Where(
                                    x => (x.Equipante.Congregacao.Contains(searchValue))
                                );
                            }
                        }
                    }
                }

                filteredResultsCount = result.Count();

                if (extract == "excel")
                {
                    Guid g = Guid.NewGuid();
                    var data = mapper.Map<IEnumerable<EquipanteExcelModel>>(result);

                    Session[g.ToString()] = datatableService.GenerateExcel(
                        data.ToList(),
                        model.Campos
                    );

                    return Content(g.ToString());
                }

                try
                {
                    if (model.columns[model.order[0].column].name == "HasOferta")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(
                                x =>
                                    x.Equipante.Lancamentos.Where(y => y.EventoId == model.EventoId)
                                        .Any()
                            );
                        }
                        else
                        {
                            result = result.OrderByDescending(
                                x =>
                                    x.Equipante.Lancamentos.Where(y => y.EventoId == model.EventoId)
                                        .Any()
                            );
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Faltas")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Presencas.Count());
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Presencas.Count());
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Equipe")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipe.Nome);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipe.Nome);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Idade")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.DataNascimento);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.DataNascimento);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Congregacao")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Congregacao);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Congregacao);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Nome")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Nome);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Nome);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Fone")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Fone);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Fone);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Email")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Email);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Email);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Bairro")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Bairro);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Bairro);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Cidade")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Cidade);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Cidade);
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Quarto")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(
                                x =>
                                    x.Equipante.Quartos.Any(y => y.Quarto.EventoId == x.EventoId)
                                        ? x.Equipante.Quartos.FirstOrDefault(
                                            y => y.Quarto.EventoId == x.EventoId
                                        ).Quarto.Titulo
                                        : ""
                            );
                        }
                        else
                        {
                            result = result.OrderByDescending(
                                x =>
                                    x.Equipante.Quartos.Any(y => y.Quarto.EventoId == x.EventoId)
                                        ? x.Equipante.Quartos.FirstOrDefault(
                                            y => y.Quarto.EventoId == x.EventoId
                                        ).Quarto.Titulo
                                        : ""
                            );
                        }
                    }
                    else if (model.columns[model.order[0].column].name == "Sexo")
                    {
                        if (model.order[0].dir == "asc")
                        {
                            result = result.OrderBy(x => x.Equipante.Sexo);
                        }
                        else
                        {
                            result = result.OrderByDescending(x => x.Equipante.Sexo);
                        }
                    }
                }
                catch (Exception) { }

                result = result.Skip(model.Start).Take(model.Length);

                return Json(
                    new
                    {
                        data = mapper.Map<IEnumerable<EquipanteListModel>>(result),
                        recordsTotal = totalResultsCount,
                        recordsFiltered = filteredResultsCount,
                    },
                    JsonRequestBehavior.AllowGet
                );
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

                if (model.columns != null)
                {
                    for (int i = 0; i < model.columns.Count; i++)
                    {
                        if (model.columns[i].search.value != null)
                        {
                            var searchValue = model.columns[i].search.value;
                            if (
                                model.columns[i].name == "Nome"
                                && model.columns[i].search.value != null
                            )
                            {
                                result = result.Where(x => (x.Nome.Contains(searchValue)));
                            }

                            if (
                                model.columns[i].name == "Congregacao"
                                && model.columns[i].search.value != null
                            )
                            {
                                result = result.Where(x => (x.Congregacao.Contains(searchValue)));
                            }
                        }
                    }
                }

                var resultQuery = result.AsQueryable();
                if (model.order[0].dir == "asc")
                {
                    resultQuery = resultQuery.OrderByDynamic(
                        x => "x." + model.columns[model.order[0].column].name
                    );
                }
                else
                {
                    resultQuery = resultQuery.OrderByDescendingDynamic(
                        x => "x." + model.columns[model.order[0].column].name
                    );
                }
                filteredResultsCount = resultQuery.Count();
                resultQuery = resultQuery.Skip(model.Start).Take(model.Length);

                return Json(
                    new
                    {
                        data = mapper.Map<IEnumerable<EquipanteListModel>>(resultQuery),
                        recordsTotal = totalResultsCount,
                        recordsFiltered = filteredResultsCount,
                    },
                    JsonRequestBehavior.AllowGet
                );
            }
        }

        [HttpPost]
        public ActionResult GetEquipantes()
        {
            var result = equipantesBusiness.GetEquipantes();

            return Json(
                new { data = mapper.Map<IEnumerable<EquipanteListModel>>(result) },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpGet]
        public ActionResult GetEquipante(int Id, int? eventoId)
        {


            if (eventoId.HasValue)
            {
                var queryEvento = equipesBusiness
                         .GetQueryEquipantesEvento(eventoId.Value)
                         .Include(x => x.Equipante)
                         .Include(x => x.Evento)
                         .Include(x => x.Evento.Reunioes)
                         .Include(x => x.Equipante.Arquivos)
                         .Include(x => x.Equipante.Lancamentos)
                         .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento))
                         .Include(x => x.Equipante.Lancamentos.Select(y => y.Evento.Configuracao))
                         .Include(x => x.Equipe)
                         .Include(x => x.Equipante.Quartos)
                         .Include(x => x.Equipante.Quartos.Select(y => y.Quarto))
                         .IncludeOptimized(
                             x =>
                                 x.Equipante.ParticipantesEtiquetas.Where(
                                     y => y.EventoId == eventoId
                                 )
                         )
                         .IncludeOptimized(
                             x =>
                                 x.Equipante.ParticipantesEtiquetas.Where(
                                     y => y.EventoId == eventoId
                                 )
                                     .Select(y => y.Etiqueta)
                         );
                var resultEvento = mapper.Map<EquipanteListModel>(queryEvento.FirstOrDefault(x => x.EquipanteId == Id));
                return Json(new { Equipante = resultEvento }, JsonRequestBehavior.AllowGet);
            }
            else
            {

                var query = equipantesBusiness.GetEquipantes();
                var result = mapper.Map<EquipanteListModel>(query.FirstOrDefault(x => x.Id == Id));


                return Json(new { Equipante = result }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult GetTelefones(int[] ids, int eventoId)
        {
            var query = equipantesBusiness.GetEquipantes().Where(x => ids.Contains(x.Id));

            var result = query
                .Select(
                    x =>
                        new
                        {
                            x.Fone,
                            x.Nome,
                            x.NomeContato,
                            x.FoneContato,
                            x.FoneMae,
                            x.NomeMae,
                            x.FoneConvite,
                            x.NomeConvite,
                            x.NomePai,
                            x.FonePai,
                            x.Equipes.FirstOrDefault(
                                y => y.EventoId == eventoId
                            ).MercadoPagoPreferenceId
                        }
                )
                .ToList();

            return Json(new { Pessoas = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetEquipanteEvento(int Id, int eventoId)
        {
            var result = mapper.Map<PostEquipanteModel>(equipesBusiness.GetEquipanteEvento(Id));

            result.Quarto =
                quartosBusiness
                    .GetQuartosComParticipantes(eventoId, TipoPessoaEnum.Equipante)
                    .Where(x => x.EquipanteId == result.EquipanteId)
                    .FirstOrDefault()
                    ?.Quarto
                    ?.Titulo ?? "";

            return Json(new { Equipante = result }, JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult PostEquipante(PostInscricaoModel model)
        {
            var evento = eventosBusiness.GetEventoById(model.EventoId);
            if (model.Inscricao)
            {
                if (!string.IsNullOrEmpty(evento.Configuracao.AccessTokenMercadoPago))
                {
                    MercadoPagoConfig.AccessToken = evento.Configuracao.AccessTokenMercadoPago;
                    Guid g = Guid.NewGuid();
                    model.MercadoPagoId = g.ToString();
                    var request = new PreferenceRequest
                    {
                        PaymentMethods = new PreferencePaymentMethodsRequest
                        {                       
                            ExcludedPaymentMethods = new List<PreferencePaymentMethodRequest>
                            {
                                new PreferencePaymentMethodRequest
                                {
                                    Id = "pec",
                                },
                                        new PreferencePaymentMethodRequest
                                {
                                    Id = "bolbradesco",
                                },
                            },
                            ExcludedPaymentTypes = new List<PreferencePaymentTypeRequest>
                            {
                                new PreferencePaymentTypeRequest
                                {
                                    Id = "debit_card",
                                },
                            },
                        },
                        Items = new List<PreferenceItemRequest>
                        {
                            new PreferenceItemRequest
                            {
                                Id = "",
                                Title =
                                    $"Inscrição {evento.Numeracao.ToString()}º {evento.Configuracao.Titulo}",
                                Quantity = 1,
                                CurrencyId = "BRL",
                                UnitPrice = evento.ValorTaxa,
                                PictureUrl =
                                    $"https://{System.Web.HttpContext.Current.Request.Url.Host}/{evento.Configuracao.Identificador}/logo"
                            },
                        },
                        AutoReturn = "approved",
                        BackUrls = new PreferenceBackUrlsRequest
                        {
                            Success =
                                $"https://{System.Web.HttpContext.Current.Request.Url.Host}/Inscricoes/PagamentoConcluido",
                        },
                        ExternalReference = model.MercadoPagoId
                    };

                    // Cria a preferência usando o client
                    var client = new PreferenceClient();
                    Preference preference = client.Create(request);

                    model.MercadoPagoPreferenceId = preference.Id;
                }
            }

            var equipante = equipantesBusiness.PostEquipante(model);

            if (model.Inscricao)
            {
                string body = string.Empty;
                using (
                    StreamReader reader = new StreamReader(
                        Server.MapPath("~/EmailTemplates/Inscricao.html")
                    )
                )
                {
                    body = reader.ReadToEnd();
                }
                var ValorParticipante = evento.EventoLotes.Any(
                    y => y.DataLote >= System.DateTime.Today
                )
                    ? evento
                        .EventoLotes.Where(y => y.DataLote >= System.DateTime.Today)
                        .OrderBy(y => y.DataLote)
                        .FirstOrDefault()
                        .ValorTaxa.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"))
                    : evento.ValorTaxa.ToString("C", CultureInfo.CreateSpecificCulture("pt-BR"));

                var msgConclusao = evento
                    .Configuracao.MsgConclusaoEquipe.Replace("${Nome}", model.Nome)
                    .Replace("${Id}", equipante.Id.ToString())
                    .Replace("${EventoId}", evento.Id.ToString())
                    .Replace("${Evento}", evento.Configuracao.Titulo)
                    .Replace("${NumeracaoEvento}", evento.Numeracao.ToString())
                    .Replace("${DescricaoEvento}", evento.Descricao)
                    .Replace("${ValorEvento}", ValorParticipante)
                    .Replace("${DataEvento}", evento.DataEvento.ToString("dd/MM/yyyy"));

                body = body.Replace("{{buttonColor}}", evento.Configuracao.CorBotao);
                body = body.Replace(
                    "{{logoEvento}}",
                    $"https://{Request.Url.Authority}/{evento.Configuracao.Identificador}/Logo"
                );
                body = body.Replace(
                    "{{qrcodeParticipante}}",
                    $"https://{Request.Url.Authority}/inscricoes/qrcode?eventoid={evento.Id.ToString()}&equipanteid={equipante.Id.ToString()}"
                );

                if (evento.Configuracao.TipoEvento == TipoEventoEnum.Casais)
                {
                    var casal = equipantesBusiness
                        .GetEquipantes()
                        .FirstOrDefault(x => x.Conjuge == equipante.Nome);

                    if (casal != null)
                    {
                        msgConclusao = msgConclusao.Replace(
                            "${Apelido}",
                            $"{equipante.Apelido} e {casal.Apelido}"
                        );
                        body = body.Replace("{{msgConclusao}}", msgConclusao);

                        emailSender.SendEmail(
                            equipante.Email,
                            "Confirmar Inscrição",
                            body,
                            evento.Configuracao.Titulo
                        );
                        emailSender.SendEmail(
                            casal.Email,
                            "Confirmar Inscrição",
                            body,
                            evento.Configuracao.Titulo
                        );
                    }
                }
                else
                {
                    msgConclusao = msgConclusao.Replace("${Apelido}", equipante.Apelido);
                    body = body.Replace("{{msgConclusao}}", msgConclusao);

                    emailSender.SendEmail(
                        equipante.Email,
                        "Confirmar Inscrição",
                        body,
                        evento.Configuracao.Titulo
                    );
                }

                return Json(
                    Url.Action(
                        "InscricaoConcluida",
                        "Inscricoes",
                        new
                        {
                            Id = equipante.Id,
                            EventoId = model.EventoId,
                            Tipo = "Inscrições Equipe"
                        }
                    )
                );
            }
            else
            {
                return new HttpStatusCodeResult(200, "OK");
            }
        }

        [HttpPost]
        public ActionResult PostEtiquetas(string[] etiquetas, int id, string obs, int eventoId)
        {
            equipantesBusiness.PostEtiquetas(etiquetas, id, obs, eventoId);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpGet]
        public ActionResult GetDuplicados(string Search, int? Original)
        {
            var query = equipantesBusiness.GetEquipantes();

            query = query.Where(x => x.Nome.Contains(Search) || x.Apelido.Contains(Search));

            if (Original.HasValue)
            {
                query = query.Where(x => x.Id != Original.Value);
            }

            return Json(
                new
                {
                    Items = query
                        .ToList()
                        .Select(x => new { id = x.Id, text = $"{x.Nome} - {x.Apelido}" })
                        .Distinct()
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpGet]
        public ActionResult GetEquipanteTipoEvento(int EventoId, string Search)
        {
            var existentes = equipesBusiness
                .GetEquipantesEvento(EventoId)
                .Select(x => x.EquipanteId);

            var resultEquipantes = equipantesBusiness
                .GetEquipantes()
                .Where(
                    x =>
                        (x.Nome.Contains(Search) || x.Apelido.Contains(Search))
                        && x.Status != StatusEnum.Deletado
                )
                .Select(
                    x =>
                        new PessoaBase
                        {
                            Id = x.Id,
                            Nome = x.Nome,
                            Apelido = x.Apelido,
                            Email = x.Email,
                            Fone = x.Fone,
                            Tipo = "Equipante"
                        }
                )
                .ToList();

            var emails = resultEquipantes
                .Where(x => !string.IsNullOrEmpty(x.Email))
                .Select(y => y.Email)
                .ToList();
            var fones = resultEquipantes
                .Where(x => !string.IsNullOrEmpty(x.Fone))
                .Select(y => y.Fone)
                .ToList();

            var resultParticipantes = participantesBusiness
                .GetParticipantesByTipoEvento(EventoId)
                .Where(
                    x =>
                        (x.Nome.Contains(Search) || x.Apelido.Contains(Search))
                        && !emails.Contains(x.Email)
                        && !fones.Contains(x.Fone)
                )
                .Select(
                    x =>
                        new PessoaBase
                        {
                            Id = x.Id,
                            Nome = x.Nome,
                            Apelido = x.Apelido,
                            Email = x.Email,
                            Fone = x.Fone,
                            Tipo = "Participante"
                        }
                )
                .ToList();

            resultEquipantes.AddRange(resultParticipantes);

            resultEquipantes = resultEquipantes
                .Where(
                    x =>
                        (x.Tipo == "Equipante" && !existentes.Contains(x.Id))
                        || x.Tipo == "Participante"
                )
                .ToList();
            return Json(
                new
                {
                    Items = resultEquipantes
                        .Select(
                            x =>
                                new
                                {
                                    x.Tipo,
                                    id = x.Id,
                                    text = $"{x.Nome} - {x.Apelido}"
                                }
                        )
                        .Distinct()
                },
                JsonRequestBehavior.AllowGet
            );
        }

        [HttpPost]
        public ActionResult RemoverDuplicado(int Original, int Duplicado)
        {
            equipantesBusiness.RemoverDuplicado(Original, Duplicado);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult DeleteEquipante(int Id, int? EventoId)
        {
            equipantesBusiness.DeleteEquipante(Id, EventoId);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult ToggleSexo(int Id)
        {
            equipantesBusiness.ToggleSexo(Id);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult ToggleTeste(int Id)
        {
            equipantesBusiness.ToggleTeste(Id);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult ToggleCheckin(int Id)
        {
            equipantesBusiness.ToggleCheckin(Id);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult ToggleStatusMontagem(int Id, int EventoId)
        {
            equipantesBusiness.ToggleStatusMontagem(Id, EventoId);

            return new HttpStatusCodeResult(200, "OK");
        }

        [HttpPost]
        public ActionResult GetHistorico(int id)
        {
            var equipante = equipantesBusiness.GetEquipanteById(id);
            var result = equipante
                .Equipes.ToList()
                .Select(
                    x =>
                        new HistoricoModel
                        {
                            Evento = $"{x.Evento.Numeracao}º {x.Evento.Configuracao.Titulo}",
                            Equipe = x.Equipe.Nome,
                            Coordenador = x.Tipo.GetDescription()
                        }
                )
                .ToList();

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetHistoricoParticipacao(int id)
        {
            var equipante = equipantesBusiness.GetEquipanteById(id);
            var result = participantesBusiness
                .GetParticipantes()
                .Where(
                    x =>
                        (x.Status == StatusEnum.Confirmado || x.Status == StatusEnum.Checkin)
                        && ((!string.IsNullOrEmpty(equipante.Email) && x.Email == equipante.Email))
                )
                .ToList()
                .Select(
                    x =>
                        new HistoricoModel
                        {
                            Evento = $"{x.Evento.Numeracao}º {x.Evento.Configuracao.Titulo}",
                        }
                )
                .Distinct();

            return Json(new { data = result }, JsonRequestBehavior.AllowGet);
        }

        public class HistoricoModel
        {
            public string Evento { get; set; }
            public string Equipe { get; set; }
            public string Data { get; set; }
            public string Coordenador { get; set; }
        }
    }
}
