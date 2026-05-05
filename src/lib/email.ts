import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "TradingGex <onboarding@resend.dev>";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tradinggexjournal.com").replace(/\/$/, "");

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${SITE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recupera tu contraseña — TradingGex Journal",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;max-width:480px;width:100%;">
        <tr>
          <td style="padding:32px 32px 24px;border-bottom:1px solid #2a2a2a;">
            <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
              TradingG<span style="color:#a855f7;">ex</span>
            </div>
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#666;margin-top:2px;">Journal</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Recupera tu contraseña</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#888;line-height:1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta.
              El enlace es válido por <strong style="color:#aaa;">1 hora</strong>.
            </p>
            <a href="${url}"
               style="display:inline-block;background:#a855f7;color:#ffffff;font-size:14px;font-weight:600;
                      text-decoration:none;padding:12px 28px;border-radius:10px;letter-spacing:0.2px;">
              Restablecer contraseña
            </a>
            <p style="margin:24px 0 0;font-size:12px;color:#555;line-height:1.6;">
              Si no solicitaste esto, puedes ignorar este correo. Tu contraseña no cambiará.
            </p>
            <p style="margin:16px 0 0;font-size:11px;color:#444;word-break:break-all;">
              Si el botón no funciona, copia este enlace en tu navegador:<br>
              <span style="color:#a855f7;">${url}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#444;">TradingGex Journal · Este es un correo automático, no respondas.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
