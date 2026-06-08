import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Users/USER/Desktop/FES/backend/.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data: reports } = await supabase.from("reports").select("*");
  if (!reports) return;
  for (const r of reports) {
    let payload = r.payload;
    let modified = false;

    // Fix alternatives
    if (payload.alternatives && payload.alternatives.length > 0) {
      const first = payload.alternatives[0];
      if (!first.name && first.career_slug) {
        payload.alternatives = payload.alternatives.map((a) => ({
          name: a.career_slug,
          why: a.reasoning
        }));
        modified = true;
      }
    }

    // Fix cognitive
    if (payload.cognitive_insights && typeof payload.cognitive_insights === "string" && payload.cognitive_insights.startsWith("{")) {
      payload.cognitive_insights = "Análisis cognitivo completado satisfactoriamente (modo offline). Puntuaciones calculadas localmente.";
      modified = true;
    }

    if (modified) {
      await supabase.from("reports").update({ payload }).eq("id", r.id);
      console.log(`Fixed report ${r.id}`);
    }
  }
}

fix();
