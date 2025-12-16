export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "React Summit 2026",
    image: "/images/event1.png",
    slug: "react-summit-2026",
    location: "Amsterdam, NL (RAI)",
    date: "June 12–13, 2026",
    time: "09:00–18:00 CET",
  },
  {
    title: "JSNation Live",
    image: "/images/event2.png",
    slug: "jsnation-live-2026",
    location: "Online + Berlin, DE",
    date: "July 17, 2026",
    time: "10:00–17:30 CET",
  },
  {
    title: "AWS re:Invent",
    image: "/images/event3.png",
    slug: "aws-reinvent-2025",
    location: "Las Vegas, NV",
    date: "Nov 30 – Dec 4, 2025",
    time: "All day",
  },
  {
    title: "GitHub Universe",
    image: "/images/event4.png",
    slug: "github-universe-2025",
    location: "San Francisco, CA",
    date: "October 21–22, 2025",
    time: "09:00–17:00 PT",
  },
  {
    title: "ETHGlobal Hackathon",
    image: "/images/event5.png",
    slug: "ethglobal-hackathon-2026",
    location: "Singapore",
    date: "March 6–8, 2026",
    time: "48-hour build",
  },
  {
    title: "Google Cloud Next",
    image: "/images/event6.png",
    slug: "google-cloud-next-2026",
    location: "San Jose, CA",
    date: "April 7–9, 2026",
    time: "08:30–17:30 PT",
  },
];

