/**
 * CONFIG — Configurações globais da Calculadora de Emissão de CO₂e
 *
 * INSTRUÇÕES:
 *   1. Copie este arquivo como js/config.js
 *   2. Substitua "SUA_CHAVE_AQUI" pela sua chave real do Google Cloud Console
 *   3. NUNCA commite js/config.js — ele está no .gitignore
 *
 * Para deploy via GitHub Actions: adicione a chave como secret GOOGLE_MAPS_API_KEY
 * no repositório (Settings → Secrets and variables → Actions).
 *
 * Depende de: RoutesDB (js/routes-data.js) — deve ser carregado antes deste arquivo.
 */
var CONFIG = {

  /**
   * Chave de API do Google Maps (Google Cloud Console).
   * Habilitar: Distance Matrix API + Places API.
   * Deixe "SUA_CHAVE_AQUI" para usar apenas o RoutesDB local.
   * Instruções: https://console.cloud.google.com/apis/credentials
   */
  GOOGLE_MAPS_API_KEY: "SUA_CHAVE_AQUI",

  /**
   * Fatores de emissão por modal de transporte (kg CO₂ por km percorrido).
   * Fonte: GHG Protocol — escopo 3, categoria commuting.
   */
  EMISSION_FACTORS: {
    bicycle: 0,
    car:     0.12,
    bus:     0.089,
    truck:   0.96,
  },

  /**
   * Metadados dos modais de transporte para uso na UI.
   */
  TRANSPORT_MODES: {
    bicycle: {
      label: "Bicicleta",
      icon:  "🚲",
      color: "#3CAA5C",
    },
    car: {
      label: "Carro",
      icon:  "🚗",
      color: "#E8472A",
    },
    bus: {
      label: "Ônibus",
      icon:  "🚌",
      color: "#F59E0B",
    },
    truck: {
      label: "Caminhão",
      icon:  "🚛",
      color: "#6B7280",
    },
  },

  /**
   * Parâmetros de crédito de carbono para conversão e estimativa de valor.
   */
  CARBON_CREDIT: {
    KG_PER_CREDIT:  1000, // 1 crédito = 1 tCO₂e = 1000 kg
    PRICE_MIN_BRL:  50,   // preço mínimo estimado por crédito (R$)
    PRICE_MAX_BRL:  150,  // preço máximo estimado por crédito (R$)
  },

  /**
   * Popula o <datalist id="cities-list"> com as cidades da base RoutesDB.
   * Deve ser chamado após o DOM estar carregado.
   */
  populateDatalist: function () {
    var cities   = RoutesDB.getAllCities();
    var datalist = document.getElementById("cities-list");

    if (!datalist) return;

    cities.forEach(function (city) {
      var option   = document.createElement("option");
      option.value = city;
      datalist.appendChild(option);
    });
  },

  /**
   * Configura o preenchimento automático do campo de distância.
   *
   * Prioridade:
   *   1. Google Maps Distance Matrix API  (se Maps.isReady)
   *   2. RoutesDB.findDistance()          (fallback local)
   *
   * Ouve o checkbox "inserir manualmente" para liberar o campo livre.
   */
  setupDistanceAutofill: function () {
    var originInput   = document.getElementById("origin");
    var destInput     = document.getElementById("destination");
    var distanceInput = document.getElementById("distance");
    var manualCheck   = document.getElementById("manual-distance");
    var distanceHint  = document.getElementById("distance-hint");

    if (!originInput || !destInput || !distanceInput || !manualCheck) return;

    /* ── Helpers de estado do campo distância ── */
    function setFound(km, source) {
      distanceInput.value    = km;
      distanceInput.readOnly = true;
      if (distanceHint) {
        distanceHint.textContent = "✓ " + km + " km — via " + source;
        distanceHint.style.color = "#2D6E4F";
      }
    }

    function setSearching() {
      distanceInput.value = "";
      if (distanceHint) {
        distanceHint.textContent = "🔍 Calculando distância...";
        distanceHint.style.color = "#F59E0B";
      }
    }

    function setNotFound() {
      distanceInput.value    = "";
      distanceInput.readOnly = true;
      if (distanceHint) {
        distanceHint.textContent = "Rota não encontrada — marque a opção abaixo para inserir manualmente.";
        distanceHint.style.color = "#9CA3AF";
      }
    }

    /* ── Fallback: busca na base local RoutesDB ── */
    function tryRoutesDB(origin, dest) {
      var km = RoutesDB.findDistance(origin, dest);
      if (km !== null) {
        setFound(km, "base local");
      } else {
        setNotFound();
      }
    }

    /* ── Lógica principal: Maps → RoutesDB ── */
    function tryAutofill() {
      var origin = originInput.value.trim();
      var dest   = destInput.value.trim();
      if (!origin || !dest) return;

      setSearching();

      if (typeof Maps !== "undefined" && Maps.isReady) {
        /* Tenta Google Maps Distance Matrix API */
        Maps.getDistance(origin, dest)
          .then(function (km) {
            setFound(km, "Google Maps");
          })
          .catch(function (err) {
            console.warn("Google Maps falhou, usando RoutesDB:", err.message);
            tryRoutesDB(origin, dest);
          });
      } else {
        /* Google Maps não disponível: usa RoutesDB diretamente */
        tryRoutesDB(origin, dest);
      }
    }

    originInput.addEventListener("change", tryAutofill);
    destInput.addEventListener("change", tryAutofill);

    manualCheck.addEventListener("change", function () {
      if (manualCheck.checked) {
        distanceInput.readOnly = false;
        distanceInput.value    = "";
        distanceInput.focus();
        if (distanceHint) {
          distanceHint.textContent = "Digite a distância em quilômetros.";
          distanceHint.style.color = "#9CA3AF";
        }
      } else {
        distanceInput.readOnly = true;
        tryAutofill();
      }
    });
  },
};
