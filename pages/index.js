import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInterval } from "@/hooks/useInterval";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function A股打板策略筛选() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    const res = await fetch(
      "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=100&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13&fields=f12,f14,f3,f10,f5,f6,f8,f9"
    );
    const json = await res.json();
    const raw = json?.data?.diff || [];
    const filtered = raw
      .map((item) => ({
        code: item.f12,
        name: item.f14,
        pct: item.f3 / 100,
        turnover: parseFloat(item.f8),
        volume: item.f5,
        amount: item.f6 / 1e8,
        ratio: parseFloat(item.f9),
        close: item.f3,
      }))
      .filter((s) => s.pct > 9.8 && s.turnover > 5 && s.amount > 1 && s.ratio > 1.5);

    setStocks(filtered);
    setLoading(false);
  };

  useInterval(() => {
    fetchStockData();
  }, 300000);

  const fetchStockRanking = async (code) => {
    const res = await fetch(
      `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13&fields=f12,f14,f3,f10,f5,f6,f8,f9&stk=${code}`
    );
    const json = await res.json();
    return json?.data?.diff;
  };

  const lowBuyStrategy = (stock) => {
    return stock.close < 5 && stock.pct < 0.05;
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">A股超短打板信号筛选</h1>
      <Button onClick={fetchStockData} disabled={loading} className="mb-4">
        {loading ? "加载中..." : "刷新数据"}
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((s) => (
          <Card key={s.code} className="shadow-lg border">
            <CardContent className="p-4">
              <h2 className="font-semibold text-lg">
                {s.name} ({s.code})
              </h2>
              <p>涨幅: {s.pct.toFixed(2)}%</p>
              <p>换手率: {s.turnover.toFixed(2)}%</p>
              <p>成交额: {s.amount.toFixed(2)}亿</p>
              <p>量比: {s.ratio.toFixed(2)}</p>
              <p>
                <Button
                  onClick={async () => {
                    const ranking = await fetchStockRanking(s.code);
                    console.log(ranking);
                  }}
                  className="mt-2"
                >
                  查看龙虎榜
                </Button>
              </p>
              <div>
                <h3>股价走势</h3>
                <LineChart width={300} height={150} data={[{ name: "今日", uv: s.close }]}>
                  <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                </LineChart>
              </div>
              {lowBuyStrategy(s) && <p>符合低吸策略条件</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
