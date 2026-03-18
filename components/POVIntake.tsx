import React, { useState } from 'react';

export default function POVIntake({ onCaseCreated, onMatches } : { onCaseCreated?: (caseId:string)=>void, onMatches?: (matches:any[])=>void }) {
  const [persona, setPersona] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [originRegion, setOriginRegion] = useState('');
  const [targetRegion, setTargetRegion] = useState('');
  const [objective, setObjective] = useState('');
  const [sector, setSector] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [rawFeatures, setRawFeatures] = useState('');
  const [openness, setOpenness] = useState('neutral');
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [showMissingModal, setShowMissingModal] = useState(false);

  function parseFeatures(s:string) {
    return s ? s.split(',').map(x => x.trim()).filter(Boolean).map(name => ({ name, rarityScore: 3, relevanceScore: 5, marketProxy: 1 })) : [];
  }

  function ensureEssentialFields() {
    if (!persona || !targetRegion) {
      setShowMissingModal(true);
      return false;
    }
    return true;
  }

  async function runIntake() {
    if (!ensureEssentialFields()) return;
    setLoading(true);
    try {
      // This view no longer fabricates partner matches.
      setMatches([]);
      if (onMatches) onMatches([]);
    } catch (e) {
      console.error('Partner intake failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createCase() {
    if (!ensureEssentialFields()) return;
    const caseId = 'CASE-' + crypto.randomUUID().replace(/-/g, '').slice(0, 9).toUpperCase();
    if (onCaseCreated) onCaseCreated(caseId);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Establish Point of View</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="p-2 border rounded text-sm" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input className="p-2 border rounded text-sm" placeholder="Role / Title" value={role} onChange={e => setRole(e.target.value)} />
        <input className="p-2 border rounded text-sm" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="p-2 border rounded text-sm" placeholder="Organization" value={org} onChange={e => setOrg(e.target.value)} />
        <input className="p-2 border rounded text-sm" placeholder="Origin Region" value={originRegion} onChange={e => setOriginRegion(e.target.value)} />
        <select className="p-2 border rounded text-sm" value={persona} onChange={e => setPersona(e.target.value)}>
          <option value="">-- Select persona --</option>
          <option>Observer</option><option>Novice Analyst</option><option>Associate</option><option>Senior Strategist</option><option>Decision Maker</option><option>Visionary Architect</option><option>Principal Agent</option>
        </select>
      </div>

      <div className="space-y-3">
        <input className="w-full p-2 border rounded text-sm" placeholder="Target Region (required)" value={targetRegion} onChange={e => setTargetRegion(e.target.value)} />
        <input className="w-full p-2 border rounded text-sm" placeholder="Objective (e.g. find manufacturing partner)" value={objective} onChange={e => setObjective(e.target.value)} />
        
        <div className="flex gap-4">
          <input className="flex-1 p-2 border rounded text-sm" placeholder="Sector" value={sector} onChange={e => setSector(e.target.value)} />
          <input className="flex-1 p-2 border rounded text-sm" placeholder="Budget (USD)" value={budget} onChange={e => setBudget(e.target.value)} />
          <input className="flex-1 p-2 border rounded text-sm" placeholder="Timeline (months)" value={timeline} onChange={e => setTimeline(e.target.value)} />
        </div>
        
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Raw features (comma separated)</label>
            <input className="w-full p-2 border rounded text-sm" value={rawFeatures} onChange={e => setRawFeatures(e.target.value)} />
        </div>
        
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Briefing file path (server local test) - optional</label>
            <input className="w-full p-2 border rounded text-sm" value={filePath} onChange={e => setFilePath(e.target.value)} placeholder="/mnt/data/briefing.txt" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Breadth</label>
          <select className="w-full p-2 border rounded text-sm" value={openness} onChange={e => setOpenness(e.target.value)}>
            <option value="narrow">Narrow</option>
            <option value="neutral">Neutral</option>
            <option value="wide">Wide (exploratory)</option>
          </select>
        </div>
        
        <div className="flex gap-4 pt-2">
          <button 
            onClick={runIntake} 
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-sm font-bold transition-colors"
          >
            {loading ? 'Running...' : 'Run Instant Match & Rating'}
          </button>
          <button 
            onClick={createCase} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold transition-colors shadow-sm"
          >
            Create Full Case
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-bold text-gray-900">Instant Matches</h4>
          {matches.map((m:any, idx:number) => (
            <div key={idx} className="p-3 border border-gray-200 rounded-lg flex justify-between items-start bg-gray-50">
              <div>
                <div className="font-bold text-sm text-gray-800">{m.match.title || m.match.entityName} <span className="font-normal text-gray-500 text-xs">({m.match.entityType})</span></div>
                <div className="text-xs text-gray-500">{m.match.location} * {m.match.incentives}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{m.match.score}</div>
                <button className="text-xs text-blue-600 hover:underline mt-1" onClick={() => navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(m))}>Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showMissingModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-[520px] border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-2">We need a few details</h4>
            <p className="text-sm text-gray-600 mb-4">Please provide persona and target region so the Nexus Brain can calibrate.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <select className="p-2 border rounded text-sm w-full" value={persona} onChange={e => setPersona(e.target.value)}>
                <option value="">-- Select persona --</option>
                <option>Observer</option><option>Novice Analyst</option><option>Associate</option><option>Senior Strategist</option><option>Decision Maker</option><option>Visionary Architect</option><option>Principal Agent</option>
              </select>
              <input className="p-2 border rounded text-sm w-full" placeholder="Target Region" value={targetRegion} onChange={e => setTargetRegion(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowMissingModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={() => { setShowMissingModal(false); runIntake(); }} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm">Save & Run</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

