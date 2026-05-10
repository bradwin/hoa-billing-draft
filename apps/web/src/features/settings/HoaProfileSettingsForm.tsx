'use client';

export function HoaProfileSettingsForm() {
  return (
    <form data-testid="settings-hoa-profile-form">
      <label>
        HOA name
        <input name="name" required maxLength={160} />
      </label>
      <label>
        Address
        <input name="address" required maxLength={300} />
      </label>
      <label>
        Contact email
        <input name="contactEmail" type="email" required />
      </label>
      <label>
        Change reason
        <textarea name="reason" required maxLength={1000} />
      </label>
      <button type="submit">Save</button>
    </form>
  );
}
