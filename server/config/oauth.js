import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// Google OAuth - only if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });
          if (!user) {
            user = await User.create({
              username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 5),
              email: profile.emails[0].value,
              oauthProvider: 'google',
              oauthId: profile.id,
              profileImage: profile.photos[0]?.value || '',
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('✓ Google OAuth configured');
} else {
  console.log('⚠ Google OAuth not configured (missing credentials)');
}

// GitHub OAuth - only if credentials are provided
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'github' });
          if (!user) {
            user = await User.create({
              username: profile.username + Math.random().toString(36).substr(2, 5),
              email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
              oauthProvider: 'github',
              oauthId: profile.id,
              profileImage: profile.photos[0]?.value || '',
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('✓ GitHub OAuth configured');
} else {
  console.log('⚠ GitHub OAuth not configured (missing credentials)');
}

// Facebook OAuth - only if credentials are provided
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'photos', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'facebook' });
          if (!user) {
            user = await User.create({
              username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 5),
              email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
              oauthProvider: 'facebook',
              oauthId: profile.id,
              profileImage: profile.photos?.[0]?.value || '',
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('✓ Facebook OAuth configured');
} else {
  console.log('⚠ Facebook OAuth not configured (missing credentials)');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
