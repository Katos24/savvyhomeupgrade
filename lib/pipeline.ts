export type StatusOption = { value: string; label: string; color: string };

/* The pipeline is defined once here. It was previously declared in three
   places — the signup route, the dashboard's DEFAULT_STATUSES, and
   PipelineTab's fallback — which is why 33 existing companies hold a stage
   list that predates the automation and none of the triggers could find a
   target to move to. */
export const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new',         label: 'New',         color: 'pink'   },
  { value: 'active',      label: 'Active',      color: 'indigo' },
  { value: 'quoted',      label: 'Quoted',      color: 'yellow' },
  { value: 'approved',    label: 'Approved',    color: 'purple' },
  { value: 'scheduled',   label: 'Scheduled',   color: 'blue'   },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed',   label: 'Completed',   color: 'green'  },
];

/** Stages with behaviour attached. Renameable, not removable — the label is
 *  the contractor's, the identity underneath is ours so automation has
 *  something reliable to target. */
export const LOCKED_STAGES = DEFAULT_STATUSES.map((s) => s.value);

/** Shown in plain words on each row rather than offered as a setting. */
export const STAGE_TRIGGERS: Record<string, string> = {
  new: 'Where every new lead starts',
  active: 'Moves here when you convert a lead to a project',
  quoted: 'Moves here when you email a quote',
  approved: 'Moves here when the quote is accepted',
  scheduled: 'Moves here when you set a job date',
  'in-progress': 'You move jobs here when work starts',
  completed: 'You move jobs here when work is done',
};