import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", padding: 40, color: "#1a1a2e" },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  company: { flex: 1 },
  companyName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1a1a2e", marginBottom: 2 },
  companyTagline: { fontSize: 9, color: "#6b7280" },
  quoteInfo: { alignItems: "flex-end" },
  quoteTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1a1a2e", marginBottom: 4 },
  quoteRef: { fontSize: 9, color: "#6b7280" },
  quoteDate: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  // Divider
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  // Parties
  parties: { flexDirection: "row", gap: 40, marginBottom: 24 },
  party: { flex: 1 },
  partyLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyDetail: { fontSize: 9, color: "#374151", marginBottom: 1 },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 2, marginBottom: 1 },
  tableRow: { flexDirection: "row", padding: "6 8", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tableRowAlt: { flexDirection: "row", padding: "6 8", backgroundColor: "#fafafa", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tdText: { fontSize: 9, color: "#1f2937" },
  tdMuted: { fontSize: 8, color: "#6b7280", marginTop: 1 },
  // Column widths
  colNum: { width: 24 },
  colProduct: { flex: 1 },
  colUnit: { width: 40 },
  colQty: { width: 44 },
  colPrice: { width: 70, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  // Totals
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 3 },
  totalLabel: { fontSize: 9, color: "#6b7280" },
  totalValue: { fontSize: 9, color: "#1f2937" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 5, borderTopWidth: 1, borderTopColor: "#1a1a2e", marginTop: 4 },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  // Notes
  notes: { marginTop: 24, padding: 12, backgroundColor: "#f9fafb", borderRadius: 4 },
  notesLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  // Footer
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerText: { fontSize: 8, color: "#9ca3af" },
  // Tier badge
  tier: { fontSize: 7, color: "#6b7280", fontFamily: "Helvetica-Bold", marginTop: 2 },
});

const TIER_LABELS: Record<string, string> = { tier_1: "PREMIUM", tier_2: "STANDARD", tier_3: "ECONOMY" };

function fmt(amount: number, currency = "USD") {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export interface QuoteLine {
  number: number;
  product_name: string;
  product_unit: string;
  quantity: number;
  buyer_unit_price: number;
  currency: string;
  quality_tier: string;
  line_total: number;
}

export interface QuoteDocumentProps {
  rfqId: string;
  createdAt: string;
  buyer: { name: string; company: string; email: string; address?: string | null };
  agent: { full_name: string; email: string };
  lines: QuoteLine[];
  notes?: string | null;
  validDays?: number;
}

export function QuoteDocument({ rfqId, createdAt, buyer, agent, lines, notes, validDays = 30 }: QuoteDocumentProps) {
  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  const currency = lines[0]?.currency ?? "USD";
  const refNo = `QUO-${rfqId.slice(0, 8).toUpperCase()}`;
  const validUntil = new Date(new Date(createdAt).getTime() + validDays * 86400000);

  return (
    <Document title={`${refNo} — ProcureX Quotation`} author="ProcureX">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.company}>
            <Text style={styles.companyName}>ProcureX</Text>
            <Text style={styles.companyTagline}>Procurement Management Platform</Text>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteTitle}>QUOTATION</Text>
            <Text style={styles.quoteRef}>{refNo}</Text>
            <Text style={styles.quoteDate}>Date: {fmtDate(createdAt)}</Text>
            <Text style={styles.quoteDate}>Valid until: {fmtDate(validUntil)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Prepared for</Text>
            <Text style={styles.partyName}>{buyer.name}</Text>
            <Text style={styles.partyDetail}>{buyer.company}</Text>
            <Text style={styles.partyDetail}>{buyer.email}</Text>
            {buyer.address && <Text style={styles.partyDetail}>{buyer.address}</Text>}
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Prepared by</Text>
            <Text style={styles.partyName}>ProcureX</Text>
            <Text style={styles.partyDetail}>Agent: {agent.full_name}</Text>
            <Text style={styles.partyDetail}>{agent.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colNum]}>#</Text>
          <Text style={[styles.thText, styles.colProduct]}>Product</Text>
          <Text style={[styles.thText, styles.colUnit]}>Unit</Text>
          <Text style={[styles.thText, styles.colQty]}>Qty</Text>
          <Text style={[styles.thText, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.thText, styles.colTotal]}>Total</Text>
        </View>

        {/* Line items */}
        {lines.map((line, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tdText, styles.colNum]}>{line.number}</Text>
            <View style={styles.colProduct}>
              <Text style={styles.tdText}>{line.product_name}</Text>
              <Text style={styles.tier}>{TIER_LABELS[line.quality_tier] ?? line.quality_tier}</Text>
            </View>
            <Text style={[styles.tdText, styles.colUnit]}>{line.product_unit}</Text>
            <Text style={[styles.tdText, styles.colQty]}>{Number(line.quantity).toLocaleString()}</Text>
            <Text style={[styles.tdText, styles.colPrice]}>{fmt(line.buyer_unit_price, line.currency)}</Text>
            <Text style={[styles.tdText, styles.colTotal]}>{fmt(line.line_total, line.currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{fmt(subtotal, currency)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Terms */}
        <View style={[styles.notes, { marginTop: 12 }]}>
          <Text style={styles.notesLabel}>Terms & Conditions</Text>
          <Text style={styles.notesText}>
            This quotation is valid for {validDays} days from the date of issue. Prices are subject to change after the validity period. All prices are exclusive of applicable taxes and duties unless stated otherwise. Payment terms as per agreed contract.
          </Text>
        </View>

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
