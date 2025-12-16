import Image from "next/image"
import Link from "next/link"

const ExploreBtn = () => {
  return (
    <div className="mt-7 flex justify-center">
      <Link
        href="#events"
        className="flex items-center gap-2 rounded-full px-6 py-3 
                   bg-white/10 backdrop-blur 
                   border border-white/20 
                   text-white hover:bg-white/20 transition"
      >
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={20}
          height={20}
        />
      </Link>
    </div>
  )
}

export default ExploreBtn
