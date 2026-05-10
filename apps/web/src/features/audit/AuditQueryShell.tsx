export function AuditQueryShell() {
  return (
    <section data-testid="audit-query-shell">
      <h2>Audit</h2>
      <form>
        <label>
          From
          <input name="from" type="datetime-local" required />
        </label>
        <label>
          To
          <input name="to" type="datetime-local" required />
        </label>
        <label>
          Category
          <select name="category">
            <option value="">Any</option>
            <option value="Security">Security</option>
            <option value="Financial">Financial</option>
            <option value="Configuration">Configuration</option>
          </select>
        </label>
        <button type="submit">Search</button>
      </form>
    </section>
  );
}
