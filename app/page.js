
type Participant = {
  time: number;
  enrollmentNo: string;
  name: string;
  email: string;
  contact: string;
  dept: string;
  year: string;
};

const NOT_ATTEMPTED = 9999;

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}min ${seconds % 60}sec`;
}

function PodiumCard({
  participant,
  rank,
}: {
  participant: Participant;
  rank: 1 | 2 | 3;
}) {
  const styles = {
    1: {
      card: "border-amber-300 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white",
      label: "text-amber-50",
      badge: "bg-white/20 text-white",
      medal: "🥇",
      title: "1st Place · Gold",
    },
    2: {
      card: "border-slate-300 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-800",
      label: "text-slate-600",
      badge: "bg-white/70 text-slate-800",
      medal: "🥈",
      title: "2nd Place · Silver",
    },
    3: {
      card: "border-orange-300 bg-gradient-to-br from-orange-200 via-orange-300 to-amber-500 text-orange-950",
      label: "text-orange-900/70",
      badge: "bg-white/50 text-orange-950",
      medal: "🥉",
      title: "3rd Place · Bronze",
    },
  }[rank];

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-md transition-transform hover:-translate-y-1 ${styles.card}`}
    >
      <div className="pointer-events-none absolute -right-5 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-2xl">{styles.medal}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}
          >
            {styles.title}
          </span>
        </div>

        <h2 className="break-words text-xl font-extrabold">
          {participant.name || "Unknown participant"}
        </h2>

        <p className={`mt-1 text-sm font-mono ${styles.label}`}>
          {participant.enrollmentNo}
        </p>

        <div className="mt-5 border-t border-current/20 pt-4">
          <p className={`text-xs font-semibold uppercase ${styles.label}`}>
            Completion Time
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums">
            {formatTime(participant.time)}
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function Page() {
  const spreadsheetId =
    "168HtZa-oiN85kgkzuRt8udLDUJAuX4Ael3nNEGUNhCA";

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard data.");
  }

  const responseText = await res.text();
  const jsonText = responseText.substring(
    responseText.indexOf("{"),
    responseText.lastIndexOf("}") + 1
  );

  const json = JSON.parse(jsonText);

  const rows = json.table.rows.map(
    (row: { c: ({ v: unknown } | null)[] }) =>
      (row.c ?? []).map((cell) => cell?.v ?? null)
  );

  const participants: Participant[] = rows
    .filter((row: unknown[]) => row.some((cell) => cell !== null))
    .map((row: unknown[]) => {
      const parsedTime = Number(row[0]);

      return {
        time:
          row[0] === null ||
          row[0] === "" ||
          !Number.isFinite(parsedTime)
            ? NOT_ATTEMPTED
            : parsedTime,
        enrollmentNo: String(row[1] ?? ""),
        name: String(row[2] ?? "Unknown"),
        email: String(row[3] ?? ""),
        contact: String(row[4] ?? ""),
        dept: String(row[5] ?? ""),
        year: String(row[6] ?? ""),
      };
    });

  // Valid attempts first, fastest time wins.
  // Unattempted participants (9999) appear at the bottom.
  const sortedRows = [...participants].sort(
    (a, b) => a.time - b.time
  );

  const attemptedRows = sortedRows.filter(
    (participant) => participant.time !== NOT_ATTEMPTED
  );

  const topper = attemptedRows[0];
  const secondTop = attemptedRows[1];
  const thirdTop = attemptedRows[2];

  const lowestTime =
    attemptedRows.length > 0 ? attemptedRows[0].time : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header and statistics */}
        <header className="flex flex-col items-start justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Sheet Leaderboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Live submission rankings and stats
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Entries
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {participants.length}
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lowest Time
              </p>
              <p className="mt-1 text-xl font-black text-amber-600">
                {lowestTime === null
                  ? "—"
                  : `${lowestTime}s`}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Attempts completed</span>
                <span className="font-bold text-emerald-700">
                  {attemptedRows.length} / {participants.length}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${
                      participants.length
                        ? (attemptedRows.length / participants.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Winners podium */}
        {attemptedRows.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Winners Podium
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ranked by the fastest completion time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {topper && (
                <PodiumCard participant={topper} rank={1} />
              )}
              {secondTop && (
                <PodiumCard participant={secondTop} rank={2} />
              )}
              {thirdTop && (
                <PodiumCard participant={thirdTop} rank={3} />
              )}
            </div>
          </section>
        )}

        {attemptedRows.length === 0 && (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-lg font-bold text-slate-700">
              No attempts yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Winners will appear here after participants submit their times.
            </p>
          </section>
        )}

        {/* All submissions */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-1 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-800">
                All Submissions
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Fastest times first · Not attempted entries last
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {attemptedRows.length} completed ·{" "}
              {participants.length - attemptedRows.length} pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="w-16 px-5 py-4 text-center">Rank</th>
                  <th className="px-5 py-4">Enrollment No</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Time / Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedRows.map((participant, index) => {
                  const isPending =
                    participant.time === NOT_ATTEMPTED;

                  const rank = isPending
                    ? null
                    : index + 1;

                  const rankStyle =
                    rank === 1
                      ? "bg-amber-100 text-amber-800"
                      : rank === 2
                        ? "bg-slate-200 text-slate-700"
                        : rank === 3
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-500";

                  return (
                    <tr
                      key={`${participant.enrollmentNo}-${index}`}
                      className={`transition-colors ${
                        isPending
                          ? "bg-slate-50/70 text-slate-400"
                          : rank === 1
                            ? "bg-amber-50/60 hover:bg-amber-50"
                            : rank === 2
                              ? "bg-slate-50/70 hover:bg-slate-100"
                              : rank === 3
                                ? "bg-orange-50/50 hover:bg-orange-50"
                                : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-5 py-4 text-center">
                        {rank !== null && rank <= 3 ? (
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-base ${rankStyle}`}
                          >
                            {rank === 1
                              ? "🥇"
                              : rank === 2
                                ? "🥈"
                                : "🥉"}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-bold ${rankStyle}`}
                          >
                            {rank ?? "—"}
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-medium">
                        {participant.enrollmentNo || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                        {participant.name}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Not attempted
                          </span>
                        ) : (
                          <span
                            className={`font-mono text-xs font-bold ${
                              rank === 1
                                ? "text-amber-700"
                                : rank === 2
                                  ? "text-slate-600"
                                  : "text-slate-600"
                            }`}
                          >
                            {formatTime(participant.time)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="border-t border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <td colSpan={2} className="px-5 py-4">
                    Total: {participants.length}
                  </td>
                  <td colSpan={2} className="px-5 py-4 text-right">
                    Best time:{" "}
                    <span className="text-amber-700">
                      {lowestTime === null
                        ? "No attempts"
                        : formatTime(lowestTime)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <p className="text-center text-xs text-slate-400">
          Leaderboard refreshes from the spreadsheet every 60 seconds.
        </p>
      </div>
    </main>
  );
}
