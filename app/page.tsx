import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { Event } from "@/database"
import connectDB from "@/lib/mongodb"
import { cacheLife } from "next/cache";
import { cache } from "react";

type EventCardData = {
  title: string; 
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

const page = async () => {
 'use cache';
 cacheLife('hours')
  let rawEvents: EventCardData[] = [];
  try {
    await connectDB();

    rawEvents = await Event.find()
      .sort({ createdAt: -1 })
      .select("title image slug location date time")
      .lean<EventCardData[]>();
  } catch (error) {
    // Server-side logging only - don't leak internals to the client
    console.error("Error connecting to DB or fetching events:", error);
    // Fallback to an empty array so the page can still render safely
    rawEvents = [];
  }

  const events: EventCardData[] = rawEvents.map((event) => ({
    title: event.title,
    image: event.image,
    slug: event.slug,
    location: event.location,
    date: event.date,
    time: event.time,
  }));

  return (
    <section>
    <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
    <p className="text-center mt-5">Hackthons, Meetups, and Conferences, All in One Place </p>

<ExploreBtn />

<div className="mt-20 space-y-7">
     <h3>Featured Events</h3>
    
      <ul className="events">
        {events && events.length > 0 &&
          events.map((event) => (
            <li key={event.slug} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
      </ul>
</div>
    
    </section>
  )
}

export default page