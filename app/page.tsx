export default function Home() {
  return (
    <main className="h-screen w-screen bg-gray-100 overflow-hidden fixed">

      <header className="bg-gray-300 grid grid-cols-3 items-center px-6 py-4">
        <div></div> 
        <h1 className="text-black text-center font-bold">Nazwa</h1>
        <div className="w-10 h-10 bg-gray-400 rounded-full justify-self-end"></div>
      </header>

      <section className="p-6 flex gap-6 h-dvh">
        <div className="flex-1 bg-gray-300 rounded-lg h-9/10 w-6/10"></div>
        <div className="w-4/10 flex flex-col gap-6">
          <div className="bg-gray-300 rounded-lg h-1/10"></div>
          <div className="bg-gray-300 rounded-lg h-4/10"></div>
          <div className="bg-gray-300 rounded-lg h-3/10"></div>
        </div>
      </section> 
    </main>
  );
}
