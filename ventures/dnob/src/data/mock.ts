// ─── Types ────────────────────────────────────────────────────────────────────

export interface Peer {
  id: string;
  name: string;
  firstName: string;
  age: number;
  initials: string;
  avatarColor: string;
  avatarEmoji: string;
  hospital: string;
  weeksInTreatment: number;
  interests: string[];
  quote: string;
  bio: string;
  mutualInterests: string[];
  isOnline: boolean;
  lastActive: string;
  connectionScore: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  emoji: string;
  participantCount: number;
  isLive: boolean;
  liveLabel?: string;
  schedule: string;
  tags: string[];
  color: string;
  hostName?: string;
}

export interface Connection {
  id: string;
  peerId: string;
  status: "active" | "pending" | "meetup_requested";
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export interface HospitalEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  emoji: string;
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  description: string;
}

// ─── User (Alex) ──────────────────────────────────────────────────────────────

export const USER = {
  name: "Alex",
  firstName: "Alex",
  initials: "AL",
  avatarColor: "#6d28d9",
  age: 13,
  hospital: "Children's Hospital Los Angeles",
  weeksInTreatment: 3,
  interests: ["Basketball", "Anime", "Minecraft", "Roblox"],
  connectionsCount: 4,
  groupsCount: 2,
  friendsSince: "Feb 2026",
  mood: "good" as "great" | "good" | "okay" | "rough",
  streak: 5,
};

// ─── Peers ────────────────────────────────────────────────────────────────────

export const PEERS: Peer[] = [
  {
    id: "peer1",
    name: "Sofia",
    firstName: "Sofia",
    age: 12,
    initials: "SF",
    avatarColor: "#9d174d",
    avatarEmoji: "🎨",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 6,
    interests: ["Art", "Taylor Swift", "Watercolors", "Reading"],
    quote: "Drawing gets me through the hard days.",
    bio: "Sofia is 12 and loves making art more than almost anything. She spends most mornings painting watercolors in her room, and she knows every word to every Taylor Swift song. She is funny, creative, and always has a new drawing idea she wants to try.",
    mutualInterests: ["Music", "Creative stuff"],
    isOnline: true,
    lastActive: "Now",
    connectionScore: 91,
  },
  {
    id: "peer2",
    name: "Marcus",
    firstName: "Marcus",
    age: 14,
    initials: "MC",
    avatarColor: "#1e40af",
    avatarEmoji: "🏀",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 8,
    interests: ["NBA", "Basketball", "Video games", "Sneakers"],
    quote: "Lakers all day. Let's talk ball.",
    bio: "Marcus is 14 and a serious basketball head. He can name every player on every team and has strong opinions about everything in the NBA. When he is not watching games he is playing 2K or talking sneakers. He is laid-back, funny, and easy to talk to.",
    mutualInterests: ["Basketball"],
    isOnline: true,
    lastActive: "5m ago",
    connectionScore: 97,
  },
  {
    id: "peer3",
    name: "Lily",
    firstName: "Lily",
    age: 11,
    initials: "LY",
    avatarColor: "#065f46",
    avatarEmoji: "📚",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 4,
    interests: ["Reading", "Harry Potter", "Cats", "Board games"],
    quote: "I am on my 7th reread of Harry Potter and I have no regrets.",
    bio: "Lily is 11 and an absolute bookworm. She has read the entire Harry Potter series seven times and will happily debate which house is best for hours. She loves cats, board games, and finding people who want to talk about books as much as she does.",
    mutualInterests: ["Games", "Stories"],
    isOnline: false,
    lastActive: "1h ago",
    connectionScore: 84,
  },
  {
    id: "peer4",
    name: "Jordan",
    firstName: "Jordan",
    age: 13,
    initials: "JD",
    avatarColor: "#92400e",
    avatarEmoji: "🎮",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 2,
    interests: ["Minecraft", "Roblox", "YouTube", "Building stuff"],
    quote: "My Minecraft world has been going for two years. It is a whole thing.",
    bio: "Jordan is 13 and has been playing Minecraft since they were seven. They build elaborate stuff and love showing people their world. They also watch a ton of YouTube and always have recommendations. Super chill, easy to vibe with.",
    mutualInterests: ["Minecraft", "Roblox"],
    isOnline: true,
    lastActive: "2m ago",
    connectionScore: 95,
  },
  {
    id: "peer5",
    name: "Aiden",
    firstName: "Aiden",
    age: 15,
    initials: "AD",
    avatarColor: "#4c1d95",
    avatarEmoji: "🎵",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 10,
    interests: ["Guitar", "Music production", "Hip hop", "Anime"],
    quote: "Music is the one thing that makes me feel like myself right now.",
    bio: "Aiden is 15 and plays guitar. He has been learning for three years and just started messing with music production on his laptop. He is a big anime fan and loves hip hop. He is quiet at first but once he gets comfortable he is super genuine.",
    mutualInterests: ["Anime"],
    isOnline: false,
    lastActive: "3h ago",
    connectionScore: 88,
  },
  {
    id: "peer6",
    name: "Priya",
    firstName: "Priya",
    age: 12,
    initials: "PR",
    avatarColor: "#0e7490",
    avatarEmoji: "🌟",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 5,
    interests: ["Dancing", "K-pop", "BTS", "TikTok", "Baking"],
    quote: "K-pop got me through so many hard days. I owe BTS a lot.",
    bio: "Priya is 12 and obsessed with K-pop, especially BTS. She knows every choreography, every fun fact, and has strong opinions about every album era. She also loves to bake and is always trying new recipes. She is warm, bubbly, and really easy to talk to.",
    mutualInterests: ["Music", "Food"],
    isOnline: true,
    lastActive: "10m ago",
    connectionScore: 79,
  },
  {
    id: "peer7",
    name: "Theo",
    firstName: "Theo",
    age: 16,
    initials: "TH",
    avatarColor: "#374151",
    avatarEmoji: "🎬",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 7,
    interests: ["Movies", "Sci-fi", "Legos", "Chess"],
    quote: "If you want to talk about Dune for three hours I am your guy.",
    bio: "Theo is 16 and loves movies, especially sci-fi. He has seen Dune about eight times and has very detailed opinions about the director's cut vs the theatrical. He also builds Legos and plays chess online. Smart, funny in a dry way, really interesting to talk to.",
    mutualInterests: ["Gaming", "Creative stuff"],
    isOnline: false,
    lastActive: "Yesterday",
    connectionScore: 73,
  },
  {
    id: "peer8",
    name: "Zoe",
    firstName: "Zoe",
    age: 9,
    initials: "ZE",
    avatarColor: "#7c2d12",
    avatarEmoji: "🌈",
    hospital: "Children's Hospital Los Angeles",
    weeksInTreatment: 3,
    interests: ["Drawing", "Slime", "Roblox", "My Little Pony"],
    quote: "I made 12 slimes last week. My mom is kind of mad about it.",
    bio: "Zoe is 9 and the most enthusiastic person in any room. She loves making slime, drawing, and playing Roblox. She is a little shy at first but once she warms up she talks about everything. She is sweet, funny, and impossible not to like.",
    mutualInterests: ["Roblox", "Art"],
    isOnline: true,
    lastActive: "Just now",
    connectionScore: 82,
  },
];

// ─── Activities ───────────────────────────────────────────────────────────────

export const ACTIVITIES: Activity[] = [
  {
    id: "act1",
    name: "Art Corner",
    description: "Share what you are making. WIPs, finished pieces, doodles, whatever. No judgment, just vibes.",
    emoji: "🎨",
    participantCount: 5,
    isLive: true,
    liveLabel: "Live now",
    schedule: "Always open",
    tags: ["Creative", "Drawing", "All ages"],
    color: "#9d174d",
    hostName: "Ms. Rivera",
  },
  {
    id: "act2",
    name: "Minecraft Server",
    description: "Open world, open door. Build together, explore, or just hang out. No pressure.",
    emoji: "🎮",
    participantCount: 6,
    isLive: true,
    liveLabel: "6 playing",
    schedule: "Afternoons most days",
    tags: ["Gaming", "Minecraft", "Building"],
    color: "#1e40af",
  },
  {
    id: "act3",
    name: "Friday Movie Night",
    description: "We pick a movie together, watch it from our rooms, and chat about it. Every Friday at 7pm.",
    emoji: "🎬",
    participantCount: 12,
    isLive: false,
    schedule: "Tonight at 7 PM",
    tags: ["Movies", "Weekly", "All ages"],
    color: "#374151",
    hostName: "Ms. Okafor",
  },
  {
    id: "act4",
    name: "Music Makers",
    description: "Guitar, piano, singing, production, whatever your thing is. Share tracks, talk music, find your people.",
    emoji: "🎵",
    participantCount: 8,
    isLive: false,
    schedule: "Saturdays at 4 PM",
    tags: ["Music", "Guitar", "Creative"],
    color: "#4c1d95",
    hostName: "Aiden hosts",
  },
  {
    id: "act5",
    name: "Encouragement Wall",
    description: "Leave a note for someone going through a hard day. Read notes when you need a boost. Good energy only.",
    emoji: "🌟",
    participantCount: 38,
    isLive: false,
    schedule: "Post anytime",
    tags: ["Support", "Positivity", "Community"],
    color: "#92400e",
  },
  {
    id: "act6",
    name: "Warriors 13-15",
    description: "Just for teens 13-15 who get it. Talk about anything. Venting is welcome. Moderator always present.",
    emoji: "💜",
    participantCount: 9,
    isLive: false,
    schedule: "Tue and Thu at 5 PM",
    tags: ["Support", "Teen", "Moderated"],
    color: "#6d28d9",
    hostName: "Mr. Chen",
  },
];

// ─── Connections ──────────────────────────────────────────────────────────────

export const CONNECTIONS: Connection[] = [
  {
    id: "conn1",
    peerId: "peer2",
    status: "active",
    lastMessage: "Let's talk about that game tonight",
    lastMessageTime: "5m ago",
    unread: 2,
  },
  {
    id: "conn2",
    peerId: "peer1",
    status: "active",
    lastMessage: "I finished the drawing! Want to see it?",
    lastMessageTime: "1h ago",
    unread: 1,
  },
  {
    id: "conn3",
    peerId: "peer4",
    status: "active",
    lastMessage: "My Minecraft server is up if you want to join",
    lastMessageTime: "3h ago",
    unread: 0,
  },
  {
    id: "conn4",
    peerId: "peer5",
    status: "meetup_requested",
    lastMessage: "You should check out Music Makers this Saturday",
    lastMessageTime: "Yesterday",
    unread: 0,
  },
];

// ─── Hospital Events ───────────────────────────────────────────────────────────

export const HOSPITAL_EVENTS: HospitalEvent[] = [
  {
    id: "ev1",
    title: "Art Therapy Drop-In",
    time: "Today 2:00 PM",
    location: "Room 4B, Art Studio",
    emoji: "🎨",
  },
  {
    id: "ev2",
    title: "Game Cart Visits",
    time: "Today 3:30 PM",
    location: "All floors",
    emoji: "🎮",
  },
  {
    id: "ev3",
    title: "Movie Night: Moana 2",
    time: "Friday 7:00 PM",
    location: "Rooftop Lounge",
    emoji: "🎬",
  },
];

// ─── Badges ───────────────────────────────────────────────────────────────────

export const USER_BADGES: Badge[] = [
  { id: "b1", label: "First Connection", emoji: "🤝", earned: true, description: "Made your first friend on D-NOB" },
  { id: "b2", label: "Art Lover", emoji: "🎨", earned: true, description: "Joined Art Corner 3 times" },
  { id: "b3", label: "5-Day Streak", emoji: "🔥", earned: true, description: "Checked in 5 days in a row" },
  { id: "b4", label: "Conversation Starter", emoji: "💬", earned: true, description: "Sent the first message in 3 chats" },
  { id: "b5", label: "Activity Leader", emoji: "⭐", earned: false, description: "Join 5 different activities" },
  { id: "b6", label: "Encourager", emoji: "🌟", earned: false, description: "Leave 10 notes on the Encouragement Wall" },
];

// ─── Staff / Moderators ───────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  firstName: string;
  role: string;
  initials: string;
  avatarColor: string;
  hospital: string;
  bio: string;
  supportedKids: number;
  joinedDate: string;
  ratings: {
    responsiveness: number;
    kindness: number;
    helpfulness: number;
    availability: number;
    wouldRecommend: number;
  };
  specialties: string[];
  permitNumber: string;
  permitVerified: boolean;
}

export const STAFF: StaffMember[] = [
  {
    id: "staff1",
    name: "Ms. Rivera",
    firstName: "Rivera",
    role: "Child Life Specialist",
    initials: "MR",
    avatarColor: "#9d174d",
    hospital: "Children's Hospital Los Angeles",
    bio: "Ms. Rivera has worked with kids in treatment for 8 years. She runs Art Corner and is always the first to cheer someone up. She believes every child deserves connection and makes it her mission to build it.",
    supportedKids: 284,
    joinedDate: "Mar 2024",
    ratings: { responsiveness: 97, kindness: 99, helpfulness: 96, availability: 93, wouldRecommend: 98 },
    specialties: ["Art therapy", "Teen support", "Crisis de-escalation"],
    permitNumber: "DNOB-CHLA-2024-0012",
    permitVerified: true,
  },
  {
    id: "staff2",
    name: "Mr. Chen",
    firstName: "Chen",
    role: "Social Worker",
    initials: "MC",
    avatarColor: "#1e40af",
    hospital: "Children's Hospital Los Angeles",
    bio: "Mr. Chen helps kids navigate big feelings and hard conversations. He runs the weekly support circles and is known for his calm, patient energy. He plays chess too and will challenge anyone.",
    supportedKids: 197,
    joinedDate: "Jun 2024",
    ratings: { responsiveness: 94, kindness: 97, helpfulness: 95, availability: 91, wouldRecommend: 96 },
    specialties: ["Peer support", "Family counseling", "Group facilitation"],
    permitNumber: "DNOB-CHLA-2024-0031",
    permitVerified: true,
  },
  {
    id: "staff3",
    name: "Ms. Okafor",
    firstName: "Okafor",
    role: "Play Therapist",
    initials: "MO",
    avatarColor: "#065f46",
    hospital: "Children's Hospital Los Angeles",
    bio: "Ms. Okafor runs the Game Lounge and Friday Movie Night. She believes play is medicine and brings that energy to every session. Kids love her because she actually plays with them.",
    supportedKids: 341,
    joinedDate: "Jan 2024",
    ratings: { responsiveness: 96, kindness: 98, helpfulness: 97, availability: 94, wouldRecommend: 99 },
    specialties: ["Play therapy", "Movie nights", "Gaming sessions"],
    permitNumber: "DNOB-CHLA-2024-0008",
    permitVerified: true,
  },
];

// ─── Chat messages ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: "user" | "peer";
  text: string;
  time: string;
}

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: "msg1", senderId: "peer", text: "Hey! You like basketball too? What team?", time: "3:12 PM" },
  { id: "msg2", senderId: "user", text: "Lakers all the way. You?", time: "3:13 PM" },
  { id: "msg3", senderId: "peer", text: "Same! LeBron or AD for you?", time: "3:14 PM" },
  { id: "msg4", senderId: "user", text: "AD when he is healthy honestly. LeBron is GOAT but AD just goes different in the paint", time: "3:15 PM" },
  { id: "msg5", senderId: "peer", text: "That's a real answer. Most people just say LeBron automatically haha", time: "3:16 PM" },
  { id: "msg6", senderId: "peer", text: "You playing 2K? I am on PS5", time: "3:17 PM" },
];

// ─── Helper functions ──────────────────────────────────────────────────────────

export function getPeer(id: string): Peer | undefined {
  return PEERS.find((p) => p.id === id);
}

export function getActivity(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function getStaff(id: string): StaffMember | undefined {
  return STAFF.find((s) => s.id === id);
}

export function getConnection(peerId: string): Connection | undefined {
  return CONNECTIONS.find((c) => c.peerId === peerId);
}

export function getOnlinePeers(): Peer[] {
  return PEERS.filter((p) => p.isOnline);
}

export function getTopMatches(): Peer[] {
  return [...PEERS].sort((a, b) => b.connectionScore - a.connectionScore).slice(0, 4);
}

export function getLiveActivities(): Activity[] {
  return ACTIVITIES.filter((a) => a.isLive);
}

export function getOverallScore(staff: StaffMember): string {
  const avg = (staff.ratings.responsiveness + staff.ratings.kindness + staff.ratings.helpfulness + staff.ratings.availability + staff.ratings.wouldRecommend) / 5;
  return (avg / 20).toFixed(1);
}

// ─── Legacy compat aliases ────────────────────────────────────────────────────

export type Drop = Peer;
export type Cook = StaffMember;
export const COOKS: StaffMember[] = STAFF;
export const MODERATORS: StaffMember[] = STAFF;
export const GROUP_ROOMS = ACTIVITIES;

export function getDrop(id: string): Peer | undefined { return getPeer(id); }
export function getCook(id: string): StaffMember | undefined { return getStaff(id); }
export function getCookDrops(staffId: string): Peer[] {
  const idx = STAFF.findIndex((s) => s.id === staffId);
  if (idx === -1) return [];
  return PEERS.slice(idx * 2, idx * 2 + 3);
}
export function getCookOrders(_id: string): Connection[] { return CONNECTIONS; }
export function getTonightDrops(): Peer[] { return getTopMatches(); }
export function getTomorrowDrops(): Peer[] { return PEERS.slice(4, 7); }
export function getGroupRoom(id: string): Activity | undefined { return getActivity(id); }
export function getModerator(id: string): StaffMember | undefined { return getStaff(id); }

export const SILO_FEE = 0;
export const ALLERGEN_LABELS = {} as Record<string, string>;
export type AllergenKey = string;
export type DietaryTag = string;
export type CookOrder = Connection;
export const COOK_ORDERS: Connection[] = CONNECTIONS;
export const PAST_ORDERS: { id: string; dishName: string; cookName: string; neighborhood: string; date: string; pickupTime: string; total: number }[] = [];
export const USER_STATS = {
  favoriteCategory: "Gaming",
  avgSpend: 0,
  topNeighborhood: "Children's Hospital LA",
  savedAmount: 0,
  ordersCount: USER.connectionsCount,
  totalSpent: 0,
  cooksCount: USER.groupsCount,
};
export function parsePickupMinutes(_timeStr: string): number { return 0; }
export function Macros() { return null; }
