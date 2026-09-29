// import { Navbar } from "@/components/landing/navbar"
// import { Hero } from "@/components/landing/hero"

// export default function LandingPage() {
//   return (
//     <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
//       <Navbar />
//       <Hero />
//     </div>
//   )
// }



import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Footer } from "@/components/landing/sections"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  )
}