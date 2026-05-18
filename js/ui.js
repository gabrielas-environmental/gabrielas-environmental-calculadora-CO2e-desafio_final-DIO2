/**
 * UI — Métodos de renderização e utilidades de interface
 *
 * Depende de: CONFIG (js/config.js) e Calculator (js/calculator.js)
 * Todos os elementos HTML gerados seguem nomenclatura BEM.
 */
var UI = {

  /* ─────────────────────────────────────────────────────
   * UTILIDADES
   * ───────────────────────────────────────────────────── */

  /**
   * Formata número com separadores pt-BR e casas decimais definidas.
   * @param  {number} number
   * @param  {number} decimals  Padrão: 2
   * @returns {string}          Ex: "1.234,56"
   */
  formatNumber: function (number, decimals) {
    var d = decimals !== undefined ? decimals : 2;
    return Number(number).toLocaleString("pt-BR", {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  },

  /**
   * Formata valor monetário em Real brasileiro.
   * @param  {number} value
   * @returns {string}  Ex: "R$ 1.234,56"
   */
  formatCurrency: function (value) {
    return "R$ " + this.formatNumber(value, 2);
  },

  /** Remove o atributo hidden e a classe hidden de um elemento. */
  showElement: function (element) {
    if (!element) return;
    element.hidden = false;
    element.classList.remove("hidden");
  },

  /** Adiciona o atributo hidden e a classe hidden a um elemento. */
  hideElement: function (element) {
    if (!element) return;
    element.hidden = true;
    element.classList.add("hidden");
  },

  /** Rola suavemente até o elemento. */
  scrollToElement: function (element) {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  },

  /** Coloca o botão em estado de carregamento com spinner. */
  showLoading: function (button) {
    if (!button) return;
    button._originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Calculando…";
    button.classList.add("btn--loading");
  },

  /** Restaura o botão ao estado original. */
  hideLoading: function (button) {
    if (!button) return;
    button.disabled = false;
    button.textContent = button._originalText || "Calcular Emissão";
    button.classList.remove("btn--loading");
  },

  /* ─────────────────────────────────────────────────────
   * HELPERS INTERNOS DE COR E TEXTO
   * ───────────────────────────────────────────────────── */

  /**
   * Retorna cor hex de acordo com % de emissão vs carro.
   * Verde → amarelo → laranja → vermelho → vermelho escuro (caminhão).
   */
  _emissionColor: function (pct) {
    if (pct === 0)    return "#3CAA5C"; // zero — bicicleta
    if (pct <= 50)    return "#3CAA5C"; // baixo
    if (pct <= 75)    return "#F59E0B"; // moderado
    if (pct < 100)    return "#F97316"; // elevado
    if (pct === 100)  return "#E8472A"; // baseline (carro)
    return "#991B1B";                   // acima do carro (caminhão)
  },

  /** Rótulo textual do nível de emissão. */
  _emissionLabel: function (pct) {
    if (pct === 0)   return "Zero emissão";
    if (pct <= 50)   return "Baixa emissão";
    if (pct <= 75)   return "Emissão moderada";
    if (pct < 100)   return "Emissão elevada";
    if (pct === 100) return "Referência (carro)";
    return "Alta emissão";
  },

  /** Dica ecológica personalizada por modal escolhido. */
  _ecoTip: function (mode) {
    var tips = {
      bicycle: "🌱 Parabéns! A bicicleta é o único modal com zero emissão de GEE. Além do clima, traz benefícios reais à saúde.",
      car:     "💡 O carro é o modal mais emissivo no commuting. Avaliar carona solidária ou transporte coletivo pode reduzir sua pegada em até 74%.",
      bus:     "👍 Ônibus é uma das melhores escolhas — reduz a emissão em ~26% comparado ao carro particular.",
      truck:   "⚠️ Caminhão emite 8× mais CO₂ por km que o carro. Para deslocamentos pessoais, considere outros modais.",
    };
    return tips[mode] || "";
  },

  /* ─────────────────────────────────────────────────────
   * RENDERIZAÇÃO
   * ───────────────────────────────────────────────────── */

  /**
   * Cartão principal: emissão calculada + economia vs carro + projeção anual.
   * Limpa a seção #result antes de renderizar.
   * @param {object} summary  Retorno de Calculator.getSummary()
   */
  renderResults: function (summary) {
    var el = document.getElementById("result");
    if (!el) return;

    /* Bloco de economia — exibido apenas quando o modal não é o carro */
    var savingsHtml = "";
    if (summary.savings && summary.savings.savedKg > 0) {
      savingsHtml = `
        <div class="result-card__savings">
          <span class="result-card__savings-badge">
            ↓ ${this.formatNumber(summary.savings.percentage, 0)}% vs carro
          </span>
          <span class="result-card__savings-kg">
            Economia: ${this.formatNumber(summary.savings.savedKg)} kg CO₂e neste trecho
          </span>
        </div>`;
    }

    /* Limpa e insere o cartão principal */
    el.innerHTML = `
      <!-- ── Cartão principal do resultado ── -->
      <div class="result-card">

        <div class="result-card__header">
          <span class="result-card__mode-icon" aria-hidden="true">${summary.modeIcon}</span>
          <div>
            <h2 class="result-card__title">Emissão calculada</h2>
            <p class="result-card__route">
              ${summary.modeLabel} &middot; ${this.formatNumber(summary.distanceKm, 0)} km
            </p>
          </div>
        </div>

        <div class="result-card__emission">
          <span class="result-card__value">${this.formatNumber(summary.emission)}</span>
          <span class="result-card__unit">kg CO₂e</span>
        </div>

        ${savingsHtml}

        <div class="result-card__annual">
          <span class="result-card__annual-label">
            📅 Projeção anual — 220 dias úteis, ida + volta
          </span>
          <strong class="result-card__annual-value">
            ${this.formatNumber(summary.annual.annualKg)} kg CO₂e/ano
          </strong>
        </div>

      </div>`;

    this.showElement(el);
  },

  /**
   * Grid comparativo: todos os modais com barras de progresso coloridas.
   * Appenda ao #result (chamado após renderResults).
   * @param {object} summary  Retorno de Calculator.getSummary()
   */
  renderComparison: function (summary) {
    var el = document.getElementById("result");
    if (!el) return;

    var self = this;

    var modesHtml = summary.allModes.map(function (mode) {
      var isSelected = mode.mode === summary.transportMode;
      var color      = self._emissionColor(mode.percentageVsCar);
      var label      = self._emissionLabel(mode.percentageVsCar);
      /* Barra limitada a 130% para não vazar o layout no caminhão */
      var barWidth   = Math.min(mode.percentageVsCar, 130);

      return `
        <!-- Modal: ${mode.label} -->
        <div class="comparison__item ${isSelected ? "comparison__item--selected" : ""}">
          <div class="comparison__item-header">
            <span class="comparison__item-icon" aria-hidden="true">${mode.icon}</span>
            <span class="comparison__item-label">${mode.label}</span>
            ${isSelected ? '<span class="comparison__badge">Seu modal</span>' : ""}
            <span class="comparison__item-emission">${self.formatNumber(mode.emission)} kg</span>
          </div>
          <div class="comparison__bar-track"
               role="progressbar"
               aria-valuenow="${mode.percentageVsCar}"
               aria-valuemin="0"
               aria-valuemax="130"
               aria-label="${mode.label}: ${mode.percentageVsCar}% vs carro">
            <div class="comparison__bar-fill"
                 style="width: ${barWidth}%; background-color: ${color};">
            </div>
          </div>
          <span class="comparison__level" style="color: ${color};">${label}</span>
        </div>`;
    }).join("");

    el.innerHTML += `
      <!-- ── Grid comparativo de modais ── -->
      <div class="comparison">
        <h3 class="comparison__title">Comparativo por modal</h3>
        <p class="comparison__subtitle">Emissões para ${this.formatNumber(summary.distanceKm, 0)} km · baseline: carro (100%)</p>

        <div class="comparison__grid">
          ${modesHtml}
        </div>

        <div class="comparison__eco-tip">
          <p>${this._ecoTip(summary.transportMode)}</p>
        </div>
      </div>`;
  },

  /**
   * Cartão de créditos de carbono: volume anual, faixa de preço e CTA.
   * Appenda ao #result (chamado após renderComparison).
   * @param {object} summary  Retorno de Calculator.getSummary()
   */
  renderCarbonCredits: function (summary) {
    var el = document.getElementById("result");
    if (!el) return;

    var credits = summary.annual.annualCredits;
    var price   = summary.annual.creditPrice;

    el.innerHTML += `
      <!-- ── Cartão de créditos de carbono ── -->
      <div class="credits-card">

        <h3 class="credits-card__title">💳 Créditos de Carbono</h3>

        <div class="credits-card__amount">
          <span class="credits-card__value">${this.formatNumber(credits, 4)}</span>
          <span class="credits-card__unit">tCO₂e / ano</span>
        </div>

        <div class="credits-card__price-grid">
          <div class="credits-card__price-item">
            <span class="credits-card__price-label">Mínimo</span>
            <strong class="credits-card__price-value">${this.formatCurrency(price.min)}</strong>
          </div>
          <div class="credits-card__price-item credits-card__price-item--avg">
            <span class="credits-card__price-label">Média estimada</span>
            <strong class="credits-card__price-value">${this.formatCurrency(price.average)}</strong>
          </div>
          <div class="credits-card__price-item">
            <span class="credits-card__price-label">Máximo</span>
            <strong class="credits-card__price-value">${this.formatCurrency(price.max)}</strong>
          </div>
        </div>

        <div class="credits-card__info">
          <p>
            Um crédito de carbono equivale à remoção ou compensação de 1 tCO₂e da atmosfera.
            Os valores seguem o mercado voluntário brasileiro (B3 CBIO e VCS). O cálculo usa
            fatores do <strong>GHG Protocol — Escopo 3, categoria commuting</strong>.
          </p>
        </div>

        <a class="credits-card__cta"
           href="https://www.b3.com.br/pt_br/b3/sustentabilidade/credito-de-carbono/"
           target="_blank"
           rel="noopener noreferrer">
          Saiba mais sobre compensação de carbono →
        </a>

      </div>`;
  },

  /**
   * Renderiza mensagem de erro amigável na seção de resultado.
   * @param {string} message
   */
  renderError: function (message) {
    var el = document.getElementById("result");
    if (!el) return;
    el.innerHTML = `
      <div class="result-error">
        <span class="result-error__icon">⚠️</span>
        <p class="result-error__message">${message}</p>
      </div>`;
    this.showElement(el);
    this.scrollToElement(el);
  },

  /**
   * Ponto de entrada principal — chama todos os métodos de renderização em sequência.
   * @param {object} summary  Retorno de Calculator.getSummary()
   */
  render: function (summary) {
    if (summary.error) {
      this.renderError(summary.error);
      return;
    }
    this.renderResults(summary);
    this.renderComparison(summary);
    this.renderCarbonCredits(summary);
    this.scrollToElement(document.getElementById("result"));
  },
};
