"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-900">
      <div className="flex-1 flex items-center">
        <Link href="/">
          <img src="/prompting-chile-logo-header.png" alt="Prompting Chile" className="h-20 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 flex justify-center space-x-8">
        <Link
          href="/"
          className={`hover:text-[#D4A574] transition-colors ${pathname === "/" ? "text-[#C28840]" : "text-white"}`}
        >
          Features
        </Link>
        <Link
          href="/about"
          className={`hover:text-[#D4A574] transition-colors ${pathname === "/about" ? "text-[#C28840]" : "text-white"}`}
        >
          About
        </Link>
        <Link
          href="/shop"
          className={`hover:text-[#D4A574] transition-colors ${pathname === "/shop" ? "text-[#C28840]" : "text-white"}`}
        >
          Shop
        </Link>
        <Link
          href="/blog"
          className={`hover:text-[#D4A574] transition-colors ${pathname.startsWith("/blog") ? "text-[#C28840]" : "text-white"}`}
        >
          Blog
        </Link>
        <Link
          href="/contact"
          className={`hover:text-[#D4A574] transition-colors ${pathname === "/contact" ? "text-[#C28840]" : "text-white"}`}
        >
          Contact
        </Link>
      </nav>
      <div className="flex-1 flex justify-end">
        <Link href="/contact">
          <Button className="bg-[#C28840] hover:bg-[#8B5A2B] text-white px-6 py-2 rounded-lg">Get Started</Button>
        </Link>
      </div>
    </header>
  )
}
