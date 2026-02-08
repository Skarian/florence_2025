import MapPanel from "@/components/MapPanel";

export default function MembersPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="chip">Members</p>
        <h1 className="text-3xl sm:text-4xl">
          Booking essentials for RubyDuby.
        </h1>
        <p className="text-muted max-w-2xl">
          This page will summarize confirmations, check-ins, and meeting points,
          all in one secure timeline view.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-[7fr_5fr]">
        <div className="space-y-6">
          <div className="card space-y-3">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              Access
            </p>
            <p className="text-sm text-fog/70">
              A password prompt will gate this page before showing details.
            </p>
          </div>
          <div className="card space-y-3">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              Booking timeline
            </p>
            <p className="text-sm text-fog/70">
              Member-only bookings will render here.
            </p>
          </div>
        </div>
        <MapPanel
          title="Member map"
          subtitle="Sensitive locations appear only after unlock."
        />
      </div>
    </section>
  );
}
