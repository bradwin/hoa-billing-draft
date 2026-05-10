import type { HomeownerSummary, PageResult } from './api';
import { SafeValidationSummary } from './SafeValidationSummary';

export function HomeownerSearchFilters() {
  return (
    <form data-testid="homeowner-search-filters" className="uow02-toolbar">
      <label>
        Name
        <input name="name" data-testid="homeowner-search-name-input" />
      </label>
      <label>
        Code
        <input name="homeownerCode" data-testid="homeowner-search-code-input" />
      </label>
      <label>
        Status
        <select name="status" data-testid="homeowner-search-status-select">
          <option value="">Any</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Deceased">Deceased</option>
          <option value="Archived">Archived</option>
        </select>
      </label>
      <button type="submit" data-testid="homeowner-search-submit-button">
        Search
      </button>
    </form>
  );
}

export function HomeownerResultTable({ result }: { result: PageResult<HomeownerSummary> }) {
  return (
    <table data-testid="homeowner-result-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Status</th>
          <th>Contact</th>
        </tr>
      </thead>
      <tbody>
        {result.items.map((homeowner) => (
          <tr key={homeowner.id}>
            <td>{homeowner.homeownerCode}</td>
            <td>{homeowner.legalName}</td>
            <td>
              <span data-testid="homeowner-status-badge">{homeowner.status}</span>
            </td>
            <td>{homeowner.primaryEmail ?? 'PII masked or unavailable'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DuplicateCandidatePanel({ candidates }: { candidates: readonly HomeownerSummary[] }) {
  return (
    <section data-testid="homeowner-duplicate-candidate-panel">
      <h3>Duplicate Review</h3>
      {candidates.length === 0 ? <p>No candidates.</p> : null}
      {candidates.map((candidate) => (
        <p key={candidate.id}>{candidate.homeownerCode}</p>
      ))}
    </section>
  );
}

export function HomeownerForm() {
  return (
    <form data-testid="homeowner-form">
      <label>
        Legal name
        <input name="legalName" required />
      </label>
      <label>
        Primary email
        <input name="primaryEmail" type="email" />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}

export function HomeownerSearchPage({ result }: { result: PageResult<HomeownerSummary> }) {
  return (
    <section data-testid="homeowner-search-page">
      <h2>Homeowners</h2>
      <HomeownerSearchFilters />
      <SafeValidationSummary messages={[]} />
      <HomeownerResultTable result={result} />
    </section>
  );
}
