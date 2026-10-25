import { FormEvent, useEffect, useMemo, useRef, useState } from "react"

type Item = {
  id: string
  name: string
  category: string
  occasion: string
  price: number
  guarantee: number
  distance: number
  lender: string
  neighborhood: string
  image: string
  description: string
  condition: string
  accessories: string
  care: string
  sharingOption?: "free" | "fixed" | "wish"
  brand?: string
  color?: string
  availability?: string
  keywords?: string
  source?: "seeded" | "community"
  careInstructions?: string[]
  customCare?: string
  ownerId?: string
  available?: boolean
}

type Request = {
  id: string
  itemId: string
  start: string
  end: string
  days: number
  status: "Pending approval" | "Upcoming" | "Active" | "Completed" | "Declined"
  borrowerId?: string
  borrowerName?: string
}

type CommunityRequest = {
  id: string
  item: string
  posted: string
  neighborhood: string
  status: "Open" | "Fulfilled" | "Closed"
  responses: number
  owner: "current"
}

const photos = {
  pickle:
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85",
  hike: "https://images.unsplash.com/photo-1649429710616-dad56ce9a076?auto=format&fit=crop&w=1200&q=85",
  guitar:
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=85",
  vacuum:
    "https://images.unsplash.com/photo-1758273705792-a2887e079e83?auto=format&fit=crop&w=1200&q=85",
  steamer:
    "https://images.unsplash.com/photo-1732605556119-cefb5faaf313?auto=format&fit=crop&w=1200&q=85",
  karaoke:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85",
  projector:
    "https://images.unsplash.com/photo-1589113050289-1c654e7e305d?auto=format&fit=crop&w=1200&q=85",
  party:
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85",
}

const seedItems: Item[] = [
  {
    id: "pickle",
    name: "Pickleball paddle set",
    category: "Sports & Outdoors",
    occasion: "Try Something New",
    price: 5,
    guarantee: 25,
    distance: 0.4,
    lender: "Maya",
    neighborhood: "Hamilton Park",
    image: photos.pickle,
    description:
      "A beginner-friendly set of two lightweight paddles, balls, and a carrying case. Perfect for trying your first game at the nearby courts.",
    condition: "Excellent",
    accessories: "2 paddles, 4 outdoor balls, carry case",
    care: "Keep the paddles dry and return all balls in the case.",
  },
  {
    id: "hike",
    name: "Hiking poles",
    category: "Sports & Outdoors",
    occasion: "Plan an Adventure",
    price: 0,
    guarantee: 20,
    distance: 0.7,
    lender: "Noah",
    neighborhood: "The Heights",
    image: photos.hike,
    description: "Adjustable trekking poles for weekend trails and day hikes.",
    condition: "Good",
    accessories: "Pair of poles, rubber tips",
    care: "Wipe off mud before returning.",
  },
  {
    id: "guitar",
    name: "Acoustic guitar",
    category: "Musical Instruments",
    occasion: "Try Something New",
    price: 8,
    guarantee: 60,
    distance: 1.1,
    lender: "Elena",
    neighborhood: "Paulus Hook",
    image: photos.guitar,
    description:
      "Warm-sounding full-size acoustic guitar for practice or a casual jam.",
    condition: "Very good",
    accessories: "Padded case, tuner, picks",
    care: "Always store in its case when not in use.",
  },
  {
    id: "vacuum",
    name: "Dyson cordless vacuum",
    category: "Home Essentials",
    occasion: "Get Things Done",
    price: 10,
    guarantee: 50,
    distance: 1.4,
    lender: "Sam",
    neighborhood: "Newport",
    image: photos.vacuum,
    description:
      "Powerful cordless vacuum with attachments for floors and furniture.",
    condition: "Excellent",
    accessories: "Charger, crevice tool, brush head",
    care: "Empty the bin after use and return fully charged.",
  },
  {
    id: "steamer",
    name: "Heavy-duty garment steamer",
    category: "Home Essentials",
    occasion: "Get Things Done",
    price: 7,
    guarantee: 35,
    distance: 1.8,
    lender: "Priya",
    neighborhood: "Journal Square",
    image: photos.steamer,
    description:
      "Fast upright steamer for event outfits, curtains, and linens.",
    condition: "Good",
    accessories: "Hanger, fabric brush, glove",
    care: "Empty the water reservoir before returning.",
  },
  {
    id: "karaoke",
    name: "Karaoke machine",
    category: "Party Essentials",
    occasion: "Host a Gathering",
    price: 15,
    guarantee: 75,
    distance: 2.1,
    lender: "Jordan",
    neighborhood: "Bergen-Lafayette",
    image: photos.karaoke,
    description: "Portable party speaker with two wireless microphones.",
    condition: "Very good",
    accessories: "2 microphones, charging cable",
    care: "Keep indoors and charge before return.",
  },
  {
    id: "projector",
    name: "Portable projector",
    category: "Tech & Creative",
    occasion: "Host a Gathering",
    price: 12,
    guarantee: 60,
    distance: 2.5,
    lender: "Theo",
    neighborhood: "Downtown",
    image: photos.projector,
    description: "Compact HD projector for movie nights and presentations.",
    condition: "Excellent",
    accessories: "Remote, HDMI cable, stand",
    care: "Let it cool before packing.",
  },
  {
    id: "party",
    name: "Party decor kit",
    category: "Party Essentials",
    occasion: "Host a Gathering",
    price: 6,
    guarantee: 20,
    distance: 3.2,
    lender: "Amina",
    neighborhood: "McGinley Square",
    image: photos.party,
    description:
      "Reusable neutral-toned celebration decor for an easy gathering.",
    condition: "Very good",
    accessories: "Banner, table decor, 2 light strands",
    care: "Pack each piece into the labeled pouch.",
  },
]

const addedSeedItems: Item[] = [
  [
    "tennis-racket",
    "Tennis racket",
    "Sports & Outdoors",
    6,
    30,
    0.8,
    "Riley",
    "Hamilton Park",
    "https://images.unsplash.com/photo-1687102618656-907b757ad5d9?auto=format&fit=crop&w=1200&q=85",
    "A lightweight adult racket for casual matches and practice.",
    "Excellent",
    "Racket cover and three tennis balls",
    "Return dry and stored in its cover.",
    "Available this week",
    "tennis racquet court sport",
  ],
  [
    "picnic-table",
    "Portable picnic table",
    "Sports & Outdoors",
    0,
    35,
    1.2,
    "Casey",
    "The Heights",
    "https://images.unsplash.com/photo-1647438027187-68381264f7e0?auto=format&fit=crop&w=1200&q=85",
    "A compact folding table for park lunches and outdoor gatherings.",
    "Good",
    "Folding table with carry handle",
    "Wipe clean and return fully dry.",
    "Available weekends",
    "folding outdoor picnic table",
  ],
  [
    "badminton-net",
    "Badminton net",
    "Sports & Outdoors",
    5,
    30,
    1.6,
    "Nina",
    "Downtown",
    "https://images.unsplash.com/photo-1622669253059-e345500cf0e9?auto=format&fit=crop&w=1200&q=85",
    "Portable net set for backyard or park badminton games.",
    "Very good",
    "Net, poles, stakes and storage bag",
    "Count all stakes before packing.",
    "Available this weekend",
    "badminton net racquets shuttlecock",
  ],
  [
    "fiddle",
    "Fiddle",
    "Musical Instruments",
    7,
    55,
    1.0,
    "Mae",
    "Journal Square",
    "https://images.unsplash.com/photo-1549583736-a12947657c38?auto=format&fit=crop&w=1200&q=85",
    "A warm-toned fiddle suited to folk practice and beginner sessions.",
    "Good",
    "Bow, rosin and hard case",
    "Loosen the bow after playing and store in the case.",
    "Available after Tuesday",
    "fiddle folk violin bow",
  ],
  [
    "portable-drums",
    "Portable drum kit",
    "Musical Instruments",
    12,
    80,
    2.0,
    "Andre",
    "Bergen-Lafayette",
    "https://images.unsplash.com/photo-1669155976051-c6962e77ffd7?auto=format&fit=crop&w=1200&q=85",
    "Compact electronic drum kit for apartment-friendly practice.",
    "Very good",
    "Pads, pedals, sticks, headphones and power supply",
    "Use headphones after 9 PM and pack cables separately.",
    "Available this week",
    "electronic portable drums percussion",
  ],
  [
    "violin",
    "Violin",
    "Musical Instruments",
    9,
    70,
    1.7,
    "Sofia",
    "Paulus Hook",
    "https://images.unsplash.com/photo-1591828208838-f30aa90534ee?auto=format&fit=crop&w=1200&q=85",
    "Full-size student violin for lessons, rehearsal or a first try.",
    "Excellent",
    "Bow, rosin, shoulder rest and case",
    "Wipe strings after use and keep away from heat.",
    "Available next week",
    "violin strings orchestra instrument",
  ],
  [
    "table-mats",
    "Table mats",
    "Party Essentials",
    0,
    15,
    0.6,
    "June",
    "Hamilton Park",
    "https://images.unsplash.com/photo-1791432320880-09c8b059857c?auto=format&fit=crop&w=1200&q=85",
    "Set of twelve woven place mats for dinners and celebrations.",
    "Very good",
    "12 matching woven mats",
    "Spot clean only and return completely dry.",
    "Available now",
    "placemats dining table settings",
  ],
  [
    "extra-chairs",
    "Extra chairs",
    "Party Essentials",
    8,
    40,
    1.3,
    "Omar",
    "McGinley Square",
    "https://images.unsplash.com/photo-1708530708513-81e715632c4b?auto=format&fit=crop&w=1200&q=85",
    "Six sturdy folding chairs for extra guests.",
    "Good",
    "6 folding chairs",
    "Fold and stack securely after use.",
    "Available weekends",
    "folding chairs seating guests",
  ],
  [
    "foldable-table",
    "Foldable table",
    "Party Essentials",
    7,
    35,
    1.9,
    "Lena",
    "The Heights",
    "https://images.unsplash.com/photo-1775208019219-a67bad1e8810?auto=format&fit=crop&w=1200&q=85",
    "Six-foot folding table for food service, crafts or gatherings.",
    "Good",
    "Table and fitted carry cover",
    "Clean spills promptly and lock legs before use.",
    "Available this weekend",
    "folding banquet table party",
  ],
  [
    "balloon-machine",
    "Balloon machine",
    "Party Essentials",
    10,
    45,
    2.2,
    "Dev",
    "Newport",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1200&q=85",
    "Electric balloon inflator for quickly preparing party decorations.",
    "Excellent",
    "Inflator, two nozzles and extension cord",
    "Use indoors and allow the motor to cool between batches.",
    "Available Friday onward",
    "balloon inflator pump decorations",
  ],
  [
    "bubble-machine",
    "Bubble machine",
    "Party Essentials",
    9,
    40,
    2.5,
    "Tara",
    "Downtown",
    "https://images.unsplash.com/photo-1633368516457-e716168f66b0?auto=format&fit=crop&w=1200&q=85",
    "Portable bubble machine for birthdays and outdoor gatherings.",
    "Very good",
    "Machine, power adapter and starter solution",
    "Use outdoors and empty solution before return.",
    "Available this weekend",
    "automatic bubbles party children",
  ],
  [
    "party-cooler",
    "Portable insulated cooler/freezer",
    "Party Essentials",
    11,
    60,
    2.8,
    "Malik",
    "Bergen-Lafayette",
    "https://images.unsplash.com/photo-1550720295-a59523cb8872?auto=format&fit=crop&w=1200&q=85",
    "Large insulated rolling cooler for drinks, picnics and event food.",
    "Very good",
    "Cooler, removable divider and drain plug",
    "Wash, dry and leave the lid open after use.",
    "Available next weekend",
    "ice chest insulated freezer drinks",
  ],
  [
    "small-ladder",
    "Small ladder",
    "Home Essentials",
    0,
    25,
    0.9,
    "Eli",
    "Hamilton Park",
    "https://images.unsplash.com/photo-1582457341512-8b581de6f4c4?auto=format&fit=crop&w=1200&q=85",
    "Compact folding step ladder for shelves and simple home tasks.",
    "Good",
    "Three-step folding ladder",
    "Use on a level floor and return clean.",
    "Available now",
    "step stool ladder household",
  ],
  [
    "steam-iron",
    "Steam iron",
    "Home Essentials",
    4,
    20,
    1.5,
    "Inez",
    "Journal Square",
    "https://images.unsplash.com/photo-1787361253061-9552f340e076?auto=format&fit=crop&w=1200&q=85",
    "Adjustable steam iron for clothing, linens and sewing projects.",
    "Excellent",
    "Iron, water cup and heat-safe rest",
    "Empty the reservoir and allow to cool before packing.",
    "Available this week",
    "clothes steam iron ironing",
  ],
  [
    "moving-boxes",
    "Moving boxes",
    "Home Essentials",
    0,
    10,
    2.1,
    "Ben",
    "Newport",
    `${import.meta.env.BASE_URL}moving-boxes.jpg`,
    "A reusable bundle of sturdy boxes for a local move.",
    "Good",
    "12 assorted boxes and packing labels",
    "Keep boxes dry and flatten them after use.",
    "Available through month-end",
    "cardboard moving packing boxes",
  ],
].map(
  ([
    id,
    name,
    category,
    price,
    guarantee,
    distance,
    lender,
    neighborhood,
    image,
    description,
    condition,
    accessories,
    care,
    availability,
    keywords,
  ]) => ({
    id: String(id),
    name: String(name),
    category: String(category),
    occasion:
      category === "Party Essentials"
        ? "Host a Gathering"
        : category === "Home Essentials"
          ? "Get Things Done"
          : category === "Sports & Outdoors"
            ? "Plan an Adventure"
            : "Try Something New",
    price: Number(price),
    guarantee: Number(guarantee),
    distance: Number(distance),
    lender: String(lender),
    neighborhood: String(neighborhood),
    image: String(image),
    description: String(description),
    condition: String(condition),
    accessories: String(accessories),
    care: String(care),
    availability: String(availability),
    keywords: String(keywords),
    sharingOption: Number(price) === 0 ? "free" : "fixed",
    source: "seeded",
  }),
)
seedItems.push(...addedSeedItems)

const categories = [
  "All categories",
  "Sports & Outdoors",
  "Home Essentials",
  "Musical Instruments",
  "Party Essentials",
  "Tech & Creative",
  "Tools & DIY",
]
const interests = [
  "Trying new hobbies",
  "Sports & outdoors",
  "Hosting occasions",
  "Home essentials",
  "Music & creativity",
  "Sharing my belongings",
]
const currentUserId = "user-jamie"
// Neighbors used to simulate incoming borrow requests on the current user's listings
const demoNeighbors = ["Ana", "Ben", "Chloe", "Dev", "Ines", "Marcus"]
const isMyBorrow = (request: Request) =>
  !request.borrowerId || request.borrowerId === currentUserId

function daysBetween(a: string, b: string) {
  if (!a || !b) return 0
  return Math.max(
    0,
    Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1,
  )
}

function contributionLabel(item: Item) {
  if (item.sharingOption === "wish") return "Pay what you wish"
  if (item.sharingOption === "free" || !item.price) return "Free to borrow"
  return `$${item.price}/day`
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <>
      <img
        className="brand-mark"
        src={`${import.meta.env.BASE_URL}goodshare-g-mark.svg`}
        alt=""
        aria-hidden="true"
      />
      <span className={inverse ? "brand-word inverse-word" : "brand-word"}>
        goodshare.
      </span>
    </>
  )
}

type IconName = "bike" | "house" | "guitar" | "party" | "camera" | "wrench" | "map-pin" | "chevron-down" | "search" | "calendar" | "shield" | "shield-check" | "clipboard-check" | "users" | "heart"

function LucideIcon({
  name,
  className,
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    bike: (
      <>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <circle cx="15" cy="5" r="1" />
        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
        <path d="m8.5 17.5 3.5-7 3 7" />
      </>
    ),
    house: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    guitar: (
      <>
        <path d="m11.9 12.1 4.5-4.5" />
        <path d="m15.5 4.5 4 4" />
        <path d="M8.7 11.3c-1.4-.5-3-.1-4 1-1.7 1.7-1.7 4.4 0 6.1s4.4 1.7 6.1 0c1.1-1.1 1.5-2.6 1-4l2.1-2.1-3.1-3.1-2.1 2.1Z" />
        <circle cx="7.7" cy="15.4" r="1.3" />
        <path d="m18.4 3.6 2 2" />
      </>
    ),
    party: (
      <>
        <path d="m3 21 3.8-10.7L13.7 17 3 21Z" />
        <path d="m6.8 10.3 6.9 6.7" />
        <path d="M14 4h.01M20 8h.01M18 2v2M22 4h-2M15 8c0-2 1-3 3-3M11 3c2 0 3 1 3 3" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    wrench: (
      <path d="M21 3a6 6 0 0 1-7.7 7.7L5.2 18.8a2 2 0 1 1-2.8-2.8l8.1-8.1A6 6 0 0 1 18 2l-3.5 3.5 4 4L22 6a6 6 0 0 1-1 3.3" />
    ),
    "map-pin": (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4M16 2v4M3 9h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    "shield-check": (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    "clipboard-check": (
      <>
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    heart: (
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    ),
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function DateRangePicker({
  start,
  end,
  setStart,
  setEnd,
}: {
  start: string
  end: string
  setStart: (value: string) => void
  setEnd: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const initial = start ? new Date(`${start}T00:00:00`) : new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const toValue = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const rangeLabel =
    start && end
      ? `${new Date(`${start}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${new Date(`${end}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : start
        ? `${new Date(`${start}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })} – Select return`
        : "Add dates"
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = new Date(firstDay)
  gridStart.setDate(1 - firstDay.getDay())
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return date
  })

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", escape)
    }
  }, [])

  const selectDate = (date: Date) => {
    const value = toValue(date)
    if (!start || end) {
      setStart(value)
      setEnd("")
    } else if (value >= start) {
      setEnd(value)
      setOpen(false)
    } else {
      setStart(value)
      setEnd("")
    }
  }

  return (
    <div className="range-picker" ref={rootRef}>
      <span className="range-label">Dates</span>
      <button
        type="button"
        className="range-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        <LucideIcon name="calendar" />
        <span>{rangeLabel}</span>
      </button>
      {open && (
        <div
          className="calendar-popover"
          role="dialog"
          aria-label="Choose dates"
        >
          <div className="calendar-head">
            <button
              type="button"
              aria-label="Previous month"
              disabled={
                month.getFullYear() === today.getFullYear() &&
                month.getMonth() === today.getMonth()
              }
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <strong>
              {month.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </strong>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>
          <div className="calendar-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day.slice(0, 1)}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((date) => {
              const value = toValue(date)
              const outside = date.getMonth() !== month.getMonth()
              const inRange = Boolean(
                start && end && value > start && value < end,
              )
              const selected = value === start || value === end
              return (
                <button
                  type="button"
                  key={value}
                  disabled={date < today}
                  className={`${outside ? "outside" : ""} ${
                    inRange ? "in-range" : ""
                  } ${selected ? "selected" : ""}`}
                  aria-label={date.toLocaleDateString()}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <div className="calendar-actions">
            <button
              type="button"
              onClick={() => {
                setStart("")
                setEnd("")
              }}
            >
              Clear dates
            </button>
            <span>
              {start && !end
                ? "Now choose a return date"
                : "Select pickup and return"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

type DropdownOption = {
  value: string
  label: string
  disabled?: boolean
}

function Dropdown({
  options,
  value,
  defaultValue = "",
  onChange,
  name,
  required,
  ariaLabel,
  disabled,
}: {
  options: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  name?: string
  required?: boolean
  ariaLabel?: string
  disabled?: boolean
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedValue = value === undefined ? internalValue : value
  const selected = options.find((option) => option.value === selectedValue)
  const enabledOptions = options.filter((option) => !option.disabled)

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const choose = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
    setOpen(false)
  }
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false)
      return
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setHighlighted((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1
        return (
          (current + direction + enabledOptions.length) % enabledOptions.length
        )
      })
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (open) choose(enabledOptions[highlighted]?.value)
      else setOpen(true)
    }
  }

  return (
    <div className="custom-select" ref={rootRef}>
      {name && (
        <input
          className="select-value-proxy"
          name={name}
          value={selectedValue}
          required={required}
          readOnly
          tabIndex={-1}
        />
      )}
      <button
        className="select-trigger"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
      >
        <span>{selected?.label || "Select an option"}</span>
        <span className="select-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <div className="select-menu" role="listbox">
          {options.map((option) => {
            const activeIndex = enabledOptions.findIndex(
              (enabled) => enabled.value === option.value,
            )
            const isSelected = option.value === selectedValue
            return (
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={
                  activeIndex === highlighted ? "highlighted" : undefined
                }
                disabled={option.disabled}
                key={option.value}
                onMouseEnter={() =>
                  !option.disabled && setHighlighted(activeIndex)
                }
                onClick={() => choose(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <b aria-hidden="true">✓</b>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem("goodshare-onboarded") === "true",
  )
  const [step, setStep] = useState(0)
  const [page, setPage] =
    useState<"explore" | "results" | "item" | "request" | "activity" | "share" | "community" | "profile" | "settings" | "help" | "contact" | "guidelines" | "privacy" | "terms">(
      "explore",
    )
  const [location, setLocation] = useState(
    () =>
      localStorage.getItem("goodshare-location") ||
      "Hamilton Park, Jersey City",
  )
  const [radius, setRadius] = useState(3)
  const [chosenInterests, setChosenInterests] = useState<string[]>([])
  const [items, setItems] = useState<Item[]>(() => {
    const saved: Item[] | null = JSON.parse(
      localStorage.getItem("goodshare-items") || "null",
    )
    if (!saved)
      return seedItems.map((item) => ({
        ...item,
        ownerId: `seed-owner-${item.lender.toLowerCase()}`,
        available: true,
      }))
    const normalized = saved.map((item) => {
      const currentSeed = seedItems.find((seed) => seed.id === item.id)
      return {
        ...(currentSeed || item),
        ...item,
        category:
          item.category === "Musical Instruments"
            ? "Musical Instruments"
            : item.category === "Party Essentials"
              ? "Party Essentials"
              : item.category,
        image: currentSeed?.image || item.image,
        availability: item.availability || "Available this week",
        source: item.id.startsWith("user-") ? "community" : "seeded",
        ownerId:
          item.ownerId ||
          (item.id.startsWith("user-")
            ? currentUserId
            : `seed-owner-${item.lender.toLowerCase()}`),
        available: item.available !== false,
      } as Item
    })
    return [
      ...normalized,
      ...seedItems.filter(
        (seed) => !normalized.some((item) => item.id === seed.id),
      ),
    ]
  })
  const [requests, setRequests] = useState<Request[]>(() =>
    JSON.parse(localStorage.getItem("goodshare-requests") || "[]"),
  )
  const [communityRequests, setCommunityRequests] =
    useState<CommunityRequest[]>(() =>
      JSON.parse(localStorage.getItem("goodshare-community-requests") || "[]"),
    )
  const [activityTab, setActivityTab] =
    useState<"Borrowing" | "Lending" | "My Requests">("Borrowing")
  const [selectedId, setSelectedId] = useState("pickle")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string[]>([])
  const [occasion, setOccasion] = useState<string[]>([])
  const [sharingModels, setSharingModels] = useState<string[]>([])
  const [maxGuarantee, setMaxGuarantee] = useState(100)
  const [sort, setSort] = useState("nearest")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [notice, setNotice] = useState("")
  const [menu, setMenu] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [readNotifications, setReadNotifications] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("goodshare-read-notifications") || "[]"),
  )

  useEffect(
    () => localStorage.setItem("goodshare-items", JSON.stringify(items)),
    [items],
  )
  useEffect(
    () => localStorage.setItem("goodshare-requests", JSON.stringify(requests)),
    [requests],
  )
  useEffect(
    () =>
      localStorage.setItem(
        "goodshare-community-requests",
        JSON.stringify(communityRequests),
      ),
    [communityRequests],
  )
  useEffect(
    () =>
      localStorage.setItem(
        "goodshare-read-notifications",
        JSON.stringify(readNotifications),
      ),
    [readNotifications],
  )
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3000)
      return () => clearTimeout(t)
    }
  }, [notice])
  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", closeMenu)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeMenu)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  const selected = items.find((i) => i.id === selectedId) || items[0]
  const filtered = useMemo(() => {
    let list = items.filter(
      (i) =>
        (!query ||
          [i.name, i.category, i.description, i.keywords || ""]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!category.length || category.includes(i.category)) &&
        (!occasion.length || occasion.includes(i.occasion)) &&
        i.available !== false &&
        i.distance <= radius &&
        (!sharingModels.length ||
          sharingModels.includes(
            i.sharingOption || (i.price === 0 ? "free" : "fixed"),
          )) &&
        (location.toLowerCase().includes("jersey city") ||
          i.neighborhood.toLowerCase().includes(location.toLowerCase())) &&
        i.guarantee <= maxGuarantee &&
        (!start ||
          !end ||
          !requests.some(
            (request) =>
              request.itemId === i.id &&
              ["Upcoming", "Active"].includes(request.status) &&
              start <= request.end &&
              end >= request.start,
          )),
    )
    return [...list].sort((a, b) =>
      sort === "lowest"
        ? a.price - b.price
        : sort === "recent"
          ? b.id.localeCompare(a.id)
          : a.distance - b.distance,
    )
  }, [
    items,
    query,
    category,
    occasion,
    radius,
    sharingModels,
    maxGuarantee,
    sort,
    location,
    start,
    end,
    requests,
  ])

  const notifications = requests.map((request) => {
    const item = items.find((i) => i.id === request.itemId)
    const neighbor = request.borrowerName || "A neighbor"
    const copy = !isMyBorrow(request)
      ? request.status === "Pending approval"
        ? `${neighbor} requested to borrow ${item?.name}.`
        : request.status === "Upcoming"
          ? `You approved ${neighbor}'s request for ${item?.name}.`
          : request.status === "Declined"
            ? `You declined ${neighbor}'s request for ${item?.name}.`
            : request.status === "Active"
              ? `${neighbor} picked up ${item?.name}.`
              : `${neighbor} returned ${item?.name}. Thanks for sharing!`
      : request.status === "Pending approval"
        ? `Borrowing request sent for ${item?.name}`
        : request.status === "Upcoming"
          ? `${item?.name} was approved. Remember your pickup date.`
          : request.status === "Declined"
            ? `Your request for ${item?.name} was declined.`
            : request.status === "Active"
              ? `${item?.name} was picked up. Return it as agreed.`
              : `Return completed for ${item?.name}.`
    return {
      id: `${request.id}-${request.status}`,
      copy,
      status: request.status,
    }
  })
  const unreadCount = notifications.filter(
    (notification) => !readNotifications.includes(notification.id),
  ).length

  const navigate = (p: typeof page) => {
    setPage(p)
    setMenu(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const openItem = (id: string) => {
    setSelectedId(id)
    navigate("item")
  }
  const showAllListings = () => {
    setQuery("")
    setCategory([])
    setOccasion([])
    setRadius(10)
    setSharingModels([])
    setMaxGuarantee(100)
    navigate("results")
  }
  const doSearch = (e?: FormEvent) => {
    e?.preventDefault()
    navigate("results")
  }
  const finishOnboarding = () => {
    localStorage.setItem("goodshare-onboarded", "true")
    localStorage.setItem("goodshare-location", location)
    setOnboarded(true)
  }
  const submitRequest = () => {
    if (selected.ownerId === currentUserId) {
      setNotice("You cannot request to borrow your own listing.")
      return
    }
    if (selected.available === false) {
      setNotice("This listing is currently unavailable.")
      return
    }
    const days = daysBetween(start, end)
    if (!days) {
      setNotice("Choose a valid pickup and return date.")
      return
    }
    if (!agreed) {
      setNotice("Please acknowledge the borrowing agreement.")
      return
    }
    setRequests((r) => [
      ...r,
      {
        id: Date.now().toString(),
        itemId: selected.id,
        start,
        end,
        days,
        status: "Pending approval",
        borrowerId: currentUserId,
      },
    ])
    setNotice("Request sent to " + selected.lender)
    navigate("activity")
  }
  const updateRequest = (id: string, status: Request["status"]) =>
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status } : x)))
  const simulateNeighborRequest = (item: Item) => {
    const name = demoNeighbors[Math.floor(Math.random() * demoNeighbors.length)]
    const start = new Date()
    const end = new Date(start)
    end.setDate(start.getDate() + 2)
    setRequests((r) => [
      ...r,
      {
        id: Date.now().toString(),
        itemId: item.id,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        days: 2,
        status: "Pending approval",
        borrowerId: `neighbor-${name.toLowerCase()}`,
        borrowerName: name,
      },
    ])
    setNotice(`${name} requested to borrow your ${item.name}.`)
  }
  const updateItem = (id: string, changes: Partial<Item>) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    )
  const editItem = (item: Item) => {
    const name = prompt("Item name", item.name)
    if (!name?.trim()) return
    const description = prompt("Description", item.description)
    if (description === null) return
    updateItem(item.id, { name: name.trim(), description: description.trim() })
    setNotice("Listing updated.")
  }

  if (!onboarded)
    return (
      <Onboarding
        step={step}
        setStep={setStep}
        location={location}
        setLocation={setLocation}
        radius={radius}
        setRadius={setRadius}
        chosen={chosenInterests}
        setChosen={setChosenInterests}
        finish={finishOnboarding}
      />
    )

  return (
    <div className="app">
      <header>
        <button className="brand" onClick={() => navigate("explore")}>
          <Logo />
        </button>
        <nav className={menu ? "open" : ""}>
          <button onClick={showAllListings}>Explore</button>
          <button onClick={() => navigate("community")}>Community</button>
          <button onClick={() => navigate("activity")}>My Shares</button>
        </nav>
        <div className="nav-actions">
          <div className="notification-wrap" ref={notificationsRef}>
            <button
              className="notification-button"
              aria-label={`Notifications${
                unreadCount ? `, ${unreadCount} unread` : ""
              }`}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <svg
                className="bell-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {unreadCount > 0 && <b>{unreadCount}</b>}
            </button>
            {notificationsOpen && (
              <div className="notification-panel">
                <div>
                  <strong>Notifications</strong>
                  {unreadCount > 0 && (
                    <button
                      onClick={() =>
                        setReadNotifications(notifications.map((n) => n.id))
                      }
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length ? (
                  notifications.map((notification) => (
                    <button
                      className={
                        readNotifications.includes(notification.id)
                          ? "read"
                          : ""
                      }
                      key={notification.id}
                      onClick={() =>
                        setReadNotifications((ids) => [
                          ...new Set([...ids, notification.id]),
                        ])
                      }
                    >
                      <b>{notification.status}</b>
                      <span>{notification.copy}</span>
                    </button>
                  ))
                ) : (
                  <p>
                    No notifications yet. Updates from your activity will appear
                    here.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              className="profile"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              JS
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <button
                  onClick={() => {
                    navigate("profile")
                    setProfileOpen(false)
                  }}
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate("settings")
                    setProfileOpen(false)
                  }}
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate("help")
                    setProfileOpen(false)
                  }}
                >
                  Help &amp; Support
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("goodshare-onboarded", "false")
                    setOnboarded(false)
                    setProfileOpen(false)
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          className="hamburger"
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
        >
          ☰
        </button>
      </header>
      {notice && <div className="toast">{notice}</div>}

      {page === "explore" && (
        <Explore
          query={query}
          setQuery={setQuery}
          search={doSearch}
          location={location}
          items={items.filter((item) => item.available !== false)}
          openItem={openItem}
          chooseOccasion={(o) => {
            setOccasion([o])
            navigate("results")
          }}
          chooseCategory={(c) => {
            setCategory([c])
            navigate("results")
          }}
          setLocation={setLocation}
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          share={() => navigate("share")}
        />
      )}
      {page === "results" && (
        <Results
          items={filtered}
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          occasion={occasion}
          setOccasion={setOccasion}
          radius={radius}
          setRadius={setRadius}
          sharingModels={sharingModels}
          setSharingModels={setSharingModels}
          maxGuarantee={maxGuarantee}
          setMaxGuarantee={setMaxGuarantee}
          sort={sort}
          setSort={setSort}
          openItem={openItem}
          location={location}
          setLocation={setLocation}
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
        />
      )}
      {page === "item" && (
        <ItemDetail
          item={selected}
          back={() => navigate("results")}
          request={() => navigate("request")}
          isOwner={selected.ownerId === currentUserId}
          edit={() => editItem(selected)}
          toggleAvailability={() =>
            updateItem(selected.id, { available: selected.available === false })
          }
        />
      )}
      {page === "request" && (
        <RequestPage
          item={selected}
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          agreed={agreed}
          setAgreed={setAgreed}
          submit={submitRequest}
        />
      )}
      {page === "activity" && (
        <Activity
          requests={requests}
          items={items}
          update={updateRequest}
          openItem={openItem}
          share={() => navigate("share")}
          support={() => navigate("help")}
          tab={activityTab}
          setTab={setActivityTab}
          communityRequests={communityRequests}
          updateCommunityRequest={(id, changes) =>
            setCommunityRequests((current) =>
              current.map((request) =>
                request.id === id ? { ...request, ...changes } : request,
              ),
            )
          }
          ownerItems={items.filter((item) => item.ownerId === currentUserId)}
          simulateRequest={simulateNeighborRequest}
          editItem={editItem}
          toggleItem={(item) =>
            updateItem(item.id, { available: item.available === false })
          }
          removeItem={(item) => {
            if (!confirm(`Remove “${item.name}”? This cannot be undone.`))
              return
            setItems((current) =>
              current.filter((candidate) => candidate.id !== item.id),
            )
            setNotice("Listing removed.")
          }}
        />
      )}
      {page === "share" && (
        <ShareItem
          add={(item) => {
            const ownedItem = {
              ...item,
              ownerId: currentUserId,
              available: true,
            }
            const nextItems = [ownedItem, ...items]
            localStorage.setItem("goodshare-items", JSON.stringify(nextItems))
            setItems(nextItems)
            setActivityTab("Lending")
            setNotice(
              "Your item is live! Neighbors can now request to borrow it.",
            )
            navigate("activity")
          }}
        />
      )}
      {page === "community" && (
        <Community
          location={location}
          requests={communityRequests}
          addRequest={(request) =>
            setCommunityRequests((current) => [request, ...current])
          }
          viewMyRequests={() => {
            setActivityTab("My Requests")
            navigate("activity")
          }}
        />
      )}
      {page === "profile" && (
        <ProfilePage
          location={location}
          setLocation={setLocation}
          items={items}
          requests={requests}
          openItem={openItem}
        />
      )}
      {[
        "settings",
        "help",
        "contact",
        "guidelines",
        "privacy",
        "terms",
      ].includes(page) && <InfoPage page={page} navigate={navigate} />}
      <footer>
        <div className="brand inverse">
          <Logo inverse />
        </div>
        <p>Good things are better shared.</p>
        <div className="footer-links">
          <button onClick={() => navigate("help")}>Help &amp; Support</button>
          <button onClick={() => navigate("contact")}>Contact</button>
          <button onClick={() => navigate("guidelines")}>
            Community Guidelines
          </button>
          <button onClick={() => navigate("privacy")}>Privacy Policy</button>
          <button onClick={() => navigate("terms")}>Terms of Service</button>
        </div>
      </footer>
    </div>
  )
}

function Onboarding({
  step,
  setStep,
  location,
  setLocation,
  radius,
  setRadius,
  chosen,
  setChosen,
  finish,
}: any) {
  const screens = [
    <div className="welcome">
      <span className="eyebrow">WELCOME TO GOODSHARE</span>
      <h1>Your neighborhood has more to share than you think.</h1>
      <p>
        Borrow what you need. Share what you own. Make more possible together.
      </p>
    </div>,
    <div>
      <span className="eyebrow">YOUR NEIGHBORHOOD</span>
      <h2>Where would you like to borrow from?</h2>
      <p>We'll show approximate pickup areas—never exact home addresses.</p>
      <label>
        ZIP code or neighborhood
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label>
        Borrowing radius
        <Dropdown
          value={String(radius)}
          onChange={(value) => setRadius(+value)}
          ariaLabel="Borrowing radius"
          options={[1, 3, 5, 10].map((value) => ({
            value: String(value),
            label: `${value} ${value === 1 ? "mile" : "miles"}`,
          }))}
        />
      </label>
    </div>,
    <div>
      <span className="eyebrow">YOUR INTERESTS</span>
      <h2>What brings you to Goodshare?</h2>
      <p>Choose as many as you like. You can still explore everything.</p>
      <div className="interest-grid">
        {interests.map((i) => (
          <button
            className={chosen.includes(i) ? "selected" : ""}
            onClick={() =>
              setChosen(
                chosen.includes(i)
                  ? chosen.filter((x: string) => x !== i)
                  : [...chosen, i],
              )
            }
            key={i}
          >
            {i}
            <span>+</span>
          </button>
        ))}
      </div>
    </div>,
    <div>
      <span className="eyebrow">THE GOODSHARE PROMISE</span>
      <h2>Share with confidence.</h2>
      <p>A simple cycle designed around trust, care, and clear expectations.</p>
      <div className="promise">
        <div>
          <b>01</b>
          <strong>Discover nearby</strong>
          <span>Find useful things shared by neighbors.</span>
        </div>
        <div>
          <b>02</b>
          <strong>Agree on terms</strong>
          <span>Review dates, care, and guarantee.</span>
        </div>
        <div>
          <b>03</b>
          <strong>Borrow with care</strong>
          <span>Treat each item like your own.</span>
        </div>
        <div>
          <b>04</b>
          <strong>Return responsibly</strong>
          <span>Confirm a smooth handoff together.</span>
        </div>
      </div>
      <aside>
        <b>Care Guarantee</b>
        <p>
          A lender-defined refundable amount encourages responsible borrowing.
          No charge is processed by Goodshare.
        </p>
      </aside>
    </div>,
  ]
  return (
    <main className="onboarding">
      <section className="onboard-art">
        <div className="onboard-brand">
          <Logo inverse />
        </div>
        <p>
          Good things are
          <br />
          better shared.
        </p>
        <small>Jersey City community</small>
      </section>
      <section className="onboard-content">
        <div className="progress">
          {[0, 1, 2, 3].map((n) => (
            <i className={n <= step ? "active" : ""} key={n} />
          ))}
        </div>
        {screens[step]}
        <div className="onboard-actions">
          {step > 0 && (
            <button className="text-btn" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button
            className="primary"
            onClick={() => (step === 3 ? finish() : setStep(step + 1))}
          >
            {step === 0
              ? "Get Started"
              : step === 3
                ? "Explore Goodshare"
                : "Continue"}{" "}
            <span>→</span>
          </button>
        </div>
        {step > 0 && step < 3 && (
          <button className="skip" onClick={() => setStep(step + 1)}>
            Skip for now
          </button>
        )}
      </section>
    </main>
  )
}

function Explore({
  query,
  setQuery,
  search,
  location,
  items,
  openItem,
  chooseOccasion,
  chooseCategory,
  setLocation,
  start,
  end,
  setStart,
  setEnd,
  share,
}: any) {
  const [isSearching, setIsSearching] = useState(false)
  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    setIsSearching(true)
    window.setTimeout(() => {
      search()
      setIsSearching(false)
    }, 250)
  }
  const occasions = [
    [
      "Try Something New",
      "Pickleball, guitars, cameras and more",
      photos.pickle,
    ],
    ["Plan an Adventure", "Tents, hiking poles and outdoor gear", photos.hike],
    ["Host a Gathering", "Projectors, speakers and party decor", photos.party],
    ["Get Things Done", "Vacuums, tools and home essentials", photos.vacuum],
  ]
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">BORROW NEARBY • SHARE WITH PURPOSE</span>
          <h1>
            Good things are
            <br />
            <em>better shared.</em>
          </h1>
          <p>Find what you need nearby, from people who believe in sharing.</p>
          <form className="explore-search" onSubmit={submitSearch}>
            <label className="explore-keyword">
              <LucideIcon name="search" />
              <span className="sr-only">Item</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to borrow?"
              />
            </label>
            <div className="explore-search-row">
              <label className="explore-field location-control">
                <span>Location</span>
                <div>
                  <LucideIcon name="map-pin" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Neighborhood or ZIP code"
                  />
                </div>
              </label>
              <DateRangePicker
                start={start}
                end={end}
                setStart={setStart}
                setEnd={setEnd}
              />
            </div>
            <button className="search-submit" aria-busy={isSearching}>
              <LucideIcon name="search" />
              {isSearching ? "Searching…" : "Search"}
            </button>
          </form>
          <small className="privacy-note">
            <LucideIcon name="shield" />
            Exact pickup addresses stay private until an exchange is arranged.
          </small>
          <div className="share-prompt">
            <div>
              <h3>Have something to share?</h3>
              <p>Help a neighbor make use of something you already own.</p>
            </div>
            <button onClick={share}>Share an item →</button>
          </div>
        </div>
        <div className="hero-photo">
          <img
            src={`${import.meta.env.BASE_URL}goodshare-projector-handover.png`}
            alt="Neighbors exchanging a projector at the door"
          />
          <div className="photo-note">
            <b>Shared by neighbors</b>
            <span>More access. Less stuff.</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">EXPLORE BY OCCASION</span>
            <h2>Find what your plans need.</h2>
          </div>
          <button className="text-cta" onClick={search}>
            View everything <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="occasion-grid">
          {occasions.map(([name, desc, img], i) => (
            <button
              className="occasion"
              onClick={() => chooseOccasion(name)}
              key={name}
            >
              <span className="occasion-media">
                <img src={img} alt="" />
                <span className="num">0{i + 1}</span>
              </span>
              <div>
                <h3>{name}</h3>
                <p>{desc}</p>
                <b>Explore →</b>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="category-strip">
        <span className="eyebrow">BROWSE BY CATEGORY</span>
        <div>
          {categories.slice(1).map((c, i) => (
            <button onClick={() => chooseCategory(c)} key={c}>
              <span className="category-icon">
                <LucideIcon
                  name={
                    (["bike", "house", "guitar", "party", "camera", "wrench"][
                      i
                    ] || "house") as IconName
                  }
                />
              </span>
              <span className="category-copy">
                <span>{c}</span>
                <small>
                  {items.filter((item: Item) => item.category === c).length}{" "}
                  {items.filter((item: Item) => item.category === c).length ===
                  1
                    ? "item"
                    : "items"}
                </small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">IN YOUR NEIGHBORHOOD</span>
            <h2>Shared near you</h2>
          </div>
          <button className="text-cta" onClick={search}>
            See all nearby <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="listing-grid">
          {items.slice(0, 4).map((i: Item) => (
            <ItemCard key={i.id} item={i} open={() => openItem(i.id)} />
          ))}
        </div>
      </section>
      <section className="community-banner">
        <div>
          <span className="eyebrow">A NEIGHBORHOOD WITH MORE</span>
          <h2>
            A little sharing
            <br />
            goes a long way.
          </h2>
        </div>
        <div>
          <p>
            Every borrowed item is one less thing someone needs to buy—and one
            more reason to know the people nearby.
          </p>
          <div className="stats">
            <b>
              <strong>{items.length}</strong> items nearby
            </b>
            <b>
              <strong>6</strong> Jersey City neighborhoods
            </b>
            <b>
              <strong>1</strong> shared community
            </b>
          </div>
        </div>
      </section>
    </main>
  )
}

function ItemCard({ item, open }: any) {
  return (
    <button className="item-card" onClick={open}>
      <div>
        <img src={item.image} alt={item.name} />
        <span>{item.distance} mi away</span>
      </div>
      <small>{item.category}</small>
      <h3>{item.name}</h3>
      <p>
        <b>{contributionLabel(item)}</b>
        <span>${item.guarantee} care guarantee</span>
      </p>
      <footer>
        <span>
          Shared by {item.lender} · {item.neighborhood}
        </span>
        <b>{item.availability || "Available by request"}</b>
      </footer>
    </button>
  )
}

function Results({
  items,
  query,
  setQuery,
  category,
  setCategory,
  occasion,
  setOccasion,
  radius,
  setRadius,
  sharingModels,
  setSharingModels,
  maxGuarantee,
  setMaxGuarantee,
  sort,
  setSort,
  openItem,
  location,
  setLocation,
  start,
  end,
  setStart,
  setEnd,
}: any) {
  const occasions = [
    "Try Something New",
    "Plan an Adventure",
    "Host a Gathering",
    "Get Things Done",
  ]
  const toggle = (value: string, selected: string[], setSelected: any) =>
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
  const clear = () => {
    setQuery("")
    setCategory([])
    setOccasion([])
    setRadius(10)
    setSharingModels([])
    setMaxGuarantee(100)
  }
  return (
    <main className="results-page">
      <div className="results-title">
        <span className="eyebrow">EXPLORE JERSEY CITY</span>
        <h1>Find something nearby</h1>
        <p>Useful things, shared by people in your neighborhood.</p>
      </div>
      <div className="filter-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Pickup neighborhood or ZIP code"
          placeholder="Neighborhood or ZIP code"
        />
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          aria-label="Pickup date"
        />
        <input
          type="date"
          min={start}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          aria-label="Return date"
        />
        <button>Search</button>
      </div>
      <div className="results-layout">
        <aside className="filters">
          <div>
            <b>Filters</b>
            <button onClick={clear}>Clear all</button>
          </div>
          <fieldset>
            <legend>Categories</legend>
            {categories.slice(1).map((value) => (
              <label className="filter-check" key={value}>
                <input
                  type="checkbox"
                  checked={category.includes(value)}
                  onChange={() => toggle(value, category, setCategory)}
                />
                {value}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Occasions</legend>
            {occasions.map((value) => (
              <label className="filter-check" key={value}>
                <input
                  type="checkbox"
                  checked={occasion.includes(value)}
                  onChange={() => toggle(value, occasion, setOccasion)}
                />
                {value}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Sharing model</legend>
            {[
              ["free", "Share for Free"],
              ["fixed", "Set an Amount"],
              ["wish", "Pay What You Wish"],
            ].map(([value, label]) => (
              <label className="filter-check" key={value}>
                <input
                  type="checkbox"
                  checked={sharingModels.includes(value)}
                  onChange={() =>
                    toggle(value, sharingModels, setSharingModels)
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label>
            Distance radius
            <Dropdown
              value={String(radius)}
              onChange={(value) => setRadius(+value)}
              ariaLabel="Distance radius"
              options={[1, 3, 5, 10].map((value) => ({
                value: String(value),
                label: `${value} ${value === 1 ? "mile" : "miles"}`,
              }))}
            />
          </label>
          <label>
            Maximum Care Guarantee <b>${maxGuarantee}</b>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={maxGuarantee}
              onChange={(e) => setMaxGuarantee(+e.target.value)}
            />
          </label>
          <button
            className="primary filter-apply"
            onClick={() =>
              document
                .querySelector(".results")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Apply Filters
          </button>
        </aside>
        <section className="results">
          <div className="result-bar">
            <b>{items.length} things nearby</b>
            <Dropdown
              value={sort}
              onChange={setSort}
              ariaLabel="Sort listings"
              options={[
                { value: "nearest", label: "Nearest first" },
                { value: "lowest", label: "Lowest contribution" },
                { value: "recent", label: "Recently listed" },
              ]}
            />
          </div>
          {Boolean(
            query ||
              occasion.length ||
              category.length ||
              sharingModels.length,
          ) && (
            <div className="chips">
              {query && <span>“{query}”</span>}
              {[...category, ...occasion].map((value) => (
                <span key={value}>{value}</span>
              ))}
              {sharingModels.map((value: string) => (
                <span key={value}>
                  {value === "free"
                    ? "Share for Free"
                    : value === "wish"
                      ? "Pay What You Wish"
                      : "Set an Amount"}
                </span>
              ))}
            </div>
          )}
          <div className="listing-grid">
            {items.map((i: Item) => (
              <ItemCard key={i.id} item={i} open={() => openItem(i.id)} />
            ))}
          </div>
          {!items.length && (
            <div className="empty">
              <h2>Nothing matches just yet.</h2>
              <p>
                Try widening your radius or clearing a filter. Your neighbors
                add new things often.
              </p>
              <button className="primary" onClick={clear}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function ItemDetail({
  item,
  back,
  request,
  isOwner,
  edit,
  toggleAvailability,
}: any) {
  return (
    <main className="detail">
      <button className="back" onClick={back}>
        ← Back to results
      </button>
      <div className="detail-grid">
        <div className="detail-image">
          <img src={item.image} alt={item.name} />
          <span>{item.condition} condition</span>
        </div>
        <div className="detail-info">
          <span className="eyebrow">
            {item.category} · {item.distance} MI AWAY
          </span>
          <h1>{item.name}</h1>
          <p className="byline">
            Shared by <b>{item.lender}</b> in {item.neighborhood}
          </p>
          <p className="description">{item.description}</p>
          <div className="pricing">
            <div>
              <small>DAILY CONTRIBUTION</small>
              <b>{contributionLabel(item)}</b>
            </div>
            <div>
              <small>REFUNDABLE CARE GUARANTEE</small>
              <b>${item.guarantee}</b>
            </div>
          </div>
          {isOwner ? (
            <div className="owner-detail-actions">
              <button className="primary" onClick={edit}>
                Edit listing
              </button>
              <button className="secondary" onClick={toggleAvailability}>
                {item.available === false ? "Make available" : "Pause listing"}
              </button>
            </div>
          ) : (
            <>
              <button
                className="primary wide"
                onClick={request}
                disabled={item.available === false}
              >
                {item.available === false
                  ? "Currently unavailable"
                  : "Request to Borrow →"}
              </button>
              <small>No payment is processed by Goodshare.</small>
            </>
          )}
        </div>
      </div>
      <div className="detail-lower">
        <section>
          <h2>Good to know</h2>
          <dl>
            <div>
              <dt>Included</dt>
              <dd>{item.accessories}</dd>
            </div>
            <div>
              <dt>Care instructions</dt>
              <dd>
                {item.careInstructions?.length ? (
                  <ul className="care-detail-list">
                    {item.careInstructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                    {item.customCare && <li>{item.customCare}</li>}
                  </ul>
                ) : (
                  item.care
                )}
              </dd>
            </div>
            <div>
              <dt>Pickup area</dt>
              <dd>
                {item.neighborhood}, Jersey City. Exact location shared after
                approval.
              </dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{item.availability || "Available by request"}</dd>
            </div>
          </dl>
        </section>
        <aside className="lender">
          <div className="avatar">{item.lender[0]}</div>
          <span className="eyebrow">MEET YOUR NEIGHBOR</span>
          <h3>Hi, I’m {item.lender}!</h3>
          <p>
            {item.id === "pickle"
              ? "I bought these paddles when I started playing pickleball. Happy to share them when I’m not using them."
              : "I love seeing useful things get more life. Happy to share this with a neighbor who needs it."}
          </p>
        </aside>
        <aside className="guarantee">
          <span>◇</span>
          <div>
            <h3>The Care Guarantee</h3>
            <p>
              A refundable amount set by the lender. Its return depends on the
              item coming back in the condition and timing you both agreed to.
              No charge is processed by Goodshare.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}

function RequestPage({
  item,
  start,
  end,
  setStart,
  setEnd,
  agreed,
  setAgreed,
  submit,
}: any) {
  const days = daysBetween(start, end)
  return (
    <main className="request-page">
      <div>
        <span className="eyebrow">BORROWING REQUEST</span>
        <h1>Request {item.name}</h1>
        <p>Choose your dates and review the shared-care agreement.</p>
      </div>
      <div className="request-grid">
        <section className="request-form">
          <h2>1. Choose your dates</h2>
          <div className="dates">
            <label>
              Pickup date
              <input
                type="date"
                value={start}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              Return date
              <input
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          <h2>2. Borrow with care</h2>
          <div className="terms">
            <p>
              <b>Care instructions</b>
              {item.care}
            </p>
            <p>
              <b>Return terms</b>Return on the agreed date with all included
              accessories. Confirm handoff together.
            </p>
          </div>
          <label className="agreement">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I understand and agree to the care instructions, return terms, and
              refundable Care Guarantee.
            </span>
          </label>
        </section>
        <aside className="summary">
          <img src={item.image} alt="" />
          <h3>{item.name}</h3>
          <p>
            {item.neighborhood} · Shared by {item.lender}
          </p>
          <hr />
          <div>
            <span>
              {days || 0} day{days === 1 ? "" : "s"} × ${item.price}
            </span>
            <b>${days * item.price}</b>
          </div>
          <div>
            <span>Refundable Care Guarantee</span>
            <b>${item.guarantee}</b>
          </div>
          <hr />
          <div className="total">
            <span>Total commitment</span>
            <b>${days * item.price + item.guarantee}</b>
          </div>
          <small>
            ${days * item.price} contribution + ${item.guarantee} refundable
            guarantee. No payment is processed.
          </small>
          <button className="primary wide" onClick={submit}>
            Send request →
          </button>
        </aside>
      </div>
    </main>
  )
}

function Activity({
  requests,
  items,
  update,
  openItem,
  share,
  support,
  tab,
  setTab,
  communityRequests,
  updateCommunityRequest,
  ownerItems,
  simulateRequest,
  editItem,
  toggleItem,
  removeItem,
}: any) {
  const myBorrows = requests.filter(isMyBorrow)
  const isOwnItem = (r: Request) =>
    ownerItems.some((item: Item) => item.id === r.itemId)
  const lends = requests.filter(
    (r: Request) =>
      !isMyBorrow(r) &&
      isOwnItem(r) &&
      ["Upcoming", "Active", "Completed"].includes(r.status),
  )
  const hasOpenLend = (item: Item) =>
    requests.some(
      (r: Request) =>
        r.itemId === item.id &&
        !isMyBorrow(r) &&
        ["Pending approval", "Upcoming", "Active"].includes(r.status),
    )
  return (
    <main className="activity">
      <span className="eyebrow">MY ACTIVITY</span>
      <div className="activity-heading">
        <h1>Sharing, coming and going.</h1>
        <button className="primary" onClick={share}>
          Share an item →
        </button>
      </div>
      <div className="tabs">
        <button
          className={tab === "Borrowing" ? "active" : ""}
          onClick={() => setTab("Borrowing")}
        >
          Borrowing
        </button>
        <button
          className={tab === "Lending" ? "active" : ""}
          onClick={() => setTab("Lending")}
        >
          Lending
        </button>
        <button
          className={tab === "My Requests" ? "active" : ""}
          onClick={() => setTab("My Requests")}
        >
          My Requests
        </button>
      </div>
      {tab === "My Requests" ? (
        <div className="my-request-list">
          {communityRequests.length ? (
            communityRequests.map((request: CommunityRequest) => (
              <article key={request.id}>
                <div>
                  <span className={`status ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                  <h3>{request.item}</h3>
                  <p>
                    Posted {request.posted} · {request.neighborhood}
                  </p>
                  <small>
                    {request.responses
                      ? `${request.responses} neighbor response${
                          request.responses === 1 ? "" : "s"
                        }`
                      : "No responses yet"}
                  </small>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() =>
                      alert(
                        request.responses
                          ? `${request.responses} responses available.`
                          : "No neighbor responses yet.",
                      )
                    }
                  >
                    View responses
                  </button>
                  <button
                    disabled={request.status === "Closed"}
                    onClick={() => {
                      const item = prompt("Update your request", request.item)
                      if (item?.trim())
                        updateCommunityRequest(request.id, {
                          item: item.trim(),
                        })
                    }}
                  >
                    Edit request
                  </button>
                  <button
                    disabled={request.status === "Closed"}
                    onClick={() =>
                      updateCommunityRequest(request.id, { status: "Closed" })
                    }
                  >
                    Close request
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty">
              <h2>No neighborhood requests yet.</h2>
              <p>Requests you post in Community will appear here.</p>
            </div>
          )}
        </div>
      ) : tab === "Borrowing" ? (
        <div className="activity-list">
          {myBorrows.length ? (
            myBorrows.map((r: Request) => {
              const i = items.find((x: Item) => x.id === r.itemId)
              return (
                <article key={r.id}>
                  <img src={i?.image} />
                  <div>
                    <span
                      className={
                        "status " + r.status.replace(" ", "-").toLowerCase()
                      }
                    >
                      {r.status}
                    </span>
                    <h3>{i?.name}</h3>
                    <p>
                      {r.start} → {r.end} · with {i?.lender}
                    </p>
                    <small>
                      ${(i?.price || 0) * r.days} contribution · ${i?.guarantee}{" "}
                      guarantee
                    </small>
                  </div>
                  <div className="card-actions">
                    {r.status === "Upcoming" && (
                      <button onClick={() => update(r.id, "Active")}>
                        Confirm pickup
                      </button>
                    )}
                    {r.status === "Active" && (
                      <button onClick={() => update(r.id, "Completed")}>
                        Confirm return
                      </button>
                    )}
                    <button onClick={() => openItem(r.itemId)}>
                      View item
                    </button>
                    <button
                      onClick={() =>
                        alert(`Contact request sent to ${i?.lender}.`)
                      }
                    >
                      Contact neighbor
                    </button>
                    <button onClick={support}>Get support</button>
                  </div>
                </article>
              )
            })
          ) : (
            <EmptyActivity />
          )}
        </div>
      ) : (
        <div className="activity-list">
          <section className="owner-listings">
            <div className="owner-listings-head">
              <div>
                <span className="eyebrow">LENDING</span>
                <h2>My Listings</h2>
              </div>
              <button className="primary" onClick={share}>
                Share an item →
              </button>
            </div>
            {ownerItems.length ? (
              ownerItems.map((item: Item) => (
                <article key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span
                      className={`status ${
                        item.available === false ? "closed" : "open"
                      }`}
                    >
                      {item.available === false ? "Paused" : "Available"}
                    </span>
                    <h3>{item.name}</h3>
                    <p>{contributionLabel(item)}</p>
                    <small>{item.availability || "Available by request"}</small>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => openItem(item.id)}>
                      View listing
                    </button>
                    <button
                      className="simulate-request"
                      disabled={item.available === false || hasOpenLend(item)}
                      onClick={() => simulateRequest(item)}
                    >
                      Simulate neighbor request
                    </button>
                    <button onClick={() => editItem(item)}>Edit listing</button>
                    <button onClick={() => toggleItem(item)}>
                      {item.available === false
                        ? "Make available"
                        : "Pause listing"}
                    </button>
                    <button onClick={() => removeItem(item)}>
                      Remove listing
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty">
                <h2>No listings yet.</h2>
                <p>Items you publish will appear here.</p>
              </div>
            )}
          </section>
          <h2 className="incoming-title">Incoming requests</h2>
          {requests.filter(
            (r: Request) => r.status === "Pending approval" && isOwnItem(r),
          ).length ? (
            requests
              .filter(
                (r: Request) => r.status === "Pending approval" && isOwnItem(r),
              )
              .map((r: Request) => {
                const i = items.find((x: Item) => x.id === r.itemId)
                return (
                  <article key={r.id}>
                    <img src={i?.image} />
                    <div>
                      <span className="status pending-approval">
                        Incoming request
                      </span>
                      <h3>{i?.name}</h3>
                      <p>
                        {r.start} → {r.end} · requested by{" "}
                        {r.borrowerName || "a neighbor"}
                      </p>
                    </div>
                    <div className="card-actions">
                      <button
                        className="approve"
                        onClick={() => update(r.id, "Upcoming")}
                      >
                        Approve
                      </button>
                      <button onClick={() => update(r.id, "Declined")}>
                        Decline
                      </button>
                    </div>
                  </article>
                )
              })
          ) : (
            <EmptyActivity />
          )}
          {lends.length > 0 && (
            <>
              <h2 className="incoming-title lent-title">Lent to neighbors</h2>
              {lends.map((r: Request) => {
                const i = items.find((x: Item) => x.id === r.itemId)
                return (
                  <article key={r.id}>
                    <img src={i?.image} alt={i?.name} />
                    <div>
                      <span
                        className={
                          "status " + r.status.replace(" ", "-").toLowerCase()
                        }
                      >
                        {r.status === "Completed" ? "Returned" : r.status}
                      </span>
                      <h3>{i?.name}</h3>
                      <p>
                        {r.start} → {r.end} · with{" "}
                        {r.borrowerName || "a neighbor"}
                      </p>
                    </div>
                    <div className="card-actions">
                      {r.status === "Upcoming" && (
                        <button onClick={() => update(r.id, "Active")}>
                          Mark picked up
                        </button>
                      )}
                      {r.status === "Active" && (
                        <button onClick={() => update(r.id, "Completed")}>
                          Mark returned
                        </button>
                      )}
                      <button onClick={() => openItem(r.itemId)}>
                        View listing
                      </button>
                    </div>
                  </article>
                )
              })}
            </>
          )}
        </div>
      )}
    </main>
  )
}
function EmptyActivity() {
  return (
    <div className="empty">
      <h2>No activity here yet.</h2>
      <p>
        When you borrow or share something, you’ll be able to track it here.
      </p>
    </div>
  )
}

function ShareItem({ add }: any) {
  const [sharingOption, setSharingOption] = useState<"free" | "fixed" | "wish">(
    "free",
  )
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Home Essentials")
  const [brand, setBrand] = useState("")
  const [color, setColor] = useState("")
  const [description, setDescription] = useState("")
  const [preview, setPreview] = useState("")
  const [suggested, setSuggested] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [selectedCare, setSelectedCare] = useState<string[]>([])
  const [customCare, setCustomCare] = useState("")
  const [careError, setCareError] = useState("")

  const careSuggestions = useMemo(() => {
    const byCategory: Record<string, string[]> = {
      "Sports & Outdoors": [
        "Return clean and dry",
        "Keep away from prolonged moisture",
        "Return with all accessories",
        "Pack in the provided case",
        "Report any damage before return",
      ],
      "Musical Instruments": [
        "Handle with clean hands",
        "Keep away from water",
        "Return in its case",
        "Return with all accessories",
        "Avoid extreme heat",
      ],
      "Party Essentials": [
        "Return clean and dry",
        "Return all parts together",
        "Pack cables separately",
        "Use only as described",
        "Report missing pieces",
      ],
      "Home Essentials": [
        "Return clean and dry",
        "Empty after use",
        "Return with all accessories",
        "Pack securely for return",
        "Report any damage",
      ],
      "Tech & Creative": [
        "Power off before packing",
        "Keep away from water",
        "Return all cables",
        "Pack in the provided case",
        "Return fully charged",
      ],
      "Tools & DIY": [
        "Wipe clean after use",
        "Return all attachments",
        "Keep dry between uses",
        "Pack securely for return",
        "Report any damage",
      ],
    }
    const itemText = `${name} ${description}`.toLowerCase()
    const specific: string[] = []
    if (/(iron|steamer)/.test(itemText))
      specific.push("Empty the water reservoir")
    if (/(vacuum|cooler|container)/.test(itemText))
      specific.push("Empty and wipe after use")
    if (/(guitar|violin|fiddle)/.test(itemText))
      specific.push("Store in its case when not in use")
    if (/(projector|karaoke|speaker|machine)/.test(itemText))
      specific.push("Return all cables and adapters")
    return [
      ...new Set([
        ...specific,
        ...(byCategory[category] || byCategory["Home Essentials"]),
      ]),
    ].slice(0, 6)
  }, [name, description, category])

  const suggestFromPhoto = (file: File) => {
    const filename = file.name.toLowerCase()
    const presets = filename.includes("guitar")
      ? {
          name: "Acoustic guitar",
          category: "Musical Instruments",
          brand: "Add brand",
          color: "Natural wood",
          description:
            "Full-size acoustic guitar, ready for practice or a casual jam.",
        }
      : filename.includes("vacuum")
        ? {
            name: "Cordless vacuum",
            category: "Home Essentials",
            brand: "Add brand",
            color: "Gray",
            description:
              "Cordless vacuum for quick apartment cleanups and everyday use.",
          }
        : {
            name: "Everyday item",
            category: "Home Essentials",
            brand: "Add brand",
            color: "Add color",
            description:
              "A useful household item ready to share with a neighbor.",
          }
    setName(presets.name)
    setCategory(presets.category)
    setBrand(presets.brand)
    setColor(presets.color)
    setDescription(presets.description)
    setSuggested(true)
    setAccepted(false)
  }

  const handlePhoto = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
    suggestFromPhoto(file)
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCare.length && !customCare.trim()) {
      setCareError("Choose at least one instruction or add your own.")
      return
    }
    const f = new FormData(e.currentTarget)
    add({
      id: "user-" + Date.now(),
      name,
      category,
      occasion: "Get Things Done",
      price: sharingOption === "fixed" ? +String(f.get("price")) : 0,
      sharingOption,
      brand,
      color,
      guarantee: +String(f.get("guarantee")),
      distance: 0.3,
      lender: "Jamie",
      neighborhood: String(f.get("neighborhood")),
      image: preview || photos.party,
      description,
      condition: String(f.get("condition")),
      accessories: String(f.get("accessories")),
      care: [...selectedCare, customCare.trim()].filter(Boolean).join(" • "),
      careInstructions: selectedCare,
      customCare: customCare.trim(),
      availability: "Available by request",
      source: "community",
    })
  }
  return (
    <main className="share-page">
      <div>
        <span className="eyebrow">SHARE AN ITEM</span>
        <h1>Give a good thing more life.</h1>
        <p>List something you rarely use and help a neighbor do more.</p>
      </div>
      <form onSubmit={submit}>
        <label className="full photo-upload">
          Item photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
          {preview && <img src={preview} alt="Item preview" />}
        </label>
        {suggested && (
          <div className="full ai-note">
            <b>Demo AI suggestions</b>
            <span>
              Suggested from the photo filename for prototype purposes. No image
              recognition was performed.
            </span>
          </div>
        )}
        <label>
          Item name {suggested && <small>Suggested by Goodshare AI</small>}
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cordless drill"
          />
        </label>
        <label>
          Category {suggested && <small>Suggested by Goodshare AI</small>}
          <Dropdown
            name="category"
            value={category}
            onChange={setCategory}
            required
            ariaLabel="Item category"
            options={categories.slice(1).map((value) => ({
              value,
              label: value,
            }))}
          />
        </label>
        <label>
          Brand {suggested && <small>Suggested by Goodshare AI</small>}
          <input
            name="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Dyson"
          />
        </label>
        <label>
          Color {suggested && <small>Suggested by Goodshare AI</small>}
          <input
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Forest green"
          />
        </label>
        <label className="full">
          Description {suggested && <small>Suggested by Goodshare AI</small>}
          <textarea
            required
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell neighbors what makes this useful..."
          />
        </label>
        {suggested && (
          <div className="full ai-actions">
            <button
              type="button"
              onClick={() => setAccepted(true)}
              disabled={accepted}
            >
              {accepted ? "Suggestions accepted" : "Accept details & continue"}
            </button>
            <span>You can edit any suggested field before publishing.</span>
          </div>
        )}
        <label>
          Condition
          <Dropdown
            name="condition"
            required
            ariaLabel="Item condition"
            options={[
              { value: "", label: "Select condition", disabled: true },
              { value: "Excellent", label: "Excellent" },
              { value: "Very good", label: "Very good" },
              { value: "Good", label: "Good" },
            ]}
          />
        </label>
        <label>
          Included accessories
          <input
            required
            name="accessories"
            placeholder="Case, charger, attachments..."
          />
        </label>
        <label>
          Pickup neighborhood
          <input required name="neighborhood" defaultValue="Hamilton Park" />
        </label>
        <label>
          Sharing option
          <Dropdown
            value={sharingOption}
            onChange={(value) =>
              setSharingOption(value as "free" | "fixed" | "wish")
            }
            ariaLabel="Sharing option"
            options={[
              { value: "free", label: "Share for Free" },
              { value: "fixed", label: "Set an Amount" },
              { value: "wish", label: "Pay What You Wish" },
            ]}
          />
        </label>
        {sharingOption === "fixed" && (
          <label>
            Daily contribution ($)
            <input
              required
              min="1"
              type="number"
              name="price"
              defaultValue="5"
            />
          </label>
        )}
        {sharingOption !== "fixed" && (
          <div className="sharing-explainer">
            <b>
              {sharingOption === "free"
                ? "No borrowing contribution"
                : "Borrower chooses, including $0"}
            </b>
            <span>The Care Guarantee remains separate.</span>
          </div>
        )}
        <label>
          Refundable Care Guarantee ($)
          <input
            required
            min="0"
            type="number"
            name="guarantee"
            defaultValue="25"
          />
        </label>
        <section className="full care-assist">
          <h3>Care instructions</h3>
          <div className="care-suggestion-label">
            <span aria-hidden="true">✦</span>
            <b>Suggested for your item</b>
            <small>Category-based suggestions</small>
          </div>
          <div className="care-chips">
            {careSuggestions.map((instruction) => {
              const selected = selectedCare.includes(instruction)
              return (
                <button
                  type="button"
                  aria-pressed={selected}
                  className={selected ? "selected" : ""}
                  key={instruction}
                  onClick={() => {
                    setCareError("")
                    setSelectedCare((current) =>
                      selected
                        ? current.filter((item) => item !== instruction)
                        : [...current, instruction],
                    )
                  }}
                >
                  <span aria-hidden="true">{selected ? "✓" : "+"}</span>
                  {instruction}
                </button>
              )
            })}
          </div>
          <label>
            Additional instructions (optional)
            <textarea
              value={customCare}
              onChange={(event) => {
                setCustomCare(event.target.value)
                setCareError("")
              }}
              placeholder="Anything else your neighbor should know?"
            />
          </label>
          {(selectedCare.length > 0 || customCare.trim()) && (
            <div className="care-preview">
              <b>Care instructions preview</b>
              <ul>
                {selectedCare.map((instruction) => (
                  <li key={instruction}>
                    <span>{instruction}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${instruction}`}
                      onClick={() =>
                        setSelectedCare((current) =>
                          current.filter((item) => item !== instruction),
                        )
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
                {customCare.trim() && <li>{customCare.trim()}</li>}
              </ul>
            </div>
          )}
          {careError && (
            <p className="care-error" role="alert">
              {careError}
            </p>
          )}
        </section>
        <div className="full form-foot">
          <small>Your exact address is never shown publicly.</small>
          <button className="primary">Publish listing →</button>
        </div>
      </form>
    </main>
  )
}

function InfoPage({ page, navigate }: any) {
  const content: Record<string, { label: string title: string intro: string }> =
    {
      settings: {
        label: "SETTINGS",
        title: "Your Goodshare preferences",
        intro:
          "Manage the neighborhood and activity preferences used on this device.",
      },
      help: {
        label: "HELP & SUPPORT",
        title: "How can we help?",
        intro:
          "Find guidance for borrowing, sharing, Care Guarantees, account access, and safe exchanges.",
      },
      contact: {
        label: "CONTACT",
        title: "Contact Goodshare",
        intro:
          "Tell us what you need help with and include any relevant exchange details.",
      },
      guidelines: {
        label: "COMMUNITY GUIDELINES",
        title: "Sharing works better with care",
        intro:
          "Be accurate, considerate, careful, and thoughtful about personal information.",
      },
      privacy: {
        label: "PRIVACY POLICY",
        title: "Your privacy on Goodshare",
        intro:
          "Goodshare shows approximate neighborhoods publicly and keeps exact exchange details private.",
      },
      terms: {
        label: "TERMS OF SERVICE",
        title: "Clear terms for neighborly sharing",
        intro:
          "Members are responsible for agreeing on item condition, timing, care instructions, and returns.",
      },
    }
  const current = content[page] || content.help
  return (
    <main className="info-page">
      <span className="eyebrow">{current.label}</span>
      <h1>{current.title}</h1>
      <p className="info-intro">{current.intro}</p>
      {page === "help" ? (
        <>
          <div className="support-grid">
            {[
              [
                "Borrowing",
                "Requests, pickup plans, returns, and declined requests.",
              ],
              [
                "Sharing",
                "Listings, incoming requests, item condition, and care instructions.",
              ],
              [
                "Care Guarantees",
                "How refundable guarantees and agreed return condition work.",
              ],
              [
                "Account issues",
                "Profile settings, neighborhood details, and access questions.",
              ],
              [
                "Safety concerns",
                "Personal information, clear communication, and safe exchanges.",
              ],
            ].map(([title, copy]) => (
              <article key={title}>
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <button className="primary" onClick={() => navigate("contact")}>
            Contact Support →
          </button>
        </>
      ) : page === "contact" ? (
        <form
          className="support-form"
          onSubmit={(event) => {
            event.preventDefault()
            alert("Your support request has been recorded on this device.")
          }}
        >
          <label>
            Topic
            <Dropdown
              name="topic"
              required
              defaultValue="Borrowing"
              ariaLabel="Support topic"
              options={[
                { value: "Borrowing", label: "Borrowing" },
                { value: "Sharing", label: "Sharing" },
                { value: "Care Guarantee", label: "Care Guarantee" },
                { value: "Account issue", label: "Account issue" },
                { value: "Safety concern", label: "Safety concern" },
              ]}
            />
          </label>
          <label>
            How can we help?
            <textarea required />
          </label>
          <button className="primary">Send request</button>
        </form>
      ) : page === "settings" ? (
        <div className="settings-list">
          <label>
            <input type="checkbox" defaultChecked /> Activity notifications
          </label>
          <label>
            <input type="checkbox" defaultChecked /> Pickup and return reminders
          </label>
          <label>
            <input type="checkbox" /> Community request updates
          </label>
        </div>
      ) : (
        <div className="policy-copy">
          <p>
            Goodshare supports transparent, respectful exchanges between
            neighbors. Describe items honestly, communicate clearly, and only
            share information needed to coordinate an exchange.
          </p>
          <p>
            Contact support if an exchange, account concern, or safety issue
            needs additional help.
          </p>
        </div>
      )}
    </main>
  )
}

function ProfilePage({
  location,
  setLocation,
  items,
  requests,
  openItem,
}: any) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(
    () => localStorage.getItem("goodshare-profile-name") || "Jamie Smith",
  )
  const [bio, setBio] = useState(
    () =>
      localStorage.getItem("goodshare-profile-bio") ||
      "Neighbor, occasional host, and believer in keeping useful things in use.",
  )
  const saveProfile = () => {
    localStorage.setItem("goodshare-profile-name", name)
    localStorage.setItem("goodshare-profile-bio", bio)
    localStorage.setItem("goodshare-location", location)
    setEditing(false)
  }
  const myBorrows = requests.filter(isMyBorrow)
  const completed = requests.filter(
    (request: Request) => request.status === "Completed",
  )
  // Community Impact: completed exchanges where the current user was the lender
  const completedLends = completed.filter((request: Request) =>
    items.some(
      (item: Item) =>
        item.id === request.itemId && item.ownerId === currentUserId,
    ),
  )
  const neighborsHelped = new Set(
    completedLends
      .map((request: Request) => request.borrowerId)
      .filter((id: string | undefined) => id && id !== currentUserId),
  ).size
  const itemsShared = new Set(
    completedLends.map((request: Request) => request.itemId),
  ).size
  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">JS</div>
        <div>
          <span className="eyebrow">MY PROFILE</span>
          {editing ? (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </>
          ) : (
            <>
              <h1>{name}</h1>
              <p>{location}</p>
              <p>{bio}</p>
            </>
          )}
        </div>
        <button
          className="primary"
          onClick={() => (editing ? saveProfile() : setEditing(true))}
        >
          {editing ? "Save profile" : "Edit profile"}
        </button>
      </section>
      <section className="profile-grid">
        <article>
          <h2>Account details</h2>
          <p>
            <b>Email</b>
            <span>jamie@example.com</span>
          </p>
          <p>
            <b>Member since</b>
            <span>2025</span>
          </p>
        </article>
        <article>
          <h2>Community Impact</h2>
          <div className="impact-stats">
            <b>
              <strong>{completedLends.length}</strong>Completed shares
            </b>
            <b>
              <strong>{neighborsHelped}</strong>Neighbors helped
            </b>
            <b>
              <strong>{itemsShared}</strong>Items shared
            </b>
          </div>
          {completedLends.length > 0 && (
            <div className="milestones">
              <span>First Share</span>
              {neighborsHelped > 0 && <span>Helping Hand</span>}
              {completedLends.length >= 3 && <span>Neighborhood Regular</span>}
            </div>
          )}
          <hr className="impact-divider" />
          <p className="profile-empty impact-note">
            {completedLends.length
              ? "Every exchange helps build a more connected neighborhood."
              : "Complete your first exchange to begin your community impact story."}
          </p>
        </article>
        <article className="profile-wide">
          <h2>My Listings</h2>
          {items.filter((item: Item) => item.lender === "Jamie").length ? (
            <div className="profile-items">
              {items
                .filter((item: Item) => item.lender === "Jamie")
                .map((item: Item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    open={() => openItem(item.id)}
                  />
                ))}
            </div>
          ) : (
            <p className="profile-empty">Items you share will appear here.</p>
          )}
        </article>
        <article>
          <h2>Borrowing Activity</h2>
          <p className="profile-empty">
            {myBorrows.length
              ? `${myBorrows.length} exchange${
                  myBorrows.length === 1 ? "" : "s"
                } in your activity.`
              : "Your borrowing activity will appear here."}
          </p>
        </article>
        <article>
          <h2>Lending Activity</h2>
          <p className="profile-empty">
            {completedLends.length
              ? `${completedLends.length} completed lending exchange${
                  completedLends.length === 1 ? "" : "s"
                }.`
              : "Your lending activity will appear here."}
          </p>
        </article>
      </section>
    </main>
  )
}

function Community({ location, requests, addRequest, viewMyRequests }: any) {
  const [posted, setPosted] = useState(false)
  const [requestItem, setRequestItem] = useState("")
  return (
    <main className="community-page">
      <section>
        <span className="eyebrow">HAMILTON PARK · JERSEY CITY</span>
        <h1>A neighborhood with more to share.</h1>
        <p>
          Ask for what you need, offer what you have, and make the block feel a
          little smaller.
        </p>
      </section>
      <div className="ask">
        <div>
          <h2>Ask your neighborhood</h2>
          <p>
            Looking for something you can't find? Neighbors may have one tucked
            away.
          </p>
        </div>
        <div className="ask-form-wrap">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!requestItem.trim()) return
              addRequest({
                id: `community-${Date.now()}`,
                item: requestItem.trim(),
                posted: new Date().toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                neighborhood: location.split(",")[0],
                status: "Open",
                responses: 0,
                owner: "current",
              } as CommunityRequest)
              setRequestItem("")
              setPosted(true)
            }}
          >
            <input
              required
              value={requestItem}
              onChange={(event) => {
                setRequestItem(event.target.value)
                setPosted(false)
              }}
              placeholder="I’m looking to borrow..."
            />
            <button className="primary">Post request</button>
          </form>
          <button className="text-cta ask-view-link" onClick={viewMyRequests}>
            View my requests <span aria-hidden="true">→</span>
          </button>
        </div>
        {posted && (
          <div className="success">
            <span>Your request was saved on this device.</span>
            <button onClick={viewMyRequests}>View my request</button>
          </div>
        )}
      </div>
      <section className="requests">
        <div className="section-head">
          <div>
            <span className="eyebrow">COMMUNITY REQUESTS</span>
            <h2>Can you help a neighbor?</h2>
          </div>
        </div>
        <div>
          {requests.map((request: CommunityRequest) => (
            <article key={request.id}>
              <span>LOOKING FOR</span>
              <h3>{request.item}</h3>
              <p>
                {request.status} · {request.neighborhood}
              </p>
              <footer>
                <b>Your request</b>
                <button onClick={viewMyRequests}>Manage →</button>
              </footer>
            </article>
          ))}
          {[
            ["Cake stand", "Needed Saturday · Hamilton Park", "Rina"],
            ["Camping stove", "Needed next weekend · The Heights", "Marcus"],
            ["Sewing machine", "Flexible dates · Downtown", "Leah"],
          ].map((x) => (
            <article key={x[0]}>
              <span>LOOKING FOR</span>
              <h3>{x[0]}</h3>
              <p>{x[1]}</p>
              <footer>
                <b>{x[2]} is asking</b>
                <button
                  onClick={() =>
                    alert(
                      "Thanks! " +
                        x[2] +
                        " will be notified that you can help.",
                    )
                  }
                >
                  I have one →
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
      <section className="guidelines">
        <span className="eyebrow">COMMUNITY GUIDELINES</span>
        <h2>Good sharing starts with care.</h2>
        <div>
          {[
            [
              "clipboard-check",
              "Share responsibly",
              "Describe items accurately and communicate their condition.",
            ],
            [
              "users",
              "Respect each other",
              "Be punctual, considerate, and transparent.",
            ],
            [
              "heart",
              "Care for what you borrow",
              "Follow instructions and return items as agreed.",
            ],
            [
              "shield-check",
              "Keep exchanges safe",
              "Communicate clearly and protect personal information.",
            ],
          ].map(([icon, title, copy]) => (
            <article key={title}>
              <i aria-hidden="true">
                <LucideIcon name={icon as IconName} className="guideline-icon" />
              </i>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
