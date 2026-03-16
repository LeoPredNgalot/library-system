/**
 * inject-embed.js
 * Run this from your project root: node inject-embed.js
 * 
 * Injects the ?embed=true sidebar-hiding snippet into all inner page EJS files.
 */

const fs = require('fs');
const path = require('path');

const SNIPPET = `  <!-- Embed mode: hide sidebar when loaded inside iframe -->
  <script>
    if (new URLSearchParams(window.location.search).get('embed') === 'true') {
      document.documentElement.classList.add('embedded');
    }
  </script>
  <style>
    html.embedded .sidebar { display: none !important; }
    html.embedded .main    { margin-left: 0 !important; }
  </style>
`;

// Files to patch — adjust paths if your project structure differs
const FILES = [
  'views/bookViews/getAllBooks.ejs',
  'views/userViews/viewAllUsers.ejs',
  'views/librarianViews/viewAllLibrarians.ejs',
  'views/transactionViews/viewAllBorrowRecords.ejs',
  'views/transactionViews/reservationPage.ejs',
];

// Nav links that need ?embed=true added
const NAV_REPLACEMENTS = [
  // Books
  [/href="\/book\/get-all-books"/g,                    'href="/book/get-all-books?embed=true"'],
  // Students
  [/href="\/user\/view-all-users"/g,                   'href="/user/view-all-users?embed=true"'],
  // Librarians
  [/href="\/librarian\/view-all-librarians"/g,         'href="/librarian/view-all-librarians?embed=true"'],
  // Borrow (direct link)
  [/href="\/transaction\/view-all-borrow-records"/g,   'href="/transaction/view-all-borrow-records?embed=true"'],
  // Borrow (via redirect)
  [/href="\/transaction\/borrow"/g,                    'href="/transaction/borrow?embed=true"'],
  // Reservations
  [/href="\/transaction\/reservation"/g,               'href="/transaction/reservation?embed=true"'],
];

let patchedCount = 0;
let skippedCount = 0;

FILES.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠  SKIPPED (not found): ${filePath}`);
    skippedCount++;
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already patched
  if (content.includes('html.embedded')) {
    console.log(`✓  Already patched: ${filePath}`);
    return;
  }

  // 1. Inject snippet before </head>
  if (!content.includes('</head>')) {
    console.warn(`⚠  No </head> found in: ${filePath}`);
    return;
  }
  content = content.replace('</head>', SNIPPET + '</head>');

  // 2. Update nav links to include ?embed=true
  NAV_REPLACEMENTS.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });

  // 3. Preserve embed param in pagination links (viewAllUsers form)
  // Add hidden input to preserve embed on GET form submits
  // (viewAllUsers already handled via hidden input in the updated version)

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Patched: ${filePath}`);
  patchedCount++;
});

console.log(`\nDone! ${patchedCount} file(s) patched, ${skippedCount} skipped.`);
