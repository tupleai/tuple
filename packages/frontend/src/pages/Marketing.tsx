import { A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { createSignal, For, Show, type Component } from 'solid-js';
import { providerIcon } from '../components/ProviderIcon.jsx';
import '../styles/marketing.css';

type MarketSide = 'seller' | 'buyer';

const providers = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'gemini', name: 'Gemini' },
  { id: 'bedrock', name: 'Bedrock' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'openrouter', name: 'OpenRouter' },
];

const marketJourneys: Record<
  MarketSide,
  {
    eyebrow: string;
    title: string;
    body: string;
    steps: Array<{ number: string; title: string; body: string }>;
    cta: string;
    href: string;
  }
> = {
  seller: {
    eyebrow: 'For sellers',
    title: 'Turn idle access into useful capacity.',
    body: 'Connect an eligible account, choose what you want to share, and keep control of your limits while Tuple meters completed inference.',
    steps: [
      {
        number: '01',
        title: 'Connect',
        body: 'Authorize a supported provider through OAuth or an API key.',
      },
      {
        number: '02',
        title: 'Choose',
        body: 'Select the models and unused capacity you want to make available.',
      },
      {
        number: '03',
        title: 'Earn',
        body: 'Tuple routes eligible demand and records completed usage.',
      },
    ],
    cta: 'Start selling access',
    href: '/register?role=seller',
  },
  buyer: {
    eyebrow: 'For buyers',
    title: 'Buy the model, not somebody’s claim.',
    body: 'Send one OpenAI-compatible request. Tuple matches it with provider-authorized capacity and keeps seller credentials behind the gateway.',
    steps: [
      {
        number: '01',
        title: 'Request',
        body: 'Ask for an exact model or use auto routing from one Tuple endpoint.',
      },
      {
        number: '02',
        title: 'Verify',
        body: 'Tuple matches the request to authenticated provider access.',
      },
      {
        number: '03',
        title: 'Build',
        body: 'Receive the requested model output without handling seller credentials.',
      },
    ],
    cta: 'Buy verified access',
    href: '/register?role=buyer',
  },
};

const codeSample = `curl https://app.tuple.ai/v1/chat/completions \\
  -H "Authorization: Bearer tuple_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      {"role": "user", "content": "Build something useful."}
    ]
  }'`;

const Marketing: Component = () => {
  const [side, setSide] = createSignal<MarketSide>('seller');
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const journey = () => marketJourneys[side()];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeSample);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Title>Tuple — Put unused AI access to work</Title>
      <Meta
        name="description"
        content="Sell unused LLM tokens and buy verified model access through OAuth and API-key-backed routes."
      />

      <div class="marketing-page">
        <a class="marketing-skip-link" href="#marketing-main">
          Skip to content
        </a>

        <header class="marketing-nav">
          <div class="marketing-shell marketing-nav__inner">
            <a href="/" class="marketing-brand" aria-label="Tuple home">
              <img
                src="/brand/tuple-wordmark-white.png"
                alt="Tuple"
                class="marketing-brand__image"
              />
            </a>

            <nav class="marketing-nav__links" aria-label="Main navigation">
              <a href="#how-it-works">How it works</a>
              <a href="#market">For sellers & buyers</a>
              <a href="#provenance">Model authenticity</a>
              <a href="https://tuple.ai/docs">Docs</a>
            </nav>

            <div class="marketing-nav__actions">
              <A href="/login" class="marketing-link-button">
                Sign in
              </A>
              <A href="/register?role=seller" class="marketing-button marketing-button--small">
                Put tokens to work
              </A>
            </div>

            <button
              type="button"
              class="marketing-menu-button"
              aria-label={menuOpen() ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen()}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen() ? 'Close' : 'Menu'}
            </button>
          </div>

          <Show when={menuOpen()}>
            <nav class="marketing-mobile-nav" aria-label="Mobile navigation">
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                How it works
              </a>
              <a href="#market" onClick={() => setMenuOpen(false)}>
                For sellers & buyers
              </a>
              <a href="#provenance" onClick={() => setMenuOpen(false)}>
                Model authenticity
              </a>
              <a href="https://tuple.ai/docs">Docs</a>
              <A href="/login">Sign in</A>
              <A href="/register?role=seller" class="marketing-button marketing-button--small">
                Put tokens to work
              </A>
            </nav>
          </Show>
        </header>

        <main id="marketing-main">
          <section class="marketing-hero">
            <div class="marketing-hero__glow marketing-hero__glow--violet" />
            <div class="marketing-hero__glow marketing-hero__glow--blue" />
            <div class="marketing-shell marketing-hero__inner">
              <div class="marketing-hero__copy">
                <div class="marketing-eyebrow">
                  <span class="marketing-eyebrow__dot" />
                  The peer-to-peer LLM gateway
                </div>
                <h1>
                  Put your unused AI access
                  <span> to work.</span>
                </h1>
                <p class="marketing-hero__lede">
                  Sell capacity you already pay for. Buy access to the exact model you requested,
                  backed by OAuth and API-key authorization.
                </p>

                <div class="marketing-hero__actions">
                  <A href="/register?role=seller" class="marketing-button">
                    Sell unused tokens
                  </A>
                  <A href="/register?role=buyer" class="marketing-button marketing-button--ghost">
                    Buy verified access
                  </A>
                </div>

                <div class="marketing-hero__proof" aria-label="Tuple benefits">
                  <span>
                    <i class="bxd bx-check-circle" aria-hidden="true" />
                    No credential handoff
                  </span>
                  <span>
                    <i class="bxd bx-check-circle" aria-hidden="true" />
                    No model swapping
                  </span>
                  <span>
                    <i class="bxd bx-check-circle" aria-hidden="true" />
                    OpenAI-compatible
                  </span>
                </div>
              </div>

              <div class="marketing-hero__visual">
                <div class="marketing-hero__image-frame">
                  <img
                    src="/images/tuple-p2p-network.webp"
                    alt="A symmetric Tuple network connecting token sellers to verified model buyers"
                  />
                  <div class="marketing-hero__status marketing-hero__status--seller">
                    <span class="marketing-status-icon marketing-status-icon--violet">
                      <img src="/brand/tuple-mark-white.png" alt="" />
                    </span>
                    <span>
                      <small>Seller capacity</small>
                      Ready to route
                    </span>
                  </div>
                  <div class="marketing-hero__status marketing-hero__status--verified">
                    <span class="marketing-status-icon marketing-status-icon--blue">
                      <img src="/brand/tuple-mark-white.png" alt="" />
                    </span>
                    <span>
                      <small>Model provenance</small>
                      Provider verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="marketing-provider-strip" aria-label="Supported model providers">
            <div class="marketing-shell">
              <p>Connect the providers you already use</p>
              <div class="marketing-provider-list">
                <For each={providers}>
                  {(provider) => (
                    <div class="marketing-provider">
                      <span class="marketing-provider__icon">{providerIcon(provider.id, 22)}</span>
                      {provider.name}
                    </div>
                  )}
                </For>
              </div>
            </div>
          </section>

          <section class="marketing-section marketing-problem" id="how-it-works">
            <div class="marketing-shell">
              <div class="marketing-section-heading marketing-section-heading--center">
                <span class="marketing-kicker">One market, less waste</span>
                <h2>AI access is valuable. It should not sit idle.</h2>
                <p>
                  Tuple connects paid capacity that is going unused with developers who need
                  reliable access to those exact models.
                </p>
              </div>

              <div class="marketing-value-grid">
                <article class="marketing-value-card marketing-value-card--seller">
                  <div class="marketing-value-card__topline">
                    <span class="marketing-value-card__icon">
                      <img src="/brand/tuple-mark-white.png" alt="" />
                    </span>
                    Supply
                  </div>
                  <h3>Make idle tokens productive.</h3>
                  <p>
                    Turn eligible unused quota and subscription capacity into something other people
                    can use, without handing over your provider credentials.
                  </p>
                  <div class="marketing-value-card__footer">
                    <span>Unused access</span>
                    <strong>New value</strong>
                  </div>
                </article>

                <article class="marketing-value-card marketing-value-card--buyer">
                  <div class="marketing-value-card__topline">
                    <span class="marketing-value-card__icon">
                      <img src="/brand/tuple-mark-white.png" alt="" />
                    </span>
                    Demand
                  </div>
                  <h3>Know what model answered.</h3>
                  <p>
                    Buy provider-backed model access instead of trusting an opaque proxy label.
                    Tuple keeps the authorization chain attached to every eligible route.
                  </p>
                  <div class="marketing-value-card__footer">
                    <span>Model request</span>
                    <strong>Verified route</strong>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="marketing-section marketing-market" id="market">
            <div class="marketing-shell">
              <div class="marketing-market__header">
                <div class="marketing-section-heading">
                  <span class="marketing-kicker">Choose your side</span>
                  <h2>Two sides. One verified market.</h2>
                </div>
                <div class="marketing-segmented" role="group" aria-label="Choose market side">
                  <button
                    type="button"
                    classList={{ active: side() === 'seller' }}
                    aria-pressed={side() === 'seller'}
                    onClick={() => setSide('seller')}
                  >
                    I have unused access
                  </button>
                  <button
                    type="button"
                    classList={{ active: side() === 'buyer' }}
                    aria-pressed={side() === 'buyer'}
                    onClick={() => setSide('buyer')}
                  >
                    I need model access
                  </button>
                </div>
              </div>

              <div class="marketing-journey">
                <div class="marketing-journey__intro">
                  <span class="marketing-kicker">{journey().eyebrow}</span>
                  <h3>{journey().title}</h3>
                  <p>{journey().body}</p>
                  <A href={journey().href} class="marketing-button">
                    {journey().cta}
                  </A>
                </div>
                <div class="marketing-journey__steps">
                  <For each={journey().steps}>
                    {(step) => (
                      <article class="marketing-step">
                        <span class="marketing-step__number">{step.number}</span>
                        <div>
                          <h4>{step.title}</h4>
                          <p>{step.body}</p>
                        </div>
                      </article>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </section>

          <section class="marketing-section marketing-provenance" id="provenance">
            <div class="marketing-shell marketing-provenance__grid">
              <div class="marketing-provenance__copy">
                <span class="marketing-kicker">Authenticated provenance</span>
                <h2>Model identity starts at the provider.</h2>
                <p>
                  A marketplace label is easy to fake. A provider-authorized route is not. Tuple
                  establishes access through OAuth or API keys and keeps the selected model tied to
                  that authenticated connection.
                </p>

                <div class="marketing-trust-list">
                  <div>
                    <i class="bxd bx-check-circle" aria-hidden="true" />
                    <span>
                      <strong>Direct authorization</strong>
                      OAuth or API-key-backed provider connections
                    </span>
                  </div>
                  <div>
                    <i class="bxd bx-check-circle" aria-hidden="true" />
                    <span>
                      <strong>Bound model identity</strong>
                      Model A cannot silently masquerade as Model B
                    </span>
                  </div>
                  <div>
                    <i class="bxd bx-check-circle" aria-hidden="true" />
                    <span>
                      <strong>Credential isolation</strong>
                      Buyers never receive a seller’s provider credentials
                    </span>
                  </div>
                </div>
              </div>

              <div class="marketing-proof-card">
                <div class="marketing-proof-card__header">
                  <span>Route verification</span>
                  <span class="marketing-live-pill">
                    <span />
                    Verified
                  </span>
                </div>
                <div class="marketing-proof-row">
                  <span class="marketing-proof-row__label">Requested model</span>
                  <code>anthropic/claude-sonnet</code>
                </div>
                <div class="marketing-proof-connector">
                  <span />
                  <div>
                    <img src="/brand/tuple-mark-white.png" alt="" />
                  </div>
                  <span />
                </div>
                <div class="marketing-proof-row">
                  <span class="marketing-proof-row__label">Authorized route</span>
                  <span class="marketing-proof-provider">
                    {providerIcon('anthropic', 22)}
                    Anthropic OAuth
                  </span>
                </div>
                <div class="marketing-proof-result">
                  <i class="bxd bx-check-circle" aria-hidden="true" />
                  Provider and requested model match
                </div>
              </div>
            </div>
          </section>

          <section class="marketing-section marketing-api">
            <div class="marketing-shell marketing-api__grid">
              <div class="marketing-section-heading">
                <span class="marketing-kicker">One familiar API</span>
                <h2>Change the endpoint. Keep your stack.</h2>
                <p>
                  Tuple speaks OpenAI-compatible APIs, so buyers can use the tools and SDKs they
                  already know while the network handles verified routing behind the scenes.
                </p>
                <div class="marketing-api__badges">
                  <span>Streaming</span>
                  <span>Fallbacks</span>
                  <span>Usage metering</span>
                  <span>Request logs</span>
                </div>
              </div>

              <div class="marketing-code-card">
                <div class="marketing-code-card__header">
                  <span>cURL</span>
                  <button type="button" onClick={copyCode} aria-label="Copy API example">
                    {copied() ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre>
                  <code>{codeSample}</code>
                </pre>
              </div>
            </div>
          </section>

          <section class="marketing-cta">
            <div class="marketing-shell">
              <div class="marketing-cta__card">
                <img src="/brand/tuple-mark-white.png" alt="" class="marketing-cta__mark" />
                <span class="marketing-kicker">
                  The market is two-sided. Your next step is not.
                </span>
                <h2>Put unused access to work, or buy the model you actually need.</h2>
                <div class="marketing-cta__actions">
                  <A href="/register?role=seller" class="marketing-button marketing-button--light">
                    Start selling
                  </A>
                  <A
                    href="/register?role=buyer"
                    class="marketing-button marketing-button--outline-light"
                  >
                    Start buying
                  </A>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer class="marketing-footer">
          <div class="marketing-shell marketing-footer__inner">
            <div>
              <img
                src="/brand/tuple-wordmark-white.png"
                alt="Tuple"
                class="marketing-footer__logo"
              />
              <p>The peer-to-peer LLM gateway.</p>
            </div>
            <div class="marketing-footer__links">
              <a href="https://tuple.ai/docs">Docs</a>
              <a href="https://github.com/tupleai/tuple">GitHub</a>
              <a href="https://discord.gg/FepAked3W7">Discord</a>
              <a href="https://tuple.ai/privacy">Privacy</a>
              <a href="https://tuple.ai/terms">Terms</a>
            </div>
          </div>
          <div class="marketing-shell marketing-footer__legal">
            <span>© {new Date().getFullYear()} Tuple</span>
            <span>
              Sellers must comply with provider agreements and applicable law when sharing access.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Marketing;
