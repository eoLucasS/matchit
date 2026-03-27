<!--
$$\      $$\            $$\               $$\       $$$$$$\ $$$$$$$$\
$$$\    $$$ |           $$ |              $$ |      \_$$  _|\__$$  __|
$$$$\  $$$$ | $$$$$$\ $$$$$$\    $$$$$$$\ $$$$$$$\    $$ |     $$ |
$$\$$\$$ $$ | \____$$\\_$$  _|  $$  _____|$$  __$$\   $$ |     $$ |
$$ \$$$  $$ | $$$$$$$ | $$ |    $$ /      $$ |  $$ |  $$ |     $$ |
$$ |\$  /$$ |$$  __$$ | $$ |$$\ $$ |      $$ |  $$ |  $$ |     $$ |
$$ | \_/ $$ |\$$$$$$$ | \$$$$  |\$$$$$$$\ $$ |  $$ |$$$$$$\    $$ |
\__|     \__| \_______|  \____/  \_______|\__|  \__|\______|   \__|
-->

<div align="center">

# 🎮 MatchIT

**Marketplace gamificado de hardware usado com matching por gestos**

<br>

<img src="public/preview.jpg" alt="MatchIT Preview" width="280">

<br>

*Swipe. Match. Upgrade.* ♻️

<br>

<p>
  <img alt="Github Top Language" src="https://img.shields.io/github/languages/top/eoLucasS/matchit?color=00C853">
  <img alt="Github Language Count" src="https://img.shields.io/github/languages/count/eoLucasS/matchit?color=00C853">
  <img alt="Repository Size" src="https://img.shields.io/github/repo-size/eoLucasS/matchit?color=00C853">
  <img alt="Github Stars" src="https://img.shields.io/github/stars/eoLucasS/matchit?color=00C853">
</p>

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br>

[![Deploy](https://img.shields.io/badge/🚀_DEMO_LIVE-usematchit.vercel.app-00C853?style=for-the-badge)](https://usematchit.vercel.app)

---

> 🌱 Um marketplace mobile-first que democratiza o acesso a hardware usado através de swipes,<br>
> chat em tempo real e matching localizado — incentivando a economia circular e reduzindo o e-waste.

</div>

<br>

## 🎯 Objetivo

Criar uma plataforma intuitiva onde qualquer pessoa possa:

- 🛒 **Vender** hardware ocioso em poucos cliques
- 🔍 **Encontrar** peças e equipamentos baratos com gestos simples
- 📍 **Conectar-se** diretamente com vendedores próximos
- ♻️ **Reutilizar** tecnologia e gerar impacto socioambiental positivo

<br>

## ✨ Diferenciais

<table>
  <tr>
    <td align="center" width="200">👆<br><b>Swipe Matching</b><br><sub>Aceite/recuse produtos<br>estilo Tinder</sub></td>
    <td align="center" width="200">💬<br><b>Chat Instantâneo</b><br><sub>Conversa aberta em 1 clique<br>após o match</sub></td>
    <td align="center" width="200">📍<br><b>Geolocalização</b><br><sub>Jitter de 800m para<br>privacidade + utilidade</sub></td>
  </tr>
  <tr>
    <td align="center" width="200">📱<br><b>Mobile-First</b><br><sub>Experiência 100%<br>otimizada para mobile</sub></td>
    <td align="center" width="200">🎨<br><b>Animações Fluidas</b><br><sub>Interface minimalista<br>com Framer Motion</sub></td>
    <td align="center" width="200">🌱<br><b>Economia Circular</b><br><sub>Reduza e-waste e<br>dê vida nova ao hardware</sub></td>
  </tr>
</table>

<br>

## 🖥️ Stack Tecnológica

```
┌─────────────────────────────────────────────────┐
│                 🌐  FRONTEND                    │
│  Next.js 15 (App Router) + React 19 + TS        │
│  Tailwind CSS + Framer Motion                   │
├─────────────────────────────────────────────────┤
│                 ⚡  BACKEND                     │
│  Next.js API Routes + Supabase Realtime         │
├─────────────────────────────────────────────────┤
│                 🗄️  DATABASE                    │
│  PostgreSQL (Supabase - South America)          │
├─────────────────────────────────────────────────┤
│                 🚀  DEPLOY                      │
│  Vercel (Edge Network)                          │
└─────────────────────────────────────────────────┘
```

<br>

## 🚀 Funcionalidades (MVP)

- [x] Cadastro e login
- [x] Criação/edição de anúncios com nome, foto e descrição
- [x] Matching por gestos (swipe left/right)
- [x] Cálculo de distância aproximada
- [x] Chat em tempo real após match
- [x] Perfil do usuário e edição

<br>

## 🔒 Privacidade & LGPD

| Recurso | Implementação |
|:---|:---|
| 🔐 Senhas | Hash bcrypt |
| 📍 Localização | Jitter de até 800 m |
| 🗑️ Exclusão de dados | Completa, sob demanda |
| 🇧🇷 Hospedagem | Supabase South America (Brasil) |

<br>

## ⚡ Quick Start

```bash
# Clone o repositório
git clone https://github.com/eoLucasS/matchit.git

# Instale as dependências
cd matchit
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Rode o projeto
npm run dev
```

<br>

## 💻 Equipe

<table>
  <tr>
    <td align="center">
      <a href="https://www.linkedin.com/in/joao-victor-barreto/">
        <img src="https://avatars.githubusercontent.com/u/111576358?v=4" width="100px;" alt="João Victor"/><br>
        <sub>
          <b>João Victor B. Barreto</b>
        </sub>
      </a>
      <br>
      <sub>Documentação · UX · Marketing</sub>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/lucaslopesdasilva/">
        <img src="https://avatars.githubusercontent.com/u/119815116?v=4" width="100px;" alt="Lucas Silva"/><br>
        <sub>
          <b>Lucas Lopes da Silva</b>
        </sub>
      </a>
      <br>
      <sub>Back-End · Front-End · DB · Deploy</sub>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/nycolasagrgarcia/">
        <img src="https://avatars.githubusercontent.com/u/127459801?v=4" width="100px;" alt="Nycolas Garcia"/><br>
        <sub>
          <b>Nycolas A. R. Garcia</b>
        </sub>
      </a>
      <br>
      <sub>DevOps · Docs · Arquitetura</sub>
    </td>
  </tr>
</table>

<br>

**Disciplinas:**
- Usabilidade, Desenvolvimento Web, Mobile e Jogos
- Sistemas Distribuídos e Mobile

**Orientadores:**
- Prof. Renato Alessandro Rocha Santos — USJT 2025
- Prof. Luiz Felipe Zanin Garcia — USJT 2025

<br>

## 🔗 Links

<p align="left">
  <a href="https://www.linkedin.com/in/lucaslopesdasilva/" alt="Linkedin">
    <img src="https://img.shields.io/badge/-Linkedin-000?style=for-the-badge&logo=Linkedin&logoColor=0A66C2">
  </a>
  <a href="https://portfolio-lucaslopes.vercel.app" alt="Portfolio">
    <img src="https://img.shields.io/badge/Portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=FFF">
  </a>
  <a href="https://usematchit.vercel.app" alt="MatchIT">
    <img src="https://img.shields.io/badge/MatchIT-000?style=for-the-badge&logo=vercel&logoColor=FFF">
  </a>
</p>

<br>

---

<div align="center">

⭐ **Se curtiu, deixa uma star!**

Estamos abertos a contribuições e parcerias para transformar isso em uma startup real.

<br>

<h3>Desenvolvido com 💚 por <a href="https://github.com/SEU-USUARIO">MatchIT Team</a> ☕</h3>

</div>
