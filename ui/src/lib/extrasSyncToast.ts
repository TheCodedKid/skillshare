import type { ExtrasSyncResult } from '../api/client';
import type { TranslationParams } from '../i18n';

export type SyncTotals = {
  synced: number;
  skipped: number;
  targets: number;
  errors: number;
  errorDetails: string[];
};

export type TFunc = (key: string, params?: TranslationParams, fallback?: string) => string;

const emptyTotals = (): SyncTotals => ({
  synced: 0,
  skipped: 0,
  targets: 0,
  errors: 0,
  errorDetails: [],
});

export function sumEntry(entry: ExtrasSyncResult | undefined): SyncTotals {
  if (!entry) return emptyTotals();
  const totals = emptyTotals();

  for (const target of entry.targets) {
    if (target.error) {
      totals.errors++;
      totals.errorDetails.push(target.error);
      continue;
    }

    totals.synced += target.synced;
    totals.skipped += target.skipped;
    totals.errors += target.errors?.length ?? 0;
    totals.errorDetails.push(...(target.errors ?? []));
  }

  totals.targets = entry.targets.length;
  return totals;
}

export function sumAll(extras: ExtrasSyncResult[]): SyncTotals {
  const totals = emptyTotals();

  for (const entry of extras) {
    const entryTotals = sumEntry(entry);
    totals.synced += entryTotals.synced;
    totals.skipped += entryTotals.skipped;
    totals.targets += entryTotals.targets;
    totals.errors += entryTotals.errors;
    totals.errorDetails.push(...entryTotals.errorDetails);
  }

  return totals;
}

export function syncToastType(totals: SyncTotals): 'success' | 'warning' | 'error' {
  if (totals.errors > 0 && totals.synced === 0) return 'error';
  if (totals.errors > 0) return 'warning';
  if (totals.skipped > 0 && totals.synced === 0) return 'warning';
  return 'success';
}

function firstErrorDetail(totals: SyncTotals, t: TFunc): string {
  const [first, ...rest] = totals.errorDetails;
  if (!first) return '';
  if (rest.length === 0) return first;
  return `${first} (${t('extras.toast.nErrors', { errors: rest.length }, `${rest.length} more error${rest.length > 1 ? 's' : ''}`)})`;
}

export function buildSyncToast(label: string, failLabel: string, totals: SyncTotals, isForce: boolean, t: TFunc): string {
  const errorText = t('extras.toast.nErrors', { errors: totals.errors }, `${totals.errors} error${totals.errors > 1 ? 's' : ''}`);
  const errorDetail = firstErrorDetail(totals, t);
  const errorSummary = errorDetail ? `${errorText}: ${errorDetail}` : errorText;

  if (totals.errors > 0 && totals.synced === 0) return `${failLabel} — ${errorSummary}`;
  if (totals.synced === 0 && totals.skipped === 0 && totals.errors === 0)
    return `${label} — ${t('extras.toast.noFilesInSource', {}, 'no files in source')}`;

  const parts: string[] = [];
  parts.push(t('extras.toast.syncedNFiles', { synced: totals.synced, targets: totals.targets }, `${totals.synced} file${totals.synced !== 1 ? 's' : ''} to ${totals.targets} target${totals.targets !== 1 ? 's' : ''}`));
  if (totals.skipped > 0)
    parts.push(!isForce
      ? t('extras.toast.skippedForce', { skipped: totals.skipped }, `${totals.skipped} skipped (enable Force to override)`)
      : t('extras.toast.skipped', { skipped: totals.skipped }, `${totals.skipped} skipped`));
  if (totals.errors > 0) parts.push(errorSummary);

  return `${label} — ${parts.join(', ')}`;
}
