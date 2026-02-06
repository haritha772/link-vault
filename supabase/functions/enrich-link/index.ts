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
    // Auth check
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

    const { url, linkId } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Enriching link: ${url} for user: ${user.id}`);

    // Step 1: Fetch the URL to get metadata
    let title = "";
    let ogImage = "";
    let ogDescription = "";
    let favicon = "";
    let pageContent = "";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Firestore/1.0; +https://firestore.app)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });

      if (response.ok) {
        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/si);
        title = titleMatch?.[1]?.trim() || "";

        // Extract OG image
        const ogImageMatch = html.match(
          /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/si
        ) || html.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/si
        );
        ogImage = ogImageMatch?.[1] || "";

        // Extract OG description
        const ogDescMatch = html.match(
          /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/si
        ) || html.match(
          /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/si
        ) || html.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/si
        ) || html.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/si
        );
        ogDescription = ogDescMatch?.[1] || "";

        // Extract favicon
        const faviconMatch = html.match(
          /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/si
        ) || html.match(
          /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/si
        );
        if (faviconMatch?.[1]) {
          favicon = faviconMatch[1];
          if (favicon.startsWith("/")) {
            const urlObj = new URL(url);
            favicon = `${urlObj.origin}${favicon}`;
          } else if (!favicon.startsWith("http")) {
            const urlObj = new URL(url);
            favicon = `${urlObj.origin}/${favicon}`;
          }
        } else {
          const urlObj = new URL(url);
          favicon = `${urlObj.origin}/favicon.ico`;
        }

        // Extract text content for AI (limit to first 3000 chars)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        pageContent = textContent.substring(0, 3000);
      }
    } catch (fetchError) {
      console.error("Error fetching URL:", fetchError);
    }

    // Step 2: Use AI to generate summary and tags
    let summary = "";
    let aiTags: string[] = [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && pageContent) {
      try {
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
                  content:
                    "You analyze web pages. Return a JSON object with: summary (1-2 sentence summary), tags (array of 3-5 relevant single-word tags). Only return valid JSON, nothing else.",
                },
                {
                  role: "user",
                  content: `URL: ${url}\nTitle: ${title}\nDescription: ${ogDescription}\nContent: ${pageContent}`,
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "analyze_page",
                    description: "Return analysis of the web page",
                    parameters: {
                      type: "object",
                      properties: {
                        summary: { type: "string", description: "1-2 sentence summary" },
                        tags: {
                          type: "array",
                          items: { type: "string" },
                          description: "3-5 relevant tags",
                        },
                      },
                      required: ["summary", "tags"],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "analyze_page" } },
            }),
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            const parsed = JSON.parse(toolCall.function.arguments);
            summary = parsed.summary || "";
            aiTags = parsed.tags || [];
          }
        } else {
          console.error("AI gateway error:", aiResponse.status);
        }
      } catch (aiError) {
        console.error("Error calling AI:", aiError);
      }
    }

    // Step 3: Update the saved link with enriched data
    if (linkId) {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const updateData: Record<string, unknown> = {};
      if (title) updateData.title = title;
      if (ogImage) updateData.og_image = ogImage;
      if (ogDescription) updateData.og_description = ogDescription;
      if (favicon) updateData.favicon = favicon;
      if (summary) updateData.summary = summary;
      if (aiTags.length > 0) updateData.ai_tags = aiTags;
      if (ogImage && !updateData.thumbnail) updateData.thumbnail = ogImage;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await adminClient
          .from("saved_links")
          .update(updateData)
          .eq("id", linkId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating link:", updateError);
        }
      }
    }

    const result = {
      title: title || undefined,
      og_image: ogImage || undefined,
      og_description: ogDescription || undefined,
      favicon: favicon || undefined,
      summary: summary || undefined,
      ai_tags: aiTags.length > 0 ? aiTags : undefined,
    };

    console.log("Enrichment complete:", JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("enrich-link error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
