# Unique Castle – Frontend

Modern, responsive apartment service charge management portal for **Unique Castle Apartments** (36 Units, Floors 1–9, Units A–D).

Built with **Vue.js 3 Composition API with JavaScript only** (no TypeScript), Vite, Tailwind CSS, Flowbite Vue, Pinia, Vue Router, Axios, SweetAlert2, jsPDF, and jspdf-autotable.

---

## 🛠️ Technology Stack
- **Framework**: Vue.js 3 (Composition API with `<script setup>`, JavaScript only)
- **Bundler**: Vite
- **Routing**: Vue Router 4 (Route guards for authenticated routes and role restrictions)
- **State Management**: Pinia (`authStore`, `dashboardStore`, `paymentStore`)
- **HTTP Client**: Axios with Bearer token interceptor and 401 handling
- **Styling**: Tailwind CSS & Flowbite Vue
- **Feedback & Alerts**: SweetAlert2 (dialogs, confirmations, error/success toasts)
- **PDF Generation**: jsPDF & jspdf-autotable (36-flat consolidated audit reports & resident statements)

---

## 📁 Project Architecture

```
src/
├── assets/
├── components/
│   ├── dashboard/
│   │   ├── AdminDashboardCards.vue     # Summary cards: Total 36 flats, Paid, Pending, Billed, Collected
│   │   ├── OwnerDashboardCards.vue     # Resident cards: Flat #, Bill, Paid, Due, Status
│   │   ├── PaymentStatusBadge.vue      # Normalized status badge (Paid, Pending, Not Paid, Rejected)
│   │   ├── PaymentFilter.vue           # Month, Year, Status, & Search filters
│   │   ├── AdminPaymentTable.vue       # 36 flats roster with verify/reject actions and sorting
│   │   └── OwnerPaymentTable.vue       # Monthly breakdown history with PDF download
│   ├── layout/
│   │   ├── AppSidebar.vue              # Exact 2 primary menu items: Dashboard & Pay Bills
│   │   ├── AppNavbar.vue               # Header branding, active billing pill & profile menu
│   │   └── ProfileDropdown.vue         # User role badge, profile link, and logout
│   ├── payments/
│   │   ├── ServiceChargeBreakdown.vue  # Water, Caretaker, Waste, Lift, Elect., Other fees
│   │   ├── BkashPaymentForm.vue        # Official bKash instructions, copy number & submit form
│   │   └── PaymentVerificationModal.vue# Super Admin review modal to verify or reject payments
│   └── reports/
│       ├── AdminMonthlyReport.vue      # 36-flat consolidated PDF generator
│       └── OwnerMonthlyReport.vue      # Resident individual monthly statement PDF
├── layouts/
│   └── DashboardLayout.vue             # Responsive layout container with collapsible mobile sidebar
├── pages/
│   ├── LoginPage.vue                   # User login with role demo quick-fill buttons
│   ├── DashboardPage.vue               # Role-based dashboard (Super Admin or Resident Owner)
│   ├── PayBillsPage.vue                # Monthly service fees & bKash submission gateway
│   ├── ProfilePage.vue                 # User information & apartment details
│   └── NotFoundPage.vue                # 404 handler
├── router/
│   └── index.js                        # Route definitions and authentication guards
├── services/
│   ├── api.js                          # Centralized Axios instance with Bearer token interceptor
│   ├── authService.js                  # /login and logout endpoints
│   ├── userService.js                  # /all-users and /register-update endpoints
│   ├── dashboardService.js             # /get-flats-by-month and /get-flats endpoints
│   ├── serviceFeeService.js            # /get-all-serviceFees and breakdown logic
│   ├── paymentService.js               # /service-fee-payment and /payment-verification endpoints
│   └── reportService.js                # Consolidated admin and owner PDF report data
├── stores/
│   └── authStore.js                    # Minimal auth session state (token & user credentials)
├── utils/
│   ├── currency.js                     # Bangladeshi Taka (৳ BDT) formatter
│   ├── date.js                         # Months, years, and human-readable date formatter
│   ├── paymentStatus.js                # Status normalizer (Paid, Not Paid, Pending Verification)
│   └── pdfGenerator.js                 # jsPDF & jspdf-autotable engine
├── App.vue
├── main.js
└── style.css

```

---

## ⚙️ Environment Variables & Configuration

Configuration is located in `.env` (sample provided in `.env.example`):

```env
# Unique Castle Backend API Configuration
# Change this URL to point to your real backend server
VITE_API_BASE_URL=http://localhost:8080/api

# Official bKash payment phone number
VITE_BKASH_PAYMENT_NUMBER=01712345678

# Mock fallback: When true, if your backend API is not yet running or returns 404,
# the app seamlessly demonstrates full functionality with realistic 36-flat data.
# Set to 'false' to strictly enforce live backend API responses.
VITE_USE_MOCK_FALLBACK=true
```

### Changing the Backend URL:
Open `.env` and update `VITE_API_BASE_URL` with your backend server URL (e.g., `http://localhost:5000/api` or `https://your-api.com/api`).

---

## 🔑 Demo Accounts (For Immediate Verification)

| Role | Username | Password | Flat Assignment | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `password123` | Management Office | View all 36 flats, verify/reject bKash payments, download 36-flat consolidated PDF |
| **Resident Owner** | `owner1` | `password123` | Flat 4B | View only Flat 4B, itemized service charges, submit bKash TrxID, download receipt |
| **Resident Owner 2** | `owner2` | `password123` | Flat 2A | View only Flat 2A, outstanding balance, submit bKash payment |

*(On the login screen, you can also click the 1-click demo filler buttons to auto-populate credentials).*

---

## 🚀 Running the Application Locally

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the Application**:
   Navigate to `http://localhost:5173` in your browser.

---

## 🔒 Security & Access Control
- Tokens are automatically attached as `Authorization: Bearer <token>` on all outbound Axios requests.
- If a `401 Unauthorized` response is received, the session is cleared and the user is redirected to the login page with a SweetAlert2 prompt.
- Route guards prevent unauthorized access to `/dashboard`, `/pay-bills`, and `/profile`.
- Role verification ensures resident owners only access their own apartment billing information.
