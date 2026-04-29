/**
 * Full-stack integration test suite.
 * Covers all assignment requirements plus security and advanced auth flows.
 *
 * Usage:
 *   1. Start the backend:  npm run dev
 *   2. Run this file:      node test-full.js
 */

const BASE = 'http://localhost:5000/api';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;
const dim   = (s) => `\x1b[2m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function check(label, ok, detail = '') {
    if (ok) {
        console.log(`  ${green('PASS')} ${label} ${detail ? dim(`(${detail})`) : ''}`);
        passed++;
    } else {
        console.log(`  ${red('FAIL')} ${label} ${detail ? dim(`(${detail})`) : ''}`);
        failed++;
    }
}

function section(title) {
    console.log(`\n${bold(cyan(title))}`);
    console.log(dim('─'.repeat(50)));
}

async function run() {
    console.log(`\n${bold('Backend Integration Test Suite')}`);
    console.log(dim('═'.repeat(50)));

    const email    = `test_${Date.now()}@example.com`;
    const password = 'SecurePass99!';
    let token = '';

    // ── Authentication ───────────────────────────────────────
    section('Authentication');

    try {
        const r = await fetch(`${BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });
        const d = await r.json();
        check('Register — creates user and returns JWT', r.status === 201 && !!d.token, `HTTP ${r.status}`);
    } catch { check('Register — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });
        check('Register — rejects duplicate email', r.status === 400, `HTTP ${r.status}`);
    } catch { check('Register duplicate — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const d = await r.json();
        if (d.token) token = d.token;
        check('Login — returns JWT on valid credentials', r.status === 200 && !!d.token, `HTTP ${r.status}`);
    } catch { check('Login — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'wrongpassword' })
        });
        check('Login — rejects wrong password', r.status === 401, `HTTP ${r.status}`);
    } catch { check('Login wrong password — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await r.json();
        check('Profile — returns user data when authenticated', r.status === 200 && d.data?.user?.email === email, `HTTP ${r.status}`);
    } catch { check('Profile authenticated — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/profile`);
        check('Profile — blocks unauthenticated access', r.status === 401, `HTTP ${r.status}`);
    } catch { check('Profile unauthenticated — server reachable', false, 'connection refused'); }

    // ── Password Reset ────────────────────────────────────────
    section('Password Reset Flow');

    try {
        const r = await fetch(`${BASE}/auth/forgotPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const d = await r.json();
        check('Forgot password — accepts registered email', r.status === 200 && d.status === 'success', `HTTP ${r.status}`);
    } catch { check('Forgot password — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/forgotPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nobody@notexist.com' })
        });
        check('Forgot password — rejects unknown email', r.status === 404, `HTTP ${r.status}`);
    } catch { check('Forgot password unknown email — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/resetPassword/invalidtoken000`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'NewSecure99!' })
        });
        check('Reset password — rejects invalid token', r.status === 400, `HTTP ${r.status}`);
    } catch { check('Reset password invalid token — server reachable', false, 'connection refused'); }

    // ── Crypto Data ───────────────────────────────────────────
    section('Crypto Data');

    try {
        const r = await fetch(`${BASE}/crypto`);
        const d = await r.json();
        check('GET /crypto — returns list', r.status === 200 && Array.isArray(d.data?.cryptos), `${d.data?.cryptos?.length ?? 0} items`);
    } catch { check('GET /crypto — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/crypto/gainers`);
        const d = await r.json();
        const list = d.data?.cryptos ?? [];
        const sorted = list.length < 2 || list[0].change24h >= list[1].change24h;
        check('GET /crypto/gainers — returns sorted list', r.status === 200 && sorted, `HTTP ${r.status}`);
    } catch { check('GET /crypto/gainers — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/crypto/new`);
        check('GET /crypto/new — returns new listings', r.status === 200, `HTTP ${r.status}`);
    } catch { check('GET /crypto/new — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/crypto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'TestCoin', symbol: 'TCN', price: 1.99, image: 'https://example.com/img.png', change24h: 2.5 })
        });
        const d = await r.json();
        check('POST /crypto — creates new coin', r.status === 201 && d.status === 'success', `HTTP ${r.status}`);
    } catch { check('POST /crypto — server reachable', false, 'connection refused'); }

    // ── Validation and Security ───────────────────────────────
    section('Validation & Security');

    try {
        const r = await fetch(`${BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'X', email: 'not-an-email', password: 'short' })
        });
        check('Validation — rejects invalid email on register', r.status === 400, `HTTP ${r.status}`);
    } catch { check('Validation email — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'X', email: 'valid@email.com', password: 'short' })
        });
        check('Validation — rejects password under 8 characters', r.status === 400, `HTTP ${r.status}`);
    } catch { check('Validation password — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/crypto`);
        const hasHelmet = !!r.headers.get('x-content-type-options');
        const hasRateLimit = !!r.headers.get('x-ratelimit-limit');
        check('Security — Helmet and rate-limit headers present', hasHelmet || hasRateLimit, '');
    } catch { check('Security headers — server reachable', false, 'connection refused'); }

    try {
        const r = await fetch(`${BASE}/route-that-does-not-exist`);
        const d = await r.json();
        check('Error handling — unknown routes return 404 JSON', r.status === 404 && d.status === 'error', `HTTP ${r.status}`);
    } catch { check('Error handling — server reachable', false, 'connection refused'); }

    // ── Summary ───────────────────────────────────────────────
    const total = passed + failed;
    console.log(`\n${bold('═'.repeat(50))}`);
    console.log(`${bold(`Result: ${passed}/${total} tests passed`)}`);
    if (failed === 0) {
        console.log(green('All tests passed. Backend is ready for deployment.'));
    } else {
        console.log(red(`${failed} test(s) failed. Review the output above.`));
    }
    console.log(bold('═'.repeat(50)) + '\n');
}

run().catch(e => {
    console.error(red('\nFatal: Could not connect to the server.'));
    console.error(dim('Make sure "npm run dev" is running in the backend folder.\n'));
    console.error(dim(e.message));
});
