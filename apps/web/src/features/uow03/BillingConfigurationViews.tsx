import type { ConfigurationDraftView, PageResult, ResolutionPreviewView } from './api';
import { SafeConfigurationError } from './SafeConfigurationError';

const configurationTypes = [
  'DuesRate',
  'BillingCycle',
  'DueDate',
  'GracePeriod',
  'Rounding',
  'ChargeType',
  'NumberingFormat',
  'TemplateReference',
  'PaymentMethod'
];

export function BillingConfigurationDashboard({ result }: { result: PageResult<ConfigurationDraftView> }) {
  return (
    <section data-testid="billing-config-dashboard">
      <h2>Billing Configuration</h2>
      <ConfigurationDraftFilters />
      <ConfigurationVersionHistory result={result} />
    </section>
  );
}

export function ConfigurationDraftFilters() {
  return (
    <form data-testid="billing-config-draft-filters" className="uow02-toolbar">
      <label>
        Type
        <select name="configurationType" data-testid="billing-config-type-select">
          <option value="">Any</option>
          {configurationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Scope
        <input name="scopeKey" data-testid="billing-config-scope-input" defaultValue="hoa-default" />
      </label>
      <button type="submit" data-testid="billing-config-search-button">
        Search
      </button>
    </form>
  );
}

export function ConfigurationVersionHistory({ result }: { result: PageResult<ConfigurationDraftView> }) {
  return (
    <table data-testid="billing-config-version-history">
      <thead>
        <tr>
          <th>Type</th>
          <th>Identity</th>
          <th>Status</th>
          <th>Effective</th>
          <th>Approval</th>
        </tr>
      </thead>
      <tbody>
        {result.items.map((draft) => (
          <tr key={draft.id}>
            <td>{draft.configurationType}</td>
            <td>{draft.identityKey}</td>
            <td>{draft.status}</td>
            <td>
              {draft.effectiveFrom} to {draft.effectiveTo ?? 'open'}
            </td>
            <td>{draft.approvalRequestId ?? 'Not submitted'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EffectiveFields() {
  return (
    <>
      <label>
        Effective from
        <input name="effectiveFrom" type="date" required data-testid="billing-config-effective-from-input" />
      </label>
      <label>
        Effective to
        <input name="effectiveTo" type="date" data-testid="billing-config-effective-to-input" />
      </label>
    </>
  );
}

export function RateRuleForm() {
  return (
    <form data-testid="billing-config-rate-rule-form">
      <EffectiveFields />
      <label>
        Rate per sqm
        <input name="ratePerSqm" inputMode="decimal" data-testid="billing-config-rate-input" />
      </label>
      <button type="submit" data-testid="billing-config-rate-save-button">Save</button>
    </form>
  );
}

export function BillingCycleForm() {
  return (
    <form data-testid="billing-config-cycle-form">
      <EffectiveFields />
      <label>
        Cycle type
        <select name="cycleType" data-testid="billing-config-cycle-type-select">
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="SemiAnnual">SemiAnnual</option>
          <option value="Annual">Annual</option>
          <option value="Custom">Custom</option>
        </select>
      </label>
      <button type="submit" data-testid="billing-config-cycle-save-button">Save</button>
    </form>
  );
}

export function DueGraceRuleForm() {
  return (
    <form data-testid="billing-config-due-grace-form">
      <EffectiveFields />
      <label>
        Due date offset
        <input name="dayOffset" type="number" data-testid="billing-config-due-offset-input" />
      </label>
      <label>
        Grace days
        <input name="graceDays" type="number" data-testid="billing-config-grace-days-input" />
      </label>
      <button type="submit" data-testid="billing-config-due-grace-save-button">Save</button>
    </form>
  );
}

export function ChargeTypeForm() {
  return (
    <form data-testid="billing-config-charge-type-form">
      <EffectiveFields />
      <label>
        Code
        <input name="code" data-testid="billing-config-charge-code-input" />
      </label>
      <label>
        Manual entry
        <input name="isManualEntryEligible" type="checkbox" data-testid="billing-config-charge-manual-checkbox" />
      </label>
      <label>
        Automatic generation
        <input name="isAutomaticGenerationEligible" type="checkbox" data-testid="billing-config-charge-auto-checkbox" />
      </label>
      <span data-testid="billing-config-manual-tax-like-indicator">Manual tax-like charges are configured only for manual entry.</span>
      <button type="submit" data-testid="billing-config-charge-save-button">Save</button>
    </form>
  );
}

export function NumberingFormatPage() {
  return <section data-testid="billing-config-numbering-page">Numbering metadata only; later units allocate actual numbers.</section>;
}

export function TemplateReferencePage() {
  return <section data-testid="billing-config-template-reference-page">Template metadata only; rendering is owned by support units.</section>;
}

export function PaymentMethodPage() {
  return <section data-testid="billing-config-payment-method-page">Payment method definitions only; UOW-03 does not post payments.</section>;
}

export function ConfigurationApprovalPanel() {
  return (
    <section data-testid="billing-config-approval-panel">
      <button type="button" data-testid="billing-config-submit-approval-button">Submit for approval</button>
      <button type="button" data-testid="billing-config-activate-button">Activate approved version</button>
    </section>
  );
}

export function ConfigurationResolutionPreview({ result }: { result: ResolutionPreviewView }) {
  return (
    <section data-testid="billing-config-resolution-preview">
      <h3>Resolution Preview</h3>
      {result.ok ? <pre>{JSON.stringify(result.snapshot, null, 2)}</pre> : <SafeConfigurationError messages={[result.reason ?? 'Configuration could not be resolved']} />}
    </section>
  );
}

export function BillingConfigurationPage() {
  return (
    <section data-testid="billing-config-rate-rule-page">
      <BillingConfigurationDashboard result={{ items: [], page: 1, pageSize: 25, totalItems: 0 }} />
      <RateRuleForm />
      <BillingCycleForm />
      <DueGraceRuleForm />
      <ChargeTypeForm />
      <NumberingFormatPage />
      <TemplateReferencePage />
      <PaymentMethodPage />
      <ConfigurationApprovalPanel />
      <ConfigurationResolutionPreview result={{ ok: false, reason: 'No preview selected' }} />
    </section>
  );
}
