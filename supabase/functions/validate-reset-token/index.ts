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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action, token, email, new_password } = body;

    if (!token) {
      return new Response(JSON.stringify({ error: "Token é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: validate - check if token is valid (before showing reset form)
    if (action === "validate") {
      const { data: tokenData, error: tokenError } = await adminClient
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .single();

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ error: "Token inválido ou já utilizado" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check expiry
      if (new Date(tokenData.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Token expirado. Solicite um novo link ao suporte." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Return masked email for display (show first 2 chars + domain)
      const emailParts = tokenData.email.split("@");
      const maskedEmail = emailParts[0].substring(0, 2) + "***@" + emailParts[1];

      return new Response(JSON.stringify({ 
        valid: true, 
        masked_email: maskedEmail,
        expires_at: tokenData.expires_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: reset - verify email + reset password
    if (action === "reset") {
      if (!email || !new_password) {
        return new Response(JSON.stringify({ error: "Email e nova senha são obrigatórios" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new_password.length < 6) {
        return new Response(JSON.stringify({ error: "A senha deve ter pelo menos 6 caracteres" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch and validate token
      const { data: tokenData, error: tokenError } = await adminClient
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .single();

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ error: "Token inválido ou já utilizado" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Token expirado. Solicite um novo link ao suporte." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify email matches (second security factor)
      if (email.toLowerCase().trim() !== tokenData.email.toLowerCase().trim()) {
        return new Response(JSON.stringify({ error: "O email inserido não corresponde à conta associada" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Reset the password using admin API
      const { error: updateError } = await adminClient.auth.admin.updateUserById(tokenData.user_id, {
        password: new_password,
      });

      if (updateError) {
        return new Response(JSON.stringify({ error: "Erro ao redefinir senha", details: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark token as used
      await adminClient
        .from("password_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenData.id);

      // Get wedding_id for notification
      const { data: weddingData } = await adminClient
        .rpc("get_wedding_id_from_user", { _user_id: tokenData.user_id });

      // Create security notification
      if (weddingData) {
        await adminClient.from("notifications").insert({
          user_id: tokenData.user_id,
          wedding_id: weddingData,
          title: "⚠️ Senha redefinida",
          message: "A sua senha foi redefinida com sucesso. Se não foi você que solicitou esta alteração, entre em contacto com o suporte IMEDIATAMENTE para proteger a sua conta.",
          type: "security",
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: "Senha redefinida com sucesso",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: report_unauthorized - user reports they didn't request reset
    if (action === "report_unauthorized") {
      if (!email) {
        return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find the user by email
      const { data: userData } = await adminClient.auth.admin.listUsers();
      const targetUser = userData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase().trim()
      );

      if (!targetUser) {
        // Don't reveal if user exists or not
        return new Response(JSON.stringify({ success: true, message: "Reportado com sucesso" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Suspend the user immediately for protection
      await adminClient
        .from("profiles")
        .update({
          status: "suspended",
          status_reason: "Conta suspensa automaticamente - utilizador reportou redefinição de senha não autorizada",
          status_changed_at: new Date().toISOString(),
        })
        .eq("user_id", targetUser.id);

      // Get wedding_id for admin notification
      const { data: weddingData } = await adminClient
        .rpc("get_wedding_id_from_user", { _user_id: targetUser.id });

      // Create admin support notification - find all admin users
      const { data: adminRoles } = await adminClient
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles) {
        for (const admin of adminRoles) {
          // Get admin's wedding_id for notification
          const { data: adminWeddingId } = await adminClient
            .rpc("get_wedding_id_from_user", { _user_id: admin.user_id });

          if (adminWeddingId) {
            await adminClient.from("notifications").insert({
              user_id: admin.user_id,
              wedding_id: adminWeddingId,
              title: "🚨 ALERTA: Redefinição de senha não autorizada",
              message: `O utilizador ${email} reportou uma redefinição de senha que NÃO solicitou. A conta foi SUSPENSA automaticamente. Verifique e tome as devidas providências.`,
              type: "security",
            });
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Conta suspensa por segurança. A equipa de suporte foi notificada.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
