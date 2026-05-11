import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", padding: 40, color: "#1a1a2e" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  company: { flex: 1 },
  companyName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1a1a2e", marginBottom: 2 },
  companyTagline: { fontSize: 9, color: "#6b7280" },
  invoiceInfo: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1a1a2e", marginBottom: 4 },
  invoiceRef: { fontSize: 9, color: "#6b7280" },
  invoiceDate: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  parties: { flexDirection: "row", gap: 40, marginBottom: 24 },
  party: { flex: 1 },
  partyLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyDetail: { fontSize: 9, color: "#374151", marginBottom: 1 },
  statusBadge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#fef3c7", borderRadius: 4 },
  statusText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#92400e", textTransform: "uppercase" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 2, marginBottom: 1 },
  tableRow: { flexDirection: "row", padding: "6 8", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tableRowAlt: { flexDirection: "row", padding: "6 8", backgroundColor: "#fafafa", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tdText: { fontSize: 9, color: "#1f2937" },
  colNum: { width: 24 },
  colProduct: { flex: 1 },
  colUnit: { width: 40 },
  colQty: { width: 44 },
  colPrice: { width: 70, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, paddingVertical: 5, borderTopWidth: 1.5, borderTopColor: "#1a1a2e", marginTop: 4 },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  paymentBox: { marginTop: 24, padding: 14, backgroundColor: "#f0fdf4", borderRadius: 4 },
  paymentLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#15803d", textTransform: "uppercase", marginBottom: 6 },
  paymentRow: { flexDirection: "row", marginBottom: 3 },
  paymentKey: { fontSize: 9, color: "#374151", width: 100 },
  paymentVal: { fontSize: 9, color: "#1f2937", fontFamily: "Helvetica-Bold" },
  notes: { marginTop: 16, padding: 12, backgroundColor: "#f9fafb", borderRadius: 4 },
  notesLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

function fmt(amount: number, currency = "USD") {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#f3f4f6", text: "#374151" },
  sent: { bg: "#fef3c7", text: "#92400e" },
  paid: { bg: "#d1fae5", text: "#065f46" },
};

export interface InvoiceLine {
  number: number;
  product_name: string;
  product_unit: string;
  quantity: number;
  unit_price: number;
  currency: string;
  line_total: number;
}

export interface InvoiceDocumentProps {
  invoiceId: string;
  orderId: string;
  issuedAt: string;
  dueAt: string;
  status: string;
  buyer: { name: string; company: string; email: string; address?: string | null };
  lines: InvoiceLine[];
  notes?: string | null;
  currency?: string;
}

export function InvoiceDocument({ invoiceId, orderId, issuedAt, dueAt, status, buyer, lines, notes, currency = "USD" }: InvoiceDocumentProps) {
  const total = lines.reduce((s, l) => s + l.line_total, 0);
  const refNo = `INV-${invoiceId.slice(0, 8).toUpperCase()}`;
  const orderRef = `ORD-${orderId.slice(0, 8).toUpperCase()}`;
  const statusColors = STATUS_COLORS[status] ?? STATUS_COLORS.draft;

  return (
    <Document title={`${refNo} — ProcureX Invoice`} author="ProcureX">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.company}>
            <Text style={styles.companyName}>ProcureX</Text>
            <Text style={styles.companyTagline}>Procurement Management Platform</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceRef}>{refNo}</Text>
            <Text style={styles.invoiceDate}>Order: {orderRef}</Text>
            <Text style={styles.invoiceDate}>Issued: {fmtDate(issuedAt)}</Text>
            <Text style={styles.invoiceDate}>Due: {fmtDate(dueAt)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, marginTop: 6 }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>{status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{buyer.name}</Text>
            <Text style={styles.partyDetail}>{buyer.company}</Text>
            <Text style={styles.partyDetail}>{buyer.email}</Text>
            {buyer.address && <Text style={styles.partyDetail}>{buyer.address}</Text>}
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Issued By</Text>
            <Text style={styles.partyName}>ProcureX</Text>
            <Text style={styles.partyDetail}>Procurement Management Platform</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colNum]}>#</Text>
          <Text style={[styles.thText, styles.colProduct]}>Description</Text>
          <Text style={[styles.thText, styles.colUnit]}>Unit</Text>
          <Text style={[styles.thText, styles.colQty]}>Qty</Text>
          <Text style={[styles.thText, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.thText, styles.colTotal]}>Amount</Text>
        </View>
        {lines.map((line, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tdText, styles.colNum]}>{line.number}</Text>
            <Text style={[styles.tdText, styles.colProduct]}>{line.product_name}</Text>
            <Text style={[styles.tdText, styles.colUnit]}>{line.product_unit}</Text>
            <Text style={[styles.tdText, styles.colQty]}>{Number(line.quantity).toLocaleString()}</Text>
            <Text style={[styles.tdText, styles.colPrice]}>{fmt(line.unit_price, line.currency)}</Text>
            <Text style={[styles.tdText, styles.colTotal]}>{fmt(line.line_total, line.currency)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totals}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>Total Due</Text>
            <Text style={styles.grandValue}>{fmt(total, currency)}</Text>
          </View>
        </View>

        {/* Payment details */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentLabel}>Payment Instructions</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentKey}>Reference:</Text>
            <Text style={styles.paymentVal}>{refNo}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentKey}>Due date:</Text>
            <Text style={styles.paymentVal}>{fmtDate(dueAt)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentKey}>Amount:</Text>
            <Text style={styles.paymentVal}>{fmt(total, currency)}</Text>
          </View>
        </View>

        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ProcureX · Confidential</Text>
          <Text style={styles.footerText}>{refNo}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
