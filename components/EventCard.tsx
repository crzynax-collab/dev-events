import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  image: string | StaticImageData;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  const hasImage =
    typeof image === "string" ? image.trim().length > 0 : Boolean(image);

  const isRemoteStringImage =
    typeof image === "string" && image.trim().length > 0 && image.startsWith("http");

  return (
    <Link href={`/Events/${slug}`} id="Event-card">
      {hasImage && (
        isRemoteStringImage ? (
          // Use a plain <img> for remote URLs to avoid any Next image config issues
          <img
            src={image as string}
            alt={title}
            width={410}
            height={300}
            className="poster"
          />
        ) : (
          <Image
            src={image}
            alt={title}
            width={410}
            height={300}
            className="poster"
          />
        )
      )}

      <div className=" flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />

        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <div className="date">
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
          <p>{date}</p>
        </div>
        <div className="time">
          <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div> 
    </Link>
  );
};

export default EventCard
