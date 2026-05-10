export function SettingsShell({ categories }: { categories: readonly string[] }) {
  return (
    <section data-testid="settings-shell">
      <h2>Settings</h2>
      <ul>
        {categories.map((category) => (
          <li key={category}>{category}</li>
        ))}
      </ul>
    </section>
  );
}
