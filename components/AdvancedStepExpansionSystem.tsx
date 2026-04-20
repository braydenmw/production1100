import React, { useState } from 'react';
import { Plus, Trash2, Save, Copy, Eye, EyeOff, Lock, Unlock, GitBranch, History, AlertCircle, CheckCircle } from 'lucide-react';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'percentage' | 'currency' | 'date' | 'select';
  value: string | number | boolean;
  locked: boolean;
  overriddenFrom?: string;
  notes?: string;
}

interface ScoreOverride {
  sectionId: string;
  originalScore: number;
  overriddenScore: number;
  reason: string;
}

interface Variation {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  timestamp: number;
  customFields: CustomField[];
  scoreOverrides: ScoreOverride[];
  analysisChanges: string[];
}

interface ExpansionSection {
  id: string;
  title: string;
  description: string;
  isExpanded: boolean;
  isLocked: boolean;
  customFields: CustomField[];
  baselineData: { [key: string]: any };
  scoreOverrides: ScoreOverride[];
}

const AdvancedStepExpansionSystem: React.FC = () => {
  const [sections, setSections] = useState<ExpansionSection[]>([
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Customize market assumptions and override scores',
      isExpanded: true,
      isLocked: false,
      customFields: [
        { id: 'cf1', name: 'Market Growth Rate', type: 'percentage', value: 12, locked: false },
        { id: 'cf2', name: 'Competition Intensity', type: 'select', value: 'High', locked: false },
        { id: 'cf3', name: 'Entry Barriers', type: 'text', value: 'Regulatory licensing required', locked: false }
      ],
      baselineData: { opportunityScore: 72, riskScore: 58 },
      scoreOverrides: []
    },
    {
      id: 'financial-projections',
      title: 'Financial Projections',
      description: 'Adjust financial assumptions and override calculations',
      isExpanded: false,
      isLocked: false,
      customFields: [
        { id: 'cf4', name: 'Revenue Year 1', type: 'currency', value: 5000000, locked: false },
        { id: 'cf5', name: 'COGS %', type: 'percentage', value: 35, locked: false }
      ],
      baselineData: { projectedROI: 24, paybackPeriod: 3.2 },
      scoreOverrides: []
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Override risk calculations with custom scenarios',
      isExpanded: false,
      isLocked: false,
      customFields: [
        { id: 'cf6', name: 'Political Risk Level', type: 'select', value: 'Medium', locked: false },
        { id: 'cf7', name: 'Currency Volatility', type: 'percentage', value: 8, locked: false }
      ],
      baselineData: { riskScore: 68, mitigationScore: 42 },
      scoreOverrides: []
    }
  ]);

  const [variations, setVariations] = useState<Variation[]>([]);
  const [activeVariation, setActiveVariation] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    sections: true,
    variations: true,
    history: true,
    scoreOverrides: false
  });
  const [showFieldForm, setShowFieldForm] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'percentage' | 'currency' | 'date' | 'select'>('text');

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSectionExpand = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  const toggleSectionLock = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, isLocked: !s.isLocked } : s
    ));
  };

  const updateCustomField = (sectionId: string, fieldId: string, value: string | number | boolean) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? {
            ...s,
            customFields: s.customFields.map(f =>
              f.id === fieldId ? { ...f, value } : f
            )
          }
        : s
    ));
  };

  const toggleFieldLock = (sectionId: string, fieldId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? {
            ...s,
            customFields: s.customFields.map(f =>
              f.id === fieldId ? { ...f, locked: !f.locked } : f
            )
          }
        : s
    ));
  };

  const addCustomField = (sectionId: string) => {
    if (!newFieldName.trim()) return;
    
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: newFieldName,
      type: newFieldType,
      value: newFieldType === 'percentage' || newFieldType === 'number' ? 0 : '',
      locked: false
    };

    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, customFields: [...s.customFields, newField] }
        : s
    ));

    setNewFieldName('');
    setShowFieldForm(null);
  };

  const deleteCustomField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, customFields: s.customFields.filter(f => f.id !== fieldId) }
        : s
    ));
  };

  const saveVariation = () => {
    const variationName = prompt('Name this variation:', `Variation ${variations.length + 1}`);
    if (!variationName) return;

    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: variationName,
      description: prompt('Add description (optional):', '') || '',
      createdAt: new Date(),
      timestamp: Date.now(),
      customFields: sections.flatMap(s => s.customFields),
      scoreOverrides: sections.flatMap(s => s.scoreOverrides),
      analysisChanges: sections
        .filter(s => s.scoreOverrides.length > 0)
        .map(s => `${s.title}: Score overridden`)
    };

    setVariations([...variations, newVariation]);
    alert(`✓ Variation "${variationName}" saved successfully`);
  };

  const loadVariation = (variationId: string) => {
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;

    setSections(prevSections => {
      const newSections = prevSections.map(section => {
        const updatedCustomFields = section.customFields.map(field => {
          const variationField = variation.customFields.find(vf => vf.id === field.id);
          if (variationField) {
            return {
              ...variationField,
              overriddenFrom: field.value.toString(), // Use the current field value
            };
          }
          return field;
        });

        const updatedScoreOverrides = variation.scoreOverrides.filter(
          (override) => override.sectionId === section.id
        );

        return {
          ...section,
          customFields: updatedCustomFields,
          scoreOverrides: updatedScoreOverrides.length > 0 ? updatedScoreOverrides : section.scoreOverrides,
        };
      });
      return newSections;
    });

    setActiveVariation(variationId);
  };

  const deleteVariation = (variationId: string) => {
    if (confirm('Delete this variation? This cannot be undone.')) {
      setVariations(variations.filter(v => v.id !== variationId));
      if (activeVariation === variationId) setActiveVariation(null);
    }
  };

  const duplicateVariation = (variationId: string) => {
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;

    const newVariation: Variation = {
      ...variation,
      id: `var-${Date.now()}`,
      name: `${variation.name} (Copy)`,
      timestamp: Date.now(),
      createdAt: new Date()
    };

    setVariations([...variations, newVariation]);
  };

  const overrideScore = (sectionId: string, newScore: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const originalScore = (section.baselineData.opportunityScore || 0);
    const reason = prompt(`Override reason:`, 'Market conditions changed');
    if (reason === null) return;

    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            scoreOverrides: [
              ...s.scoreOverrides,
              { sectionId, originalScore, overriddenScore: newScore, reason: reason || '' }
            ]
          }
        : s
    ));
  };

  const formatValue = (field: CustomField): string => {
    if (field.type === 'currency') return `$${Number(field.value).toLocaleString()}`;
    if (field.type === 'percentage') return `${field.value}%`;
    if (field.type === 'date') return new Date(field.value as string).toLocaleDateString();
    return String(field.value);
  };

  return (
    <div className="h-full bg-stone-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-purple-600" />
            Advanced Step Expansion System
          </h2>
          <p className="text-stone-600">Customize any analysis section, override scores, and save unlimited variations for scenario comparison</p>
        </div>

        {/* EXPANDABLE SECTIONS */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('sections')}
        >
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Customizable Analysis Sections ({sections.length})
            </h3>
            <div className="text-2xl">{expandedSections.sections ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.sections && (
            <div className="p-6 space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border-2 border-stone-200 rounded-lg overflow-hidden">
                  {/* SECTION HEADER */}
                  <div
                    className="p-4 bg-gradient-to-r from-stone-100 to-stone-50 cursor-pointer hover:bg-stone-100 flex items-center justify-between"
                    onClick={() => toggleSectionExpand(section.id)}
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-stone-900 text-lg mb-1">{section.title}</h4>
                      <p className="text-xs text-stone-600">{section.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionLock(section.id);
                        }}
                        className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
                        title={section.isLocked ? 'Unlock section' : 'Lock section'}
                      >
                        {section.isLocked ? (
                          <Lock className="w-4 h-4 text-red-600" />
                        ) : (
                          <Unlock className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                      <div className="text-2xl text-stone-400">{section.isExpanded ? 'a-1/4' : 'a-'}</div>
                    </div>
                  </div>

                  {/* SECTION CONTENT */}
                  {section.isExpanded && (
                    <div className="p-6 bg-stone-50 space-y-4 border-t-2 border-stone-200">
                      {/* CUSTOM FIELDS */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-stone-900 text-sm">Custom Fields ({section.customFields.length})</h5>
                        
                        {section.customFields.map((field) => (
                          <div key={field.id} className="bg-white p-3 rounded-lg border border-stone-200 flex items-end gap-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-xs font-bold text-stone-700 block">{field.name}</label>
                              <div className="flex gap-2 items-center">
                                {field.type === 'select' ? (
                                  <select
                                    value={String(field.value)}
                                    onChange={(e) => updateCustomField(section.id, field.id, e.target.value)}
                                    disabled={field.locked || section.isLocked}
                                    className="flex-1 px-2 py-1 border border-stone-300 rounded text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
                                  >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                  </select>
                                ) : (
                                  <input
                                    type={field.type === 'percentage' || field.type === 'number' || field.type === 'currency' ? 'number' : field.type}
                                    value={typeof field.value === 'boolean' ? '' : field.value}
                                    onChange={(e) => updateCustomField(section.id, field.id,
                                      field.type === 'number' || field.type === 'percentage' || field.type === 'currency'
                                        ? parseFloat(e.target.value) || 0
                                        : e.target.value
                                    )}
                                    disabled={field.locked || section.isLocked}
                                    className="flex-1 px-2 py-1 border border-stone-300 rounded text-sm disabled:bg-stone-100 disabled:cursor-not-allowed"
                                  />
                                )}
                                {field.type === 'percentage' && <span className="text-sm text-stone-600 font-bold">%</span>}
                                {field.type === 'currency' && <span className="text-sm text-stone-600 font-bold">$</span>}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleFieldLock(section.id, field.id)}
                                className="p-1.5 hover:bg-stone-100 rounded transition-colors"
                                title={field.locked ? 'Unlock field' : 'Lock field'}
                              >
                                {field.locked ? (
                                  <Lock className="w-4 h-4 text-red-600" />
                                ) : (
                                  <Unlock className="w-4 h-4 text-stone-400" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteCustomField(section.id, field.id)}
                                disabled={section.isLocked}
                                className="p-1.5 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ADD NEW FIELD */}
                      {showFieldForm === section.id ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                          <input
                            type="text"
                            placeholder="Field name"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                            autoFocus
                          />
                          <select
                            value={newFieldType}
                            onChange={(e) => setNewFieldType(e.target.value as any)}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="percentage">Percentage</option>
                            <option value="currency">Currency</option>
                            <option value="date">Date</option>
                            <option value="select">Select</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addCustomField(section.id)}
                              className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700"
                            >
                              Add Field
                            </button>
                            <button
                              onClick={() => setShowFieldForm(null)}
                              className="flex-1 px-3 py-1 bg-stone-300 text-stone-900 rounded text-sm font-bold hover:bg-stone-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowFieldForm(section.id)}
                          disabled={section.isLocked}
                          className="w-full py-2 px-3 border-2 border-dashed border-blue-400 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Custom Field
                        </button>
                      )}

                      {/* SCORE OVERRIDES */}
                      <div className="pt-4 border-t border-stone-200">
                        <h5 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          Score Overrides ({section.scoreOverrides.length})
                        </h5>
                        
                        {section.scoreOverrides.map((override, idx) => (
                          <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                            <div className="text-sm font-bold text-orange-900">
                              {override.originalScore} a' {override.overriddenScore}
                            </div>
                            <p className="text-xs text-orange-700 mt-1">{override.reason}</p>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const currentScore = section.score ?? 50;
                            const adjusted = Math.min(100, Math.max(0, currentScore + (currentScore < 50 ? 10 : -10)));
                            overrideScore(section.id, adjusted);
                          }}
                          className="w-full mt-2 py-2 px-3 bg-orange-100 text-orange-900 font-bold rounded-lg hover:bg-orange-200 transition-colors text-sm"
                        >
                          Override Score
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAVE & MANAGE VARIATIONS */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={saveVariation}
            className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3 font-bold text-green-900 text-lg"
          >
            <Save className="w-6 h-6" />
            Save Current as Variation
          </button>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-xl">
            <p className="text-sm font-bold text-blue-900">
              Total Variations Saved: <span className="text-2xl">{variations.length}</span>
            </p>
          </div>
        </div>

        {/* VARIATIONS LIBRARY */}
        {variations.length > 0 && (
          <div 
            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleSection('variations')}
          >
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-green-600" />
                Saved Variations Library ({variations.length})
              </h3>
              <div className="text-2xl">{expandedSections.variations ? 'a-1/4' : 'a-'}</div>
            </div>

            {expandedSections.variations && (
              <div className="p-6 space-y-3">
                {variations.map((variation) => (
                  <div
                    key={variation.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      activeVariation === variation.id
                        ? 'bg-green-50 border-green-400 shadow-md'
                        : 'bg-stone-50 border-stone-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-900">{variation.name}</h4>
                        {variation.description && (
                          <p className="text-xs text-stone-600 mt-1">{variation.description}</p>
                        )}
                        <p className="text-xs text-stone-500 mt-1">
                          Created: {new Date(variation.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {activeVariation === variation.id && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => loadVariation(variation.id)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          activeVariation === variation.id
                            ? 'bg-green-600 text-white'
                            : 'bg-stone-200 text-stone-900 hover:bg-green-200'
                        }`}
                      >
                        {activeVariation === variation.id ? '✓ Active' : 'Load'}
                      </button>
                      <button
                        onClick={() => duplicateVariation(variation.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-900 rounded text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => deleteVariation(variation.id)}
                        className="px-3 py-1 bg-red-100 text-red-900 rounded text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>

                    {variation.analysisChanges.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-200">
                        <p className="text-xs font-bold text-stone-700 mb-1">Changes in this variation:</p>
                        <ul className="text-xs text-stone-600 space-y-1">
                          {variation.analysisChanges.map((change, idx) => (
                            <li key={idx}>* {change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHANGE HISTORY */}
        <div 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleSection('history')}
        >
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <History className="w-5 h-5 text-orange-600" />
              Change History & Audit Trail
            </h3>
            <div className="text-2xl">{expandedSections.history ? 'a-1/4' : 'a-'}</div>
          </div>

          {expandedSections.history && (
            <div className="p-6 bg-stone-50">
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-stone-200">
                  <p className="text-sm font-bold text-stone-900 mb-1">Manual field override in Market Analysis</p>
                  <p className="text-xs text-stone-600">Changed "Market Growth Rate" from 12% to 15%</p>
                  <p className="text-xs text-stone-400 mt-2">Today at 2:45 PM</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-stone-200">
                  <p className="text-sm font-bold text-stone-900 mb-1">Score override in Financial Projections</p>
                  <p className="text-xs text-stone-600">Overrode ROI from 24% to 28% - Reason: "Improved sales pipeline"</p>
                  <p className="text-xs text-stone-400 mt-2">Today at 1:30 PM</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-stone-200">
                  <p className="text-sm font-bold text-stone-900 mb-1">Variation saved: "Aggressive Growth Scenario"</p>
                  <p className="text-xs text-stone-600">Captured current state with 3 field overrides</p>
                  <p className="text-xs text-stone-400 mt-2">Today at 12:15 PM</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdvancedStepExpansionSystem;
