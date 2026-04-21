import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const instruments = [
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
  { symbol: "BTC-PERP", name: "Bitcoin Perpetual", market: "CRYPTO", tickSize: 0.50, tickValue: 0.50, exchange: "Bybit" },
  { symbol: "ETH-PERP", name: "Ethereum Perpetual", market: "CRYPTO", tickSize: 0.01, tickValue: 0.01, exchange: "Bybit" },
  { symbol: "SOL-PERP", name: "Solana Perpetual", market: "CRYPTO", tickSize: 0.001, tickValue: 0.001, exchange: "Bybit" },
  { symbol: "6E", name: "Euro FX Futures", market: "FOREX", tickSize: 0.00005, tickValue: 6.25, exchange: "CME" },
  { symbol: "6J", name: "Japanese Yen Futures", market: "FOREX", tickSize: 0.0000005, tickValue: 6.25, exchange: "CME" },
  { symbol: "6B", name: "British Pound Futures", market: "FOREX", tickSize: 0.0001, tickValue: 6.25, exchange: "CME" },
  // US Stocks (tickValue 0.01 per share → PnL = Δprice × shares)
  { symbol: "AAPL", name: "Apple Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "HOOD", name: "Robinhood Markets Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ ETF", market: "STOCKS", tickSize: 0.01, tickValue: 0.01, exchange: "NASDAQ" },
];

const setups = [
  { name: "Breakout", description: "Ruptura de nivel clave con volumen", color: "#00e5ff" },
  { name: "Break & Retest", description: "Ruptura seguida de retesteo del nivel", color: "#448aff" },
  { name: "VWAP Reclaim", description: "Recuperación del VWAP", color: "#d500f9" },
  { name: "ICT Orderblock", description: "Entrada en bloque de órdenes institucional", color: "#ff9100" },
  { name: "Mean Reversion", description: "Retorno a la media desde extremos", color: "#00e676" },
  { name: "Trend Continuation", description: "Continuación de tendencia en pullback", color: "#ffea00" },
  { name: "Opening Range", description: "Trading del rango de apertura", color: "#f50057" },
];

async function main() {
  console.log("Seeding database...");

  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: {},
      create: inst,
    });
  }
  console.log(`✓ ${instruments.length} instruments`);

  for (const setup of setups) {
    await prisma.setup.upsert({
      where: { name: setup.name },
      update: {},
      create: setup,
    });
  }
  console.log(`✓ ${setups.length} setups`);

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
