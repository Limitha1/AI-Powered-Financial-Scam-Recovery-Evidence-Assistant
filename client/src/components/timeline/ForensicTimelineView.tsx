import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Plus,
  Radio,
  ShieldCheck,
  Tag,
  FileSearch,
  X
} from 'lucide-react';
import { TimelineEvent, TimelineStage } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface ForensicTimelineViewProps {
  caseId: string;
  timeline: TimelineEvent[];
  onTimelineUpdated: () => void;
}

export const ForensicTimelineView: React.FC<ForensicTimelineViewProps> = ({
  caseId,
  timeline,
  onTimelineUpdated
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add event form state
  const [newStage, setNewStage] = useState<TimelineStage>('UNAUTHORIZED_DEBIT');
  const [newHeadline, setNewHeadline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEntities, setNewEntities] = useState('');

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      await api.generateTimeline(caseId);
      onTimelineUpdated();
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const toggleVerification = async (event: TimelineEvent) => {
    try {
      await api.updateTimelineEvent(caseId, event.id, {
        headline: event.headline,
        detailed_description: event.detailed_description,
        is_verified_by_victim: !event.is_verified_by_victim
      });
      onTimelineUpdated();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      await api.updateTimelineEvent(caseId, editingEvent.id, {
        headline: editingEvent.headline,
        detailed_description: editingEvent.detailed_description,
        is_verified_by_victim: editingEvent.is_verified_by_victim
      });
      setEditingEvent(null);
      onTimelineUpdated();
    } catch (err) {
      console.error('Failed to save edit:', err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadline || !newDesc) return;

    try {
      const entities = newEntities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createTimelineEvent(caseId, {
        stage: newStage,
        timestamp: new Date().toISOString(),
        headline: newHeadline,
        detailed_description: newDesc,
        involved_entities: entities,
        source_evidence_ids: [],
        is_verified_by_victim: true
      });

      setShowAddModal(false);
      setNewHeadline('');
      setNewDesc('');
      setNewEntities('');
      onTimelineUpdated();
    } catch (err) {
      console.error('Failed to add custom timeline event:', err);
    }
  };

  const getStageBadge = (stage: TimelineStage) => {
    switch (stage) {
      case 'FIRST_CONTACT':
        return {
          bg: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
          label: 'Initial Contact'
        };
      case 'MANIPULATION':
        return {
          bg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400',
          label: 'Psychological Coercion'
        };
      case 'CREDENTIAL_HARVESTING':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          label: 'Credential Compromise / APK'
        };
      case 'UNAUTHORIZED_DEBIT':
        return {
          bg: 'bg-red-950/80 text-red-300 border-red-500/40',
          dot: 'bg-red-500',
          label: 'Unauthorized Debit'
        };
      case 'DISCOVERY':
        return {
          bg: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-400',
          label: 'Victim Discovery'
        };
      case 'CONTAINMENT_ATTEMPT':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          label: 'Containment Action'
        };
      default:
        return {
          bg: 'bg-slate-900 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          label: stage
        };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Forensic Minute-by-Minute Incident Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Corroborated sequencing isolating grooming, credential compromise, and unauthorized fund sweeps
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Event</span>
          </button>

          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSynthesizing ? 'Synthesizing with Gemini 2.5...' : 'Synthesize Timeline with AI'}</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      {timeline.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
          <FileSearch className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">No Timeline Events Generated</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload transaction SMS, screenshots, or chat transcripts, then click "Synthesize Timeline with AI".
          </p>
          <button
            onClick={handleSynthesize}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
          >
            Synthesize Initial Timeline
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-slate-700 before:to-emerald-500">
          {timeline.map((event, idx) => {
            const stageStyle = getStageBadge(event.stage);
            const eventTime = new Date(event.timestamp).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={event.id} className="relative group">
                {/* Stage Bullet Node */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center ${stageStyle.dot} shadow-md`}
                >
                  <span className="text-[9px] font-extrabold text-black font-mono">
                    {idx + 1}
                  </span>
                </div>

                {/* Event Card */}
                <div className="glass-card-hover rounded-xl p-4 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${stageStyle.bg}`}
                      >
                        {stageStyle.label}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{eventTime}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Victim Verification Checkbox */}
                      <button
                        onClick={() => toggleVerification(event)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                          event.is_verified_by_victim
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Click to confirm event accuracy"
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            event.is_verified_by_victim ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        <span>{event.is_verified_by_victim ? 'Verified by Victim' : 'Unverified'}</span>
                      </button>

                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        title="Edit event details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5">{event.headline}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                    {event.detailed_description}
                  </p>

                  {/* Involved Entities Badges */}
                  {event.involved_entities && event.involved_entities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 mr-1">
                        <Tag className="h-3 w-3" />
                        <span>Identified Entities:</span>
                      </span>
                      {event.involved_entities.map((ent, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-cyan-300"
                        >
                          {ent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase">Edit Timeline Milestone</h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  value={editingEvent.headline}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, headline: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Forensic Observation Details
                </label>
                <textarea
                  rows={4}
                  value={editingEvent.detailed_description}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, detailed_description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.is_verified_by_victim}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        is_verified_by_victim: e.target.checked
                      })
                    }
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  <span className="text-xs font-semibold text-emerald-400">
                    Confirm accuracy (Verified by Victim)
                  </span>
                </label>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase">Add Milestone Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Stage Category</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as TimelineStage)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="FIRST_CONTACT">Initial Contact</option>
                  <option value="MANIPULATION">Psychological Coercion / Pretexting</option>
                  <option value="CREDENTIAL_HARVESTING">Credential Compromise / Remote APK</option>
                  <option value="UNAUTHORIZED_DEBIT">Unauthorized Debit Transfer</option>
                  <option value="DISCOVERY">Victim Discovery of Deficit</option>
                  <option value="CONTAINMENT_ATTEMPT">Containment Action</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Milestone Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Received spoofed call from CBI officer"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what occurred, what was said, or actions taken..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Involved Entities (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91-9876543210, WhatsApp, AnyDesk"
                  value={newEntities}
                  onChange={(e) => setNewEntities(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-cyan-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold"
                >
                  Add to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
