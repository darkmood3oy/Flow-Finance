# Security Specification - Flow Finance

## Data Invariants
1. A transaction must always belong to a `userId`.
2. A transaction's `userId` must match the authenticated user's `uid`.
3. `amount` must be a positive number.
4. `type` must be either 'income' or 'expense'.
5. `createdAt` must be set by the server.
6. User profiles can only be read and written by the owner.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a transaction with a `userId` that is not the current user's UID.
2. **Ghost Field Injection**: Adding an `isAdmin: true` field to a transaction document.
3. **Negative Amount**: Setting `amount: -100` on an expense.
4. **Invalid Type**: Setting `type: 'stolen_cash'`.
5. **Timestamp Protocol Violation**: Providing a client-side `createdAt` time instead of `request.time`.
6. **Immutable Field Breach**: Attempting to change `userId` or `createdAt` on an existing transaction.
7. **Unauthorized Profile Access**: Attempting to read another user's profile.
8. **Malicious ID**: Using a 2KB string as a transaction ID.
9. **Field Type Mismatch**: Providing a string for the `amount` field.
10. **State Shortcut**: Attempting to update a transaction without using the whitelisted update logic.
11. **PII Blanket Search**: Attempting to query all profiles without a `userId` filter.
12. **Insecure List**: Querying transactions without matching `userId`.

## The Test Runner
(Verifying these in the next turn once rules are drafted)
