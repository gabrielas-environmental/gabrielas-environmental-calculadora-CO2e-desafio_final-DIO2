/**
 * app.js — Inicialização e controle de eventos da Calculadora de Emissão de CO₂e
 *
 * Depende (nesta ordem):
 *   1. js/routes-data.js  → RoutesDB
 *   2. js/config.js       → CONFIG
 *   3. js/calculator.js   → Calculator
 *   4. js/ui.js           → UI
 *
 * Padrão IIFE para não poluir o escopo global.
 */
(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────
   * INICIALIZAÇÃO — chamada quando o DOM está pronto
   * ───────────────────────────────────────────────────── */

  function init() {
    var form = document.getElementById("emission-form");
    if (!form) {
      console.error("❌ Formulário #emission-form não encontrado.");
      return;
    }

    // 1. Inicializa Google Maps API (async)
    //    Se a chave estiver configurada: carrega script, ativa Places Autocomplete
    //    Se não estiver: resolve false imediatamente e usa RoutesDB
    Maps.init(CONFIG.GOOGLE_MAPS_API_KEY).then(function (mapsLoaded) {

      if (mapsLoaded) {
        // Places Autocomplete nos campos de endereço (substitui o datalist)
        Maps.setupAutocomplete("origin");
        Maps.setupAutocomplete("destination");
        console.log("📍 Places Autocomplete ativado.");
      } else {
        // Sem Google Maps: preenche datalist com cidades da base local
        CONFIG.populateDatalist();
      }

      // 2. Ativa o autofill de distância (usa Maps ou RoutesDB conforme disponível)
      CONFIG.setupDistanceAutofill();

      // 3. Registra o handler de submit
      form.addEventListener("submit", handleSubmit);

      console.log("✅ Calculadora inicializada!");
    });
  }

  /* ─────────────────────────────────────────────────────
   * HANDLER DE SUBMIT
   * ───────────────────────────────────────────────────── */

  function handleSubmit(e) {
    // Impede o envio padrão do formulário (reload de página)
    e.preventDefault();

    var form      = e.target;
    var submitBtn = form.querySelector("button[type='submit']");

    /* 1. Coleta os valores do formulário */
    var origin        = document.getElementById("origin").value.trim();
    var destination   = document.getElementById("destination").value.trim();
    var distanceKm    = parseFloat(document.getElementById("distance").value);
    var modeInput     = form.querySelector("input[name='transport']:checked");
    var transportMode = modeInput ? modeInput.value : null;

    /* 2. Valida os campos — retorna mensagem de erro ou null */
    var errorMsg = _validate(origin, destination, distanceKm, transportMode);
    if (errorMsg) {
      UI.renderError(errorMsg);
      UI.showElement(document.getElementById("result"));
      return;
    }

    /* 3. Inicia estado de carregamento e oculta resultado anterior */
    UI.showLoading(submitBtn);
    UI.hideElement(document.getElementById("result"));

    /* 4. Simula latência de processamento (1200ms) e executa o cálculo */
    setTimeout(function () {
      try {
        // Gera o sumário completo: emissão, savings, créditos, comparativo e projeção anual
        var summary = Calculator.getSummary(distanceKm, transportMode);

        // Renderiza os três cartões de resultado em sequência
        UI.render(summary);

        console.log("📊 Resultado calculado:", summary);

      } catch (err) {
        // Captura erros inesperados e exibe mensagem amigável ao usuário
        console.error("❌ Erro ao calcular emissão:", err);
        UI.renderError("Ocorreu um erro inesperado ao calcular. Tente novamente.");

      } finally {
        // Sempre restaura o botão, independente de sucesso ou erro
        UI.hideLoading(submitBtn);
      }
    }, 1200);
  }

  /* ─────────────────────────────────────────────────────
   * VALIDAÇÃO DE FORMULÁRIO
   * ───────────────────────────────────────────────────── */

  /**
   * Valida todos os campos do formulário antes de calcular.
   * @param  {string} origin
   * @param  {string} destination
   * @param  {number} distanceKm
   * @param  {string|null} transportMode
   * @returns {string|null}  Mensagem de erro, ou null se tudo válido
   */
  function _validate(origin, destination, distanceKm, transportMode) {
    if (!origin)                              return "Informe a cidade de origem.";
    if (!destination)                         return "Informe a cidade de destino.";
    if (origin.toLowerCase() === destination.toLowerCase())
                                              return "Origem e destino não podem ser iguais.";
    if (!distanceKm || isNaN(distanceKm))     return "A distância não foi preenchida. Verifique origem e destino ou insira manualmente.";
    if (distanceKm <= 0)                      return "A distância deve ser maior que zero.";
    if (!transportMode)                       return "Selecione um meio de transporte.";
    return null;
  }

  /* ─────────────────────────────────────────────────────
   * START
   * ───────────────────────────────────────────────────── */

  document.addEventListener("DOMContentLoaded", init);

})();
