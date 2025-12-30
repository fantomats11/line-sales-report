import "./globals.css";

export const metadata = {
  title: "LINE Report App",
  description: "Created for reporting daily chats",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}