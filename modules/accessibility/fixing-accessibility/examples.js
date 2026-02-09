/**
 * Fixing Accessibility - Before/After Examples
 * Vanilla JS & React patterns for remediation
 */

/* ============================================
   1. ACCESSIBLE CARD COMPONENT
   ============================================ */

// ❌ BAD: Div soup, no semantics
const BadCard_HTML = `
<div class="card" onclick="openProduct(1)">
  <div class="card-img">
    <img src="product.jpg">
  </div>
  <div class="card-title">Wireless Headphones</div>
  <div class="card-price">$99.99</div>
  <div class="card-btn">Add to Cart</div>
</div>
`;

// ✅ GOOD: Semantic, keyboard accessible, screen reader friendly
const GoodCard_HTML = `
<article class="card">
  <img src="product.jpg" alt="Black wireless over-ear headphones">
  <h3>
    <a href="/products/1">Wireless Headphones</a>
  </h3>
  <p class="card-price">
    <span class="sr-only">Price: </span>$99.99
  </p>
  <button onclick="addToCart(1)" aria-label="Add Wireless Headphones to cart">
    Add to Cart
  </button>
</article>
`;


/* ============================================
   2. ACCESSIBLE TABLE (React)
   ============================================ */

// ❌ BAD: Div-based table
function BadTable({ data }) {
  return (
    <div className="table">
      <div className="row header">
        <div className="cell">Name</div>
        <div className="cell">Email</div>
        <div className="cell">Role</div>
      </div>
      {data.map(row => (
        <div className="row" key={row.id}>
          <div className="cell">{row.name}</div>
          <div className="cell">{row.email}</div>
          <div className="cell">{row.role}</div>
        </div>
      ))}
    </div>
  );
  // Screen reader: just reads "Name Email Role John..." — no table navigation
}

// ✅ GOOD: Semantic table with caption and headers
function GoodTable({ data, caption }) {
  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.role}</td>
            <td>
              <button aria-label={`Edit ${row.name}`}>Edit</button>
              <button aria-label={`Delete ${row.name}`}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  // Screen reader: "Table: Team Members, 3 rows, 4 columns. Row 1: Name John..."
}


/* ============================================
   3. ACCESSIBLE ACCORDION (React)
   ============================================ */

function Accordion({ items }) {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const headingId = `accordion-heading-${index}`;
        const panelId = `accordion-panel-${index}`;

        return (
          <div key={index}>
            <h3>
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #334155',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {item.title}
                <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              style={{ padding: isOpen ? '1rem' : 0 }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Usage:
// <Accordion items={[
//   { title: 'What is your return policy?', content: <p>30 days...</p> },
//   { title: 'How do I track my order?', content: <p>Visit order page...</p> },
// ]} />


/* ============================================
   4. ACCESSIBLE TOGGLE / SWITCH (React)
   ============================================ */

function Toggle({ label, checked, onChange, description }) {
  const id = React.useRef(`toggle-${Math.random().toString(36).slice(2)}`).current;
  const descId = description ? `${id}-desc` : undefined;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-describedby={descId}
        onClick={() => onChange(!checked)}
        style={{
          width: '48px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          background: checked ? '#22c55e' : '#475569',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '26px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            transition: 'left 0.2s',
          }}
        />
      </button>
      <div>
        <label htmlFor={id} style={{ cursor: 'pointer' }}>{label}</label>
        {description && (
          <div id={descId} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

// Usage:
// <Toggle
//   label="Dark Mode"
//   checked={isDark}
//   onChange={setIsDark}
//   description="Switch between light and dark themes"
// />
// Screen reader: "Dark Mode, switch, off. Switch between light and dark themes."


/* ============================================
   5. ACCESSIBLE PAGINATION (React)
   ============================================ */

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <nav aria-label="Pagination">
      <ul style={{ display: 'flex', gap: '0.25rem', listStyle: 'none', padding: 0 }}>
        {/* Previous */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            ← Previous
          </button>
        </li>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              style={{
                fontWeight: page === currentPage ? 'bold' : 'normal',
                background: page === currentPage ? '#3b82f6' : 'transparent',
                color: page === currentPage ? 'white' : '#e2e8f0',
                border: '1px solid #334155',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Next */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            Next →
          </button>
        </li>
      </ul>
    </nav>
  );
}


/* ============================================
   6. ACCESSIBLE NOTIFICATION SYSTEM (React)
   ============================================ */

function NotificationList({ notifications, onDismiss }) {
  return (
    <section aria-label="Notifications" aria-live="polite">
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul role="list" style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map(notif => (
            <li
              key={notif.id}
              role="article"
              aria-label={`Notification: ${notif.title}`}
              style={{
                padding: '1rem',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
              }}
            >
              <div>
                <strong>{notif.title}</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>{notif.message}</p>
                <time
                  dateTime={notif.createdAt}
                  style={{ fontSize: '0.8rem', color: '#64748b' }}
                >
                  {new Date(notif.createdAt).toLocaleString()}
                </time>
              </div>
              <button
                onClick={() => onDismiss(notif.id)}
                aria-label={`Dismiss notification: ${notif.title}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


/* ============================================
   7. NEXT.JS ACCESSIBLE PAGE TEMPLATE
   ============================================ */

/*
// app/layout.jsx — Root layout with a11y best practices
export const metadata = {
  title: {
    template: '%s | MyApp',    // Screen readers announce page title
    default: 'MyApp',
  },
  description: 'A fully accessible web application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Skip navigation *//*}
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <header role="banner">
          <nav aria-label="Main navigation">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>
        </header>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <footer role="contentinfo">
          <nav aria-label="Footer navigation">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
*/


export {
  GoodTable,
  Accordion,
  Toggle,
  Pagination,
  NotificationList,
};
