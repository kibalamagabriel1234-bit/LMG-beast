"use client";
import {useEffect,useState} from "react";
export default function ProviderSettings(){
 const [status,setStatus]=useState("Checking provider configuration…");
 const [key,setKey]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 async function refresh(){try{const r=await fetch("/api/admin/provider");const d=await r.json();setStatus(r.ok?d.masked:(d.error||"Unable to check status"));}catch{setStatus("Unable to check status");}}
 useEffect(()=>{refresh()},[]);
 async function save(){setBusy(true);setMessage("");try{const r=await fetch("/api/admin/provider",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:key})});const d=await r.json();setMessage(d.message||d.error||"Request failed");if(r.ok){setKey("");await refresh();}}catch{setMessage("Unable to save provider key.");}finally{setBusy(false);}}
 return <section className="panel"><h2>Twelve Data provider</h2><p>Current key status: <strong className="gold">{status}</strong></p><p className="muted">Only authorised admins can replace the key. The existing key is never displayed, returned by the API, or placed in browser storage.</p><input type="password" autoComplete="new-password" placeholder="Enter replacement Twelve Data API key" value={key} onChange={e=>setKey(e.target.value)}/><button disabled={busy||key.trim().length<20} onClick={save}>{busy?"Saving…":"Save new API key"}</button><p className="muted">{message}</p></section>;
}
