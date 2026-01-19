/**
 * Footer - Clean footer component with Tailwind CSS
 */

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🩸</span>
              BloodLink
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Professional blood donation management system connecting donors,
              hospitals, and healthcare providers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-900">
              Quick Links
            </h4>
            <ul className="list-none p-0 m-0 space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-600 hover:text-[#C62828] text-sm transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-[#C62828] text-sm transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/inventory"
                  className="text-gray-600 hover:text-[#C62828] text-sm transition-colors"
                >
                  Inventory
                </a>
              </li>
              <li>
                <a
                  href="/requests"
                  className="text-gray-600 hover:text-[#C62828] text-sm transition-colors"
                >
                  Blood Requests
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-900">
              Contact
            </h4>
            <ul className="list-none p-0 m-0 space-y-2">
              <li className="text-gray-600 text-sm">📧 info@bloodlink.com</li>
              <li className="text-gray-600 text-sm">📞 1-800-DONATE</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} BloodLink. All rights reserved. |
            Professional Healthcare Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
