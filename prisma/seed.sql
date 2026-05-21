-- ============================================================
-- ProcureX — Full Demo Seed (PostgreSQL / Supabase)
-- Paste into Supabase SQL Editor and click Run
-- ============================================================

DO $$
DECLARE
  -- ── IDs ──────────────────────────────────────────────────
  v_user_id     UUID := gen_random_uuid();
  v_agent_id    UUID;

  -- Categories
  v_cat_bev     UUID; v_cat_dairy   UUID; v_cat_meat  UUID;
  v_cat_grains  UUID; v_cat_produce UUID;

  -- Subcategories
  v_sub_juices  UUID; v_sub_water   UUID;
  v_sub_cheese  UUID; v_sub_yogurt  UUID;
  v_sub_chicken UUID; v_sub_lamb    UUID;
  v_sub_rice    UUID; v_sub_bread   UUID;
  v_sub_veg     UUID; v_sub_fruits  UUID;

  -- Products
  v_p_oj   UUID; v_p_aj   UUID; v_p_w500  UUID; v_p_w1500 UUID;
  v_p_ched UUID; v_p_mozz UUID; v_p_yog   UUID;
  v_p_chb  UUID; v_p_chw  UUID; v_p_lamb  UUID; v_p_beef  UUID;
  v_p_bas  UUID; v_p_pita UUID;
  v_p_tom  UUID; v_p_cuc  UUID; v_p_mng   UUID; v_p_dat   UUID;

  -- Suppliers
  v_sup_fresh UUID; v_sup_global  UUID; v_sup_meat UUID;
  v_sup_grain UUID; v_sup_produce UUID;

  -- Supplier Products
  v_sp_oj1  UUID; v_sp_oj2  UUID; v_sp_oj3  UUID;
  v_sp_aj1  UUID; v_sp_w5   UUID; v_sp_w15  UUID;
  v_sp_ch1  UUID; v_sp_ch2  UUID; v_sp_moz1 UUID;
  v_sp_yog1 UUID; v_sp_yog2 UUID;
  v_sp_chb1 UUID; v_sp_chb2 UUID; v_sp_chw1 UUID;
  v_sp_lb1  UUID; v_sp_lb2  UUID; v_sp_bf1  UUID;
  v_sp_bas1 UUID; v_sp_bas2 UUID; v_sp_pit  UUID;
  v_sp_tom1 UUID; v_sp_cuc1 UUID; v_sp_mng1 UUID;
  v_sp_dat1 UUID; v_sp_dat2 UUID;

  -- Buyers
  v_b_omar   UUID; v_b_sara   UUID; v_b_khalid UUID; v_b_layla  UUID;
  v_b_faisal UUID; v_b_nadia  UUID; v_b_yousef UUID; v_b_mariam UUID;

  -- RFQs
  v_rfq1 UUID; v_rfq2 UUID; v_rfq3 UUID; v_rfq4 UUID;
  v_rfq5 UUID; v_rfq6 UUID; v_rfq7 UUID; v_rfq8 UUID;

  -- Orders
  v_ord1 UUID; v_ord2 UUID; v_ord3 UUID; v_ord4 UUID;

  -- Sub-POs
  v_spo1  UUID;
  v_spo2a UUID; v_spo2b UUID;
  v_spo3a UUID; v_spo3b UUID;
  v_spo4a UUID; v_spo4b UUID;

  -- Order financials (buyer price / cost / margin)
  v_o1_b NUMERIC; v_o1_c NUMERIC; v_o1_m NUMERIC;
  v_o2_b NUMERIC; v_o2_c NUMERIC; v_o2_m NUMERIC;
  v_o3_b NUMERIC; v_o3_c NUMERIC; v_o3_m NUMERIC;
  v_o4_b NUMERIC; v_o4_c NUMERIC; v_o4_m NUMERIC;

BEGIN

  -- ── 1. Clear existing data ───────────────────────────────
  TRUNCATE commissions, qa_surveys, invoices,
           sub_po_line_items, sub_pos,
           orders, rfq_line_items, rfqs,
           buyers, supplier_products, suppliers,
           products, subcategories, categories,
           agents, user_profiles CASCADE;

  -- ── 2. UserProfile + Agent ───────────────────────────────
  INSERT INTO user_profiles (id, email, role)
  VALUES (v_user_id, 'agent@procurex.com', 'super_admin');

  INSERT INTO agents (id, user_id, full_name, email, commission_rate, total_earned, status)
  VALUES (gen_random_uuid(), v_user_id, 'Karim El-Masri', 'agent@procurex.com', 12, 0, 'active')
  RETURNING id INTO v_agent_id;

  -- ── 3. Categories ────────────────────────────────────────
  INSERT INTO categories (id, name, name_ar, margin_pct) VALUES (gen_random_uuid(), 'Beverages',      'مشروبات',       14) RETURNING id INTO v_cat_bev;
  INSERT INTO categories (id, name, name_ar, margin_pct) VALUES (gen_random_uuid(), 'Dairy & Eggs',   'ألبان وبيض',    12) RETURNING id INTO v_cat_dairy;
  INSERT INTO categories (id, name, name_ar, margin_pct) VALUES (gen_random_uuid(), 'Meat & Poultry', 'لحوم ودواجن',   15) RETURNING id INTO v_cat_meat;
  INSERT INTO categories (id, name, name_ar, margin_pct) VALUES (gen_random_uuid(), 'Grains & Bakery','حبوب ومخبوزات', 10) RETURNING id INTO v_cat_grains;
  INSERT INTO categories (id, name, name_ar, margin_pct) VALUES (gen_random_uuid(), 'Fresh Produce',  'منتجات طازجة',  13) RETURNING id INTO v_cat_produce;

  -- ── 4. Subcategories ─────────────────────────────────────
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_bev,     'Juices & Nectars',  'عصائر ونكتار')  RETURNING id INTO v_sub_juices;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_bev,     'Water & Sparkling', 'مياه وغازية')   RETURNING id INTO v_sub_water;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_dairy,   'Cheese',            'جبن')           RETURNING id INTO v_sub_cheese;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_dairy,   'Yogurt & Cream',    'زبادي وقشدة')   RETURNING id INTO v_sub_yogurt;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_meat,    'Chicken',           'دجاج')          RETURNING id INTO v_sub_chicken;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_meat,    'Lamb & Beef',       'خروف ولحم بقر') RETURNING id INTO v_sub_lamb;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_grains,  'Rice & Grains',     'أرز وحبوب')     RETURNING id INTO v_sub_rice;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_grains,  'Bread & Pastries',  'خبز ومعجنات')   RETURNING id INTO v_sub_bread;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_produce, 'Vegetables',        'خضروات')        RETURNING id INTO v_sub_veg;
  INSERT INTO subcategories (id, category_id, name, name_ar) VALUES (gen_random_uuid(), v_cat_produce, 'Fruits',            'فواكه')         RETURNING id INTO v_sub_fruits;

  -- ── 5. Products ──────────────────────────────────────────
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_juices,  'Orange Juice 1L',          'عصير برتقال ١ لتر',    'carton') RETURNING id INTO v_p_oj;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_juices,  'Apple Juice 1L',           'عصير تفاح ١ لتر',      'carton') RETURNING id INTO v_p_aj;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_water,   'Mineral Water 500ml',      'مياه معدنية ٥٠٠ مل',   'case')   RETURNING id INTO v_p_w500;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_water,   'Mineral Water 1.5L',       'مياه معدنية ١.٥ لتر',  'case')   RETURNING id INTO v_p_w1500;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_cheese,  'Cheddar Cheese Block 1kg', 'جبن شيدر كتلة ١ كيلو', 'kg')     RETURNING id INTO v_p_ched;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_cheese,  'Mozzarella Ball 250g',     'جبن موزاريلا ٢٥٠ غ',   'pcs')    RETURNING id INTO v_p_mozz;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_yogurt,  'Greek Yogurt 500g',        'زبادي يوناني ٥٠٠ غ',   'pcs')    RETURNING id INTO v_p_yog;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_chicken, 'Chicken Breast Fillet',    'صدر دجاج فيليه',        'kg')     RETURNING id INTO v_p_chb;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_chicken, 'Whole Chicken 1.2kg',      'دجاجة كاملة ١.٢ كيلو', 'pcs')    RETURNING id INTO v_p_chw;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_lamb,    'Lamb Shoulder Bone-in',    'كتف خروف بالعظم',       'kg')     RETURNING id INTO v_p_lamb;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_lamb,    'Beef Mince 500g',          'لحم بقر مفروم ٥٠٠ غ',  'pcs')    RETURNING id INTO v_p_beef;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_rice,    'Basmati Rice 5kg',         'أرز بسمتي ٥ كيلو',     'bag')    RETURNING id INTO v_p_bas;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_bread,   'Pita Bread Pack 10pcs',    'خبز بيتا ١٠ قطع',      'pack')   RETURNING id INTO v_p_pita;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_veg,     'Tomatoes (loose)',         'طماطم',                 'kg')     RETURNING id INTO v_p_tom;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_veg,     'Cucumber',                 'خيار',                  'kg')     RETURNING id INTO v_p_cuc;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_fruits,  'Mango Alphonso 1kg',       'مانجو ألفونسو ١ كيلو', 'box')    RETURNING id INTO v_p_mng;
  INSERT INTO products (id, subcategory_id, name, name_ar, unit) VALUES (gen_random_uuid(), v_sub_fruits,  'Medjool Dates 500g',       'تمر مجدول ٥٠٠ غ',      'box')    RETURNING id INTO v_p_dat;

  -- ── 6. Suppliers ─────────────────────────────────────────
  INSERT INTO suppliers (id, name, email, phone, country, status, quality_score)
  VALUES (gen_random_uuid(), 'Al-Noor Fresh Foods',     'supply@alnoor.ae',             '+971 4 123 4567',  'UAE',         'active', 8.7) RETURNING id INTO v_sup_fresh;
  INSERT INTO suppliers (id, name, email, phone, country, status, quality_score)
  VALUES (gen_random_uuid(), 'Global Dairy Imports',    'orders@globaldairy.com',       '+31 20 123 4567',  'Netherlands', 'active', 9.1) RETURNING id INTO v_sup_global;
  INSERT INTO suppliers (id, name, email, phone, country, status, quality_score)
  VALUES (gen_random_uuid(), 'Gulf Premium Meats',      'sales@gulfmeats.ae',           '+971 2 987 6543',  'UAE',         'active', 8.4) RETURNING id INTO v_sup_meat;
  INSERT INTO suppliers (id, name, email, phone, country, status, quality_score)
  VALUES (gen_random_uuid(), 'Indo-Pak Grains Co.',     'info@indopakgrains.com',       '+92 21 555 0001',  'Pakistan',    'active', 7.9) RETURNING id INTO v_sup_grain;
  INSERT INTO suppliers (id, name, email, phone, country, status, quality_score)
  VALUES (gen_random_uuid(), 'Tropical Harvest Ltd.',   'export@tropicalharvest.lk',    '+94 11 234 5678',  'Sri Lanka',   'active', 8.2) RETURNING id INTO v_sup_produce;

  -- ── 7. Supplier Products ──────────────────────────────────
  -- Beverages
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_oj,   18.50, 'USD', 3, 10,  'tier_1', 'ok')  RETURNING id INTO v_sp_oj1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_global,  v_p_oj,   15.20, 'USD', 5, 20,  'tier_2', 'ok')  RETURNING id INTO v_sp_oj2;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_grain,   v_p_oj,   11.80, 'USD', 7, 50,  'tier_3', 'low') RETURNING id INTO v_sp_oj3;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_aj,   16.00, 'USD', 3, 10,  'tier_1', 'ok')  RETURNING id INTO v_sp_aj1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_w500,  8.40, 'USD', 2, 100, 'tier_1', 'ok')  RETURNING id INTO v_sp_w5;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_w1500, 9.20, 'USD', 2, 50,  'tier_1', 'ok')  RETURNING id INTO v_sp_w15;
  -- Dairy
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_global,  v_p_ched, 14.50, 'USD', 7, 20,  'tier_1', 'ok')  RETURNING id INTO v_sp_ch1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_ched, 11.80, 'USD', 4, 10,  'tier_2', 'ok')  RETURNING id INTO v_sp_ch2;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_global,  v_p_mozz,  3.20, 'USD', 7, 50,  'tier_1', 'ok')  RETURNING id INTO v_sp_moz1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_global,  v_p_yog,   2.80, 'USD', 5, 30,  'tier_1', 'ok')  RETURNING id INTO v_sp_yog1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_yog,   2.10, 'USD', 3, 20,  'tier_2', 'ok')  RETURNING id INTO v_sp_yog2;
  -- Meat
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_meat,    v_p_chb,   7.90, 'USD', 2, 50,  'tier_1', 'ok')  RETURNING id INTO v_sp_chb1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_chb,   6.40, 'USD', 2, 20,  'tier_2', 'ok')  RETURNING id INTO v_sp_chb2;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_meat,    v_p_chw,   5.20, 'USD', 2, 30,  'tier_1', 'ok')  RETURNING id INTO v_sp_chw1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_meat,    v_p_lamb, 18.50, 'USD', 3, 20,  'tier_1', 'ok')  RETURNING id INTO v_sp_lb1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_lamb, 15.00, 'USD', 3, 10,  'tier_2', 'low') RETURNING id INTO v_sp_lb2;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_meat,    v_p_beef,  4.20, 'USD', 2, 50,  'tier_1', 'ok')  RETURNING id INTO v_sp_bf1;
  -- Grains
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_grain,   v_p_bas,  12.00, 'USD', 7, 20,  'tier_1', 'ok')  RETURNING id INTO v_sp_bas1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_produce, v_p_bas,   9.50, 'USD', 10, 50, 'tier_2', 'ok')  RETURNING id INTO v_sp_bas2;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_pita,  2.40, 'USD', 1, 50,  'tier_1', 'ok')  RETURNING id INTO v_sp_pit;
  -- Produce
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_tom,   1.80, 'USD', 1, 100, 'tier_1', 'ok')  RETURNING id INTO v_sp_tom1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_cuc,   1.40, 'USD', 1, 100, 'tier_1', 'ok')  RETURNING id INTO v_sp_cuc1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_produce, v_p_mng,   8.50, 'USD', 5, 30,  'tier_1', 'ok')  RETURNING id INTO v_sp_mng1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_produce, v_p_dat,  16.00, 'USD', 5, 20,  'tier_1', 'ok')  RETURNING id INTO v_sp_dat1;
  INSERT INTO supplier_products (id, supplier_id, product_id, unit_price, currency, lead_time_days, moq, quality_tier, stock_status) VALUES (gen_random_uuid(), v_sup_fresh,   v_p_dat,  12.50, 'USD', 3, 10,  'tier_2', 'ok')  RETURNING id INTO v_sp_dat2;

  -- ── 8. Buyers ─────────────────────────────────────────────
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Omar Al-Farsi',     'Ritz Garden Hotel',      'omar@ritzgarden.ae',    '+971 50 111 2222', 'Dubai Marina, Dubai, UAE',   v_agent_id, NOW() - INTERVAL '120 days') RETURNING id INTO v_b_omar;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Sara Al-Mansouri',  'The Pearl Banquet Hall', 'sara@pearlbanquet.ae',  '+971 55 333 4444', 'Jumeirah, Dubai, UAE',        v_agent_id, NOW() - INTERVAL '90 days')  RETURNING id INTO v_b_sara;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Khalid Ibrahim',    'Desert Rose Catering',   'khalid@desertrose.ae',  '+971 56 555 6666', 'Deira, Dubai, UAE',            v_agent_id, NOW() - INTERVAL '75 days')  RETURNING id INTO v_b_khalid;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Layla Haddad',      'Seasons Restaurant',     'layla@seasons.ae',      '+971 52 777 8888', 'Downtown Dubai, UAE',          v_agent_id, NOW() - INTERVAL '60 days')  RETURNING id INTO v_b_layla;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Faisal Al-Otaibi',  'Crown Palace Events',    'faisal@crownpalace.sa', '+966 50 999 0000', 'Riyadh, Saudi Arabia',         v_agent_id, NOW() - INTERVAL '45 days')  RETURNING id INTO v_b_faisal;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Nadia Karimi',      'Oasis Catering Group',   'nadia@oasiscatering.ae','+971 54 222 3333', 'Abu Dhabi, UAE',                v_agent_id, NOW() - INTERVAL '30 days')  RETURNING id INTO v_b_nadia;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Yousef Al-Qahtani', 'Al-Barakah Restaurants', 'yousef@albarakah.sa',   '+966 55 444 5555', 'Jeddah, Saudi Arabia',         v_agent_id, NOW() - INTERVAL '20 days')  RETURNING id INTO v_b_yousef;
  INSERT INTO buyers (id, name, company, email, phone, address, assigned_agent_id, created_at) VALUES (gen_random_uuid(), 'Mariam Khalil',     'Blue Bay Yacht Club',    'mariam@bluebay.ae',     '+971 58 666 7777', 'Ras Al Khaimah, UAE',          v_agent_id, NOW() - INTERVAL '10 days')  RETURNING id INTO v_b_mariam;

  -- ── 9. RFQs ───────────────────────────────────────────────
  -- RFQ 1 — confirmed → delivered order (Omar, 65 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_omar,   'confirmed', 'Weekly hotel beverage supply — urgent for Ramadan event.',    NOW()-INTERVAL '65 days', NOW()-INTERVAL '64 days') RETURNING id INTO v_rfq1;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq1, v_p_oj,   200, v_sp_oj1, 18.50,  14, 21.09),
    (gen_random_uuid(), v_rfq1, v_p_w1500,500, v_sp_w15,  9.20,  14, 10.49),
    (gen_random_uuid(), v_rfq1, v_p_aj,   100, v_sp_aj1, 16.00,  14, 18.24);

  -- RFQ 2 — confirmed → delivered order (Sara, 50 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_sara,   'confirmed', 'Wedding banquet — premium cheese & dairy platter.',           NOW()-INTERVAL '50 days', NOW()-INTERVAL '49 days') RETURNING id INTO v_rfq2;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq2, v_p_ched,  30, v_sp_ch1,  14.50, 12, 16.24),
    (gen_random_uuid(), v_rfq2, v_p_mozz, 100, v_sp_moz1,  3.20, 12,  3.58),
    (gen_random_uuid(), v_rfq2, v_p_yog,   80, v_sp_yog1,  2.80, 12,  3.14);

  -- RFQ 3 — confirmed → processing order (Khalid, 20 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_khalid, 'confirmed', 'Monthly catering restock — meat & chicken.',                  NOW()-INTERVAL '20 days', NOW()-INTERVAL '19 days') RETURNING id INTO v_rfq3;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq3, v_p_chb,  150, v_sp_chb1,  7.90, 15,  9.09),
    (gen_random_uuid(), v_rfq3, v_p_chw,  200, v_sp_chw1,  5.20, 15,  5.98),
    (gen_random_uuid(), v_rfq3, v_p_lamb,  80, v_sp_lb1,  18.50, 15, 21.28);

  -- RFQ 4 — sent, awaiting buyer confirm (Layla, 5 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_layla,  'sent',      'Restaurant produce order — fresh veg & fruits for weekly menu.',NOW()-INTERVAL '5 days',  NOW()-INTERVAL '5 days')  RETURNING id INTO v_rfq4;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq4, v_p_tom,  200, v_sp_tom1,  1.80, 13,  2.03),
    (gen_random_uuid(), v_rfq4, v_p_cuc,  150, v_sp_cuc1,  1.40, 13,  1.58),
    (gen_random_uuid(), v_rfq4, v_p_mng,   60, v_sp_mng1,  8.50, 13,  9.61),
    (gen_random_uuid(), v_rfq4, v_p_dat,   50, v_sp_dat1, 16.00, 13, 18.08);

  -- RFQ 5 — sent (Faisal, 3 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_faisal, 'sent',      'Palace event: premium dates & cheese for Eid celebration.',   NOW()-INTERVAL '3 days',  NOW()-INTERVAL '3 days')  RETURNING id INTO v_rfq5;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq5, v_p_dat,  200, v_sp_dat1, 16.00, 13, 18.08),
    (gen_random_uuid(), v_rfq5, v_p_ched,  50, v_sp_ch1,  14.50, 12, 16.24);

  -- RFQ 6 — draft (Nadia, 1 day ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_nadia,  'draft',     'Draft — checking quantities with client.',                    NOW()-INTERVAL '1 day',   NOW()-INTERVAL '1 day')   RETURNING id INTO v_rfq6;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq6, v_p_bas,  100, v_sp_bas1, 12.00, 10, 13.20),
    (gen_random_uuid(), v_rfq6, v_p_pita, 200, v_sp_pit,   2.40, 10,  2.64);

  -- RFQ 7 — cancelled (Yousef, 40 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_yousef, 'cancelled', 'Client cancelled — event postponed.',                         NOW()-INTERVAL '40 days', NOW()-INTERVAL '38 days') RETURNING id INTO v_rfq7;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq7, v_p_beef, 100, v_sp_bf1,   4.20, 15,  4.83);

  -- RFQ 8 — confirmed → confirmed order (Omar second order, 10 days ago)
  INSERT INTO rfqs (id, agent_id, buyer_id, status, notes, created_at, updated_at)
  VALUES (gen_random_uuid(), v_agent_id, v_b_omar,   'confirmed', 'Hotel kitchen restock — grains & meat.',                      NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days')  RETURNING id INTO v_rfq8;
  INSERT INTO rfq_line_items (id, rfq_id, product_id, quantity, selected_supplier_product_id, selected_unit_price, margin_pct, buyer_unit_price) VALUES
    (gen_random_uuid(), v_rfq8, v_p_bas,  200, v_sp_bas1, 12.00, 10, 13.20),
    (gen_random_uuid(), v_rfq8, v_p_beef, 300, v_sp_bf1,   4.20, 15,  4.83),
    (gen_random_uuid(), v_rfq8, v_p_chb,  100, v_sp_chb1,  7.90, 15,  9.09);

  -- ── 10. Orders ────────────────────────────────────────────
  -- Order financials:
  --   buyer price = cost * (1 + margin/100), rounded to 2dp
  --   o1: 200*21.09 + 500*10.49 + 100*18.24 = 11287.00  cost=9900.00  margin=1387.00
  --   o2: 30*16.24 + 100*3.58 + 80*3.14    = 1096.40   cost=979.00   margin=117.40
  --   o3: 150*9.09 + 200*5.98 + 80*21.28   = 4261.90   cost=3705.00  margin=556.90
  --   o4: 200*13.20 + 300*4.83 + 100*9.09  = 4998.00   cost=4450.00  margin=548.00

  v_o1_b := 11287.00; v_o1_c := 9900.00; v_o1_m := 1387.00;
  v_o2_b := 1096.40;  v_o2_c := 979.00;  v_o2_m := 117.40;
  v_o3_b := 4261.90;  v_o3_c := 3705.00; v_o3_m := 556.90;
  v_o4_b := 4998.00;  v_o4_c := 4450.00; v_o4_m := 548.00;

  -- Order 1 — DELIVERED (rfq1, Omar)
  INSERT INTO orders (id, rfq_id, buyer_id, agent_id, status, total_amount, cost_amount, margin_amount, invoice_generated, created_at, updated_at)
  VALUES (gen_random_uuid(), v_rfq1, v_b_omar, v_agent_id, 'delivered', v_o1_b, v_o1_c, v_o1_m, true, NOW()-INTERVAL '60 days', NOW()-INTERVAL '55 days') RETURNING id INTO v_ord1;

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord1, v_sup_fresh, 'delivered', NOW()-INTERVAL '60 days', NOW()-INTERVAL '59 days', NOW()-INTERVAL '57 days', NOW()-INTERVAL '55 days', v_o1_c, NOW()-INTERVAL '60 days', NOW()-INTERVAL '55 days') RETURNING id INTO v_spo1;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo1, v_p_oj,    200, 18.50),
    (gen_random_uuid(), v_spo1, v_p_w1500, 500,  9.20),
    (gen_random_uuid(), v_spo1, v_p_aj,    100, 16.00);

  -- Order 2 — DELIVERED (rfq2, Sara)
  INSERT INTO orders (id, rfq_id, buyer_id, agent_id, status, total_amount, cost_amount, margin_amount, invoice_generated, created_at, updated_at)
  VALUES (gen_random_uuid(), v_rfq2, v_b_sara, v_agent_id, 'delivered', v_o2_b, v_o2_c, v_o2_m, true, NOW()-INTERVAL '45 days', NOW()-INTERVAL '40 days') RETURNING id INTO v_ord2;

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord2, v_sup_global, 'delivered', NOW()-INTERVAL '45 days', NOW()-INTERVAL '44 days', NOW()-INTERVAL '43 days', NOW()-INTERVAL '40 days', 755.00, NOW()-INTERVAL '45 days', NOW()-INTERVAL '40 days') RETURNING id INTO v_spo2a;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo2a, v_p_ched,  30, 14.50),
    (gen_random_uuid(), v_spo2a, v_p_mozz, 100,  3.20);

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord2, v_sup_global, 'delivered', NOW()-INTERVAL '45 days', NOW()-INTERVAL '44 days', NOW()-INTERVAL '43 days', NOW()-INTERVAL '40 days', 224.00, NOW()-INTERVAL '45 days', NOW()-INTERVAL '40 days') RETURNING id INTO v_spo2b;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo2b, v_p_yog, 80, 2.80);

  -- Order 3 — PROCESSING (rfq3, Khalid)
  INSERT INTO orders (id, rfq_id, buyer_id, agent_id, status, total_amount, cost_amount, margin_amount, invoice_generated, created_at, updated_at)
  VALUES (gen_random_uuid(), v_rfq3, v_b_khalid, v_agent_id, 'processing', v_o3_b, v_o3_c, v_o3_m, true, NOW()-INTERVAL '18 days', NOW()-INTERVAL '15 days') RETURNING id INTO v_ord3;

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord3, v_sup_meat, 'dispatched', NOW()-INTERVAL '18 days', NOW()-INTERVAL '17 days', NOW()-INTERVAL '15 days', NULL, 2225.00, NOW()-INTERVAL '18 days', NOW()-INTERVAL '15 days') RETURNING id INTO v_spo3a;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo3a, v_p_chb, 150, 7.90),
    (gen_random_uuid(), v_spo3a, v_p_chw, 200, 5.20);

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord3, v_sup_meat, 'acknowledged', NOW()-INTERVAL '18 days', NOW()-INTERVAL '16 days', NULL, NULL, 1480.00, NOW()-INTERVAL '18 days', NOW()-INTERVAL '16 days') RETURNING id INTO v_spo3b;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo3b, v_p_lamb, 80, 18.50);

  -- Order 4 — CONFIRMED (rfq8, Omar second order)
  INSERT INTO orders (id, rfq_id, buyer_id, agent_id, status, total_amount, cost_amount, margin_amount, invoice_generated, created_at, updated_at)
  VALUES (gen_random_uuid(), v_rfq8, v_b_omar, v_agent_id, 'confirmed', v_o4_b, v_o4_c, v_o4_m, false, NOW()-INTERVAL '8 days', NOW()-INTERVAL '8 days') RETURNING id INTO v_ord4;

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord4, v_sup_grain, 'sent', NOW()-INTERVAL '8 days', NULL, NULL, NULL, 2400.00, NOW()-INTERVAL '8 days', NOW()-INTERVAL '8 days') RETURNING id INTO v_spo4a;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo4a, v_p_bas, 200, 12.00);

  INSERT INTO sub_pos (id, order_id, supplier_id, status, sent_at, acknowledged_at, dispatched_at, delivered_at, total_amount, created_at, updated_at)
  VALUES (gen_random_uuid(), v_ord4, v_sup_meat, 'sent', NOW()-INTERVAL '8 days', NULL, NULL, NULL, 2050.00, NOW()-INTERVAL '8 days', NOW()-INTERVAL '8 days') RETURNING id INTO v_spo4b;
  INSERT INTO sub_po_line_items (id, subpo_id, product_id, quantity, unit_price) VALUES
    (gen_random_uuid(), v_spo4b, v_p_beef, 300, 4.20),
    (gen_random_uuid(), v_spo4b, v_p_chb,  100, 7.90);

  -- ── 11. Invoices ──────────────────────────────────────────
  INSERT INTO invoices (id, order_id, buyer_id, amount, status, issued_at, due_at, created_at, updated_at) VALUES
    (gen_random_uuid(), v_ord1, v_b_omar,   v_o1_b, 'paid', NOW()-INTERVAL '59 days', NOW()-INTERVAL '29 days', NOW()-INTERVAL '59 days', NOW()-INTERVAL '50 days'),
    (gen_random_uuid(), v_ord2, v_b_sara,   v_o2_b, 'paid', NOW()-INTERVAL '44 days', NOW()-INTERVAL '14 days', NOW()-INTERVAL '44 days', NOW()-INTERVAL '35 days'),
    (gen_random_uuid(), v_ord3, v_b_khalid, v_o3_b, 'sent', NOW()-INTERVAL '17 days', NOW()+INTERVAL  '13 days', NOW()-INTERVAL '17 days', NOW()-INTERVAL '17 days');

  -- ── 12. Commissions ───────────────────────────────────────
  --   rate = 12%
  --   comm1 = 1387.00 * 0.12 = 166.44  (paid)
  --   comm2 = 117.40  * 0.12 = 14.09   (paid)
  --   comm3 = 556.90  * 0.12 = 66.83   (pending)
  --   comm4 = 548.00  * 0.12 = 65.76   (pending)
  INSERT INTO commissions (id, agent_id, order_id, margin_amount, commission_rate, commission_earned, status, created_at, paid_at) VALUES
    (gen_random_uuid(), v_agent_id, v_ord1, v_o1_m, 12, 166.44, 'paid',    NOW()-INTERVAL '60 days', NOW()-INTERVAL '50 days'),
    (gen_random_uuid(), v_agent_id, v_ord2, v_o2_m, 12,  14.09, 'paid',    NOW()-INTERVAL '45 days', NOW()-INTERVAL '35 days'),
    (gen_random_uuid(), v_agent_id, v_ord3, v_o3_m, 12,  66.83, 'pending', NOW()-INTERVAL '18 days', NULL),
    (gen_random_uuid(), v_agent_id, v_ord4, v_o4_m, 12,  65.76, 'pending', NOW()-INTERVAL  '8 days', NULL);

  -- Update agent total_earned (paid commissions only)
  UPDATE agents SET total_earned = 180.53 WHERE id = v_agent_id;

  -- ── 13. QA Surveys ────────────────────────────────────────
  --   overall = (d+q+a+p)/4/5*10
  --   ord1: (5+5+4+5)=19 → 9.50
  --   ord2: (4+5+5+4)=18 → 9.00
  INSERT INTO qa_surveys (id, order_id, buyer_id, delivery_score, quality_score, accuracy_score, packaging_score, overall_score, comments, submitted_at) VALUES
    (gen_random_uuid(), v_ord1, v_b_omar, 5, 5, 4, 5, 9.50, 'Excellent delivery — products arrived perfectly chilled and on time. Will order again.', NOW()-INTERVAL '54 days'),
    (gen_random_uuid(), v_ord2, v_b_sara, 4, 5, 5, 4, 9.00, 'Premium cheese quality was outstanding. Slight delay on dispatch but overall very happy.', NOW()-INTERVAL '39 days');

END;
$$;
