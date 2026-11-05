import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase-server";
import ProviderSettings from "./provider-settings";
export default async function Admin(){
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/login");
 if(user.app_metadata?.role!=="admin") return <main><h1 className="gold">Admin access restricted</h1><p>This account is not authorised as an administrator.</p></main>;
 return <main><h1 className="gold">LMG MARKETS Admin Dashboard</h1>
 <section className="panel"><p>Administrator session: {user.email}</p><p>Admin permissions are verified on the server. Member passwords are never visible here.</p></section>
 <ProviderSettings/>
 <section className="panel"><h2>Platform controls</h2><p>Member accounts are managed through Supabase Auth. Admins can review account metadata, but cannot retrieve member passwords.</p><p>Educational signals only; no broker execution or payment processing is enabled.</p></section></main>;
}
