import { useEffect, useMemo, useState } from "react";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import { AlertTriangle, BarChart3, DollarSign, Info, LineChart, PieChart, Plus, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { ensureUserProgress, getPortfolioAnalytics, money } from "@/lib/finance";

const MOCK_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.5, change: 1.2, sector: "Technology", risk: "Medium" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.8, change: -0.5, sector: "Technology", risk: "Medium" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.2, change: 0.8, sector: "Technology", risk: "Medium" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 185.6, change: 2.1, sector: "E-Commerce", risk: "Medium" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.3, change: -3.2, sector: "Automotive", risk: "High" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.5, change: 4.5, sector: "Technology", risk: "High" },
  { symbol: "META", name: "Meta Platforms", price: 512.7, change: 1.8, sector: "Social Media", risk: "Medium" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 634.2, change: -1.1, sector: "Entertainment", risk: "High" },
  { symbol: "DIS", name: "The Walt Disney Co.", price: 113.4, change: 0.3, sector: "Entertainment", risk: "Low" },
  { symbol: "SBUX", name: "Starbucks Corp.", price: 78.9, change: -0.7, sector: "Food & Beverage", risk: "Low" },
  { symbol: "VTI", name: "Total Market ETF", price: 263.4, change: 0.4, sector: "Diversified ETF", risk: "Low" },
  { symbol: "BND", name: "Bond Market ETF", price: 72.5, change: 0.1, sector: "Bonds", risk: "Low" }
];

export default function Invest() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [shares, setShares] = useState("1");
  const [buying, setBuying] = useState(false);
  const [search, setSearch] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState(50);
  const [years, setYears] = useState(5);
  const [annualReturn, setAnnualReturn] = useState(7);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const load = async () => {
      await ensureUserProgress(db, user.id);
      const rows = await db.entities.StockPortfolio.filter({ user_id: user.id });
      if (!cancelled) {
        setPortfolio(rows);
        setLoading(false);
      }
    };
    load();
    const reload = () => load();
    window.addEventListener("finwise:data", reload);
    window.addEventListener("storage", reload);
    return () => {
      cancelled = true;
      window.removeEventListener("finwise:data", reload);
      window.removeEventListener("storage", reload);
    };
  }, [user]);

  const portfolioWithValue = useMemo(() => portfolio.map((holding) => {
    const mockStock = MOCK_STOCKS.find((stock) => stock.symbol === holding.symbol);
    const currentPrice = mockStock?.price || holding.current_price || holding.buy_price;
    const value = Number(holding.shares || 0) * currentPrice;
    const cost = Number(holding.shares || 0) * Number(holding.buy_price || 0);
    const gain = value - cost;
    const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
    return { ...holding, current_price: currentPrice, value, cost, gain, gainPct, risk: mockStock?.risk || "Medium" };
  }), [portfolio]);

  const totals = useMemo(() => {
    const totalValue = portfolioWithValue.reduce((sum, holding) => sum + holding.value, 0);
    const totalCost = portfolioWithValue.reduce((sum, holding) => sum + holding.cost, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalGain, totalGainPct };
  }, [portfolioWithValue]);

  const portfolioAnalytics = useMemo(() => getPortfolioAnalytics(portfolioWithValue), [portfolioWithValue]);
  const sectorRows = Object.entries(portfolioAnalytics.sectorTotals).map(([sector, value]) => ({ sector, value }));
  const monthlyRate = Number(annualReturn || 0) / 100 / 12;
  const months = Number(years || 0) * 12;
  const futureValue = monthlyRate > 0
    ? Number(monthlyContribution || 0) * (((1 + monthlyRate) ** months - 1) / monthlyRate)
    : Number(monthlyContribution || 0) * months;

  const handleBuy = async () => {
    const shareCount = Number(shares);
    if (!selectedStock || !shareCount || shareCount <= 0) return;
    setBuying(true);
    const existing = portfolio.find((holding) => holding.symbol === selectedStock.symbol);
    if (existing) {
      const totalShares = Number(existing.shares || 0) + shareCount;
      const avgPrice = ((Number(existing.shares || 0) * Number(existing.buy_price || 0)) + (shareCount * selectedStock.price)) / totalShares;
      const updated = await db.entities.StockPortfolio.update(existing.id, {
        shares: totalShares,
        buy_price: avgPrice,
        current_price: selectedStock.price
      });
      setPortfolio((prev) => prev.map((holding) => holding.id === existing.id ? updated : holding));
    } else {
      const created = await db.entities.StockPortfolio.create({
        user_id: user.id,
        symbol: selectedStock.symbol,
        company_name: selectedStock.name,
        shares: shareCount,
        buy_price: selectedStock.price,
        current_price: selectedStock.price,
        sector: selectedStock.sector
      });
      setPortfolio((prev) => [...prev, created]);
    }
    setShowBuy(false);
    setShares("1");
    setBuying(false);
  };

  const handleSellHalf = async (holding) => {
    const remaining = Number(holding.shares || 0) / 2;
    if (remaining < 0.001) {
      await db.entities.StockPortfolio.delete(holding.id);
      setPortfolio((prev) => prev.filter((item) => item.id !== holding.id));
      return;
    }
    const updated = await db.entities.StockPortfolio.update(holding.id, { shares: remaining });
    setPortfolio((prev) => prev.map((item) => item.id === holding.id ? updated : item));
  };

  const filteredStocks = MOCK_STOCKS.filter((stock) =>
    stock.symbol.includes(search.toUpperCase()) || stock.name.toLowerCase().includes(search.toLowerCase()) || stock.sector.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Paper Trading Lab</h1>
          <p className="text-muted-foreground mt-1">Practice investing, diversification, and compounding without using real money.</p>
        </div>
        <Button onClick={() => { setSelectedStock(null); setShowBuy(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Buy Asset
        </Button>
      </div>

      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription className="text-xs">
          Educational simulation only. Prices are fixed mock prices for a safe prototype demo and are not financial advice.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Portfolio Value", value: money(totals.totalValue), icon: DollarSign, tone: "text-blue-600 bg-blue-50" },
          { label: "Gain/Loss", value: `${totals.totalGain >= 0 ? "+" : ""}${money(totals.totalGain)}`, icon: TrendingUp, tone: totals.totalGain >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50" },
          { label: "Return", value: `${totals.totalGainPct >= 0 ? "+" : ""}${totals.totalGainPct.toFixed(1)}%`, icon: LineChart, tone: "text-purple-600 bg-purple-50" },
          { label: "Diversification", value: `${portfolioAnalytics.diversificationScore}/100`, icon: ShieldCheck, tone: "text-cyan-600 bg-cyan-50" },
          { label: "Holdings", value: portfolio.length, icon: PieChart, tone: "text-amber-600 bg-amber-50" }
        ].map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", item.tone)}>
                <item.icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold font-display leading-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">My Holdings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {portfolioWithValue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Asset", "Shares", "Avg Cost", "Current", "Value", "Gain/Loss", "Action"].map((heading) => (
                        <th key={heading} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioWithValue.map((holding) => (
                      <tr key={holding.id} className="border-t border-border hover:bg-secondary/50">
                        <td className="px-4 py-3">
                          <p className="font-bold">{holding.symbol}</p>
                          <p className="text-xs text-muted-foreground">{holding.company_name}</p>
                        </td>
                        <td className="px-4 py-3">{Number(holding.shares).toFixed(3)}</td>
                        <td className="px-4 py-3">{money(holding.buy_price)}</td>
                        <td className="px-4 py-3">{money(holding.current_price)}</td>
                        <td className="px-4 py-3 font-medium">{money(holding.value)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("font-medium", holding.gain >= 0 ? "text-green-600" : "text-red-500")}>
                            {holding.gain >= 0 ? "+" : ""}{money(holding.gain)} ({holding.gainPct >= 0 ? "+" : ""}{holding.gainPct.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm" onClick={() => handleSellHalf(holding)}>Sell half</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-2">No holdings yet</p>
                <p className="text-sm">Start paper trading to practice investing.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Risk Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Diversification score</span>
                  <span className="font-semibold">{portfolioAnalytics.diversificationScore}/100</span>
                </div>
                <Progress value={portfolioAnalytics.diversificationScore} className="h-2" />
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{portfolioAnalytics.riskLevel}</p>
                <p className="text-muted-foreground mt-1">
                  Keep your largest position under 35% and use multiple sectors to lower concentration risk.
                </p>
              </div>
              {portfolioAnalytics.concentration > 50 && (
                <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 gap-1">
                  <AlertTriangle className="w-3 h-3" /> high concentration
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Sector Exposure
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sectorRows.length ? (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={sectorRows} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="sector" type="category" width={95} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => money(value)} />
                    <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Buy assets to see exposure.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Compound Habit Simulator</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Monthly contribution</Label>
            <Input type="number" min="0" value={monthlyContribution} onChange={(event) => setMonthlyContribution(event.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Years</Label>
            <Input type="number" min="1" max="50" value={years} onChange={(event) => setYears(event.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Annual return (%)</Label>
            <Input type="number" min="0" max="20" value={annualReturn} onChange={(event) => setAnnualReturn(event.target.value)} className="mt-1" />
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
            <p className="text-xs text-muted-foreground">Estimated future value</p>
            <p className="text-2xl font-bold text-primary">{money(futureValue)}</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showBuy} onOpenChange={setShowBuy}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Buy Asset (Paper Trade)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by ticker, company, or sector..." className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredStocks.map((stock) => (
                <button key={stock.symbol} onClick={() => setSelectedStock(stock)}
                  className={cn("w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-secondary transition-colors border",
                    selectedStock?.symbol === stock.symbol ? "border-primary bg-primary/5" : "border-transparent")}>
                  <div>
                    <p className="font-bold text-sm">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                    <p className="text-xs text-muted-foreground">{stock.sector} - {stock.risk} risk</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{money(stock.price)}</p>
                    <p className={cn("text-xs", stock.change >= 0 ? "text-green-600" : "text-red-500")}>
                      {stock.change >= 0 ? "+" : ""}{stock.change}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {selectedStock && (
              <div className="space-y-3 border-t pt-3">
                <p className="text-sm font-medium">Buying: <span className="text-primary">{selectedStock.symbol} at {money(selectedStock.price)}</span></p>
                <div>
                  <Label>Number of Shares</Label>
                  <Input type="number" min="0.001" step="0.001" value={shares} onChange={(event) => setShares(event.target.value)} className="mt-1" />
                </div>
                <p className="text-sm text-muted-foreground">Total cost: <strong>{money(Number(shares || 0) * selectedStock.price)}</strong></p>
                <Button onClick={handleBuy} disabled={buying} className="w-full">
                  {buying ? "Buying..." : "Confirm Paper Trade"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
