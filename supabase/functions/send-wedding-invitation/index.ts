import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Simple fetch-based email sending
const RESEND_API_URL = "https://api.resend.com/emails";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  weddingId: string;
  inviterName: string;
  weddingNames: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { email, role, weddingId, inviterName, weddingNames }: InvitationRequest = await req.json();

    console.log("Processing invitation:", { email, role, weddingId });

    // Validate input
    if (!email || !role || !weddingId) {
      throw new Error("Missing required fields");
    }

    // Check if user is a collaborator on this wedding
    const { data: collaborator, error: collabError } = await supabase
      .from("wedding_collaborators")
      .select("id")
      .eq("wedding_id", weddingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (collabError || !collaborator) {
      throw new Error("Not authorized to send invitations for this wedding");
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from("wedding_invitations")
      .insert({
        wedding_id: weddingId,
        email: email.toLowerCase().trim(),
        role: role,
        invited_by: user.id,
        invitation_token: invitationToken,
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      throw new Error("Failed to create invitation");
    }

    console.log("Invitation created:", invitation.id);

    // Create invitation URL
    const invitationUrl = `${Deno.env.get("SUPABASE_URL")?.replace("/v1", "")}/auth/v1/verify?token=${invitationToken}&type=wedding_invitation&redirect_to=${encodeURIComponent(
      `${req.headers.get("origin")}/dashboard?invitation=${invitationToken}`
    )}`;

    // Role names in Portuguese
    const roleNames: Record<string, string> = {
      noivo: "Noivo",
      noiva: "Noiva",
      colaborador: "Colaborador",
      celebrante: "Celebrante",
      padrinho: "Padrinho",
      madrinha: "Madrinha",
      convidado: "Convidado",
      fotografo: "Fotógrafo",
      organizador: "Organizador",
    };

    const roleName = roleNames[role] || role;

    // Send email using fetch
    const emailResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "WePlan <onboarding@resend.dev>",
        to: [email],
        subject: `Convite para colaborar no casamento ${weddingNames}`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              .info-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>💍 WePlan</h1>
              <p>Planejador de Casamento</p>
            </div>
            <div class="content">
              <h2>Olá! 👋</h2>
              <p><strong>${inviterName}</strong> convidou você para colaborar no planejamento do casamento <strong>${weddingNames}</strong>!</p>
              
              <div class="info-box">
                <p><strong>Seu papel:</strong> ${roleName}</p>
                <p>Você poderá ajudar no planejamento, gerenciar convidados, orçamento, tarefas e muito mais!</p>
              </div>

              <p>Para aceitar o convite e começar a colaborar:</p>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">
                  Aceitar Convite
                </a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Se você ainda não tem uma conta no WePlan, será solicitado que você crie uma ao clicar no botão acima.
              </p>

              <p style="color: #666; font-size: 14px;">
                Este convite expira em 7 dias.
              </p>
            </div>
            <div class="footer">
              <p>WePlan - Planeje o casamento dos seus sonhos</p>
              <p>Se você não esperava este email, pode ignorá-lo com segurança.</p>
            </div>
          </body>
        </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Email send failed:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true,
        invitationId: invitation.id,
        message: "Convite enviado com sucesso!" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-wedding-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send invitation",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
