import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { cacheLife } from "next/cache";
import SearchEvents from "@/components/SearchEvents";

type EventCardData = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

const page = async () => {
  "use cache";
  cacheLife("hours");

  let events: EventCardData[] = [];

  try {
    await connectDB();

    const rawEvents = await Event.find()
      .sort({ createdAt: -1 })
      .select("title image slug location date time") // don't select _id
      .lean();

    // ✅ convert to plain JSON-safe objects
    events = rawEvents.map((e: any) => ({
      title: e.title,
      image: e.image,
      slug: e.slug,
      location: e.location,
      date: e.date,
      time: e.time,
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    events = [];
  }

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can't Miss
      </h1>

      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <ExploreBtn />

      {/* 🔍 search with suggestions */}
      <SearchEvents events={events} />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.slug} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
