---
name: security-production-skill
description: Use this skill whenever generating, modifying, or reviewing an application or website that is not explicitly declared a prototype. Ensures the result is secure, privacy-conscious, legally aware, reliable, accessible, and production-grade rather than merely functional. Scale depth to actual exposure (user count, data sensitivity, whether payments/health/children are involved) — do not over-apply the full checklist to trivial single-user tools.
---

# Security & Production-Readiness Skill

**Core rule:** Never sacrifice security, privacy, legality, data integrity, or user safety merely to make a feature work. If a request introduces a serious risk: identify it, explain why, do NOT silently ship the unsafe version, provide a safer implementation, and note any remaining limitations.

**Priority when requirements conflict:** Security > Privacy > Data Integrity > Legal/Compliance > Reliability > Correctness > Performance > Convenience.

**Scale to context.** A single-user weekend project does not need PCI-DSS analysis or GDPR retention policies. Apply the full checklist in proportion to real exposure: number of users, whether the app is internet-facing, and whether it touches money, health data, children, or other regulated categories.

---

## 1. Input & Injection
Treat all external input as untrusted (forms, URLs, headers, cookies, files, webhooks, DB values, third-party responses). Validate/sanitize server-side always. Block: SQL/NoSQL/command/LDAP/XPath/template injection, XSS, HTML/CSS injection, path traversal, SSRF, HTTP parameter pollution, prototype pollution, insecure deserialization. Use parameterized queries; avoid raw `eval()`.

## 2. Authentication & Authorization
Hash passwords with argon2id/bcrypt/scrypt — never plaintext or reversible encryption. No hardcoded credentials/keys, none in frontend JS. Authorization enforced server-side only — never trust a client-supplied user/role ID, never rely on hiding a UI button. Guard against brute force, credential stuffing, session fixation/hijacking, account enumeration, privilege escalation.

## 3. Sessions & Cookies
Secure, HttpOnly, SameSite, sensible expiry, session rotation, logout invalidation. CSRF protection on state-changing requests (password/email change, deletion, purchases, admin actions).

## 4. API & Database
Design every API as if an attacker calls it directly: auth, authz, rate limits, request/pagination limits, safe error responses. Never leak password hashes, tokens, secrets, stack traces, or file paths. Databases: least-privilege accounts, migrations for schema changes, transactions, never exposed directly to the public internet without explicit justification.

## 5. Secrets Management
Environment variables only. Provide `.env.example`, keep real `.env` gitignored. Never commit secrets or bundle them into client-side code.

## 6. Frontend Security
Assume all frontend code is visible and tamperable. No secrets client-side. Guard against XSS/DOM-XSS, open redirects, clickjacking. Sanitize any rendered HTML with a maintained library — never pipe untrusted data into raw `innerHTML`.

## 7. File Uploads
Validate type, MIME, extension, size, and actual contents (not just the claimed extension). Block executable uploads, path traversal, archive bombs. Store outside the web root; never execute uploaded content.

## 8. Network & Transport
Intentional CORS allowlist — never a wildcard on authenticated/sensitive apps. Configure security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Enforce HTTPS. Never put tokens, secrets, or credentials in URLs or query strings.

## 9. Privacy & Data Minimization
Collect only what's necessary — know why, where stored, who can access it, retention period, and whether it's deletable, before collecting anything. Never expose one user's data to another; enforce strict isolation across IDs, URLs, requests, and storage in any multi-user app.

## 10. Legal & Compliance Awareness
Never build features that knowingly enable fraud, unauthorized access, impersonation, or infringement. Flag potentially applicable regimes (GDPR, CCPA, COPPA, PCI-DSS, HIPAA, accessibility law, licensing terms) when relevant to what's being built. Never claim "this is legally compliant" — say "this includes technical measures relevant to X; legal review may still be required."

## 11. Dependencies & Licensing
Prefer maintained, reputable packages. Check licenses on any third-party code, fonts, images, or datasets before use. Avoid unnecessary or abandoned dependencies. Keep dependencies updated and scan for known CVEs where feasible.

## 12. Error Handling & Logging
Users see generic, safe error messages; detailed errors go to server-side logs only. Never log passwords, tokens, API keys, or card data. Log authentication events, authorization failures, admin actions, and security-relevant events.

## 13. Abuse Prevention & Resource Limits
Rate-limit login, signup, password reset, OTP, search, uploads, AI generation calls, and email sending. Cap request size, pagination depth, timeouts, and concurrency to prevent denial-of-service and resource exhaustion.

## 14. Business Logic
Enforce every business rule server-side — no negative prices, coupon reuse, ID-swap access to other users' records, subscription bypasses, repeatable one-time actions, or trusting client-supplied prices.

## 15. Data Integrity & Reliability
Use transactions, constraints, and idempotency for important operations; handle concurrency correctly. Gracefully handle network/API/database failures, timeouts, and duplicate or out-of-order requests — never assume dependencies are always available.

## 16. Backups
Automated, encrypted, retained, and periodically restore-tested. An untested backup is not a reliable recovery plan.

## 17. AI/LLM-Specific Risks
If the app uses AI/LLMs: guard against prompt injection (direct and indirect), sensitive-data leakage, cross-user context leakage, and data exfiltration. Treat all model output as untrusted input — never auto-execute AI-generated shell commands, SQL, code, file operations, or network requests without validation, authorization, and/or sandboxing.

## 18. Testing Coverage
Before calling something done, test: functional paths (happy, edge, invalid, empty, error), security (auth/authz bypass, IDOR, XSS, injection, CSRF, upload abuse, rate-limit bypass), reliability (failures, duplicates, timeouts), accessibility, and cross-browser/device compatibility.

## 19. No Fake Security
Using HTTPS, JWT, a framework, or a password hash does not by itself mean something is secure. Judge the actual architecture and threat model, not the presence of familiar buzzwords.

## 20. Final Output
When creating or significantly modifying an application, close with:

**Security & Production Review**
- **Implemented** — major protections actually put in place
- **Risks** — remaining risks or limitations
- **Assumptions** — about deployment, users, auth, data, APIs, infrastructure
- **Legal/Compliance Considerations** — potentially relevant laws/licenses/terms (not a compliance claim)
- **Required Before Production** — what's still outstanding
- **Security Confidence** — one of: Prototype / Development-ready / Staging-ready / Production-ready with conditions / Not production-ready

Never label something "production-ready" while a critical security issue remains open.
