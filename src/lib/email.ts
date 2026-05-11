import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface SubPOEmailData {
  supplierEmail: string;
  supplierName: string;
  subpoRef: string;
  orderRef: string;
  lines: { product_name: string; quantity: number; unit: string; unit_price: number; currency: string; line_total: number }[];
  total: number;
  currency: string;
  deliveryAddress?: string | null;
  notes?: string | null;
}

export async function sendSubPOEmail(data: SubPOEmailData) {
  if (!resend) {
    console.log(`[Email skipped — no RESEND_API_KEY] SubPO ${data.subpoRef} to ${data.supplierEmail}`);
    return { skipped: true };
  }

  const linesHtml = data.lines.map((l, i) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:8px 12px;color:#374151;">${i + 1}</td>
      <td style="padding:8px 12px;color:#374151;">${l.product_name}</td>
      <td style="padding:8px 12px;color:#374151;">${l.unit}</td>
      <td style="padding:8px 12px;color:#374151;text-align:right;">${l.quantity.toLocaleString()}</td>
      <td style="padding:8px 12px;color:#374151;text-align:right;">${l.currency} ${l.unit_price.toFixed(2)}</td>
      <td style="padding:8px 12px;font-weight:600;text-align:right;">${l.currency} ${l.line_total.toFixed(2)}</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;color:#1a1a2e;max-width:640px;margin:0 auto;padding:32px 16px;">
  <div style="margin-bottom:24px;">
    <h1 style="font-size:22px;font-weight:700;margin:0;">ProcureX</h1>
    <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">Purchase Order</p>
  </div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;">
  <p>Dear <strong>${data.supplierName}</strong>,</p>
  <p>Please find below your purchase order from ProcureX. Kindly confirm receipt and advise on your expected dispatch date.</p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0;">
    <tr style="background:#f3f4f6;">
      <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">PO Reference</td>
      <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">Order Reference</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-weight:600;">${data.subpoRef}</td>
      <td style="padding:8px 12px;font-weight:600;">${data.orderRef}</td>
    </tr>
  </table>
  <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">#</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Product</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Unit</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Qty</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Unit Price</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Total</th>
      </tr>
    </thead>
    <tbody>${linesHtml}</tbody>
    <tfoot>
      <tr style="border-top:2px solid #1a1a2e;">
        <td colspan="5" style="padding:10px 12px;font-weight:700;text-align:right;">Total</td>
        <td style="padding:10px 12px;font-weight:700;text-align:right;">${data.currency} ${data.total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  ${data.deliveryAddress ? `<p style="font-size:13px;color:#374151;"><strong>Delivery address:</strong> ${data.deliveryAddress}</p>` : ""}
  ${data.notes ? `<p style="font-size:13px;color:#374151;background:#f9fafb;padding:12px;border-radius:4px;"><strong>Notes:</strong> ${data.notes}</p>` : ""}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:12px;color:#9ca3af;">ProcureX · This is an automated purchase order. Please reply to this email to acknowledge.</p>
</body>
</html>`;

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "orders@procurex.com",
    to: data.supplierEmail,
    subject: `Purchase Order ${data.subpoRef} from ProcureX`,
    html,
  });

  return result;
}
