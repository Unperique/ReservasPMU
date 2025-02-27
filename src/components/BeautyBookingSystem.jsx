import React, { useState, useEffect } from "react";
import { Calendar, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const BeautyBookingSystem = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState("day"); // "day", "week", or "month"
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  
  // Servicios extraídos de las imágenes
  const [services] = useState([
    // Servicios de Pestañas
    { id: 1, name: "Pestañas Clásicas", duration: 60, price: 60000, category: "pestañas", description: "Tipo de extensiones de pestañas aplicadas en una relación 1:1, dando aspecto súper natural aportando longitud. Duración aprx de 3 a 4 semanas." },
    { id: 2, name: "Pestañas Brasileñas", duration: 90, price: 75000, category: "pestañas", description: "Extensiones de pestañas tecnológicas prefabricadas en forma de YY superpuestas con mejor adhesión en la base, ultra libianas, con efecto natural. Duración aprx de 1 mes." },
    { id: 3, name: "Pestañas 3D 4D", duration: 90, price: 80000, category: "pestañas", description: "Consiste en colocar 3 a 4 pelos por cada pestañas natural dando un acabado con más relleno. Duración aprx de 3 a 4 semanas." },
    { id: 4, name: "Volumen Ruso", duration: 120, price: 100000, category: "pestañas", description: "Las extensiones de pestañas de volumen ruso están especialmente diseñadas para dar un volumen extremo a su mirada. Son conjuntos de pestañas ultrafinas. Duración aprx de 1 mes." },
    { id: 5, name: "Lash Lifting", duration: 60, price: 50000, category: "pestañas", description: "Tratamiento que proporciona un efecto visual de pestañas más curvadas, realzando la mirada de forma natural con sus propias pestañas. Se recomiendan realizarse max. 5 veces al año." },
    { id: 6, name: "Tintado", duration: 30, price: 20000, category: "pestañas", description: "Aplicación de tinte color negro en tus pestañas naturales, da un efecto rímel." },
    { id: 7, name: "Retiro de Pestañas Clásicas y Naturales", duration: 30, price: 20000, category: "pestañas", description: "Retiro profesional de extensiones de pestañas clásicas y naturales." },
    { id: 8, name: "Retiro de Volumen Ruso", duration: 45, price: 30000, category: "pestañas", description: "Retiro profesional de extensiones de pestañas de volumen ruso." },
    
    // Servicios de Cejas Semipermanentes
    { id: 9, name: "Ombré Brows", duration: 120, price: 250000, category: "cejas", description: "Origina un aspecto más definido y relleno, creando un efecto de sombra que imita el aspecto de las cejas maquilladas. Duración aprox de 1 año y medio." },
    { id: 10, name: "Microblading", duration: 120, price: 250000, category: "cejas", description: "Se crean trazos finos que imitan el aspecto de los vellos naturales de las cejas, lo que permite lograr un acabado muy realista y natural. Duración aprox de 1 año." },
    { id: 11, name: "Microblading + Sombreado", duration: 150, price: 300000, category: "cejas", description: "Es la fusión de ambas técnicas, tanto simulación de pelos hiperrealista y sombreado. Duración aprox de 1 año y medio." },
  ]);

  // Estado para el carrito
  const [cart, setCart] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Función para obtener fechas de una semana
  function getWeekDates(date) {
    const week = [];
    const currentDay = new Date(date);
    const day = currentDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Set to the beginning of the week (Sunday)
    currentDay.setDate(currentDay.getDate() - day);
    
    // Get the seven days of the week
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDay);
      week.push(newDate);
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return week;
  }

  // Cargar reservas desde Firebase en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reservas"), (snapshot) => {
      const reservasFirebase = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(reservasFirebase);
    });

    return () => unsubscribe();
  }, []);

  // Agregar un servicio al carrito
  const addToCart = (service) => {
    setCart([...cart, service]);
  };

  // Eliminar un servicio del carrito
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Calcular el total del carrito
  const calculateTotal = () => {
    return cart.reduce((total, service) => total + service.price, 0);
  };

  // Función para guardar una nueva reserva en Firebase
  const handleBooking = async () => {
    if (cart.length === 0 || !clientName || !clientPhone || !selectedTime) {
      alert("Por favor complete todos los campos y agregue al menos un servicio");
      return;
    }

    const newAppointment = {
      services: cart,
      clientName,
      clientPhone,
      date: selectedDate,
      time: selectedTime,
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "reservas"), newAppointment);
      alert("Reserva creada con éxito");
      clearForm();
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
      alert("Hubo un error al guardar la reserva.");
    }
  };

  // Función para eliminar una reserva de Firebase
  const handleCancelAppointment = async (appointmentId) => {
    if (confirm("¿Está seguro que desea cancelar esta reserva?")) {
      try {
        await deleteDoc(doc(db, "reservas", appointmentId));
      } catch (error) {
        console.error("Error al eliminar la reserva:", error);
      }
    }
  };

  // Limpiar formulario después de crear una reserva
  const clearForm = () => {
    setCart([]);
    setSelectedService(null);
    setClientName("");
    setClientPhone("");
    setSelectedTime("");
  };

  // Verificar si un horario está disponible
  const isTimeSlotAvailable = (time, date = selectedDate) => {
    return !appointments.some((app) => app.date === date && app.time === time);
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  // Navegación del mes
  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Navegación de la semana
  const prevWeek = () => {
    const firstDayPrevWeek = new Date(currentWeek[0]);
    firstDayPrevWeek.setDate(firstDayPrevWeek.getDate() - 7);
    setCurrentWeek(getWeekDates(firstDayPrevWeek));
  };

  const nextWeek = () => {
    const firstDayNextWeek = new Date(currentWeek[0]);
    firstDayNextWeek.setDate(firstDayNextWeek.getDate() + 7);
    setCurrentWeek(getWeekDates(firstDayNextWeek));
  };

  // Obtener los días del mes actual para el calendario
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysArray = [];
    
    // Include days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i);
      daysArray.push({
        date: prevMonthDay,
        isCurrentMonth: false
      });
    }
    
    // Add all days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      daysArray.push({
        date,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the calendar grid (6 rows x 7 columns)
    const remainingDays = 42 - daysArray.length; // 6 weeks * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      daysArray.push({
        date,
        isCurrentMonth: false
      });
    }
    
    return daysArray;
  };

  // Obtener citas para una fecha específica
  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return appointments.filter(app => app.date === dateString);
  };

  // Filtrar reservas para la fecha seleccionada (vista diaria)
  const filteredAppointments = appointments.filter((app) => app.date === selectedDate);

  // Renderizar vista de calendario mensual
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const monthYear = currentMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium capitalize">{monthYear}</h3>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dateString = day.date.toISOString().split('T')[0];
            const appointmentsForDay = appointments.filter(app => app.date === dateString);
            const isSelected = dateString === selectedDate;
            
            return (
              <div 
                key={index}
                className={`p-1 h-24 border rounded overflow-hidden ${
                  !day.isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''
                } ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedDate(dateString);
                  setViewMode("day");
                }}
              >
                <div className="text-right">
                  <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>
                    {day.date.getDate()}
                  </span>
                </div>
                <div className="mt-1 overflow-y-auto max-h-16">
                  {appointmentsForDay.length > 0 && (
                    <div className="text-xs">
                      {appointmentsForDay.slice(0, 3).map((app, i) => (
                        <div key={i} className="truncate bg-blue-100 p-1 mb-1 rounded">
                          {app.time} - {app.clientName}
                        </div>
                      ))}
                      {appointmentsForDay.length > 3 && (
                        <div className="text-center text-xs text-blue-500">
                          +{appointmentsForDay.length - 3} más
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar vista de calendario semanal
  const renderWeekView = () => {
    const weekDates = currentWeek;
    const weekRange = `${weekDates[0].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${weekDates[6].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`;
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevWeek} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium">{weekRange}</h3>
          <button onClick={nextWeek} className="p-1 rounded hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('es-CO', { weekday: 'short' });
            const dayNum = date.getDate();
            const isToday = new Date().toISOString().split('T')[0] === dateString;
            const isSelected = dateString === selectedDate;
            const appointmentsForDay = appointments.filter(app => app.date === dateString);
            
            return (
              <div 
                key={index} 
                className={`border rounded overflow-hidden ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'border-blue-500' : ''}`}
                onClick={() => {
                  setSelectedDate(dateString);
                  setViewMode("day");
                }}
              >
                <div className={`text-center p-2 border-b ${isToday ? 'bg-blue-500 text-white' : ''}`}>
                  <div className="font-medium">{dayName}</div>
                  <div className={`text-lg ${isSelected ? 'font-bold' : ''}`}>{dayNum}</div>
                </div>
                
                <div className="p-1 h-48 overflow-y-auto">
                  {timeSlots.map(time => {
                    const hasAppointment = appointmentsForDay.find(app => app.time === time);
                    
                    return (
                      <div 
                        key={time} 
                        className={`p-1 text-xs mb-1 rounded ${
                          hasAppointment ? 'bg-blue-100' : 'text-gray-400'
                        }`}
                      >
                        <div className="font-medium">{time}</div>
                        {hasAppointment && (
                          <div className="truncate">{hasAppointment.clientName}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar vista de citas diarias
  const renderDayView = () => {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => {
              const prevDay = new Date(selectedDate);
              prevDay.setDate(prevDay.getDate() - 1);
              setSelectedDate(prevDay.toISOString().split('T')[0]);
            }} 
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium">
            {formatDate(selectedDate)}
          </h3>
          <button 
            onClick={() => {
              const nextDay = new Date(selectedDate);
              nextDay.setDate(nextDay.getDate() + 1);
              setSelectedDate(nextDay.toISOString().split('T')[0]);
            }} 
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((appointment) => (
              <div key={appointment.id} className="p-3 border rounded shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-blue-600 mr-2">{appointment.time}</span>
                      <p className="font-medium">{appointment.clientName}</p>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                    <div className="mt-1 text-sm">
                      {appointment.services && appointment.services.map((service, idx) => (
                        <p key={idx} className="text-xs text-gray-500">• {service.name}</p>
                      ))}
                    </div>
                    <p className="font-medium mt-1">Total: {formatPrice(appointment.total || 0)}</p>
                  </div>
                  <button
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                    onClick={() => handleCancelAppointment(appointment.id)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay reservas para este día</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Sistema de Reservas de SM Studio PMU
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna de servicios */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selector de vista */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Servicios</h3>
                <div className="bg-gray-100 rounded-lg p-1">
                  <div className="flex space-x-1">
                    <button 
                      className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-white shadow' : ''}`}
                      onClick={() => setViewMode('day')}
                    >
                      Día
                    </button>
                    <button 
                      className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-white shadow' : ''}`}
                      onClick={() => setViewMode('week')}
                    >
                      Semana
                    </button>
                    <button 
                      className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-white shadow' : ''}`}
                      onClick={() => setViewMode('month')}
                    >
                      Mes
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Vista de calendario según la selección */}
              <div className="mb-6">
                {viewMode === 'day' && renderDayView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthView()}
              </div>
              
              {/* Categoria: Pestañas */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Pestañas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services
                    .filter(service => service.category === "pestañas")
                    .map(service => (
                      <div key={service.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="p-4">
                          <h4 className="font-semibold text-lg">{service.name}</h4>
                          <p className="text-sm text-gray-600 my-2">{service.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="font-bold text-lg">{formatPrice(service.price)}</span>
                            <button 
                              onClick={() => addToCart(service)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Categoria: Cejas */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Cejas Semipermanentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services
                    .filter(service => service.category === "cejas")
                    .map(service => (
                      <div key={service.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="p-4">
                          <h4 className="font-semibold text-lg">{service.name}</h4>
                          <p className="text-sm text-gray-600 my-2">{service.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="font-bold text-lg">{formatPrice(service.price)}</span>
                            <button 
                              onClick={() => addToCart(service)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {/* Columna de carrito y reserva */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {/* Carrito */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md mb-6">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5" />
                    Servicios Seleccionados
                  </h3>
                  
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay servicios seleccionados</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((service, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-600">{formatPrice(service.price)}</p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center pt-2 font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Formulario de Reserva */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-medium mb-4">Datos de la Reserva</h3>
                  
                  <div className="space-y-4">
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
                      <label className="block text-sm font-medium mb-1">Fecha</label>
                      <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
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
                    
                    <button 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                      onClick={handleBooking}
                    >
                      Confirmar Reserva
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautyBookingSystem;