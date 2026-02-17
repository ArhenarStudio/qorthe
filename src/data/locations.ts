export const LOCATIONS: Record<string, { states: { name: string; cities: string[] }[] }> = {
  MX: {
    states: [
      {
        name: "Aguascalientes",
        cities: ["Aguascalientes", "Asientos", "Calvillo", "Cosío", "Jesús María", "Pabellón de Arteaga", "Rincón de Romos"]
      },
      {
        name: "Baja California",
        cities: ["Ensenada", "Mexicali", "Playas de Rosarito", "Tecate", "Tijuana"]
      },
      {
        name: "Baja California Sur",
        cities: ["Cabo San Lucas", "Ciudad Constitución", "Guerrero Negro", "La Paz", "Loreto", "San José del Cabo", "Santa Rosalía"]
      },
      {
        name: "Campeche",
        cities: ["Campeche", "Champotón", "Ciudad del Carmen", "Escárcega", "Hecelchakán"]
      },
      {
        name: "Chiapas",
        cities: ["Chiapa de Corzo", "Comitán de Domínguez", "Ocosingo", "Palenque", "San Cristóbal de las Casas", "Tapachula", "Tonalá", "Tuxtla Gutiérrez"]
      },
      {
        name: "Chihuahua",
        cities: ["Camargo", "Chihuahua", "Ciudad Cuauhtémoc", "Ciudad Delicias", "Ciudad Juárez", "Hidalgo del Parral", "Nuevo Casas Grandes"]
      },
      {
        name: "Ciudad de México",
        cities: ["Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"]
      },
      {
        name: "Coahuila",
        cities: ["Ciudad Acuña", "Monclova", "Piedras Negras", "Ramos Arizpe", "Sabinas", "Saltillo", "San Pedro", "Torreón"]
      },
      {
        name: "Colima",
        cities: ["Armería", "Colima", "Manzanillo", "Tecomán", "Villa de Álvarez"]
      },
      {
        name: "Durango",
        cities: ["Ciudad Lerdo", "Durango", "Gómez Palacio", "Santiago Papasquiaro"]
      },
      {
        name: "Guanajuato",
        cities: ["Celaya", "Dolores Hidalgo", "Guanajuato", "Irapuato", "León", "Salamanca", "San Miguel de Allende", "Silao", "Valle de Santiago"]
      },
      {
        name: "Guerrero",
        cities: ["Acapulco", "Chilpancingo", "Iguala", "Ixtapa-Zihuatanejo", "Taxco", "Tlapa"]
      },
      {
        name: "Hidalgo",
        cities: ["Actopan", "Ciudad Sahagún", "Huejutla", "Ixmiquilpan", "Pachuca", "Tepeji del Río", "Tizayuca", "Tula de Allende", "Tulancingo"]
      },
      {
        name: "Jalisco",
        cities: ["Chapala", "Ciudad Guzmán", "Guadalajara", "Lagos de Moreno", "Ocotlán", "Puerto Vallarta", "Tepatitlán", "Tlajomulco", "Tlaquepaque", "Tonalá", "Zapopan"]
      },
      {
        name: "México",
        cities: ["Atizapán de Zaragoza", "Chalco", "Chimalhuacán", "Coacalco", "Cuautitlán Izcalli", "Ecatepec", "Huixquilucan", "Ixtapaluca", "Metepec", "Naucalpan", "Nezahualcóyotl", "Texcoco", "Tlalnepantla", "Toluca", "Valle de Chalco"]
      },
      {
        name: "Michoacán",
        cities: ["Apatzingán", "Ciudad Hidalgo", "La Piedad", "Lázaro Cárdenas", "Morelia", "Pátzcuaro", "Sahuayo", "Uruapan", "Zamora", "Zitácuaro"]
      },
      {
        name: "Morelos",
        cities: ["Cuautla", "Cuernavaca", "Jiutepec", "Temixco", "Yautepec"]
      },
      {
        name: "Nayarit",
        cities: ["Bahía de Banderas", "Ixtlán del Río", "Tepic", "Xalisco"]
      },
      {
        name: "Nuevo León",
        cities: ["Apodaca", "Cadereyta", "García", "General Escobedo", "Guadalupe", "Linares", "Monterrey", "San Nicolás de los Garza", "San Pedro Garza García", "Santa Catarina"]
      },
      {
        name: "Oaxaca",
        cities: ["Huajuapan de León", "Juchitán", "Oaxaca de Juárez", "Puerto Escondido", "Salina Cruz", "San Juan Bautista Tuxtepec", "Santa Cruz Xoxocotlán", "Santo Domingo Tehuantepec"]
      },
      {
        name: "Puebla",
        cities: ["Atlixco", "Cholula", "Huauchinango", "Puebla", "San Martín Texmelucan", "Tehuacán", "Teziutlán"]
      },
      {
        name: "Querétaro",
        cities: ["Corregidora", "El Marqués", "Querétaro", "San Juan del Río"]
      },
      {
        name: "Quintana Roo",
        cities: ["Cancún", "Chetumal", "Cozumel", "Playa del Carmen", "Tulum"]
      },
      {
        name: "San Luis Potosí",
        cities: ["Ciudad Valles", "Matehuala", "Rioverde", "San Luis Potosí", "Soledad de Graciano Sánchez", "Tamazunchale"]
      },
      {
        name: "Sinaloa",
        cities: ["Culiacán", "Guasave", "Los Mochis", "Mazatlán", "Navolato"]
      },
      {
        name: "Sonora",
        cities: ["Agua Prieta", "Caborca", "Ciudad Obregón", "Guaymas", "Hermosillo", "Navojoa", "Nogales", "San Luis Río Colorado"]
      },
      {
        name: "Tabasco",
        cities: ["Cárdenas", "Comalcalco", "Cunduacán", "Macuspana", "Villahermosa"]
      },
      {
        name: "Tamaulipas",
        cities: ["Altamira", "Ciudad Madero", "Ciudad Mante", "Ciudad Victoria", "Matamoros", "Nuevo Laredo", "Reynosa", "Río Bravo", "Tampico"]
      },
      {
        name: "Tlaxcala",
        cities: ["Apizaco", "Chiautempan", "Huamantla", "San Pablo del Monte", "Tlaxcala"]
      },
      {
        name: "Veracruz",
        cities: ["Acayucan", "Coatzacoalcos", "Córdoba", "Martínez de la Torre", "Minatitlán", "Orizaba", "Papantla", "Poza Rica", "San Andrés Tuxtla", "Tuxpan", "Veracruz", "Xalapa"]
      },
      {
        name: "Yucatán",
        cities: ["Kanasín", "Mérida", "Progreso", "Tizimín", "Umán", "Valladolid"]
      },
      {
        name: "Zacatecas",
        cities: ["Fresnillo", "Guadalupe", "Jerez", "Río Grande", "Zacatecas"]
      }
    ]
  },
  US: {
    states: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego"] },
      { name: "Texas", cities: ["Houston", "Austin", "Dallas"] },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Albany"] }
    ]
  },
  AR: {
    states: [
      { name: "Buenos Aires", cities: ["La Plata", "Mar del Plata", "Bahía Blanca"] },
      { name: "Córdoba", cities: ["Córdoba", "Villa Carlos Paz", "Río Cuarto"] },
      { name: "Santa Fe", cities: ["Rosario", "Santa Fe", "Rafaela"] },
      { name: "Mendoza", cities: ["Mendoza", "San Rafael", "Godoy Cruz"] }
    ]
  },
  CO: {
    states: [
      { name: "Antioquia", cities: ["Medellín", "Bello", "Itagüí"] },
      { name: "Cundinamarca", cities: ["Bogotá", "Soacha", "Zipaquirá"] },
      { name: "Valle del Cauca", cities: ["Cali", "Palmira", "Buenaventura"] },
      { name: "Atlántico", cities: ["Barranquilla", "Soledad", "Malambo"] }
    ]
  },
  ES: {
    states: [
      { name: "Madrid", cities: ["Madrid", "Móstoles", "Alcalá de Henares"] },
      { name: "Cataluña", cities: ["Barcelona", "L'Hospitalet", "Badalona"] },
      { name: "Andalucía", cities: ["Sevilla", "Málaga", "Granada"] },
      { name: "Valencia", cities: ["Valencia", "Alicante", "Elche"] }
    ]
  }
};
