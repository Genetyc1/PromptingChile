import Link from "next/link"
import NewsletterForm from "./newsletter-form"

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#C28840] to-[#8B5A2B] bg-clip-text text-transparent mb-4">
              Prompting Chile
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Prompting Chile — Democratiza el acceso a la IA, Automatiza más inteligente, y Crea valor más rápido.
            </p>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-medium mb-3">Join our newsletter</h3>
              <NewsletterForm className="max-w-none" />
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Process
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Case studies
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Pages Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Pages</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h3 className="text-white font-medium mb-4">Socials</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#D4A574] text-sm transition-colors">
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-900 pt-6 flex justify-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Prompting Chile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
