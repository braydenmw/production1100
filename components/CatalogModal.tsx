import React from 'react';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-sm shadow-2xl border border-stone-200">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Full Catalog - Documents & Templates</h3>
          <button onClick={onClose} className="text-stone-600 hover:text-stone-900 text-xs">Close</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-stone-700 space-y-4">
          <p className="text-stone-600">This catalog is illustrative and tailored per sector. It lists representative outputs across 24+ categories. Request a sectora'specific pack for a precise listing.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Foundation</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>LOIs</li>
                <li>MOUs</li>
                <li>NDAs</li>
                <li>Term Sheets</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Strategic</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Business Cases</li>
                <li>Feasibility Studies</li>
                <li>White Papers</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Financial</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Financial Models</li>
                <li>Valuation Reports</li>
                <li>Capital Stack Memos</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Risk & Compliance</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Due Diligence Reports</li>
                <li>Sanctions Screening</li>
                <li>KYC/AML Packs</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Government & Policy</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Policy Briefs</li>
                <li>Cabinet Memos</li>
                <li>Regulatory Impact Statements</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Partnership & Matchmaking</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Partner Profiles</li>
                <li>Compatibility Briefs</li>
                <li>Intro Packs</li>
                <li>Syndication Outlines</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Procurement & Vendor</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>RFIs / RFPs</li>
                <li>Bid Evaluations</li>
                <li>Vendor Scorecards</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Legal & Governance</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Board Papers</li>
                <li>Governance Charters</li>
                <li>Shareholder Agreements</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Operations & Delivery</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Program Plans</li>
                <li>Critical Path Schedules</li>
                <li>SOPs</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Impact & ESG</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Impact Assessments</li>
                <li>ESG Scorecards</li>
                <li>Sustainability Disclosures</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Technology & Data</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Data Sharing Agreements</li>
                <li>DPIAs</li>
                <li>API Onboarding Kits</li>
              </ul>
            </div>
            <div className="rounded-sm border border-stone-200 p-4 bg-stone-50">
              <p className="font-semibold text-stone-900 mb-2">Sustainability & Climate</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Transition Plans</li>
                <li>Emissions Baselines</li>
                <li>Adaptation Roadmaps</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-stone-600">For the full sectora'specific catalog and letter templates, contact ADVERSIQ Consultant support.</p>
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;
