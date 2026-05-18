/**
 * RoutesDB — Base de rotas brasileiras para cálculo de distâncias
 *
 * Estrutura de cada rota:
 *   origin      {string}  Cidade de origem  (ex: "São Paulo, SP")
 *   destination {string}  Cidade de destino (ex: "Rio de Janeiro, RJ")
 *   distanceKm  {number}  Distância rodoviária real em quilômetros
 *
 * Métodos:
 *   getAllCities()              → string[]  Lista única e ordenada de cidades
 *   findDistance(orig, dest)   → number|null  Distância entre duas cidades
 */
var RoutesDB = {

  routes: [
    /* ── Capitais × Capitais ───────────────────────────── */
    { origin: "São Paulo, SP",      destination: "Rio de Janeiro, RJ",   distanceKm: 430  },
    { origin: "São Paulo, SP",      destination: "Brasília, DF",         distanceKm: 1015 },
    { origin: "São Paulo, SP",      destination: "Belo Horizonte, MG",   distanceKm: 586  },
    { origin: "São Paulo, SP",      destination: "Curitiba, PR",         distanceKm: 408  },
    { origin: "São Paulo, SP",      destination: "Porto Alegre, RS",     distanceKm: 1109 },
    { origin: "São Paulo, SP",      destination: "Florianópolis, SC",    distanceKm: 705  },
    { origin: "São Paulo, SP",      destination: "Salvador, BA",         distanceKm: 1960 },
    { origin: "São Paulo, SP",      destination: "Fortaleza, CE",        distanceKm: 2928 },
    { origin: "Rio de Janeiro, RJ", destination: "Belo Horizonte, MG",   distanceKm: 434  },
    { origin: "Rio de Janeiro, RJ", destination: "Brasília, DF",         distanceKm: 1148 },
    { origin: "Rio de Janeiro, RJ", destination: "Curitiba, PR",         distanceKm: 852  },
    { origin: "Rio de Janeiro, RJ", destination: "Salvador, BA",         distanceKm: 1650 },
    { origin: "Rio de Janeiro, RJ", destination: "Fortaleza, CE",        distanceKm: 2800 },
    { origin: "Brasília, DF",       destination: "Belo Horizonte, MG",   distanceKm: 716  },
    { origin: "Brasília, DF",       destination: "Goiânia, GO",          distanceKm: 209  },
    { origin: "Brasília, DF",       destination: "Salvador, BA",         distanceKm: 1445 },
    { origin: "Brasília, DF",       destination: "Cuiabá, MT",           distanceKm: 1131 },
    { origin: "Brasília, DF",       destination: "Campo Grande, MS",     distanceKm: 1134 },
    { origin: "Brasília, DF",       destination: "Palmas, TO",           distanceKm: 972  },
    { origin: "Brasília, DF",       destination: "Porto Alegre, RS",     distanceKm: 2065 },
    { origin: "Belo Horizonte, MG", destination: "Salvador, BA",         distanceKm: 1372 },
    { origin: "Curitiba, PR",       destination: "Porto Alegre, RS",     distanceKm: 710  },
    { origin: "Curitiba, PR",       destination: "Florianópolis, SC",    distanceKm: 300  },
    { origin: "Curitiba, PR",       destination: "Foz do Iguaçu, PR",   distanceKm: 637  },
    { origin: "Porto Alegre, RS",   destination: "Florianópolis, SC",    distanceKm: 476  },
    { origin: "Recife, PE",         destination: "Fortaleza, CE",        distanceKm: 800  },
    { origin: "Recife, PE",         destination: "Natal, RN",            distanceKm: 285  },
    { origin: "Recife, PE",         destination: "Salvador, BA",         distanceKm: 839  },
    { origin: "Recife, PE",         destination: "Maceió, AL",           distanceKm: 285  },
    { origin: "Fortaleza, CE",      destination: "Natal, RN",            distanceKm: 537  },
    { origin: "Belém, PA",          destination: "São Luís, MA",         distanceKm: 800  },
    { origin: "Goiânia, GO",        destination: "Campo Grande, MS",     distanceKm: 929  },

    /* ── Norte ─────────────────────────────────────────── */
    { origin: "Brasília, DF",       destination: "Belém, PA",            distanceKm: 2120 },
    { origin: "Belém, PA",          destination: "Macapá, AP",           distanceKm: 350  },
    { origin: "Belém, PA",          destination: "Marabá, PA",           distanceKm: 520  },
    { origin: "Manaus, AM",         destination: "Porto Velho, RO",      distanceKm: 740  },
    { origin: "Porto Velho, RO",    destination: "Rio Branco, AC",       distanceKm: 544  },
    { origin: "Porto Velho, RO",    destination: "Cuiabá, MT",           distanceKm: 1460 },

    /* ── Nordeste — capitais faltantes ──────────────────── */
    { origin: "Fortaleza, CE",      destination: "Teresina, PI",         distanceKm: 600  },
    { origin: "São Luís, MA",       destination: "Teresina, PI",         distanceKm: 446  },
    { origin: "Recife, PE",         destination: "João Pessoa, PB",      distanceKm: 120  },
    { origin: "Maceió, AL",         destination: "Aracaju, SE",          distanceKm: 278  },
    { origin: "Aracaju, SE",        destination: "Salvador, BA",         distanceKm: 356  },

    /* ── Sudeste — Espírito Santo ───────────────────────── */
    { origin: "Vitória, ES",        destination: "Belo Horizonte, MG",   distanceKm: 525  },
    { origin: "Vitória, ES",        destination: "Rio de Janeiro, RJ",   distanceKm: 520  },

    /* ── Rotas regionais relevantes ────────────────────── */
    { origin: "São Paulo, SP",      destination: "Campinas, SP",         distanceKm: 95   },
    { origin: "São Paulo, SP",      destination: "Santos, SP",           distanceKm: 73   },
    { origin: "São Paulo, SP",      destination: "São José dos Campos, SP", distanceKm: 99 },
    { origin: "São Paulo, SP",      destination: "Ribeirão Preto, SP",   distanceKm: 313  },
    { origin: "São Paulo, SP",      destination: "Londrina, PR",         distanceKm: 447  },
    { origin: "São Paulo, SP",      destination: "Uberlândia, MG",       distanceKm: 587  },
    { origin: "Rio de Janeiro, RJ", destination: "Niterói, RJ",          distanceKm: 13   },
    { origin: "Rio de Janeiro, RJ", destination: "Petrópolis, RJ",       distanceKm: 68   },
    { origin: "Belo Horizonte, MG", destination: "Ouro Preto, MG",       distanceKm: 100  },
    { origin: "Porto Alegre, RS",   destination: "Santa Maria, RS",      distanceKm: 290  },

    /* ── Campinas e Região Metropolitana ───────────────── */
    { origin: "Campinas, SP",       destination: "Hortolândia, SP",      distanceKm: 18   },
    { origin: "Campinas, SP",       destination: "Sumaré, SP",           distanceKm: 22   },
    { origin: "Campinas, SP",       destination: "Valinhos, SP",         distanceKm: 18   },
    { origin: "Campinas, SP",       destination: "Vinhedo, SP",          distanceKm: 28   },
    { origin: "Campinas, SP",       destination: "Paulínia, SP",         distanceKm: 25   },
    { origin: "Campinas, SP",       destination: "Nova Odessa, SP",      distanceKm: 32   },
    { origin: "Campinas, SP",       destination: "Americana, SP",        distanceKm: 50   },
    { origin: "Campinas, SP",       destination: "Santa Bárbara d'Oeste, SP", distanceKm: 48 },
    { origin: "Campinas, SP",       destination: "Indaiatuba, SP",       distanceKm: 32   },
    { origin: "Campinas, SP",       destination: "Itatiba, SP",          distanceKm: 42   },
    { origin: "Campinas, SP",       destination: "Jaguariúna, SP",       distanceKm: 35   },
    { origin: "Campinas, SP",       destination: "Jundiaí, SP",          distanceKm: 45   },
    { origin: "Campinas, SP",       destination: "Limeira, SP",          distanceKm: 58   },
    { origin: "Campinas, SP",       destination: "Piracicaba, SP",       distanceKm: 53   },
    { origin: "Campinas, SP",       destination: "Sorocaba, SP",         distanceKm: 98   },
    { origin: "Campinas, SP",       destination: "Rio Claro, SP",        distanceKm: 112  },
    { origin: "Campinas, SP",       destination: "São Carlos, SP",       distanceKm: 172  },
    { origin: "Campinas, SP",       destination: "Araraquara, SP",       distanceKm: 215  },
    { origin: "Campinas, SP",       destination: "Ribeirão Preto, SP",   distanceKm: 218  },
    { origin: "Campinas, SP",       destination: "São José dos Campos, SP", distanceKm: 155 },
    { origin: "Campinas, SP",       destination: "Santos, SP",           distanceKm: 172  },
    { origin: "Americana, SP",      destination: "São Paulo, SP",        distanceKm: 140  },
    { origin: "Jundiaí, SP",        destination: "São Paulo, SP",        distanceKm: 60   },
  ],

  /**
   * Retorna lista única de cidades (origem + destino), ordenada alfabeticamente.
   * @returns {string[]}
   */
  getAllCities: function () {
    var seen = {};
    var cities = [];

    this.routes.forEach(function (route) {
      [route.origin, route.destination].forEach(function (city) {
        var key = city.trim().toLowerCase();
        if (!seen[key]) {
          seen[key] = true;
          cities.push(city.trim());
        }
      });
    });

    return cities.sort(function (a, b) {
      return a.localeCompare(b, "pt-BR");
    });
  },

  /**
   * Busca a distância entre duas cidades (nas duas direções).
   * @param  {string}      origin       Cidade de origem
   * @param  {string}      destination  Cidade de destino
   * @returns {number|null}             Distância em km, ou null se não encontrada
   */
  findDistance: function (origin, destination) {
    var orig = origin.trim().toLowerCase();
    var dest = destination.trim().toLowerCase();

    for (var i = 0; i < this.routes.length; i++) {
      var route = this.routes[i];
      var rOrig = route.origin.trim().toLowerCase();
      var rDest = route.destination.trim().toLowerCase();

      if (
        (rOrig === orig && rDest === dest) ||
        (rOrig === dest && rDest === orig)
      ) {
        return route.distanceKm;
      }
    }

    return null;
  },
};
