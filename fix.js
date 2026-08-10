const fs = require('fs');
let content = fs.readFileSync('src/data/youtube.ts', 'utf8');
content = content.replace('import { YouTubeVideo } from "./types";', 'import { YouTubeVideo, YouTubeChannel } from "../types";\n\nexport const FEATURED_YOUTUBE_CHANNEL: YouTubeChannel = {\n  id: "stock_bloc_official",\n  channelName: "Stock Bloc",\n  handle: "@stockbloc",\n  subscribers: "Official Channel",\n  avatarUrl: "https://yt3.ggpht.com/ytc/AIdro_k2L0qO5kKzOQ0uOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOq=s88-c-k-c0x00ffffff-no-rj",\n  bannerUrl: "https://yt3.ggpht.com/OqOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOqQ0qOq=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj"\n};\n');
fs.writeFileSync('src/data/youtube.ts', content);
