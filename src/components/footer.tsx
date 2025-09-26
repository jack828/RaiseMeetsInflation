import Image from "next/image"

export const Footer: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-sm text-default-500 text-center space-y-1">
      <a
        href="https://www.flaticon.com/free-icon/money_9318493?term=inflation&page=1&position=75&origin=tag&related_id=9318493"
        rel="noopener noreferrer nofollow"
        title="inflation icons"
        className="text-xs text-default-300"
      >
        Inflation icons created by Tempo_doloe - Flaticon
      </a>
      <a
        href="https://ko-fi.com/jack828"
        target="_blank"
        rel="noopener nofollow"
        className="text-blue-500 hover:text-blue-600 hover:underline"
      >
        <Image
          src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_blue.png"
          alt="Support me on Ko-fi"
          width={980 / 5}
          height={198 / 5}
        />
      </a>
      <span>
        <a href="https://jackburgess.dev">Jack Burgess</a> &copy;{' '}
        {new Date().getFullYear()}
      </span>
      <br />
      <span>Powered my tea, marmalade, and curiosity.</span>
      <br />
      <span className="font-mono">&lt;/website&gt;</span>
    </div>
  )
}
