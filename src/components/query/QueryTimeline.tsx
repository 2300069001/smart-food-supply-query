import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TimelineStage } from '../../types';
import { formatDate } from '../../utils/format';

const CURRENT_STAGE_HINT: Record<string, string> = {
  raised: 'Logged in the tracker',
  sent: 'Awaiting supplier response',
  responded: 'Supplier has replied — pending QA review',
  review: 'QA team reviewing the response',
  resolved: 'Query closed',
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export function QueryTimeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <motion.ol className="relative" variants={listVariants} initial="hidden" animate="show">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        return (
          <motion.li
            key={stage.key}
            variants={itemVariants}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-0.5 ${
                  stage.state === 'upcoming' ? 'bg-slate-200' : 'bg-brand-200'
                }`}
              />
            )}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
              {stage.state === 'complete' ? (
                <CheckCircle2 className="h-6 w-6 text-brand-600" aria-hidden="true" />
              ) : stage.state === 'current' ? (
                <span className="stage-pulse flex h-6 w-6 items-center justify-center rounded-full bg-info-100 ring-4 ring-info-50">
                  <span className="h-2.5 w-2.5 rounded-full bg-info-600" aria-hidden="true" />
                </span>
              ) : (
                <Circle className="h-6 w-6 text-slate-300" aria-hidden="true" />
              )}
            </span>
            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  stage.state === 'upcoming' ? 'text-slate-400' : 'text-slate-900'
                }`}
              >
                {stage.label}
                {stage.state === 'current' && (
                  <span className="ml-2 rounded-full bg-info-50 px-2 py-0.5 text-xs font-medium text-info-700 ring-1 ring-inset ring-info-100">
                    In progress
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                {stage.state === 'complete' && stage.timestamp
                  ? formatDate(stage.timestamp)
                  : stage.state === 'current'
                    ? CURRENT_STAGE_HINT[stage.key]
                    : 'Not started'}
              </p>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
