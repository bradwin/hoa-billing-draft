export interface ApprovalListItem {
  id: string;
  requesterUserId: string;
  actionType: string;
  status: string;
}

export function ApprovalQueueShell({ items }: { items: readonly ApprovalListItem[] }) {
  return (
    <section data-testid="approval-queue-shell">
      <h2>Approvals</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.actionType} - {item.status}</li>
        ))}
      </ul>
    </section>
  );
}
