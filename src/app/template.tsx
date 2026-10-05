// Template dirender ulang di setiap navigasi → transisi masuk halus antar halaman.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in flex w-full flex-1 flex-col">{children}</div>;
}
