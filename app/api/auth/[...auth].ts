import { passportAuth } from "blitz"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import db from "db"

export default passportAuth({
  successRedirectUrl: "/",
  errorRedirectUrl: "/",
  strategies: [
    {
      strategy: new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          scope: ["profile", "email"],
          callbackURL: "http://localhost:3000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          const email = profile.emails && profile.emails[0]?.value

          if (!email) {
            return done(new Error("Google OAuth response doesn't have email."))
          }

          const user = await db.user.upsert({
            where: { email },
            create: {
              email,
              name: profile.displayName,
            },
            update: { email },
          })
          const publicData = {
            userId: user.id,
            roles: [user.role],
            source: "google",
          }
          done(null, { publicData })
        }
      ),
    },
  ],
})
