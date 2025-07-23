export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-black shadow-md">
        <div className="flex items-center">
          <img src="/logogotaxi.png" alt="GoTaxi Logo" className="w-8 h-8" />
          <span className="ml-2 text-2xl font-bold text-yellow-500">GoTaxi</span>
        </div>
        <nav>
          <a
            href="/reports"
            className="text-white-700 hover:text-gray-900 font-medium"
          >
            Reportes
          </a>
        </nav>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src="/userloo.png"
            alt="Perfil"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Main content: form + map placeholder */}
      <main className="flex flex-1 overflow-hidden">
        {/* Ride request panel */}
        <aside className="w-full max-w-sm bg-white m-6 p-4 rounded-lg shadow-lg">
          <h2 className="text-black text-xl font-semibold mb-4">Get a ride</h2>
          <form className="space-y-4">
            {/* Pickup location input */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <img
                src="/pickuplogo.png"
                alt="Pickup Icon"
                className="w-5 h-5 text-gray-900"
              />
              <input
                type="text"
                placeholder="Pickup location"
                className="text-gray-600 ml-3 w-full focus:outline-none"
              />
            </div>

            {/* Dropoff location input with add-stop icon */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <img
                src="/dropoff.png"
                alt="Dropoff Icon"
                className="w-5 h-5 text-gray-600"
              />
              <input
                type="text"
                placeholder="Dropoff location"
                className="text-gray-600 ml-3 w-full focus:outline-none"
              />
              <img
                src="/more.png"
                alt="Add Stop"
                className="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
              />
            </div>

            {/* Schedule picker */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <img
                src="/agenda.png"
                alt="Schedule Icon"
                className="w-5 h-5 text-gray-500"
              />
              <select className="text-gray-600 ml-3 w-full bg-transparent focus:outline-none">
                <option>Pickup now</option>
                {/* Aquí puedes añadir más opciones de horario */}
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Pedir Viaje
            </button>
          </form>
        </aside>

        {/* Map placeholder */}
        <div className="flex-1 m-6 bg-gray-100 rounded-lg" />
      </main>
    </div>
  );
}
