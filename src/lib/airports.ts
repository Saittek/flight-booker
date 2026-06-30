export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region:
    | "North America"
    | "Central America & Caribbean"
    | "South America"
    | "Europe"
    | "Africa"
    | "Middle East"
    | "Asia"
    | "Oceania";
}

export const AIRPORTS: Airport[] = [
  // ── North America — United States ──
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", region: "North America" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", region: "North America" },
  { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", region: "North America" },
  { code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States", region: "North America" },
  { code: "DEN", name: "Denver International Airport", city: "Denver", country: "United States", region: "North America" },
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", region: "North America" },
  { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", region: "North America" },
  { code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", region: "North America" },
  { code: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States", region: "North America" },
  { code: "MCO", name: "Orlando International Airport", city: "Orlando", country: "United States", region: "North America" },
  { code: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "United States", region: "North America" },
  { code: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States", region: "North America" },
  { code: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", region: "North America" },
  { code: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", region: "North America" },
  { code: "MIA", name: "Miami International Airport", city: "Miami", country: "United States", region: "North America" },
  { code: "BOS", name: "Logan International Airport", city: "Boston", country: "United States", region: "North America" },
  { code: "MSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", country: "United States", region: "North America" },
  { code: "FLL", name: "Fort Lauderdale-Hollywood International Airport", city: "Fort Lauderdale", country: "United States", region: "North America" },
  { code: "DTW", name: "Detroit Metropolitan Airport", city: "Detroit", country: "United States", region: "North America" },
  { code: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States", region: "North America" },
  { code: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States", region: "North America" },
  { code: "BWI", name: "Baltimore/Washington International Airport", city: "Baltimore", country: "United States", region: "North America" },
  { code: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States", region: "North America" },
  { code: "SAN", name: "San Diego International Airport", city: "San Diego", country: "United States", region: "North America" },
  { code: "DCA", name: "Ronald Reagan Washington National Airport", city: "Washington, D.C.", country: "United States", region: "North America" },
  { code: "IAD", name: "Washington Dulles International Airport", city: "Washington, D.C.", country: "United States", region: "North America" },
  { code: "TPA", name: "Tampa International Airport", city: "Tampa", country: "United States", region: "North America" },
  { code: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "United States", region: "North America" },
  { code: "PDX", name: "Portland International Airport", city: "Portland", country: "United States", region: "North America" },
  { code: "STL", name: "St. Louis Lambert International Airport", city: "St. Louis", country: "United States", region: "North America" },
  { code: "BNA", name: "Nashville International Airport", city: "Nashville", country: "United States", region: "North America" },
  { code: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States", region: "North America" },
  { code: "MCI", name: "Kansas City International Airport", city: "Kansas City", country: "United States", region: "North America" },
  { code: "RDU", name: "Raleigh-Durham International Airport", city: "Raleigh", country: "United States", region: "North America" },
  { code: "SMF", name: "Sacramento International Airport", city: "Sacramento", country: "United States", region: "North America" },
  { code: "SJC", name: "Norman Y. Mineta San José International Airport", city: "San Jose", country: "United States", region: "North America" },
  { code: "OAK", name: "Oakland International Airport", city: "Oakland", country: "United States", region: "North America" },
  { code: "CLE", name: "Cleveland Hopkins International Airport", city: "Cleveland", country: "United States", region: "North America" },
  { code: "PIT", name: "Pittsburgh International Airport", city: "Pittsburgh", country: "United States", region: "North America" },
  { code: "IND", name: "Indianapolis International Airport", city: "Indianapolis", country: "United States", region: "North America" },
  { code: "CVG", name: "Cincinnati/Northern Kentucky International Airport", city: "Cincinnati", country: "United States", region: "North America" },
  { code: "CMH", name: "John Glenn Columbus International Airport", city: "Columbus", country: "United States", region: "North America" },
  { code: "MKE", name: "Milwaukee Mitchell International Airport", city: "Milwaukee", country: "United States", region: "North America" },
  { code: "RSW", name: "Southwest Florida International Airport", city: "Fort Myers", country: "United States", region: "North America" },
  { code: "PBI", name: "Palm Beach International Airport", city: "West Palm Beach", country: "United States", region: "North America" },
  { code: "JAX", name: "Jacksonville International Airport", city: "Jacksonville", country: "United States", region: "North America" },
  { code: "MSY", name: "Louis Armstrong New Orleans International Airport", city: "New Orleans", country: "United States", region: "North America" },
  { code: "SAT", name: "San Antonio International Airport", city: "San Antonio", country: "United States", region: "North America" },
  { code: "ABQ", name: "Albuquerque International Sunport", city: "Albuquerque", country: "United States", region: "North America" },
  { code: "OGG", name: "Kahului Airport", city: "Maui", country: "United States", region: "North America" },
  { code: "ANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", country: "United States", region: "North America" },

  // ── North America — Canada ──
  { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", region: "North America" },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", region: "North America" },
  { code: "YUL", name: "Montréal-Trudeau International Airport", city: "Montreal", country: "Canada", region: "North America" },
  { code: "YYC", name: "Calgary International Airport", city: "Calgary", country: "Canada", region: "North America" },
  { code: "YOW", name: "Ottawa Macdonald-Cartier International Airport", city: "Ottawa", country: "Canada", region: "North America" },
  { code: "YEG", name: "Edmonton International Airport", city: "Edmonton", country: "Canada", region: "North America" },
  { code: "YWG", name: "Winnipeg James Armstrong Richardson International Airport", city: "Winnipeg", country: "Canada", region: "North America" },
  { code: "YHZ", name: "Halifax Stanfield International Airport", city: "Halifax", country: "Canada", region: "North America" },
  { code: "YQB", name: "Québec City Jean Lesage International Airport", city: "Quebec City", country: "Canada", region: "North America" },
  { code: "YTZ", name: "Billy Bishop Toronto City Airport", city: "Toronto", country: "Canada", region: "North America" },
  { code: "YXX", name: "Abbotsford International Airport", city: "Abbotsford", country: "Canada", region: "North America" },
  { code: "YQR", name: "Regina International Airport", city: "Regina", country: "Canada", region: "North America" },
  { code: "YXE", name: "Saskatoon John G. Diefenbaker International Airport", city: "Saskatoon", country: "Canada", region: "North America" },
  { code: "YQT", name: "Thunder Bay International Airport", city: "Thunder Bay", country: "Canada", region: "North America" },
  { code: "YXY", name: "Erik Nielsen Whitehorse International Airport", city: "Whitehorse", country: "Canada", region: "North America" },

  // ── North America — Mexico ──
  { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", region: "North America" },
  { code: "CUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico", region: "North America" },
  { code: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico", region: "North America" },
  { code: "MTY", name: "Monterrey International Airport", city: "Monterrey", country: "Mexico", region: "North America" },
  { code: "TIJ", name: "Tijuana International Airport", city: "Tijuana", country: "Mexico", region: "North America" },
  { code: "PVR", name: "Puerto Vallarta International Airport", city: "Puerto Vallarta", country: "Mexico", region: "North America" },
  { code: "SJD", name: "Los Cabos International Airport", city: "San José del Cabo", country: "Mexico", region: "North America" },
  { code: "MID", name: "Mérida International Airport", city: "Mérida", country: "Mexico", region: "North America" },
  { code: "OAX", name: "Oaxaca International Airport", city: "Oaxaca", country: "Mexico", region: "North America" },
  { code: "HMO", name: "Hermosillo International Airport", city: "Hermosillo", country: "Mexico", region: "North America" },

  // ── Central America & Caribbean ──
  { code: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama", region: "Central America & Caribbean" },
  { code: "SJO", name: "Juan Santamaría International Airport", city: "San José", country: "Costa Rica", region: "Central America & Caribbean" },
  { code: "GUA", name: "La Aurora International Airport", city: "Guatemala City", country: "Guatemala", region: "Central America & Caribbean" },
  { code: "SAL", name: "El Salvador International Airport", city: "San Salvador", country: "El Salvador", region: "Central America & Caribbean" },
  { code: "TGU", name: "Toncontín International Airport", city: "Tegucigalpa", country: "Honduras", region: "Central America & Caribbean" },
  { code: "MGA", name: "Augusto C. Sandino International Airport", city: "Managua", country: "Nicaragua", region: "Central America & Caribbean" },
  { code: "BZE", name: "Philip S. W. Goldson International Airport", city: "Belize City", country: "Belize", region: "Central America & Caribbean" },
  { code: "HAV", name: "José Martí International Airport", city: "Havana", country: "Cuba", region: "Central America & Caribbean" },
  { code: "SDQ", name: "Las Américas International Airport", city: "Santo Domingo", country: "Dominican Republic", region: "Central America & Caribbean" },
  { code: "PUJ", name: "Punta Cana International Airport", city: "Punta Cana", country: "Dominican Republic", region: "Central America & Caribbean" },
  { code: "KIN", name: "Norman Manley International Airport", city: "Kingston", country: "Jamaica", region: "Central America & Caribbean" },
  { code: "MBJ", name: "Sangster International Airport", city: "Montego Bay", country: "Jamaica", region: "Central America & Caribbean" },
  { code: "NAS", name: "Lynden Pindling International Airport", city: "Nassau", country: "Bahamas", region: "Central America & Caribbean" },
  { code: "BGI", name: "Grantley Adams International Airport", city: "Bridgetown", country: "Barbados", region: "Central America & Caribbean" },
  { code: "POS", name: "Piarco International Airport", city: "Port of Spain", country: "Trinidad and Tobago", region: "Central America & Caribbean" },
  { code: "SXM", name: "Princess Juliana International Airport", city: "Sint Maarten", country: "Sint Maarten", region: "Central America & Caribbean" },
  { code: "AUA", name: "Queen Beatrix International Airport", city: "Oranjestad", country: "Aruba", region: "Central America & Caribbean" },
  { code: "CUR", name: "Curaçao International Airport", city: "Willemstad", country: "Curaçao", region: "Central America & Caribbean" },
  { code: "SJU", name: "Luis Muñoz Marín International Airport", city: "San Juan", country: "Puerto Rico", region: "Central America & Caribbean" },

  // ── South America ──
  { code: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", region: "South America" },
  { code: "GIG", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", region: "South America" },
  { code: "BSB", name: "Brasília International Airport", city: "Brasília", country: "Brazil", region: "South America" },
  { code: "CNF", name: "Belo Horizonte International Airport", city: "Belo Horizonte", country: "Brazil", region: "South America" },
  { code: "SSA", name: "Salvador International Airport", city: "Salvador", country: "Brazil", region: "South America" },
  { code: "REC", name: "Recife/Guararapes International Airport", city: "Recife", country: "Brazil", region: "South America" },
  { code: "FOR", name: "Fortaleza International Airport", city: "Fortaleza", country: "Brazil", region: "South America" },
  { code: "POA", name: "Salgado Filho International Airport", city: "Porto Alegre", country: "Brazil", region: "South America" },
  { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", region: "South America" },
  { code: "AEP", name: "Jorge Newbery Airfield", city: "Buenos Aires", country: "Argentina", region: "South America" },
  { code: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", region: "South America" },
  { code: "MDE", name: "José María Córdova International Airport", city: "Medellín", country: "Colombia", region: "South America" },
  { code: "CLO", name: "Alfonso Bonilla Aragón International Airport", city: "Cali", country: "Colombia", region: "South America" },
  { code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", region: "South America" },
  { code: "CUZ", name: "Alejandro Velasco Astete International Airport", city: "Cusco", country: "Peru", region: "South America" },
  { code: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", region: "South America" },
  { code: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador", region: "South America" },
  { code: "GYE", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador", region: "South America" },
  { code: "MVD", name: "Carrasco International Airport", city: "Montevideo", country: "Uruguay", region: "South America" },
  { code: "ASU", name: "Silvio Pettirossi International Airport", city: "Asunción", country: "Paraguay", region: "South America" },
  { code: "LPB", name: "El Alto International Airport", city: "La Paz", country: "Bolivia", region: "South America" },
  { code: "VVI", name: "Viru Viru International Airport", city: "Santa Cruz", country: "Bolivia", region: "South America" },
  { code: "CCS", name: "Simón Bolívar International Airport", city: "Caracas", country: "Venezuela", region: "South America" },

  // ── Europe — Western ──
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", region: "Europe" },
  { code: "LGW", name: "London Gatwick Airport", city: "London", country: "United Kingdom", region: "Europe" },
  { code: "STN", name: "London Stansted Airport", city: "London", country: "United Kingdom", region: "Europe" },
  { code: "LTN", name: "London Luton Airport", city: "London", country: "United Kingdom", region: "Europe" },
  { code: "LCY", name: "London City Airport", city: "London", country: "United Kingdom", region: "Europe" },
  { code: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom", region: "Europe" },
  { code: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", region: "Europe" },
  { code: "GLA", name: "Glasgow Airport", city: "Glasgow", country: "United Kingdom", region: "Europe" },
  { code: "BHX", name: "Birmingham Airport", city: "Birmingham", country: "United Kingdom", region: "Europe" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland", region: "Europe" },
  { code: "CDG", name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France", region: "Europe" },
  { code: "ORY", name: "Paris Orly Airport", city: "Paris", country: "France", region: "Europe" },
  { code: "NCE", name: "Nice Côte d'Azur Airport", city: "Nice", country: "France", region: "Europe" },
  { code: "LYS", name: "Lyon-Saint Exupéry Airport", city: "Lyon", country: "France", region: "Europe" },
  { code: "MRS", name: "Marseille Provence Airport", city: "Marseille", country: "France", region: "Europe" },
  { code: "TLS", name: "Toulouse-Blagnac Airport", city: "Toulouse", country: "France", region: "Europe" },
  { code: "AMS", name: "Amsterdam Schiphol Airport", city: "Amsterdam", country: "Netherlands", region: "Europe" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", region: "Europe" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", region: "Europe" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", region: "Europe" },
  { code: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", region: "Europe" },
  { code: "DUS", name: "Düsseldorf Airport", city: "Düsseldorf", country: "Germany", region: "Europe" },
  { code: "HAM", name: "Hamburg Airport", city: "Hamburg", country: "Germany", region: "Europe" },
  { code: "CGN", name: "Cologne Bonn Airport", city: "Cologne", country: "Germany", region: "Europe" },
  { code: "STR", name: "Stuttgart Airport", city: "Stuttgart", country: "Germany", region: "Europe" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", region: "Europe" },
  { code: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland", region: "Europe" },
  { code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", region: "Europe" },
  { code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain", region: "Europe" },
  { code: "BCN", name: "Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", region: "Europe" },
  { code: "PMI", name: "Palma de Mallorca Airport", city: "Palma", country: "Spain", region: "Europe" },
  { code: "AGP", name: "Málaga-Costa del Sol Airport", city: "Málaga", country: "Spain", region: "Europe" },
  { code: "LIS", name: "Lisbon Humberto Delgado Airport", city: "Lisbon", country: "Portugal", region: "Europe" },
  { code: "OPO", name: "Francisco Sá Carneiro Airport", city: "Porto", country: "Portugal", region: "Europe" },
  { code: "FCO", name: "Rome Fiumicino Airport", city: "Rome", country: "Italy", region: "Europe" },
  { code: "MXP", name: "Milan Malpensa Airport", city: "Milan", country: "Italy", region: "Europe" },
  { code: "LIN", name: "Milan Linate Airport", city: "Milan", country: "Italy", region: "Europe" },
  { code: "VCE", name: "Venice Marco Polo Airport", city: "Venice", country: "Italy", region: "Europe" },
  { code: "NAP", name: "Naples International Airport", city: "Naples", country: "Italy", region: "Europe" },
  { code: "FLR", name: "Florence Airport", city: "Florence", country: "Italy", region: "Europe" },

  // ── Europe — Northern & Eastern ──
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", region: "Europe" },
  { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", region: "Europe" },
  { code: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", country: "Norway", region: "Europe" },
  { code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", region: "Europe" },
  { code: "KEF", name: "Keflavík International Airport", city: "Reykjavík", country: "Iceland", region: "Europe" },
  { code: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", region: "Europe" },
  { code: "KRK", name: "Kraków John Paul II International Airport", city: "Kraków", country: "Poland", region: "Europe" },
  { code: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", region: "Europe" },
  { code: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", region: "Europe" },
  { code: "OTP", name: "Henri Coandă International Airport", city: "Bucharest", country: "Romania", region: "Europe" },
  { code: "SOF", name: "Sofia Airport", city: "Sofia", country: "Bulgaria", region: "Europe" },
  { code: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece", region: "Europe" },
  { code: "SKG", name: "Thessaloniki Airport", city: "Thessaloniki", country: "Greece", region: "Europe" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", region: "Europe" },
  { code: "SAW", name: "Istanbul Sabiha Gökçen Airport", city: "Istanbul", country: "Turkey", region: "Europe" },
  { code: "ZAG", name: "Zagreb Airport", city: "Zagreb", country: "Croatia", region: "Europe" },
  { code: "SPU", name: "Split Airport", city: "Split", country: "Croatia", region: "Europe" },
  { code: "DBV", name: "Dubrovnik Airport", city: "Dubrovnik", country: "Croatia", region: "Europe" },
  { code: "LJU", name: "Ljubljana Jože Pučnik Airport", city: "Ljubljana", country: "Slovenia", region: "Europe" },
  { code: "BEG", name: "Belgrade Nikola Tesla Airport", city: "Belgrade", country: "Serbia", region: "Europe" },
  { code: "TIA", name: "Tirana International Airport", city: "Tirana", country: "Albania", region: "Europe" },
  { code: "KBP", name: "Boryspil International Airport", city: "Kyiv", country: "Ukraine", region: "Europe" },
  { code: "SVO", name: "Sheremetyevo International Airport", city: "Moscow", country: "Russia", region: "Europe" },
  { code: "DME", name: "Domodedovo International Airport", city: "Moscow", country: "Russia", region: "Europe" },
  { code: "LED", name: "Pulkovo Airport", city: "Saint Petersburg", country: "Russia", region: "Europe" },

  // ── Africa ──
  { code: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", region: "Africa" },
  { code: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", region: "Africa" },
  { code: "DUR", name: "King Shaka International Airport", city: "Durban", country: "South Africa", region: "Africa" },
  { code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", region: "Africa" },
  { code: "CMN", name: "Mohammed V International Airport", city: "Casablanca", country: "Morocco", region: "Africa" },
  { code: "RAK", name: "Marrakech Menara Airport", city: "Marrakech", country: "Morocco", region: "Africa" },
  { code: "TUN", name: "Tunis-Carthage International Airport", city: "Tunis", country: "Tunisia", region: "Africa" },
  { code: "ALG", name: "Houari Boumediene Airport", city: "Algiers", country: "Algeria", region: "Africa" },
  { code: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", region: "Africa" },
  { code: "ADD", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", country: "Ethiopia", region: "Africa" },
  { code: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", country: "Nigeria", region: "Africa" },
  { code: "ABV", name: "Nnamdi Azikiwe International Airport", city: "Abuja", country: "Nigeria", region: "Africa" },
  { code: "ACC", name: "Kotoka International Airport", city: "Accra", country: "Ghana", region: "Africa" },
  { code: "DAR", name: "Julius Nyerere International Airport", city: "Dar es Salaam", country: "Tanzania", region: "Africa" },
  { code: "EBB", name: "Entebbe International Airport", city: "Entebbe", country: "Uganda", region: "Africa" },
  { code: "KGL", name: "Kigali International Airport", city: "Kigali", country: "Rwanda", region: "Africa" },
  { code: "MRU", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Mauritius", country: "Mauritius", region: "Africa" },
  { code: "TNR", name: "Ivato International Airport", city: "Antananarivo", country: "Madagascar", region: "Africa" },
  { code: "DKR", name: "Blaise Diagne International Airport", city: "Dakar", country: "Senegal", region: "Africa" },
  { code: "LAD", name: "Quatro de Fevereiro Airport", city: "Luanda", country: "Angola", region: "Africa" },
  { code: "FIH", name: "N'djili Airport", city: "Kinshasa", country: "DR Congo", region: "Africa" },
  { code: "HRE", name: "Robert Gabriel Mugabe International Airport", city: "Harare", country: "Zimbabwe", region: "Africa" },
  { code: "LUN", name: "Kenneth Kaunda International Airport", city: "Lusaka", country: "Zambia", region: "Africa" },
  { code: "WDH", name: "Hosea Kutako International Airport", city: "Windhoek", country: "Namibia", region: "Africa" },

  // ── Middle East ──
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", region: "Middle East" },
  { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "United Arab Emirates", region: "Middle East" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", region: "Middle East" },
  { code: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", region: "Middle East" },
  { code: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", region: "Middle East" },
  { code: "KWI", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait", region: "Middle East" },
  { code: "BAH", name: "Bahrain International Airport", city: "Manama", country: "Bahrain", region: "Middle East" },
  { code: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman", region: "Middle East" },
  { code: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", region: "Middle East" },
  { code: "AMM", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", region: "Middle East" },
  { code: "BEY", name: "Beirut-Rafic Hariri International Airport", city: "Beirut", country: "Lebanon", region: "Middle East" },
  { code: "BGW", name: "Baghdad International Airport", city: "Baghdad", country: "Iraq", region: "Middle East" },
  { code: "IKA", name: "Imam Khomeini International Airport", city: "Tehran", country: "Iran", region: "Middle East" },

  // ── Asia — East & Southeast ──
  { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", region: "Asia" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", region: "Asia" },
  { code: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan", region: "Asia" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", region: "Asia" },
  { code: "GMP", name: "Gimpo International Airport", city: "Seoul", country: "South Korea", region: "Asia" },
  { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", region: "Asia" },
  { code: "PKX", name: "Beijing Daxing International Airport", city: "Beijing", country: "China", region: "Asia" },
  { code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", region: "Asia" },
  { code: "SHA", name: "Shanghai Hongqiao International Airport", city: "Shanghai", country: "China", region: "Asia" },
  { code: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", country: "China", region: "Asia" },
  { code: "SZX", name: "Shenzhen Bao'an International Airport", city: "Shenzhen", country: "China", region: "Asia" },
  { code: "CTU", name: "Chengdu Tianfu International Airport", city: "Chengdu", country: "China", region: "Asia" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", region: "Asia" },
  { code: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", region: "Asia" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", region: "Asia" },
  { code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", region: "Asia" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", region: "Asia" },
  { code: "DMK", name: "Don Mueang International Airport", city: "Bangkok", country: "Thailand", region: "Asia" },
  { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", region: "Asia" },
  { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", region: "Asia" },
  { code: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", region: "Asia" },
  { code: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", region: "Asia" },
  { code: "DPS", name: "Ngurah Rai International Airport", city: "Bali", country: "Indonesia", region: "Asia" },
  { code: "SUB", name: "Juanda International Airport", city: "Surabaya", country: "Indonesia", region: "Asia" },
  { code: "PNH", name: "Phnom Penh International Airport", city: "Phnom Penh", country: "Cambodia", region: "Asia" },
  { code: "RGN", name: "Yangon International Airport", city: "Yangon", country: "Myanmar", region: "Asia" },
  { code: "VTE", name: "Wattay International Airport", city: "Vientiane", country: "Laos", region: "Asia" },

  // ── Asia — South & Central ──
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", region: "Asia" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", region: "Asia" },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India", region: "Asia" },
  { code: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India", region: "Asia" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "India", region: "Asia" },
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", region: "Asia" },
  { code: "COK", name: "Cochin International Airport", city: "Kochi", country: "India", region: "Asia" },
  { code: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal", region: "Asia" },
  { code: "CMB", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka", region: "Asia" },
  { code: "DAC", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh", region: "Asia" },
  { code: "KHI", name: "Jinnah International Airport", city: "Karachi", country: "Pakistan", region: "Asia" },
  { code: "LHE", name: "Allama Iqbal International Airport", city: "Lahore", country: "Pakistan", region: "Asia" },
  { code: "ISB", name: "Islamabad International Airport", city: "Islamabad", country: "Pakistan", region: "Asia" },
  { code: "TAS", name: "Tashkent International Airport", city: "Tashkent", country: "Uzbekistan", region: "Asia" },
  { code: "ALA", name: "Almaty International Airport", city: "Almaty", country: "Kazakhstan", region: "Asia" },
  { code: "ULN", name: "Chinggis Khaan International Airport", city: "Ulaanbaatar", country: "Mongolia", region: "Asia" },

  // ── Oceania ──
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", region: "Oceania" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", region: "Oceania" },
  { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", region: "Oceania" },
  { code: "PER", name: "Perth Airport", city: "Perth", country: "Australia", region: "Oceania" },
  { code: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", region: "Oceania" },
  { code: "CBR", name: "Canberra Airport", city: "Canberra", country: "Australia", region: "Oceania" },
  { code: "OOL", name: "Gold Coast Airport", city: "Gold Coast", country: "Australia", region: "Oceania" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", region: "Oceania" },
  { code: "WLG", name: "Wellington Airport", city: "Wellington", country: "New Zealand", region: "Oceania" },
  { code: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", region: "Oceania" },
  { code: "NAN", name: "Nadi International Airport", city: "Nadi", country: "Fiji", region: "Oceania" },
  { code: "PPT", name: "Faa'a International Airport", city: "Papeete", country: "French Polynesia", region: "Oceania" },
  { code: "APW", name: "Faleolo International Airport", city: "Apia", country: "Samoa", region: "Oceania" },
  { code: "POM", name: "Jacksons International Airport", city: "Port Moresby", country: "Papua New Guinea", region: "Oceania" },
];

const byCode = new Map<string, Airport>();
for (const airport of AIRPORTS) {
  byCode.set(airport.code, airport);
}

export function getAirportByCode(code: string): Airport | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function formatAirportLabel(airport: Airport): string {
  return `${airport.code} — ${airport.name}`;
}

export function formatAirportShort(airport: Airport): string {
  return `${airport.city} · ${airport.country}`;
}

function scoreAirport(airport: Airport, q: string, qu: string): number {
  const code = airport.code;
  const city = airport.city.toLowerCase();
  const name = airport.name.toLowerCase();
  const country = airport.country.toLowerCase();

  if (code === qu) return 100;
  if (code.startsWith(qu)) return 90;
  if (city === q || city.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (country.startsWith(q)) return 40;
  if (city.includes(q)) return 50;
  return 0;
}

export function searchAirports(query: string, limit = 12): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return AIRPORTS.slice(0, limit);

  const qu = q.toUpperCase();

  return AIRPORTS.map((airport) => ({
    airport,
    score: scoreAirport(airport, q, qu),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, limit)
    .map(({ airport }) => airport);
}

export function resolveAirportInput(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return "";

  const exact = getAirportByCode(trimmed);
  if (exact) return exact.code;

  const matches = searchAirports(trimmed, 1);
  if (matches.length === 1 && matches[0].code.startsWith(trimmed)) {
    return matches[0].code;
  }

  return trimmed.slice(0, 3);
}
