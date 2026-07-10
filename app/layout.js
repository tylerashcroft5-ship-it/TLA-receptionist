export const metadata = {
  title: "TLA Systems — Control Room",
  description: "Private operations dashboard for TLA Systems' AI tools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#f4f3ef", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
