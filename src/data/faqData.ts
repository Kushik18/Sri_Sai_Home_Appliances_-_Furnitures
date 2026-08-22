export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  followUps?: string[]; // IDs of follow-up questions
}

export const faqCategories = [
  { id: "orders", label: "Orders & Tracking" },
  { id: "delivery", label: "Delivery & Installation" },
  { id: "returns", label: "Returns & Warranty" },
  { id: "custom", label: "Custom Orders" },
  { id: "store", label: "Store Info & Hours" },
];

export const faqData: FAQItem[] = [
  // Orders & Tracking
  {
    id: "orders-1",
    category: "orders",
    question: "How do I track my order?",
    answer: "You can track your order by clicking on the 'Track Order' link in your confirmation email, or by logging into your account and visiting the 'My Orders' section.",
    followUps: ["orders-2"],
  },
  {
    id: "orders-2",
    category: "orders",
    question: "Can I modify or cancel my order?",
    answer: "Orders can be modified or cancelled within 24 hours of placement. Please contact our support team on WhatsApp immediately for assistance.",
  },
  
  // Delivery & Installation
  {
    id: "delivery-1",
    category: "delivery",
    question: "Do you offer home delivery?",
    answer: "Yes, we offer free home delivery for all major appliances and furniture within city limits. For locations outside our primary zone, a nominal delivery fee applies.",
    followUps: ["delivery-2", "delivery-3"],
  },
  {
    id: "delivery-2",
    category: "delivery",
    question: "What is your delivery timeframe?",
    answer: "In-stock items are typically delivered within 2-3 business days. Custom furniture may take 2-4 weeks. You will receive a call to schedule a convenient delivery slot.",
  },
  {
    id: "delivery-3",
    category: "delivery",
    question: "Is installation included?",
    answer: "Yes, basic installation is free for major appliances (like ACs, TVs, and washing machines) and furniture assembly is included. Specialized electrical or plumbing work may incur extra charges.",
  },

  // Returns & Warranty
  {
    id: "returns-1",
    category: "returns",
    question: "What's your warranty policy?",
    answer: "All appliances come with standard brand warranties (usually 1-2 years). Our furniture comes with a 1-year manufacturing defect warranty.",
    followUps: ["returns-2"],
  },
  {
    id: "returns-2",
    category: "returns",
    question: "Do you accept returns or exchanges?",
    answer: "We accept returns/exchanges within 7 days of delivery for unused appliances in original packaging. Furniture can be returned within 48 hours if there is a manufacturing defect.",
  },

  // Custom Orders
  {
    id: "custom-1",
    category: "custom",
    question: "Can I customize furniture?",
    answer: "Absolutely! We offer customization for most of our sofas, beds, and dining tables, including fabric, color, and size options.",
    followUps: ["custom-2"],
  },
  {
    id: "custom-2",
    category: "custom",
    question: "How do I place a custom order?",
    answer: "To place a custom order, you can either visit our store to explore materials, or use the 'Request Custom' button on any customizable product's page.",
  },

  // Store Info
  {
    id: "store-1",
    category: "store",
    question: "What are your store hours?",
    answer: "We are open Monday to Sunday, from 10:00 AM to 9:00 PM.",
    followUps: ["store-2"],
  },
  {
    id: "store-2",
    category: "store",
    question: "Where is your store located?",
    answer: "Our flagship store is located at 123 Main St, Commercial Hub, Your City. You can find directions on our website's footer.",
  },
];
