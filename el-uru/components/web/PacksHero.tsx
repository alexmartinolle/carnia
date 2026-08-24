import Image from 'next/image'

type Props = {
  title: string
}

export default function PacksHero({ title }: Props) {
  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="relative block"
        style={{ height: 'clamp(150px, 30vw, 350px)' }}
      >
        <Image
          src="/images/hero/packs.png"
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
            {title}
          </h1>
        </div>
      </div>
    </div>
  )
}
