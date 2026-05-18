/**
 * Maps — Integração com Google Maps API
 *
 * Funcionalidades:
 *   - Distance Matrix API  → calcula distância real entre dois endereços
 *   - Places Autocomplete  → sugestão de endereços enquanto o usuário digita
 *
 * Fallback automático para RoutesDB se:
 *   - Chave de API não configurada
 *   - Script falhou ao carregar
 *   - Rota não encontrada na API
 *
 * Uso:
 *   Maps.init(apiKey).then(function(loaded) { ... })
 */
var Maps = {

  /** Indica se a Google Maps API foi carregada com sucesso */
  isReady: false,

  /** Referências aos objetos Autocomplete por inputId */
  _autocompletes: {},

  /* ─────────────────────────────────────────────────────
   * INICIALIZAÇÃO
   * ───────────────────────────────────────────────────── */

  /**
   * Carrega o script da Google Maps API dinamicamente.
   * @param  {string} apiKey  Chave de API do Google Cloud Console
   * @returns {Promise<boolean>}  true se carregou, false se falhou ou sem chave
   */
  init: function (apiKey) {
    var self = this;

    if (!apiKey || apiKey === "SUA_CHAVE_AQUI") {
      console.info("ℹ️ Google Maps: chave não configurada. Usando RoutesDB.");
      return Promise.resolve(false);
    }

    return this._loadScript(apiKey)
      .then(function () {
        self.isReady = true;
        console.log("✅ Google Maps API carregada com sucesso.");
        return true;
      })
      .catch(function (err) {
        console.warn("⚠️ Falha ao carregar Google Maps API:", err.message, "— usando RoutesDB.");
        return false;
      });
  },

  /**
   * Injeta o script do Google Maps no <head> e aguarda o carregamento.
   * @private
   */
  _loadScript: function (apiKey) {
    return new Promise(function (resolve, reject) {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      var script    = document.createElement("script");
      script.src    = "https://maps.googleapis.com/maps/api/js"
                    + "?key=" + apiKey
                    + "&libraries=places"
                    + "&language=pt-BR"
                    + "&region=BR";
      script.async  = true;
      script.defer  = true;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error("Falha ao carregar script do Google Maps."));
      };

      document.head.appendChild(script);
    });
  },

  /* ─────────────────────────────────────────────────────
   * DISTANCE MATRIX API
   * ───────────────────────────────────────────────────── */

  /**
   * Calcula a distância rodoviária entre dois endereços via Distance Matrix API.
   * @param  {string} origin       Endereço ou cidade de origem
   * @param  {string} destination  Endereço ou cidade de destino
   * @returns {Promise<number>}    Distância em km (arredondada para 1 decimal)
   */
  getDistance: function (origin, destination) {
    return new Promise(function (resolve, reject) {
      if (!window.google || !window.google.maps) {
        reject(new Error("Google Maps não disponível."));
        return;
      }

      var service = new google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins:       [origin],
          destinations:  [destination],
          travelMode:    google.maps.TravelMode.DRIVING,
          unitSystem:    google.maps.UnitSystem.METRIC,
          region:        "BR",
        },
        function (response, status) {
          if (status !== "OK") {
            reject(new Error("Distance Matrix status: " + status));
            return;
          }

          var element = response.rows[0].elements[0];

          if (element.status !== "OK") {
            reject(new Error("Rota não encontrada: " + element.status));
            return;
          }

          /* Converte metros → km com 1 casa decimal */
          var km = Math.round((element.distance.value / 1000) * 10) / 10;
          resolve(km);
        }
      );
    });
  },

  /* ─────────────────────────────────────────────────────
   * PLACES AUTOCOMPLETE
   * ───────────────────────────────────────────────────── */

  /**
   * Ativa o Google Places Autocomplete em um campo de texto.
   * Remove o atributo list (datalist) para evitar conflito visual.
   * Dispara um evento "change" ao selecionar um lugar para acionar o autofill.
   *
   * @param  {string}   inputId   ID do elemento <input>
   * @param  {Function} onChange  Callback opcional chamado ao selecionar um lugar
   */
  setupAutocomplete: function (inputId, onChange) {
    if (!this.isReady || !window.google || !window.google.maps.places) return;

    var input = document.getElementById(inputId);
    if (!input) return;

    /* Remove datalist para não conflitar com o dropdown do Places */
    input.removeAttribute("list");

    var autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "br" },
      fields: ["formatted_address", "name", "geometry"],
      types:  ["geocode", "establishment"],
    });

    /* Ao selecionar um lugar, dispara "change" para o autofill de distância */
    autocomplete.addListener("place_changed", function () {
      input.dispatchEvent(new Event("change"));
      if (typeof onChange === "function") onChange(autocomplete.getPlace());
    });

    this._autocompletes[inputId] = autocomplete;
    return autocomplete;
  },
};
