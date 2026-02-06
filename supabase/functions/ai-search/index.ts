import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`AI search: "${query}" for user: ${user.id}`);

    // Fetch all user's links
    const { data: links, error: fetchError } = await supabaseClient
      .from("saved_links")
      .select("id, title, url, platform, notes, tags, ai_tags, summary, og_description, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching links:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch links" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!links || links.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "You haven't saved any links yet. Start by saving some links and I'll be able to help you find them!",
          matchedIds: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const linksContext = links
      .map(
        (l, i) =>
          `[${i + 1}] ID:${l.id} | "${l.title}" | ${l.platform} | Tags: ${[
            ...(l.tags || []),
            ...(l.ai_tags || []),
          ].join(", ")} | ${l.summary || l.og_description || l.notes || ""} | ${l.url} | Saved: ${l.created_at}`
      )
      .join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are a helpful search assistant for a link-saving app called Firestore. The user has saved links listed below. Answer their question naturally, referencing specific saved links when relevant. If they're looking for something, identify the matching links by their IDs.

User's saved links:
${linksContext}`,
            },
            { role: "user", content: query },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "search_results",
                description: "Return search results with answer and matched link IDs",
                parameters: {
                  type: "object",
                  properties: {
                    answer: {
                      type: "string",
                      description: "Natural language answer to the user's query",
                    },
                    matched_ids: {
                      type: "array",
                      items: { type: "string" },
                      description: "IDs of matching saved links",
                    },
                  },
                  required: ["answer", "matched_ids"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "search_results" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: "AI search failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let answer = "I couldn't find anything matching your query.";
    let matchedIds: string[] = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      answer = parsed.answer || answer;
      matchedIds = parsed.matched_ids || [];
    }

    console.log(`AI search result: ${matchedIds.length} matches`);

    return new Response(JSON.stringify({ answer, matchedIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
