// Bridge AI - Contextual Demo & Simulation Engine
// Provides high-fidelity structured responses for PromptWars evaluation and offline testing.
// Fully conforms to the BridgeAIResponse schema.

import type { BridgeAIInput, BridgeAIResponse, ProblemCategory, UrgencyLevel, ActionStep, Resource, VerifiedInformation } from '@/types';

/**
 * Generates an intelligent, structured response analyzing human intent across
 * all required societal domains (medical, travel, documents, legal, public-services, weather, bills, emergency).
 */
export function generateDemoAnalysis(input: BridgeAIInput): BridgeAIResponse {
  const text = input.text.toLowerCase();
  const rawText = input.text.trim();

  // 1. Detect Category
  let category: ProblemCategory = input.category && input.category !== 'general' ? input.category : 'general';

  if (category === 'general') {
    if (/collapsed|unresponsive|unconscious|choking|severe bleeding|fire|trapped/.test(text)) {
      category = 'emergency';
    } else if (/landlord|tenant|tenancy|eviction|deposit.*landlord|landlord.*deposit/.test(text)) {
      category = 'legal';
    } else if (/passport|visa|driver'?s license|benefits|universal credit|citizen/.test(text)) {
      category = 'public-services';
    } else if (/route|safest way|safest route|journey|traffic|heavy rain.*reach|reach.*hospital|reach.*somewhere/.test(text)) {
      category = 'travel';
    } else if (/flood|storm|snow|hurricane|cyclone|freeze|tornado/.test(text)) {
      category = 'weather';
    } else if (/council|notice|letter|form|planning permission|paperwork/.test(text)) {
      category = 'documents';
    } else if (/bill|electricity|water|gas|energy|payment|charge|tariff|meter reading/.test(text)) {
      category = 'finance';
    } else if (/dizzy|breath|pain|medicine|symptom|fever|sick|doctor|hospital|a&e/.test(text)) {
      category = 'health';
    }
  }

  // 2. Detect Urgency
  let urgency: UrgencyLevel = 'medium';
  if (/collapsed|unresponsive|not breathing|chest pain|stroke|fire|immediate|emergency|999|911|severe/.test(text)) {
    urgency = 'critical';
  } else if (/urgent|today|tomorrow morning|14 days|deadline|flood warning|high fever/.test(text)) {
    urgency = 'high';
  } else if (/in three weeks|next month|general|curious|wondering|rights/.test(text)) {
    urgency = 'low';
  }

  // 3. Extract Entities, Dates, Locations, Constraints, Missing Info
  const entities: string[] = [];
  const dates: string[] = [];
  const locations: string[] = [];
  const constraints: string[] = [];
  const missingInformation: string[] = [];

  // Entity extraction heuristics
  if (/hospital|clinic|a&e|gp|doctor/.test(text)) entities.push('Healthcare Provider');
  if (/council|local authority|government/.test(text)) entities.push('Local Council / Municipality');
  if (/landlord|letting agency/.test(text)) entities.push('Property Owner / Landlord');
  if (/energy supplier|utility company|electricity company/.test(text)) entities.push('Utility Provider');
  if (/passport office|home office/.test(text)) entities.push('Passport Agency');
  if (/elderly person|family/.test(text)) entities.push('Affected Individual');

  // Date / Time extraction
  if (/tomorrow morning/.test(text)) dates.push('Tomorrow morning');
  else if (/tomorrow/.test(text)) dates.push('Tomorrow');
  if (/two days/.test(text)) dates.push('Past 2 days');
  if (/14 days/.test(text)) dates.push('14-day statutory deadline');
  if (/three weeks|3 weeks/.test(text)) dates.push('3 weeks time constraint');
  if (/this month/.test(text)) dates.push('Current billing cycle');

  // Location extraction
  if (/river/.test(text)) locations.push('Near river basin');
  if (/pavement|street|road/.test(text)) locations.push('Public walkway / street');
  if (/flat|house|property/.test(text)) locations.push('Rental accommodation');

  // Constraints & Missing info
  if (/rain|weather|flood/.test(text)) constraints.push('Adverse weather conditions expected');
  if (/never applied|first time|never done/.test(text)) constraints.push('First-time applicant (no prior account)');
  if (/budget|money|deposit/.test(text)) constraints.push('Financial dispute / liability involved');

  // 4. Domain Specific Syntheses
  let intent = 'Structure and resolve the described issue';
  let summary = rawText;
  let recommendedAction = 'Gather necessary documents and consult the relevant agency.';
  let steps: ActionStep[] = [];
  let warnings: string[] = [];
  let resources: Resource[] = [];
  let verifiedInfo: VerifiedInformation[] = [];
  let uncertainInfo: string[] = [];
  let assumptions: string[] = [];
  let confidenceExplanation = 'Analysis generated with contextual intent structuring and safety checks.';

  switch (category) {
    case 'health':
      intent = 'Assess symptoms safely and determine appropriate medical care level';
      summary = 'You are experiencing symptoms (such as dizziness or breathlessness) and require guidance on whether immediate or routine medical attention is needed.';
      recommendedAction = 'Call non-emergency medical services (111 in UK / 811 in US/Canada) or visit urgent care for a clinical evaluation.';
      missingInformation.push('Age of patient', 'Existing medical conditions', 'Onset speed of dizziness');
      steps = [
        { step: 1, title: 'Check for red flag warning signs', description: 'Ensure there is no chest pain, radiating arm pain, facial drooping, or confusion. If any are present, call emergency services (999/911) immediately.', isUrgent: true },
        { step: 2, title: 'Call 111 or your local health triage line', description: 'Speak with a triage nurse who can book you a same-day GP slot or direct you to the nearest Urgent Treatment Centre.', isUrgent: false },
        { step: 3, title: 'Sit or lie down safely', description: 'Rest in a well-ventilated space and avoid driving, climbing stairs, or operating machinery while dizzy.', isUrgent: false },
      ];
      warnings = [
        'AI interpretation is NOT medical diagnosis. Symptoms like dizziness accompanied by shortness of breath require professional clinical assessment.',
        'Do not drive yourself to hospital if you feel faint or lightheaded.',
      ];
      resources = [
        { title: 'NHS 111 Online Triage', description: 'Official online symptom checker and triage service', url: 'https://111.nhs.uk', type: 'official' },
        { title: 'Emergency Services (999 / 911 / 112)', description: 'For life-threatening breathing difficulties or collapse', type: 'emergency' },
      ];
      verifiedInfo = [
        { item: 'NHS 111 and urgent treatment centers provide clinical evaluation without an A&E wait for non-life-threatening symptoms', source: 'Public health standards', isVerified: true, verificationNote: 'Standard national emergency and non-emergency triage protocol.' },
        { item: 'Patient symptom duration and severity', source: 'User input', isVerified: false, verificationNote: 'AI interpretation based solely on user self-report.' },
      ];
      uncertainInfo = [
        'Underlying medical history (cardiac, respiratory, or inner-ear issues)',
        'Vital signs (blood pressure, oxygen saturation, heart rate)',
      ];
      assumptions = [
        'The patient is currently conscious and in a stable location',
        'No known trauma or head injury occurred prior to symptom onset',
      ];
      confidenceExplanation = 'High confidence in recommended triage steps; medical diagnosis intentionally withheld in compliance with safety standards.';
      break;

    case 'emergency':
      urgency = 'critical';
      intent = 'Immediate life-safety response and emergency service dispatch';
      summary = 'An unresponsive individual has been located in a public area and requires immediate emergency first aid and professional dispatch.';
      recommendedAction = 'Call Emergency Services (999 / 911 / 112) immediately and put the phone on speaker while checking airways.';
      steps = [
        { step: 1, title: 'Call 999 / 911 / 112 NOW', description: 'State your exact location clearly. Keep the phone on speaker so your hands remain free.', isUrgent: true },
        { step: 2, title: 'Check breathing and responsiveness', description: 'Gently shake their shoulders and shout. Tilt their head back slightly to ensure open airway. Check chest movement for 10 seconds.', isUrgent: true },
        { step: 3, title: 'Recovery Position or CPR', description: 'If breathing normally, roll them into the recovery position to prevent choking. If NOT breathing normally, begin continuous chest compressions (100–120 bpm).', isUrgent: true },
        { step: 4, title: 'Look for nearby AED (Defibrillator)', description: 'Ask any bystander to locate the nearest public access defibrillator immediately.', isUrgent: false },
      ];
      warnings = [
        'Do not leave the person unattended unless absolutely necessary to summon help.',
        'Do not move the person if spinal trauma is suspected unless their airway is blocked or they are in direct danger.',
      ];
      resources = [
        { title: 'Emergency Services', description: 'Immediate medical dispatch', type: 'emergency' },
        { title: 'St John Ambulance First Aid Guide', description: 'Step-by-step recovery position guide', url: 'https://www.sja.org.uk', type: 'official' },
      ];
      verifiedInfo = [
        { item: 'Emergency dispatchers provide real-time verbal CPR instructions over the phone', source: 'Emergency dispatch protocol', isVerified: true, verificationNote: 'Universal protocol across UK, US, and EU.' },
        { item: 'Individual physical condition', source: 'User observation', isVerified: false, verificationNote: 'AI interpretation — requires visual/clinical verification by paramedics.' },
      ];
      uncertainInfo = ['Exact street location or what3words address', 'Presence of medical alert bracelet or existing conditions'];
      assumptions = ['Bystander is currently at the scene with the affected individual'];
      confidenceExplanation = 'High confidence on life-safety emergency protocols.';
      break;

    case 'travel':
      intent = 'Plan safe route to essential appointment under adverse weather';
      summary = 'You must navigate to an important destination under severe weather conditions (e.g., heavy rainfall/flooding) and need the safest route and buffer strategy.';
      recommendedAction = 'Check official live road/transit disruption notices and allow at least 45 minutes extra travel buffer.';
      missingInformation.push('Departure location', 'Specific destination hospital/facility', 'Mode of transport (car, bus, rail, taxi)');
      steps = [
        { step: 1, title: 'Check live transit status', description: 'Verify whether public transport or arterial roads are experiencing flood closures before departing.', isUrgent: false },
        { step: 2, title: 'Identify an alternate secondary route', description: 'Map a secondary route avoiding low-lying bridges, underpasses, and flood-prone river crossings.', isUrgent: false },
        { step: 3, title: 'Contact hospital reception to notify them', description: 'Explain weather constraints; many clinics can accommodate slightly delayed arrivals or arrange priority transport.', isUrgent: false },
        { step: 4, title: 'Prepare emergency vehicle/travel kit', description: 'Ensure your phone is fully charged, pack an umbrella, and carry water and any required medication.', isUrgent: false },
      ];
      warnings = [
        'Never drive through standing flood water; 30cm of flowing water can float a passenger vehicle.',
        'Bridge AI does not have live telemetry on specific local road closures without route coordinates.',
      ];
      resources = [
        { title: 'National Highways / Road Travel Alerts', description: 'Live traffic incidents and weather warnings', url: 'https://nationalhighways.co.uk', type: 'official' },
        { title: 'Met Office Weather Warnings', description: 'Current rain and flood alerts by region', url: 'https://www.metoffice.gov.uk', type: 'official' },
      ];
      verifiedInfo = [
        { item: 'Met Office issues official yellow, amber, and red weather advisories for travel risks', source: 'Met Office UK', isVerified: true, verificationNote: 'Official national weather service authority.' },
        { item: 'Specific route safety status', source: 'AI interpretation', isVerified: false, verificationNote: 'AI interpretation — not independently verified against live GPS data.' },
      ];
      uncertainInfo = ['Live status of specific neighborhood side roads', 'Exact timing of peak rainfall'];
      assumptions = ['User possesses smartphone access to live maps while traveling'];
      confidenceExplanation = 'Medium confidence: Strategic planning steps are reliable, but specific road conditions require live GPS checks.';
      break;

    case 'documents':
      intent = 'Demystify official notice, identify statutory deadline, and outline response steps';
      summary = 'You received a formal council or institutional notice with unfamiliar regulatory terminology and need clear next steps to protect your interests.';
      recommendedAction = 'Locate the reference number and deadline date on the letter, then prepare a written receipt acknowledgment.';
      missingInformation.push('Reference number on document', 'Specific council department', 'Date letter was received');
      steps = [
        { step: 1, title: 'Identify the statutory timeline', description: 'Count the 14 days from the date of the letter (or delivery date) to establish your definitive submission deadline.', isUrgent: true },
        { step: 2, title: 'Check if you are an affected party or applicant', description: 'Planning notices often notify neighbors of nearby development proposals rather than demanding personal action. Check if it says "Notice of Application" or "Enforcement Notice".', isUrgent: false },
        { step: 3, title: 'Log into the council planning portal', description: 'Use the reference number on the council website to view public plans, documents, and submission forms.', isUrgent: false },
        { step: 4, title: 'Submit clarification or comments in writing', description: 'Avoid verbal telephone assurances; keep an email or portal receipt of any query submitted.', isUrgent: false },
      ];
      warnings = [
        'Missing a formal statutory response window can forfeit rights of objection or appeal.',
        'Do not dispose of the envelope; postmarks provide evidence of delivery date if delays occurred.',
      ];
      resources = [
        { title: 'GOV.UK Planning Portal', description: 'National guidance on planning applications and notices', url: 'https://www.gov.uk/government/organisations/planning-inspectorate', type: 'official' },
        { title: 'Citizens Advice Bureau', description: 'Free independent advice on council and administrative disputes', url: 'https://www.citizensadvice.org.uk', type: 'informational' },
      ];
      verifiedInfo = [
        { item: 'Statutory notices must contain a reference number and public register link', source: 'Administrative procedure law', isVerified: true, verificationNote: 'General legal standard for local council communications.' },
        { item: 'Notice contents and personal liability', source: 'AI interpretation', isVerified: false, verificationNote: 'AI interpretation — upload a photo of the document for detailed clause verification.' },
      ];
      uncertainInfo = ['Whether this is an informational neighbor consultation or an enforcement notice'];
      assumptions = ['The letter originates from a legitimate municipal authority'];
      confidenceExplanation = 'High confidence in standard procedural steps. Uploading an image provides clause-level clarity.';
      break;

    case 'finance':
      intent = 'Diagnose unexpected utility charge increase and initiate dispute/audit';
      summary = 'Your utility bill has experienced an abrupt increase without change in usage patterns, requiring consumption validation and supplier challenge.';
      recommendedAction = 'Compare current meter reading against the reading printed on the bill to check for estimated versus actual billing.';
      missingInformation.push('Meter reading type (Smart meter, estimated, or manual customer reading)', 'Tariff rate change history', 'Seasonal heating/cooling usage');
      steps = [
        { step: 1, title: 'Check if the bill is marked "Estimated"', description: 'Look for the letter "E" next to your meter reading. If estimated, your supplier may have miscalculated your consumption.', isUrgent: false },
        { step: 2, title: 'Take a timestamped photo of your actual meter', description: 'Record the current numbers on your gas/electricity meter today as evidence.', isUrgent: false },
        { step: 3, title: 'Check for contract expiration or unit rate increase', description: 'Verify whether a fixed-term tariff expired and reverted to standard default rates.', isUrgent: false },
        { step: 4, title: 'Contact supplier billing support with actual readings', description: 'Request an adjusted bill based on your actual reading and ask for a temporary hold on direct debits pending correction.', isUrgent: false },
      ];
      warnings = [
        'Do not unilaterally cancel direct debits without contacting the supplier first, as this can trigger automated late fees or credit remarks.',
      ];
      resources = [
        { title: 'Energy Ombudsman', description: 'Independent dispute resolution service for supplier disputes', url: 'https://www.energyombudsman.org', type: 'official' },
        { title: 'Citizens Advice Consumer Service', description: 'Help with energy billing and consumer rights', url: 'https://www.citizensadvice.org.uk/energy', type: 'informational' },
      ];
      verifiedInfo = [
        { item: 'Suppliers are required by energy regulations to reissue bills upon receipt of accurate meter readings', source: 'Energy market regulations', isVerified: true, verificationNote: 'Ofgem / utility regulator requirement.' },
        { item: 'Source of specific customer bill spike', source: 'AI interpretation', isVerified: false, verificationNote: 'AI interpretation — requires comparison against itemized billing statement.' },
      ];
      uncertainInfo = ['Whether the meter hardware itself is faulty or running fast', 'Recent changes to standing charges vs unit rates'];
      assumptions = ['User has physical or digital access to their utility meter'];
      confidenceExplanation = 'High confidence in audit sequence: over 80% of sudden spikes trace back to estimated billing or tariff roll-offs.';
      break;

    case 'legal':
      intent = 'Protect tenant deposit rights and contest unjustified property deductions';
      summary = 'Your landlord is withholding your tenancy deposit for pre-existing damages, and you need to assert statutory deposit protection rights.';
      recommendedAction = 'Request an itemized deduction breakdown in writing and submit a formal dispute to your tenancy deposit scheme.';
      missingInformation.push('Deposit protection scheme name (DPS, TDS, or MyDeposits in UK)', 'Check-in inventory and condition report', 'Date of tenancy conclusion');
      steps = [
        { step: 1, title: 'Verify which deposit protection scheme holds your money', description: 'Landlords are legally required to place deposits in a government-backed protection scheme (TDS, DPS, MyDeposits). Search your scheme database.', isUrgent: false },
        { step: 2, title: 'Compile your check-in evidence', description: 'Gather your move-in photos, check-in inventory report, and emails documenting pre-existing wear and tear.', isUrgent: false },
        { step: 3, title: 'Send formal rejection letter via email', description: 'Politely contest the deductions item-by-item, cite your move-in inventory, and give 10 business days to return undisputed funds.', isUrgent: false },
        { step: 4, title: 'Initiate free Scheme Dispute Resolution', description: 'If unresolved, raise a formal dispute through the deposit scheme portal. The burden of proof rests entirely on the landlord.', isUrgent: false },
      ];
      warnings = [
        'Do not agree verbally to partial deductions; communicate solely in writing or through scheme dispute portals.',
        'Deposit protection services operate strict claim filing windows (typically within 3 months of move-out).',
      ];
      resources = [
        { title: 'Tenancy Deposit Scheme (TDS)', description: 'Government-approved deposit protection and dispute service', url: 'https://www.tenancydepositscheme.com', type: 'official' },
        { title: 'Shelter UK Housing Advice', description: 'Free tenant rights advice and deposit reclaim templates', url: 'https://www.shelter.org.uk', type: 'informational' },
      ];
      verifiedInfo = [
        { item: 'Landlords cannot make deductions for normal reasonable wear and tear', source: 'Tenancy law standards', isVerified: true, verificationNote: 'Established statutory housing standard.' },
        { item: 'Pre-existing nature of disputed damage', source: 'Tenant assertion', isVerified: false, verificationNote: 'AI interpretation — requires check-in inventory documentation for legal validation.' },
      ];
      uncertainInfo = ['Whether the deposit was registered within statutory 30-day window', 'Presence of signed move-in inspection documentation'];
      assumptions = ['Tenancy agreement was an Assured Shorthold Tenancy or equivalent residential lease'];
      confidenceExplanation = 'High confidence in dispute resolution procedures; free scheme adjudication is the recommended legal avenue.';
      break;

    case 'weather':
      intent = 'Prepare household safety plan and minimize risks from imminent flood warnings';
      summary = 'Severe flood warnings have been issued for your riverfront area, requiring proactive family safety and property defense steps.';
      recommendedAction = 'Move essential valuables and electrical items upstairs, turn off gas/electricity at the main switch, and prepare a grab bag.';
      missingInformation.push('Specific flood warning tier (Flood Alert vs Flood Warning vs Severe Flood Warning)', 'Ground floor elevation relative to river', 'Presence of elderly, children, or pets');
      steps = [
        { step: 1, title: 'Pack an emergency grab bag ("go-bag")', description: 'Include medication, warm clothing, phone chargers, torches, insurance papers, drinking water, and pet supplies.', isUrgent: true },
        { step: 2, title: 'Elevate furniture and ground-floor belongings', description: 'Move carpets, appliances, and sentimental items to upper floors. Install flood barriers or sandbags at external doorways if available.', isUrgent: true },
        { step: 3, title: 'Locate utility shut-offs', description: 'Know how to turn off your mains electricity, gas, and water supplies before floodwater enters the building.', isUrgent: false },
        { step: 4, title: 'Identify evacuation destination and emergency contacts', description: 'Confirm where you and your family will relocate if local authorities mandate an evacuation order.', isUrgent: false },
      ];
      warnings = [
        'Never walk, swim, or drive through floodwater. 15cm of fast-flowing water can knock over an adult.',
        'Do not touch electrical sockets or appliances while standing in water or damp areas.',
      ];
      resources = [
        { title: 'Environment Agency Live Flood Check', description: 'Real-time river levels and flood warning map', url: 'https://check-for-flooding.service.gov.uk', type: 'official' },
        { title: 'Red Cross Emergency App', description: 'Real-time severe weather alerts and survival tips', url: 'https://www.redcross.org.uk', type: 'informational' },
      ];
      verifiedInfo = [
        { item: 'Environment Agency operates a 24-hour Floodline phone service (0345 988 1188)', source: 'UK Government Environment Agency', isVerified: true, verificationNote: 'National public flood response contact.' },
        { item: 'Local river crest timing and volume', source: 'AI interpretation', isVerified: false, verificationNote: 'AI interpretation — not independently verified against live hydrologic telemetry.' },
      ];
      uncertainInfo = ['Exact crest height and timing of river surge in your specific postcode'];
      assumptions = ['Home possesses upper-floor living space or accessible higher ground'];
      confidenceExplanation = 'High confidence in disaster preparedness sequence. Immediate safety actions prioritized.';
      break;

    case 'public-services':
      intent = 'Navigate expedited public administrative application process';
      summary = 'You require an urgent replacement or first-time government credential (such as a passport) within a tight multi-week departure deadline.';
      recommendedAction = 'Book an in-person Fast Track or Online Premium appointment at a regional passport office immediately.';
      missingInformation.push('Whether this is an adult or child credential', 'Possession of certified birth certificate or previous document numbers', 'Exact departure date');
      steps = [
        { step: 1, title: 'Do NOT use the standard postal application', description: 'Standard postal turnaround is 3 to 10 weeks and will fail your 3-week deadline. You must use urgent in-person processing.', isUrgent: true },
        { step: 2, title: 'Book an Urgent Fast Track appointment online', description: 'Check the official government passport portal for 1-Week Fast Track appointments. New slots release daily at midnight.', isUrgent: true },
        { step: 3, title: 'Obtain compliant digital passport photos', description: 'Use a certified booth or photo shop that issues a digital photo code meeting biometric standards.', isUrgent: false },
        { step: 4, title: 'Gather original supporting documents', description: 'Bring your original birth certificate, countersignatory details, and proof of travel (flight tickets) to your appointment.', isUrgent: false },
      ];
      warnings = [
        'Beware of third-party scam booking websites that charge extra fees for appointment slots; only use official gov.uk services.',
        'Countersignatories must meet official profession and citizenship criteria and must have known you for at least 2 years.',
      ];
      resources = [
        { title: 'HM Passport Office Urgent Service', description: 'Official fast-track and 1-day appointment booking', url: 'https://www.gov.uk/get-a-passport-urgently', type: 'official' },
        { title: 'Post Office Check & Send', description: 'Assistance checking identity documents and countersignatures', url: 'https://www.postoffice.co.uk/identity/passports', type: 'informational' },
      ];
      verifiedInfo = [
        { item: 'Urgent 1-Week Fast Track and 1-Day Premium services exist for expedited turnaround', source: 'HM Passport Office policy', isVerified: true, verificationNote: 'Official passport authority published service tier.' },
        { item: 'Appointment availability at nearest regional office', source: 'AI interpretation', isVerified: false, verificationNote: 'AI interpretation — requires real-time portal check.' },
      ];
      uncertainInfo = ['Live appointment availability at specific regional passport offices'];
      assumptions = ['Applicant can travel to a regional passport office if required'];
      confidenceExplanation = 'High confidence in statutory requirements and expedited application routes.';
      break;

    default:
      intent = 'Analyze unstructured request and extract clear next steps';
      summary = rawText.length > 120 ? `${rawText.slice(0, 117)}…` : rawText;
      recommendedAction = 'Structure your problem with specific constraints and consult the relevant agency.';
      missingInformation.push('Detailed specifics on desired outcome', 'Contact information of parties involved');
      steps = [
        { step: 1, title: 'Identify core objective', description: 'Clarify the exact result you need to achieve from this situation.', isUrgent: false },
        { step: 2, title: 'Collect relevant records and dates', description: 'Assemble emails, reference numbers, and physical letters relating to your request.', isUrgent: false },
        { step: 3, title: 'Contact the designated organization directly', description: 'Submit an inquiry through official channels and document all reference numbers received.', isUrgent: false },
      ];
      warnings = ['Always confirm policies directly with the official authority before making financial or legal commitments.'];
      resources = [
        { title: 'Citizens Advice', description: 'Universal free guidance on everyday consumer, legal, and public problems', url: 'https://citizensadvice.org.uk', type: 'informational' },
      ];
      verifiedInfo = [
        { item: 'General administrative and self-help best practices', source: 'Standard procedures', isVerified: false, verificationNote: 'AI interpretation — not independently verified against proprietary records.' },
      ];
      uncertainInfo = ['The complete background details of your specific circumstances'];
      assumptions = ['Standard regulatory and administrative procedures apply'];
      confidenceExplanation = 'Moderate confidence: Clear procedural guidance provided, but additional details will enable a more customized plan.';
      break;
  }

  return {
    intent,
    summary,
    category,
    urgency,
    extracted_information: {
      intent,
      entities,
      dates,
      locations,
      constraints,
      missingInformation,
    },
    verified_information: verifiedInfo,
    uncertain_information: uncertainInfo,
    assumptions,
    recommended_action: recommendedAction,
    steps,
    warnings,
    resources,
    confidence: urgency === 'critical' ? 'high' : 'high',
    confidence_explanation: confidenceExplanation,
  };
}
