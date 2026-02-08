export const BUSINESS_TYPES = [
  { value: 'general', label: 'General Services', emoji: '📋' },
  { value: 'home_services', label: 'Home Services', emoji: '🏠' },
  { value: 'construction', label: 'Construction', emoji: '🏗️' },
  { value: 'hvac', label: 'HVAC', emoji: '❄️' },
    { value: 'electrical', label: 'Electrical', emoji: '⚡' }, 
  { value: 'plumbing', label: 'Plumbing', emoji: '🔧' },    
  { value: 'auto_services', label: 'Auto Services', emoji: '🚗' },
  { value: 'beauty_services', label: 'Beauty Services', emoji: '💇' },
  { value: 'pet_services', label: 'Pet Services', emoji: '🐕' },
  { value: 'video_production', label: 'Video Production', emoji: '🎥' },
  { value: 'legal_services', label: 'Legal Services', emoji: '⚖️' },
  { value: 'medical_services', label: 'Medical Services', emoji: '🏥' },
  { value: 'fitness_services', label: 'Fitness & Wellness', emoji: '💪' },
  { value: 'cleaning_services', label: 'Cleaning Services', emoji: '🧹' },
  { value: 'event_services', label: 'Event Services', emoji: '🎉' },
  { value: 'tech_services', label: 'Tech Services', emoji: '💻' },
  { value: 'real_estate', label: 'Real Estate', emoji: '🏘️' },
  { value: 'education_services', label: 'Education & Tutoring', emoji: '📚' },
  { value: 'food_services', label: 'Food Services', emoji: '🍽️' },
];

export const DEFAULT_STATUSES = [
  { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
  { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
  { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
  { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
];

export const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];


export type Category = {
  value: string;
  label: string;
  emoji: string;
};

// Address configuration by business type (defaults)
export const ADDRESS_CONFIG: Record<string, { show: boolean; required: boolean }> = {
  // REQUIRED - On-site work
  hvac: { show: true, required: true },
  home_services: { show: true, required: true },
  construction: { show: true, required: true },
  cleaning_services: { show: true, required: true },
  real_estate: { show: true, required: true },
  electrical: { show: true, required: true }, 
  plumbing: { show: true, required: true },  
  
  // OPTIONAL - Sometimes on-site
  auto_services: { show: true, required: false },
  beauty_services: { show: true, required: false },
  pet_services: { show: true, required: false },
  event_services: { show: true, required: false },
  fitness_services: { show: true, required: false },
  food_services: { show: true, required: false },
  
  // HIDDEN - Remote/office-based
  video_production: { show: false, required: false },
  legal_services: { show: false, required: false },
  medical_services: { show: false, required: false },
  tech_services: { show: false, required: false },
  education_services: { show: false, required: false },
  general: { show: false, required: false },
  admin: { show: false, required: false },
};

// DEFAULT CATEGORIES BY BUSINESS TYPE (Fallback if company hasn't customized)
export const CATEGORY_MAP: Record<string, Category[]> = {
  hvac: [
    { value: 'ac_repair', label: 'AC Repair', emoji: '❄️' },
    { value: 'ac_installation', label: 'AC Installation', emoji: '🆕' },
    { value: 'furnace_repair', label: 'Furnace Repair', emoji: '🔥' },
    { value: 'furnace_installation', label: 'Furnace Installation', emoji: '🏠' },
    { value: 'heat_pump', label: 'Heat Pump Service', emoji: '♨️' },
    { value: 'ductwork', label: 'Ductwork/Vents', emoji: '🌬️' },
    { value: 'maintenance', label: 'Maintenance/Tune-up', emoji: '🔧' },
    { value: 'emergency', label: 'Emergency Service', emoji: '🚨' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  electrical: [
    { value: 'wiring', label: 'Wiring', emoji: '⚡' },
    { value: 'panel_upgrade', label: 'Panel Upgrade', emoji: '📊' },
    { value: 'outlets', label: 'Outlets/Switches', emoji: '🔌' },
    { value: 'lighting', label: 'Lighting Installation', emoji: '💡' },
    { value: 'ceiling_fan', label: 'Ceiling Fan', emoji: '🌀' },
    { value: 'generator', label: 'Generator', emoji: '⚡' },
    { value: 'troubleshooting', label: 'Troubleshooting', emoji: '🔍' },
    { value: 'emergency', label: 'Emergency Service', emoji: '🚨' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  plumbing: [
    { value: 'leak_repair', label: 'Leak Repair', emoji: '💧' },
    { value: 'drain_cleaning', label: 'Drain Cleaning', emoji: '🚰' },
    { value: 'water_heater', label: 'Water Heater', emoji: '🔥' },
    { value: 'toilet_repair', label: 'Toilet Repair', emoji: '🚽' },
    { value: 'faucet', label: 'Faucet Installation', emoji: '🚿' },
    { value: 'pipe_repair', label: 'Pipe Repair', emoji: '🔧' },
    { value: 'sump_pump', label: 'Sump Pump', emoji: '💦' },
    { value: 'emergency', label: 'Emergency Service', emoji: '🚨' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  home_services: [
    { value: 'roofing', label: 'Roofing', emoji: '🏠' },
    { value: 'plumbing', label: 'Plumbing', emoji: '🔧' },
    { value: 'hvac', label: 'HVAC', emoji: '❄️' },
    { value: 'electrical', label: 'Electrical', emoji: '⚡' },
    { value: 'painting', label: 'Painting', emoji: '🎨' },
    { value: 'flooring', label: 'Flooring', emoji: '🪵' },
    { value: 'landscaping', label: 'Landscaping', emoji: '🌳' },
    { value: 'cleaning', label: 'Cleaning', emoji: '🧹' },
    { value: 'pest_control', label: 'Pest Control', emoji: '🐜' },
    { value: 'window_washing', label: 'Window Washing', emoji: '🪟' },
    { value: 'gutter_cleaning', label: 'Gutter Cleaning', emoji: '🌧️' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  construction: [
    { value: 'new_build', label: 'New Construction', emoji: '🏗️' },
    { value: 'renovation', label: 'Renovation', emoji: '🔨' },
    { value: 'addition', label: 'Addition/Extension', emoji: '📐' },
    { value: 'demolition', label: 'Demolition', emoji: '💥' },
    { value: 'foundation', label: 'Foundation Work', emoji: '🧱' },
    { value: 'framing', label: 'Framing', emoji: '🪚' },
    { value: 'drywall', label: 'Drywall', emoji: '🔲' },
    { value: 'siding', label: 'Siding', emoji: '🏘️' },
    { value: 'deck_patio', label: 'Deck/Patio', emoji: '🪵' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  auto_services: [
    { value: 'oil_change', label: 'Oil Change', emoji: '🛢️' },
    { value: 'brake_repair', label: 'Brake Repair', emoji: '🛑' },
    { value: 'body_work', label: 'Body Work', emoji: '🚗' },
    { value: 'detailing', label: 'Detailing', emoji: '✨' },
    { value: 'tire_service', label: 'Tire Service', emoji: '⚫' },
    { value: 'engine_repair', label: 'Engine Repair', emoji: '⚙️' },
    { value: 'inspection', label: 'Inspection', emoji: '🔍' },
    { value: 'transmission', label: 'Transmission', emoji: '⚙️' },
    { value: 'ac_repair', label: 'AC Repair', emoji: '❄️' },
    { value: 'alignment', label: 'Wheel Alignment', emoji: '🎯' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  beauty_services: [
    { value: 'haircut', label: 'Haircut', emoji: '✂️' },
    { value: 'hair_color', label: 'Hair Color', emoji: '🎨' },
    { value: 'styling', label: 'Styling', emoji: '💇' },
    { value: 'extensions', label: 'Extensions', emoji: '💁' },
    { value: 'nails', label: 'Nails', emoji: '💅' },
    { value: 'facial', label: 'Facial', emoji: '✨' },
    { value: 'massage', label: 'Massage', emoji: '💆' },
    { value: 'waxing', label: 'Waxing', emoji: '🪒' },
    { value: 'makeup', label: 'Makeup', emoji: '💄' },
    { value: 'lashes', label: 'Lashes/Brows', emoji: '👁️' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  pet_services: [
    { value: 'grooming', label: 'Grooming', emoji: '🐕' },
    { value: 'bathing', label: 'Bathing', emoji: '🛁' },
    { value: 'nail_trim', label: 'Nail Trim', emoji: '✂️' },
    { value: 'training', label: 'Training', emoji: '🎓' },
    { value: 'sitting', label: 'Pet Sitting', emoji: '🏠' },
    { value: 'walking', label: 'Dog Walking', emoji: '🚶' },
    { value: 'boarding', label: 'Boarding', emoji: '🏨' },
    { value: 'daycare', label: 'Daycare', emoji: '☀️' },
    { value: 'vet', label: 'Veterinary', emoji: '🏥' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  video_production: [
    { value: 'commercial', label: 'Commercial', emoji: '📺' },
    { value: 'wedding', label: 'Wedding Video', emoji: '💒' },
    { value: 'event', label: 'Event Coverage', emoji: '🎉' },
    { value: 'corporate', label: 'Corporate Video', emoji: '🏢' },
    { value: 'real_estate', label: 'Real Estate Tour', emoji: '🏠' },
    { value: 'editing', label: 'Video Editing', emoji: '✂️' },
    { value: 'drone', label: 'Drone Footage', emoji: '🚁' },
    { value: 'photography', label: 'Photography', emoji: '📸' },
    { value: 'animation', label: 'Animation', emoji: '🎬' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],

  legal_services: [
    { value: 'consultation', label: 'Consultation', emoji: '⚖️' },
    { value: 'contract_review', label: 'Contract Review', emoji: '📄' },
    { value: 'business_formation', label: 'Business Formation', emoji: '🏢' },
    { value: 'estate_planning', label: 'Estate Planning', emoji: '📋' },
    { value: 'family_law', label: 'Family Law', emoji: '👨‍👩‍👧' },
    { value: 'real_estate_law', label: 'Real Estate Law', emoji: '🏠' },
    { value: 'personal_injury', label: 'Personal Injury', emoji: '🩹' },
    { value: 'other', label: 'Other', emoji: '⚖️' },
  ],

  medical_services: [
    { value: 'checkup', label: 'General Checkup', emoji: '🩺' },
    { value: 'dental', label: 'Dental', emoji: '🦷' },
    { value: 'physical_therapy', label: 'Physical Therapy', emoji: '🏋️' },
    { value: 'chiropractic', label: 'Chiropractic', emoji: '💆' },
    { value: 'mental_health', label: 'Mental Health', emoji: '🧠' },
    { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
    { value: 'acupuncture', label: 'Acupuncture', emoji: '💉' },
    { value: 'other', label: 'Other', emoji: '🏥' },
  ],

  fitness_services: [
    { value: 'personal_training', label: 'Personal Training', emoji: '💪' },
    { value: 'yoga', label: 'Yoga Class', emoji: '🧘' },
    { value: 'pilates', label: 'Pilates', emoji: '🤸' },
    { value: 'crossfit', label: 'CrossFit', emoji: '🏋️' },
    { value: 'boxing', label: 'Boxing', emoji: '🥊' },
    { value: 'dance', label: 'Dance Class', emoji: '💃' },
    { value: 'nutrition_coaching', label: 'Nutrition Coaching', emoji: '🥗' },
    { value: 'other', label: 'Other', emoji: '🏃' },
  ],

  cleaning_services: [
    { value: 'house_cleaning', label: 'House Cleaning', emoji: '🏠' },
    { value: 'deep_cleaning', label: 'Deep Cleaning', emoji: '🧹' },
    { value: 'carpet_cleaning', label: 'Carpet Cleaning', emoji: '🧽' },
    { value: 'window_cleaning', label: 'Window Cleaning', emoji: '🪟' },
    { value: 'move_in_out', label: 'Move In/Out', emoji: '📦' },
    { value: 'office_cleaning', label: 'Office Cleaning', emoji: '🏢' },
    { value: 'pressure_washing', label: 'Pressure Washing', emoji: '💦' },
    { value: 'other', label: 'Other', emoji: '🧹' },
  ],

  event_services: [
    { value: 'wedding', label: 'Wedding', emoji: '💒' },
    { value: 'birthday', label: 'Birthday Party', emoji: '🎂' },
    { value: 'corporate_event', label: 'Corporate Event', emoji: '🏢' },
    { value: 'catering', label: 'Catering', emoji: '🍽️' },
    { value: 'dj', label: 'DJ Services', emoji: '🎧' },
    { value: 'photography', label: 'Photography', emoji: '📸' },
    { value: 'decoration', label: 'Decoration', emoji: '🎈' },
    { value: 'venue', label: 'Venue Rental', emoji: '🏛️' },
    { value: 'other', label: 'Other', emoji: '🎉' },
  ],

  tech_services: [
    { value: 'computer_repair', label: 'Computer Repair', emoji: '💻' },
    { value: 'phone_repair', label: 'Phone Repair', emoji: '📱' },
    { value: 'web_design', label: 'Web Design', emoji: '🌐' },
    { value: 'app_development', label: 'App Development', emoji: '📲' },
    { value: 'it_support', label: 'IT Support', emoji: '🖥️' },
    { value: 'data_recovery', label: 'Data Recovery', emoji: '💾' },
    { value: 'security', label: 'Cybersecurity', emoji: '🔒' },
    { value: 'other', label: 'Other', emoji: '⚙️' },
  ],

  real_estate: [
    { value: 'buying', label: 'Buying Property', emoji: '🏠' },
    { value: 'selling', label: 'Selling Property', emoji: '💰' },
    { value: 'renting', label: 'Renting', emoji: '🔑' },
    { value: 'property_management', label: 'Property Management', emoji: '🏢' },
    { value: 'appraisal', label: 'Property Appraisal', emoji: '📊' },
    { value: 'inspection', label: 'Home Inspection', emoji: '🔍' },
    { value: 'staging', label: 'Home Staging', emoji: '🛋️' },
    { value: 'other', label: 'Other', emoji: '🏘️' },
  ],

  education_services: [
    { value: 'tutoring', label: 'Tutoring', emoji: '📚' },
    { value: 'music_lessons', label: 'Music Lessons', emoji: '🎵' },
    { value: 'art_lessons', label: 'Art Lessons', emoji: '🎨' },
    { value: 'language', label: 'Language Lessons', emoji: '🗣️' },
    { value: 'test_prep', label: 'Test Prep', emoji: '✍️' },
    { value: 'coaching', label: 'Life Coaching', emoji: '🎯' },
    { value: 'consulting', label: 'Business Consulting', emoji: '💼' },
    { value: 'other', label: 'Other', emoji: '🎓' },
  ],

  food_services: [
    { value: 'catering', label: 'Catering', emoji: '🍽️' },
    { value: 'meal_prep', label: 'Meal Prep', emoji: '🥗' },
    { value: 'private_chef', label: 'Private Chef', emoji: '👨‍🍳' },
    { value: 'baking', label: 'Custom Baking', emoji: '🎂' },
    { value: 'bartending', label: 'Bartending', emoji: '🍹' },
    { value: 'food_truck', label: 'Food Truck', emoji: '🚚' },
    { value: 'delivery', label: 'Delivery Service', emoji: '🛵' },
    { value: 'other', label: 'Other', emoji: '🍴' },
  ],

  general: [
    { value: 'roofing', label: 'Roofing', emoji: '🏠' },
    { value: 'kitchen_remodel', label: 'Kitchen Remodel', emoji: '🍳' },
    { value: 'bathroom_remodel', label: 'Bathroom Remodel', emoji: '🚿' },
    { value: 'plumbing', label: 'Plumbing', emoji: '🔧' },
    { value: 'electrical', label: 'Electrical', emoji: '⚡' },
    { value: 'hvac', label: 'HVAC', emoji: '❄️' },
    { value: 'flooring', label: 'Flooring', emoji: '🪵' },
    { value: 'painting', label: 'Painting', emoji: '🎨' },
    { value: 'landscaping', label: 'Landscaping', emoji: '🌳' },
    { value: 'foundation_repair', label: 'Foundation Repair', emoji: '🧱' },
    { value: 'water_damage', label: 'Water Damage', emoji: '💧' },
    { value: 'general_repair', label: 'General Repair', emoji: '🔨' },
    { value: 'auto_body', label: 'Auto Body', emoji: '🚗' },
    { value: 'auto_mechanical', label: 'Auto Mechanical', emoji: '⚙️' },
    { value: 'other', label: 'Other', emoji: '📋' },
  ],
};


export type StatusOption = {
  value: string;
  label: string;
  color: string;
  emoji: string;
};