import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "TradingGex Journal <onboarding@resend.dev>";
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tradinggexjournal.com").replace(/\/$/, "");

function buildWelcomeHtml(name: string | null): string {
  const firstName = name?.split(" ")[0]?.trim() || "Trader";
  const APP = SITE_URL;

  const checkRow = (text: string) =>
    `<tr>
      <td width="28" style="padding:4px 0;vertical-align:top;">
        <div style="width:20px;height:20px;background:#7c3aed;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#ffffff;">✓</div>
      </td>
      <td style="padding:4px 0 4px 2px;font-size:13px;color:#cccccc;line-height:1.5;">${text}</td>
    </tr>`;

  const featuresEn = [
    "Trade logging with automatic P&L &amp; fee calculation",
    "Multi-market support: CME, Crypto Futures, Forex, Generic",
    "Performance dashboard with equity curve chart",
    "Setup &amp; strategy analysis with R-multiple tracking",
    "Trading journal with emotional state logging",
    "Analytics: win rate, profit factor, max drawdown, Sharpe",
    "Monthly calendar heatmap of your trading history",
  ].map(checkRow).join("");

  const featuresEs = [
    "Registro de trades con cálculo automático de P&L y comisiones",
    "Soporte multi-mercado: CME, Cripto Futuros, Forex, Genérico",
    "Dashboard de rendimiento con gráfica de curva de capital",
    "Análisis de setups y estrategias con seguimiento de R-múltiple",
    "Diario de trading con registro de estado emocional",
    "Analíticas: win rate, profit factor, max drawdown, Sharpe",
    "Mapa de calor mensual de tu historial de operaciones",
  ].map(checkRow).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Welcome to TradingGex Journal</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;width:100%;background-color:#141414;border-radius:20px;border:1px solid #262626;overflow:hidden;">

        <!-- ── HEADER ── -->
        <tr>
          <td style="padding:36px 36px 28px;background:linear-gradient(145deg,#1e0a3c 0%,#141414 55%);border-bottom:1px solid #262626;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1;">
                    TradingG<span style="color:#a855f7;">ex</span>
                  </div>
                  <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#555555;margin-top:3px;">Journal</div>
                </td>
                <td align="right" style="padding-left:16px;">
                  <div style="font-size:11px;font-weight:600;color:#a855f7;background:#2a0a4a;border:1px solid #5b21b6;border-radius:20px;padding:4px 12px;letter-spacing:0.5px;white-space:nowrap;">
                    3-Day Free Trial
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── ENGLISH SECTION ── -->
        <tr>
          <td style="padding:36px 36px 0;">
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              Welcome, ${firstName}! 🎉
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.65;">
              Your <strong style="color:#c084fc;">3-day free trial</strong> has started. You now have
              full access to every TradingGex Journal feature — no credit card required.
            </p>

            <div style="background:#0f0f0f;border-radius:14px;border:1px solid #1f1f1f;padding:22px 24px;margin-bottom:28px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:2px;">
                Everything included in your trial
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${featuresEn}
              </table>
            </div>

            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <a href="${APP}"
                     style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:700;
                            text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.2px;">
                    Start my trading journal →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding:32px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid #262626;"></td>
                <td style="padding:0 16px;white-space:nowrap;font-size:11px;color:#444444;text-transform:uppercase;letter-spacing:2px;">
                  Español
                </td>
                <td style="border-top:1px solid #262626;"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── SPANISH SECTION ── -->
        <tr>
          <td style="padding:0 36px 0;">
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              ¡Bienvenido, ${firstName}! 🎉
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.65;">
              Tu <strong style="color:#c084fc;">prueba gratuita de 3 días</strong> ha comenzado. Tienes
              acceso completo a todas las funciones de TradingGex Journal — sin necesidad de tarjeta de crédito.
            </p>

            <div style="background:#0f0f0f;border-radius:14px;border:1px solid #1f1f1f;padding:22px 24px;margin-bottom:28px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:2px;">
                Todo incluido en tu prueba
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${featuresEs}
              </table>
            </div>

            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <a href="${APP}"
                     style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:700;
                            text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.2px;">
                    Comenzar mi diario de trading →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── PRICING BOX ── -->
        <tr>
          <td style="padding:32px 36px 0;">
            <div style="background:linear-gradient(135deg,#1e0a3c 0%,#0f0f0f 100%);border-radius:14px;border:1px solid #3b1a6b;padding:24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#a855f7;text-transform:uppercase;letter-spacing:2px;">
                After your trial · Después de tu prueba
              </p>
              <p style="margin:0 0 12px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                $19.99<span style="font-size:14px;font-weight:400;color:#777777;">/month</span>
              </p>
              <p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">
                Your trial ends in <strong style="color:#c084fc;">3 days</strong>. After that, continue with a
                simple monthly plan — cancel any time.<br>
                <span style="color:#666666;">
                  Tu prueba termina en <strong style="color:#c084fc;">3 días</strong>. Después, continúa con un plan mensual simple — cancela cuando quieras.
                </span>
              </p>
            </div>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:28px 36px;border-top:1px solid #1e1e1e;margin-top:32px;">
            <p style="margin:0 0 8px;font-size:12px;color:#444444;line-height:1.6;">
              <strong style="color:#555555;">TradingGex Journal</strong> ·
              <a href="${APP}" style="color:#7c3aed;text-decoration:none;">tradinggexjournal.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#333333;line-height:1.6;">
              This is an automated email — please do not reply. ·
              Este es un correo automático, por favor no respondas.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, name: string | null): Promise<void> {
  const firstName = name?.split(" ")[0]?.trim() || "Trader";
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Welcome to TradingGex Journal, ${firstName}! 🎉 / ¡Bienvenido, ${firstName}!`,
      html: buildWelcomeHtml(name),
    });
  } catch (err) {
    // Never block registration if email fails
    console.error("[sendWelcomeEmail]", err);
  }
}

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
