import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                ME
              </span>
            </div>
            <span className="font-bold text-xl">My-ERP-Plan</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-6 py-24 text-center md:py-32">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
          <Shield className="mr-2 h-4 w-4" />
          AI-Powered Emergency Response Planning
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Be prepared for any
          <br />
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            emergency situation
          </span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Create comprehensive emergency response plans with AI assistance.
          Manage resources, coordinate teams, and respond effectively when it
          matters most.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start planning now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-12 py-24 md:py-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need to stay prepared
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive tools for emergency planning and response
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI-Generated Plans</h3>
            <p className="text-muted-foreground">
              Claude AI helps create comprehensive emergency plans tailored to
              your organization
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Resource Management</h3>
            <p className="text-muted-foreground">
              Track personnel, equipment, and facilities. Know what you have
              when you need it
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Invite team members, assign roles, and coordinate response
              efforts effectively
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Incident Response</h3>
            <p className="text-muted-foreground">
              Activate plans, track incidents in real-time, and document
              response actions
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 text-center md:py-32">
        <div className="mx-auto max-w-[700px] space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground">
            Create your first emergency response plan in minutes
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            Built with Next.js, Supabase, and Claude AI
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
