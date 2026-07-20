export const MARKETS = [
  { value: "CME",     label: "CME / Futuros",            color: "#448aff" },
  { value: "STOCKS",  label: "Acciones / Stocks",         color: "#00e676" },
  { value: "CRYPTO",  label: "Crypto Futures",            color: "#d500f9" },
  { value: "FOREX",   label: "Forex / Spot",              color: "#ff9800" },
  { value: "OPTIONS", label: "Opciones / Options",        color: "#f59e0b" },
  { value: "GENERIC", label: "Genérico / CFD",            color: "#90a4ae" },
] as const;

export const DIRECTIONS = [
  { value: "LONG", label: "Long", color: "#00e676" },
  { value: "SHORT", label: "Short", color: "#ff1744" },
] as const;

export const TRADE_STATUSES = [
  { value: "CLOSED", label: "Cerrado" },
  { value: "OPEN", label: "Abierto" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

export const EMOTIONS = [
  { value: "FOCUSED",   label: "Enfocado",      color: "#a855f7" },
  { value: "CALM",      label: "Tranquilo",     color: "#22d3ee" },
  { value: "NEUTRAL",   label: "Neutral",       color: "#94a3b8" },
  { value: "CONFIDENT", label: "Confiado",      color: "#4ade80" },
  { value: "ANXIOUS",   label: "Ansioso",       color: "#facc15" },
  { value: "FEARFUL",   label: "Con Miedo",     color: "#f87171" },
  { value: "GREEDY",    label: "Codicioso",     color: "#fb923c" },
  { value: "REVENGE",   label: "Revenge Trade", color: "#ef4444" },
  { value: "FOMO",      label: "FOMO",          color: "#f472b6" },
] as const;

export const DEFAULT_INSTRUMENTS = [
  // CME Micro & Full
  { symbol: "MES", name: "Micro E-mini S&P 500", market: "CME", tickSize: 0.25, tickValue: 1.25, exchange: "CME" },
  { symbol: "ES", name: "E-mini S&P 500", market: "CME", tickSize: 0.25, tickValue: 12.50, exchange: "CME" },
  { symbol: "MNQ", name: "Micro E-mini Nasdaq 100", market: "CME", tickSize: 0.25, tickValue: 0.50, exchange: "CME" },
  { symbol: "NQ", name: "E-mini Nasdaq 100", market: "CME", tickSize: 0.25, tickValue: 5.00, exchange: "CME" },
  { symbol: "MCL", name: "Micro WTI Crude Oil", market: "CME", tickSize: 0.01, tickValue: 1.00, exchange: "NYMEX" },
  { symbol: "CL", name: "WTI Crude Oil", market: "CME", tickSize: 0.01, tickValue: 10.00, exchange: "NYMEX" },
  { symbol: "MGC", name: "Micro Gold", market: "CME", tickSize: 0.10, tickValue: 1.00, exchange: "COMEX" },
  { symbol: "GC", name: "Gold Futures", market: "CME", tickSize: 0.10, tickValue: 10.00, exchange: "COMEX" },
  { symbol: "MYM", name: "Micro E-mini Dow Jones", market: "CME", tickSize: 1, tickValue: 0.50, exchange: "CBOT" },
  { symbol: "YM", name: "E-mini Dow Jones", market: "CME", tickSize: 1, tickValue: 5.00, exchange: "CBOT" },
  // Crypto
  { symbol: "BTC-PERP", name: "Bitcoin Perpetual", market: "CRYPTO", tickSize: 0.50, tickValue: 0.50, exchange: "Bybit" },
  { symbol: "ETH-PERP", name: "Ethereum Perpetual", market: "CRYPTO", tickSize: 0.01, tickValue: 0.01, exchange: "Bybit" },
  { symbol: "SOL-PERP", name: "Solana Perpetual", market: "CRYPTO", tickSize: 0.001, tickValue: 0.001, exchange: "Bybit" },
  // Forex Futures
  { symbol: "6E", name: "Euro FX Futures", market: "FOREX", tickSize: 0.00005, tickValue: 6.25, exchange: "CME" },
  { symbol: "6J", name: "Japanese Yen Futures", market: "FOREX", tickSize: 0.0000005, tickValue: 6.25, exchange: "CME" },
  { symbol: "6B", name: "British Pound Futures", market: "FOREX", tickSize: 0.0001, tickValue: 6.25, exchange: "CME" },
  // Forex Spot majors (tickValue $10/pip = 1 standard lot; set Size = lots when trading)
  { symbol: "EURUSD", name: "Euro / US Dollar",                  market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar",         market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen",          market: "FOREX",   tickSize: 0.01,   tickValue: 10,    exchange: "SPOT" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc",           market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar",     market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar",       market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "NZDUSD", name: "New Zealand Dollar / USD",          market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "EURGBP", name: "Euro / British Pound",              market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen",               market: "FOREX",   tickSize: 0.01,   tickValue: 10,    exchange: "SPOT" },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen",      market: "FOREX",   tickSize: 0.01,   tickValue: 10,    exchange: "SPOT" },
  { symbol: "EURAUD", name: "Euro / Australian Dollar",          market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "EURCHF", name: "Euro / Swiss Franc",                market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "GBPCHF", name: "British Pound / Swiss Franc",       market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "AUDCAD", name: "Australian Dollar / CAD",           market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "CADJPY", name: "Canadian Dollar / Japanese Yen",    market: "FOREX",   tickSize: 0.01,   tickValue: 10,    exchange: "SPOT" },
  { symbol: "AUDJPY", name: "Australian Dollar / JPY",           market: "FOREX",   tickSize: 0.01,   tickValue: 10,    exchange: "SPOT" },
  { symbol: "CHFJPY", name: "Swiss Franc / Japanese Yen",        market: "FOREX",   tickSize: 0.01,   tickValue: 10,    exchange: "SPOT" },
  { symbol: "GBPAUD", name: "British Pound / Australian Dollar", market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "GBPCAD", name: "British Pound / Canadian Dollar",   market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  { symbol: "EURCAD", name: "Euro / Canadian Dollar",            market: "FOREX",   tickSize: 0.0001, tickValue: 10,    exchange: "SPOT" },
  // Metals Spot
  { symbol: "XAUUSD", name: "Gold / US Dollar",                  market: "FOREX",   tickSize: 0.01,   tickValue: 1.00,  exchange: "SPOT" },
  { symbol: "XAGUSD", name: "Silver / US Dollar",                market: "FOREX",   tickSize: 0.001,  tickValue: 5.00,  exchange: "SPOT" },
  // Indices CFD
  { symbol: "US30",   name: "Dow Jones 30 CFD",                  market: "GENERIC", tickSize: 1,      tickValue: 1.00,  exchange: "CFD"  },
  { symbol: "NAS100", name: "Nasdaq 100 CFD",                     market: "GENERIC", tickSize: 0.1,    tickValue: 1.00,  exchange: "CFD"  },
  { symbol: "SPX500", name: "S&P 500 CFD",                        market: "GENERIC", tickSize: 0.1,    tickValue: 1.00,  exchange: "CFD"  },
  { symbol: "GER40",  name: "DAX 40 CFD",                         market: "GENERIC", tickSize: 1,      tickValue: 1.00,  exchange: "CFD"  },
  { symbol: "UK100",  name: "FTSE 100 CFD",                       market: "GENERIC", tickSize: 0.1,    tickValue: 1.00,  exchange: "CFD"  },
  // Crypto Spot
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar",               market: "CRYPTO",  tickSize: 0.01,   tickValue: 0.01,  exchange: "SPOT" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar",              market: "CRYPTO",  tickSize: 0.01,   tickValue: 0.01,  exchange: "SPOT" },
  { symbol: "SOLUSD", name: "Solana / US Dollar",                market: "CRYPTO",  tickSize: 0.001,  tickValue: 0.001, exchange: "SPOT" },
  // US Stocks — tickSize 0.01, tickValue 0.01 per share (PnL = Δprice × shares)
  { symbol: "AAPL", name: "Apple Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "HOOD", name: "Robinhood Markets Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ ETF (Nasdaq 100)", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
] as const;

export const DEFAULT_SETUPS = [
  { name: "Breakout", description: "Ruptura de nivel clave con volumen", color: "#00e5ff" },
  { name: "Break & Retest", description: "Ruptura seguida de retesteo del nivel", color: "#448aff" },
  { name: "VWAP Reclaim", description: "Recuperación del VWAP como soporte/resistencia", color: "#d500f9" },
  { name: "ICT Orderblock", description: "Entrada en bloque de órdenes institucional", color: "#ff9100" },
  { name: "Mean Reversion", description: "Retorno a la media desde extremos", color: "#00e676" },
  { name: "Trend Continuation", description: "Continuación de tendencia en pullback", color: "#ffea00" },
  { name: "Opening Range", description: "Trading del rango de apertura", color: "#f50057" },
] as const;

export const MAX_ACCOUNTS = 5;
