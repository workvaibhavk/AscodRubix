export default async function Page() {
  const spreadsheetId = '168HtZa-oiN85kgkzuRt8udLDUJAuX4Ael3nNEGUNhCA';
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  const res = await fetch(url,  {
  next: { revalidate: 60 },
});
  const text = await res.text();

  const json = JSON.parse(text.substring(47, text.length - 2));
  const rows = json.table.rows.map((row) => row.c.map((cell) => cell?.v));

  console.log(rows)

  const filteredRows = rows.map((row) => ({
    time: row[0],
    enrollmentNo: row[1],
    name: row[2]
  }));

  const sortedRows = [...filteredRows].sort((b, a) => (b.time || 0) - (a.time || 0));
  const highestScore = Math.min(...filteredRows.map((item) => item.time));
  const topper = sortedRows[0];

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
<div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Sheet Leaderboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live submission rankings and stats
            </p>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[130px]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Entries</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{filteredRows.length}</p>
            </div>
            <div className="flex-1 sm:flex-none bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[130px]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lowest Time</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{highestScore}s</p>
            </div>
          </div>
        </header>

        {topper && (
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 text-white shadow-lg">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-amber-200 font-bold uppercase tracking-wider text-xs mb-3">
              <span>🏆</span>
              <span>Current Leader</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold">{topper.name}</h2>
                <p className="text-amber-100 text-sm font-mono mt-0.5">{topper.enrollmentNo}</p>
              </div>

              <div className="flex flex-wrap md:flex-nowrap md:col-span-3 justify-between items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-amber-400/40">
                <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-center">
                  <p className="text-xs text-amber-200">Time</p>
                  <p className="text-2xl font-black">{Math.floor(topper.time/60) + "min " + topper.time%60 + "sec"}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">All Submissions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5 w-16 text-center">#</th>
                  <th scope="col" className="px-6 py-3.5">Enrollment No</th>
                  <th scope="col" className="px-6 py-3.5">Name</th>
                  <th scope="col" className="px-6 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedRows.map((row, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-center font-bold text-slate-400">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {row.enrollmentNo}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {row.name}
                    </td>
                  
                   
                    <td className="px-6 py-4 text-xs text-slate-500">
                  {Math.floor(row.time/60) + "min " + Math.floor(row.time%60) + "sec"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <td colSpan={2} className="px-6 py-3.5">
                    Total Responses: <span className="text-slate-900 font-bold">{filteredRows.length}</span>
                  </td>
                  <td colSpan={4} className="px-6 py-3.5 text-right">
                    Lowest Time: <span className="text-amber-600 font-bold">{highestScore}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}