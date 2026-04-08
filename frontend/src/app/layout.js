import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export const metadata = {
  title: 'Battery Claim Management',
  description: 'Manage battery warranty claims',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
