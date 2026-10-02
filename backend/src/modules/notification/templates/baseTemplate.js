export const baseTemplate = ({ heading, bodyHtml, buttonText, buttonUrl }) => `
<div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
  <h1 style="color: #570D48; font-size: 22px; margin-bottom: 4px;">Shoply</h1>
  <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
  <h2 style="font-size: 18px; color: #111827;">${heading}</h2>
  <div style="font-size: 14px; color: #4B5563; line-height: 1.6;">${bodyHtml}</div>
  ${buttonText && buttonUrl
    ? `<a href="${buttonUrl}" style="display: inline-block; margin-top: 20px; background: #570D48; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">${buttonText}</a>
         <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px; word-break: break-all;">If the button doesn't work, copy this link: ${buttonUrl}</p>`
    : ""
  }
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0 12px;" />
  <p style="font-size: 12px; color: #9CA3AF;">© 2026 Shoply. This is an automated message, please don't reply.</p>
</div>`;
