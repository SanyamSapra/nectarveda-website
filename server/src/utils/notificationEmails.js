import sendEmail from "./sendEmail.js";

const brandColor = "#0f766e";
const mutedColor = "#64748b";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatCurrency = (amount = 0) =>
  `Rs. ${Number(amount).toLocaleString("en-IN")}`;

const formatOrderId = (orderId) =>
  `#${orderId.toString().slice(-6).toUpperCase()}`;

const getProductName = (item) =>
  escapeHtml(item.product?.name || item.name || "Product");

const renderLayout = ({ title, preview, body }) => `
  <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <div style="padding:22px 24px;border-bottom:1px solid #e2e8f0;">
          <h1 style="margin:0;color:${brandColor};font-size:24px;letter-spacing:.4px;">NectarVeda</h1>
          <p style="margin:6px 0 0;color:${mutedColor};font-size:14px;">Ayurveda & Wellness</p>
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;">${escapeHtml(title)}</h2>
          <p style="margin:0 0 22px;color:${mutedColor};line-height:1.6;">${escapeHtml(preview)}</p>
          ${body}
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;color:#94a3b8;font-size:12px;">
        This is an automated email from NectarVeda.
      </p>
    </div>
  </div>
`;

const renderItemsTable = (items = []) => `
  <table style="width:100%;border-collapse:collapse;margin:18px 0;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;font-size:13px;color:#334155;">Product</th>
        <th style="padding:12px;font-size:13px;color:#334155;text-align:center;">Qty</th>
        <th style="padding:12px;font-size:13px;color:#334155;text-align:right;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item) => `
        <tr>
          <td style="padding:12px;border-top:1px solid #e2e8f0;">${getProductName(item)}</td>
          <td style="padding:12px;border-top:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-top:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
`;

const safeSendEmail = async (mailOptions) => {
  try {
    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Email notification failed:", error.message);
  }
};

export const sendWelcomeEmail = async (user) => {
  await safeSendEmail({
    to: user.email,
    subject: "Welcome to NectarVeda",
    html: renderLayout({
      title: `Welcome, ${user.name}!`,
      preview: "Your NectarVeda account is ready.",
      body: `
        <p style="margin:0;color:#334155;line-height:1.7;">
          Thank you for joining NectarVeda. You can now explore Ayurvedic products,
          save your details, and track your orders from your account.
        </p>
      `,
    }),
  });
};

export const sendAccountDeletedEmail = async (user) => {
  await safeSendEmail({
    to: user.email,
    subject: "Your NectarVeda account has been deleted",
    html: renderLayout({
      title: "Account deleted",
      preview: "Your NectarVeda account was deleted successfully.",
      body: `
        <p style="margin:0;color:#334155;line-height:1.7;">
          Hi ${escapeHtml(user.name)}, this confirms that your NectarVeda account
          and saved profile details have been removed. Existing order records may
          be retained for store and compliance records.
        </p>
      `,
    }),
  });
};

export const sendOrderPlacedEmail = async ({ user, order, items }) => {
  await safeSendEmail({
    to: user.email,
    subject: `Order placed ${formatOrderId(order._id)} - NectarVeda`,
    html: renderLayout({
      title: "Your order has been placed",
      preview: `We received your order ${formatOrderId(order._id)}.`,
      body: `
        <p style="margin:0;color:#334155;line-height:1.7;">
          Hi ${escapeHtml(user.name)}, your order is confirmed and currently processing.
        </p>
        ${renderItemsTable(items)}
        <p style="margin:18px 0 0;font-size:18px;font-weight:700;text-align:right;">
          Total: ${formatCurrency(order.totalAmount)}
        </p>
      `,
    }),
  });
};

export const sendAdminOrderPlacedEmail = async ({ to, user, order, items }) => {
  if (!to?.length) return;

  await safeSendEmail({
    to,
    subject: `New order ${formatOrderId(order._id)} - NectarVeda`,
    html: renderLayout({
      title: "New order received",
      preview: `${user.name} placed order ${formatOrderId(order._id)}.`,
      body: `
        <p style="margin:0;color:#334155;line-height:1.7;">
          Customer: <strong>${escapeHtml(user.name)}</strong><br />
          Email: ${escapeHtml(user.email)}
        </p>
        ${renderItemsTable(items)}
        <p style="margin:18px 0 0;font-size:18px;font-weight:700;text-align:right;">
          Total: ${formatCurrency(order.totalAmount)}
        </p>
      `,
    }),
  });
};

export const sendAdminLowStockEmail = async ({ to, products, threshold }) => {
  if (!to?.length || !products?.length) return;

  await safeSendEmail({
    to,
    subject: `Low stock alert - NectarVeda`,
    html: renderLayout({
      title: "Low stock alert",
      preview: `${products.length} product(s) reached ${threshold} stock or lower.`,
      body: `
        <table style="width:100%;border-collapse:collapse;margin:18px 0;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#f1f5f9;text-align:left;">
              <th style="padding:12px;font-size:13px;color:#334155;">Product</th>
              <th style="padding:12px;font-size:13px;color:#334155;text-align:right;">Stock</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((product) => `
              <tr>
                <td style="padding:12px;border-top:1px solid #e2e8f0;">${escapeHtml(product.name)}</td>
                <td style="padding:12px;border-top:1px solid #e2e8f0;text-align:right;">${product.stock}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `,
    }),
  });
};

export const sendOrderCancelledEmail = async ({ user, order }) => {
  await safeSendEmail({
    to: user.email,
    subject: `Order cancelled ${formatOrderId(order._id)} - NectarVeda`,
    html: renderLayout({
      title: "Your order has been cancelled",
      preview: `Order ${formatOrderId(order._id)} has been cancelled.`,
      body: `
        <p style="margin:0;color:#334155;line-height:1.7;">
          Hi ${escapeHtml(user.name)}, your order ${formatOrderId(order._id)} has been cancelled.
          If this was unexpected, please contact NectarVeda support.
        </p>
        ${renderItemsTable(order.items)}
        <p style="margin:18px 0 0;font-size:18px;font-weight:700;text-align:right;">
          Total: ${formatCurrency(order.totalAmount)}
        </p>
      `,
    }),
  });
};

export const sendOrderStatusEmail = async ({ user, order }) => {
  await safeSendEmail({
    to: user.email,
    subject: `Order ${order.orderStatus} ${formatOrderId(order._id)} - NectarVeda`,
    html: renderLayout({
      title: `Your order is ${order.orderStatus}`,
      preview: `Order ${formatOrderId(order._id)} status changed to ${order.orderStatus}.`,
      body: `
        <p style="margin:0;color:#334155;line-height:1.7;">
          Hi ${escapeHtml(user.name)}, your order ${formatOrderId(order._id)} is now
          <strong>${escapeHtml(order.orderStatus)}</strong>.
        </p>
      `,
    }),
  });
};
