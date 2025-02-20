import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de que la ruta sea correcta

const BeautyBookingSystem = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState([]);
  const [services] = useState([
    { id: 1, name: "Corte de Cabello", duration: 60, price: 25 },
    { id: 2, name: "Manicure", duration: 45, price: 20 },
    { id: 3, name: "Pedicure", duration: 45, price: 25 },
    { id: 4, name: "Tinte", duration: 120, price: 50 },
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // 🔥 Cargar reservas desde Firebase en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reservas"), (snapshot) => {
      const reservasFirebase = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("📥 Reservas desde Firebase:", reservasFirebase);
      setAppointments(reservasFirebase);
    });

    return () => unsubscribe(); // Limpia la suscripción al desmontar el componente
  }, []);

  // 🔥 Función para guardar una nueva reserva en Firebase
  const handleBooking = async () => {
    if (!selectedService || !clientName || !clientPhone || !selectedTime) {
      alert("Por favor complete todos los campos");
      return;
    }

    const newAppointment = {
      service: selectedService,
      clientName,
      clientPhone,
      date: selectedDate,
      time: selectedTime,
      createdAt: new Date().toISOString(),
    };

    try {
      console.log("📤 Enviando reserva a Firebase:", newAppointment);
      await addDoc(collection(db, "reservas"), newAppointment);
      console.log("✅ Reserva guardada con éxito.");
      clearForm();
    } catch (error) {
      console.error("❌ Error al enviar la reserva:", error);
      alert("Hubo un error al guardar la reserva.");
    }
  };

  // 🔥 Función para eliminar una reserva de Firebase
  const handleCancelAppointment = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, "reservas", appointmentId));
      console.log("🗑️ Reserva eliminada de Firebase:", appointmentId);
    } catch (error) {
      console.error("❌ Error al eliminar la reserva:", error);
    }
  };

  // Limpiar formulario después de crear una reserva
  const clearForm = () => {
    setSelectedService(null);
    setClientName("");
    setClientPhone("");
    setSelectedTime("");
  };

  // Filtrar reservas para la fecha seleccionada
  const filteredAppointments = appointments.filter((app) => app.date === selectedDate);

  // Verificar si un horario está disponible
  const isTimeSlotAvailable = (time) => {
    return !appointments.some((app) => app.date === selectedDate && app.time === time);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Sistema de Reservas
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulario de Reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Nueva Reserva</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Servicio</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const service = services.find((s) => s.id === parseInt(e.target.value));
                    setSelectedService(service);
                  }}
                >
                  <option value="">Seleccione un servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horario</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Seleccione un horario</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time} disabled={!isTimeSlotAvailable(time)}>
                      {time} {!isTimeSlotAvailable(time) ? "(Ocupado)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded" onClick={handleBooking}>
                Crear Reserva
              </button>
            </div>

            {/* Lista de Reservas */}
            <div>
              <h3 className="text-lg font-medium mb-4">Reservas del Día</h3>
              <input
                type="date"
                className="w-full p-2 border rounded mb-4"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 border rounded shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.service.name} - {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                      </div>
                      <button
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
                {filteredAppointments.length === 0 && <p className="text-gray-500 text-center">No hay reservas para este día</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautyBookingSystem;