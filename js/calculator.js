/**
 * Calculator — Lógica de cálculo da Calculadora de Emissão de CO₂e
 *
 * Depende de: CONFIG (js/config.js) → deve ser carregado antes deste arquivo.
 *
 * Convenções:
 *   - Emissões sempre em kg CO₂e
 *   - Créditos de carbono em tCO₂e (1 crédito = 1000 kg)
 *   - Todos os números retornados arredondados a 2 casas decimais
 *   - Baseline de comparação: sempre o carro (modal mais comum no commuting)
 */
var Calculator = {

  /* ─────────────────────────────────────────────────────
   * VALIDAÇÃO
   * ───────────────────────────────────────────────────── */

  /**
   * Verifica se os inputs são válidos antes de calcular.
   * @param  {number} distanceKm
   * @param  {string} transportMode
   * @returns {{ valid: boolean, error: string|null }}
   */
  validate: function (distanceKm, transportMode) {
    if (!distanceKm || isNaN(distanceKm) || distanceKm <= 0) {
      return { valid: false, error: "Distância inválida ou não informada." };
    }
    if (!transportMode || CONFIG.EMISSION_FACTORS[transportMode] === undefined) {
      return { valid: false, error: "Modal de transporte não reconhecido." };
    }
    return { valid: true, error: null };
  },

  /* ─────────────────────────────────────────────────────
   * CÁLCULOS PRINCIPAIS
   * ───────────────────────────────────────────────────── */

  /**
   * Calcula a emissão de CO₂e para um trecho e modal.
   * @param  {number} distanceKm    Distância em km
   * @param  {string} transportMode Chave do modal (bicycle | car | bus | truck)
   * @returns {number|null}         Emissão em kg CO₂e, ou null se inválido
   */
  calculateEmission: function (distanceKm, transportMode) {
    var factor = CONFIG.EMISSION_FACTORS[transportMode];
    if (factor === undefined) return null;
    return this._round(distanceKm * factor);
  },

  /**
   * Calcula a emissão para todos os modais e compara com o carro.
   * Útil para exibir a tabela comparativa de modais.
   * @param  {number} distanceKm
   * @returns {Array<{ mode, label, icon, color, emission, percentageVsCar }>}
   *          Array ordenado do menor para o maior emissor.
   */
  calculateAllModes: function (distanceKm) {
    var self = this;
    var results = [];
    var carEmission = this.calculateEmission(distanceKm, "car");

    Object.keys(CONFIG.EMISSION_FACTORS).forEach(function (mode) {
      var emission = self.calculateEmission(distanceKm, mode);

      // % em relação ao carro: bicicleta = 0%, carro = 100%, etc.
      var percentageVsCar = carEmission > 0
        ? self._round((emission / carEmission) * 100)
        : 0;

      results.push({
        mode:            mode,
        label:           CONFIG.TRANSPORT_MODES[mode].label,
        icon:            CONFIG.TRANSPORT_MODES[mode].icon,
        color:           CONFIG.TRANSPORT_MODES[mode].color,
        emission:        emission,
        percentageVsCar: percentageVsCar,
      });
    });

    return results.sort(function (a, b) { return a.emission - b.emission; });
  },

  /**
   * Calcula a economia de emissões em relação ao carro (baseline).
   * @param  {number} emission         Emissão do modal escolhido (kg CO₂e)
   * @param  {number} baselineEmission Emissão do carro para a mesma rota (kg CO₂e)
   * @returns {{ savedKg: number, percentage: number }}
   */
  calculateSavings: function (emission, baselineEmission) {
    if (!baselineEmission || baselineEmission <= 0) {
      return { savedKg: 0, percentage: 0 };
    }
    var savedKg    = this._round(baselineEmission - emission);
    var percentage = this._round((savedKg / baselineEmission) * 100);
    return { savedKg: savedKg, percentage: percentage };
  },

  /**
   * Converte kg de CO₂e em créditos de carbono (tCO₂e).
   * @param  {number} emissionKg
   * @returns {number} Créditos de carbono (pode ser fração)
   */
  calculateCarbonCredits: function (emissionKg) {
    return this._round(emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT);
  },

  /**
   * Estima o valor financeiro dos créditos de carbono gerados/compensados.
   * @param  {number} credits Quantidade de créditos (tCO₂e)
   * @returns {{ min: number, max: number, average: number }} Valores em R$
   */
  estimateCreditPrice: function (credits) {
    var min     = this._round(credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL);
    var max     = this._round(credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL);
    var average = this._round((min + max) / 2);
    return { min: min, max: max, average: average };
  },

  /* ─────────────────────────────────────────────────────
   * EXTRAS — adicionados para completar o fluxo da UI
   * ───────────────────────────────────────────────────── */

  /**
   * Projeção anual de emissões, considerando ida + volta e dias úteis.
   * @param  {number} dailyEmissionKg  Emissão de um trecho (ida)
   * @param  {number} workingDays      Dias úteis por ano (padrão: 220)
   * @returns {{ annualKg: number, annualCredits: number, creditPrice: object }}
   */
  annualProjection: function (dailyEmissionKg, workingDays) {
    var days      = workingDays || 220;
    var annualKg  = this._round(dailyEmissionKg * 2 * days); // ida + volta
    var credits   = this.calculateCarbonCredits(annualKg);
    var price     = this.estimateCreditPrice(credits);
    return { annualKg: annualKg, annualCredits: credits, creditPrice: price };
  },

  /**
   * Gera o resultado completo de uma submissão do formulário.
   * Ponto de entrada principal para a UI.
   * @param  {number} distanceKm
   * @param  {string} transportMode
   * @returns {object|null} Resultado completo, ou null se inválido
   */
  getSummary: function (distanceKm, transportMode) {
    var check = this.validate(distanceKm, transportMode);
    if (!check.valid) {
      return { error: check.error };
    }

    var emission    = this.calculateEmission(distanceKm, transportMode);
    var carEmission = this.calculateEmission(distanceKm, "car");
    var savings     = transportMode !== "car"
      ? this.calculateSavings(emission, carEmission)
      : null;
    var credits     = this.calculateCarbonCredits(emission);
    var creditPrice = this.estimateCreditPrice(credits);
    var allModes    = this.calculateAllModes(distanceKm);
    var annual      = this.annualProjection(emission);

    return {
      distanceKm:    distanceKm,
      transportMode: transportMode,
      modeLabel:     CONFIG.TRANSPORT_MODES[transportMode].label,
      modeIcon:      CONFIG.TRANSPORT_MODES[transportMode].icon,
      emission:      emission,        // kg CO₂e (trecho único)
      carEmission:   carEmission,     // kg CO₂e de carro (baseline)
      savings:       savings,         // { savedKg, percentage } vs carro
      credits:       credits,         // créditos de carbono (tCO₂e)
      creditPrice:   creditPrice,     // { min, max, average } em R$
      allModes:      allModes,        // comparativo de todos os modais
      annual:        annual,          // projeção anual (220 dias úteis, ida+volta)
    };
  },

  /* ─────────────────────────────────────────────────────
   * UTILITÁRIO INTERNO
   * ───────────────────────────────────────────────────── */

  /** Arredonda para 2 casas decimais. */
  _round: function (value) {
    return Math.round(value * 100) / 100;
  },
};
