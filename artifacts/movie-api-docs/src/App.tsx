import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Braces,
  Check,
  ChevronDown,
  Clapperboard,
  Copy,
  Database,
  Film,
  Info,
  LoaderCircle,
  Play,
  Search,
  Sparkles,
  Tv,
} from 'lucide-react';

type CatalogTitle = {
  subjectId?: string | number;
  title?: string;
  cover?: string;
  poster?: string;
  score?: string | number;
  releaseTime?: string | number;
  subjectType?: number;
  runtime?: string;
};

type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'error'; message: string }
  | { status: 'empty'; query: string }
  | { status: 'success'; query: string; items: CatalogTitle[]; payload: unknown };

const catalogEndpoints = [
  { path: '/trending', description: 'Trending titles. The list is returned under data.' },
  { path: '/home?page=1', description: 'Home feed sections, usually grouped under data.list.' },
  { path: '/movies?page=1', description: 'Browse movie catalog sections.' },
  { path: '/anime?page=1', description: 'Browse anime catalog sections.' },
  { path: '/rankings?tabId=1', description: 'Ranked titles for the selected ranking tab.' },
  { path: '/discovery', description: 'Personalized discovery feed.' },
];

const searchEndpoints = [
  { path: '/search-suggestions?q=Inception', description: 'Query-aware autocomplete suggestions for a title.' },
  { path: '/search?q=Inception&page=1&subject_type=0', description: 'Full title search. Read matching titles from data.items.' },
];

const mediaEndpoints = [
  { path: '/detail/{subject_id}', description: 'Title metadata, artwork, synopsis, cast, and related fields.' },
  { path: '/episodes/{series_id}', description: 'Season and episode lists for a series, including data.seasons.' },
  { path: '/stream/{subject_id}?season=1&episode=1&quality=720p', description: 'Resolve a playable media URL for a movie or episode.' },
  { path: '/download/{subject_id}?season=1&episode=1&quality=720p', description: 'Best-effort downloadable media response for a title or episode.' },
];

function endpointUrl(path: string) {
  return `/api${path}`;
}

function suggestionTerms(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: unknown }).data;
  const candidates = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)
      ? (data as { items: unknown[] }).items
      : [];
  return candidates
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const value = item as { title?: unknown; name?: unknown; keyword?: unknown; value?: unknown };
        const term = value.title ?? value.name ?? value.keyword ?? value.value;
        return typeof term === 'string' ? term : '';
      }
      return '';
    })
    .filter(Boolean)
    .slice(0, 7);
}

function readItems(payload: unknown): CatalogTitle[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return [];
  const items = (data as { items?: unknown }).items;
  return Array.isArray(items) ? items as CatalogTitle[] : [];
}

function EndpointRow({ path, description }: { path: string; description: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(endpointUrl(path));
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="endpoint" data-testid={`endpoint-row-${path.replace(/[^a-z0-9]+/gi, '-')}`}>
      <div className="endpoint-path">
        <span className="method">GET</span>
        <code>{path}</code>
      </div>
      <div className="endpoint-description">{description}</div>
      <button className="copy-btn" type="button" onClick={copyPath} aria-label={`Copy ${path}`} data-testid={`button-copy-${path.replace(/[^a-z0-9]+/gi, '-')}`}>
        {copied ? <Check /> : <Copy />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function EndpointSection({
  id,
  index,
  title,
  description,
  icon: Icon,
  endpoints,
}: {
  id: string;
  index: string;
  title: string;
  description: string;
  icon: typeof Film;
  endpoints: { path: string; description: string }[];
}) {
  return (
    <section className="doc-section" id={id} data-testid={`section-${id}`}>
      <div className="section-heading">
        <div>
          <div className="section-kicker">{index} / Reference</div>
          <h2><Icon size={19} style={{ display: 'inline', marginRight: 8, verticalAlign: '-3px', color: 'hsl(var(--primary))' }} />{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <div className="endpoint-list">
        {endpoints.map((endpoint) => <EndpointRow key={endpoint.path} {...endpoint} />)}
      </div>
    </section>
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const [showJson, setShowJson] = useState(false);
  const [focused, setFocused] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionError('');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      setSuggestionError('');
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(cleanQuery)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Suggestions returned HTTP ${response.status}.`);
        const payload: unknown = await response.json();
        setSuggestions(suggestionTerms(payload));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setSuggestions([]);
        setSuggestionError('Autocomplete is unavailable right now.');
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 260);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  async function runSearch(searchQuery = query) {
    const cleanQuery = searchQuery.trim();
    setQuery(searchQuery);
    setFocused(false);
    if (!cleanQuery) {
      setSearchState({ status: 'error', message: 'Enter a title to search the catalog.' });
      return;
    }
    const currentRequest = ++requestId.current;
    setShowJson(false);
    setSearchState({ status: 'loading', query: cleanQuery });
    const params = new URLSearchParams({ q: cleanQuery, page: '1', subject_type: '0' });
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        let detail = '';
        try {
          const body = await response.json() as { message?: string; error?: string };
          detail = body.message ?? body.error ?? '';
        } catch {
          detail = '';
        }
        throw new Error(detail || `Search returned HTTP ${response.status}.`);
      }
      const payload: unknown = await response.json();
      if (currentRequest !== requestId.current) return;
      const items = readItems(payload);
      setSearchState(items.length
        ? { status: 'success', query: cleanQuery, items, payload }
        : { status: 'empty', query: cleanQuery });
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setSearchState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The search request failed. Please try again.',
      });
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  return (
    <div className="docs-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" data-testid="link-home">
            <span className="brand-mark"><Clapperboard size={17} /></span>
            <span>CATALOG<span style={{ color: 'hsl(var(--primary))' }}>/</span>API<small>DEVELOPER REFERENCE</small></span>
          </a>
          <div className="top-actions">
            <span className="live-chip"><span className="live-dot" /> PUBLIC API</span>
            <a className="nav-doc" href="/api/openapi.json" target="_blank" rel="noreferrer" data-testid="link-openapi-top">OpenAPI <ArrowUpRight size={13} /></a>
            <a className="nav-doc" href="/api/healthz" target="_blank" rel="noreferrer" data-testid="link-health-top">Health <ArrowUpRight size={13} /></a>
          </div>
        </div>
      </header>

      <div className="layout" id="top">
        <aside className="sidebar">
          <p className="side-label">On this page</p>
          <nav className="side-nav" aria-label="Documentation sections">
            <a href="#browse"><Film />Browse</a>
            <a href="#search"><Search />Search &amp; autocomplete</a>
            <a href="#details"><Database />Details &amp; episodes</a>
            <a href="#media"><Play />Streaming &amp; downloads</a>
            <a href="#examples"><Braces />Examples</a>
          </nav>
          <div className="side-footer"><strong>Quick start</strong>All routes share the same-origin <code className="inline-code">/api</code> base. No API key required for public reads.</div>
        </aside>

        <main className="content">
          <section className="hero">
            <div className="eyebrow">Movie Catalog · API guide</div>
            <h1>Find a title.<br /><em>Build what’s next.</em></h1>
            <p className="hero-copy">A practical reference for browsing the catalog, searching titles, and streaming media. Start with the endpoints; try a real search below.</p>
            <div className="hero-meta">
              <span className="base-pill"><span>BASE URL</span><code>{typeof window !== 'undefined' ? window.location.origin : ''}/api</code></span>
              <a className="meta-link" href="/api/openapi.json" target="_blank" rel="noreferrer" data-testid="link-openapi-hero"><Braces size={14} /> OpenAPI JSON <ArrowUpRight size={12} /></a>
              <a className="meta-link" href="/api/healthz" target="_blank" rel="noreferrer" data-testid="link-health-hero"><Activity size={14} /> Health check <ArrowUpRight size={12} /></a>
            </div>
            <span className="hero-index">DOCS / 01</span>
          </section>

          <EndpointSection
            id="browse"
            index="01"
            title="Browse the catalog"
            description="Catalog endpoints return JSON. Most lists use a code and data envelope."
            icon={Film}
            endpoints={catalogEndpoints}
          />
          <div className="notice">
            <Info />
            <span><strong>Movies and series share the catalog.</strong> There is no separate series-list route. Check <code className="inline-code">subjectType</code>: <code className="inline-code">1</code> = movie, <code className="inline-code">2</code> = series. Use a series <code className="inline-code">subjectId</code> to load its episodes.</span>
          </div>

          <section className="doc-section" id="search">
            <div className="section-heading">
              <div>
                <div className="section-kicker">02 / Interactive</div>
                <h2><Search size={19} style={{ display: 'inline', marginRight: 8, verticalAlign: '-3px', color: 'hsl(var(--primary))' }} />Search &amp; autocomplete</h2>
              </div>
              <p>Suggestions update as you type. Search returns normalized title objects in <code className="inline-code">data.items</code>.</p>
            </div>
            <div className="endpoint-list" style={{ marginBottom: 16 }}>
              {searchEndpoints.map((endpoint) => <EndpointRow key={endpoint.path} {...endpoint} />)}
            </div>
            <div className="search-panel">
              <form className="search-form" onSubmit={submitSearch}>
                <div className="search-input-wrap">
                  <Search className="search-icon" />
                  <input
                    className="search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 140)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setFocused(false);
                      if (event.key === 'Enter' && focused && suggestions.length) {
                        event.preventDefault();
                        void runSearch(suggestions[0]);
                      }
                    }}
                    placeholder="Search a movie or series title…"
                    autoComplete="off"
                    aria-label="Search movie catalog"
                    aria-expanded={focused && (suggestions.length > 0 || suggestionsLoading)}
                    data-testid="input-title-search"
                  />
                  {focused && query.trim() && (suggestions.length > 0 || suggestionsLoading || suggestionError) && (
                    <div className="suggestions" role="listbox" aria-label="Search suggestions">
                      <div className="suggestion-hint">{suggestionsLoading ? 'Looking for suggestions' : suggestionError ? 'Suggestions unavailable' : 'Suggestions'}</div>
                      {suggestionsLoading && <div className="suggestion" aria-live="polite">Checking title suggestions…</div>}
                      {suggestionError && <div className="suggestion">{suggestionError}</div>}
                      {suggestions.map((term, index) => (
                        <button
                          className="suggestion"
                          type="button"
                          key={`${term}-${index}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => void runSearch(term)}
                          role="option"
                          aria-selected="false"
                          data-testid={`suggestion-${index}`}
                        >{term}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="search-submit" type="submit" disabled={searchState.status === 'loading'} data-testid="button-search">
                  {searchState.status === 'loading' ? <LoaderCircle className="spin" /> : <Search />}
                  {searchState.status === 'loading' ? 'Searching' : 'Search titles'}
                </button>
              </form>
              <div className="search-foot">
                <span>{suggestionsLoading ? 'Fetching autocomplete…' : suggestionError ? suggestionError : 'Autocomplete via /api/search-suggestions'}</span>
                <code>page=1 · subject_type=0</code>
              </div>
              {searchState.status === 'idle' && (
                <div className="search-status" data-testid="status-search-idle">
                  <Sparkles /><span>Enter a title to search the live catalog. Suggestions appear while you type.</span>
                </div>
              )}
              {searchState.status === 'loading' && (
                <div className="search-status" aria-live="polite" data-testid="status-search-loading">
                  <LoaderCircle className="spin" /><span>Searching for “{searchState.query}”…</span>
                </div>
              )}
              {searchState.status === 'error' && (
                <div className="search-status error" role="alert" data-testid="status-search-error">
                  <AlertCircle /><span>{searchState.message}</span>
                  {query.trim() && <button className="copy-btn" type="button" onClick={() => void runSearch()} data-testid="button-search-retry">Retry</button>}
                </div>
              )}
              {searchState.status === 'empty' && (
                <div className="search-status" aria-live="polite" data-testid="status-search-empty">
                  <Search /><span>No titles found for “{searchState.query}”. Try another spelling or a broader title.</span>
                </div>
              )}
              {searchState.status === 'success' && (
                <>
                  <div className="search-status success" aria-live="polite" data-testid="status-search-success">
                    <Check /><span>Found {searchState.items.length} {searchState.items.length === 1 ? 'title' : 'titles'} for “{searchState.query}”.</span>
                  </div>
                  <div className="result-list">
                    {searchState.items.map((item, index) => {
                      const subjectId = item.subjectId ?? '—';
                      const poster = item.cover || item.poster;
                      const kind = item.subjectType === 1 ? 'Movie' : item.subjectType === 2 ? 'Series' : 'Title';
                      return (
                        <article className="result-item" key={`${subjectId}-${index}`} data-testid={`result-item-${index}`}>
                          <div className="poster">
                            {poster ? <img src={poster} alt="" loading="lazy" /> : <Tv size={19} />}
                          </div>
                          <div>
                            <h3 className="result-title">{item.title || 'Untitled'}</h3>
                            <div className="result-meta">{kind}{item.releaseTime ? ` · ${item.releaseTime}` : ''}{item.score ? ` · Score ${item.score}` : ''}{item.runtime ? ` · ${item.runtime}` : ''}</div>
                            <div className="result-id">subjectId: {subjectId}</div>
                          </div>
                          <button className="copy-btn" type="button" onClick={async () => {
                            try { await navigator.clipboard.writeText(String(subjectId)); } catch { /* Clipboard may be unavailable in insecure contexts. */ }
                          }} data-testid={`button-copy-subject-${index}`}><Copy /> Copy ID</button>
                        </article>
                      );
                    })}
                  </div>
                  <button className="json-toggle" type="button" onClick={() => setShowJson(!showJson)} aria-expanded={showJson} data-testid="button-toggle-search-json">
                    <ChevronDown size={13} style={{ transform: showJson ? 'rotate(180deg)' : undefined }} />
                    {showJson ? 'Hide full response' : 'View full response JSON'}
                  </button>
                  {showJson && <pre className="json-output" data-testid="output-search-json">{JSON.stringify(searchState.payload, null, 2)}</pre>}
                </>
              )}
            </div>
            <div className="data-note">
              <h3>Search result shape</h3>
              <p>Read the array at <code>data.items</code>. Common fields: <code>subjectId</code>, <code>title</code>, <code>cover</code>, <code>poster</code>, <code>score</code>, <code>releaseTime</code>, <code>subjectType</code>, and <code>runtime</code>. The imported API uses <code>subjectType: 1</code> for movies and <code>2</code> for series.</p>
            </div>
          </section>

          <EndpointSection
            id="details"
            index="03"
            title="Details & episodes"
            description="Start from the subjectId returned by search or a catalog list."
            icon={Database}
            endpoints={mediaEndpoints.slice(0, 2)}
          />
          <div className="notice">
            <Info /><span><strong>Series episode flow:</strong> search or browse to get a series <code className="inline-code">subjectId</code>, call <code className="inline-code">/detail/{'{subject_id}'}</code> for metadata, then <code className="inline-code">/episodes/{'{series_id}'}</code> to find season and episode identifiers.</span>
          </div>

          <EndpointSection
            id="media"
            index="04"
title="Streaming & downloads"
  description="Resolve a playable stream from a movie or series subjectId."
            icon={Play}
            endpoints={mediaEndpoints.slice(2)}
          />
          <div className="detail-grid" style={{ marginTop: 14 }}>
            <article className="detail-card">
<h3><Play size={14} style={{ display: 'inline', marginRight: 7, verticalAlign: '-2px', color: 'hsl(var(--primary))' }} />Stream resolver</h3>
  <p><code className="inline-code">/stream</code> resolves the best available playable media URL for the requested movie or episode. Use the returned URL with your player or pass it through your own media layer.</p>
            </article>
            <article className="detail-card">
              <h3><ArrowDownToLine size={14} style={{ display: 'inline', marginRight: 7, verticalAlign: '-2px', color: 'hsl(var(--primary))' }} />Best-effort downloads</h3>
              <p><code className="inline-code">/download</code> depends on an available downloadable mirror and can return <code className="inline-code">404</code>. Treat the endpoint as optional, and handle unavailable sources in your UI.</p>
            </article>
          </div>
          <div className="notice">
            <Info /><span><strong>CORS:</strong> The API allows wildcard origins. Because wildcard CORS cannot be combined with credentialed browser requests, cross-origin clients should not send credentials. Same-origin calls can use relative <code className="inline-code">/api</code> paths.</span>
          </div>

          <section className="doc-section" id="examples">
            <div className="section-heading">
              <div>
                <div className="section-kicker">05 / Recipes</div>
                <h2><Braces size={19} style={{ display: 'inline', marginRight: 8, verticalAlign: '-3px', color: 'hsl(var(--primary))' }} />Request examples</h2>
              </div>
              <p>Use same-origin relative paths in browser applications.</p>
            </div>
            <div className="example-grid">
              <article className="example-card">
                <div className="example-head"><strong>Fetch titles</strong><span>JAVASCRIPT</span></div>
                <pre className="code-block">{`const params = new URLSearchParams({
  q: "Inception",
  page: "1",
  subject_type: "0",
});
const response = await fetch(
  \`/api/search?\${params.toString()}\`
);
const { data } = await response.json();
console.log(data.items);`}</pre>
              </article>
              <article className="example-card">
                <div className="example-head"><strong>Play an episode</strong><span>HTML</span></div>
<pre className="code-block">{`const response = await fetch(
  '/api/stream/SERIES_ID?season=1&episode=1&quality=720p'
);
const { data } = await response.json();
video.src = data.url;`}</pre>
              </article>
              <article className="example-card">
                <div className="example-head"><strong>Search from terminal</strong><span>CURL</span></div>
                <pre className="code-block">{`curl -sS \\
  "/api/search?q=Inception&page=1&subject_type=0"`}</pre>
              </article>
              <article className="example-card">
                <div className="example-head"><strong>Download, when available</strong><span>CURL</span></div>
                <pre className="code-block">{`curl -fL \\
  "/api/download/MOVIE_ID?season=1&episode=1&quality=720p" \\
  -o title.mp4`}</pre>
              </article>
            </div>
          </section>

          <footer className="footer">
            <span>Movie Catalog API · Public developer quick reference</span>
            <span><a href="/api/openapi.json" target="_blank" rel="noreferrer" data-testid="link-openapi-footer">OpenAPI JSON</a> · <a href="/api/healthz" target="_blank" rel="noreferrer" data-testid="link-health-footer">Health check</a> · Base path <code>/api</code></span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
