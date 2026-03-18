import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";

const Privacy = () => {
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
              PRIVACY <span className="text-primary neon-text">POLICY</span>
            </h1>
            <p className="font-ui text-xs text-muted-foreground mb-8">Last updated: March 18, 2026</p>

            <div className="space-y-6 font-body text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">1. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong className="text-foreground">Account Information:</strong> Email address, username, and password when you register</li>
                  <li><strong className="text-foreground">Payment Information:</strong> Phone number and payment details processed securely through Pesapal</li>
                  <li><strong className="text-foreground">Usage Data:</strong> Pages visited, games viewed, and interaction patterns</li>
                  <li><strong className="text-foreground">Device Data:</strong> Browser type, IP address, and operating system</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">2. How We Use Your Information</h2>
                <p>Your information is used to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Provide and maintain the Platform</li>
                  <li>Process your purchases and deliver download links</li>
                  <li>Send transaction confirmations and support communications</li>
                  <li>Improve our services and user experience</li>
                  <li>Prevent fraud and ensure Platform security</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">3. Payment Processing</h2>
                <p>
                  We use Pesapal as our payment processor. Your payment information (including M-Pesa phone numbers,
                  card details) is processed directly by Pesapal and is not stored on our servers. Please review{" "}
                  <a href="https://www.pesapal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Pesapal's Privacy Policy
                  </a>{" "}
                  for details on how they handle your payment data.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">4. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information, including encryption,
                  secure authentication, and access controls. However, no method of transmission over the internet is
                  100% secure.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">5. Data Sharing</h2>
                <p>We do not sell your personal data. We may share information with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Payment processors (Pesapal) for transaction processing</li>
                  <li>Service providers who help us operate the Platform</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">7. Cookies</h2>
                <p>
                  We use essential cookies for authentication and session management. These are necessary for the
                  Platform to function properly. We do not use tracking or advertising cookies.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">8. Children's Privacy</h2>
                <p>
                  The Platform is not intended for children under 13. We do not knowingly collect personal information
                  from children under 13 years of age.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by
                  posting a notice on the Platform.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">10. Contact Us</h2>
                <p>
                  For privacy-related inquiries, contact us at{" "}
                  <span className="text-primary">privacy@matrixarena.com</span>.
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

export default Privacy;
