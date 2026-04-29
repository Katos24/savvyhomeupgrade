// app/contractor-software/[city]/[service]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';

// ─── MASSIVE CITY + SERVICE LIST FOR SEO ───
export async function generateStaticParams() {
  const cities = [
    // New York - NYC
    'new-york', 'brooklyn', 'queens', 'bronx', 'manhattan', 'staten-island',
    // New York - Long Island
    'long-island', 'hempstead', 'babylon', 'islip', 'huntington', 'smithtown',
    'brookhaven', 'freeport', 'valley-stream', 'levittown', 'massapequa',
    'commack', 'bay-shore', 'centereach', 'coram', 'west-babylon', 'deer-park',
    'lindenhurst', 'east-meadow', 'franklin-square', 'north-babylon', 'elmont',
    'uniondale', 'oceanside', 'garden-city', 'mineola', 'great-neck',
    'port-washington', 'manhasset', 'rockville-centre', 'lake-ronkonkoma',
    'patchogue', 'medford', 'central-islip', 'brentwood', 'ronkonkoma',
    'holbrook', 'bohemia', 'sayville', 'east-islip', 'west-islip', 'hauppauge',
    'lake-grove', 'selden', 'port-jefferson', 'stony-brook', 'setauket',
    'miller-place', 'mount-sinai', 'ridge', 'shirley', 'mastic', 'moriches',
    'riverhead', 'southampton', 'hampton-bays', 'east-hampton', 'montauk',
    'greenport', 'mattituck', 'southold', 'shelter-island',
    // New York - Westchester / Hudson Valley
    'westchester', 'yonkers', 'white-plains', 'new-rochelle', 'mount-vernon',
    'scarsdale', 'tarrytown', 'ossining', 'peekskill', 'mamaroneck',
    'larchmont', 'rye', 'port-chester', 'harrison', 'bronxville',
    'tuckahoe', 'eastchester', 'dobbs-ferry', 'hastings-on-hudson',
    'irvington', 'ardsley', 'elmsford', 'pleasantville', 'chappaqua',
    'bedford', 'katonah', 'somers', 'yorktown-heights', 'cortlandt-manor',
    'croton-on-hudson', 'cold-spring', 'beacon', 'newburgh', 'middletown',
    'monroe', 'warwick', 'goshen', 'cornwall', 'west-point',
    'poughkeepsie', 'wappingers-falls', 'fishkill', 'hyde-park',
    'rhinebeck', 'kingston', 'saugerties', 'woodstock', 'new-paltz',
    // New York - Upstate
    'albany', 'troy', 'schenectady', 'saratoga-springs', 'glens-falls',
    'lake-george', 'plattsburgh', 'syracuse', 'utica', 'rome',
    'oneida', 'auburn', 'cortland', 'oswego', 'watertown',
    'rochester', 'buffalo', 'niagara-falls', 'tonawanda', 'cheektowaga',
    'amherst', 'williamsville', 'orchard-park', 'hamburg', 'lackawanna',
    'batavia', 'canandaigua', 'geneva', 'ithaca', 'elmira', 'corning',
    'binghamton', 'johnson-city', 'endicott', 'owego', 'oneonta',
    // New Jersey
    'newark', 'jersey-city', 'hoboken', 'paterson', 'elizabeth',
    'clifton', 'trenton', 'camden', 'passaic', 'union-city',
    'bayonne', 'east-orange', 'vineland', 'new-brunswick', 'perth-amboy',
    'plainfield', 'hackensack', 'sayreville', 'kearny', 'linden',
    'atlantic-city', 'morristown', 'paramus', 'wayne', 'cherry-hill',
    'toms-river', 'brick', 'lakewood', 'jackson', 'howell',
    'marlboro', 'manalapan', 'freehold', 'old-bridge', 'woodbridge',
    'edison', 'piscataway', 'somerset', 'bridgewater', 'flemington',
    'princeton', 'lawrenceville', 'hamilton', 'ewing', 'west-windsor',
    'east-brunswick', 'south-brunswick', 'north-brunswick', 'metuchen',
    'cranford', 'westfield', 'scotch-plains', 'summit', 'chatham',
    'madison', 'florham-park', 'livingston', 'montclair', 'bloomfield',
    'nutley', 'belleville', 'glen-ridge', 'verona', 'cedar-grove',
    'west-caldwell', 'caldwell', 'roseland', 'short-hills', 'millburn',
    'maplewood', 'south-orange', 'irvington-nj', 'orange-nj',
    'secaucus', 'north-bergen', 'west-new-york', 'guttenberg',
    'edgewater', 'fort-lee', 'cliffside-park', 'fairview',
    'ridgewood', 'glen-rock', 'fair-lawn', 'garfield', 'lodi',
    'hasbrouck-heights', 'wood-ridge', 'rutherford', 'lyndhurst',
    'teaneck', 'bergenfield', 'dumont', 'new-milford', 'oradell',
    'river-edge', 'maywood', 'rochelle-park', 'saddle-brook',
    // Connecticut
    'stamford', 'bridgeport', 'new-haven', 'hartford', 'waterbury',
    'norwalk', 'danbury', 'new-britain', 'west-hartford', 'greenwich',
    'fairfield', 'hamden', 'meriden', 'bristol', 'manchester',
    'west-haven', 'milford', 'stratford', 'shelton', 'torrington',
    'middletown', 'enfield', 'wallingford', 'southington', 'groton',
    'new-london', 'mystic', 'old-saybrook', 'guilford', 'branford',
    'north-haven', 'east-haven', 'orange-ct', 'woodbridge-ct',
    'trumbull', 'easton', 'weston', 'westport', 'wilton',
    'new-canaan', 'darien', 'ridgefield', 'newtown', 'bethel',
    'brookfield', 'monroe-ct', 'seymour', 'ansonia', 'derby',
    // Pennsylvania
    'philadelphia', 'pittsburgh', 'allentown', 'reading', 'erie',
    'bethlehem', 'scranton', 'lancaster', 'harrisburg', 'york',
    'wilkes-barre', 'chester', 'norristown', 'king-of-prussia',
    'conshohocken', 'ardmore', 'bryn-mawr', 'wayne-pa', 'malvern',
    'exton', 'west-chester-pa', 'downingtown', 'coatesville',
    'media', 'springfield-pa', 'drexel-hill', 'upper-darby',
    'havertown', 'broomall', 'newtown-square', 'glen-mills',
    'chadds-ford', 'kennett-square', 'doylestown', 'warminster',
    'horsham', 'lansdale', 'north-wales', 'blue-bell', 'ambler',
    'jenkintown', 'abington', 'glenside', 'cheltenham', 'elkins-park',
    'levittown-pa', 'bensalem', 'bristol-pa', 'morrisville-pa',
    'yardley', 'newtown-pa', 'state-college', 'williamsport',
    'chambersburg', 'gettysburg', 'carlisle', 'mechanicsburg',
    'camp-hill', 'hershey', 'lebanon-pa', 'pottstown', 'phoenixville',
    // Massachusetts
    'boston', 'worcester', 'springfield-ma', 'cambridge', 'lowell',
    'brockton', 'quincy', 'new-bedford', 'fall-river', 'lynn',
    'newton', 'somerville', 'framingham', 'brookline', 'medford-ma',
    'malden', 'waltham', 'haverhill', 'taunton', 'revere',
    'weymouth', 'plymouth', 'barnstable', 'hyannis', 'falmouth',
    'nantucket', 'marthas-vineyard', 'cape-cod', 'salem-ma',
    'beverly', 'gloucester', 'marblehead', 'swampscott', 'peabody',
    'danvers', 'ipswich', 'newburyport', 'amesbury', 'andover',
    'north-andover', 'methuen', 'lawrence', 'chelmsford', 'billerica',
    'burlington-ma', 'woburn', 'lexington', 'concord-ma', 'acton',
    'sudbury', 'wayland', 'natick', 'wellesley', 'needham',
    'dedham', 'norwood', 'canton-ma', 'stoughton', 'randolph',
    'milton', 'dorchester', 'mattapan', 'roxbury', 'jamaica-plain',
    // California
    'los-angeles', 'san-francisco', 'san-diego', 'san-jose', 'fresno',
    'sacramento', 'long-beach', 'oakland', 'bakersfield', 'anaheim',
    'santa-ana', 'riverside', 'stockton', 'irvine', 'chula-vista',
    'fremont', 'san-bernardino', 'modesto', 'fontana', 'moreno-valley',
    'glendale', 'huntington-beach', 'santa-clarita', 'garden-grove',
    'oceanside', 'rancho-cucamonga', 'ontario-ca', 'santa-rosa',
    'elk-grove', 'corona', 'lancaster-ca', 'palmdale', 'salinas',
    'pomona', 'hayward', 'escondido', 'sunnyvale', 'torrance',
    'pasadena', 'orange-ca', 'fullerton', 'thousand-oaks', 'roseville',
    'concord-ca', 'simi-valley', 'santa-clara', 'victorville', 'vallejo',
    'berkeley', 'el-monte', 'downey', 'costa-mesa', 'inglewood',
    'carlsbad', 'san-buenaventura', 'fairfield-ca', 'west-covina',
    'murrieta', 'richmond-ca', 'norwalk-ca', 'antioch', 'temecula',
    'burbank', 'daly-city', 'el-cajon', 'san-mateo', 'rialto',
    'clovis', 'compton', 'jurupa-valley', 'vista', 'south-gate',
    'mission-viejo', 'vacaville', 'carson', 'hesperia', 'santa-maria',
    'redding', 'westminster-ca', 'santa-monica', 'chico', 'newport-beach',
    'san-leandro', 'san-marcos', 'whittier', 'hawthorne', 'citrus-heights',
    'alhambra', 'tracy', 'livermore', 'buena-park', 'menifee',
    'hemet', 'lakewood-ca', 'merced', 'chino', 'indio',
    'redwood-city', 'lake-forest', 'napa', 'tustin', 'bellflower',
    'mountain-view', 'chino-hills', 'baldwin-park', 'alameda',
    'upland', 'san-ramon', 'folsom', 'pleasanton', 'lynwood',
    'union-city-ca', 'apple-valley', 'turlock', 'redlands',
    'rancho-cordova', 'milpitas', 'redondo-beach', 'davis',
    'camarillo', 'yuba-city', 'hanford', 'lodi-ca', 'la-habra',
    'encinitas', 'monterey', 'santa-cruz', 'palo-alto', 'woodland',
    'cupertino', 'campbell', 'los-gatos', 'saratoga-ca', 'gilroy',
    'morgan-hill', 'hollister', 'watsonville', 'capitola', 'scotts-valley',
    // Texas
    'houston', 'san-antonio', 'dallas', 'austin', 'fort-worth',
    'el-paso', 'arlington', 'corpus-christi', 'plano', 'laredo',
    'lubbock', 'garland', 'irving', 'amarillo', 'grand-prairie',
    'brownsville', 'mckinney', 'frisco', 'pasadena-tx', 'killeen',
    'mcallen', 'mesquite', 'midland', 'denton', 'waco',
    'carrollton', 'round-rock', 'abilene', 'pearland', 'richardson',
    'odessa', 'sugar-land', 'beaumont', 'the-woodlands', 'allen',
    'league-city', 'tyler', 'edinburg', 'conroe', 'bryan',
    'college-station', 'san-marcos-tx', 'new-braunfels', 'temple',
    'flower-mound', 'north-richland-hills', 'mansfield-tx', 'cedar-park',
    'pflugerville', 'georgetown', 'rowlett', 'wylie', 'keller',
    'southlake', 'grapevine', 'colleyville', 'bedford-tx', 'euless',
    'hurst', 'burleson', 'cedar-hill', 'desoto', 'duncanville',
    'lancaster-tx', 'waxahachie', 'lewisville', 'the-colony', 'little-elm',
    'prosper', 'celina', 'anna', 'forney', 'rockwall', 'sachse',
    'murphy', 'lucas', 'heath', 'fate', 'royse-city',
    'humble', 'kingwood', 'atascocita', 'spring', 'cypress',
    'katy', 'richmond-tx', 'missouri-city', 'stafford', 'rosenberg',
    'fulshear', 'tomball', 'magnolia', 'montgomery-tx', 'willis',
    'huntsville-tx', 'lufkin', 'nacogdoches', 'longview', 'marshall',
    'texarkana', 'sherman', 'denison', 'gainesville-tx', 'weatherford',
    'mineral-wells', 'stephenville', 'granbury', 'cleburne',
    'san-angelo', 'big-spring', 'del-rio', 'eagle-pass', 'uvalde',
    'victoria', 'port-arthur', 'galveston', 'texas-city', 'baytown',
    'la-porte', 'deer-park-tx', 'friendswood', 'dickinson', 'kemah',
    'seabrook', 'clear-lake', 'webster-tx', 'nasa-area',
    // Florida
    'miami', 'orlando', 'tampa', 'jacksonville', 'st-petersburg',
    'hialeah', 'tallahassee', 'fort-lauderdale', 'port-st-lucie',
    'cape-coral', 'pembroke-pines', 'hollywood-fl', 'miramar',
    'gainesville-fl', 'coral-springs', 'clearwater', 'palm-bay',
    'lakeland', 'pompano-beach', 'west-palm-beach', 'davie',
    'boca-raton', 'sunrise', 'plantation', 'deerfield-beach',
    'miami-beach', 'homestead', 'delray-beach', 'boynton-beach',
    'kissimmee', 'sanford', 'daytona-beach', 'ocala', 'melbourne',
    'deltona', 'palm-coast', 'largo', 'doral', 'coconut-creek',
    'margate', 'tamarac', 'north-miami', 'aventura', 'hallandale-beach',
    'weston', 'cooper-city', 'southwest-ranches', 'parkland',
    'coral-gables', 'key-biscayne', 'pinecrest', 'kendall',
    'cutler-bay', 'palmetto-bay', 'miami-gardens', 'miami-lakes',
    'hialeah-gardens', 'opa-locka', 'north-miami-beach',
    'naples', 'fort-myers', 'bonita-springs', 'estero', 'marco-island',
    'lehigh-acres', 'port-charlotte', 'punta-gorda',
    'sarasota', 'bradenton', 'venice', 'north-port', 'englewood-fl',
    'winter-haven', 'bartow', 'haines-city', 'auburndale',
    'winter-park', 'oviedo', 'winter-garden', 'clermont',
    'apopka', 'altamonte-springs', 'casselberry', 'longwood',
    'lake-mary', 'heathrow', 'debary', 'deland', 'new-smyrna-beach',
    'ormond-beach', 'palm-harbor', 'dunedin', 'safety-harbor',
    'oldsmar', 'tarpon-springs', 'trinity', 'new-port-richey',
    'spring-hill-fl', 'brooksville', 'inverness', 'crystal-river',
    'the-villages', 'leesburg', 'eustis', 'mount-dora', 'tavares',
    'st-augustine', 'ponte-vedra', 'fernandina-beach', 'fleming-island',
    'orange-park', 'middleburg-fl', 'green-cove-springs',
    'panama-city', 'destin', 'fort-walton-beach', 'niceville',
    'crestview', 'pensacola', 'pace', 'milton-fl', 'navarre',
    'key-west', 'marathon', 'islamorada', 'key-largo',
    // Illinois
    'chicago', 'aurora-il', 'naperville', 'joliet', 'rockford',
    'elgin', 'springfield-il', 'peoria', 'champaign', 'waukegan',
    'cicero', 'bloomington-il', 'arlington-heights', 'evanston',
    'schaumburg', 'bolingbrook', 'palatine', 'skokie', 'des-plaines',
    'orland-park', 'tinley-park', 'oak-lawn', 'berwyn', 'mount-prospect',
    'oak-park', 'hoffman-estates', 'downers-grove', 'wheaton',
    'elmhurst', 'lombard', 'buffalo-grove', 'bartlett', 'carol-stream',
    'streamwood', 'hanover-park', 'addison-il', 'glendale-heights',
    'wheeling', 'park-ridge', 'niles', 'morton-grove', 'lincolnwood',
    'highland-park-il', 'lake-forest-il', 'libertyville', 'mundelein',
    'vernon-hills', 'gurnee', 'lake-zurich', 'crystal-lake',
    'mchenry', 'woodstock-il', 'algonquin', 'elburn', 'st-charles-il',
    'geneva-il', 'batavia-il', 'north-aurora', 'oswego-il', 'plainfield-il',
    'romeoville', 'lockport-il', 'new-lenox', 'mokena', 'frankfort-il',
    'homer-glen', 'lemont', 'orland-hills', 'palos-heights',
    'oak-forest', 'country-club-hills', 'flossmoor', 'homewood',
    'olympia-fields', 'matteson', 'richton-park', 'park-forest',
    'university-park', 'crete', 'monee', 'peotone',
    // Ohio
    'columbus', 'cleveland', 'cincinnati', 'toledo', 'akron',
    'dayton', 'parma', 'canton', 'youngstown', 'lorain',
    'hamilton-oh', 'springfield-oh', 'lakewood-oh', 'euclid',
    'cuyahoga-falls', 'mentor', 'elyria', 'dublin-oh', 'westerville',
    'beavercreek', 'reynoldsburg', 'grove-city-oh', 'hilliard',
    'upper-arlington', 'gahanna', 'powell', 'delaware-oh',
    'marysville-oh', 'zanesville', 'newark-oh', 'mansfield-oh',
    'findlay', 'lima-oh', 'marion-oh', 'wooster', 'ashland-oh',
    'medina-oh', 'brunswick-oh', 'wadsworth', 'barberton',
    'north-canton', 'massillon', 'alliance', 'salem-oh',
    'steubenville', 'east-liverpool', 'marietta-oh', 'chillicothe',
    'portsmouth-oh', 'ironton', 'athens-oh',
    // Georgia
    'atlanta', 'augusta', 'columbus-ga', 'macon', 'savannah',
    'athens-ga', 'sandy-springs', 'roswell', 'johns-creek', 'alpharetta',
    'marietta-ga', 'smyrna', 'kennesaw', 'woodstock-ga', 'canton-ga',
    'acworth', 'dallas-ga', 'douglasville', 'lithia-springs',
    'peachtree-city', 'fayetteville-ga', 'newnan', 'carrollton-ga',
    'griffin', 'mcdonough', 'stockbridge', 'conyers', 'covington-ga',
    'lawrenceville', 'suwanee', 'duluth-ga', 'buford', 'flowery-branch',
    'gainesville-ga', 'cumming', 'dawsonville', 'dahlonega',
    'dunwoody', 'brookhaven-ga', 'decatur-ga', 'tucker', 'stone-mountain',
    'snellville', 'loganville', 'grayson', 'lilburn', 'norcross',
    'chamblee', 'doraville', 'clarkston', 'avondale-estates',
    'east-point', 'college-park-ga', 'hapeville', 'union-city-ga',
    'fairburn', 'palmetto-ga', 'tyrone', 'valdosta', 'albany-ga',
    'warner-robins', 'milledgeville', 'statesboro', 'hinesville',
    'brunswick-ga', 'st-simons', 'jekyll-island', 'tybee-island',
    // North Carolina
    'charlotte', 'raleigh', 'greensboro', 'durham', 'winston-salem',
    'fayetteville-nc', 'cary', 'wilmington-nc', 'high-point',
    'concord-nc', 'greenville-nc', 'asheville', 'gastonia',
    'huntersville', 'cornelius', 'davidson', 'mooresville',
    'matthews', 'mint-hill', 'indian-trail', 'weddington', 'waxhaw',
    'monroe-nc', 'stallings', 'harrisburg', 'kannapolis',
    'apex', 'holly-springs-nc', 'fuquay-varina', 'wake-forest',
    'garner', 'knightdale', 'wendell', 'zebulon', 'morrisville',
    'chapel-hill', 'carrboro', 'hillsborough', 'mebane', 'burlington-nc',
    'graham', 'elon', 'kernersville', 'clemmons', 'lewisville-nc',
    'advance', 'mocksville', 'lexington-nc', 'thomasville',
    'salisbury', 'statesville', 'hickory', 'lenoir', 'morganton',
    'marion-nc', 'black-mountain', 'swannanoa', 'hendersonville-nc',
    'brevard', 'waynesville', 'sylva', 'bryson-city', 'boone',
    'blowing-rock', 'banner-elk', 'newland', 'spruce-pine',
    'jacksonville-nc', 'new-bern', 'kinston', 'goldsboro',
    'rocky-mount', 'wilson-nc', 'sanford-nc', 'southern-pines',
    'pinehurst', 'aberdeen-nc', 'lumberton', 'laurinburg',
    'outer-banks', 'kill-devil-hills', 'nags-head', 'kitty-hawk',
    'elizabeth-city', 'edenton', 'manteo',
    // Virginia
    'virginia-beach', 'norfolk', 'chesapeake', 'richmond', 'newport-news',
    'alexandria', 'hampton', 'roanoke', 'portsmouth-va', 'suffolk',
    'lynchburg', 'harrisonburg', 'charlottesville', 'danville-va',
    'fredericksburg', 'arlington-va', 'fairfax', 'manassas', 'leesburg-va',
    'ashburn', 'sterling', 'herndon', 'reston', 'centreville',
    'chantilly', 'burke', 'springfield-va', 'annandale', 'falls-church',
    'mclean', 'tysons', 'vienna-va', 'oakton', 'great-falls',
    'woodbridge-va', 'dale-city', 'lake-ridge', 'dumfries', 'stafford-va',
    'spotsylvania', 'culpeper', 'warrenton', 'front-royal',
    'winchester', 'staunton', 'waynesboro', 'lexington-va',
    'blacksburg', 'christiansburg', 'radford', 'salem-va',
    'williamsburg', 'yorktown', 'gloucester-va', 'smithfield-va',
    // Maryland
    'baltimore', 'columbia-md', 'germantown', 'silver-spring', 'waldorf',
    'glen-burnie', 'ellicott-city', 'frederick', 'dundalk', 'rockville-md',
    'bethesda', 'towson', 'bowie', 'laurel-md', 'greenbelt',
    'college-park-md', 'hyattsville', 'takoma-park', 'cumberland',
    'hagerstown', 'annapolis', 'pasadena-md', 'severna-park', 'arnold',
    'edgewater-md', 'crofton', 'gambrills', 'odenton', 'fort-meade',
    'catonsville', 'arbutus', 'halethorpe', 'linthicum', 'hanover-md',
    'jessup', 'savage', 'north-laurel', 'burtonsville', 'olney',
    'clarksburg', 'damascus', 'gaithersburg', 'montgomery-village',
    'poolesville', 'darnestown', 'potomac', 'chevy-chase', 'kensington',
    'wheaton', 'aspen-hill', 'white-oak', 'adelphi', 'langley-park',
    'beltsville', 'calverton', 'east-riverdale', 'bladensburg',
    'upper-marlboro', 'brandywine', 'clinton-md', 'fort-washington',
    'oxon-hill', 'temple-hills', 'suitland', 'camp-springs',
    'la-plata', 'indian-head', 'hughesville', 'leonardtown',
    'lexington-park', 'california-md', 'salisbury-md', 'ocean-city-md',
    'easton-md', 'cambridge-md', 'st-michaels', 'kent-island',
    'stevensville', 'chester-md', 'centreville-md',
    // Michigan
    'detroit', 'grand-rapids', 'warren', 'sterling-heights',
    'ann-arbor', 'lansing', 'flint', 'dearborn', 'livonia',
    'westland', 'troy-mi', 'farmington-hills', 'kalamazoo',
    'wyoming-mi', 'southfield', 'rochester-hills', 'taylor',
    'pontiac', 'st-clair-shores', 'royal-oak', 'novi', 'canton-mi',
    'plymouth-mi', 'northville', 'brighton-mi', 'howell-mi',
    'south-lyon', 'milford-mi', 'commerce-township', 'waterford',
    'clarkston-mi', 'lake-orion', 'oxford-mi', 'romeo',
    'macomb', 'shelby-township', 'utica-mi', 'clinton-township',
    'chesterfield', 'new-baltimore', 'mount-clemens', 'roseville-mi',
    'eastpointe', 'harper-woods', 'grosse-pointe', 'allen-park',
    'lincoln-park', 'wyandotte', 'riverview', 'brownstown',
    'woodhaven', 'flat-rock', 'monroe-mi', 'muskegon', 'holland-mi',
    'traverse-city', 'petoskey', 'charlevoix', 'gaylord',
    'midland-mi', 'bay-city-mi', 'saginaw', 'port-huron',
    'jackson-mi', 'battle-creek', 'portage', 'niles-mi',
    'benton-harbor', 'st-joseph-mi', 'south-haven', 'allegan',
    'marquette', 'escanaba', 'iron-mountain', 'houghton',
    // Arizona
    'phoenix', 'tucson', 'mesa', 'chandler', 'scottsdale',
    'glendale-az', 'gilbert', 'tempe', 'peoria-az', 'surprise',
    'avondale-az', 'goodyear', 'buckeye', 'queen-creek', 'maricopa',
    'casa-grande', 'florence-az', 'coolidge', 'apache-junction',
    'gold-canyon', 'fountain-hills', 'cave-creek', 'carefree',
    'paradise-valley', 'litchfield-park', 'tolleson', 'laveen',
    'anthem', 'new-river', 'sun-city', 'sun-city-west', 'el-mirage',
    'youngtown', 'wickenburg', 'payson', 'prescott', 'prescott-valley',
    'cottonwood', 'sedona', 'flagstaff', 'williams-az', 'kingman',
    'lake-havasu-city', 'bullhead-city', 'yuma', 'sierra-vista',
    'oro-valley', 'marana', 'sahuarita', 'green-valley',
    // Colorado
    'denver', 'colorado-springs', 'aurora-co', 'fort-collins',
    'lakewood-co', 'thornton', 'arvada', 'westminster-co', 'pueblo',
    'centennial', 'boulder', 'longmont', 'loveland', 'greeley',
    'broomfield', 'castle-rock', 'parker', 'littleton', 'highlands-ranch',
    'commerce-city', 'northglenn', 'brighton-co', 'erie', 'frederick-co',
    'firestone', 'dacono', 'windsor', 'timnath', 'wellington',
    'johnstown-co', 'berthoud', 'golden', 'wheat-ridge', 'edgewater-co',
    'englewood-co', 'sheridan-co', 'cherry-hills-village',
    'greenwood-village', 'lone-tree', 'ken-caryl', 'columbine',
    'roxborough', 'monument', 'woodland-park', 'manitou-springs',
    'fountain', 'security-widefield', 'canon-city', 'salida',
    'buena-vista', 'leadville', 'vail', 'avon', 'eagle',
    'glenwood-springs', 'aspen', 'basalt', 'carbondale-co',
    'rifle', 'grand-junction', 'fruita', 'montrose', 'durango',
    'pagosa-springs', 'telluride', 'steamboat-springs', 'craig',
    // Washington State
    'seattle', 'spokane', 'tacoma', 'vancouver-wa', 'bellevue',
    'kent-wa', 'everett', 'renton', 'federal-way', 'kirkland',
    'auburn-wa', 'redmond', 'marysville-wa', 'lakewood-wa', 'kennewick',
    'bellingham', 'olympia', 'pasco', 'richland', 'burien',
    'sammamish', 'issaquah', 'woodinville', 'bothell', 'lynnwood',
    'edmonds', 'mountlake-terrace', 'shoreline', 'lake-forest-park',
    'mercer-island', 'tukwila', 'seatac', 'des-moines-wa', 'covington',
    'maple-valley', 'black-diamond', 'enumclaw', 'buckley',
    'bonney-lake', 'puyallup', 'sumner', 'orting', 'graham',
    'spanaway', 'parkland', 'university-place', 'gig-harbor',
    'port-orchard', 'bremerton', 'silverdale', 'poulsbo', 'bainbridge-island',
    'sequim', 'port-angeles', 'port-townsend', 'oak-harbor',
    'anacortes', 'mount-vernon-wa', 'burlington-wa', 'sedro-woolley',
    'stanwood', 'arlington-wa', 'snohomish', 'lake-stevens',
    'granite-falls', 'sultan', 'monroe-wa',
    // Oregon
    'portland', 'eugene', 'salem-or', 'gresham', 'hillsboro',
    'beaverton', 'bend', 'medford', 'springfield-or', 'corvallis',
    'albany-or', 'tigard', 'tualatin', 'lake-oswego', 'west-linn',
    'oregon-city', 'milwaukie', 'clackamas', 'gladstone',
    'wilsonville', 'sherwood', 'newberg', 'mcminnville', 'canby',
    'woodburn', 'silverton', 'stayton', 'dallas-or', 'monmouth',
    'independence', 'keizer', 'hayesville', 'aumsville',
    'ashland', 'grants-pass', 'roseburg', 'coos-bay', 'klamath-falls',
    'redmond-or', 'prineville', 'madras', 'the-dalles', 'hood-river',
    'hermiston', 'pendleton', 'la-grande', 'baker-city', 'astoria',
    'seaside', 'cannon-beach', 'tillamook', 'lincoln-city', 'newport-or',
    'florence-or',
    // Nevada
    'las-vegas', 'henderson', 'reno', 'north-las-vegas', 'sparks',
    'carson-city', 'elko', 'mesquite', 'boulder-city', 'pahrump',
    'summerlin', 'enterprise', 'spring-valley-nv', 'sunrise-manor',
    'whitney', 'winchester-nv', 'paradise', 'laughlin',
    // Tennessee
    'nashville', 'memphis', 'knoxville', 'chattanooga', 'clarksville',
    'murfreesboro', 'franklin-tn', 'jackson-tn', 'johnson-city',
    'bartlett', 'hendersonville-tn', 'kingsport', 'collierville',
    'smyrna-tn', 'cleveland-tn', 'brentwood-tn', 'germantown',
    'spring-hill-tn', 'cookeville', 'gallatin', 'mount-juliet',
    'lebanon-tn', 'columbia-tn', 'la-vergne', 'maryville-tn',
    'farragut', 'oak-ridge', 'morristown-tn', 'shelbyville',
    'tullahoma', 'lawrenceburg-tn', 'sevierville', 'pigeon-forge',
    'gatlinburg',
    // Minnesota
    'minneapolis', 'st-paul', 'rochester-mn', 'bloomington-mn', 'duluth',
    'brooklyn-park', 'plymouth-mn', 'maple-grove', 'woodbury',
    'eagan', 'lakeville', 'eden-prairie', 'burnsville', 'blaine',
    'coon-rapids', 'shakopee', 'prior-lake', 'savage-mn', 'chaska',
    'chanhassen', 'victoria-mn', 'waconia', 'apple-valley-mn',
    'rosemount', 'farmington-mn', 'hastings-mn', 'red-wing',
    'northfield', 'faribault', 'owatonna', 'albert-lea', 'austin-mn',
    'winona', 'mankato', 'st-cloud', 'sartell', 'sauk-rapids',
    'brainerd', 'baxter-mn', 'bemidji', 'moorhead', 'fergus-falls',
    'alexandria-mn', 'willmar', 'hutchinson-mn', 'new-ulm',
    'marshall-mn', 'worthington-mn',
    // Wisconsin
    'milwaukee', 'madison-wi', 'green-bay', 'kenosha', 'racine',
    'appleton', 'waukesha', 'oshkosh', 'eau-claire', 'janesville',
    'west-allis', 'la-crosse', 'sheboygan', 'wauwatosa', 'fond-du-lac',
    'new-berlin', 'brookfield-wi', 'menomonee-falls', 'germantown-wi',
    'west-bend', 'muskego', 'franklin-wi', 'oak-creek', 'south-milwaukee',
    'cudahy', 'greenfield-wi', 'greendale', 'hales-corners',
    'whitefish-bay', 'shorewood-wi', 'fox-point', 'bayside-wi',
    'mequon', 'cedarburg', 'grafton-wi', 'port-washington-wi',
    'hartford-wi', 'oconomowoc', 'delafield', 'pewaukee',
    'mukwonago', 'burlington-wi', 'union-grove', 'sturtevant',
    'caledonia-wi', 'mount-pleasant-wi', 'pleasant-prairie',
    'somers-wi', 'paddock-lake', 'twin-lakes', 'lake-geneva',
    'elkhorn', 'whitewater', 'fort-atkinson', 'jefferson-wi',
    'watertown-wi', 'beaver-dam', 'columbus-wi', 'portage-wi',
    'baraboo', 'wisconsin-dells', 'reedsburg', 'tomah',
    'sparta', 'onalaska', 'holmen', 'west-salem',
    'stevens-point', 'wausau', 'marshfield', 'wisconsin-rapids',
    'plover', 'schofield', 'rothschild', 'mosinee',
    // Indiana
    'indianapolis', 'fort-wayne', 'evansville', 'south-bend', 'carmel',
    'fishers', 'bloomington-in', 'hammond', 'gary', 'lafayette',
    'muncie', 'terre-haute', 'greenwood-in', 'kokomo', 'noblesville',
    'anderson-in', 'elkhart', 'mishawaka', 'granger', 'lawrence-in',
    'jeffersonville', 'new-albany', 'columbus-in', 'zionsville',
    'westfield', 'avon-in', 'brownsburg', 'plainfield-in', 'mooresville-in',
    'greenfield-in', 'shelbyville-in', 'franklin-in', 'martinsville-in',
    'valparaiso', 'portage-in', 'chesterton', 'michigan-city',
    'la-porte', 'crown-point', 'munster', 'highland-in', 'griffith',
    'schererville', 'st-john', 'cedar-lake', 'lowell-in', 'dyer',
    // Missouri
    'kansas-city', 'st-louis', 'springfield-mo', 'columbia-mo',
    'independence', 'lees-summit', 'ofallon-mo', 'st-joseph',
    'st-charles', 'blue-springs', 'st-peters', 'florissant',
    'joplin', 'chesterfield-mo', 'jefferson-city', 'cape-girardeau',
    'wildwood', 'ballwin', 'town-and-country', 'creve-coeur',
    'maryland-heights', 'bridgeton', 'hazelwood', 'ferguson',
    'university-city', 'kirkwood', 'webster-groves', 'affton',
    'mehlville', 'oakville-mo', 'arnold-mo', 'imperial', 'barnhart',
    'festus', 'crystal-city-mo', 'desoto-mo', 'farmington-mo',
    'ste-genevieve', 'perryville', 'jackson-mo', 'sikeston',
    'poplar-bluff', 'kennett', 'west-plains', 'rolla', 'lebanon-mo',
    'branson', 'nixa', 'ozark-mo', 'republic', 'bolivar',
    'carthage', 'neosho', 'monett', 'aurora-mo',
    'liberty', 'gladstone-mo', 'raytown', 'grandview',
    'belton', 'raymore', 'peculiar', 'harrisonville',
    'grain-valley', 'oak-grove-mo', 'odessa-mo', 'warrensburg',
    'sedalia', 'marshall-mo', 'boonville', 'fulton-mo',
    // South Carolina
    'columbia-sc', 'charleston', 'north-charleston', 'mount-pleasant-sc',
    'greenville-sc', 'rock-hill', 'summerville', 'goose-creek',
    'hilton-head-island', 'bluffton', 'beaufort-sc', 'myrtle-beach',
    'north-myrtle-beach', 'conway', 'florence-sc', 'spartanburg',
    'simpsonville', 'greer', 'mauldin', 'easley', 'anderson-sc',
    'clemson', 'seneca', 'aiken', 'lexington-sc', 'irmo',
    'chapin', 'west-columbia', 'cayce', 'orangeburg', 'sumter',
    'fort-mill', 'tega-cay', 'clover', 'york-sc', 'chester-sc',
    'hartsville', 'darlington', 'dillon', 'georgetown-sc', 'pawleys-island',
    'surfside-beach', 'litchfield-beach', 'garden-city',
    // Alabama
    'birmingham', 'montgomery', 'mobile', 'huntsville', 'tuscaloosa',
    'hoover', 'dothan', 'auburn-al', 'decatur-al', 'madison-al',
    'florence-al', 'gadsden', 'vestavia-hills', 'prattville',
    'phenix-city', 'alabaster', 'opelika', 'northport',
    'enterprise', 'daphne', 'fairhope', 'foley', 'gulf-shores',
    'orange-beach', 'spanish-fort', 'saraland', 'tillmans-corner',
    'semmes', 'theodore', 'bayou-la-batre',
    'pelham', 'trussville', 'gardendale', 'fultondale', 'center-point',
    'homewood', 'mountain-brook', 'irondale', 'leeds', 'moody',
    'pell-city', 'oxford-al', 'anniston', 'jacksonville-al',
    'albertville', 'boaz', 'guntersville', 'scottsboro', 'athens-al',
    'hartselle', 'cullman', 'jasper-al', 'fort-payne',
    // Louisiana
    'new-orleans', 'baton-rouge', 'shreveport', 'metairie', 'lafayette',
    'lake-charles', 'kenner', 'bossier-city', 'monroe-la', 'alexandria-la',
    'houma', 'marrero', 'central-la', 'slidell', 'mandeville',
    'covington-la', 'madisonville', 'hammond', 'denham-springs',
    'gonzales', 'prairieville', 'zachary', 'baker', 'port-allen',
    'new-iberia', 'abbeville', 'crowley', 'opelousas', 'eunice',
    'ruston', 'natchitoches', 'minden', 'west-monroe', 'bastrop',
    'sulphur', 'moss-bluff', 'deridder', 'leesville',
    'thibodaux', 'morgan-city', 'raceland', 'laplace', 'destrehan',
    'luling', 'boutte', 'gretna', 'harvey', 'terrytown',
    'westwego', 'avondale-la', 'bridge-city-la',
    // Kentucky
    'louisville', 'lexington-ky', 'bowling-green-ky', 'owensboro',
    'covington-ky', 'richmond-ky', 'georgetown-ky', 'florence-ky',
    'hopkinsville', 'nicholasville', 'elizabethtown', 'henderson-ky',
    'frankfort', 'independence-ky', 'paducah', 'radcliff',
    'ashland-ky', 'murray', 'erlanger', 'burlington-ky',
    'winchester-ky', 'danville-ky', 'shelbyville-ky', 'bardstown',
    'berea', 'london-ky', 'corbin', 'somerset-ky', 'pikeville',
    'hazard', 'prestonsburg', 'morehead', 'mount-sterling',
    // Oklahoma
    'oklahoma-city', 'tulsa', 'norman', 'broken-arrow', 'edmond',
    'lawton', 'moore', 'midwest-city', 'stillwater', 'enid',
    'muskogee', 'bartlesville', 'owasso', 'shawnee', 'yukon',
    'ardmore', 'durant', 'ponca-city', 'del-city', 'bixby',
    'jenks', 'sand-springs', 'sapulpa', 'claremore', 'tahlequah',
    'mcalester', 'ada', 'chickasha', 'duncan', 'mustang',
    'bethany', 'warr-acres', 'el-reno', 'choctaw', 'piedmont',
    'blanchard', 'newcastle', 'tuttle', 'noble',
    // Iowa
    'des-moines', 'cedar-rapids', 'davenport', 'sioux-city',
    'iowa-city', 'waterloo', 'council-bluffs', 'ames', 'dubuque',
    'ankeny', 'west-des-moines', 'urbandale', 'johnston-ia',
    'clive', 'waukee', 'grimes', 'altoona-ia', 'pleasant-hill-ia',
    'norwalk-ia', 'indianola', 'newton-ia', 'pella', 'oskaloosa',
    'marshalltown', 'mason-city', 'fort-dodge', 'spencer',
    'storm-lake', 'le-mars', 'muscatine', 'burlington-ia',
    'keokuk', 'fort-madison', 'clinton-ia', 'bettendorf',
    'north-liberty', 'coralville', 'marion-ia',
    // Kansas
    'wichita', 'overland-park', 'kansas-city-ks', 'olathe', 'topeka',
    'lawrence', 'shawnee-ks', 'lenexa', 'manhattan-ks', 'salina',
    'hutchinson-ks', 'leavenworth', 'leawood', 'prairie-village',
    'mission', 'merriam', 'roeland-park', 'fairway', 'westwood',
    'bonner-springs', 'basehor', 'tonganoxie', 'eudora', 'de-soto-ks',
    'spring-hill-ks', 'gardner', 'edgerton', 'louisburg',
    'emporia', 'junction-city', 'hays', 'garden-city-ks',
    'dodge-city', 'liberal', 'great-bend', 'mcpherson',
    'el-dorado-ks', 'derby', 'andover', 'augusta-ks',
    'newton-ks', 'park-city', 'haysville', 'mulvane',
    // Nebraska
    'omaha', 'lincoln-ne', 'bellevue-ne', 'grand-island', 'kearney',
    'fremont-ne', 'hastings', 'north-platte', 'norfolk-ne', 'columbus-ne',
    'papillion', 'la-vista', 'ralston', 'gretna-ne', 'elkhorn-ne',
    'bennington', 'waterloo-ne', 'blair', 'plattsmouth',
    'scottsbluff', 'sidney-ne', 'ogallala', 'lexington-ne',
    // Arkansas
    'little-rock', 'fort-smith', 'fayetteville-ar', 'springdale-ar',
    'jonesboro', 'north-little-rock', 'conway-ar', 'rogers',
    'bentonville', 'pine-bluff', 'hot-springs', 'benton-ar',
    'sherwood', 'maumelle', 'cabot', 'jacksonville-ar', 'bryant',
    'texarkana-ar', 'russellville', 'bella-vista', 'centerton',
    'siloam-springs', 'van-buren', 'searcy', 'west-memphis',
    'paragould', 'mountain-home', 'harrison', 'batesville',
    // Mississippi
    'jackson-ms', 'gulfport', 'southaven', 'biloxi', 'hattiesburg',
    'olive-branch', 'tupelo', 'meridian', 'pearl', 'madison-ms',
    'ridgeland', 'brandon', 'flowood', 'clinton-ms', 'oxford-ms',
    'starkville', 'columbus-ms', 'hernando', 'horn-lake',
    'ocean-springs', 'diberville', 'gautier', 'pascagoula',
    'moss-point', 'bay-st-louis', 'waveland', 'pass-christian',
    'long-beach-ms', 'vicksburg', 'natchez', 'brookhaven-ms',
    'mccomb', 'laurel', 'petal',
    // Utah
    'salt-lake-city', 'west-valley-city', 'provo', 'west-jordan',
    'orem', 'sandy-ut', 'ogden', 'st-george', 'layton', 'south-jordan',
    'lehi', 'millcreek', 'taylorsville', 'murray-ut', 'draper',
    'riverton-ut', 'herriman', 'eagle-mountain', 'saratoga-springs-ut',
    'cedar-city', 'american-fork', 'pleasant-grove', 'lindon',
    'highland-ut', 'alpine-ut', 'mapleton', 'springville-ut',
    'spanish-fork', 'payson', 'salem-ut', 'santaquin',
    'bountiful', 'centerville-ut', 'farmington-ut', 'kaysville',
    'fruit-heights', 'clinton-ut', 'clearfield-ut', 'syracuse-ut',
    'roy', 'north-ogden', 'pleasant-view-ut', 'brigham-city',
    'logan', 'north-logan', 'hyde-park-ut', 'smithfield-ut',
    'tooele', 'grantsville', 'stansbury-park', 'park-city',
    'heber-city', 'midway-ut', 'washington-ut', 'hurricane',
    'ivins', 'santa-clara-ut', 'leeds-ut',
    // New Mexico
    'albuquerque', 'las-cruces', 'rio-rancho', 'santa-fe',
    'roswell', 'farmington-nm', 'alamogordo', 'clovis-nm',
    'hobbs', 'carlsbad-nm', 'gallup', 'los-lunas', 'belen',
    'corrales', 'bernalillo', 'placitas', 'edgewood',
    'los-alamos', 'taos', 'silver-city', 'deming', 'truth-or-consequences',
    'socorro', 'las-vegas-nm', 'raton', 'angel-fire', 'red-river',
    // Hawaii
    'honolulu', 'pearl-city', 'hilo', 'kailua', 'waipahu',
    'kaneohe', 'mililani', 'kahului', 'kihei', 'lahaina',
    'kailua-kona', 'kapaa', 'lihue', 'ewa-beach', 'kapolei',
    // Alaska
    'anchorage', 'fairbanks', 'juneau', 'wasilla', 'sitka',
    'ketchikan', 'kenai', 'soldotna', 'palmer', 'kodiak',
    'eagle-river',
    // Idaho
    'boise', 'meridian-id', 'nampa', 'caldwell-id', 'idaho-falls',
    'pocatello', 'coeur-dalene', 'twin-falls', 'lewiston-id',
    'post-falls', 'eagle-id', 'star', 'kuna', 'mountain-home-id',
    'rexburg', 'blackfoot', 'burley', 'rupert', 'jerome',
    'hailey', 'ketchum', 'sun-valley', 'mccall', 'sandpoint',
    'moscow-id', 'hayden',
    // Montana
    'billings', 'missoula', 'great-falls', 'bozeman', 'butte',
    'helena', 'kalispell', 'whitefish', 'columbia-falls',
    'bigfork', 'polson', 'hamilton-mt', 'stevensville', 'livingston',
    'belgrade', 'manhattan-mt', 'laurel', 'miles-city', 'sidney',
    'glendive', 'havre', 'lewistown',
    // Wyoming
    'cheyenne', 'casper', 'laramie', 'gillette', 'rock-springs',
    'sheridan', 'green-river-wy', 'evanston-wy', 'riverton-wy',
    'lander', 'jackson', 'cody', 'powell', 'torrington',
    'douglas', 'rawlins', 'thermopolis', 'worland',
    // North Dakota
    'fargo', 'bismarck', 'grand-forks', 'minot', 'west-fargo',
    'williston', 'dickinson', 'mandan', 'jamestown', 'wahpeton',
    'devils-lake', 'valley-city',
    // South Dakota
    'sioux-falls', 'rapid-city', 'aberdeen-sd', 'brookings',
    'watertown-sd', 'mitchell', 'yankton', 'huron', 'vermillion',
    'pierre', 'spearfish', 'sturgis', 'belle-fourche', 'deadwood',
    'lead-sd', 'hot-springs-sd', 'custer',
    // West Virginia
    'charleston-wv', 'huntington-wv', 'morgantown', 'parkersburg',
    'wheeling', 'weirton', 'martinsburg', 'beckley', 'clarksburg-wv',
    'fairmont', 'south-charleston', 'teays-valley', 'hurricane-wv',
    'cross-lanes', 'nitro', 'dunbar', 'st-albans-wv',
    'bridgeport-wv', 'elkins', 'buckhannon', 'keyser',
    'lewisburg', 'princeton-wv', 'bluefield',
    // New Hampshire
    'manchester-nh', 'nashua', 'concord-nh', 'derry', 'dover-nh',
    'rochester-nh', 'salem-nh', 'hudson-nh', 'merrimack-nh',
    'londonderry', 'keene', 'bedford-nh', 'portsmouth-nh', 'hampton',
    'exeter', 'windham-nh', 'amherst-nh', 'milford-nh', 'hollis',
    'pelham-nh', 'goffstown', 'hooksett', 'bow', 'pembroke-nh',
    'laconia', 'gilford', 'meredith', 'wolfeboro', 'conway-nh',
    'north-conway', 'jackson-nh', 'lincoln-nh', 'littleton-nh',
    'lebanon-nh', 'hanover', 'claremont', 'newport-nh',
    // Vermont
    'burlington-vt', 'south-burlington', 'rutland', 'barre',
    'montpelier', 'st-albans-vt', 'winooski', 'essex-junction',
    'colchester-vt', 'williston-vt', 'shelburne-vt', 'middlebury',
    'bennington', 'brattleboro', 'springfield-vt', 'st-johnsbury',
    'newport-vt', 'morrisville', 'stowe', 'waterbury-vt',
    // Maine
    'portland-me', 'lewiston', 'bangor', 'south-portland',
    'auburn-me', 'biddeford', 'sanford-me', 'brunswick-me',
    'scarborough', 'westbrook', 'saco', 'gorham-me', 'windham-me',
    'falmouth-me', 'yarmouth-me', 'freeport-me', 'bath-me',
    'topsham', 'gardiner', 'hallowell', 'waterville-me', 'winslow',
    'skowhegan', 'farmington-me', 'rumford', 'norway-me',
    'kennebunk', 'kennebunkport', 'wells', 'ogunquit',
    'york-me', 'kittery', 'eliot', 'berwick-me',
    'old-orchard-beach', 'cape-elizabeth', 'cumberland',
    'bar-harbor', 'ellsworth', 'blue-hill', 'camden',
    'rockland-me', 'belfast-me', 'bucksport', 'brewer',
    'orono', 'old-town-me', 'presque-isle', 'caribou', 'houlton',
    // Rhode Island
    'providence', 'warwick', 'cranston', 'pawtucket', 'east-providence',
    'woonsocket', 'coventry-ri', 'north-providence', 'cumberland-ri',
    'west-warwick', 'north-kingstown', 'south-kingstown', 'johnston-ri',
    'lincoln-ri', 'smithfield-ri', 'bristol-ri', 'barrington-ri',
    'warren-ri', 'tiverton', 'portsmouth-ri', 'middletown-ri',
    'newport-ri', 'narragansett', 'wakefield-ri', 'westerly',
    'charlestown-ri', 'hopkinton-ri', 'north-smithfield',
    'burrillville', 'glocester', 'foster', 'scituate-ri',
    // Delaware
    'wilmington-de', 'dover-de', 'newark-de', 'middletown-de',
    'smyrna-de', 'milford-de', 'seaford', 'georgetown-de',
    'lewes', 'rehoboth-beach', 'dewey-beach', 'bethany-beach',
    'fenwick-island', 'ocean-view-de', 'long-neck', 'millsboro',
    'selbyville', 'laurel-de', 'bridgeville', 'harrington-de',
    'camden-de', 'wyoming-de', 'clayton', 'townsend',
    'odessa-de', 'new-castle-de', 'bear', 'glasgow-de',
    'hockessin', 'greenville-de', 'pike-creek', 'north-star',
    'elsmere', 'newport-de', 'stanton',
    // Washington DC area
    'washington-dc', 'capitol-hill', 'georgetown-dc', 'dupont-circle',
    'foggy-bottom', 'adams-morgan', 'columbia-heights', 'petworth',
    'brookland', 'capitol-riverfront', 'navy-yard', 'southwest-waterfront',
    'tenleytown', 'friendship-heights', 'chevy-chase-dc', 'glover-park',
    'woodley-park', 'cleveland-park', 'van-ness', 'forest-hills-dc',
    'takoma-dc', 'brightwood', 'shepherd-park', 'barnaby-woods',
  ];

  const services = [
    'hvac', 'electrical', 'plumbing', 'roofing', 'painting',
    'handyman', 'landscaping', 'cleaning', 'moving', 'locksmith',
    'fencing', 'concrete', 'flooring', 'siding', 'gutters',
    'pressure-washing', 'tree-service', 'pest-control', 'garage-door',
    'window-installation', 'drywall', 'demolition', 'excavation',
    'septic', 'paving', 'masonry', 'welding', 'insulation',
    'solar', 'pool-service', 'irrigation', 'appliance-repair',
    'chimney', 'waterproofing', 'foundation-repair', 'junk-removal',
    'carpet-cleaning', 'auto-detailing', 'towing',
  ];

  const params = [];
  for (const city of cities) {
    for (const service of services) {
      params.push({ city, service });
    }
  }

  return params;
}

// ─── HELPERS ───

function formatCity(slug: string) {
  const specialCases: Record<string, string> = {
    'dc': 'DC',
    'nj': 'NJ',
    'ct': 'CT',
    'pa': 'PA',
    'ma': 'MA',
    'ca': 'CA',
    'tx': 'TX',
    'fl': 'FL',
    'il': 'IL',
    'oh': 'OH',
    'ga': 'GA',
    'nc': 'NC',
    'va': 'VA',
    'md': 'MD',
    'mi': 'MI',
    'az': 'AZ',
    'co': 'CO',
    'wa': 'WA',
    'or': 'OR',
    'nv': 'NV',
    'tn': 'TN',
    'mn': 'MN',
    'wi': 'WI',
    'in': 'IN',
    'mo': 'MO',
    'sc': 'SC',
    'al': 'AL',
    'la': 'LA',
    'ky': 'KY',
    'ok': 'OK',
    'ia': 'IA',
    'ks': 'KS',
    'ne': 'NE',
    'ar': 'AR',
    'ms': 'MS',
    'ut': 'UT',
    'nm': 'NM',
    'id': 'ID',
    'mt': 'MT',
    'wy': 'WY',
    'nd': 'ND',
    'sd': 'SD',
    'wv': 'WV',
    'nh': 'NH',
    'vt': 'VT',
    'me': 'ME',
    'ri': 'RI',
    'de': 'DE',
    'st': 'St.',
  };

  return slug.split('-').map(w => {
    if (specialCases[w]) return specialCases[w];
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

function formatService(slug: string) {
  const serviceNames: Record<string, string> = {
    'hvac': 'HVAC',
    'electrical': 'Electrical',
    'plumbing': 'Plumbing',
    'roofing': 'Roofing',
    'painting': 'Painting',
    'handyman': 'Handyman',
    'landscaping': 'Landscaping',
    'cleaning': 'Cleaning',
    'moving': 'Moving',
    'locksmith': 'Locksmith',
    'fencing': 'Fencing',
    'concrete': 'Concrete',
    'flooring': 'Flooring',
    'siding': 'Siding',
    'gutters': 'Gutter',
    'pressure-washing': 'Pressure Washing',
    'tree-service': 'Tree Service',
    'pest-control': 'Pest Control',
    'garage-door': 'Garage Door',
    'window-installation': 'Window Installation',
    'drywall': 'Drywall',
    'demolition': 'Demolition',
    'excavation': 'Excavation',
    'septic': 'Septic',
    'paving': 'Paving',
    'masonry': 'Masonry',
    'welding': 'Welding',
    'insulation': 'Insulation',
    'solar': 'Solar',
    'pool-service': 'Pool Service',
    'irrigation': 'Irrigation',
    'appliance-repair': 'Appliance Repair',
    'chimney': 'Chimney',
    'waterproofing': 'Waterproofing',
    'foundation-repair': 'Foundation Repair',
    'junk-removal': 'Junk Removal',
    'carpet-cleaning': 'Carpet Cleaning',
    'auto-detailing': 'Auto Detailing',
    'towing': 'Towing',
  };

  return serviceNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

// ─── SERVICE DETAILS ───

const serviceDetails: Record<string, {
  jobs: string[];
  pain: string;
  searchTerms: string[];
}> = {
  hvac: {
    jobs: ['AC installs', 'heating repairs', 'duct cleaning', 'furnace maintenance', 'mini split installs'],
    pain: 'seasonal demand spikes and emergency calls at all hours',
    searchTerms: ['hvac software', 'hvac scheduling app', 'hvac business management', 'hvac crm', 'ac repair scheduling'],
  },
  electrical: {
    jobs: ['panel upgrades', 'wiring repairs', 'lighting installs', 'outlet work', 'ceiling fan wiring'],
    pain: 'emergency calls and back-to-back appointments across town',
    searchTerms: ['electrician software', 'electrical contractor app', 'electrician scheduling', 'electrical business management'],
  },
  plumbing: {
    jobs: ['pipe repairs', 'drain cleaning', 'water heater installs', 'toilet replacements', 'sewer line work'],
    pain: 'urgent calls at all hours and jobs that run longer than expected',
    searchTerms: ['plumbing software', 'plumber scheduling app', 'plumbing business management', 'plumber crm'],
  },
  roofing: {
    jobs: ['roof replacements', 'leak repairs', 'inspections', 'gutter installs', 'storm damage repair'],
    pain: 'weather delays and managing multiple crews on big jobs',
    searchTerms: ['roofing software', 'roofing crm', 'roofing contractor app', 'roofing lead management'],
  },
  painting: {
    jobs: ['interior painting', 'exterior painting', 'cabinet refinishing', 'deck staining', 'commercial painting'],
    pain: 'multi-day jobs and coordinating estimates with walkthroughs',
    searchTerms: ['painting contractor software', 'painting business app', 'painter scheduling', 'painting estimate software'],
  },
  handyman: {
    jobs: ['home repairs', 'furniture assembly', 'drywall patching', 'door installs', 'odd jobs'],
    pain: 'a huge variety of job types and customers who want you there yesterday',
    searchTerms: ['handyman software', 'handyman scheduling app', 'handyman business management', 'handyman crm'],
  },
  landscaping: {
    jobs: ['lawn care', 'tree trimming', 'garden design', 'mulching', 'seasonal cleanups'],
    pain: 'weather cancellations and managing recurring weekly clients',
    searchTerms: ['landscaping software', 'lawn care app', 'landscaping business management', 'lawn care scheduling'],
  },
  cleaning: {
    jobs: ['house cleaning', 'deep cleaning', 'move-out cleaning', 'office cleaning', 'post-construction cleaning'],
    pain: 'high volume of bookings and keeping track of recurring appointments',
    searchTerms: ['cleaning business software', 'maid service app', 'cleaning company scheduling', 'cleaning service crm'],
  },
  moving: {
    jobs: ['residential moves', 'apartment moves', 'packing services', 'furniture delivery', 'junk hauling'],
    pain: 'tight scheduling windows and last-minute bookings',
    searchTerms: ['moving company software', 'mover scheduling app', 'moving business management', 'moving crm'],
  },
  locksmith: {
    jobs: ['lock changes', 'car lockouts', 'rekeying', 'deadbolt installs', 'smart lock setup'],
    pain: 'emergency calls that need immediate response',
    searchTerms: ['locksmith software', 'locksmith scheduling', 'locksmith business app', 'locksmith crm'],
  },
  fencing: {
    jobs: ['wood fences', 'vinyl fences', 'chain link', 'gate installs', 'fence repairs'],
    pain: 'big material orders and multi-day installs that need coordination',
    searchTerms: ['fencing contractor software', 'fence company app', 'fencing business management'],
  },
  concrete: {
    jobs: ['driveways', 'patios', 'sidewalks', 'foundation work', 'stamped concrete'],
    pain: 'weather-dependent pours and scheduling around cure times',
    searchTerms: ['concrete contractor software', 'concrete business app', 'concrete scheduling'],
  },
  flooring: {
    jobs: ['hardwood installs', 'tile work', 'vinyl plank', 'carpet installs', 'floor refinishing'],
    pain: 'managing material deliveries and multi-room projects',
    searchTerms: ['flooring contractor software', 'flooring business app', 'flooring company crm'],
  },
  siding: {
    jobs: ['vinyl siding', 'fiber cement', 'wood siding', 'siding repairs', 'trim work'],
    pain: 'weather delays and coordinating with other trades on remodels',
    searchTerms: ['siding contractor software', 'siding company app', 'siding business management'],
  },
  gutters: {
    jobs: ['gutter installs', 'gutter cleaning', 'gutter guards', 'downspout extensions', 'gutter repairs'],
    pain: 'seasonal rushes in spring and fall and lots of small jobs to keep track of',
    searchTerms: ['gutter company software', 'gutter business app', 'gutter cleaning scheduling'],
  },
  'pressure-washing': {
    jobs: ['house washing', 'driveway cleaning', 'deck washing', 'commercial pressure washing', 'roof soft washing'],
    pain: 'weather cancellations and managing a packed daily schedule',
    searchTerms: ['pressure washing software', 'power washing app', 'pressure washing business management'],
  },
  'tree-service': {
    jobs: ['tree removal', 'tree trimming', 'stump grinding', 'emergency storm cleanup', 'lot clearing'],
    pain: 'emergency storm calls flooding in and big jobs that tie up your crew for days',
    searchTerms: ['tree service software', 'arborist app', 'tree company scheduling', 'tree service crm'],
  },
  'pest-control': {
    jobs: ['termite treatment', 'rodent removal', 'ant treatment', 'mosquito control', 'wildlife removal'],
    pain: 'recurring service schedules and customers who need you there fast',
    searchTerms: ['pest control software', 'exterminator app', 'pest control scheduling', 'pest control crm'],
  },
  'garage-door': {
    jobs: ['garage door installs', 'spring replacement', 'opener installs', 'panel replacement', 'garage door tune-ups'],
    pain: 'emergency calls when someone is stuck and parts ordering for different brands',
    searchTerms: ['garage door software', 'garage door company app', 'garage door business management'],
  },
  'window-installation': {
    jobs: ['window replacement', 'new construction windows', 'storm windows', 'bay windows', 'skylight installs'],
    pain: 'long lead times on custom orders and scheduling around delivery dates',
    searchTerms: ['window installer software', 'window company app', 'window installation scheduling'],
  },
  drywall: {
    jobs: ['drywall hanging', 'taping and mudding', 'texture matching', 'ceiling repairs', 'water damage repair'],
    pain: 'coordinating with other trades on new builds and remodels',
    searchTerms: ['drywall contractor software', 'drywall business app', 'drywall company management'],
  },
  demolition: {
    jobs: ['interior demo', 'deck removal', 'shed teardown', 'pool demolition', 'site clearing'],
    pain: 'permit coordination and disposal logistics',
    searchTerms: ['demolition contractor software', 'demo company app', 'demolition business management'],
  },
  excavation: {
    jobs: ['site grading', 'trenching', 'foundation digging', 'land clearing', 'drainage work'],
    pain: 'weather delays and equipment scheduling across multiple job sites',
    searchTerms: ['excavation contractor software', 'excavating company app', 'excavation business management'],
  },
  septic: {
    jobs: ['septic installs', 'tank pumping', 'drain field repair', 'septic inspections', 'line cleaning'],
    pain: 'emergency backups that need same-day service and health department scheduling',
    searchTerms: ['septic company software', 'septic business app', 'septic service scheduling'],
  },
  paving: {
    jobs: ['driveway paving', 'parking lot paving', 'asphalt repair', 'sealcoating', 'striping'],
    pain: 'weather windows for laying asphalt and coordinating with material suppliers',
    searchTerms: ['paving contractor software', 'asphalt company app', 'paving business management'],
  },
  masonry: {
    jobs: ['brick work', 'stone walls', 'chimney repair', 'retaining walls', 'tuck pointing'],
    pain: 'weather-dependent work and long multi-day projects',
    searchTerms: ['masonry contractor software', 'mason business app', 'masonry company management'],
  },
  welding: {
    jobs: ['structural welding', 'railing fabrication', 'gate fabrication', 'trailer repair', 'custom metalwork'],
    pain: 'custom job quoting and managing shop time vs field work',
    searchTerms: ['welding business software', 'welder scheduling app', 'welding shop management'],
  },
  insulation: {
    jobs: ['attic insulation', 'spray foam', 'blown-in insulation', 'crawl space insulation', 'soundproofing'],
    pain: 'coordinating with builders on new construction timelines',
    searchTerms: ['insulation contractor software', 'insulation company app', 'insulation business management'],
  },
  solar: {
    jobs: ['panel installs', 'system design', 'battery storage', 'panel cleaning', 'inverter replacement'],
    pain: 'long sales cycles and permit and inspection scheduling',
    searchTerms: ['solar installer software', 'solar company app', 'solar business management', 'solar crm'],
  },
  'pool-service': {
    jobs: ['pool cleaning', 'equipment repair', 'pool opening and closing', 'liner replacement', 'chemical balancing'],
    pain: 'managing weekly recurring routes and seasonal ramp-up',
    searchTerms: ['pool service software', 'pool company app', 'pool business management', 'pool service crm'],
  },
  irrigation: {
    jobs: ['sprinkler installs', 'system repairs', 'winterization', 'spring startups', 'drip irrigation'],
    pain: 'seasonal rush periods and managing recurring maintenance clients',
    searchTerms: ['irrigation company software', 'sprinkler business app', 'irrigation scheduling'],
  },
  'appliance-repair': {
    jobs: ['washer repair', 'dryer repair', 'fridge repair', 'dishwasher repair', 'oven repair'],
    pain: 'parts ordering and fitting emergency repairs into a packed schedule',
    searchTerms: ['appliance repair software', 'appliance business app', 'appliance repair scheduling'],
  },
  chimney: {
    jobs: ['chimney sweeping', 'chimney inspections', 'liner installs', 'cap installs', 'masonry repair'],
    pain: 'seasonal demand in fall and winter and scheduling around customer availability',
    searchTerms: ['chimney sweep software', 'chimney business app', 'chimney company management'],
  },
  waterproofing: {
    jobs: ['basement waterproofing', 'french drains', 'sump pump installs', 'crack injection', 'exterior waterproofing'],
    pain: 'emergency flood calls and long multi-step projects',
    searchTerms: ['waterproofing contractor software', 'waterproofing company app', 'waterproofing business management'],
  },
  'foundation-repair': {
    jobs: ['crack repair', 'pier installs', 'leveling', 'bowing wall repair', 'crawl space encapsulation'],
    pain: 'complex assessments that need detailed documentation and follow-ups',
    searchTerms: ['foundation repair software', 'foundation company app', 'foundation repair crm'],
  },
  'junk-removal': {
    jobs: ['household junk removal', 'construction debris', 'estate cleanouts', 'appliance hauling', 'yard waste removal'],
    pain: 'last-minute bookings and routing multiple pickups in a day',
    searchTerms: ['junk removal software', 'hauling company app', 'junk removal scheduling'],
  },
  'carpet-cleaning': {
    jobs: ['carpet cleaning', 'upholstery cleaning', 'rug cleaning', 'stain removal', 'commercial carpet cleaning'],
    pain: 'fitting multiple jobs into a day and managing repeat customers',
    searchTerms: ['carpet cleaning software', 'carpet cleaner app', 'carpet cleaning business management'],
  },
  'auto-detailing': {
    jobs: ['full details', 'interior cleaning', 'paint correction', 'ceramic coating', 'mobile detailing'],
    pain: 'managing mobile appointments and keeping track of add-on services',
    searchTerms: ['auto detailing software', 'detailing business app', 'car detailing scheduling', 'detailing crm'],
  },
  towing: {
    jobs: ['roadside assistance', 'accident towing', 'long-distance towing', 'motorcycle towing', 'flatbed service'],
    pain: 'emergency dispatch and keeping track of which trucks are available',
    searchTerms: ['towing company software', 'towing business app', 'towing dispatch software', 'towing crm'],
  },
};

// ─── METADATA ───

export async function generateMetadata({ params }: { params: Promise<{ city: string; service: string }> }): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;

  const city = formatCity(citySlug);
  const service = formatService(serviceSlug);

  return {
    title: `${service} Software for ${city} Contractors | Lead2Project`,
    description: `${city} ${service.toLowerCase()} contractors: get a booking link and QR code your customers can use to submit jobs with photos. Add leads yourself or let them come to you. Quote, schedule, and track every job from one dashboard. Try Lead2Project free for 14 days.`,
    alternates: {
      canonical: `https://lead2project.com/contractor-software/${citySlug}/${serviceSlug}`,
    },
    openGraph: {
      title: `${service} Job Management in ${city} | Lead2Project`,
      description: `Stop losing ${service.toLowerCase()} leads in ${city}. One booking link, one dashboard. Customers submit jobs with photos, you quote and schedule from your phone.`,
      url: `https://lead2project.com/contractor-software/${citySlug}/${serviceSlug}`,
      siteName: 'Lead2Project',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service} Software for ${city} Contractors | Lead2Project`,
      description: `${city} ${service.toLowerCase()} pros: one booking link, one dashboard. Capture leads, send quotes, schedule jobs.`,
    },
  };
}

// ─── PAGE ───

export default async function CityServicePage({ params }: { params: Promise<{ city: string; service: string }> }) {
  const { city: citySlug, service: serviceSlug } = await params;

  const city = formatCity(citySlug);
  const service = formatService(serviceSlug);
  const detail = serviceDetails[serviceSlug] || serviceDetails.hvac;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-blue-400 font-semibold text-sm tracking-wide uppercase mb-4">
            {service} Software for {city}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Stop Losing {service} Leads in {city}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            You run a {service.toLowerCase()} business in {city}. Leads come in from texts, calls, 
            social media, word of mouth. You lose track. Jobs slip through the cracks.
          </p>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Lead2Project gives you one booking link and one dashboard. Your customers submit 
            job requests with photos, or you add leads yourself. Everything in one place. 
            No more sticky notes and forgotten callbacks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </a>
            <a
              href="/"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">14-day free trial. Cancel anytime.</p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">
            Sound Familiar?
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto mb-12">
            We talked to {service.toLowerCase()} contractors in {city} and heard the same thing 
            over and over.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                How leads come in now
              </h3>
              <p className="text-gray-400 leading-relaxed">
                A homeowner texts you from a friend&apos;s referral. Someone DMs you on Instagram. 
                Your buddy sends you a number. A customer calls while you are on a job. 
                You scribble it on a napkin, tell yourself you will call back later, and forget. 
                By the time you remember, they already called someone else.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                What {service.toLowerCase()} pros actually need
              </h3>
              <p className="text-gray-400 leading-relaxed">
                One place where every lead lands. A booking link you can put on 
                your truck, your cards, your lawn sign, your Instagram bio. Customers fill out 
                what they need, upload photos of the job, and it shows up on your dashboard. 
                You open your phone, see every lead, send a quote, schedule the job. Done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            How Lead2Project Works for {city} {service} Contractors
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-2xl mx-auto mb-12">
            Set up takes two minutes. Here is what happens next.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Get Your Booking Link and QR Code
              </h3>
              <p className="text-gray-400">
                Every Lead2Project account comes with a custom booking link and a downloadable 
                QR code. Put the QR code on your truck, yard signs, business cards, flyers. 
                Share the link on social media. Customers scan it or tap it and land on your 
                custom form.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Leads Land on Your Dashboard
              </h3>
              <p className="text-gray-400">
                When a customer submits a request through your link, it shows up on your 
                dashboard instantly. They pick their service category, describe the job, 
                and upload photos. You can also add leads yourself when someone calls or texts 
                you directly. Either way, everything is in one place.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Quote, Schedule, and Get Paid
              </h3>
              <p className="text-gray-400">
                Review the job details, send a quote with one tap, schedule the work, and 
                track the whole thing from start to finish. Every morning at 6AM you get a 
                summary email with new leads, today&apos;s schedule, and payment status. No more 
                guessing what is on your plate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Specific Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            Built for {service} Contractors Who Are Tired of the Chaos
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto mb-12">
            Whether you are handling {detail.jobs.slice(0, 3).join(', ')}, or {detail.jobs[detail.jobs.length - 1]}, 
            you know the pain of {detail.pain}. Lead2Project keeps it all organized so nothing falls through the cracks.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Your Customers Can Book You Directly
              </h3>
              <p className="text-gray-400 leading-relaxed">
                No app download required. Your customer scans your QR code or clicks your 
                booking link, picks the type of {service.toLowerCase()} work they need, writes a 
                description, and uploads photos. You get it instantly. They do not have to 
                call, text, or DM you. It just works.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                You Can Add Leads Yourself Too
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Not every lead comes through your booking link. Someone calls you on the 
                job site. A neighbor flags you down. Your buddy sends you a number. Open 
                Lead2Project, add the lead in 30 seconds, and it is on your board. 
                No more forgetting to follow up.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Send Quotes Without the Back and Forth
              </h3>
              <p className="text-gray-400 leading-relaxed">
                The customer already told you what they need and showed you photos. 
                Review the details, build your quote, and send it. They get a professional 
                email with your company branding. No more scribbling estimates on the back 
                of a business card.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Look Like a Real Company
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Set up your company identity once. Your logo, your colors, your info. It 
                flows through every customer email, your booking form, and your QR code. 
                Homeowners in {city} trust a {service.toLowerCase()} contractor who looks professional 
                and organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Workflow */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            What Your Morning Looks Like with Lead2Project
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto mb-12">
            Every day at 6AM, you get one email. Here is what is in it.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-gray-300">
                  <span className="text-white font-semibold">New leads overnight.</span> Two 
                  homeowners in {city} submitted {service.toLowerCase()} requests through your booking link while 
                  you were asleep. Photos included.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-gray-300">
                  <span className="text-white font-semibold">Today&apos;s schedule.</span> You have three 
                  jobs lined up. Addresses, customer info, and job details all in one place.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-gray-300">
                  <span className="text-white font-semibold">Payment status.</span> One invoice 
                  is overdue. One got paid yesterday.
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              You have not even left the house yet and you already know exactly what your day looks like.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
            Questions {city} {service} Contractors Ask Us
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                I already have a system that works. Why switch?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                If your system is texts, calls, and notes on your phone, it works until it 
                does not. One missed callback is one lost job. Lead2Project does not replace 
                how leads come in. It gives you one place to see all of them so nothing 
                gets lost.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                I am not great with technology. Is this complicated?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                If you can use your phone, you can use Lead2Project. Sign up, add your 
                company name and logo, and your booking link and QR code are ready in two 
                minutes. No training needed. No complicated setup.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                What if my customers are not tech-savvy?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your booking form is just a simple web page. No app download. They scan your 
                QR code, fill in what they need, take a photo, and hit submit. If your customer 
                can use Facebook, they can use this. And if they would rather just call you, 
                that is fine too. You add the lead yourself in 30 seconds.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                How much does it cost?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Simple monthly pricing. No setup fees, no contracts. Start with a 14-day free 
                trial. If one saved lead pays for a year of Lead2Project, it pays for itself 
                on day one.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                I tried Jobber and Housecall Pro but they were too much.
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Those tools are built for big operations with fleets and dispatchers. 
                Lead2Project is built for contractors who work solo or with a small crew 
                and just need a simple way to capture leads, send quotes, and stay organized. 
                No bloat. No features you will never use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop Letting {service} Leads Slip Through the Cracks
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get your booking link and QR code in two minutes. Start capturing every lead 
            in {city} today.
          </p>
          <a
            href="/signup"
            className="inline-block px-10 py-4 bg-white text-blue-700 rounded-lg font-bold text-lg hover:shadow-2xl transition"
          >
            Start Your Free 14-Day Trial
          </a>
          <p className="text-sm text-white/60 mt-4">Cancel anytime.</p>
        </div>
      </section>

      {/* SEO text */}
      <section className="sr-only" aria-hidden="true">
        <h2>{service} contractor software {city}</h2>
        <p>
          {detail.searchTerms.join('. ')}. 
          Best {service.toLowerCase()} app for contractors in {city}. 
          {service} lead tracking {city}. 
          {service.toLowerCase()} job management app. 
          How to get more {service.toLowerCase()} leads in {city}. 
          {service.toLowerCase()} booking software. 
          {service.toLowerCase()} estimate and quoting app. 
          Best app for {service.toLowerCase()} contractors. 
          {service.toLowerCase()} business software {city}. 
          {city} {service.toLowerCase()} contractor scheduling. 
          Simple CRM for {service.toLowerCase()} businesses. 
          How to organize {service.toLowerCase()} leads.
          {service.toLowerCase()} contractor app for iPhone.
          {service.toLowerCase()} contractor app for Android.
          Free {service.toLowerCase()} scheduling software.
          {service.toLowerCase()} invoice and payment app.
        </p>
      </section>
    </div>
  );
}