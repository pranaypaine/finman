Below is a **coding-agent–ready execution plan** for building a **local-first personal finance manager** using **React Native**.
The document is structured so a **coding agent can implement tasks sequentially**.

Goal constraints:

* **No backend**
* **All data stored locally**
* **Offline-first**
* **Email parsing**
* **Credit card tracking**
* **Budgets**
* **AI insights**
* **Secure local storage**

---

# 1. Project Overview

App Name: `FinTrack AI` (placeholder)

Purpose:

Track personal finances automatically by:

* Parsing **credit card transaction emails**
* Categorizing expenses
* Tracking **monthly budgets**
* Monitoring **credit card utilization**
* Providing **AI-driven insights**

Architecture:

```
Mobile App (React Native)

Modules
 ├── UI Layer
 ├── Business Logic Layer
 ├── Local Database Layer
 ├── Email Ingestion Engine
 ├── Categorization Engine
 ├── AI Insights Engine
 ├── Notification Engine
 └── Security Layer
```

No backend services.

---

# 2. Technology Stack

## Core Framework

React Native (TypeScript)

```
react-native 0.74+
typescript
```

---

## Navigation

```
@react-navigation/native
@react-navigation/stack
@react-navigation/bottom-tabs
```

---

## Local Database

Use:

```
react-native-sqlite-storage
```

OR

```
react-native-mmkv
```

Preferred:

```
SQLite
```

because relational queries are required.

---

## ORM Layer

```
Drizzle ORM for SQLite
```

or

```
WatermelonDB
```

Preferred:

**Drizzle ORM**

---

## Local AI / ML

```
onnxruntime-react-native
```

Used for:

* categorization
* anomaly detection

---

## Secure Storage

```
react-native-keychain
```

Stores:

* Gmail OAuth token
* encryption keys

---

## Notifications

```
react-native-push-notification
```

Local notifications only.

---

## Charts

```
react-native-svg
victory-native
```

---

# 3. Repository Structure

```
finance-ai-app

src
 ├── components
 ├── screens
 ├── navigation
 ├── database
 │    ├── schema
 │    ├── migrations
 │    └── db.ts
 ├── services
 │    ├── email
 │    ├── categorization
 │    ├── budgets
 │    ├── transactions
 │    ├── insights
 │    └── notifications
 ├── ai
 │    ├── models
 │    └── inference
 ├── utils
 ├── hooks
 └── types

assets
 ├── models
 └── icons
```

---

# 4. Database Design

Database name:

```
fintrack.db
```

---

# 4.1 Accounts Table

Tracks bank accounts and credit cards.

```
accounts
```

Columns:

```
id UUID
name TEXT
type TEXT (bank, credit_card)
bank_name TEXT
last4 TEXT
credit_limit INTEGER
statement_day INTEGER
due_day INTEGER
created_at TIMESTAMP
```

---

# 4.2 Transactions Table

```
transactions
```

Columns:

```
id UUID
account_id UUID
amount INTEGER
merchant TEXT
category TEXT
transaction_date TIMESTAMP
source TEXT (email/manual)
notes TEXT
created_at TIMESTAMP
```

---

# 4.3 Budgets Table

```
budgets
```

Columns:

```
id UUID
category TEXT
monthly_limit INTEGER
created_at TIMESTAMP
```

---

# 4.4 Recurring Expenses

```
recurring_expenses
```

Columns:

```
id UUID
name TEXT
amount INTEGER
category TEXT
frequency TEXT
next_due_date TIMESTAMP
```

---

# 4.5 Email Processed Table

Avoid duplicate parsing.

```
processed_emails
```

Columns:

```
id TEXT
subject TEXT
processed_at TIMESTAMP
```

---

# 4.6 AI Insights Table

```
ai_insights
```

Columns:

```
id UUID
type TEXT
message TEXT
created_at TIMESTAMP
```

---

# 5. Navigation Structure

Bottom tabs:

```
Dashboard
Transactions
Budgets
Cards
Insights
Settings
```

---

# 6. Screen Specifications

---

# 6.1 Dashboard Screen

Displays summary.

Components:

```
Monthly Spend
Remaining Budget
Credit Utilization
Recent Transactions
```

API calls:

```
getMonthlySpend()
getBudgetStatus()
getCardUtilization()
```

---

# 6.2 Transactions Screen

List of all transactions.

Features:

```
Search
Filter by category
Filter by account
Edit category
Delete transaction
```

---

# 6.3 Budgets Screen

Displays category budgets.

UI:

```
Food       ██████░░░ 60%
Transport  ███░░░░░ 30%
```

Actions:

```
Create budget
Edit budget
Delete budget
```

---

# 6.4 Cards Screen

Displays credit card usage.

Fields:

```
credit limit
current spend
available credit
due date
statement cycle
```

Metrics:

```
utilization percentage
```

---

# 6.5 Insights Screen

Displays AI-generated financial insights.

Example:

```
You spent 24% more on food this month.
Your credit utilization exceeded 70%.
You have 5 recurring subscriptions.
```

---

# 6.6 Settings Screen

Settings include:

```
Connect Gmail
Security lock
Export data
Reset database
```

---

# 7. Email Parsing Engine

This module automatically extracts transactions from email.

Folder:

```
services/email
```

Files:

```
gmailClient.ts
emailParser.ts
merchantExtractor.ts
transactionBuilder.ts
```

---

# 7.1 Gmail Integration

Use:

```
Google OAuth
Gmail API
```

Permissions:

```
gmail.readonly
```

---

# 7.2 Email Processing Pipeline

Algorithm:

```
Fetch new emails
Filter transaction emails
Parse amount
Extract merchant
Categorize
Store transaction
Mark email processed
```

---

# 7.3 Email Filters

Keywords:

```
debited
spent
charged
transaction
payment
```

---

# 7.4 Regex Extraction

Amount extraction:

```
/(?:INR|Rs\.?)\s?([0-9,]+\.?[0-9]*)/
```

Merchant extraction:

Example patterns:

```
at (.*)
to (.*)
merchant (.*)
```

---

# 8. Categorization Engine

Location:

```
services/categorization
```

Steps:

```
Normalize merchant name
Check rule database
Fallback to ML model
```

---

# 8.1 Merchant Rule Table

Example:

```
amazon -> shopping
swiggy -> food
zomato -> food
uber -> transport
ola -> transport
```

---

# 8.2 ML Categorization

Model type:

```
text classification
```

Input:

```
merchant name
```

Output:

```
category
```

Run via:

```
onnxruntime-react-native
```

Model size target:

```
<5MB
```

---

# 9. AI Insights Engine

Folder:

```
services/insights
```

Tasks:

```
spending trend analysis
budget overrun detection
credit utilization monitoring
subscription detection
```

---

# 9.1 Spend Spike Detection

Algorithm:

```
avg_last_3_months
compare_current_month
```

Trigger if:

```
increase > 30%
```

---

# 9.2 Credit Utilization Alert

Trigger:

```
utilization > 70%
```

Insight:

```
Your credit utilization is high.
```

---

# 9.3 Subscription Detection

Detect repeating merchant transactions.

Logic:

```
same merchant
same amount
monthly pattern
```

---

# 10. Notification Engine

Folder:

```
services/notifications
```

Triggers:

```
budget 80% used
credit utilization > 70%
payment due in 3 days
spend spike
```

Use:

```
local notifications
```

---

# 11. Security Layer

---

## App Lock

Use:

```
react-native-biometrics
```

Support:

```
FaceID
Fingerprint
```

---

## Database Encryption

Use:

```
SQLCipher
```

Encryption key stored in:

```
Keychain
```

---

# 12. Background Tasks

Tasks:

```
email sync
insight generation
budget calculations
```

Use:

```
react-native-background-fetch
```

Schedule:

```
every 6 hours
```

---

# 13. Export & Backup

User can export:

```
CSV
JSON
```

File structure:

```
transactions.csv
budgets.csv
accounts.csv
```

Saved to:

```
device storage
```

---

# 14. AI Features (Phase 2)

Future upgrades:

---

## Natural Language Expense Entry

User types:

```
"Add 250 for lunch"
```

Parsed into transaction.

---

## Spend Forecasting

Predict:

```
end-of-month spending
```

---

## Financial Health Score

Score calculation:

```
savings rate
credit utilization
budget adherence
```

Range:

```
0-100
```

---

# 15. Development Phases

---

# Phase 1 — Core Ledger (2 weeks)

Implement:

```
accounts
transactions
manual expense entry
dashboard
```

---

# Phase 2 — Budgeting (1 week)

Add:

```
budget creation
budget progress
alerts
```

---

# Phase 3 — Credit Cards (1 week)

Add:

```
credit limit
utilization
due date alerts
```

---

# Phase 4 — Email Parsing (3 weeks)

Implement:

```
gmail oauth
email sync
transaction extraction
```

---

# Phase 5 — AI Categorization (1 week)

Add:

```
merchant ML classifier
```

---

# Phase 6 — Insights Engine (1 week)

Add:

```
spend analysis
financial health score
```

---

# 16. Testing Plan

Unit tests:

```
transaction parsing
categorization
budget calculations
```

Use:

```
jest
react-native-testing-library
```

---

# 17. Performance Targets

Startup time:

```
< 2 seconds
```

Database queries:

```
< 50 ms
```

AI inference:

```
< 100 ms
```

---

# 18. Risks

### Email parsing inconsistency

Different bank email formats.

Solution:

```
bank-specific parsing templates
```

---

### Merchant naming noise

Example:

```
AMAZON PAY INDIA MUMBAI
```

Solution:

```
merchant normalization rules
```

---

# 19. MVP Scope

The MVP must include:

```
manual transactions
credit cards
budgets
email parsing
categorization
dashboard
```

---

If you want, I can also produce **3 extremely useful things for a coding agent**:

1️⃣ **Complete SQLite schema + migrations**
2️⃣ **React Native folder + file scaffolding (100+ files)**
3️⃣ **Prompt templates to control AI coding agents like Cursor / Devin / GPT-Engineer**

These dramatically speed up building this app.
