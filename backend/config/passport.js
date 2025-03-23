const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,  
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
  scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // First, try to find a user by googleId.
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // If not found, try to find by email.
      user = await User.findOne({ email: profile.emails[0].value });
    }
    
    if (!user) {
      // If no user exists, create one.
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        role: "student"  // Default role
      });
    } else {
      // Update tokens and googleId if necessary.
      user.googleId = profile.id;
      user.googleAccessToken = accessToken;
      user.googleRefreshToken = refreshToken;
    }
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));


module.exports = passport;
