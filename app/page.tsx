import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-10">Qstash</h1>
      <div className="flex justify-center items-center gap-4 mt-10">
        <Link href="/pdf-to-qrcode" className="text-blue-500">
        
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">

        PDF to QR Code

        </button>
   
        
        
        </Link>
        <Link href="/validate-qstash" className="text-blue-500">
        
        
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">

        Validate Qstash

        </button>
        </Link>
      </div>
    </div>
  );
}
