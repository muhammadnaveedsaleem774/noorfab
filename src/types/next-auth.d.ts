/* NextAuth type augmentations - JWT only. Session is augmented in route to avoid shadowing next-auth default export. */
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
