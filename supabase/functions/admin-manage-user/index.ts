import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, target_user_id } = body;

    if (!target_user_id) {
      return new Response(JSON.stringify({ error: "target_user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent admin from deleting themselves
    if (action === "delete" && target_user_id === user.id) {
      return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "delete": {
        const { error: dataError } = await userClient.rpc("admin_delete_user_data", {
          _target_user_id: target_user_id,
        });

        if (dataError) {
          console.error("Error deleting user data:", dataError);
          return new Response(JSON.stringify({ error: "Failed to delete user data", details: dataError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(target_user_id);

        if (authDeleteError) {
          console.error("Error deleting auth user:", authDeleteError);
          return new Response(JSON.stringify({ error: "Failed to delete auth user", details: authDeleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, action: "deleted" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "ban": {
        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "876600h",
        });

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to ban user", details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, action: "banned" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "unban": {
        const { error } = await adminClient.auth.admin.updateUserById(target_user_id, {
          ban_duration: "none",
        });

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to unban user", details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true, action: "unbanned" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_email": {
        const { new_email } = body;
        if (!new_email) {
          return new Response(JSON.stringify({ error: "new_email is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update email in auth
        const { error: emailError } = await adminClient.auth.admin.updateUserById(target_user_id, {
          email: new_email,
          email_confirm: true,
        });

        if (emailError) {
          return new Response(JSON.stringify({ error: "Failed to update email", details: emailError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Also update email in profiles table
        await adminClient
          .from("profiles")
          .update({ email: new_email })
          .eq("user_id", target_user_id);

        return new Response(JSON.stringify({ success: true, action: "email_updated", new_email }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "generate_reset_link": {
        // Get the user's email first
        const { data: targetUser, error: getUserError } = await adminClient.auth.admin.getUserById(target_user_id);

        if (getUserError || !targetUser?.user?.email) {
          return new Response(JSON.stringify({ error: "Failed to get user email", details: getUserError?.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: "recovery",
          email: targetUser.user.email,
          options: {
            redirectTo: `${req.headers.get("origin") || "https://wedingeasy.lovable.app"}/auth`,
          },
        });

        if (linkError) {
          return new Response(JSON.stringify({ error: "Failed to generate reset link", details: linkError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // The generated link contains the token - extract it to build the proper URL
        const actionLink = linkData?.properties?.action_link || "";

        return new Response(JSON.stringify({ 
          success: true, 
          action: "reset_link_generated",
          reset_link: actionLink,
          email: targetUser.user.email,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action. Use: delete, ban, unban, update_email, generate_reset_link" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
