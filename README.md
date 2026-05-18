# Calculadora de Emissão de CO₂e

Ferramenta web para coleta e cálculo de emissões de gases de efeito estufa (GEE) geradas pelo deslocamento casa-escritório dos funcionários.

**Escopos cobertos:** Escopo 3 — Categoria 7 (Employee Commuting), com referência ao GHG Protocol.

---

## Funcionalidades

- Cálculo de emissão por modal: bicicleta, carro, ônibus, caminhão
- Distância automática via **Google Maps Distance Matrix API** com fallback para base local (80+ rotas brasileiras)
- Autocomplete de endereços via **Google Places API**
- Comparativo entre todos os modais para a mesma rota
- Projeção anual (220 dias úteis × ida e volta)
- Estimativa de créditos de carbono (mercado voluntário brasileiro, R$ 50–150/tCO₂e)
- Design responsivo — mobile friendly

---

## Estrutura do projeto

```
carbon-calc/
├── index.html
├── style.css
├── js/
│   ├── routes-data.js      # Base local com 80+ rotas brasileiras
│   ├── maps.js             # Integração Google Maps (Distance Matrix + Places)
│   ├── config.example.js   # Template de configuração — commitar este
│   ├── config.js           # Configuração real com chave API — NÃO commitar (gitignored)
│   ├── calculator.js       # Lógica de cálculo de emissões e créditos
│   ├── ui.js               # Renderização dos resultados (BEM)
│   └── app.js              # Inicialização e controle de eventos
└── .github/
    └── workflows/
        └── deploy.yml      # Deploy automático para GitHub Pages
```

---

## Configuração local

1. Clone o repositório
2. Copie o template de configuração:
   ```bash
   cp js/config.example.js js/config.js
   ```
3. Abra `js/config.js` e substitua `"SUA_CHAVE_AQUI"` pela sua chave do Google Maps
4. Abra `index.html` diretamente no navegador (ou use Live Server no VS Code)

> Sem a chave de API, a calculadora funciona normalmente usando a base de rotas local.

---

## Deploy no GitHub Pages (automático)

O workflow `.github/workflows/deploy.yml` faz o deploy automaticamente em cada push para `main`.

**Configuração única (fazer uma vez):**

1. No GitHub, vá em **Settings → Pages**
   - Source: `GitHub Actions`

2. Vá em **Settings → Secrets and variables → Actions → New repository secret**
   - Nome: `GOOGLE_MAPS_API_KEY`
   - Valor: sua chave real do Google Cloud Console

3. Habilite no Google Cloud Console:
   - **Distance Matrix API**
   - **Places API**
   - Restrinja a chave ao domínio `https://<seu-usuario>.github.io`

A URL pública ficará disponível em: `https://<seu-usuario>.github.io/<nome-do-repo>/`

---

## Fatores de emissão

| Modal       | kg CO₂e / km | Fonte                    |
|-------------|:------------:|--------------------------|
| Bicicleta   | 0            | —                        |
| Ônibus      | 0,089        | GHG Protocol — Escopo 3  |
| Carro       | 0,12         | GHG Protocol — Escopo 3  |
| Caminhão    | 0,96         | GHG Protocol — Escopo 3  |

---

## Segurança da chave de API

- `js/config.js` está no `.gitignore` e nunca é commitado
- O deploy via GitHub Actions injeta a chave a partir de um **GitHub Secret** (nunca exposta no código)
- Restrinja a chave no Google Cloud Console ao domínio do GitHub Pages para evitar uso indevido

---

*Inventário de Emissões GEE | Escopo 3 — Employee Commuting*
