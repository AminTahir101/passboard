import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(
  to: string,
  name: string | null,
  title: { en: string; ar: string },
  body: { en: string; ar: string }
): Promise<void> {
  const greeting = name ? `Hi ${name},` : 'Hi,'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <p style="margin-bottom:16px">${greeting}</p>
  <h2 style="font-size:20px;margin-bottom:8px">${title.en}</h2>
  <p style="margin-bottom:24px">${body.en}</p>
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />
  <p dir="rtl" style="text-align:right;margin-bottom:4px;font-size:18px">${title.ar}</p>
  <p dir="rtl" style="text-align:right">${body.ar}</p>
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />
  <p style="font-size:12px;color:#888">Passboard &mdash; <a href="https://passboard.ai" style="color:#888">passboard.ai</a></p>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'Passboard <notifications@passboard.ai>',
    to,
    subject: `${title.en} / ${title.ar}`,
    html,
  })

  if (error) {
    console.error('[sendEmail] Resend error:', error.message)
  }
}
