
using AutoMapper;
using Core.Models.Carona;
using Core.Models.Configuracao;
using Core.Models.Cracha;
using Core.Models.Equipantes;
using Core.Models.Etiquetas;
using Core.Models.Eventos;
using Core.Models.Mensagem;
using Core.Models.Participantes;
using Core.Models.Quartos;
using CsQuery.ExtensionMethods;
using CsQuery.ExtensionMethods.Internal;
using Data.Context;
using Data.Entities;
using SysIgreja.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
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
        public string Quarto { get; set; }
        public string Foto { get; set; }
        public string Circulo { get; set; }
    }

    public class EventoClaimModel
    {
        public int Id { get; set; }
        public int? ConfiguracaoId { get; set; }
        public string Role { get; set; }
        public int Numeracao { get; set; }
        public int? Capacidade { get; set; }
        public string DataEvento { get; set; }
        public string Status { get; set; }
        public string StatusEquipe { get; set; }
        public string Titulo { get; set; }
        public string PublicTokenMercadoPago { get; set; }
        public string AccessTokenMercadoPago { get; set; }
        public int? BackgroundId { get; set; }
        public int? LogoId { get; set; }
        public int? LogoRelatorioId { get; set; }
        public string Identificador { get; set; }
        public string EquipeCirculo { get; set; }
        public string CorBotao { get; set; }
        public string TipoEvento { get; set; }
        public string TipoCirculo { get; set; }
        public string TipoQuarto { get; set; }
        public bool Coordenador { get; set; }
        public bool Dirigente { get; set; }
        public int Valor { get; set; }
        public int ValorTaxa { get; set; }
        public IEnumerable<MeioPagamentoModel> MeioPagamentos { get; set; }
        public IEnumerable<EtiquetaModel> Etiquetas { get; set; }
        public IEnumerable<CentroCustoModel> CentroCustos { get; set; }
        public IEnumerable<PostMessageModel> Mensagens { get; set; }


    }

    public class CrachaCasalModel
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Apelido { get; set; }
        public string Equipe { get; set; }
        public string Foto { get; set; }
        public string Quarto { get; set; }
        public string Circulo { get; set; }
    }

    public class PessoaSelectModel
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Apelido { get; set; }
    }
    public class MapperRealidade
    {
        public IMapper mapper;
        public MapperRealidade()
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<Configuracao, EventoClaimModel>()
                   .ForMember(dest => dest.TipoQuarto, opt => opt.MapFrom(x => x.TipoQuarto != null ? x.TipoQuarto.Value.GetDescription() : ""))
                   .ForMember(dest => dest.EquipeCirculo, opt => opt.MapFrom(x => x.EquipeCirculo.Nome))
                .ForMember(dest => dest.TipoEvento, opt => opt.MapFrom(x => x.TipoEvento != null ? x.TipoEvento.Value.GetDescription() : ""))
                .ForMember(dest => dest.TipoCirculo, opt => opt.MapFrom(x => x.TipoCirculo.GetDescription()));
                cfg.CreateMap<MeioPagamento, MeioPagamentoModel>();
                cfg.CreateMap<CentroCusto, CentroCustoModel>().ForMember(dest => dest.Tipo, opt => opt.MapFrom(x => x.Tipo.GetDescription()));
                cfg.CreateMap<Mensagem, PostMessageModel>();
                cfg.CreateMap<Etiqueta, EtiquetaModel>();
                cfg.CreateMap<EquipanteEvento, PessoaSelectModel>()
                    .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                    .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)));
                cfg.CreateMap<Participante, PessoaSelectModel>()
                      .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                      .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)));
                cfg.CreateMap<Equipante, CrachaModel>()
                    .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
                    .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipes.Any() ? x.Equipes.LastOrDefault().Equipe.Nome : null)));
                cfg.CreateMap<Equipante, CrachaCasalModel>()
                .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                  .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Dupla)))
                   .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""));
                cfg.CreateMap<EquipanteEvento, CrachaModel>()
                    .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                    .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
                    .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Equipante.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
                    .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)));
                cfg.CreateMap<EquipanteEvento, CrachaCasalModel>()
                   .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                   .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Dupla)))
                   .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Equipante.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
                   .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)));
                cfg.CreateMap<Participante, CrachaModel>()
                    .ForMember(dest => dest.Foto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto) ? Convert.ToBase64String(x.Arquivos.FirstOrDefault(y => y.IsFoto).Conteudo) : ""))
                         .ForMember(dest => dest.Circulo, opt => opt.MapFrom(x => x.Circulos.Any() ? (x.Circulos.LastOrDefault().Circulo.Titulo) : ""))
                            .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Quartos.Any() ? x.Quartos.Select(y => y.Quarto).First().Titulo : ""));
                cfg.CreateMap<Participante, CrachaCasalModel>()
                  .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                  .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Dupla)))
                    .ForMember(dest => dest.Circulo, opt => opt.MapFrom(x => x.Circulos.Any() ? (x.Circulos.LastOrDefault().Circulo.Titulo) : ""))
                            .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Quartos.Any() ? x.Quartos.Select(y => y.Quarto).First().Titulo : ""))
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
                    .ForMember(dest => dest.Circulo, opt => opt.MapFrom(x => x.Circulos.Any() ? (x.Circulos.LastOrDefault().Circulo.Titulo) : ""))
                    .ForMember(dest => dest.Motorista, opt => opt.MapFrom(x => x.Caronas.Any() ? x.Caronas.LastOrDefault().Carona.Motorista.Nome : ""))
                    .ForMember(dest => dest.Padrinho, opt => opt.MapFrom(x => x.Padrinho.EquipanteEvento.Equipante.Nome ?? ""))
                    .ForMember(dest => dest.Situacao, opt => opt.MapFrom(x => x.Status.GetDescription()));
                cfg.CreateMap<Participante, ParticipanteListModel>()
                    .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                    .ForMember(dest => dest.MercadoPagoPreferenceId, opt => opt.MapFrom(x => x.MercadoPagoPreferenceId))
                    .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)))
                    .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.DataNascimento)))
                    .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Arquivos.Count()))
                    .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto)))
                    .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Sexo.GetDescription()))
                    .ForMember(dest => dest.DataCasamento, opt => opt.MapFrom(x => x.DataCasamento.HasValue ? x.DataCasamento.Value.ToString("dd/MM/yyyy") : ""))
                    .ForMember(dest => dest.Padrinho, opt => opt.MapFrom(x => x.PadrinhoId.HasValue ? x.Padrinho.EquipanteEvento.Equipante.Nome : null))
                    .ForMember(dest => dest.Circulo, opt => opt.MapFrom(x => x.Circulos.Any() ? (x.Circulos.LastOrDefault().Circulo.Cor ?? x.Circulos.LastOrDefault().Circulo.Titulo) : ""))
                    .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                    .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Quartos.Any() ? x.Quartos.Select(y => y.Quarto).First().Titulo : ""))
                        .ForMember(dest => dest.Motorista, opt => opt.MapFrom(x => x.Caronas.Any() ? x.Caronas.LastOrDefault().Carona.Motorista.Nome : ""))
                    .ForMember(dest => dest.Status, opt => opt.MapFrom(x => x.Status.GetDescription()));
                cfg.CreateMap<Equipante, EquipanteListModel>()
                      .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd/MM/yyyy") : ""))
                    .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                    .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => x.Fone))
                    .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)))
                    .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                    .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.DataNascimento)))
                    .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Sexo.GetDescription()))
                    .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Arquivos.Any(y => y.IsFoto)))
                    .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Arquivos.Count()));
                cfg.CreateMap<CirculoParticipante, EquipanteListModel>()
                   .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.Participante.DataNascimento.HasValue ? x.Participante.DataNascimento.Value.ToString("dd/MM/yyyy") : ""))
                 .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Participante.Nome)))
                 .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => x.Participante.Fone))
                 .ForMember(dest => dest.Id, opt => opt.MapFrom(x => x.ParticipanteId))
                 .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Participante.Apelido)))
                 .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.Participante.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                 .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.Participante.DataNascimento)))
                 .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Participante.Sexo.GetDescription()))
                 .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Participante.Arquivos.Any(y => y.IsFoto)))
                 .ForMember(dest => dest.Faltas, opt => opt.MapFrom(x => x.Participante.Presencas.Count(y => y.Reuniao.Status != Utils.Enums.StatusEnum.Deletado)))
                 .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Participante.Arquivos.Count()));
                cfg.CreateMap<ApplicationUser, EquipanteUser>()
                    .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.Equipante.DataNascimento.HasValue ? x.Equipante.DataNascimento.Value.ToString("dd/MM/yyyy") : ""))
                  .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                  .ForMember(dest => dest.Email, opt => opt.MapFrom(x => x.Equipante.Email))
                  .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => x.Equipante.Fone))
                  .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
                  .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.Equipante.DataNascimento)))
                  .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Equipante.Sexo.GetDescription()));
                cfg.CreateMap<ParticipanteConsulta, EquipanteListModel>()
                    .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.DataNascimento.HasValue ? x.DataNascimento.Value.ToString("dd/MM/yyyy") : ""))
                  .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Nome)))
                  .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => x.Fone))
                  .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Apelido)))
                  .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.DataNascimento)))
                  .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Sexo.GetDescription()));
                cfg.CreateMap<EquipanteEvento, EquipanteListModel>()
                               .ForMember(dest => dest.DataNascimento, opt => opt.MapFrom(x => x.Equipante.DataNascimento.HasValue ? x.Equipante.DataNascimento.Value.ToString("dd/MM/yyyy") : ""))
                    .ForMember(dest => dest.Id, opt => opt.MapFrom(x => x.Equipante.Id))
                    .ForMember(dest => dest.EquipanteEventoId, opt => opt.MapFrom(x => x.Id))
                    .ForMember(dest => dest.Nome, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Nome)))
                                        .ForMember(dest => dest.Dupla, opt => opt.MapFrom(x => x.Equipante.Dupla))
                    .ForMember(dest => dest.Fone, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Fone)))
                    .ForMember(dest => dest.Congregacao, opt => opt.MapFrom(x => x.Equipante.Congregacao))
                          .ForMember(dest => dest.Email, opt => opt.MapFrom(x => x.Equipante.Email))
                    .ForMember(dest => dest.Apelido, opt => opt.MapFrom(x => UtilServices.CapitalizarNome(x.Equipante.Apelido)))
                    .ForMember(dest => dest.Etiquetas, opt => opt.MapFrom(x => x.Equipante.ParticipantesEtiquetas.Select(y => y.Etiqueta)))
                    .ForMember(dest => dest.Idade, opt => opt.MapFrom(x => UtilServices.GetAge(x.Equipante.DataNascimento)))
                    .ForMember(dest => dest.Sexo, opt => opt.MapFrom(x => x.Equipante.Sexo.GetDescription()))
                    .ForMember(dest => dest.HasFoto, opt => opt.MapFrom(x => x.Equipante.Arquivos.Any(y => y.IsFoto)))
                    .ForMember(dest => dest.HasOferta, opt => opt.MapFrom(x => x.Equipante.Lancamentos.Any(y => y.CentroCustoId == y.Evento.Configuracao.CentroCustoTaxaId && y.EventoId == x.EventoId)))
                    .ForMember(dest => dest.QtdAnexos, opt => opt.MapFrom(x => x.Equipante.Arquivos.Count()))
                    .ForMember(dest => dest.Tipo, opt => opt.MapFrom(x => x.Tipo.GetDescription()))
                    .ForMember(dest => dest.Faltas, opt => opt.MapFrom(x => x.Presencas.Count()))
                    .ForMember(dest => dest.Status, opt => opt.MapFrom(x => x.Equipante.Status.GetDescription()))
                    .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)))
                     .ForMember(dest => dest.CEP, opt => opt.MapFrom(x => x.Equipante.CEP))
                    .ForMember(dest => dest.Logradouro, opt => opt.MapFrom(x => x.Equipante.Logradouro))
                    .ForMember(dest => dest.Bairro, opt => opt.MapFrom(x => x.Equipante.Bairro))
                    .ForMember(dest => dest.Cidade, opt => opt.MapFrom(x => x.Equipante.Cidade))
                    .ForMember(dest => dest.Longitude, opt => opt.MapFrom(x => x.Equipante.Longitude))
                    .ForMember(dest => dest.Latitude, opt => opt.MapFrom(x => x.Equipante.Latitude))
                    .ForMember(dest => dest.Referencia, opt => opt.MapFrom(x => x.Equipante.Referencia))
                    .ForMember(dest => dest.Numero, opt => opt.MapFrom(x => x.Equipante.Numero))
                    .ForMember(dest => dest.MercadoPagoPreferenceId, opt => opt.MapFrom(x => x.MercadoPagoPreferenceId))
                    .ForMember(dest => dest.Estado, opt => opt.MapFrom(x => x.Equipante.Estado))
                    .ForMember(dest => dest.Camisa, opt => opt.MapFrom(x => x.Equipante.Camisa))
                    .ForMember(dest => dest.HasConvenio, opt => opt.MapFrom(x => x.Equipante.HasConvenio))
                    .ForMember(dest => dest.Convenio, opt => opt.MapFrom(x => x.Equipante.Convenio))
                    .ForMember(dest => dest.Hospitais, opt => opt.MapFrom(x => x.Equipante.Hospitais))
                      .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Equipante.Quartos.Any(y => y.Quarto.EventoId == x.EventoId) ? x.Equipante.Quartos.Where(y => y.Quarto.EventoId == x.EventoId).Select(y => y.Quarto).First().Titulo : ""))
                    .ForMember(dest => dest.HasParente, opt => opt.MapFrom(x => x.Equipante.HasParente))
                    .ForMember(dest => dest.Parente, opt => opt.MapFrom(x => x.Equipante.Parente))
                    .ForMember(dest => dest.Congregacao, opt => opt.MapFrom(x => x.Equipante.Congregacao))
                    .ForMember(dest => dest.Checkin, opt => opt.MapFrom(x => x.Checkin))
                                 .ForMember(dest => dest.Presenca, opt => opt.MapFrom(x => x.Evento.Reunioes.Where(y => y.Tipo == Utils.Enums.TipoPessoaEnum.Equipante && y.DataReuniao.Date < System.DateTime.Today && y.Status != Utils.Enums.StatusEnum.Deletado).Select(y => x.Presencas.Any(z => z.ReuniaoId == y.Id))))
                       .ForMember(dest => dest.StatusMontagem, opt => opt.MapFrom(x => x.StatusMontagem.GetDescription()));
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
                       .ForMember(dest => dest.Presenca, opt => opt.MapFrom(x => x.Presencas.Count()))
                    .ForMember(dest => dest.FoneContato, opt => opt.MapFrom(x => x.Equipante.FoneContato))
                    .ForMember(dest => dest.NomeConvite, opt => opt.MapFrom(x => x.Equipante.NomeConvite))
                    .ForMember(dest => dest.FoneConvite, opt => opt.MapFrom(x => x.Equipante.FoneConvite))
                    .ForMember(dest => dest.RestricaoAlimentar, opt => opt.MapFrom(x => x.Equipante.RestricaoAlimentar))
                    .ForMember(dest => dest.Medicacao, opt => opt.MapFrom(x => x.Equipante.Medicacao))
                    .ForMember(dest => dest.Alergia, opt => opt.MapFrom(x => x.Equipante.Alergia))
                    .ForMember(dest => dest.Convenio, opt => opt.MapFrom(x => x.Equipante.Convenio))
                    .ForMember(dest => dest.Congregacao, opt => opt.MapFrom(x => x.Equipante.Congregacao))
                      .ForMember(dest => dest.Equipe, opt => opt.MapFrom(x => (x.Equipe.Nome)))
                                   .ForMember(dest => dest.Tipo, opt => opt.MapFrom(x => (x.Tipo.GetDescription())))
                      .ForMember(dest => dest.Situacao, opt => opt.MapFrom(x => x.Equipante.Lancamentos.Any(y => y.CentroCustoId == y.Evento.Configuracao.CentroCustoTaxaId && y.EventoId == x.EventoId) ? "Pago" : "Pendente"))
                    .ForMember(dest => dest.Quarto, opt => opt.MapFrom(x => x.Equipante.Quartos.Any(y => y.Quarto.EventoId == x.EventoId) ? x.Equipante.Quartos.Where(y => y.Quarto.EventoId == x.EventoId).Select(y => y.Quarto).First().Titulo : ""))
         .ForMember(dest => dest.DataCasamento, opt => opt.MapFrom(x => x.Equipante.DataCasamento.HasValue ? x.Equipante.DataCasamento.Value.ToString("dd/MM/yyyy") : ""))
                    .ForMember(dest => dest.Hospitais, opt => opt.MapFrom(x => x.Equipante.Hospitais));
            });
            mapper = configuration.CreateMapper();
        }
    }
}
