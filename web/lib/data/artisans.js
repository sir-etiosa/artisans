export const TRADES = ["All", "Electrician", "Tailor", "Photographer", "Plumber"];

export const ARTISANS = [
  {
    id: 1, name: "Chinedu Okafor", trade: "Electrician", level: "Professional",
    score: 96, rating: 4.9, jobs: 214, km: 1.2, area: "Surulere, Lagos", rate: "₦15,000 call-out",
    tag: "Solar & full rewiring", years: 9, response: "8 min", repeat: "41%", since: "2019",
    bio: "Licensed electrician with 9 years across residential and commercial wiring — solar installs, inverter setups, CCTV, and full building rewires. I arrive with my badge number and leave with your lights on.",
    certs: ["NABTEB Electrical Certificate", "Solar PV Installer (REA)", "CAC Registered"],
    breakdown: { completion: 98, ratings: 96, response: 92, repeat: 90 },
    portfolio: [
      { c: "#E8DFC9", l: "3-bed duplex rewire" }, { c: "#D6E4DC", l: "5kVA solar install" },
      { c: "#E4E0EE", l: "Office CCTV, 12 cameras" }, { c: "#F0E2D6", l: "Inverter & battery bank" },
    ],
    reviews: [
      { n: "Richard A.", s: 5, d: "May 2026", t: "Booked at 9am, lights fixed by noon. Showed his ID at the gate and itemized the bill. Zero stories." },
      { n: "Mrs. Balogun", s: 5, d: "Apr 2026", t: "Did our solar install and explained every component. Came back at no charge to adjust the inverter settings." },
      { n: "Tobi F.", s: 4, d: "Mar 2026", t: "Great work. Arrived 20 minutes late but communicated ahead in the app chat." },
    ],
  },
  {
    id: 2, name: "Amaka Eze", trade: "Electrician", level: "Professional",
    score: 91, rating: 4.8, jobs: 156, km: 2.8, area: "Yaba, Lagos", rate: "₦12,000 call-out",
    tag: "CCTV & smart home", years: 7, response: "15 min", repeat: "35%", since: "2020",
    bio: "CCTV and smart-home specialist. Cameras, doorbells, and access control that still work when you're abroad checking your phone at 2am.",
    certs: ["Trade Test Grade 1", "Hikvision Certified"],
    breakdown: { completion: 95, ratings: 94, response: 86, repeat: 84 },
    portfolio: [
      { c: "#D6E4DC", l: "Estate access control" }, { c: "#E8DFC9", l: "16-camera warehouse CCTV" },
      { c: "#F0E2D6", l: "Smart doorbell & locks" }, { c: "#E4E0EE", l: "Shop alarm system" },
    ],
    reviews: [
      { n: "Ada N.", s: 5, d: "Jun 2026", t: "Installed cameras across two event venues. Clean cabling, app fully set up before she left." },
      { n: "Kunle O.", s: 5, d: "May 2026", t: "Fast response, fair price, tidy work." },
    ],
  },
  {
    id: 3, name: "Hauwa Sani", trade: "Tailor", level: "Professional",
    score: 94, rating: 4.9, jobs: 302, km: 0.9, area: "Ikeja, Lagos", rate: "From ₦25,000",
    tag: "Agbada & bridal", years: 12, response: "10 min", repeat: "58%", since: "2019",
    bio: "Master tailor, 12 years. Agbada, kaftans, and bridal aso-ebi coordination for parties of up to 40. Measurements at your home or my studio. Delivery dates are contracts, not suggestions.",
    certs: ["City & Guilds Fashion", "CAC Registered"],
    breakdown: { completion: 99, ratings: 97, response: 90, repeat: 95 },
    portfolio: [
      { c: "#E4E0EE", l: "Groom's agbada set" }, { c: "#F0E2D6", l: "Bridal train, 24 outfits" },
      { c: "#E8DFC9", l: "Senator kaftan" }, { c: "#D6E4DC", l: "Corporate uniforms ×60" },
    ],
    reviews: [
      { n: "Emeka N.", s: 5, d: "Jun 2026", t: "Delivered my wedding agbada four days early. Fit like it was painted on." },
      { n: "Funke A.", s: 5, d: "May 2026", t: "Handled 24 aso-ebi outfits without a single mix-up. Unheard of." },
      { n: "Sadiq M.", s: 4, d: "Apr 2026", t: "Beautiful work. Slightly pricey, but you get what you pay for." },
    ],
  },
  {
    id: 4, name: "Tunde Bello", trade: "Electrician", level: "Intermediate",
    score: 84, rating: 4.7, jobs: 88, km: 4.1, area: "Gbagada, Lagos", rate: "₦8,000 call-out",
    tag: "Home wiring & repairs", years: 4, response: "25 min", repeat: "22%", since: "2022",
    bio: "Residential wiring, socket and fitting repairs, distribution board upgrades. Honest pricing for everyday electrical problems.",
    certs: ["Trade Test Grade 2"],
    breakdown: { completion: 92, ratings: 90, response: 78, repeat: 70 },
    portfolio: [
      { c: "#D6E4DC", l: "DB board upgrade" }, { c: "#E8DFC9", l: "Kitchen rewiring" },
      { c: "#E4E0EE", l: "Fittings, 2-bed flat" }, { c: "#F0E2D6", l: "Prepaid meter wiring" },
    ],
    reviews: [
      { n: "Chika U.", s: 5, d: "Jun 2026", t: "Fixed what two other electricians couldn't find. Fair price." },
      { n: "Mr. Peters", s: 4, d: "May 2026", t: "Good job on the DB board. Would book again." },
    ],
  },
  {
    id: 5, name: "Bisi Lawal", trade: "Photographer", level: "Professional",
    score: 95, rating: 4.9, jobs: 189, km: 2.1, area: "Lekki, Lagos", rate: "From ₦80,000/day",
    tag: "Weddings & events", years: 8, response: "12 min", repeat: "44%", since: "2019",
    bio: "Wedding and event photographer. Two shooters, same-day previews, full gallery in seven days. Your grandmother will frame these.",
    certs: ["Canon Professional Partner", "CAC Registered"],
    breakdown: { completion: 97, ratings: 96, response: 88, repeat: 91 },
    portfolio: [
      { c: "#F0E2D6", l: "Traditional wedding, Ikoyi" }, { c: "#E4E0EE", l: "Fashion product shoot" },
      { c: "#E8DFC9", l: "60th birthday" }, { c: "#D6E4DC", l: "Corporate gala" },
    ],
    reviews: [
      { n: "The Adeyemis", s: 5, d: "Jun 2026", t: "Previews before the reception ended. Guests were re-posting all night." },
      { n: "Zara B.", s: 5, d: "Apr 2026", t: "Product photos doubled our store conversion. Not exaggerating." },
    ],
  },
  {
    id: 6, name: "Sola Adeniyi", trade: "Plumber", level: "Professional",
    score: 93, rating: 4.9, jobs: 268, km: 1.5, area: "Surulere, Lagos", rate: "₦10,000 call-out",
    tag: "24/7 emergency leaks", years: 11, response: "6 min", repeat: "39%", since: "2019",
    bio: "24/7 emergency plumbing — burst pipes, pumping machines, bathroom fit-outs, boreholes. If water is where it shouldn't be, call before it becomes a swimming pool.",
    certs: ["Trade Test Grade 1", "CAC Registered"],
    breakdown: { completion: 98, ratings: 97, response: 95, repeat: 87 },
    portfolio: [
      { c: "#D6E4DC", l: "Full bathroom fit-out" }, { c: "#E8DFC9", l: "Borehole & tank system" },
      { c: "#F0E2D6", l: "Estate pumping machine" }, { c: "#E4E0EE", l: "Burst mains, 2am rescue" },
    ],
    reviews: [
      { n: "Landlord, Bode St.", s: 5, d: "Jun 2026", t: "2am burst pipe, he arrived in 25 minutes. Saved my ceiling and my tenants' patience." },
      { n: "Ifeoma K.", s: 5, d: "May 2026", t: "Fixed a leak three plumbers 'fixed' before. It stayed fixed." },
    ],
  },
];

export const getArtisan = (id) => ARTISANS.find((a) => String(a.id) === String(id));
