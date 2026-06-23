import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@^13.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      if (metadata && metadata.userId && metadata.amount) {
        const userId = metadata.userId;
        const customerId = session.customer;
        // Strip commas and parse
        const addedCredits = parseInt(metadata.amount.replace(/,/g, ""), 10);

        // Connect using SERVICE ROLE to bypass RLS and update credits directly
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch current credits
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        const newCredits = (profile.credits || 0) + addedCredits;

        // Update credits and customer ID
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            credits: newCredits,
            stripe_customer_id: customerId
          })
          .eq("id", userId);

        if (updateError) {
          throw updateError;
        }

        console.log(`Successfully added ${addedCredits} credits to user ${userId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
