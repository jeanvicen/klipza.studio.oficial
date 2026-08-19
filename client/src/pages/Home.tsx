import {
  ArrowDown,
  ArrowUpRight,
  Command,
  Github,
  Globe2,
  Menu,
  MoveUpRight,
  Orbit,
  Play,
  Search,
  Sparkles,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import React, { FormEvent, MouseEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import "../styles/webklip-result.css";

const MARK_URL = "/manus-storage/klipza-mark-original_4fed6c03.png";
const PRODUCT_SCREEN_URL = "/manus-storage/klipza-ia-login-reference_0fdb0658.webp";
const KLIPZA_REPOSITORY = "https://github.com/jeanvicen/klipza.zzz";

const navItems = [
  { label: "Sinal", target: "signal" },
  { label: "Klipza.ia", target: "klipza-ia" },
  { label: "Web.Klip", target: "web-klip" },
  { label: "Parcerias", target: "partners" },
];

const signals = [
  {
    index: "01",
    title: "Direção",
    copy: "A pergunta certa antes de cada pixel. O que precisa mudar? Onde isso encontra alguém?",
  },
  {
    index: "02",
    title: "Sistema",
    copy: "Design, linguagem e tecnologia trabalhando como uma só estrutura — não como departamentos isolados.",
  },
  {
    index: "03",
    title: "Movimento",
    copy: "Interfaces que respondem, respiram e deixam claro o próximo gesto sem gritar por atenção.",
  },
  {
    index: "04",
    title: "Lançamento",
    copy: "Produtos feitos para sair do conceito e continuar aprendendo no mundo real.",
  },
];

const partnerTypes = [
  ["Tecnologia", "Produtos, plataformas e protótipos que precisam deixar de parecer iguais."],
  ["Cultura", "Experiências digitais para marcas, música, comunidades e novas linguagens."],
  ["Pesquisa", "Ferramentas para transformar conhecimento em interfaces que as pessoas realmente usam."],
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function BrandMark({ className = "" }: { className?: string }) {
  return <img className={`brand-mark ${className}`} src={MARK_URL} alt="Símbolo original da Klipza.ia" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSignal, setActiveSignal] = useState(0);
  const [browserQuery, setBrowserQuery] = useState("");
  const [browserHint, setBrowserHint] = useState("Pergunte o que está se movendo agora.");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const webKlipMutation = trpc.webKlip.search.useMutation({
    onSuccess: (data) => setBrowserHint(`Leitura pronta: ${data.intelligence.signal}`),
    onError: (error) => setBrowserHint(error.message),
  });
  const partnershipMutation = trpc.partnerships.submit.useMutation({
    onSuccess: () => toast.success("Sinal recebido. O Studio foi notificado."),
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    const updatePointer = (event: globalThis.MouseEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
      document.documentElement.style.setProperty("--pointer-rx", `${(event.clientX / window.innerWidth - .5) * 2}`);
      document.documentElement.style.setProperty("--pointer-ry", `${(event.clientY / window.innerHeight - .5) * 2}`);
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  useEffect(() => {
    const updateScrollSignal = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(available > 0 ? Math.min(window.scrollY / available, 1) : 0);
    };
    updateScrollSignal();
    window.addEventListener("scroll", updateScrollSignal, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollSignal);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  const startKlip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = browserQuery.trim();
    if (!normalized) {
      setBrowserHint("Dê uma pista ao Web.Klip. Uma pergunta já basta.");
      return;
    }
    setBrowserHint("O Web.Klip está organizando uma primeira leitura.");
    webKlipMutation.mutate({ query: normalized });
  };

  const followSignal = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    setActiveSignal(index);
  };

  const submitPartnership = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    partnershipMutation.mutate(
      {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        organization: String(data.get("organization") ?? "") || undefined,
        interest: String(data.get("interest") ?? "outro") as "tecnologia" | "cultura" | "pesquisa" | "outro",
        message: String(data.get("message") ?? ""),
      },
      { onSuccess: () => form.reset() },
    );
  };

  return (
    <main className="studio-shell" data-reduced-motion={reducedMotion || undefined}>
      <div className="cursor-aura" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
      <div className="scroll-telemetry" aria-hidden="true"><span style={{ transform: `scaleY(${scrollProgress})` }} /></div>

      <header className="studio-nav">
        <button className="brand-lockup" onClick={() => scrollToId("top")} aria-label="Ir para o início">
          <BrandMark />
          <span>Klipza<span>.ia</span></span>
        </button>

        <nav className="nav-desktop" aria-label="Navegação principal">
          {navItems.map((item) => (
            <button key={item.target} onClick={() => scrollToId(item.target)}>{item.label}</button>
          ))}
        </nav>

        <button className="nav-orbit" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="nav-panel">
          <span className="nav-orbit-label">{menuOpen ? "Fechar" : "Explorar"}</span>
          {menuOpen ? <X size={16} /> : <Orbit size={17} />}
        </button>

        <div id="nav-panel" className={`nav-panel ${menuOpen ? "is-open" : ""}`}>
          <p>Rotas do sinal</p>
          {navItems.map((item, index) => (
            <button key={item.target} onClick={() => { scrollToId(item.target); setMenuOpen(false); }}>
              <span>0{index + 1}</span>{item.label}<ArrowUpRight size={17} />
            </button>
          ))}
        </div>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="orbit-field" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}
        </div>
        <div className="hero-depth-stage" aria-hidden="true">
          <div className="depth-plane depth-plane-a" />
          <div className="depth-plane depth-plane-b" />
          <div className="depth-prism"><span /><span /><span /></div>
          <div className="depth-flare" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow enter-1"><span className="status-dot" /> Estúdio de sistemas em movimento</p>
          <h1 id="hero-title" aria-label="A ideia ganha corpo quando ganha pulso.">
            <span className="line enter-2">A IDEIA</span>
            <span className="line line-offset enter-3">GANHA <em>CORPO</em></span>
            <span className="line enter-4">QUANDO GANHA <span className="outline-word">PULSO.</span></span>
          </h1>
          <div className="hero-footer enter-5">
            <p>Construímos experiências digitais que começam como curiosidade e terminam como presença.</p>
            <button className="circle-action" onClick={() => scrollToId("signal")} aria-label="Conhecer o sinal da Klipza Studio">
              <ArrowDown size={21} />
              <span>descer</span>
            </button>
          </div>
        </div>
        <div className="hero-mark-wrap" aria-hidden="true">
          <div className="mark-shadow" />
          <div className="mark-rings"><span /><span /><span /></div>
          <BrandMark className="hero-mark" />
          <p>FREQUÊNCIA<br />KLIPZA 001</p>
        </div>
        <button className="hidden-signal" onClick={() => { setActiveSignal(3); scrollToId("signal"); toast("Sinal 001 reconhecido: toda ideia precisa de um próximo movimento."); }}>
          <span>001</span><small>encontrou o sinal</small>
        </button>
      </section>

      <section className="signal-section" id="signal" aria-labelledby="signal-title">
        <div className="section-head section-head-dark">
          <p className="eyebrow"><span>01</span> O sinal</p>
          <p className="section-note">Não entregamos telas para ocupar espaço. Desenhamos sistemas para abrir espaço.</p>
        </div>
        <div className="signal-stage">
          <div className="signal-copy">
            <h2 id="signal-title">Menos ruído.<br /><em>Mais direção.</em></h2>
            <p>Entre uma intenção e uma interface existe uma escolha: repetir o que já existe ou construir o que ainda não tinha forma. É no intervalo que o Studio trabalha.</p>
          </div>
          <div className="signal-list" role="tablist" aria-label="Pilares do Klipza Studio">
            {signals.map((signal, index) => (
              <button key={signal.index} className={`signal-item ${activeSignal === index ? "is-active" : ""}`} onClick={(event) => followSignal(event, index)} role="tab" aria-selected={activeSignal === index}>
                <span>{signal.index}</span>
                <strong>{signal.title}</strong>
                <i>{signal.copy}</i>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="product-section" id="klipza-ia" aria-labelledby="product-title">
        <div className="product-ink" aria-hidden="true"><BrandMark /></div>
        <div className="section-head section-head-light">
          <p className="eyebrow"><span>02</span> Produto em órbita</p>
          <a href={KLIPZA_REPOSITORY} target="_blank" rel="noreferrer" className="inline-link">Ver repositório <ArrowUpRight size={15} /></a>
        </div>
        <div className="product-layout">
          <div className="product-content">
            <p className="product-micro">KLIPZA.IA / CONVERSA, CRIAÇÃO, PESQUISA</p>
            <h2 id="product-title">Uma interface que não interrompe o pensamento. <em>Ela acompanha.</em></h2>
            <p className="product-description">A Klipza.ia reúne conversa, criação e arquivos em um espaço instalável. O Web.Klip estende a experiência: o que acontece no mundo encontra um caminho para dentro do trabalho.</p>
            <div className="product-actions">
              <a className="primary-link" href={KLIPZA_REPOSITORY} target="_blank" rel="noreferrer"><Github size={18} /> Baixar no GitHub <ArrowUpRight size={18} /></a>
              <button onClick={() => scrollToId("web-klip")} className="quiet-link"><Globe2 size={17} /> Entrar no Web.Klip</button>
            </div>
            <div className="product-facts">
              <div><strong>PWA</strong><span>instalável</span></div>
              <div><strong>Android</strong><span>via Capacitor</span></div>
              <div><strong>Web.Klip</strong><span>pesquisa diária</span></div>
            </div>
          </div>

          <div className="product-device-wrap">
            <div className="product-orbit product-orbit-one" />
            <div className="product-orbit product-orbit-two" />
          <div className="product-device">
              <div className="device-reflection" aria-hidden="true" />
              <div className="device-top"><span /><span /><span /><p>klipza.ia</p><Command size={13} /></div>
              <div className="device-shot"><img src={PRODUCT_SCREEN_URL} alt="Tela pública de acesso do aplicativo Klipza.ia" /></div>
              <div className="device-caption"><span><Sparkles size={13} /> interface viva</span><span>01 / 01</span></div>
            </div>
            <div className="product-stamp"><span>FEITO PARA</span><strong>PERGUNTAR<br />MELHOR</strong><BrandMark /></div>
          </div>
        </div>
      </section>

      <section className="webklip-section" id="web-klip" aria-labelledby="webklip-title">
        <div className="webklip-noise" aria-hidden="true" />
        <div className="webklip-constellation" aria-hidden="true"><span /><span /><span /><i /><i /><i /></div>
        <div className="section-head section-head-dark">
          <p className="eyebrow"><span>03</span> Pesquisa com pulso</p>
          <p className="web-status"><i /> PRONTO PARA LER O MUNDO</p>
        </div>
        <div className="webklip-title-wrap">
          <h2 id="webklip-title">Web<span>.</span>Klip</h2>
          <p>Não é outra aba. É uma camada de atenção entre a pergunta e o que vale a pena encontrar.</p>
        </div>
        <form className="klip-browser" onSubmit={startKlip}>
          <div className="browser-chrome"><span /><span /><span /><p>web.klip / explorar</p><WandSparkles size={15} /></div>
          <div className="browser-input-wrap">
            <Search size={22} />
            <input id="klip-search" value={browserQuery} onChange={(event) => setBrowserQuery(event.target.value)} placeholder="O que você quer entender agora?" aria-label="Pesquisar no Web.Klip" />
            <button type="submit" disabled={webKlipMutation.isPending}><span>{webKlipMutation.isPending ? "Lendo" : "Pesquisar"}</span><ArrowUpRight size={18} /></button>
          </div>
          <div className="browser-bottom">
            <p><Zap size={14} /> {browserHint}</p>
            <div><button type="button" onClick={() => setBrowserQuery("O que muda no design de interfaces com IA?")}>IA & design</button><button type="button" onClick={() => setBrowserQuery("Projetos open source para explorar esta semana")}>open source</button></div>
          </div>
        </form>
        {webKlipMutation.data ? (
          <section className="webklip-result" aria-live="polite">
            <div className="result-reading">
              <p><Sparkles size={13} /> LEITURA KLIPZA / {webKlipMutation.data.query}</p>
              <h3>{webKlipMutation.data.intelligence.title}</h3>
              <p>{webKlipMutation.data.intelligence.insight}</p>
            </div>
            <div className="result-angles">
              <p>PRÓXIMOS MOVIMENTOS</p>
              {webKlipMutation.data.intelligence.angles.map((angle, index) => <span key={angle}><i>0{index + 1}</i>{angle}</span>)}
            </div>
            <div className="result-routes">
              <p>ABRIR PESQUISA</p>
              <div>{webKlipMutation.data.routes.map((route) => <a key={route.source} href={route.url} target="_blank" rel="noreferrer"><span>{route.source}</span><strong>{route.title}</strong><small>{route.description}</small><ArrowUpRight size={15} /></a>)}</div>
            </div>
          </section>
        ) : <div className="webklip-preview-grid">
          <article className="intelligence-card feature-card"><p><Sparkles size={13} /> LEITURA KLIPZA</p><h3>Contexto antes do clique.</h3><span>O Web.Klip organiza uma síntese, caminhos e fontes antes de você abrir vinte abas.</span><div className="card-wave" /></article>
          <article className="intelligence-card"><p>MAPA DE PESQUISA</p><h3>Uma pergunta.<br />Três próximos movimentos.</h3><ul><li><i /> Entender o panorama</li><li><i /> Ir à fonte</li><li><i /> Transformar em ação</li></ul></article>
          <article className="intelligence-card source-card"><p>FONTES EM CAMADAS</p><div className="source-stack"><span>G</span><span>&lt;/&gt;</span><span>W</span><span>▶</span></div><h3>Pesquise sem perder a conversa.</h3></article>
        </div>}
        <button className="webklip-portal" onClick={() => document.getElementById("klip-search")?.focus()}>Abrir o portal <MoveUpRight size={19} /></button>
      </section>

      <section className="manifesto-section" aria-labelledby="manifesto-title">
        <div className="manifesto-rail" aria-hidden="true">KLIPZA / KLIPZA / KLIPZA / KLIPZA /</div>
        <div className="manifesto-content">
          <p className="eyebrow"><span>04</span> O que atravessa tudo</p>
          <h2 id="manifesto-title">Tecnologia sem imaginação é só infraestrutura.<br /><em>Imaginação sem sistema é só ruído.</em></h2>
          <div className="manifesto-bottom"><p>O Studio existe para encurtar essa distância. Da primeira frase ao primeiro uso, construímos com atenção ao que cada pessoa sente, entende e consegue fazer depois.</p><button onClick={() => scrollToId("partners")}><span>Fazer algo junto</span><ArrowUpRight size={20} /></button></div>
        </div>
      </section>

      <section className="partners-section" id="partners" aria-labelledby="partners-title">
        <div className="section-head section-head-dark"><p className="eyebrow"><span>05</span> Parcerias que dão forma</p><p className="section-note">Procuramos provocações, não apenas briefing.</p></div>
        <div className="partners-intro"><h2 id="partners-title">Quando a ideia pede<br /><em>mais mundo.</em></h2><p>Se existe uma pergunta difícil, uma tecnologia com potencial ou uma comunidade que merece uma ferramenta mais humana, queremos ouvir.</p></div>
        <div className="partner-grid">
          {partnerTypes.map(([title, copy], index) => <article key={title} className="partner-card"><div className="partner-object" aria-hidden="true" /><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p><button onClick={() => scrollToId("contact")} aria-label={`Falar sobre parceria em ${title}`}><ArrowUpRight size={20} /></button></article>)}
        </div>
        <div id="contact" className="contact-panel">
          <div className="contact-side"><p className="eyebrow">CANAL ABERTO</p><h3>Uma conexão pode começar por poucas linhas.</h3><p>Conte o que está querendo mover. O Studio recebe o sinal daqui.</p><div className="contact-signal"><BrandMark /><span>CANAL SEGURO<br />DIRETO PARA O STUDIO</span></div></div>
          <form className="contact-form" onSubmit={submitPartnership}>
            <label>Seu nome<input name="name" placeholder="Como a gente te chama?" required /></label>
            <label>E-mail<input name="email" type="email" placeholder="voce@projeto.com" required /></label>
            <label>Organização <input name="organization" placeholder="Projeto, marca ou coletivo" /></label>
            <label>Território da parceria<select name="interest" defaultValue="tecnologia"><option value="tecnologia">Tecnologia</option><option value="cultura">Cultura</option><option value="pesquisa">Pesquisa</option><option value="outro">Outro território</option></select></label>
            <label>O que quer construir?<textarea name="message" placeholder="Uma frase já abre caminho." required /></label>
            <button type="submit" className="contact-submit" disabled={partnershipMutation.isPending}>{partnershipMutation.isPending ? "Enviando sinal" : "Enviar sinal"} <ArrowUpRight size={18} /></button>
            <p>O contato é registrado e dispara uma notificação direta para o proprietário do Studio.</p>
          </form>
        </div>
      </section>

      <footer className="studio-footer">
        <div className="footer-top"><p>KLIPZA STUDIO</p><p>BRASIL / INTERNET / AGORA</p><button onClick={() => scrollToId("top")}>Voltar ao topo <ArrowUpRight size={15} /></button></div>
        <div className="footer-word">KLIPZA<span>.</span></div>
        <div className="footer-bottom"><div className="footer-brand"><BrandMark /><span>Klipza<span>.ia</span></span></div><p>© 2026 Klipza Studio. Sistemas com pulso.</p><div className="footer-links"><a href="https://klipza-zzz.vercel.app/" target="_blank" rel="noreferrer">Klipza.ia <ArrowUpRight size={14} /></a><a href="https://github.com/jeanvicen" target="_blank" rel="noreferrer">GitHub / Studio <ArrowUpRight size={14} /></a><a href={KLIPZA_REPOSITORY} target="_blank" rel="noreferrer">GitHub App <ArrowUpRight size={14} /></a><a href="https://github.com/jeanvicen/klipza.studio.oficial" target="_blank" rel="noreferrer">GitHub Studio <ArrowUpRight size={14} /></a></div></div>
      </footer>
    </main>
  );
}
