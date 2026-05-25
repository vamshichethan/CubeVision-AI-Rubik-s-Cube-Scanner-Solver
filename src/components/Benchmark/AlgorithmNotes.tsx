export function AlgorithmNotes() {
  return (
    <section className="panel rounded-lg p-4 text-sm text-slate-700">
      <h2 className="mb-3 text-lg font-semibold text-slate-950">Algorithm Notes</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <p><strong>BFS</strong> is complete and optimal for shallow scrambles, but memory grows explosively.</p>
        <p><strong>IDDFS</strong> saves memory by repeating depth-limited searches.</p>
        <p><strong>A*</strong> is fast with a strong heuristic but keeps many frontier states in memory.</p>
        <p><strong>IDA*</strong> combines heuristic search with low memory depth bounds.</p>
        <p><strong>Kociemba</strong> is practical for Rubik’s Cube solving because it reduces the search into two phases.</p>
      </div>
    </section>
  );
}
