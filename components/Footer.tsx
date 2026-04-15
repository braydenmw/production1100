import React, { useState } from 'react';
import { Cpu, Github, X, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyContent: React.FC = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-serif font-bold text-bw-gold mb-2">Ethical AI & Data Governance Framework</h3>
        <p className="text-sm text-gray-400 mb-4">Version 1.0 - May 2025</p>
        
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <h4 className="font-bold text-white mb-1">1. Our Commitment to Responsible AI & Ethical Data Stewardship</h4>
            <p>At ADVERSIQ Intelligence, we believe that Artificial Intelligence holds immense potential to unlock regional economic opportunities and foster inclusive, sustainable development globally. However, we recognize that this power must be wielded with profound responsibility. Our ADVERSIQ platform is being built upon a foundation of strong ethical principles and robust data governance practices. We are committed to ensuring our technology serves humanity, respects individual rights, and promotes equitable outcomes.</p>
            <p className="mt-2">This framework outlines our guiding principles for the ethical development and deployment of AI and the responsible management of data within the ADVERSIQ ecosystem. It is a living document and will evolve as AI technologies and global best practices advance.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-1">2. Core Ethical Principles for AI Development & Application</h4>
            <p><strong className="text-bw-gold/80">Human-Centricity & Beneficial Purpose:</strong> The primary objective of ADVERSIQ is to augment human intelligence and support decisions that lead to positive socio-economic outcomes, particularly for underserved regional communities. We prioritize applications of AI that aim to alleviate poverty, enhance inclusive growth, promote environmental sustainability, and improve governance, in alignment with the UN Sustainable Development Goals (SDGs).</p>
            <p className="mt-2"><strong className="text-bw-gold/80">Fairness & Non-Discrimination (Bias Mitigation):</strong> We acknowledge the potential for biases in data and algorithms. BWGA is committed to proactively identifying and mitigating such biases throughout the AI lifecycle - from data collection and model training to deployment and monitoring.</p>
            <p className="mt-2"><strong className="text-bw-gold/80">Transparency & Explainability (Appropriate to Context):</strong> While the deepest algorithmic complexities of our proprietary ADVERSIQ engine may remain trade secrets, we are committed to transparency regarding Data Sourcing, Methodological Approach (High-Level), and the Limitations of AI.</p>
            <p className="mt-2"><strong className="text-bw-gold/80">Accountability & Human Oversight (Human-in-the-Loop):</strong> ADVERSIQ operates on an AI-Human Symbiosis Model. Critical strategic recommendations are always subject to review, validation, and contextualization by qualified human experts.</p>
            <p className="mt-2"><strong className="text-bw-gold/80">Security & Safety:</strong> We are committed to developing AI systems that are robust, secure, and operate safely within their intended parameters, minimizing risks of unintended consequences.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-xl font-serif font-bold text-bw-gold mb-4">3. Data Governance & Privacy Principles</h3>
        <div className="space-y-4 text-sm text-gray-300">
          <p><strong className="text-white">Lawfulness, Fairness, and Transparency:</strong> ADVERSIQ will process data in compliance with applicable data protection laws and regulations in the jurisdictions where we operate, including principles aligned with GDPR and other relevant national frameworks.</p>
          <p><strong className="text-white">Data Minimization & Purpose Limitation:</strong> We strive to collect and process only the data necessary for the specific, legitimate purposes of regional economic analysis, investment matchmaking, and providing strategic insights. Primarily, ADVERSIQ leverages publicly available data, official government statistics, and third-party licensed data.</p>
          <p><strong className="text-white">Confidentiality & Security:</strong> Confidential information shared with ADVERSIQ by clients or partners will be protected through appropriate technical and organizational security measures and governed by strict Non-Disclosure Agreements (NDAs).</p>
          <p><strong className="text-white">Consent (Where Applicable):</strong> While ADVERSIQ primarily deals with aggregated or publicly available data, should any personal data be involved, its processing will be subject to explicit consent and clear information regarding its use.</p>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-xl font-serif font-bold text-bw-gold mb-4">4. Continuous Improvement & Stakeholder Engagement</h3>
        <div className="space-y-4 text-sm text-gray-300">
          <p>This Ethical AI & Data Governance Framework is not static. BWGA is committed to regularly reviewing and updating this framework, engaging in dialogue with experts, and providing appropriate training to our team on these ethical principles.</p>
          <p className="font-bold text-white">Our Pledge: BW Global Advisory is dedicated to harnessing the power of AI responsibly to create a more equitable and prosperous world by illuminating the potential of its regions.</p>
        </div>
      </div>
    </div>
  );

const TermsContent: React.FC = () => (
  <div className="space-y-8">
    {/* How to Use and Terms of Usage side by side */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
      {/* How to Use - System Overview */}
      <div>
        <h3 className="text-xl font-serif font-bold text-bw-gold mb-2">How to Use</h3>
        <p className="text-sm text-gray-400 mb-6">BWGA Ai System Overview | 7-Stage Strategic Intelligence Platform | Version 4.1</p>

        <div className="space-y-6 text-sm text-gray-300">
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
            <h4 className="font-bold text-bw-gold mb-2 text-lg">01 Input Context</h4>
            <p className="mb-2"><strong className="text-white">What it is:</strong> This is the foundational data-gathering phase. You will be guided through the "Primary Steps" (Identity, Mandate, Market, Risk) to build a comprehensive profile of your strategic goals.</p>
            <p><strong className="text-white">What you get:</strong> A complete, data-rich draft of your Strategic Roadmap that populates in real-time, serving as the single source of truth for all subsequent analysis.</p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
            <h4 className="font-bold text-bw-gold mb-2 text-lg">02 Analytical Processing</h4>
            <p className="mb-2"><strong className="text-white">What it is:</strong> The interactive analysis phase where you leverage the system's core intelligence. Here you can stress-test your strategy and uncover hidden insights using a suite of powerful analytical tools.</p>
            <p><strong className="text-white">What you get:</strong> Deeper, actionable insights by modeling financial outcomes with the "ROI Diagnostic", exploring possibilities with the "Scenario Planner", or scoring potential partners with the "Compatibility Engine".</p>
          </div>

          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
            <h4 className="font-bold text-bw-gold mb-2 text-lg">03 Report Generation</h4>
            <p className="mb-2"><strong className="text-white">What it is:</strong> The final output stage where you transition from the live draft to generating a suite of official, stakeholder-ready documents.</p>
            <p><strong className="text-white">What you get:</strong> After accepting the finalized draft, you unlock a comprehensive menu to generate tangible artifacts like a Full Strategic Dossier, Financial Models, and formal Letters of Intent, all tailored to specific audiences.</p>
          </div>
        </div>
      </div>

      {/* Terms of Usage - Legal Agreement */}
      <div>
        <h3 className="text-xl font-serif font-bold text-bw-gold mb-2">Terms of Usage</h3>
        <p className="text-sm text-gray-400 mb-4">Legal Agreement | Terms and Conditions of Service | Effective May 2025</p>

        <div className="space-y-6 text-sm text-gray-300">
          <p><strong className="text-white block mb-1">1. Intelligence Layer, Not a CRM:</strong> The ADVERSIQ is an "Early-Stage Intelligence Layer" designed to operate upstream of your CRM, ERP, or Investment Committee. It provides the initial "Go/No-Go" signals and strategic frameworks for regional engagement.</p>
          <p><strong className="text-white block mb-1">2. Decision Support, Not Authority:</strong> The system provides probabilistic insights and data-driven recommendations. Users, especially at 'Novice' levels, should verify critical outputs with 'Expert' domain holders. Final strategic decisions remain your sole responsibility.</p>
          <p><strong className="text-white block mb-1">3. Data Sovereignty & Isolation:</strong> The system adheres to strict GDPR and local data sovereignty protocols. Your custom operational data and strategic intents are cryptographically isolated and are never used to train public models.</p>
          <p><strong className="text-white block mb-1">4. Financial & Operational Simulations:</strong> All financial models (ROI, IRR, etc.) are simulations based on the data you provide and historical benchmarks. They are not to be construed as financial advice. The accuracy of these models scales dynamically with the granularity of your inputs.</p>
          <p><strong className="text-white block mb-1">5. Predictive Limits:</strong> Our proprietary dataset spans ~1925-2025, enabling the identification of long-wave economic cycles and historical failure patterns. However, unforeseen "black swan" events can impact predictive accuracy.</p>
          <p><strong className="text-white block mb-1">6. AI Agent Validation:</strong> Semi-autonomous AI agents construct intelligence dossiers within strict ethical and logical guardrails. It is the user's responsibility to validate critical data points before making final commitments.</p>
          <p><strong className="text-white block mb-1">7. No Guarantees & User Responsibility:</strong> While great effort has been made to ensure the accuracy of the data and analyses, this system is a decision-support tool, not a final say. The onus is on the user to verify all information before making financial or strategic commitments. We welcome feedback to help a better service.</p>
          <p><strong className="text-white block mb-1">8. Logical Integrity Protocol:</strong> The Neuro-Symbolic core enforces logical consistency. The system will flag or halt processes if user inputs fundamentally contradict established economic principles or fail data integrity checks.</p>
        </div>
      </div>
    </div>

    {/* Terms of Engagement & Compliance */}
    {/* About The Firm */}
    <div className="border-t border-gray-700 pt-6">
      <h3 className="text-xl font-serif font-bold text-bw-gold mb-4">About The Firm</h3>
      <div className="space-y-6 text-sm text-gray-300">
        <div>
          <h4 className="font-bold text-white mb-1">Company Profile</h4>
          <p>ADVERSIQ (Adversarial Intelligence Quorum) envisions a world where the latent economic potential of every regional city and community is unlocked, understood, and connected to strategic global opportunities. Our core mission is to bridge the critical "understanding gap" between regional potential and global capital through our proprietary AI intelligence platform.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-1">Origin Story: Why This System Exists</h4>
          <p>Founded by Brayden Walls, ADVERSIQ was born from over 12 months of intensive, "boots-on-the-ground" immersion in diverse regional economies. This firsthand experience revealed systemic challenges that traditional approaches often fail to address. ADVERSIQ is engineered to be different, combining a globally unique AI engine with founder-led insight.</p>
        </div>
      </div>
    </div>
  </div>
);

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="bg-bw-navy text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            
            <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="h-6 w-6 text-bw-gold" />
                  <span className="text-xl font-serif font-bold">
                  ADVERSIQ <span className="text-bw-gold">Intelligence</span>
                  </span>
              </div>
              <p className="text-xs text-gray-500">Adversarial Intelligence Quorum</p>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-400">
              <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors flex items-center gap-2">
                <Shield className="h-4 w-4" /> Privacy Policy
              </button>
              <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" /> Terms of Service
              </button>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} ADVERSIQ Intelligence. All rights reserved.</p>
            <p className="mt-2 md:mt-0 font-mono text-gray-600">ABN: 55 978 113 300</p>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-5xl bg-bw-navy border border-gray-700 rounded-lg shadow-2xl h-[85vh] max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-bw-navy/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {activeModal === 'privacy' ? <Shield className="h-5 w-5 text-bw-gold" /> : <FileText className="h-5 w-5 text-bw-gold" />}
                  {activeModal === 'privacy' ? 'Privacy & Governance' : 'Terms of Service'}
                </h2>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-h-0">
                <div className="max-w-none">
                  {activeModal === 'privacy' ? <PrivacyContent /> : <TermsContent />}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700 bg-black/20 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 bg-bw-gold text-bw-navy font-bold text-sm rounded-sm hover:bg-white transition-colors uppercase tracking-wide"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
