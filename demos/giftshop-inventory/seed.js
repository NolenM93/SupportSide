/** Sample data for "Harbor Lane Gift Shop" - local portfolio demo */
window.GIFTSHOP_SEED = {
  shopName: 'Harbor Lane Gift Shop',
  products: [
    { id: 'p1', sku: 'CND-LAV-12', name: 'Lavender Soy Candle 12oz', category: 'Candles & scent', qty: 24, price: 22.00, reorderAt: 8 },
    { id: 'p2', sku: 'CND-VAN-8', name: 'Vanilla Bean Candle 8oz', category: 'Candles & scent', qty: 6, price: 16.00, reorderAt: 8 },
    { id: 'p3', sku: 'CRD-THX-01', name: 'Thank You Card Set (8)', category: 'Stationery', qty: 40, price: 12.00, reorderAt: 10 },
    { id: 'p4', sku: 'CRD-BDY-02', name: 'Birthday Card Assortment', category: 'Stationery', qty: 3, price: 4.50, reorderAt: 12 },
    { id: 'p5', sku: 'JWL-STL-NCK', name: 'Stainless Pendant Necklace', category: 'Jewelry', qty: 15, price: 34.00, reorderAt: 5 },
    { id: 'p6', sku: 'JWL-EAR-GLD', name: 'Gold Hoop Earrings', category: 'Jewelry', qty: 2, price: 28.00, reorderAt: 4 },
    { id: 'p7', sku: 'HOM-TRW-NVY', name: 'Navy Throw Blanket', category: 'Home decor', qty: 9, price: 48.00, reorderAt: 4 },
    { id: 'p8', sku: 'HOM-VAS-CLR', name: 'Clear Bud Vase', category: 'Home decor', qty: 18, price: 14.00, reorderAt: 6 },
    { id: 'p9', sku: 'TOY-WD-BLOCK', name: 'Wooden Alphabet Blocks', category: 'Toys & kids', qty: 7, price: 32.00, reorderAt: 5 },
    { id: 'p10', sku: 'GMT-HNY-LOC', name: 'Local Wildflower Honey', category: 'Gourmet', qty: 11, price: 11.00, reorderAt: 6 },
    { id: 'p11', sku: 'SEA-ORN-SNOW', name: 'Snowflake Ornament', category: 'Seasonal', qty: 0, price: 9.00, reorderAt: 10 },
    { id: 'p12', sku: 'SEA-MUG-HOL', name: 'Holiday Mug', category: 'Seasonal', qty: 14, price: 18.00, reorderAt: 8 }
  ],
  activity: [
    { id: 'a1', at: Date.now() - 86400000 * 2, productId: 'p2', label: 'Vanilla Bean Candle 8oz', type: 'out', qty: 2, note: 'Weekend sales' },
    { id: 'a2', at: Date.now() - 86400000, productId: 'p1', label: 'Lavender Soy Candle 12oz', type: 'in', qty: 12, note: 'Supplier restock' },
    { id: 'a3', at: Date.now() - 3600000 * 5, productId: 'p6', label: 'Gold Hoop Earrings', type: 'out', qty: 1, note: 'Floor sale' }
  ]
};
