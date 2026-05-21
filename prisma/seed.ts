/**
 * Demo seed — realistic procurement agency data for UI design review.
 * Run: npm run seed   (or: npx tsx prisma/seed.ts)
 */

import { config } from "dotenv";
// Load .env from the project root (npm always sets cwd to package.json dir)
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── helpers ──────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding demo data…");

  // ── 1. Clear existing data (order matters for FK constraints) ────────────────
  await prisma.commission.deleteMany();
  await prisma.qASurvey.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subPOLineItem.deleteMany();
  await prisma.subPO.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rFQLineItem.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.userProfile.deleteMany();
  console.log("  ✓ Cleared existing data");

  // ── 2. UserProfile + Agent ────────────────────────────────────────────────────
  const agentUserId = uuid();
  await prisma.userProfile.create({
    data: { id: agentUserId, email: "agent@procurex.com", role: "super_admin" },
  });
  const agent = await prisma.agent.create({
    data: {
      user_id: agentUserId,
      full_name: "Karim El-Masri",
      email: "agent@procurex.com",
      commission_rate: 12,
      total_earned: 0,
      status: "active",
    },
  });
  console.log("  ✓ Agent:", agent.full_name);

  // ── 3. Categories & Subcategories & Products ──────────────────────────────────
  const catBeverages = await prisma.category.create({
    data: { name: "Beverages", name_ar: "مشروبات", margin_pct: 14 },
  });
  const catDairy = await prisma.category.create({
    data: { name: "Dairy & Eggs", name_ar: "ألبان وبيض", margin_pct: 12 },
  });
  const catMeat = await prisma.category.create({
    data: { name: "Meat & Poultry", name_ar: "لحوم ودواجن", margin_pct: 15 },
  });
  const catGrains = await prisma.category.create({
    data: { name: "Grains & Bakery", name_ar: "حبوب ومخبوزات", margin_pct: 10 },
  });
  const catProduce = await prisma.category.create({
    data: { name: "Fresh Produce", name_ar: "منتجات طازجة", margin_pct: 13 },
  });

  // Subcategories
  const subJuices   = await prisma.subcategory.create({ data: { category_id: catBeverages.id, name: "Juices & Nectars", name_ar: "عصائر ونكتار" } });
  const subWater    = await prisma.subcategory.create({ data: { category_id: catBeverages.id, name: "Water & Sparkling", name_ar: "مياه وغازية" } });
  const subCheese   = await prisma.subcategory.create({ data: { category_id: catDairy.id,     name: "Cheese",            name_ar: "جبن" } });
  const subYogurt   = await prisma.subcategory.create({ data: { category_id: catDairy.id,     name: "Yogurt & Cream",    name_ar: "زبادي وقشدة" } });
  const subChicken  = await prisma.subcategory.create({ data: { category_id: catMeat.id,      name: "Chicken",           name_ar: "دجاج" } });
  const subLamb     = await prisma.subcategory.create({ data: { category_id: catMeat.id,      name: "Lamb & Beef",       name_ar: "خروف ولحم بقر" } });
  const subRice     = await prisma.subcategory.create({ data: { category_id: catGrains.id,    name: "Rice & Grains",     name_ar: "أرز وحبوب" } });
  const subBread    = await prisma.subcategory.create({ data: { category_id: catGrains.id,    name: "Bread & Pastries",  name_ar: "خبز ومعجنات" } });
  const subVeg      = await prisma.subcategory.create({ data: { category_id: catProduce.id,   name: "Vegetables",        name_ar: "خضروات" } });
  const subFruits   = await prisma.subcategory.create({ data: { category_id: catProduce.id,   name: "Fruits",            name_ar: "فواكه" } });

  // Products
  const pOrangeJuice = await prisma.product.create({ data: { subcategory_id: subJuices.id,  name: "Orange Juice 1L",         name_ar: "عصير برتقال ١ لتر",       unit: "carton" } });
  const pAppleJuice  = await prisma.product.create({ data: { subcategory_id: subJuices.id,  name: "Apple Juice 1L",          name_ar: "عصير تفاح ١ لتر",         unit: "carton" } });
  const pWater500    = await prisma.product.create({ data: { subcategory_id: subWater.id,   name: "Mineral Water 500ml",     name_ar: "مياه معدنية ٥٠٠ مل",      unit: "case" } });
  const pWater1500   = await prisma.product.create({ data: { subcategory_id: subWater.id,   name: "Mineral Water 1.5L",      name_ar: "مياه معدنية ١.٥ لتر",     unit: "case" } });
  const pCheddar     = await prisma.product.create({ data: { subcategory_id: subCheese.id,  name: "Cheddar Cheese Block 1kg", name_ar: "جبن شيدر كتلة ١ كيلو",   unit: "kg" } });
  const pMozzarella  = await prisma.product.create({ data: { subcategory_id: subCheese.id,  name: "Mozzarella Ball 250g",    name_ar: "جبن موزاريلا ٢٥٠ غ",      unit: "pcs" } });
  const pYogurt      = await prisma.product.create({ data: { subcategory_id: subYogurt.id,  name: "Greek Yogurt 500g",       name_ar: "زبادي يوناني ٥٠٠ غ",      unit: "pcs" } });
  const pChickenB    = await prisma.product.create({ data: { subcategory_id: subChicken.id, name: "Chicken Breast Fillet",   name_ar: "صدر دجاج فيليه",          unit: "kg" } });
  const pChickenW    = await prisma.product.create({ data: { subcategory_id: subChicken.id, name: "Whole Chicken 1.2kg",     name_ar: "دجاجة كاملة ١.٢ كيلو",    unit: "pcs" } });
  const pLamb        = await prisma.product.create({ data: { subcategory_id: subLamb.id,    name: "Lamb Shoulder Bone-in",   name_ar: "كتف خروف بالعظم",         unit: "kg" } });
  const pBeefMince   = await prisma.product.create({ data: { subcategory_id: subLamb.id,    name: "Beef Mince 500g",         name_ar: "لحم بقر مفروم ٥٠٠ غ",     unit: "pcs" } });
  const pBasmati     = await prisma.product.create({ data: { subcategory_id: subRice.id,    name: "Basmati Rice 5kg",        name_ar: "أرز بسمتي ٥ كيلو",        unit: "bag" } });
  const pPitaBread   = await prisma.product.create({ data: { subcategory_id: subBread.id,   name: "Pita Bread Pack 10pcs",   name_ar: "خبز بيتا ١٠ قطع",         unit: "pack" } });
  const pTomatoes    = await prisma.product.create({ data: { subcategory_id: subVeg.id,     name: "Tomatoes (loose)",        name_ar: "طماطم",                   unit: "kg" } });
  const pCucumber    = await prisma.product.create({ data: { subcategory_id: subVeg.id,     name: "Cucumber",                name_ar: "خيار",                    unit: "kg" } });
  const pMango       = await prisma.product.create({ data: { subcategory_id: subFruits.id,  name: "Mango Alphonso 1kg",      name_ar: "مانجو ألفونسو ١ كيلو",    unit: "box" } });
  const pDates       = await prisma.product.create({ data: { subcategory_id: subFruits.id,  name: "Medjool Dates 500g",      name_ar: "تمر مجدول ٥٠٠ غ",         unit: "box" } });

  console.log("  ✓ Catalogue: 5 categories, 10 subcategories, 17 products");

  // ── 4. Suppliers ──────────────────────────────────────────────────────────────
  const supFresh = await prisma.supplier.create({
    data: { name: "Al-Noor Fresh Foods", email: "supply@alnoor.ae", phone: "+971 4 123 4567", country: "UAE", status: "active", quality_score: 8.7 },
  });
  const supGlobal = await prisma.supplier.create({
    data: { name: "Global Dairy Imports", email: "orders@globaldairy.com", phone: "+31 20 123 4567", country: "Netherlands", status: "active", quality_score: 9.1 },
  });
  const supMeat = await prisma.supplier.create({
    data: { name: "Gulf Premium Meats", email: "sales@gulfmeats.ae", phone: "+971 2 987 6543", country: "UAE", status: "active", quality_score: 8.4 },
  });
  const supGrain = await prisma.supplier.create({
    data: { name: "Indo-Pak Grains Co.", email: "info@indopakgrains.com", phone: "+92 21 555 0001", country: "Pakistan", status: "active", quality_score: 7.9 },
  });
  const supProduce = await prisma.supplier.create({
    data: { name: "Tropical Harvest Ltd.", email: "export@tropicalharvest.lk", phone: "+94 11 234 5678", country: "Sri Lanka", status: "active", quality_score: 8.2 },
  });

  // ── 5. Supplier Products ──────────────────────────────────────────────────────
  // Helper to create supplier products for a product across tiers
  async function addSP(supplierId: string, productId: string, price: number, tier: "tier_1"|"tier_2"|"tier_3", lead: number, moq: number, stock: "ok"|"low"|"out" = "ok") {
    return prisma.supplierProduct.create({
      data: { supplier_id: supplierId, product_id: productId, unit_price: price, currency: "USD", lead_time_days: lead, moq, quality_tier: tier, stock_status: stock },
    });
  }

  // Beverages
  const spOJ1 = await addSP(supFresh.id, pOrangeJuice.id, 18.50, "tier_1", 3, 10);
  const spOJ2 = await addSP(supGlobal.id, pOrangeJuice.id, 15.20, "tier_2", 5, 20);
  const spOJ3 = await addSP(supGrain.id,  pOrangeJuice.id, 11.80, "tier_3", 7, 50, "low");
  const spAJ1 = await addSP(supFresh.id, pAppleJuice.id, 16.00, "tier_1", 3, 10);
  const spW5  = await addSP(supFresh.id, pWater500.id,    8.40, "tier_1", 2, 100);
  const spW15 = await addSP(supFresh.id, pWater1500.id,   9.20, "tier_1", 2, 50);

  // Dairy
  const spChed1 = await addSP(supGlobal.id, pCheddar.id,    14.50, "tier_1", 7,  20);
  const spChed2 = await addSP(supFresh.id,  pCheddar.id,    11.80, "tier_2", 4,  10);
  const spMoz1  = await addSP(supGlobal.id, pMozzarella.id,  3.20, "tier_1", 7,  50);
  const spYog1  = await addSP(supGlobal.id, pYogurt.id,      2.80, "tier_1", 5,  30);
  const spYog2  = await addSP(supFresh.id,  pYogurt.id,      2.10, "tier_2", 3,  20);

  // Meat
  const spChB1 = await addSP(supMeat.id,    pChickenB.id,    7.90, "tier_1", 2, 50);
  const spChB2 = await addSP(supFresh.id,   pChickenB.id,    6.40, "tier_2", 2, 20);
  const spChW1 = await addSP(supMeat.id,    pChickenW.id,    5.20, "tier_1", 2, 30);
  const spLamb1 = await addSP(supMeat.id,   pLamb.id,       18.50, "tier_1", 3, 20);
  const spLamb2 = await addSP(supFresh.id,  pLamb.id,       15.00, "tier_2", 3, 10, "low");
  const spBeef1 = await addSP(supMeat.id,   pBeefMince.id,   4.20, "tier_1", 2, 50);

  // Grains
  const spBas1 = await addSP(supGrain.id,   pBasmati.id,    12.00, "tier_1", 7,  20);
  const spBas2 = await addSP(supProduce.id, pBasmati.id,     9.50, "tier_2", 10, 50);
  const spPita = await addSP(supFresh.id,   pPitaBread.id,   2.40, "tier_1", 1,  50);

  // Produce
  const spTom1 = await addSP(supFresh.id,   pTomatoes.id,    1.80, "tier_1", 1, 100);
  const spCuc1 = await addSP(supFresh.id,   pCucumber.id,    1.40, "tier_1", 1, 100);
  const spMng1 = await addSP(supProduce.id, pMango.id,       8.50, "tier_1", 5,  30);
  const spDat1 = await addSP(supProduce.id, pDates.id,      16.00, "tier_1", 5,  20);
  const spDat2 = await addSP(supFresh.id,   pDates.id,      12.50, "tier_2", 3,  10);

  console.log("  ✓ Suppliers: 5 suppliers, ~25 supplier products");

  // ── 6. Buyers / Prospects ─────────────────────────────────────────────────────
  const buyers = await Promise.all([
    prisma.buyer.create({ data: { name: "Omar Al-Farsi",    company: "Ritz Garden Hotel",     email: "omar@ritzgarden.ae",    phone: "+971 50 111 2222", address: "Dubai Marina, Dubai, UAE",     assigned_agent_id: agent.id, created_at: daysAgo(120) } }),
    prisma.buyer.create({ data: { name: "Sara Al-Mansouri", company: "The Pearl Banquet Hall", email: "sara@pearlbanquet.ae",  phone: "+971 55 333 4444", address: "Jumeirah, Dubai, UAE",          assigned_agent_id: agent.id, created_at: daysAgo(90) } }),
    prisma.buyer.create({ data: { name: "Khalid Ibrahim",   company: "Desert Rose Catering",  email: "khalid@desertrose.ae",  phone: "+971 56 555 6666", address: "Deira, Dubai, UAE",             assigned_agent_id: agent.id, created_at: daysAgo(75) } }),
    prisma.buyer.create({ data: { name: "Layla Haddad",     company: "Seasons Restaurant",    email: "layla@seasons.ae",      phone: "+971 52 777 8888", address: "Downtown Dubai, UAE",          assigned_agent_id: agent.id, created_at: daysAgo(60) } }),
    prisma.buyer.create({ data: { name: "Faisal Al-Otaibi", company: "Crown Palace Events",   email: "faisal@crownpalace.sa", phone: "+966 50 999 0000", address: "Riyadh, Saudi Arabia",         assigned_agent_id: agent.id, created_at: daysAgo(45) } }),
    prisma.buyer.create({ data: { name: "Nadia Karimi",     company: "Oasis Catering Group",  email: "nadia@oasiscatering.ae",phone: "+971 54 222 3333", address: "Abu Dhabi, UAE",               assigned_agent_id: agent.id, created_at: daysAgo(30) } }),
    prisma.buyer.create({ data: { name: "Yousef Al-Qahtani",company: "Al-Barakah Restaurants",email: "yousef@albarakah.sa",   phone: "+966 55 444 5555", address: "Jeddah, Saudi Arabia",         assigned_agent_id: agent.id, created_at: daysAgo(20) } }),
    prisma.buyer.create({ data: { name: "Mariam Khalil",    company: "Blue Bay Yacht Club",   email: "mariam@bluebay.ae",     phone: "+971 58 666 7777", address: "Ras Al Khaimah, UAE",          assigned_agent_id: agent.id, created_at: daysAgo(10) } }),
  ]);
  const [bOmar, bSara, bKhalid, bLayla, bFaisal, bNadia, bYousef, bMariam] = buyers;
  console.log("  ✓ Buyers: 8 prospects");

  // ── helper: apply margin ──────────────────────────────────────────────────────
  function withMargin(cost: number, pct: number) {
    return parseFloat((cost * (1 + pct / 100)).toFixed(2));
  }

  // ── 7. RFQs ───────────────────────────────────────────────────────────────────

  // RFQ 1 — delivered order (Omar, 65 days ago)
  const rfq1 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bOmar.id, status: "confirmed", notes: "Weekly hotel beverage supply — urgent for Ramadan event.", created_at: daysAgo(65), updated_at: daysAgo(64) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq1.id, product_id: pOrangeJuice.id, quantity: 200, selected_supplier_product_id: spOJ1.id, selected_unit_price: spOJ1.unit_price, margin_pct: catBeverages.margin_pct, buyer_unit_price: withMargin(18.50, 14) },
    { rfq_id: rfq1.id, product_id: pWater1500.id,   quantity: 500, selected_supplier_product_id: spW15.id,  selected_unit_price: spW15.unit_price,  margin_pct: catBeverages.margin_pct, buyer_unit_price: withMargin(9.20,  14) },
    { rfq_id: rfq1.id, product_id: pAppleJuice.id,  quantity: 100, selected_supplier_product_id: spAJ1.id,  selected_unit_price: spAJ1.unit_price,  margin_pct: catBeverages.margin_pct, buyer_unit_price: withMargin(16.00, 14) },
  ]});

  // RFQ 2 — delivered order (Sara, 50 days ago)
  const rfq2 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bSara.id, status: "confirmed", notes: "Wedding banquet — premium cheese & dairy platter.", created_at: daysAgo(50), updated_at: daysAgo(49) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq2.id, product_id: pCheddar.id,    quantity: 30,  selected_supplier_product_id: spChed1.id, selected_unit_price: spChed1.unit_price, margin_pct: catDairy.margin_pct, buyer_unit_price: withMargin(14.50, 12) },
    { rfq_id: rfq2.id, product_id: pMozzarella.id, quantity: 100, selected_supplier_product_id: spMoz1.id,  selected_unit_price: spMoz1.unit_price,  margin_pct: catDairy.margin_pct, buyer_unit_price: withMargin(3.20,  12) },
    { rfq_id: rfq2.id, product_id: pYogurt.id,     quantity: 80,  selected_supplier_product_id: spYog1.id,  selected_unit_price: spYog1.unit_price,  margin_pct: catDairy.margin_pct, buyer_unit_price: withMargin(2.80,  12) },
  ]});

  // RFQ 3 — processing order (Khalid, 20 days ago)
  const rfq3 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bKhalid.id, status: "confirmed", notes: "Monthly catering restock — meat & chicken.", created_at: daysAgo(20), updated_at: daysAgo(19) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq3.id, product_id: pChickenB.id, quantity: 150, selected_supplier_product_id: spChB1.id,  selected_unit_price: spChB1.unit_price,  margin_pct: catMeat.margin_pct, buyer_unit_price: withMargin(7.90,  15) },
    { rfq_id: rfq3.id, product_id: pChickenW.id, quantity: 200, selected_supplier_product_id: spChW1.id,  selected_unit_price: spChW1.unit_price,  margin_pct: catMeat.margin_pct, buyer_unit_price: withMargin(5.20,  15) },
    { rfq_id: rfq3.id, product_id: pLamb.id,     quantity: 80,  selected_supplier_product_id: spLamb1.id, selected_unit_price: spLamb1.unit_price, margin_pct: catMeat.margin_pct, buyer_unit_price: withMargin(18.50, 15) },
  ]});

  // RFQ 4 — sent (awaiting buyer confirm) (Layla, 5 days ago)
  const rfq4 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bLayla.id, status: "sent", notes: "Restaurant produce order — fresh veg & fruits for weekly menu.", created_at: daysAgo(5), updated_at: daysAgo(5) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq4.id, product_id: pTomatoes.id, quantity: 200, selected_supplier_product_id: spTom1.id, selected_unit_price: spTom1.unit_price, margin_pct: catProduce.margin_pct, buyer_unit_price: withMargin(1.80, 13) },
    { rfq_id: rfq4.id, product_id: pCucumber.id, quantity: 150, selected_supplier_product_id: spCuc1.id, selected_unit_price: spCuc1.unit_price, margin_pct: catProduce.margin_pct, buyer_unit_price: withMargin(1.40, 13) },
    { rfq_id: rfq4.id, product_id: pMango.id,    quantity: 60,  selected_supplier_product_id: spMng1.id, selected_unit_price: spMng1.unit_price, margin_pct: catProduce.margin_pct, buyer_unit_price: withMargin(8.50, 13) },
    { rfq_id: rfq4.id, product_id: pDates.id,    quantity: 50,  selected_supplier_product_id: spDat1.id, selected_unit_price: spDat1.unit_price, margin_pct: catProduce.margin_pct, buyer_unit_price: withMargin(16.00, 13) },
  ]});

  // RFQ 5 — sent (Faisal, 3 days ago)
  const rfq5 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bFaisal.id, status: "sent", notes: "Palace event: premium dates & cheese for Eid celebration.", created_at: daysAgo(3), updated_at: daysAgo(3) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq5.id, product_id: pDates.id,   quantity: 200, selected_supplier_product_id: spDat1.id,  selected_unit_price: spDat1.unit_price,  margin_pct: catProduce.margin_pct, buyer_unit_price: withMargin(16.00, 13) },
    { rfq_id: rfq5.id, product_id: pCheddar.id, quantity: 50,  selected_supplier_product_id: spChed1.id, selected_unit_price: spChed1.unit_price, margin_pct: catDairy.margin_pct,   buyer_unit_price: withMargin(14.50, 12) },
  ]});

  // RFQ 6 — draft (Nadia, 1 day ago)
  const rfq6 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bNadia.id, status: "draft", notes: "Draft — checking quantities with client.", created_at: daysAgo(1), updated_at: daysAgo(1) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq6.id, product_id: pBasmati.id,  quantity: 100, selected_supplier_product_id: spBas1.id, selected_unit_price: spBas1.unit_price, margin_pct: catGrains.margin_pct, buyer_unit_price: withMargin(12.00, 10) },
    { rfq_id: rfq6.id, product_id: pPitaBread.id, quantity: 200, selected_supplier_product_id: spPita.id, selected_unit_price: spPita.unit_price, margin_pct: catGrains.margin_pct, buyer_unit_price: withMargin(2.40, 10) },
  ]});

  // RFQ 7 — cancelled
  const rfq7 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bYousef.id, status: "cancelled", notes: "Client cancelled — event postponed.", created_at: daysAgo(40), updated_at: daysAgo(38) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq7.id, product_id: pBeefMince.id, quantity: 100, selected_supplier_product_id: spBeef1.id, selected_unit_price: spBeef1.unit_price, margin_pct: catMeat.margin_pct, buyer_unit_price: withMargin(4.20, 15) },
  ]});

  // RFQ 8 — confirmed order (Omar, second order, 10 days ago)
  const rfq8 = await prisma.rFQ.create({ data: { agent_id: agent.id, buyer_id: bOmar.id, status: "confirmed", notes: "Hotel kitchen restock — grains & meat.", created_at: daysAgo(10), updated_at: daysAgo(9) } });
  await prisma.rFQLineItem.createMany({ data: [
    { rfq_id: rfq8.id, product_id: pBasmati.id,  quantity: 200, selected_supplier_product_id: spBas1.id,  selected_unit_price: spBas1.unit_price,  margin_pct: catGrains.margin_pct, buyer_unit_price: withMargin(12.00, 10) },
    { rfq_id: rfq8.id, product_id: pBeefMince.id, quantity: 300, selected_supplier_product_id: spBeef1.id, selected_unit_price: spBeef1.unit_price, margin_pct: catMeat.margin_pct,   buyer_unit_price: withMargin(4.20,  15) },
    { rfq_id: rfq8.id, product_id: pChickenB.id, quantity: 100, selected_supplier_product_id: spChB1.id,  selected_unit_price: spChB1.unit_price,  margin_pct: catMeat.margin_pct,   buyer_unit_price: withMargin(7.90,  15) },
  ]});

  console.log("  ✓ RFQs: 8 created (2 draft/sent, 1 cancelled, 5 confirmed→orders)");

  // ── 8. Orders ─────────────────────────────────────────────────────────────────

  // Order 1 — DELIVERED (from rfq1, Omar, 60 days ago) — full delivery, survey submitted
  const o1TotalBuyer = 200 * withMargin(18.50,14) + 500 * withMargin(9.20,14) + 100 * withMargin(16.00,14);
  const o1TotalCost  = 200 * 18.50 + 500 * 9.20 + 100 * 16.00;
  const o1Margin     = parseFloat((o1TotalBuyer - o1TotalCost).toFixed(2));

  const ord1 = await prisma.order.create({ data: {
    rfq_id: rfq1.id, buyer_id: bOmar.id, agent_id: agent.id,
    status: "delivered", total_amount: o1TotalBuyer, cost_amount: o1TotalCost, margin_amount: o1Margin,
    invoice_generated: true, created_at: daysAgo(60), updated_at: daysAgo(55),
  }});
  const subpo1 = await prisma.subPO.create({ data: {
    order_id: ord1.id, supplier_id: supFresh.id, status: "delivered",
    sent_at: daysAgo(60), acknowledged_at: daysAgo(59), dispatched_at: daysAgo(57), delivered_at: daysAgo(55),
    total_amount: o1TotalCost, created_at: daysAgo(60), updated_at: daysAgo(55),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo1.id, product_id: pOrangeJuice.id, quantity: 200, unit_price: 18.50 },
    { subpo_id: subpo1.id, product_id: pWater1500.id,   quantity: 500, unit_price: 9.20 },
    { subpo_id: subpo1.id, product_id: pAppleJuice.id,  quantity: 100, unit_price: 16.00 },
  ]});

  // Order 2 — DELIVERED (from rfq2, Sara, 45 days ago) — survey submitted
  const o2TotalBuyer = 30 * withMargin(14.50,12) + 100 * withMargin(3.20,12) + 80 * withMargin(2.80,12);
  const o2TotalCost  = 30 * 14.50 + 100 * 3.20 + 80 * 2.80;
  const o2Margin     = parseFloat((o2TotalBuyer - o2TotalCost).toFixed(2));

  const ord2 = await prisma.order.create({ data: {
    rfq_id: rfq2.id, buyer_id: bSara.id, agent_id: agent.id,
    status: "delivered", total_amount: o2TotalBuyer, cost_amount: o2TotalCost, margin_amount: o2Margin,
    invoice_generated: true, created_at: daysAgo(45), updated_at: daysAgo(40),
  }});
  const o2CostDairy = 30 * 14.50 + 100 * 3.20;
  const o2CostYogurt = 80 * 2.80;
  const subpo2a = await prisma.subPO.create({ data: {
    order_id: ord2.id, supplier_id: supGlobal.id, status: "delivered",
    sent_at: daysAgo(45), acknowledged_at: daysAgo(44), dispatched_at: daysAgo(43), delivered_at: daysAgo(40),
    total_amount: o2CostDairy, created_at: daysAgo(45), updated_at: daysAgo(40),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo2a.id, product_id: pCheddar.id,    quantity: 30,  unit_price: 14.50 },
    { subpo_id: subpo2a.id, product_id: pMozzarella.id, quantity: 100, unit_price: 3.20 },
  ]});
  const subpo2b = await prisma.subPO.create({ data: {
    order_id: ord2.id, supplier_id: supGlobal.id, status: "delivered",
    sent_at: daysAgo(45), acknowledged_at: daysAgo(44), dispatched_at: daysAgo(43), delivered_at: daysAgo(40),
    total_amount: o2CostYogurt, created_at: daysAgo(45), updated_at: daysAgo(40),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo2b.id, product_id: pYogurt.id, quantity: 80, unit_price: 2.80 },
  ]});

  // Order 3 — PROCESSING (from rfq3, Khalid, 18 days ago)
  const o3TotalBuyer = 150 * withMargin(7.90,15) + 200 * withMargin(5.20,15) + 80 * withMargin(18.50,15);
  const o3TotalCost  = 150 * 7.90 + 200 * 5.20 + 80 * 18.50;
  const o3Margin     = parseFloat((o3TotalBuyer - o3TotalCost).toFixed(2));

  const ord3 = await prisma.order.create({ data: {
    rfq_id: rfq3.id, buyer_id: bKhalid.id, agent_id: agent.id,
    status: "processing", total_amount: o3TotalBuyer, cost_amount: o3TotalCost, margin_amount: o3Margin,
    invoice_generated: true, created_at: daysAgo(18), updated_at: daysAgo(15),
  }});
  const o3CostChicken = 150 * 7.90 + 200 * 5.20;
  const o3CostLamb = 80 * 18.50;
  const subpo3a = await prisma.subPO.create({ data: {
    order_id: ord3.id, supplier_id: supMeat.id, status: "dispatched",
    sent_at: daysAgo(18), acknowledged_at: daysAgo(17), dispatched_at: daysAgo(15), delivered_at: null,
    total_amount: o3CostChicken, created_at: daysAgo(18), updated_at: daysAgo(15),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo3a.id, product_id: pChickenB.id, quantity: 150, unit_price: 7.90 },
    { subpo_id: subpo3a.id, product_id: pChickenW.id, quantity: 200, unit_price: 5.20 },
  ]});
  const subpo3b = await prisma.subPO.create({ data: {
    order_id: ord3.id, supplier_id: supMeat.id, status: "acknowledged",
    sent_at: daysAgo(18), acknowledged_at: daysAgo(16), dispatched_at: null, delivered_at: null,
    total_amount: o3CostLamb, created_at: daysAgo(18), updated_at: daysAgo(16),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo3b.id, product_id: pLamb.id, quantity: 80, unit_price: 18.50 },
  ]});

  // Order 4 — CONFIRMED (from rfq8, Omar again, 8 days ago)
  const o4TotalBuyer = 200 * withMargin(12.00,10) + 300 * withMargin(4.20,15) + 100 * withMargin(7.90,15);
  const o4TotalCost  = 200 * 12.00 + 300 * 4.20 + 100 * 7.90;
  const o4Margin     = parseFloat((o4TotalBuyer - o4TotalCost).toFixed(2));

  const ord4 = await prisma.order.create({ data: {
    rfq_id: rfq8.id, buyer_id: bOmar.id, agent_id: agent.id,
    status: "confirmed", total_amount: o4TotalBuyer, cost_amount: o4TotalCost, margin_amount: o4Margin,
    invoice_generated: false, created_at: daysAgo(8), updated_at: daysAgo(8),
  }});
  const subpo4a = await prisma.subPO.create({ data: {
    order_id: ord4.id, supplier_id: supGrain.id, status: "sent",
    sent_at: daysAgo(8), acknowledged_at: null, dispatched_at: null, delivered_at: null,
    total_amount: 200 * 12.00, created_at: daysAgo(8), updated_at: daysAgo(8),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo4a.id, product_id: pBasmati.id, quantity: 200, unit_price: 12.00 },
  ]});
  const subpo4b = await prisma.subPO.create({ data: {
    order_id: ord4.id, supplier_id: supMeat.id, status: "sent",
    sent_at: daysAgo(8), acknowledged_at: null, dispatched_at: null, delivered_at: null,
    total_amount: 300 * 4.20 + 100 * 7.90, created_at: daysAgo(8), updated_at: daysAgo(8),
  }});
  await prisma.subPOLineItem.createMany({ data: [
    { subpo_id: subpo4b.id, product_id: pBeefMince.id, quantity: 300, unit_price: 4.20 },
    { subpo_id: subpo4b.id, product_id: pChickenB.id,  quantity: 100, unit_price: 7.90 },
  ]});

  console.log("  ✓ Orders: 4 created (2 delivered, 1 processing, 1 confirmed)");

  // ── 9. Invoices ───────────────────────────────────────────────────────────────
  const inv1 = await prisma.invoice.create({ data: {
    order_id: ord1.id, buyer_id: bOmar.id, amount: o1TotalBuyer,
    status: "paid", issued_at: daysAgo(59), due_at: addDays(daysAgo(59), 30),
    created_at: daysAgo(59), updated_at: daysAgo(50),
  }});
  const inv2 = await prisma.invoice.create({ data: {
    order_id: ord2.id, buyer_id: bSara.id, amount: o2TotalBuyer,
    status: "paid", issued_at: daysAgo(44), due_at: addDays(daysAgo(44), 30),
    created_at: daysAgo(44), updated_at: daysAgo(35),
  }});
  const inv3 = await prisma.invoice.create({ data: {
    order_id: ord3.id, buyer_id: bKhalid.id, amount: o3TotalBuyer,
    status: "sent", issued_at: daysAgo(17), due_at: addDays(daysAgo(17), 30),
    created_at: daysAgo(17), updated_at: daysAgo(17),
  }});
  console.log("  ✓ Invoices: 3 (2 paid, 1 sent)");

  // ── 10. Commissions ───────────────────────────────────────────────────────────
  const rate = 12; // agent.commission_rate

  const comm1 = await prisma.commission.create({ data: {
    agent_id: agent.id, order_id: ord1.id,
    margin_amount: o1Margin, commission_rate: rate,
    commission_earned: parseFloat((o1Margin * rate / 100).toFixed(2)),
    status: "paid", created_at: daysAgo(60), paid_at: daysAgo(50),
  }});
  const comm2 = await prisma.commission.create({ data: {
    agent_id: agent.id, order_id: ord2.id,
    margin_amount: o2Margin, commission_rate: rate,
    commission_earned: parseFloat((o2Margin * rate / 100).toFixed(2)),
    status: "paid", created_at: daysAgo(45), paid_at: daysAgo(35),
  }});
  const comm3 = await prisma.commission.create({ data: {
    agent_id: agent.id, order_id: ord3.id,
    margin_amount: o3Margin, commission_rate: rate,
    commission_earned: parseFloat((o3Margin * rate / 100).toFixed(2)),
    status: "pending", created_at: daysAgo(18),
  }});
  const comm4 = await prisma.commission.create({ data: {
    agent_id: agent.id, order_id: ord4.id,
    margin_amount: o4Margin, commission_rate: rate,
    commission_earned: parseFloat((o4Margin * rate / 100).toFixed(2)),
    status: "pending", created_at: daysAgo(8),
  }});

  const totalEarned = parseFloat((Number(comm1.commission_earned) + Number(comm2.commission_earned)).toFixed(2));
  await prisma.agent.update({ where: { id: agent.id }, data: { total_earned: totalEarned } });
  console.log("  ✓ Commissions: 4 (2 paid, 2 pending)");

  // ── 11. QA Surveys ────────────────────────────────────────────────────────────
  function calcOverall(d: number, q: number, a: number, p: number) {
    return parseFloat(((d + q + a + p) / 4 / 5 * 10).toFixed(2));
  }

  await prisma.qASurvey.create({ data: {
    order_id: ord1.id, buyer_id: bOmar.id,
    delivery_score: 5, quality_score: 5, accuracy_score: 4, packaging_score: 5,
    overall_score: calcOverall(5,5,4,5),
    comments: "Excellent delivery — products arrived perfectly chilled and on time. Will order again.",
    submitted_at: daysAgo(54),
  }});
  await prisma.qASurvey.create({ data: {
    order_id: ord2.id, buyer_id: bSara.id,
    delivery_score: 4, quality_score: 5, accuracy_score: 5, packaging_score: 4,
    overall_score: calcOverall(4,5,5,4),
    comments: "Premium cheese quality was outstanding. Slight delay on dispatch but overall very happy.",
    submitted_at: daysAgo(39),
  }});
  console.log("  ✓ QA Surveys: 2 submitted");

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete!");
  console.log(`   Agent:       ${agent.full_name} (${agent.email})`);
  console.log(`   Prospects:   8 buyers across UAE & KSA`);
  console.log(`   Catalogue:   17 products across 5 categories`);
  console.log(`   RFQs:        8 (1 draft · 2 sent · 1 cancelled · 4 confirmed)`);
  console.log(`   Orders:      4 (1 confirmed · 1 processing · 2 delivered)`);
  console.log(`   Invoices:    3 (2 paid · 1 sent)`);
  console.log(`   Commissions: 4 (2 paid · 2 pending)`);
  console.log(`   Surveys:     2`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
