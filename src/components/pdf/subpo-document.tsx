import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", padding: 40, color: "#1a1a2e" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  company: { flex: 1 },
  companyName: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyTagline: { fontSize: 9, color: "#6b7280" },
  poInfo: { alignItems: "flex-end" },
  poTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  poRef: { fontSize: 9, color: "#6b7280" },
  poDate: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  parties: { flexDirection: "row", gap: 40, marginBottom: 24 },
  party: { flex: 1 },
  partyLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyDetail: { fontSize: 9, color: "#374151", marginBottom: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 2, marginBottom: 1 },
  tableRow: { flexDirection: "row", padding: "6 8", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tableRowAlt: { flexDirection: "row", padding: "6 8", backgroundColor: "#fafafa", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  tdText: { fontSize: 9, color: "#1f2937" },
  colNum: { width: 24 },
  colProduct: { flex: 1 },
  colUnit: { width: 40 },
  colQty: { width: 50, textAlign: "right" },
  colPrice: { width: 70, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, paddingVertical: 5, borderTopWidth: 1, borderTopColor: "#1a1a2e", marginTop: 4 },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  notes: { marginTop: 20, padding: 12, backgroundColor: "#f9fafb", borderRadius: 4 },
  notesLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

function fmt(amount: number, currency = "USD") {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export interface SubPOLine {
  number: number;
  product_name: string;
  product_unit: string;
  quantity: number;
  unit_price: number;
  currency: string;
  line_total: number;
}

export interface SubPODocumentProps {
  subpoId: string;
  orderId: string;
  createdAt: string;
  supplier: { name: string; email: string; country: string };
  deliveryAddress?: string | null;
  lines: SubPOLine[];
  notes?: string | null;
}

export function SubPODocument({ subpoId, orderId, createdAt, supplier, deliveryAddress, lines, notes }: SubPODocumentProps) {
  const total = lines.reduce((s, l) => s + l.line_total, 0);
  const currency = lines[0]?.currency ?? "USD";
  const poRef = `PO-${subpoId.slice(0, 8).toUpperCase()}`;
  const orderRef = `ORD-${orderId.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`${poRef} — ProcureX Purchase Order`} author="ProcureX">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.company}>
            <Text style={styles.companyName}>ProcureX</Text>
            <Text style={styles.companyTagline}>Procurement Management Platform</Text>
          </View>
          <View style={styles.poInfo}>
            <Text style={styles.poTitle}>PURCHASE ORDER</Text>
            <Text style={styles.poRef}>{poRef}</Text>
            <Text style={styles.poDate}>Order Ref: {orderRef}</Text>
            <Text style={styles.poDate}>Date: {fmtDate(createdAt)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>ProcureX</Text>
            <Text style={styles.partyDetail}>orders@procurex.com</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>To (Supplier)</Text>
            <Text style={styles.partyName}>{supplier.name}</Text>
            <Text style={styles.partyDetail}>{supplier.email}</Text>
            <Text style={styles.partyDetail}>{supplier.country}</Text>
          </View>
          {deliveryAddress && (
            <View style={styles.party}>
              <Text style={styles.partyLabel}>Delivery Address</Text>
              <Text style={styles.partyDetail}>{deliveryAddress}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colNum]}>#</Text>
          <Text style={[styles.thText, styles.colProduct]}>Product</Text>
          <Text style={[styles.thText, styles.colUnit]}>Unit</Text>
          <Text style={[styles.thText, styles.colQty]}>Qty</Text>
          <Text style={[styles.thText, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.thText, styles.colTotal]}>Total</Text>
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

        <View style={styles.totals}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{fmt(total, currency)}</Text>
          </View>
        </View>

        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Instructions</Text>
          <Text style={styles.notesText}>Please confirm receipt of this purchase order by replying to orders@procurex.com. Include your expected dispatch date and tracking details once dispatched.</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ProcureX · Confidential</Text>
          <Text style={styles.footerText}>{poRef}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
