import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// Mock the resend module — Resend must be a proper constructor
const mockSend = vi.fn().mockResolvedValue({ id: "mock-email-id" });

vi.mock("resend", () => ({
  Resend: function Resend(this: unknown) {
    return { emails: { send: mockSend } };
  },
}));

process.env.RESEND_API_KEY = "test-key";

let sendSubPOEmail: typeof import("@/lib/email").sendSubPOEmail;

beforeAll(async () => {
  const mod = await import("@/lib/email");
  sendSubPOEmail = mod.sendSubPOEmail;
});

const BASE_DATA = {
  supplierEmail: "supplier@example.com",
  supplierName: "Test Supplier",
  subpoRef: "PO-ABCD1234",
  orderRef: "ORD-EFGH5678",
  lines: [
    { product_name: "Widget A", quantity: 100, unit: "kg", unit_price: 5.0, currency: "USD", line_total: 500.0 },
  ],
  total: 500.0,
  currency: "USD",
};

describe("sendSubPOEmail", () => {
  beforeEach(() => { mockSend.mockClear(); });

  it("sends email without attachments when no pdfAttachment provided", async () => {
    await sendSubPOEmail(BASE_DATA);
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0];
    expect(call.attachments).toBeUndefined();
    expect(call.to).toBe("supplier@example.com");
    expect(call.subject).toContain("PO-ABCD1234");
  });

  it("includes PDF attachment when pdfAttachment buffer is provided", async () => {
    const fakeBuffer = Buffer.from("%PDF-mock-content");
    await sendSubPOEmail({ ...BASE_DATA, pdfAttachment: fakeBuffer });
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0];
    expect(call.attachments).toBeDefined();
    expect(call.attachments).toHaveLength(1);
    expect(call.attachments[0].filename).toBe("PO-ABCD1234.pdf");
    expect(call.attachments[0].content).toBe(fakeBuffer);
  });

  it("includes a PDF note in HTML body when pdfAttachment is provided", async () => {
    const fakeBuffer = Buffer.from("%PDF-mock");
    await sendSubPOEmail({ ...BASE_DATA, pdfAttachment: fakeBuffer });
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).toContain("PDF copy of this purchase order is attached");
  });

  it("does not include PDF note in HTML when no pdfAttachment", async () => {
    await sendSubPOEmail(BASE_DATA);
    const html = mockSend.mock.calls[0][0].html as string;
    expect(html).not.toContain("PDF copy of this purchase order is attached");
  });
});
