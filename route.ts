import {NextRequest,NextResponse} from "next/server";
import {getTwelveDataKey} from "@/lib/secrets";
export const dynamic = "force-dynamic";
const allowed = new Set(["XAU/USD","EUR/USD","GBP/USD","USD/JPY"]);
const intervals = new Set(["1min","5min","15min","30min","1h","4h","1day"]);
export async function GET(req:NextRequest){
  const symbol=(req.nextUrl.searchParams.get("symbol")||"XAU/USD").toUpperCase();
  const interval=req.nextUrl.searchParams.get("interval")||"15min";
  if(!allowed.has(symbol)||!intervals.has(interval)) return NextResponse.json({error:"Unsupported symbol or interval"},{status:400});
  let key:string|null;
  try { key=await getTwelveDataKey(); } catch { return NextResponse.json({error:"Market-data configuration is unavailable."},{status:503}); }
  if(!key) return NextResponse.json({error:"Market-data provider is not configured."},{status:503});
  const url=new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol",symbol);url.searchParams.set("interval",interval);url.searchParams.set("outputsize","100");url.searchParams.set("format","JSON");
  try{
    const upstream=await fetch(url.toString(),{headers:{"Authorization":`apikey ${key}`},cache:"no-store",signal:AbortSignal.timeout(10000)});
    const data=await upstream.json();
    if(!upstream.ok||data.status==="error") return NextResponse.json({error:"Market-data provider request failed",details:data.message||"Provider unavailable"},{status:502});
    return NextResponse.json({symbol,interval,values:data.values??[],meta:data.meta??{}},{headers:{"Cache-Control":"s-maxage=30, stale-while-revalidate=60"}});
  }catch{return NextResponse.json({error:"Unable to reach market-data provider."},{status:502});}
}
