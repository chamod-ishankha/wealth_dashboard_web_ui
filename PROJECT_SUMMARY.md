# Wealth Dashboard - Personal Finance Tracker

## 📋 Project Overview

**Wealth Dashboard** is a modern, full-featured personal finance tracking web application built with **React**, **Firebase**, and **Tailwind CSS**. It empowers users to manage their expenses, track spending by category, set budgets, and gain insights into their financial habits through an intuitive, responsive interface.

The application supports **multi-tenant architecture** where each user's data is completely isolated and secure, with real-time synchronization across devices.

---

## 🎯 Vision

The vision for Wealth Dashboard is to be a **lightweight yet powerful personal finance management tool** that:

1. **Empowers user control**: Give individuals complete ownership of their financial data
2. **Real-time insights**: Provide instant visibility into spending patterns and budget status
3. **Customization**: Allow users to define their own expense categories and budgets tailored to their lifestyle
4. **Security & Privacy**: Ensure all financial data is encrypted, user-owned, and protected by robust security rules
5. **Cross-device sync**: Enable seamless access across desktop, tablet, and mobile devices
6. **Scalability**: Built on Firebase to handle growth without infrastructure management
7. **Extensibility**: Designed with modular architecture to easily add features like AI insights, bill reminders, and export capabilities

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ Authentication Layer (Login/Register/Profile) │ │
│  │ Dashboard (Overview & Filtering)               │ │
│  │ Transaction Management (CRUD)                  │ │
│  │ Category Manager (Custom Categories)           │ │
│  │ Budget & Analytics                             │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │  Firebase Backend   │
            ├──────────────────────┤
            │ • Authentication     │
            │ • Firestore DB       │
            │ • Real-time Sync     │
            │ • Security Rules     │
            └──────────────────────┘
```

### Data Flow

```
User Authentication
        ↓
AuthContext (Global State)
        ↓
Protected Routes
        ↓
Dashboard with Hooks:
  • useAuth() → User session
  • useTransactions(user) → Real-time transactions
  • useCategories(user) → User-defined categories
  • useMonthlySalaries(user) → Budget data
        ↓
Firestore Collections (userId-scoped)
  • transactions/
  • monthlyBudgets/
  • userCategories/
```

---

## 💡 Key Features

### 1. **Authentication System**

- **Registration**: Create new account with email/password
- **Login**: Secure login with email and password
- **Password Reset**: Self-service password recovery via email
- **Session Management**: Persistent sessions with automatic logout
- **Profile Management**: View and manage user profile information

### 2. **Transaction Management**

- **Add Transaction**: Create expenses with date, category, amount, type, and description
- **Edit Transaction**: Modify existing transaction details
- **Delete Transaction**: Remove transactions with confirmation
- **Real-time Sync**: All changes sync instantly across devices
- **Transaction Types**: Support for different transaction types (Expense, Income, etc.)

### 3. **Custom Categories**

- **Default Categories**: Users get predefined categories on signup (Fuel, Bills, Loan, Koko, Personal, Withdraw, Reload)
- **Add Categories**: Create new custom expense categories
- **Remove Categories**: Delete unused categories
- **Category Management**: Dedicated UI for managing all categories

### 4. **Budget & Financial Insights**

- **Monthly Salary**: Set and track monthly income/budget
- **Personal Limit**: Track personal expenses with configurable limit
- **Financial Summary**: View expense breakdown by category
- **Budget Status**: Visual indicators for remaining budget
- **Spending Trends**: Analyze spending patterns over time

### 5. **Advanced Filtering**

- **Year Filter**: Filter transactions by year
- **Month Filter**: Filter transactions by month
- **Period Selection**: Easy navigation between different time periods
- **Transaction Summary**: Group and summarize transactions by period

### 6. **Security & Data Isolation**

- **Multi-tenancy**: Complete data isolation per user with userId scoping
- **Firestore Security Rules**: Enforce user-level access control
- **Email Verification**: Secure account creation and recovery
- **Session-based Auth**: Firebase authentication tokens for API calls

### 7. **Responsive UI**

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Tailwind CSS**: Modern, utility-first CSS framework
- **Intuitive Navigation**: Easy-to-use navigation bar and routing
- **Visual Feedback**: Loading states, error messages, and success notifications

---

## 📁 File Structure

```
wealth_dashboard_web_ui/
├── src/
│   ├── components/                    # React components
│   │   ├── Navbar.jsx                # Navigation bar with profile access
│   │   ├── Login.jsx                 # Login form and logic
│   │   ├── Register.jsx              # Registration form and logic
│   │   ├── ResetPassword.jsx         # Password reset form
│   │   ├── Profile.jsx               # User profile management
│   │   ├── ProtectedRoute.jsx        # Route guard for authenticated routes
│   │   ├── DashboardSummary.jsx      # Transaction table and display
│   │   ├── TransactionsEntryForm.jsx # Form to add/edit transactions
│   │   ├── TransactionList.jsx       # List of filtered transactions
│   │   ├── StatCard.jsx              # Reusable stat display card
│   │   └── CategoryManager.jsx       # Custom category management
│   │
│   ├── context/
│   │   └── AuthContext.jsx           # Global auth state & functions
│   │       ├── register(email, password) → Create user + default categories
│   │       ├── login(email, password) → User login
│   │       ├── logout() → Sign out user
│   │       ├── resetPassword(email) → Send password reset email
│   │       └── useAuth() hook → Access user & auth functions
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.js                # Access AuthContext
│   │   ├── useTransactions.js        # Real-time transaction listener
│   │   ├── useCategories.js          # Real-time category listener
│   │   └── useMonthlySalaries.js     # Real-time salary/budget listener
│   │
│   ├── utils/
│   │   └── transactionStats.js       # Helper functions
│   │       ├── getPeriodKey(year, month)
│   │       ├── getAvailableYears(transactions)
│   │       ├── getAvailableMonthsForYear(transactions, year)
│   │       ├── calculateMonthlySummary(transactions, categoryMap)
│   │       ├── groupTransactionsByYearMonth(transactions)
│   │       ├── formatCurrentMonthLabel(year, month)
│   │       └── getTransactionType(categoryName)
│   │
│   ├── firebase.js                  # Firebase initialization & exports
│   ├── App.jsx                       # Main app component with dashboard
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Global Tailwind styles
│
├── public/
│   └── (static assets)
│
├── firestore.rules                   # Firestore security rules
├── firestore.indexes.json            # Firestore indexes configuration
├── firebase.json                     # Firebase project config
├── .firebaserc                       # Firebase project aliases
├── .env.local                        # Environment variables (not in git)
├── .gitignore                        # Git ignore rules
├── package.json                      # Project dependencies & scripts
├── vite.config.js                    # Vite build configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
└── index.html                        # HTML entry point
```

---

## 🗄️ Data Model

### Firestore Collections Structure

#### 1. **transactions**

Stores all user transactions with multi-tenant scoping.

```javascript
{
  id: "auto-generated",
  userId: "user_uid",               // For multi-tenant scoping
  date: Timestamp,                  // Transaction date
  year: number,                     // Year for filtering
  month: number,                    // Month for filtering
  monthIndex: number,               // 0-11 format
  dayOfWeek: string,                // Day name for analytics
  category: string,                 // Category ID/name
  transactionType: string,          // "expense", "income", etc.
  amount: number,                   // Transaction amount
  description: string,              // Optional notes
  createdAt: Timestamp,             // Created timestamp
  updatedAt: Timestamp              // Last updated timestamp
}
```

#### 2. **monthlyBudgets**

Stores monthly income/salary data for budgeting.

```javascript
{
  id: "auto-generated",
  userId: "user_uid",               // For multi-tenant scoping
  periodKey: "YYYY-MM",             // e.g., "2026-05"
  year: number,
  month: number,
  monthlySalary: number,            // Monthly budget/income
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 3. **userCategories**

Stores custom categories per user with defaults on signup.

```javascript
{
  id: `${userId}_categories`,       // Document ID format
  userId: "user_uid",
  categories: [                      // Array of category objects
    {
      id: string,                    // e.g., "fuel", "bills"
      name: string,                  // Display name: "Fuel", "Bills"
      type: string,                  // "expense", "fixed", "personal"
      color: string,                 // Hex color: "#F97316"
      icon: string                   // Emoji: "⛽"
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Security Rules

All collections enforce user-level access control:

- **Authentication Check**: User must be logged in
- **Ownership Verification**: User can only access their own data (via userId field)
- **Data Validation**: All fields validated on creation/update
- **Immutable User IDs**: Prevents unauthorized data ownership transfer

---

## 🚀 Tech Stack

| Category        | Technology        | Version                |
| --------------- | ----------------- | ---------------------- |
| **Frontend**    | React             | 18.3.1                 |
|                 | React Router      | 7.15.1                 |
|                 | Tailwind CSS      | 3.4.13                 |
| **Backend**     | Firebase          | 12.13.0                |
|                 | Firestore         | (included in Firebase) |
| **Build Tools** | Vite              | 5.4.8                  |
|                 | Vite React Plugin | 4.3.1                  |
| **Styling**     | PostCSS           | 8.4.47                 |
|                 | Autoprefixer      | 10.4.20                |

### Why These Technologies?

- **React**: Component-based UI, large ecosystem, great developer experience
- **Firebase**: Serverless backend, real-time database, built-in authentication, scales automatically
- **Firestore**: Document-based NoSQL database, excellent for multi-tenant apps, real-time listeners
- **Tailwind CSS**: Utility-first CSS, fast development, consistent design system
- **Vite**: Fast build tool, instant HMR, optimized production builds

---

## 🔐 Security Architecture

### Authentication Flow

```
User Registration
    ↓
Email/Password to Firebase Auth
    ↓
Create user account + UID
    ↓
Initialize default categories in Firestore
    ↓
Set session cookie
    ↓
Redirect to dashboard
```

### Data Access Control

```
User Request
    ↓
Firebase Auth Verification (JWT token)
    ↓
Firestore Security Rules Check:
  - Is user authenticated?
  - Does user own the document? (userId match)
  - Is data in correct format?
    ↓
ALLOW or DENY
```

### Environment Variables

```bash
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_APP_ID=xxx
```

---

## 📊 Application Flow

### User Journey

```
1. New User
   ├─ Visit app
   ├─ Click "Register"
   ├─ Enter email & password
   ├─ Firebase creates account + UID
   ├─ System creates default categories
   ├─ Redirect to dashboard
   └─ Ready to track expenses

2. Existing User
   ├─ Visit app
   ├─ Logged in? → Go to dashboard
   ├─ Not logged in → Show login
   ├─ Enter credentials
   ├─ Firebase verifies & sets session
   └─ Dashboard loads with real-time data

3. On Dashboard
   ├─ Select year/month filter
   ├─ View transactions for period
   ├─ View budget status
   ├─ Add new transaction
   │  ├─ Form validation
   │  ├─ Save to Firestore
   │  └─ Auto-update displayed data
   ├─ Edit/delete transaction
   ├─ Manage categories
   │  ├─ Add custom category
   │  └─ Remove unused category
   └─ View profile or logout
```

### Data Sync Flow

```
Firebase Auth
    ↓
AuthContext (Global state)
    ↓
useAuth() hook available to all components
    ↓
useTransactions(user) listener
    └─ Real-time updates on transaction changes
    ↓
useCategories(user) listener
    └─ Real-time updates on category changes
    ↓
useMonthlySalaries(user) listener
    └─ Real-time updates on budget changes
    ↓
React re-renders when data changes
    ↓
UI reflects latest data instantly
```

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 16+ and npm
- Firebase CLI
- A Firebase project (Spark plan free tier supported)

### Installation

1. **Clone repository**

   ```bash
   git clone <repo-url>
   cd wealth_dashboard_web_ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase config
   ```

4. **Start development server**

   ```bash
   npm run dev
   # Opens at http://localhost:5173
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build locally
   ```

### Firebase Setup

1. Create Firebase project at [firebase.google.com](https://firebase.google.com)
2. Copy credentials to `.env.local`
3. Initialize Firestore database
4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 📈 Current Implementation Status

### ✅ Completed Features

- [x] Firebase multi-tenant authentication
- [x] User registration, login, password reset
- [x] Real-time transaction CRUD operations
- [x] Year/month filtering on transactions
- [x] Monthly salary/budget tracking
- [x] Custom category management
- [x] Responsive dashboard UI
- [x] Transaction edit/delete functionality
- [x] Firestore security rules
- [x] React Router with protected routes
- [x] Navigation bar with user profile
- [x] **Optimized transaction schema** (minimal storage: date, year, monthIndex only)
- [x] **Safe-to-Spend calculator** (daily budget available computed on-the-fly)
- [x] **Installment progress tracker** (loans, Koko schemes, savings goals)

### 🚧 In Progress / Planned

- [ ] Transaction export (CSV/PDF)
- [ ] Spending analytics dashboard
- [ ] Budget alerts & notifications
- [ ] Recurring transactions
- [ ] Transaction tags & custom filters
- [ ] Bill reminders
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-currency support
- [ ] Data backup & import
- [ ] AI-powered insights
- [ ] Family budget sharing
- [ ] Integration with banks

---

## 📱 Component Breakdown

### Pages/Views

| Component             | Purpose                    | State                                 |
| --------------------- | -------------------------- | ------------------------------------- |
| `Login.jsx`           | User login screen          | Email, password, loading, error       |
| `Register.jsx`        | New account creation       | Email, password, name, loading, error |
| `ResetPassword.jsx`   | Password recovery          | Email, loading, success message       |
| `Profile.jsx`         | User profile management    | User info, edit form, loading         |
| `App.jsx` (Dashboard) | Main transaction interface | Transactions, filters, form data      |

### Reusable Components

| Component                    | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `Navbar.jsx`                 | Top navigation with profile access  |
| `ProtectedRoute.jsx`         | Route guard for authenticated users |
| `DashboardSummary.jsx`       | Transaction table with edit/delete  |
| `TransactionsEntryForm.jsx`  | Form to add/edit transactions       |
| `CategoryManager.jsx`        | Add/remove custom categories        |
| `StatCard.jsx`               | Reusable stat/summary card          |
| `SafeToSpendCalculator.jsx`  | Daily budget calculator (new)       |
| `InstallmentProgressBar.jsx` | Goal/loan progress tracker (new)    |

---

## 🎯 Advanced Features (Pre-Deployment Optimization)

### 1. Optimized Transaction Schema

**Benefit**: Reduce document size by 7-10%, improve read performance

- **Stored Fields**: `date`, `year`, `monthIndex` (minimal)
- **Computed Fields**: `dayOfWeek`, `monthName` (derived in JS via utilities)
- **Storage Savings**: ~25-35 bytes per document
- **Implementation**: See `src/utils/transactionStats.js`

**Key Utilities**:

- `getDayOfWeek(timestamp)` - Get day name from Firestore Timestamp
- `getMonthName(monthIndex)` - Get month name from 0-11 index
- `getMonthDaysCount(year, monthIndex)` - Days in month (handles leap years)
- `formatTimestampToDate(timestamp)` - Safe date formatting

### 2. Safe-to-Spend Daily Calculator

**Benefit**: Help users maintain budget discipline through intelligent daily limits

**Formula**: `(Remaining Budget) / (Remaining Days in Month)`

**Example**:

- Monthly Budget: 100,000
- Spent: 40,000
- Remaining Days: 16
- **Safe-to-Spend**: 3,750/day

**Features**:

- Real-time calculation as transactions change
- Status indicators (on-track, warning, exceeded)
- Visual progress bar showing budget consumption
- Color-coded alerts (green/amber/red)

**Component**: `SafeToSpendCalculator.jsx`

### 3. Installment & Goal Progress Tracker

**Benefit**: Track complex financial commitments (loans, Koko schemes, savings goals)

**Supported Types**:

- Loans (car loans, personal loans)
- Koko (rotating savings schemes)
- Savings goals (emergency fund, vacation savings)

**Data per Installment**:

- Target amount
- Current progress
- Monthly contribution
- Expected completion date
- Status (active, paused, completed)

**Features**:

- Visual progress bars with remaining amount
- Completion timeline
- Monthly commitment summary
- Pause/resume capability
- On-track/expedite indicators

**Component**: `InstallmentProgressBar.jsx`
**Hook**: `useInstallments(user)`
**Collection**: `activeInstallments`

---

## 🔧 Customization Guide

### Adding a New Category Type

1. Update `DEFAULT_CATEGORIES` in `useCategories.js`
2. Add category type handling in `transactionStats.js`
3. Update Firestore rules if needed

### Modifying Budget Logic

1. Edit `personalBudgetLimit` in `App.jsx`
2. Update calculation in `calculateMonthlySummary()`
3. Update UI in `StatCard.jsx` for visual feedback

### Adding New Hooks

Create new hook in `src/hooks/`:

```javascript
export default function useNewFeature(user) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    // Set up Firestore listener
    const unsubscribe = onSnapshot(
      query(collection(db, "collection"), where("userId", "==", user.uid)),
      (snapshot) => {
        setData(snapshot.docs.map((doc) => doc.data()));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user?.uid]);

  return { data, loading };
}
```

---

## 🐛 Troubleshooting

### Firebase Connection Issues

- Verify environment variables are set correctly
- Check Firebase project exists and is active
- Ensure Firestore database is initialized
- Check security rules aren't blocking access

### Real-time Updates Not Working

- Ensure user is authenticated (check `useAuth()`)
- Verify Firestore listener is set up correctly
- Check browser console for errors
- Verify data matches collection schema

### Category Not Appearing

- Check user has categories document in `userCategories` collection
- Verify data format matches expected structure
- Clear browser cache and refresh

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## 📄 License

This project is private and confidential.

---

## 👨‍💼 Project Maintainer

**Chamod** - Full-stack development

---

**Last Updated**: May 2026
