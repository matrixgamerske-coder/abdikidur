import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";

const Terms = () => {
  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 font-ui text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Sign Up
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-8 neon-border"
          >
            <h1 className="font-display text-3xl font-black text-foreground mb-2">
              TERMS & <span className="text-primary neon-text">CONDITIONS</span>
            </h1>
            <p className="font-ui text-xs text-muted-foreground mb-8">Last updated: March 18, 2026</p>

            <div className="space-y-6 font-body text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Matrix Arena ("the Platform"), you agree to be bound by these Terms and Conditions.
                  If you do not agree with any part of these terms, you must not use the Platform.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">2. Account Registration</h2>
                <p>
                  To purchase games, you must create an account with accurate and complete information. You are responsible
                  for maintaining the confidentiality of your account credentials and for all activities under your account.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">3. Purchases & Payments</h2>
                <p>
                  All prices are displayed in Kenyan Shillings (KSH). Payments are processed securely through Pesapal.
                  Once a payment is confirmed, the game download link will be made available in your profile.
                  All sales are final — no refunds unless required by applicable law.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">4. License & Usage</h2>
                <p>
                  Purchasing a game grants you a non-exclusive, non-transferable, personal license to download and use the game
                  for personal, non-commercial purposes. You may not redistribute, resell, or share download links.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">5. Prohibited Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use the Platform for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to any part of the Platform</li>
                  <li>Share or distribute purchased content without authorization</li>
                  <li>Reverse engineer, decompile, or disassemble any software</li>
                  <li>Use bots, scrapers, or automated tools on the Platform</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">6. Intellectual Property</h2>
                <p>
                  All content on the Platform, including but not limited to game titles, images, descriptions, and the Platform
                  design, is the property of Matrix Arena or its licensors and is protected by intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">7. Limitation of Liability</h2>
                <p>
                  The Platform is provided "as is" without warranties of any kind. We shall not be liable for any indirect,
                  incidental, or consequential damages arising from your use of the Platform.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">8. Modifications</h2>
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective upon posting.
                  Continued use of the Platform constitutes acceptance of modified terms.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">9. Contact</h2>
                <p>
                  For questions about these Terms, contact us at{" "}
                  <span className="text-primary">support@matrixarena.com</span>.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
