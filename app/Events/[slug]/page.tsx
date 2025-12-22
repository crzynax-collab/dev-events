// ============================
// Imports
// ============================
import Image from "next/image";
import { notFound } from "next/navigation";
import { Tags } from "lucide-react";

import Bookevent from "@/components/bookevent";


// ============================
// Environment Setup
// ============================
const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!rawBaseUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_BASE_URL must be set in production");
}

const BASE_URL = rawBaseUrl ?? "http://localhost:3000";


// ============================
// Small Reusable Components
// ============================

type EventDetailsItemProps = {
  iconSrc: string;
  alt: string;
  label: string;
};

const EventDetailsItem = ({
  iconSrc,
  alt,
  label,
}: EventDetailsItemProps) => {
  return (
    <div className="flex items-center gap-2">
      <Image src={iconSrc} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  );
};

type EventAgendaProps = {
  agendaitems: string[];
};

const EventAgenda = ({ agendaitems }: EventAgendaProps) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaitems.map((item, idx) => (
        <li key={`${item}-${idx}`}>{item}</li>
      ))}
    </ul>
  </div>
);

type EventTagsProps = {
  tags: string[];
};

const EventTags = ({ tags }: EventTagsProps) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag, idx) => (
      <div className="pill" key={`${tag}-${idx}`}>
        {tag}
      </div>
    ))}
  </div>
);


// ============================
// Page Component
// ============================
const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  // Extract slug (Next.js 16 async params)
  const { slug } = await params;

  // Fetch event data
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);

  if (!request.ok) {
    return notFound();
  }

  const data = await request.json();
  const event = data.event;

  if (!event) {
    return notFound();
  }

  // Destructure event fields
  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags,
    organizer,
  } = event;

  if (!description) {
    return notFound();
  }

  // Temporary mock value
  const bookings = 10;

  // ============================
  // Render
  // ============================
 return (
  <section id="event">
    {/* ===== Header ===== */}
    <div className="header">
      <h1>Event Description</h1>
      <p>{description}</p>
    </div>

    <div className="details">
      {/* ================= LEFT CONTENT ================= */}
      <div className="content">
        {image ? (
          <Image
            src={image}
            alt="Event Banner"
            width={900}
            height={480}
            className="banner"
          />
        ) : (
          <div
            className="banner"
            style={{ height: 300 }}
            aria-hidden="true"
          />
        )}

        <section className="flex-col-gap-2">
          <h2>Overview</h2>
          <p>{overview}</p>
        </section>

        <section className="flex-col-gap-2">
          <h2>Event Details</h2>

          <EventDetailsItem
            iconSrc="/icons/calendar.svg"
            alt="calendar"
            label={date}
          />
          <EventDetailsItem
            iconSrc="/icons/clock.svg"
            alt="clock"
            label={time}
          />
          <EventDetailsItem
            iconSrc="/icons/pin.svg"
            alt="location"
            label={location}
          />
          <EventDetailsItem
            iconSrc="/icons/mode.svg"
            alt="mode"
            label={mode}
          />
          <EventDetailsItem
            iconSrc="/icons/audience.svg"
            alt="audience"
            label={audience}
          />
        </section>

        {Array.isArray(agenda) && agenda.length > 0 && (
          <EventAgenda agendaitems={agenda} />
        )}

        <section className="flex-col-gap-2">
          <h2>About the Organizer</h2>
          <p>{organizer}</p>
        </section>

        {Array.isArray(tags) && tags.length > 0 && (
          <EventTags tags={tags} />
        )}
      </div>

      {/* ================= RIGHT SIDEBAR ================= */}
      <aside className="booking">
        <div className="signup-card">
          <h2>Book your spot</h2>

          {bookings > 0 ? (
            <p className="text-sm">
              Join <strong>{bookings}</strong> people who have already booked
              their spot
            </p>
          ) : (
            <p className="text-sm">
              Be the first to book your spot
            </p>
          )}

          <Bookevent />
        </div>
      </aside>
    </div>
  </section>
);

};

export default EventDetailsPage;
