# Event Management System Assignment — What You Need to Build

## 1) Understand the Core Goal
You need to build an **Event Management System** web app that follows the provided flowchart/screens.

Your evaluator is checking:
- Correct module flow (as per chart).
- Correct role-based access (Admin vs User).
- Proper validations and session handling.
- Membership add/update logic with the exact defaults and rules mentioned.

Basic UI styling is acceptable; business flow and correctness matter most.

---

## 2) Functional Modules to Implement
Build these modules in this dependency order:

1. **Authentication + Session module**
   - Login pages with hidden password field.
   - Role detection (Admin/User/Vendor if present in your chart).
   - Session create, validate, destroy (logout).

2. **Maintenance module (mandatory first)**
   - Required because reports + transactions depend on master data.
   - Admin-only access.
   - Include membership maintenance + user/vendor maintenance according to chart.

3. **Transactions module**
   - Actions like request item, cart, checkout/order, status updates etc. (based on your chart).

4. **Reports module**
   - Role-appropriate reports/screens based on maintained and transaction data.

---

## 3) Access Control Rules (Must Match Assignment)
Implement strict authorization:

- **Admin can access:** Maintenance, Reports, Transactions.
- **User can access:** Reports, Transactions.
- **User cannot access:** Maintenance.

Practical implementation checklist:
- Hide unauthorized menu links in UI.
- Also enforce on backend/API routes (never rely only on UI hiding).
- If unauthorized user hits URL directly, return 403/redirect.

---

## 4) Flow & Navigation Requirements
- Overall flow should be the same as the chart.
- If the chart includes a “Chart” link on all pages, that is for navigation guidance and **not mandatory** in final working app.
- Keep navigation consistent: Home, module menus, back actions, logout.

Suggested route map:
- `/login`
- `/dashboard` (role-based)
- `/maintenance/*` (admin only)
- `/transactions/*`
- `/reports/*`
- `/logout`

---

## 5) Form Controls Rules
From your assignment constraints:

1. **Radio buttons**
   - Only one option selectable in a group.
   - Use same `name` attribute in HTML for grouped radios.

2. **Checkbox**
   - Checked = Yes/True.
   - Unchecked = No/False.
   - Store explicitly as boolean or Y/N.

3. **Password fields**
   - Use `type="password"` so input is masked.
   - Also hash passwords in backend before saving.

---

## 6) Validations You Must Implement
Add both client-side and server-side validation.

Common validations:
- Mandatory fields not empty.
- Email format valid.
- Mobile/number format valid length.
- Password constraints (min length etc., if specified by faculty).
- Dropdown/radio required selection where mandatory.

Error handling expectations:
- Show clear inline messages.
- Prevent save/update if validation fails.
- Keep previous user input when showing errors.

---

## 7) Membership Module (Critical, Explicitly Defined)

### A) Add Membership
Requirements:
- **All fields mandatory.**
- User must select exactly one duration:
  - 6 months
  - 1 year
  - 2 years
- **Default selected option = 6 months.**

Implementation checklist:
- Use radio group `membershipDuration` with default value `6_months`.
- Validate mandatory personal/member fields.
- Compute start date and end date automatically based on selected duration.
- Persist membership number (auto-generated preferred).

### B) Update Membership
Requirements:
- **Membership Number is mandatory.**
- Based on membership number, populate existing member details.
- User can either:
  - Extend membership, or
  - Cancel membership.
- **Default selection = six months extension.**

Implementation checklist:
- Search by membership number first.
- If not found, show "Membership not found".
- Extension options via radio:
  - 6 months (default)
  - 1 year
  - 2 years
- Cancellation via checkbox or action button.
- If cancel selected, mark status = Cancelled and set cancellation date.
- If extend selected, add duration from current expiry date (or today if expired, as per rule you define).

---

## 8) Session Management Requirements
Session must work properly across pages.

Mandatory behaviors:
- After login, store user id + role in session.
- Protect every private page by session middleware/guard.
- Session timeout/invalidation after logout.
- Browser back button should not reopen protected pages after logout (cache-control + auth checks).

---

## 9) Recommended Database Tables (Minimum)
Use simple schema if not provided:

- `users(id, name, email, password_hash, role, active)`
- `memberships(id, membership_no, member_name, email, phone, start_date, end_date, status, created_by, updated_by)`
- `membership_updates(id, membership_id, action_type, duration, action_date, remarks)`
- `vendors(id, name, category, contact, email, status)`
- `products(id, vendor_id, name, price, image_url, status)`
- `orders(id, user_id, total_amount, payment_method, order_status, created_at)`
- `order_items(id, order_id, product_id, qty, unit_price, total_price)`

This supports maintenance, transactions, and reports cleanly.

---

## 10) End-to-End Use Cases You Should Demonstrate

1. **Admin login** → sees maintenance + reports + transactions.
2. **User login** → does not see maintenance; direct access blocked.
3. **Add membership** with default 6 months and all fields mandatory.
4. **Update membership** by membership number; extend/cancel works.
5. **Transaction flow** (vendor/product/cart/checkout or your chart equivalent).
6. **Report view** generated from transaction/master data.
7. **Logout** and protected pages become inaccessible.

---

## 11) Test Checklist (Use for Viva/Demo)

Authentication & Access:
- Admin can open maintenance pages.
- User gets blocked from maintenance pages.
- Password input hidden.

Membership:
- Add form rejects empty fields.
- Add form defaults to 6 months.
- Update requires membership number.
- Update populates existing data.
- Default extension = 6 months.
- Cancel updates status correctly.

Session:
- Without login, private routes blocked.
- After logout, routes blocked.

Navigation:
- Flow follows chart sequence.

---

## 12) Suggested Build Plan (Day-wise)

- **Day 1:** Project setup, auth, role model, session guards.
- **Day 2:** Maintenance module (user/vendor/member masters).
- **Day 3:** Membership add/update with validations + default selections.
- **Day 4:** Transactions (vendor/product/cart/order flow).
- **Day 5:** Reports + polish + bug fixes.
- **Day 6:** Final testing against checklist + demo data.

---

## 13) Clarifications You Should Confirm With Faculty (If Needed)
If anything remains ambiguous, ask these exact questions:

1. Should membership extension be calculated from current expiry date or current date?
2. For cancellation, is the effect immediate or from end of current period?
3. Are reports required as on-screen tables only, or export (PDF/Excel) too?
4. Is Vendor role fully functional in grading or only Admin/User mandatory?
5. Should chart-link be included in submitted app or only in prototype/mock?

---

## 14) Quick Summary for You
Your highest-priority grading points are:
1. Correct role-based access.
2. Maintenance-first implementation.
3. Membership add/update rules exactly as specified.
4. Validations + session correctness.
5. Flow matching chart screens.

If you implement these accurately, even basic UI should pass well.