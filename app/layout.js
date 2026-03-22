export const metadata = {
  title: 'Meredith Heller - Software Engineer',
  description: 'Portfolio of Meredith Heller, a growth-minded software engineer obsessed with building products users actually come back to.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
