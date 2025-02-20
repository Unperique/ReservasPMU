import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const BeautyBookingSystem = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [services] = useState([
    { id: 1, name: 'Corte de Cabello', duration: 60, price: 25 },
    { id: 2, name: 'Manicure', duration: 45, price: 20 },
    { id: 3, name: 'Pedicure', duration: 45, price: 25 },
    { id: 4, name: 'Tinte', duration: 120, price: 50 },
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleBooking = () => {
    if (!selectedService || !clientName || !clientPhone || !selectedTime) {
      alert('Por favor complete todos los campos');
      return;
    }

    const newAppointment = {
      id: Date.now(),
      service: selectedService,
      clientName,
      clientPhone,
      date: selectedDate,
      time: selectedTime,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [...prev, newAppointment]);
    clearForm();
  };

  const clearForm = () => {
    setSelectedService(null);
    setClientName('');
    setClientPhone('');
    setSelectedTime('');
  };

  const handleCancelAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
  };

  const filteredAppointments = appointments.filter(
    app => app.date === selectedDate
  );

  const isTimeSlotAvailable = (time) => {
    return !appointments.some(app => 
      app.date === selectedDate && 
      app.time === time
    );
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedService?.id || ''}
                  onChange={(e) => {
                    const service = services.find(s => s.id === parseInt(e.target.value));
                    setSelectedService(service);
                  }}
                >
                  <option value="">Seleccione un servicio</option>
                  {services.map(service => (
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horario</label>
                <select 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Seleccione un horario</option>
                  {timeSlots.map(time => (
                    <option 
                      key={time} 
                      value={time}
                      disabled={!isTimeSlotAvailable(time)}
                    >
                      {time} {!isTimeSlotAvailable(time) ? '(Ocupado)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleBooking}
              >
                Crear Reserva
              </button>
            </div>

            {/* Lista de Reservas */}
            <div>
              <h3 className="text-lg font-medium mb-4">Reservas del Día</h3>
              <input
                type="date"
                className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="p-3 border rounded shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{appointment.clientName}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.service.name} - {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                      </div>
                      <button 
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
                {filteredAppointments.length === 0 && (
                  <p className="text-gray-500 text-center">No hay reservas para este día</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautyBookingSystem;