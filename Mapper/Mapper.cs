using Arquitetura.ViewModels;
using AutoMapper;
using Core.Business.Arquivos;
using Core.Business.Equipantes;
using Core.Business.Equipes;
using Core.Business.Eventos;
using Core.Business.Lancamento;
using Core.Business.MeioPagamento;
using Core.Business.Reunioes;
using Core.Models.Carona;
using Core.Models.Cracha;
using Core.Models.Equipantes;
using Core.Models.Etiquetas;
using Core.Models.Eventos;
using Core.Models.Lancamento;
using Core.Models.Participantes;
using Core.Models.Quartos;
using Data.Entities;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Utils.Constants;
using Utils.Enums;
using Utils.Extensions;
using Utils.Services;

namespace SysIgreja.Controllers
{

    public class CrachaModel
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Apelido { get; set; }
        public string Equipe { get; set; }
        public string Foto { get; set; }
    }
    public class MapperRealidade
    {

        public IMapper mapper;

        public MapperRealidade()
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<Equipante, CrachaModel>()

                    .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
                    .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipes.Any() ? x.Equipes.LastOrDefault().Equipe.Nome : null)));
                cfg.CreateMap<EquipanteEvento, CrachaModel>()
                                .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
          .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
                    .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Equipante.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
                    .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)));
                cfg.CreateMap<Participante, CrachaModel>()
                   .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""));
                cfg.CreateMap<Equipante, PostEquipanteModel>()
                .ForMember(dest => dest.EtiquetasList, opt => opt.MapFrom(x => x.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""));
                cfg.CreateMap<Carona, PostCaronaModel>().ForMember(dest => dest.Motorista, opt => opt.MapFrom(x => x.Motorista.Nome));
                cfg.CreateMap<Quarto, PostQuartoModel>().ForMember(dest => dest.Equipante, opt => opt.MapFrom(x => x.Equipante != null ? x.Equipante.Nome : ""));
                cfg.CreateMap<Evento, PostEventoModel>();
                cfg.CreateMap<Cracha, PostCrachaModel>();
                cfg.CreateMap<Participante, ParticipanteSelectModel>();
                cfg.CreateMap<Etiqueta, PostEtiquetaModel>();
                cfg.CreateMap<Participante, ParticipanteExcelViewModel>()
                                .ForMember(dest => dest.DataCadastro, opt => opt.MapFrom(x => x.DataCadastro.HasValue ? x.DataCadastro.Value.ToString("dd/MM/yyyy HH:mm") : ""))
           .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
          .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)))          
            .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.DataNascimento)))
            .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd/MM/yyyy") : ""))
            .ForMember(dest => dest.DataCasamento, opt => opt.MapFrom(x => x.DataCasamento.HasValue ? x.DataCasamento.Value.ToString("dd/MM/yyyy") : ""))
            .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Sexo.GetDescription()))
                        .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Quartos.Any() ? x.Quartos.Select(y => y.Quarto).First().Titulo : ""))
                         .ForMember(dest => dest.Circulo, opt => opt.MapFrom(x => x.Circulos.Any() ? (x.Circulos.LastOrDefault().Circulo.Cor.HasValue ? x.Circulos.LastOrDefault().Circulo.Cor.Value.GetDescription() : x.Circulos.LastOrDefault().Circulo.Titulo) : ""))
                                      .ForMember(dest => dest.Motorista, opt => opt.MapFrom(x => x.Caronas.Any() ? x.Caronas.LastOrDefault().Carona.Motorista.Nome : ""))
            .ForMember(dest => dest.Situacao, opt => opt.MapFrom(x => x.Status.GetDescription()));
                cfg.CreateMap<Participante, ParticipanteListModel>()
                                  .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                 .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)))
                    .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.DataNascimento)))
                    .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Arquivos.Count()))
                    .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto)))
                    .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Sexo.GetDescription()))
                            .ForMember(dest => dest.DataCasamento, opt => opt.MapFrom(x => x.DataCasamento.HasValue ? x.DataCasamento.Value.ToString("dd/MM/yyyy") : ""))
                    .ForMember(dest => dest.Padrinho, opt => opt.MapFrom(x => x.PadrinhoId.HasValue ? x.Padrinho.EquipanteEvento.Equipante.Nome : null))
                    .ForMember(dest => dest.Circulo, opt => opt.MapFrom(x => x.Circulos.Any() ? (x.Circulos.LastOrDefault().Circulo.Cor.HasValue ? x.Circulos.LastOrDefault().Circulo.Cor.Value.GetDescription() : x.Circulos.LastOrDefault().Circulo.Titulo) : ""))
                    .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                    .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Quartos.Any() ? x.Quartos.Select(y => y.Quarto).First().Titulo : ""))
                    .ForMember(dest => dest.Status, opt => opt.MapFrom(x => x.Status.GetDescription()));
                cfg.CreateMap<Equipante, EquipanteListModel>()
                    .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                    .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => x.Fone))
                    .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)))
                    .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                    .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.DataNascimento)))
                    .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Sexo.GetDescription()))
                    .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto)))
                    .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Arquivos.Count()));
                cfg.CreateMap<EquipanteEvento, EquipanteListModel>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => x.Equipante.Id))
                .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                 .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Fone)))
                .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
                .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.Equipante.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.Equipante.DataNascimento)))
                .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Equipante.Sexo.GetDescription()))
                .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto)))
                .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Equipante.Arquivos.Count()))
                .ForMember(dest => dest.Faltas, opt => opt.MapFrom(x => x.Evento.Reunioes.Count() - x.Presencas.Count()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(x => x.Equipante.Status.GetDescription()))
                .ForMember(dest => dest.HasOferta, opt => opt.MapFrom(x => x.Equipante.Lancamentos.Any(y => y.CentroCustoId == y.Evento.Configuracao.CentroCustoTaxaId && y.EventoId == x.EventoId)))
                .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)))
                .ForMember(dest => dest.Checkin, opt => opt.MapFrom(x => x.Checkin));

                cfg.CreateMap<EquipanteEvento, PostEquipanteModel>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(x => x.Equipante.Id))
               .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Fone)))
               .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
               .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.Equipante.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
               .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Equipante.Sexo.GetDescription()))
               .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto)))
               .ForMember(dest => dest.Status, opt => opt.MapFrom(x => x.Equipante.Status.GetDescription()))
                     .ForMember(dest => dest.Email, opt => opt.MapFrom(x => x.Equipante.Email))
               .ForMember(dest => dest.Observacao, opt => opt.MapFrom(x => x.Equipante.Observacao))
              .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.Equipante.DataNascimento))
              .ForMember(dest => dest.HasRestricaoAlimentar, opt => opt.MapFrom(x => x.Equipante.HasRestricaoAlimentar))
              .ForMember(dest => dest.RestricaoAlimentar, opt => opt.MapFrom(x => x.Equipante.RestricaoAlimentar))
              .ForMember(dest => dest.HasMedicacao, opt => opt.MapFrom(x => x.Equipante.HasMedicacao))
              .ForMember(dest => dest.Medicacao, opt => opt.MapFrom(x => x.Equipante.Medicacao))
              .ForMember(dest => dest.HasAlergia, opt => opt.MapFrom(x => x.Equipante.HasAlergia))
              .ForMember(dest => dest.Alergia, opt => opt.MapFrom(x => x.Equipante.Alergia))
              .ForMember(dest => dest.HasOferta, opt => opt.MapFrom(x => x.Equipante.Lancamentos.Any(y => y.CentroCustoId == y.Evento.Configuracao.CentroCustoTaxaId && y.EventoId == x.EventoId)))
              .ForMember(dest => dest.HasRestricaoAlimentar, opt => opt.MapFrom(x => x.Equipante.HasRestricaoAlimentar))
              .ForMember(dest => dest.CEP, opt => opt.MapFrom(x => x.Equipante.CEP))
              .ForMember(dest => dest.Logradouro, opt => opt.MapFrom(x => x.Equipante.Logradouro))
              .ForMember(dest => dest.Instagram, opt => opt.MapFrom(x => x.Equipante.Instagram))
              .ForMember(dest => dest.Bairro, opt => opt.MapFrom(x => x.Equipante.Bairro))
              .ForMember(dest => dest.Cidade, opt => opt.MapFrom(x => x.Equipante.Cidade))
              .ForMember(dest => dest.Longitude, opt => opt.MapFrom(x => x.Equipante.Longitude))
              .ForMember(dest => dest.Latitude, opt => opt.MapFrom(x => x.Equipante.Latitude))
              .ForMember(dest => dest.Referencia, opt => opt.MapFrom(x => x.Equipante.Referencia))
              .ForMember(dest => dest.Numero, opt => opt.MapFrom(x => x.Equipante.Numero))
              .ForMember(dest => dest.Estado, opt => opt.MapFrom(x => x.Equipante.Estado))
              .ForMember(dest => dest.Camisa, opt => opt.MapFrom(x => x.Equipante.Camisa))
              .ForMember(dest => dest.HasConvenio, opt => opt.MapFrom(x => x.Equipante.HasConvenio))
               .ForMember(dest => dest.Convenio, opt => opt.MapFrom(x => x.Equipante.Convenio))
              .ForMember(dest => dest.Hospitais, opt => opt.MapFrom(x => x.Equipante.Hospitais))
               .ForMember(dest => dest.HasParente, opt => opt.MapFrom(x => x.Equipante.HasParente))
              .ForMember(dest => dest.Parente, opt => opt.MapFrom(x => x.Equipante.Parente))
               .ForMember(dest => dest.Congregacao, opt => opt.MapFrom(x => x.Equipante.Congregacao))
               .ForMember(dest => dest.IsCasado, opt => opt.MapFrom(x => x.Equipante.IsCasado))
               .ForMember(dest => dest.DataCasamento, opt => opt.MapFrom(x => x.Equipante.DataCasamento))
              .ForMember(dest => dest.NomePai, opt => opt.MapFrom(x => x.Equipante.NomePai))
               .ForMember(dest => dest.FonePai, opt => opt.MapFrom(x => x.Equipante.FonePai))
              .ForMember(dest => dest.NomeMae, opt => opt.MapFrom(x => x.Equipante.NomeMae))
               .ForMember(dest => dest.FoneMae, opt => opt.MapFrom(x => x.Equipante.FoneMae))
              .ForMember(dest => dest.NomeContato, opt => opt.MapFrom(x => x.Equipante.NomeContato))
               .ForMember(dest => dest.FoneContato, opt => opt.MapFrom(x => x.Equipante.FoneContato))
              .ForMember(dest => dest.NomeConvite, opt => opt.MapFrom(x => x.Equipante.NomeConvite))
               .ForMember(dest => dest.FoneConvite, opt => opt.MapFrom(x => x.Equipante.FoneConvite))
              .ForMember(dest => dest.Conjuge, opt => opt.MapFrom(x => x.Equipante.Conjuge))
              .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)))
                 .ForMember(dest => dest.EtiquetasList, opt => opt.MapFrom(x => x.Equipante.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Equipante.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
               .ForMember(dest => dest.Checkin, opt => opt.MapFrom(x => x.Checkin));
            cfg.CreateMap<EquipanteEvento, EquipanteExcelModel>()
                .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
                .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.Equipante.DataNascimento)))
                .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.Equipante.DataNascimento))
   .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Fone)))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(x => x.Equipante.Email))
                .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Equipante.Sexo.GetDescription()))
                .ForMember(dest => dest.Conjuge, opt => opt.MapFrom(x => x.Equipante.Conjuge))
                .ForMember(dest => dest.Camisa, opt => opt.MapFrom(x => x.Equipante.Camisa))
                .ForMember(dest => dest.CEP, opt => opt.MapFrom(x => x.Equipante.CEP))
                .ForMember(dest => dest.Logradouro, opt => opt.MapFrom(x => x.Equipante.Logradouro))
                .ForMember(dest => dest.Bairro, opt => opt.MapFrom(x => x.Equipante.Bairro))
                .ForMember(dest => dest.Cidade, opt => opt.MapFrom(x => x.Equipante.Cidade))
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(x => x.Equipante.Estado))
                .ForMember(dest => dest.Numero, opt => opt.MapFrom(x => x.Equipante.Numero))
                .ForMember(dest => dest.Complemento, opt => opt.MapFrom(x => x.Equipante.Complemento))
                .ForMember(dest => dest.Referencia, opt => opt.MapFrom(x => x.Equipante.Referencia))
                .ForMember(dest => dest.NomePai, opt => opt.MapFrom(x => x.Equipante.NomePai))
                .ForMember(dest => dest.FonePai, opt => opt.MapFrom(x => x.Equipante.FonePai))
                .ForMember(dest => dest.NomeMae, opt => opt.MapFrom(x => x.Equipante.NomeMae))
                .ForMember(dest => dest.FoneMae, opt => opt.MapFrom(x => x.Equipante.FoneMae))
                .ForMember(dest => dest.NomeContato, opt => opt.MapFrom(x => x.Equipante.NomeContato))
                .ForMember(dest => dest.FoneContato, opt => opt.MapFrom(x => x.Equipante.FoneContato))
                .ForMember(dest => dest.NomeConvite, opt => opt.MapFrom(x => x.Equipante.NomeConvite))
                .ForMember(dest => dest.FoneConvite, opt => opt.MapFrom(x => x.Equipante.FoneConvite))
                .ForMember(dest => dest.RestricaoAlimentar, opt => opt.MapFrom(x => x.Equipante.RestricaoAlimentar))
                .ForMember(dest => dest.Medicacao, opt => opt.MapFrom(x => x.Equipante.Medicacao))
                .ForMember(dest => dest.Convenio, opt => opt.MapFrom(x => x.Equipante.Convenio))
                .ForMember(dest => dest.DataCasamento, opt => opt.MapFrom(x => x.Equipante.IsCasado.HasValue && x.Equipante.IsCasado.Value ? x.Equipante.DataCasamento.Value.ToString("dd/MM/yyyy") : ""))
                .ForMember(dest => dest.Hospitais, opt => opt.MapFrom(x => x.Equipante.Hospitais));                    


            });
            mapper = configuration.CreateMapper();
        }
    }

}
