import type { BillableValidationView, PageResult, PropertySummary } from './api';
import { SafeValidationSummary } from './SafeValidationSummary';

export function PropertySearchFilters() {
  return (
    <form data-testid="property-search-filters" className="uow02-toolbar">
      <label>
        Property code
        <input name="propertyCode" data-testid="property-search-code-input" />
      </label>
      <label>
        Block
        <input name="block" data-testid="property-search-block-input" />
      </label>
      <label>
        Lot
        <input name="lot" data-testid="property-search-lot-input" />
      </label>
      <button type="submit" data-testid="property-search-submit-button">
        Search
      </button>
    </form>
  );
}

export function PropertyResultTable({ result }: { result: PageResult<PropertySummary> }) {
  return (
    <table data-testid="property-result-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Identity</th>
          <th>Billing</th>
          <th>Lifecycle</th>
        </tr>
      </thead>
      <tbody>
        {result.items.map((property) => (
          <tr key={property.id}>
            <td>{property.propertyCode}</td>
            <td>{`${property.phaseOrSection} ${property.block} ${property.lot} ${property.street}`}</td>
            <td>{property.billingStatus}</td>
            <td>{property.lifecycleStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PropertyForm() {
  return (
    <form data-testid="property-form">
      <input name="phaseOrSection" placeholder="Phase or section" required />
      <input name="block" placeholder="Block" required />
      <input name="lot" placeholder="Lot" required />
      <input name="street" placeholder="Street" required />
      <input name="lotAreaSqm" placeholder="Lot area sqm" required />
      <button type="submit">Save</button>
    </form>
  );
}

export function PropertyAliasEditor() {
  return (
    <form data-testid="property-alias-editor">
      <input name="aliasType" placeholder="Alias type" />
      <input name="aliasValue" placeholder="Alias value" />
      <button type="submit">Save alias</button>
    </form>
  );
}

export function BillableValidationPanel({ validation }: { validation: BillableValidationView }) {
  return (
    <section data-testid="property-billable-validation-panel">
      <h3>Billable Validation</h3>
      <p>{validation.isValid ? 'Valid' : 'Invalid'}</p>
      <SafeValidationSummary messages={validation.reasonCodes} />
    </section>
  );
}

export function OwnershipTimelinePanel({ periods }: { periods: readonly unknown[] }) {
  return (
    <section data-testid="ownership-timeline-panel">
      <h3>Ownership Timeline</h3>
      <p>{periods.length} period(s)</p>
    </section>
  );
}

export function OwnershipTransferForm() {
  return (
    <form data-testid="ownership-transfer-form">
      <input name="homeownerId" placeholder="Responsible homeowner ID" />
      <input name="effectiveFrom" type="date" />
      <button type="submit">Transfer</button>
    </form>
  );
}

export function BillingAccountPeriodPanel({ periods }: { periods: readonly unknown[] }) {
  return (
    <section data-testid="billing-account-period-panel">
      <h3>Billing Account Periods</h3>
      <p>{periods.length} effective period(s)</p>
    </section>
  );
}

export function PropertySearchPage({ result }: { result: PageResult<PropertySummary> }) {
  return (
    <section data-testid="property-search-page">
      <h2>Properties</h2>
      <PropertySearchFilters />
      <PropertyResultTable result={result} />
    </section>
  );
}
