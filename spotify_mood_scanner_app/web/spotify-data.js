// Spotify Mood Scanner - Song Recommendations Database
window.moodSongs = {
  happy: {
    emoji: "😊",
    color: "#FFD700",
    songs: [
      { title: "Good as Hell", artist: "Lizzo", duration: "3:38", emoji: "🎤" },
      { title: "Walking on Sunshine", artist: "Katrina & The Waves", duration: "3:43", emoji: "☀️" },
      { title: "Don't Stop Me Now", artist: "Queen", duration: "3:36", emoji: "🎸" },
      { title: "Levitating", artist: "Dua Lipa", duration: "3:23", emoji: "✨" },
      { title: "Shut Up and Dance", artist: "Walk the Moon", duration: "3:31", emoji: "💃" },
      { title: "Here Comes the Sun", artist: "The Beatles", duration: "3:06", emoji: "🌞" },
      { title: "Pompeii", artist: "Bastille", duration: "3:35", emoji: "🎵" },
      { title: "Walking on Sunshine", artist: "Walk the Moon", duration: "5:07", emoji: "🌈" },
      { title: "Young Folks", artist: "Peter Bjorn and John", duration: "2:51", emoji: "🎶" },
      { title: "Mr. Brightside", artist: "The Killers", duration: "3:43", emoji: "👑" },
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", duration: "4:30", emoji: "🔥" },
      { title: "Good Day", artist: "Macklemore & Ryan Lewis", duration: "5:40", emoji: "⭐" }
    ]
  },

  angry: {
    emoji: "😠",
    color: "#FF4444",
    songs: [
      { title: "Killing in the Name", artist: "Rage Against the Machine", duration: "3:18", emoji: "💥" },
      { title: "War", artist: "U2", duration: "3:32", emoji: "⚔️" },
      { title: "Rage All Over Me", artist: "Gary Numan", duration: "4:12", emoji: "🔥" },
      { title: "Sabotage", artist: "Beastie Boys", duration: "2:47", emoji: "💣" },
      { title: "The Way", artist: "Disturbed", duration: "3:51", emoji: "🤘" },
      { title: "Toxicity", artist: "System of a Down", duration: "3:11", emoji: "☠️" },
      { title: "Break It Off", artist: "Danger! Danger!", duration: "3:29", emoji: "💪" },
      { title: "Burn", artist: "Usher", duration: "4:01", emoji: "🔥" },
      { title: "Last Resort", artist: "Papa Roach", duration: "3:24", emoji: "🖤" },
      { title: "Scream", artist: "Avenged Sevenfold", duration: "3:47", emoji: "😤" },
      { title: "Monster", artist: "Sia", duration: "3:46", emoji: "👹" },
      { title: "Renegade", artist: "Stink Foot", duration: "4:15", emoji: "⚡" }
    ]
  },

  sad: {
    emoji: "😢",
    color: "#4169E1",
    songs: [
      { title: "Someone Like You", artist: "Adele", duration: "3:45", emoji: "💔" },
      { title: "The Night We Met", artist: "Lord Huron", duration: "3:26", emoji: "🌃" },
      { title: "Tears in Heaven", artist: "Eric Clapton", duration: "4:34", emoji: "😭" },
      { title: "Black", artist: "Pearl Jam", duration: "5:32", emoji: "🖤" },
      { title: "Sad Beautiful Tragic", artist: "Taylor Swift", duration: "5:41", emoji: "💫" },
      { title: "Hurt", artist: "Johnny Cash", duration: "3:38", emoji: "😢" },
      { title: "Yesterday", artist: "The Beatles", duration: "2:05", emoji: "🌧️" },
      { title: "The Sound of Silence", artist: "Simon & Garfunkel", duration: "3:59", emoji: "🎵" },
      { title: "Skinny Love", artist: "Bon Iver", duration: "3:58", emoji: "🎻" },
      { title: "Mad World", artist: "Gary Jules", duration: "3:22", emoji: "🌙" },
      { title: "Everybody Hurts", artist: "R.E.M.", duration: "3:46", emoji: "💔" },
      { title: "Creep", artist: "Radiohead", duration: "3:56", emoji: "😔" }
    ]
  },

  tired: {
    emoji: "😴",
    color: "#A9A9A9",
    songs: [
      { title: "Weightless", artist: "Marconi Union", duration: "8:02", emoji: "☁️" },
      { title: "Clair de lune", artist: "Claude Debussy", duration: "4:39", emoji: "🌙" },
      { title: "Peaceful Piano", artist: "Spotify Playlist", duration: "3:45", emoji: "🎹" },
      { title: "Sleep", artist: "Vitamin String Quartet", duration: "4:10", emoji: "💤" },
      { title: "Miserere Mei, Deus", artist: "Gregorio Allegri", duration: "8:44", emoji: "🙏" },
      { title: "Relaxing Classical", artist: "George Frideric Handel", duration: "5:30", emoji: "🎼" },
      { title: "Gymnopédie No. 1", artist: "Erik Satie", duration: "2:57", emoji: "🧘" },
      { title: "Nocturne No. 2", artist: "Frédéric Chopin", duration: "4:32", emoji: "🌟" },
      { title: "Ambient 1: Music for Airports", artist: "Brian Eno", duration: "6:30", emoji: "✈️" },
      { title: "Sleeping Music", artist: "Nature Sounds", duration: "7:18", emoji: "🌿" },
      { title: "Serenity", artist: "Enya", duration: "4:36", emoji: "🏔️" },
      { title: "Dream", artist: "Julee Cruise", duration: "3:16", emoji: "💭" }
    ]
  },

  focused: {
    emoji: "🎯",
    color: "#2d2d44",
    songs: [
      { title: "lo-fi hip hop radio", artist: "ChilledCow", duration: "3:15", emoji: "🎧" },
      { title: "Study Session", artist: "Spotify", duration: "4:20", emoji: "📚" },
      { title: "Brain Food", artist: "Spotify", duration: "3:45", emoji: "🧠" },
      { title: "Deep Focus", artist: "Spotify", duration: "5:10", emoji: "🔬" },
      { title: "Synthwave", artist: "The Midnight", duration: "4:00", emoji: "🌃" },
      { title: "Neon Dreams", artist: "Kavinsky", duration: "3:37", emoji: "💻" },
      { title: "Cinema", artist: "Bensound", duration: "4:02", emoji: "🎬" },
      { title: "Piano for Studying", artist: "Spotify", duration: "3:28", emoji: "🎹" },
      { title: "Focus Beats", artist: "Spotify", duration: "4:15", emoji: "⚡" },
      { title: "Coding Music", artist: "Various Artists", duration: "4:50", emoji: "💾" },
      { title: "Instrumental Lofi", artist: "Spotify", duration: "3:55", emoji: "🎵" },
      { title: "Zen Focus", artist: "Spotify", duration: "4:30", emoji: "🧘" }
    ]
  },

  calm: {
    emoji: "😌",
    color: "#20B2AA",
    songs: [
      { title: "Perfect", artist: "Ed Sheeran", duration: "4:23", emoji: "💕" },
      { title: "Someone Like You", artist: "Adele", duration: "3:45", emoji: "💝" },
      { title: "Skinny Love", artist: "Bon Iver", duration: "3:58", emoji: "🎻" },
      { title: "Re: Stacks", artist: "Bon Iver", duration: "3:31", emoji: "❄️" },
      { title: "The Night We Met", artist: "Lord Huron", duration: "3:26", emoji: "🌙" },
      { title: "She Will Be Loved", artist: "Maroon 5", duration: "3:51", emoji: "💕" },
      { title: "White Houses", artist: "Vanessa Carlton", duration: "3:45", emoji: "🏠" },
      { title: "Home", artist: "Edward Sharpe & The Magnetic Zeros", duration: "5:43", emoji: "🏡" },
      { title: "Falling Slowly", artist: "Glen Hansard & Markéta Irglová", duration: "3:35", emoji: "🍂" },
      { title: "Such Great Heights", artist: "The Postal Service", duration: "3:34", emoji: "🏔️" },
      { title: "Collatz", artist: "Phoenix", duration: "3:47", emoji: "🌌" },
      { title: "Yellow", artist: "Coldplay", duration: "4:26", emoji: "💛" }
    ]
  },

  neutral: {
    emoji: "😐",
    color: "#1a1a1a",
    songs: [
      { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", emoji: "💫" },
      { title: "As It Was", artist: "Harry Styles", duration: "3:13", emoji: "✨" },
      { title: "Heat Waves", artist: "Glass Animals", duration: "3:59", emoji: "🌊" },
      { title: "Watermelon Sugar", artist: "Harry Styles", duration: "2:54", emoji: "🍉" },
      { title: "Peaches", artist: "Justin Bieber ft. Daniel Caesar & Giveon", duration: "3:18", emoji: "🍑" },
      { title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", emoji: "💯" },
      { title: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", emoji: "🎭" },
      { title: "Taste", artist: "Sabrina Carpenter", duration: "3:19", emoji: "👅" },
      { title: "Vampire", artist: "Olivia Rodrigo", duration: "3:49", emoji: "🧛" },
      { title: "Summer of Love", artist: "various", duration: "3:25", emoji: "☀️" },
      { title: "Casual", artist: "various artists", duration: "3:40", emoji: "😎" },
      { title: "Current Hits", artist: "Spotify Mix", duration: "3:35", emoji: "🔥" }
    ]
  }
};

console.log("[spotify-data.js] Loaded with", Object.keys(window.moodSongs).length, "moods");
