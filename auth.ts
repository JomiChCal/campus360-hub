import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== 'string' || typeof password !== 'string') return null;

        const expectedUser = process.env.ADMIN_USERNAME;
        const expectedPassword = process.env.ADMIN_PASSWORD;
        if (!expectedUser || !expectedPassword) return null;
        if (username !== expectedUser) return null;

        const ok =
          expectedPassword.startsWith('$2')
            ? await bcrypt.compare(password, expectedPassword)
            : password === expectedPassword;

        if (!ok) return null;
        return { id: 'admin', name: expectedUser };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
