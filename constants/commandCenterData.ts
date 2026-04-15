// Command Center Data - Test Scenarios, Document Categories, and Content
// Extracted for maintainability and cleaner component structure

export interface TestScenarioSource {
    name: string;
    url: string;
}

export interface KeyMetric {
    label: string;
    value: string;
    source: string;
}

export interface RecommendedPartner {
    name: string;
    role: string;
    contact: string;
    priority: string;
}

export interface NextSteps {
    immediate: string[];
    shortTerm: string[];
    documentation: string[];
    recommendedPartners: RecommendedPartner[];
    nextReport: string;
    estimatedTimeline: string;
}

export interface TestScenario {
    id: number;
    entity: string;
    country: string;
    sector: string;
    dealSize: string;
    flag: string;
    SPI: number;
    IVAS: number;
    risk: string;
    summary: string;
    p10: string;
    p50: string;
    p90: string;
    keyRisk: string;
    marketContext: string;
    regulatoryFramework: string;
    financialStructure: string;
    sources: TestScenarioSource[];
    keyMetrics: KeyMetric[];
    nextSteps: NextSteps;
}

export const testScenarios: TestScenario[] = [
    { 
        id: 1, 
        entity: "Sao Paulo Housing Authority", 
        country: "Brazil", 
        sector: "Urban Dev", 
        dealSize: "$75M", 
        flag: "🇧🇷", 
        SPI: 72, 
        IVAS: 68, 
        risk: "Medium", 
        summary: "Public-Private Partnership for affordable housing development in Sao Paulo's eastern periphery, targeting 12,000 units over 5 years under Brazil's Casa Verde e Amarela program.",
        p10: "$62M", 
        p50: "$75M", 
        p90: "$89M", 
        keyRisk: "FX exposure (BRL volatility at 18% annual), political transition risk with 2026 municipal elections, and IBAMA environmental licensing delays.",
        marketContext: "Brazil's housing deficit stands at 5.8 million units (Fundacao Joao Pinheiro, 2023). Sao Paulo state accounts for 1.2 million of this deficit. The Casa Verde e Amarela program provides subsidized financing at 4.5-8% annual rates for families earning up to R$8,000/month.",
        regulatoryFramework: "Projects require IBAMA environmental impact assessment (EIA-RIMA), municipal zoning approval (Lei de Uso e Ocupacao do Solo), and Caixa Economica Federal technical approval for federal subsidies.",
        financialStructure: "70% debt financing via BNDES FINEM (TJLP + 1.5%), 20% federal subsidies, 10% private equity. Expected IRR of 14-18% in BRL terms, subject to construction cost indexation (INCC).",
        sources: [
            { name: "Fundacao Joao Pinheiro - Deficit Habitacional 2023", url: "https://fjp.mg.gov.br" },
            { name: "Caixa - Casa Verde e Amarela Guidelines", url: "https://www.caixa.gov.br/voce/habitacao" },
            { name: "BNDES - Infrastructure Financing Conditions", url: "https://www.bndes.gov.br/wps/portal/site/home/financiamento" },
            { name: "BCB - Exchange Rate Statistics", url: "https://www.bcb.gov.br/estatisticas/txcambio" }
        ],
        keyMetrics: [
            { label: "Housing Deficit (SP)", value: "1.2M units", source: "FJP 2023" },
            { label: "BRL/USD Volatility", value: "18% annual", source: "BCB" },
            { label: "BNDES Rate", value: "TJLP + 1.5%", source: "BNDES" },
            { label: "Subsidy Coverage", value: "Up to 90%", source: "Caixa" }
        ],
        nextSteps: {
            immediate: [
                "Schedule introductory call with Sao Paulo Housing Secretariat (Secretaria Municipal de Habitacao)",
                "Request preliminary project documentation and environmental pre-assessment status",
                "Obtain current Casa Verde e Amarela allocation for Eastern Zone developments"
            ],
            shortTerm: [
                "Conduct site visit to proposed development zones in Itaim Paulista and Cidade Tiradentes",
                "Commission independent land title verification through Brazilian registry (Cartorio de Registro)",
                "Engage local construction cost consultant for INCC-adjusted budget validation"
            ],
            documentation: [
                "Letter of Intent (LOI) - Housing PPP Framework Agreement",
                "Due Diligence Request List - Real Estate & Environmental",
                "Term Sheet - BNDES FINEM Co-financing Structure",
                "MOU - Social Housing Delivery & Impact Metrics"
            ],
            recommendedPartners: [
                { name: "BNDES (Banco Nacional de Desenvolvimento)", role: "Primary DFI Lender", contact: "Area de Infraestrutura Social", priority: "Critical" },
                { name: "Caixa Economica Federal", role: "Federal Subsidy Administrator", contact: "Superintendencia Regional SP", priority: "Critical" },
                { name: "IFC Brazil", role: "Co-investment Partner", contact: "Sao Paulo Infrastructure Team", priority: "High" },
                { name: "Patria Investimentos", role: "Local PE Partner", contact: "Real Assets Division", priority: "Medium" },
                { name: "Votorantim Cimentos", role: "Construction Materials Partner", contact: "Housing Segment", priority: "Medium" }
            ],
            nextReport: "Full Investment Memorandum with 10-Year Cash Flow Model",
            estimatedTimeline: "Initial engagement: 2-3 weeks | Due diligence: 6-8 weeks | LOI execution: 12-14 weeks"
        }
    },
    { 
        id: 2, 
        entity: "Singapore FinTech Association", 
        country: "Singapore", 
        sector: "FinTech", 
        dealSize: "$12M", 
        flag: "🇸🇬", 
        SPI: 89, 
        IVAS: 91, 
        risk: "Low", 
        summary: "RegTech platform licensing deal for cross-border payment compliance under MAS Payment Services Act. SaaS model with 47 banks in pilot program.",
        p10: "$10M", 
        p50: "$12M", 
        p90: "$16M", 
        keyRisk: "Technology obsolescence risk (3-5 year cycle), MAS regulatory evolution, and talent retention in competitive Singapore market.",
        marketContext: "Singapore processes $1.2 trillion in cross-border payments annually (MAS 2023). The Payment Services Act 2019 requires all payment service providers to implement robust AML/CFT compliance systems. RegTech adoption grew 340% from 2020-2024.",
        regulatoryFramework: "MAS Technology Risk Management Guidelines (TRMG), Personal Data Protection Act (PDPA), and Payment Services Act licensing requirements. ISO 27001 certification mandatory.",
        financialStructure: "100% equity raise at $40M pre-money valuation. Revenue model: $15,000/month base license + $0.02 per transaction for volumes above 100K/month. 47 banks in pilot, 12 signed LOIs.",
        sources: [
            { name: "MAS - Payment Services Statistics", url: "https://www.mas.gov.sg/statistics/payment-services" },
            { name: "MAS - Technology Risk Management Guidelines", url: "https://www.mas.gov.sg/regulation/guidelines/technology-risk-management-guidelines" },
            { name: "Singapore FinTech Association - Industry Report 2024", url: "https://singaporefintech.org/research" },
            { name: "PDPC - Data Protection Guidelines", url: "https://www.pdpc.gov.sg" }
        ],
        keyMetrics: [
            { label: "Cross-border Volume", value: "$1.2T/year", source: "MAS 2023" },
            { label: "RegTech Growth", value: "340%", source: "SFA 2024" },
            { label: "Banks in Pilot", value: "47", source: "Internal" },
            { label: "License Revenue", value: "$15K/mo", source: "Term Sheet" }
        ],
        nextSteps: {
            immediate: [
                "Arrange meeting with SFA Executive Committee and Technology Working Group",
                "Request access to pilot program performance data and bank feedback summaries",
                "Review MAS Payment Services License application status and conditions"
            ],
            shortTerm: [
                "Conduct technology due diligence with independent cybersecurity assessor",
                "Interview 5-7 pilot bank stakeholders for product-market fit validation",
                "Assess competitive landscape: Tookitaki, Silent Eight, NICE Actimize positioning"
            ],
            documentation: [
                "Term Sheet - Series A Equity Investment",
                "Technology Due Diligence Report - ISO 27001 & MAS TRMG Compliance",
                "Commercial Agreement - Regional Expansion Rights (ASEAN+)",
                "LOI - Strategic Partnership with Anchor Bank Customer"
            ],
            recommendedPartners: [
                { name: "Temasek Holdings", role: "Lead Strategic Investor", contact: "FinTech Investment Team", priority: "Critical" },
                { name: "GIC Private Limited", role: "Co-Investor", contact: "Technology Investments Group", priority: "High" },
                { name: "DBS Bank", role: "Anchor Customer & Distribution Partner", contact: "Chief Data Office", priority: "Critical" },
                { name: "Vertex Ventures SEA", role: "VC Lead", contact: "FinTech Practice", priority: "High" },
                { name: "Cloud Singapore", role: "Cloud Infrastructure Partner", contact: "Financial Services Solutions", priority: "Medium" }
            ],
            nextReport: "Technology Assessment & Competitive Positioning Analysis",
            estimatedTimeline: "Initial engagement: 1-2 weeks | Due diligence: 4-6 weeks | Term sheet: 8-10 weeks"
        }
    },
    { 
        id: 3, 
        entity: "Chilean Green Hydrogen Valley", 
        country: "Chile", 
        sector: "Energy", 
        dealSize: "$450M", 
        flag: "🇨🇱", 
        SPI: 78, 
        IVAS: 74, 
        risk: "Medium-High", 
        summary: "Large-scale green hydrogen production facility in Magallanes Region utilizing Chile's exceptional wind resources (capacity factor >60%). Target: 25,000 tonnes H2/year by 2029.",
        p10: "$320M", 
        p50: "$450M", 
        p90: "$580M", 
        keyRisk: "Offtake agreement certainty (80% must be pre-committed), electrolyzer technology selection, and Port of Punta Arenas export infrastructure.",
        marketContext: "Chile's National Green Hydrogen Strategy targets 25GW electrolyzer capacity by 2030. Magallanes Region has world-class wind resources (average 12 m/s). Chile aims to produce the world's cheapest green hydrogen at <$1.50/kg by 2030.",
        regulatoryFramework: "CORFO green hydrogen incentives, SEA environmental assessment, SEC electrical grid connection approval, and SAG water rights. Tax incentives under Hydrogen Law (2023).",
        financialStructure: "40% DFI concessional debt (IFC/IADB at SOFR + 2%), 35% commercial debt, 25% equity. 15-year offtake agreements required with European/Asian buyers. CAPEX: $18,000/kW electrolyzer.",
        sources: [
            { name: "Chile Ministry of Energy - National Green Hydrogen Strategy", url: "https://energia.gob.cl/h2" },
            { name: "CORFO - Green Hydrogen Investment Incentives", url: "https://www.corfo.cl/sites/cpp/hidrogeno-verde" },
            { name: "IEA - Global Hydrogen Review 2024", url: "https://www.iea.org/reports/global-hydrogen-review-2024" },
            { name: "IRENA - Green Hydrogen Cost Reduction", url: "https://www.irena.org/publications/2020/Dec/Green-hydrogen-cost-reduction" }
        ],
        keyMetrics: [
            { label: "Wind Capacity Factor", value: ">60%", source: "Energy Ministry" },
            { label: "Target H2 Cost", value: "<$1.50/kg", source: "Nat'l Strategy" },
            { label: "Production Target", value: "25,000 t/yr", source: "Project Spec" },
            { label: "DFI Rate", value: "SOFR + 2%", source: "IFC Term Sheet" }
        ],
        nextSteps: {
            immediate: [
                "Initiate dialogue with CORFO Green Hydrogen Program Director",
                "Request access to Magallanes wind resource data and grid connection studies",
                "Obtain preliminary offtake interest letters from European industrial buyers"
            ],
            shortTerm: [
                "Conduct site assessment at Punta Arenas port for export infrastructure feasibility",
                "Commission independent electrolyzer technology comparison (Nel, ITM, Plug Power)",
                "Engage with potential EPC contractors: Technip Energies, Linde, Air Liquide"
            ],
            documentation: [
                "Heads of Terms - Green Hydrogen Offtake Agreement (FOB Punta Arenas)",
                "Development Agreement - Project Company Formation & Governance",
                "Term Sheet - DFI Concessional Debt Facility (IFC/IADB)",
                "MOU - Technology Partnership & License Agreement",
                "EIA Scoping Report - SEA Environmental Pre-Assessment"
            ],
            recommendedPartners: [
                { name: "IFC (World Bank Group)", role: "Lead DFI Lender", contact: "Chile Infrastructure Team", priority: "Critical" },
                { name: "Inter-American Development Bank (IADB)", role: "Co-Lender & TA Provider", contact: "Energy Division LAC", priority: "Critical" },
                { name: "Enel Green Power Chile", role: "Strategic Partner / Wind Expertise", contact: "Green Hydrogen Unit", priority: "High" },
                { name: "Copenhagen Infrastructure Partners", role: "Equity Co-Investor", contact: "Green Hydrogen Fund", priority: "High" },
                { name: "Port of Rotterdam", role: "European Offtake Hub Partner", contact: "Hydrogen Import Program", priority: "Medium" },
                { name: "Maersk", role: "Maritime Logistics Partner", contact: "Green Fuels Division", priority: "Medium" }
            ],
            nextReport: "Bankable Feasibility Study with 25-Year Financial Model",
            estimatedTimeline: "Initial engagement: 3-4 weeks | Feasibility: 16-20 weeks | Financial close: 18-24 months"
        }
    },
    { 
        id: 4, 
        entity: "California Inland Port Coalition", 
        country: "USA", 
        sector: "Logistics", 
        dealSize: "$98M", 
        flag: "🇺🇸", 
        SPI: 82, 
        IVAS: 79, 
        risk: "Medium", 
        summary: "Multimodal logistics hub in San Bernardino County connecting LA/Long Beach ports to inland distribution. 2.4M sq ft warehouse with BNSF rail spur.",
        p10: "$84M", 
        p50: "$98M", 
        p90: "$115M", 
        keyRisk: "CEQA environmental review (12-18 months), ILWU labor relations, and AB 5 independent contractor classification compliance.",
        marketContext: "LA/Long Beach ports handle 40% of US container imports. San Bernardino County has 145M sq ft of industrial space with 1.2% vacancy rate (CBRE Q3 2024). E-commerce driving 15% annual growth in last-mile demand.",
        regulatoryFramework: "CEQA environmental impact report, SCAQMD air quality permits (Rule 2305), Cal/OSHA warehouse quotas (AB 701), and CARB Advanced Clean Fleets regulation compliance.",
        financialStructure: "65% CMBS debt at SOFR + 280bps, 35% private equity. Triple-net lease structure with 7-year anchor tenants. Target unlevered IRR: 11-13%. Cap rate: 4.75%.",
        sources: [
            { name: "Port of LA - Container Statistics", url: "https://www.portoflosangeles.org/business/statistics" },
            { name: "CBRE - Industrial Market Report Q3 2024", url: "https://www.cbre.com/insights/reports/us-industrial-figures-q3-2024" },
            { name: "CARB - Advanced Clean Fleets Regulation", url: "https://ww2.arb.ca.gov/our-work/programs/advanced-clean-fleets" },
            { name: "Cal/OSHA - AB 701 Warehouse Requirements", url: "https://www.dir.ca.gov/dosh/Warehouse-Distribution-Centers.html" }
        ],
        keyMetrics: [
            { label: "Port Volume Share", value: "40% of US", source: "Port of LA" },
            { label: "Vacancy Rate", value: "1.2%", source: "CBRE Q3 2024" },
            { label: "E-commerce Growth", value: "15%/yr", source: "CBRE" },
            { label: "Target Cap Rate", value: "4.75%", source: "Pro Forma" }
        ],
        nextSteps: {
            immediate: [
                "Schedule meeting with San Bernardino County Economic Development Agency",
                "Request CEQA pre-application consultation with lead agency",
                "Obtain BNSF rail spur feasibility assessment and right-of-way status"
            ],
            shortTerm: [
                "Conduct tenant demand analysis with major 3PL providers (XPO, FedEx, Amazon)",
                "Commission Phase I environmental site assessment for target parcels",
                "Engage CARB-compliant fleet consultant for Advanced Clean Fleets planning"
            ],
            documentation: [
                "Letter of Intent (LOI) - Land Acquisition & Option Agreement",
                "Pre-Lease Agreement - Anchor Tenant 3PL Operator",
                "Term Sheet - CMBS Financing with ESG Certification",
                "Development Agreement - San Bernardino County Entitlements",
                "Rail Access Agreement - BNSF Spur Construction"
            ],
            recommendedPartners: [
                { name: "Prologis", role: "Development JV Partner", contact: "Southern California Industrial Team", priority: "Critical" },
                { name: "Rail Infrastructure Partner", role: "Rail Infrastructure Partner", contact: "Real Estate & Industrial Development", priority: "Critical" },
                { name: "Amazon Logistics", role: "Anchor Tenant", contact: "Real Estate Acquisitions West", priority: "High" },
                { name: "CBRE Investment Management", role: "Equity Co-Investor", contact: "US Industrial Fund", priority: "High" },
                { name: "JP Morgan Asset Management", role: "CMBS Arranger", contact: "Real Estate Debt Strategies", priority: "Medium" },
                { name: "Tesla Semi / Nikola", role: "EV Fleet Partner", contact: "Commercial Fleet Sales", priority: "Medium" }
            ],
            nextReport: "Full Development Pro Forma with CEQA Timeline Analysis",
            estimatedTimeline: "Initial engagement: 2-3 weeks | Entitlements: 12-18 months | Construction start: 20-24 months"
        }
    },
    { 
        id: 5, 
        entity: "Ethiopia Coffee Traceability", 
        country: "Ethiopia", 
        sector: "Agriculture", 
        dealSize: "$15M", 
        flag: "🇪🇹", 
        SPI: 61, 
        IVAS: 58, 
        risk: "High", 
        summary: "Blockchain-based supply chain traceability for specialty coffee cooperatives in Yirgacheffe and Sidama regions. 45,000 smallholder farmers across 23 cooperatives.",
        p10: "$9M", 
        p50: "$15M", 
        p90: "$22M", 
        keyRisk: "Telecom infrastructure (4G coverage <40% in target areas), cooperative governance capacity, and ECX (Ethiopia Commodity Exchange) regulatory integration.",
        marketContext: "Ethiopia is the world's 5th largest coffee producer (7.5M bags/year, ICO 2024). Specialty coffee commands 300-400% premium over commodity. EU Deforestation Regulation (EUDR) effective Dec 2024 requires full traceability.",
        regulatoryFramework: "Ethiopian Coffee & Tea Authority licensing, ECX trading regulations, National Bank of Ethiopia foreign exchange controls, and EU Deforestation Regulation compliance requirements.",
        financialStructure: "60% DFI grant/concessional (IFC, USAID), 25% impact investment equity, 15% cooperative contribution (in-kind). Revenue: $0.02/kg traceability premium passed to farmers.",
        sources: [
            { name: "ICO - Coffee Market Report 2024", url: "https://www.ico.org/Market-Report-23-24-e.asp" },
            { name: "EU - Deforestation Regulation (EUDR)", url: "https://environment.ec.europa.eu/topics/forests/deforestation_en" },
            { name: "Ethiopian Coffee & Tea Authority", url: "https://www.ecta.gov.et" },
            { name: "World Bank - Ethiopia Digital Economy Assessment", url: "https://www.worldbank.org/en/country/ethiopia/publication/ethiopia-digital-economy-assessment" }
        ],
        keyMetrics: [
            { label: "Coffee Production", value: "7.5M bags/yr", source: "ICO 2024" },
            { label: "Specialty Premium", value: "300-400%", source: "SCA" },
            { label: "4G Coverage", value: "<40%", source: "Ethio Telecom" },
            { label: "Farmer Reach", value: "45,000", source: "Project Spec" }
        ],
        nextSteps: {
            immediate: [
                "Arrange introductory meeting with Ethiopian Coffee & Tea Authority (ECTA) Director",
                "Request cooperative organization mapping and current traceability gaps assessment",
                "Confirm EU Deforestation Regulation (EUDR) compliance requirements for pilot cooperatives"
            ],
            shortTerm: [
                "Conduct field visit to Yirgacheffe and Sidama cooperatives for baseline assessment",
                "Evaluate telecom infrastructure with Ethio Telecom and Safaricom Ethiopia",
                "Engage specialty coffee buyers (Starbucks, Nestle, JDE Peet's) for offtake interest"
            ],
            documentation: [
                "Grant Agreement - USAID Feed the Future Digital Agriculture",
                "MOU - Cooperative Union Partnership & Data Sharing",
                "Technology License - Blockchain Platform Implementation",
                "Offtake LOI - Premium Pricing for Traceable Coffee",
                "Impact Measurement Framework - Farmer Income & Traceability KPIs"
            ],
            recommendedPartners: [
                { name: "USAID Ethiopia", role: "Primary Grant Funder", contact: "Feed the Future Program", priority: "Critical" },
                { name: "IFC Agribusiness", role: "Concessional Finance Partner", contact: "Africa Agribusiness Team", priority: "High" },
                { name: "Starbucks Coffee Company", role: "Premium Offtake Partner", contact: "Ethical Sourcing & Traceability", priority: "Critical" },
                { name: "Farmer Connect (IBM)", role: "Technology Platform Provider", contact: "Coffee Traceability Solutions", priority: "High" },
                { name: "TechnoServe", role: "Cooperative Capacity Building", contact: "East Africa Coffee Initiative", priority: "High" },
                { name: "Oromia Coffee Farmers Cooperative Union", role: "Primary Cooperative Partner", contact: "General Manager", priority: "Critical" }
            ],
            nextReport: "Cooperative Readiness Assessment & Technology Implementation Plan",
            estimatedTimeline: "Initial engagement: 2-3 weeks | Pilot design: 8-10 weeks | Pilot launch: 16-20 weeks"
        }
    }
];

// Document categories for the Document Types Modal
export interface DocumentCategory {
    category: string;
    color: string;
    docs: string[];
}

export const documentCategories: DocumentCategory[] = [
    {
        category: "Strategic Analysis",
        color: "bg-blue-100 text-blue-800",
        docs: ["Strategic Assessment Report", "SWOT Analysis", "PESTLE Analysis", "Competitive Landscape", "Market Entry Analysis", "Gap Analysis", "Opportunity Assessment", "Strategic Options Paper", "Decision Framework", "Scenario Planning Report"]
    },
    {
        category: "Financial Documents",
        color: "bg-green-100 text-green-800",
        docs: ["Financial Model (5-Year)", "Pro Forma Statements", "Cash Flow Projections", "NPV/IRR Analysis", "Sensitivity Analysis", "Break-even Analysis", "Funding Requirements", "Capital Structure", "Revenue Model", "Cost-Benefit Analysis", "Monte Carlo Risk Report", "Value at Risk Assessment"]
    },
    {
        category: "Due Diligence",
        color: "bg-amber-100 text-amber-800",
        docs: ["Commercial Due Diligence", "Financial Due Diligence", "Legal Due Diligence", "Technical Due Diligence", "Environmental Due Diligence", "HR Due Diligence", "IT Due Diligence", "Regulatory Due Diligence", "Sanctions Check Report", "Background Verification"]
    },
    {
        category: "Legal & Compliance",
        color: "bg-red-100 text-red-800",
        docs: ["Letter of Intent (LOI)", "Term Sheet", "MOU Template", "NDA Template", "Shareholders Agreement", "JV Agreement", "License Agreement", "Service Agreement", "Compliance Checklist", "Regulatory Filing", "IP Assignment", "Employment Agreement"]
    },
    {
        category: "Government & Policy",
        color: "bg-purple-100 text-purple-800",
        docs: ["Policy Brief", "Cabinet Submission", "Regulatory Impact Statement", "Program Charter", "Budget Bid", "Business Case", "Probity Framework", "Governance Charter", "Risk Register", "Stakeholder Map", "Public Consultation Summary", "Legislative Analysis"]
    },
    {
        category: "Investment Documents",
        color: "bg-indigo-100 text-indigo-800",
        docs: ["Investment Memo", "Board Paper", "IC Submission", "Teaser Document", "Information Memorandum", "Pitch Deck", "Data Room Index", "Q&A Document", "Investor Update", "Portfolio Report", "Exit Analysis"]
    },
    {
        category: "Operational",
        color: "bg-teal-100 text-teal-800",
        docs: ["Implementation Plan", "Project Charter", "Gantt Chart", "Resource Plan", "Risk Mitigation Plan", "Change Management Plan", "Training Plan", "Communications Plan", "Handover Document", "Post-Implementation Review"]
    },
    {
        category: "Research & Intelligence",
        color: "bg-orange-100 text-orange-800",
        docs: ["Market Dossier", "Country Risk Report", "Sector Analysis", "Competitor Profile", "Partner Assessment", "Location Analysis", "Precedent Study", "Historical Analogue Report", "Trend Analysis", "Emerging Risk Brief"]
    }
];

// Core scoring engines for the Formulas Modal
export const coreEngines = [
    {
        id: "spi",
        name: "SPI(TM) - Strategic Partnership Index",
        description: "Evaluates whether a potential partner is reliable, aligned with your goals, and capable of executing. Uses historical data, financial indicators, and strategic fit metrics to produce a 0-100 score with confidence bands.",
        color: "border-blue-500"
    },
    {
        id: "rroi",
        name: "RROI(TM) - Regional Return on Investment",
        description: "Adjusts standard ROI calculations for location-specific factors: local labor costs, infrastructure quality, regulatory burden, currency volatility, and market access premiums. Produces risk-adjusted return projections.",
        color: "border-green-500"
    },
    {
        id: "seam",
        name: "SEAM(TM) - Socio-Economic Alignment Metric",
        description: "Measures how well an investment aligns with community needs, environmental sustainability, and social license to operate. Critical for ESG-conscious investors and development agencies.",
        color: "border-purple-500"
    },
    {
        id: "ivas",
        name: "IVAS(TM) - Investment Viability Assessment Score",
        description: "Determines whether capital can actually be deployed successfully. Factors include regulatory approval likelihood, local partner availability, infrastructure readiness, and execution timeline feasibility.",
        color: "border-amber-500"
    },
    {
        id: "scf",
        name: "SCF(TM) - Supply Chain Friction Index",
        description: "Identifies bottlenecks in logistics, procurement, and operations. Calculates transportation costs, port access, customs efficiency, and supplier network density to flag execution risks.",
        color: "border-red-500"
    }
];

// Derivative indices
export const derivativeIndices = [
    "Risk Assessment Index", "Governance Quality Score", "ESG Compliance Rating",
    "Execution Readiness", "Regulatory Complexity", "Market Volatility Index",
    "Currency Risk Factor", "Infrastructure Maturity", "Talent Availability Score",
    "Technology Adoption Rate", "Environmental Impact", "Social License Score",
    "Economic Multiplier", "Innovation Capacity", "Competitive Positioning",
    "Scalability Factor"
];

// 10-step protocol
export const protocolSteps = [
    "Project Definition & Scope",
    "Market & Competitor Analysis",
    "Regulatory & Compliance Mapping",
    "Financial Modeling & Simulation",
    "Risk Identification & Quantification",
    "Counterfactual & Adversarial Review",
    "Partnership & Stakeholder Analysis",
    "ESG & Impact Assessment",
    "Deliverable Synthesis & Generation",
    "Board-Level Presentation Output"
];

// Platform statistics
export const platformStats = {
    validationScenarios: "100+",
    continents: "6",
    simulatedDealValue: "$12B+",
    industrySectors: "15+"
};

// Terms of engagement content
export const termsOfEngagement = [
    {
        title: "1. Strategic Decision Support",
        content: "ADVERSIQ is a decision support platform. All outputs are advisory and must be validated by qualified professionals before binding commitments."
    },
    {
        title: "2. Reasoning Governance (NSIL)",
        content: "The NSIL layer governs analysis via adversarial input screening, multi-perspective debate, counterfactual simulation, scoring engines, and a learning loop. This reduces false confidence and enforces explainability."
    },
    {
        title: "3. Data Privacy & Sovereignty",
        content: "Strict compliance with data sovereignty and privacy laws (GDPR, Australian Privacy Act). Sensitive intents and operational data are segregated. No user-specific data trains public models."
    },
    {
        title: "4. Model Limits & Accountability",
        content: "The 27-formula suite (including SPI(TM), RROI(TM), SEAM(TM), IVAS(TM), SCF(TM)) exposes fragility and leverage; it does not predict the future. Users retain final accountability for decisions."
    },
    {
        title: "5. Compliance & Ethics",
        content: "The Regulator persona continuously checks legality, ethics, sanctions, and policy alignment. Outputs include audit trails for traceability. AI must never replace human authority."
    },
    {
        title: "6. Liability & IP Protection",
        content: "All intellectual property, methodologies, orchestration primitives, and the 27-formula suite are owned by ADVERSIQ Intelligence (Brayden Walls, ABN 55 978 113 300). Access or evaluation does not grant any license or transfer of rights. You agree to keep non-public materials confidential, use them solely for evaluation, and not disclose, copy, reverse-engineer, or use the system to build a competing product."
    }
];

