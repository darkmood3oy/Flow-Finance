# Flow Finance - Product Strategy & Roadmap

## 1. Feature Map
- **Core Ledger**: Double-entry ledger with NLP parsing and manual override.
- **Account Vault**: Multi-wallet management (Cash, Savings, Credit).
- **Taxonomy Engine**: Hierarchical categories (e.g. `Utilities > Power`).
- **Intelligence Hub**: 
    - Real-time "Safe to Spend" calculation.
    - Budget Sentinels (Category-based alerts).
    - OCR Receipt parsing (Vision AI).
- **Pro Features**:
    - Multi-currency pivot.
    - CSV/PDF Export.
    - Recurring transaction automation.

## 2. ER Model (Firestore)
- `users`: Standard Auth profile.
- `profiles`: Unified settings, base currency, daily budget logic.
- `accounts`: Financial containers with real-time balance tracking.
- `categories`: Taxonomy nodes (parentId for hierarchy).
- `transactions`: Core records (linked to Account and Category).
- `budgets`: Limit rules (categoryId, limit, period).
- `recurring`: Automation schedules.

## 3. Development Roadmap

### Phase 1: Foundation (Current)
- [x] Basic Transaction Ledger.
- [x] Natural Language Parsing (Gemini).
- [x] Frosted Glass Design System.
- [x] Multi-Account Management.

### Phase 2: Category Hierarchy & Budgeting
- [ ] Implement hierarchical category management.
- [ ] Category-based budget limits.
- [ ] Push notifications for budget thresholds.

### Phase 3: Visual Intelligence (Analytics)
- [ ] Interactive Spending Breakdown (Pie Chart - Recharts).
- [ ] Daily Spending Trends (Area Chart).
- [ ] Cash Flow Forecasting.

### Phase 4: Pro Operational Layer
- [ ] Recurring transactions engine.
- [ ] Receipt OCR scanning (Vision AI implementation).
- [ ] Multi-currency conversion via External API.
- [ ] Data Export (CSV/PDF).

## 4. Compliance & Security
- **Data Safety**: Account deletion logic implemented in Phase 4.
- **Privacy**: Local-first caching + Encrypted secondary sync.
- **Biometric Placeholder**: PWA Fingerprint authentication.
