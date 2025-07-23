// app/page.tsx
"use client";

import { useState } from "react";
import MapComponent from "./components/mapcomponent";  // coincide con el fichero

export default function Home() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("now");
  const [loading, setLoading] = useState(false);

  const handleRequestRide = () => {
    setLoading(true);
    // ... lógica de petición
    setTimeout(() => {
      setLoading(false);
      alert("¡Viaje solicitado exitosamente!");
    }, 2000);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="bg-white p-6 w-full md:w-1/3 shadow-lg">
        {/* formulario */}
      </div>
      <div className="flex-1 bg-gray-100 p-6">
        <MapComponent />
      </div>
    </div>
  );
}
