export type TQuoteDataItem = {
    id: string;
    name: string;
    font: {
        name: string;
        url: string;
    };
    backgroundImageUrl: string;
    previewText: string;
    textColor: string;
    accentColor: string;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type TQuoteDataSection = {
    section: string;
    label: string;
    items: TQuoteDataItem[];
}

export const formatBackgroundImagesUrl = (name: string) => {
    const parts = name.split("/");
    const lastPart = parts[parts.length - 1];
    const newLastPart = lastPart.replace(".jpg", `_1000x1000.jpg`);
    parts[parts.length - 1] = newLastPart;
    const newName = parts.join("%2F");
    return `https://firebasestorage.googleapis.com/v0/b/bible-web-fae69.appspot.com/o/${newName}?alt=media`;
}

export const QUOTES_DATA: TQuoteDataSection[] = [
    {
        "section": "home",
        "label": "Hogar",
        "items": [
            {
                "id": "recents-classic-script",
                "name": "Classic Script",
                "font": {
                    "name": "Playfair Display",
                    "url": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFD700",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-modern-lines",
                "name": "Modern Lines",
                "font": {
                    "name": "Montserrat",
                    "url": "https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#00A8E8",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-minimal-shelf",
                "name": "Minimal Shelf",
                "font": {
                    "name": "Lato",
                    "url": "https://fonts.googleapis.com/css2?family=Lato:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#E07A5F",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-cozy-cafe",
                "name": "Cozy Cafe",
                "font": {
                    "name": "Crimson Text",
                    "url": "https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#C08497",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-ocean-still",
                "name": "Ocean Still",
                "font": {
                    "name": "Roboto",
                    "url": "https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#2C3E50",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-forest-path",
                "name": "Forest Path",
                "font": {
                    "name": "Libre Baskerville",
                    "url": "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#56A36C",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-sky-view",
                "name": "Sky View",
                "font": {
                    "name": "Poppins",
                    "url": "https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#2980B9",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-neon-glow",
                "name": "Neon Glow",
                "font": {
                    "name": "Orbitron",
                    "url": "https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_8.jpg"),
                "previewText": "ABCD",
                "textColor": "#F0F0F0",
                "accentColor": "#FF00FF",
                "textTransform": "uppercase"
            },
            {
                "id": "recents-parchment",
                "name": "Parchment",
                "font": {
                    "name": "Cormorant Garamond",
                    "url": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#4a2c2a",
                "accentColor": "#8B4513",
                "textTransform": "capitalize"
            },
            {
                "id": "recents-bold-concrete",
                "name": "Bold Concrete",
                "font": {
                    "name": "Bebas Neue",
                    "url": "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/home__image_10.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#FFC107",
                "textTransform": "uppercase"
            }
        ]
    },
    {
        "section": "music",
        "label": "Música",
        "items": [
            {
                "id": "music-vinyl-record",
                "name": "Vinyl Record",
                "font": {
                    "name": "Pacifico",
                    "url": "https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFD700",
                "textTransform": "capitalize"
            },
            {
                "id": "music-jazz-night",
                "name": "Jazz Night",
                "font": {
                    "name": "Lobster Two",
                    "url": "https://fonts.googleapis.com/css2?family=Lobster+Two&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#E0C097",
                "accentColor": "#4A2C2A",
                "textTransform": "capitalize"
            },
            {
                "id": "music-rock-stage",
                "name": "Rock Stage",
                "font": {
                    "name": "Bebas Neue",
                    "url": "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_3.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#E53935",
                "textTransform": "uppercase"
            },
            {
                "id": "music-classic-notes",
                "name": "Classic Notes",
                "font": {
                    "name": "Cormorant Garamond",
                    "url": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#2C2C2C",
                "accentColor": "#D4AF37",
                "textTransform": "capitalize"
            },
            {
                "id": "music-electric-synth",
                "name": "Electric Synth",
                "font": {
                    "name": "Orbitron",
                    "url": "https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_5.jpg"),
                "previewText": "ABCD",
                "textColor": "#00FFFF",
                "accentColor": "#FF00FF",
                "textTransform": "uppercase"
            },
            {
                "id": "music-urban-rap",
                "name": "Urban Rap",
                "font": {
                    "name": "Anton",
                    "url": "https://fonts.googleapis.com/css2?family=Anton&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_6.jpg"),
                "previewText": "ABCD",
                "textColor": "#F5F5F5",
                "accentColor": "#212121",
                "textTransform": "uppercase"
            },
            {
                "id": "music-piano-elegance",
                "name": "Piano Elegance",
                "font": {
                    "name": "Playfair Display",
                    "url": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#000000",
                "accentColor": "#C0A060",
                "textTransform": "capitalize"
            },
            {
                "id": "music-disco-glow",
                "name": "Disco Glow",
                "font": {
                    "name": "Monoton",
                    "url": "https://fonts.googleapis.com/css2?family=Monoton&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_8.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#FF69B4",
                "textTransform": "uppercase"
            },
            {
                "id": "music-acoustic-warmth",
                "name": "Acoustic Warmth",
                "font": {
                    "name": "Kalam",
                    "url": "https://fonts.googleapis.com/css2?family=Kalam:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#4B2E05",
                "accentColor": "#FFDAB9",
                "textTransform": "capitalize"
            },
            {
                "id": "music-festival-vibes",
                "name": "Festival Vibes",
                "font": {
                    "name": "Fredoka One",
                    "url": "https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/music__image_10.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFF8E1",
                "accentColor": "#FF5722",
                "textTransform": "uppercase"
            }
        ]
    },
    {
        "section": "seasonal",
        "label": "Estaciones",
        "items": [
            {
                "id": "seasonal-spring-blossom",
                "name": "Spring Blossom",
                "font": {
                    "name": "Great Vibes",
                    "url": "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#FFC0CB",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-summer-beach",
                "name": "Summer Beach",
                "font": {
                    "name": "Kaushan Script",
                    "url": "https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_14.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#00BFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-autumn-leaves",
                "name": "Autumn Leaves",
                "font": {
                    "name": "Crimson Text",
                    "url": "https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#D2691E",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-winter-snow",
                "name": "Winter Snow",
                "font": {
                    "name": "Quicksand",
                    "url": "https://fonts.googleapis.com/css2?family=Quicksand:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#1E3A5F",
                "accentColor": "#ADD8E6",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-pumpkin-spice",
                "name": "Pumpkin Spice",
                "font": {
                    "name": "Satisfy",
                    "url": "https://fonts.googleapis.com/css2?family=Satisfy&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#E67E22",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-april-showers",
                "name": "April Showers",
                "font": {
                    "name": "Indie Flower",
                    "url": "https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#F5F5F5",
                "accentColor": "#4682B4",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-golden-hour",
                "name": "Golden Hour",
                "font": {
                    "name": "Sacramento",
                    "url": "https://fonts.googleapis.com/css2?family=Sacramento&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFD700",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-first-frost",
                "name": "First Frost",
                "font": {
                    "name": "Raleway",
                    "url": "https://fonts.googleapis.com/css2?family=Raleway:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_8.jpg"),
                "previewText": "Abcd",
                "textColor": "#111111",
                "accentColor": "#B0C4DE",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-holiday-cheer",
                "name": "Holiday Cheer",
                "font": {
                    "name": "Tangerine",
                    "url": "https://fonts.googleapis.com/css2?family=Tangerine:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#DC143C",
                "textTransform": "capitalize"
            },
            {
                "id": "seasonal-new-year",
                "name": "New Year Sparkle",
                "font": {
                    "name": "Rajdhani",
                    "url": "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/seasonal__image_10.jpg"),
                "previewText": "ABCD",
                "textColor": "#F0E68C",
                "accentColor": "#FFFFFF",
                "textTransform": "uppercase"
            }
        ]
    },
    {
        "section": "calm",
        "label": "Calma",
        "items": [
            {
                "id": "calm-misty-morning",
                "name": "Misty Morning",
                "font": {
                    "name": "Lato",
                    "url": "https://fonts.googleapis.com/css2?family=Lato:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#BDBDBD",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-quiet-lake",
                "name": "Quiet Lake",
                "font": {
                    "name": "Noto Serif",
                    "url": "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#A9A9A9",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-zen-garden",
                "name": "Zen Garden",
                "font": {
                    "name": "Cormorant Garamond",
                    "url": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#2F4F4F",
                "accentColor": "#6B8E23",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-cozy-fireplace",
                "name": "Cozy Fireplace",
                "font": {
                    "name": "Libre Baskerville",
                    "url": "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFA500",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-rainy-window",
                "name": "Rainy Window",
                "font": {
                    "name": "Josefin Sans",
                    "url": "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#F5F5F5",
                "accentColor": "#778899",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-pastel-sunset",
                "name": "Pastel Sunset",
                "font": {
                    "name": "Raleway",
                    "url": "https://fonts.googleapis.com/css2?family=Raleway:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#4B0082",
                "accentColor": "#FFFFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-soft-linen",
                "name": "Soft Linen",
                "font": {
                    "name": "Quicksand",
                    "url": "https://fonts.googleapis.com/css2?family=Quicksand:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#555555",
                "accentColor": "#8C7853",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-gentle-waves",
                "name": "Gentle Waves",
                "font": {
                    "name": "Open Sans",
                    "url": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_8.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#9ACD32",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-reading-nook",
                "name": "Reading Nook",
                "font": {
                    "name": "Merriweather",
                    "url": "https://fonts.googleapis.com/css2?family=Merriweather:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#363636",
                "accentColor": "#A0522D",
                "textTransform": "capitalize"
            },
            {
                "id": "calm-lavender-field",
                "name": "Lavender Field",
                "font": {
                    "name": "Caveat",
                    "url": "https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/calm__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#E6E6FA",
                "textTransform": "capitalize"
            }
        ]
    },
    {
        "section": "animals",
        "label": "Animales",
        "items": [
            {
                "id": "people-mountain-hiker",
                "name": "Mountain Hiker",
                "font": {
                    "name": "Oswald",
                    "url": "https://fonts.googleapis.com/css2?family=Oswald:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_1.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#FF8C00",
                "textTransform": "uppercase"
            },
            {
                "id": "people-city-crowd",
                "name": "City Crowd",
                "font": {
                    "name": "Roboto Condensed",
                    "url": "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFFF00",
                "textTransform": "capitalize"
            },
            {
                "id": "people-friends-laughing",
                "name": "Friends Laughing",
                "font": {
                    "name": "Poppins",
                    "url": "https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#111111",
                "accentColor": "#FF69B4",
                "textTransform": "capitalize"
            },
            {
                "id": "people-hands-together",
                "name": "Hands Together",
                "font": {
                    "name": "Lato",
                    "url": "https://fonts.googleapis.com/css2?family=Lato:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#4CAF50",
                "textTransform": "capitalize"
            },
            {
                "id": "people-festival-lights",
                "name": "Festival Lights",
                "font": {
                    "name": "Allura",
                    "url": "https://fonts.googleapis.com/css2?family=Allura&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#F0F0F0",
                "accentColor": "#DA70D6",
                "textTransform": "capitalize"
            },
            {
                "id": "people-cafe-conversation",
                "name": "Cafe Conversation",
                "font": {
                    "name": "Open Sans",
                    "url": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#CD853F",
                "textTransform": "capitalize"
            },
            {
                "id": "people-silhouette-sunset",
                "name": "Silhouette at Sunset",
                "font": {
                    "name": "Dancing Script",
                    "url": "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FF4500",
                "textTransform": "capitalize"
            },
            {
                "id": "people-urban-explorer",
                "name": "Urban Explorer",
                "font": {
                    "name": "Anton",
                    "url": "https://fonts.googleapis.com/css2?family=Anton&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_8.jpg"),
                "previewText": "ABCD",
                "textColor": "#FDD835",
                "accentColor": "#FFFFFF",
                "textTransform": "uppercase"
            },
            {
                "id": "people-community-garden",
                "name": "Community Garden",
                "font": {
                    "name": "Caveat",
                    "url": "https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#3A5F0B",
                "accentColor": "#FFFFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "people-street-performer",
                "name": "Street Performer",
                "font": {
                    "name": "Righteous",
                    "url": "https://fonts.googleapis.com/css2?family=Righteous&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/animals__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFD700",
                "textTransform": "capitalize"
            }
        ]
    },
    {
        "section": "books",
        "label": "Libros",
        "items": [
            {
                "id": "minimal-clean-white",
                "name": "Clean White",
                "font": {
                    "name": "Roboto",
                    "url": "https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#CCCCCC",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-simple-geometry",
                "name": "Simple Geometry",
                "font": {
                    "name": "Montserrat",
                    "url": "https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#2c3e50",
                "accentColor": "#e74c3c",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-black-and-white",
                "name": "Black & White",
                "font": {
                    "name": "Source Code Pro",
                    "url": "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#888888",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-subtle-texture",
                "name": "Subtle Texture",
                "font": {
                    "name": "Lato",
                    "url": "https://fonts.googleapis.com/css2?family=Lato:wght@300&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#5A5A5A",
                "accentColor": "#BDBDBD",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-single-leaf",
                "name": "Single Leaf",
                "font": {
                    "name": "Cormorant Garamond",
                    "url": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#264653",
                "accentColor": "#2a9d8f",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-gradient-fade",
                "name": "Gradient Fade",
                "font": {
                    "name": "Quicksand",
                    "url": "https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#F0F0F0",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-concrete-wall",
                "name": "Concrete Wall",
                "font": {
                    "name": "Oswald",
                    "url": "https://fonts.googleapis.com/css2?family=Oswald:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_7.jpg"),
                "previewText": "ABCD",
                "textColor": "#1a1a1a",
                "accentColor": "#666666",
                "textTransform": "uppercase"
            },
            {
                "id": "minimal-shadow-play",
                "name": "Shadow Play",
                "font": {
                    "name": "Playfair Display",
                    "url": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_8.jpg"),
                "previewText": "Abcd",
                "textColor": "#222222",
                "accentColor": "#888888",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-neutral-tones",
                "name": "Neutral Tones",
                "font": {
                    "name": "Raleway",
                    "url": "https://fonts.googleapis.com/css2?family=Raleway:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#706c61",
                "accentColor": "#b2a49e",
                "textTransform": "capitalize"
            },
            {
                "id": "minimal-fine-line",
                "name": "Fine Line",
                "font": {
                    "name": "Josefin Sans",
                    "url": "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/books__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#1d3557",
                "accentColor": "#457b9d",
                "textTransform": "capitalize"
            }
        ]
    },
    {
        "section": "nature",
        "label": "Naturaleza",
        "items": [
            {
                "id": "nature-forest-canopy",
                "name": "Forest Canopy",
                "font": {
                    "name": "Merriweather",
                    "url": "https://fonts.googleapis.com/css2?family=Merriweather:wght@400&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#90EE90",
                "textTransform": "capitalize"
            },
            {
                "id": "nature-ocean-deep",
                "name": "Ocean Deep",
                "font": {
                    "name": "Poppins",
                    "url": "https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#F0F8FF",
                "accentColor": "#1E90FF",
                "textTransform": "capitalize"
            },
            {
                "id": "nature-mountain-peak",
                "name": "Mountain Peak",
                "font": {
                    "name": "Anton",
                    "url": "https://fonts.googleapis.com/css2?family=Anton&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_3.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#C0C0C0",
                "textTransform": "uppercase"
            },
            {
                "id": "nature-desert-dunes",
                "name": "Desert Dunes",
                "font": {
                    "name": "Cinzel",
                    "url": "https://fonts.googleapis.com/css2?family=Cinzel:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#46301e",
                "accentColor": "#FFFFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "nature-lush-waterfall",
                "name": "Lush Waterfall",
                "font": {
                    "name": "Dancing Script",
                    "url": "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#20B2AA",
                "textTransform": "capitalize"
            },
            {
                "id": "nature-wildflowers",
                "name": "Wildflowers",
                "font": {
                    "name": "Caveat",
                    "url": "https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#2E2D2D",
                "accentColor": "#8A2BE2",
                "textTransform": "capitalize"
            },
            {
                "id": "nature-starry-night",
                "name": "Starry Night",
                "font": {
                    "name": "Orbitron",
                    "url": "https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_7.jpg"),
                "previewText": "ABCD",
                "textColor": "#F5F5F5",
                "accentColor": "#FFD700",
                "textTransform": "uppercase"
            },
            {
                "id": "nature-canyon-vista",
                "name": "Canyon Vista",
                "font": {
                    "name": "Bebas Neue",
                    "url": "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_8.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#CD5C5C",
                "textTransform": "uppercase"
            },
            {
                "id": "nature-northern-lights",
                "name": "Northern Lights",
                "font": {
                    "name": "Rajdhani",
                    "url": "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#39FF14",
                "textTransform": "capitalize"
            },
            {
                "id": "nature-redwood-giants",
                "name": "Redwood Giants",
                "font": {
                    "name": "Abril Fatface",
                    "url": "https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/nature__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#FDF5E6",
                "accentColor": "#8B4513",
                "textTransform": "capitalize"
            }
        ]
    },
    {
        "section": "objects",
        "label": "Objetos",
        "items": [
            {
                "id": "urban-city-lights",
                "name": "City Lights",
                "font": {
                    "name": "Monoton",
                    "url": "https://fonts.googleapis.com/css2?family=Monoton&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_1.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#FF00FF",
                "textTransform": "uppercase"
            },
            {
                "id": "urban-skyscraper-view",
                "name": "Skyscraper View",
                "font": {
                    "name": "Bebas Neue",
                    "url": "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_2.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#00BFFF",
                "textTransform": "uppercase"
            },
            {
                "id": "urban-cobblestone-street",
                "name": "Cobblestone Street",
                "font": {
                    "name": "IM Fell English SC",
                    "url": "https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#F5DEB3",
                "accentColor": "#FFFFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "urban-graffiti-wall",
                "name": "Graffiti Wall",
                "font": {
                    "name": "Permanent Marker",
                    "url": "https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFFF00",
                "textTransform": "capitalize"
            },
            {
                "id": "urban-subway-motion",
                "name": "Subway Motion",
                "font": {
                    "name": "Archivo Black",
                    "url": "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_5.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#FFD700",
                "textTransform": "uppercase"
            },
            {
                "id": "urban-rooftop-sunset",
                "name": "Rooftop Sunset",
                "font": {
                    "name": "Kaushan Script",
                    "url": "https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FF4500",
                "textTransform": "capitalize"
            },
            {
                "id": "urban-modern-architecture",
                "name": "Modern Architecture",
                "font": {
                    "name": "Montserrat",
                    "url": "https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#2C3E50",
                "accentColor": "#3498DB",
                "textTransform": "capitalize"
            },
            {
                "id": "urban-busy-intersection",
                "name": "Busy Intersection",
                "font": {
                    "name": "Oswald",
                    "url": "https://fonts.googleapis.com/css2?family=Oswald:wght@500&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_8.jpg"),
                "previewText": "ABCD",
                "textColor": "#FFFFFF",
                "accentColor": "#F1C40F",
                "textTransform": "uppercase"
            },
            {
                "id": "urban-industrial-loft",
                "name": "Industrial Loft",
                "font": {
                    "name": "Roboto Condensed",
                    "url": "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#B8860B",
                "textTransform": "capitalize"
            },
            {
                "id": "urban-night-drive",
                "name": "Night Drive",
                "font": {
                    "name": "Righteous",
                    "url": "https://fonts.googleapis.com/css2?family=Righteous&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/objects__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#E32636",
                "textTransform": "capitalize"
            }
        ]
    },
    {
        "section": "mountains",
        "label": "Montañas",
        "items": [
            {
                "id": "vintage-old-paper",
                "name": "Old Paper",
                "font": {
                    "name": "Special Elite",
                    "url": "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#3A3B3C",
                "accentColor": "#5C524A",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-sepia-tone",
                "name": "Sepia Tone",
                "font": {
                    "name": "Old Standard TT",
                    "url": "https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#4B382A",
                "accentColor": "#FFFFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-film-grain",
                "name": "Film Grain",
                "font": {
                    "name": "Courier Prime",
                    "url": "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#AAAAAA",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-retro-cassette",
                "name": "Retro Cassette",
                "font": {
                    "name": "Press Start 2P",
                    "url": "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_4.jpg"),
                "previewText": "ABCD",
                "textColor": "#111111",
                "accentColor": "#E91E63",
                "textTransform": "uppercase"
            },
            {
                "id": "vintage-bookshelf",
                "name": "Vintage Bookshelf",
                "font": {
                    "name": "Libre Baskerville",
                    "url": "https://fonts.googleapis.com/css2?family=Libre+Baskerville&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#F5F5DC",
                "accentColor": "#D2B48C",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-classic-car",
                "name": "Classic Car",
                "font": {
                    "name": "Lobster",
                    "url": "https://fonts.googleapis.com/css2?family=Lobster&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#B22222",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-faded-polaroid",
                "name": "Faded Polaroid",
                "font": {
                    "name": "Architects Daughter",
                    "url": "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#556B2F",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-antique-map",
                "name": "Antique Map",
                "font": {
                    "name": "Cinzel Decorative",
                    "url": "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_8.jpg"),
                "previewText": "Abcd",
                "textColor": "#4d463d",
                "accentColor": "#8B0000",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-gramophone",
                "name": "Gramophone",
                "font": {
                    "name": "Great Vibes",
                    "url": "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#222222",
                "accentColor": "#DAA520",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-ornate-frame",
                "name": "Ornate Frame",
                "font": {
                    "name": "UnifrakturCook",
                    "url": "https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#362512",
                "accentColor": "#C4A484",
                "textTransform": "capitalize"
            }
        ]
    },
    {
        "section": "lights",
        "label": "Luces",
        "items": [
            {
                "id": "vintage-old-paper",
                "name": "Old Paper",
                "font": {
                    "name": "Special Elite",
                    "url": "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#3A3B3C",
                "accentColor": "#5C524A",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-sepia-tone",
                "name": "Sepia Tone",
                "font": {
                    "name": "Old Standard TT",
                    "url": "https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#4B382A",
                "accentColor": "#FFFFFF",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-film-grain",
                "name": "Film Grain",
                "font": {
                    "name": "Courier Prime",
                    "url": "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#AAAAAA",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-retro-cassette",
                "name": "Retro Cassette",
                "font": {
                    "name": "Press Start 2P",
                    "url": "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_4.jpg"),
                "previewText": "ABCD",
                "textColor": "#111111",
                "accentColor": "#E91E63",
                "textTransform": "uppercase"
            },
            {
                "id": "vintage-bookshelf",
                "name": "Vintage Bookshelf",
                "font": {
                    "name": "Libre Baskerville",
                    "url": "https://fonts.googleapis.com/css2?family=Libre+Baskerville&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#F5F5DC",
                "accentColor": "#D2B48C",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-classic-car",
                "name": "Classic Car",
                "font": {
                    "name": "Lobster",
                    "url": "https://fonts.googleapis.com/css2?family=Lobster&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#B22222",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-faded-polaroid",
                "name": "Faded Polaroid",
                "font": {
                    "name": "Architects Daughter",
                    "url": "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#333333",
                "accentColor": "#556B2F",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-antique-map",
                "name": "Antique Map",
                "font": {
                    "name": "Cinzel Decorative",
                    "url": "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_8.jpg"),
                "previewText": "Abcd",
                "textColor": "#4d463d",
                "accentColor": "#8B0000",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-gramophone",
                "name": "Gramophone",
                "font": {
                    "name": "Great Vibes",
                    "url": "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#222222",
                "accentColor": "#DAA520",
                "textTransform": "capitalize"
            },
            {
                "id": "vintage-ornate-frame",
                "name": "Ornate Frame",
                "font": {
                    "name": "UnifrakturCook",
                    "url": "https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/mountains__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#362512",
                "accentColor": "#C4A484",
                "textTransform": "capitalize"
            }
        ]
    },

    {
        "section": "flowers",
        "label": "Flores",
        "items": [
            {
                "id": "flowers-rose",
                "name": "Rose",
                "font": {
                    "name": "Pacifico",
                    "url": "https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_1.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#FFD700",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-sunflower",
                "name": "Sunflower",
                "font": {
                    "name": "Amatic SC",
                    "url": "https://fonts.googleapis.com/css2?family=Amatic+SC:wght@700&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_2.jpg"),
                "previewText": "Abcd",
                "textColor": "#3E2C00",
                "accentColor": "#FFD54F",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-lavender",
                "name": "Lavender",
                "font": {
                    "name": "Dancing Script",
                    "url": "https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_3.jpg"),
                "previewText": "Abcd",
                "textColor": "#4A235A",
                "accentColor": "#D7BDE2",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-cherry-blossom",
                "name": "Cherry Blossom",
                "font": {
                    "name": "Great Vibes",
                    "url": "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_4.jpg"),
                "previewText": "Abcd",
                "textColor": "#7B1FA2",
                "accentColor": "#F8BBD0",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-tulip",
                "name": "Tulip",
                "font": {
                    "name": "Poppins",
                    "url": "https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_5.jpg"),
                "previewText": "Abcd",
                "textColor": "#2C2C2C",
                "accentColor": "#FF4081",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-orchid",
                "name": "Orchid",
                "font": {
                    "name": "Marcellus",
                    "url": "https://fonts.googleapis.com/css2?family=Marcellus&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_6.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#BA68C8",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-daisy",
                "name": "Daisy",
                "font": {
                    "name": "Quicksand",
                    "url": "https://fonts.googleapis.com/css2?family=Quicksand:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_7.jpg"),
                "previewText": "Abcd",
                "textColor": "#222222",
                "accentColor": "#FFEB3B",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-peony",
                "name": "Peony",
                "font": {
                    "name": "Cormorant Garamond",
                    "url": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_8.jpg"),
                "previewText": "Abcd",
                "textColor": "#4A2C2A",
                "accentColor": "#F48FB1",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-lotus",
                "name": "Lotus",
                "font": {
                    "name": "Playfair Display",
                    "url": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_9.jpg"),
                "previewText": "Abcd",
                "textColor": "#FFFFFF",
                "accentColor": "#81C784",
                "textTransform": "capitalize"
            },
            {
                "id": "flowers-garden-bloom",
                "name": "Garden Bloom",
                "font": {
                    "name": "Sacramento",
                    "url": "https://fonts.googleapis.com/css2?family=Sacramento&display=swap"
                },
                "backgroundImageUrl": formatBackgroundImagesUrl("web_backgrounds/flowers__image_10.jpg"),
                "previewText": "Abcd",
                "textColor": "#2E2E2E",
                "accentColor": "#F06292",
                "textTransform": "capitalize"
            }
        ]
    }

]

export const BACKGROUND_IMAGES = [
    {
        "topic": "aesthetic",
        "imagesUrl": [
            "web_backgrounds/aesthetic__image_1.jpg",
            "web_backgrounds/aesthetic__image_10.jpg",
            "web_backgrounds/aesthetic__image_11.jpg",
            "web_backgrounds/aesthetic__image_12.jpg",
            "web_backgrounds/aesthetic__image_13.jpg",
            "web_backgrounds/aesthetic__image_2.jpg",
            "web_backgrounds/aesthetic__image_3.jpg",
            "web_backgrounds/aesthetic__image_4.jpg",
            "web_backgrounds/aesthetic__image_5.jpg",
            "web_backgrounds/aesthetic__image_6.jpg",
            "web_backgrounds/aesthetic__image_7.jpg",
            "web_backgrounds/aesthetic__image_8.jpg",
            "web_backgrounds/aesthetic__image_9.jpg",
        ]
    },
    {
        "topic": "animals",
        "imagesUrl": [
            "web_backgrounds/animals__image_1.jpg",
            "web_backgrounds/animals__image_10.jpg",
            "web_backgrounds/animals__image_11.jpg",
            "web_backgrounds/animals__image_12.jpg",
            "web_backgrounds/animals__image_13.jpg",
            "web_backgrounds/animals__image_14.jpg",
            "web_backgrounds/animals__image_15.jpg",
            "web_backgrounds/animals__image_16.jpg",
            "web_backgrounds/animals__image_17.jpg",
            "web_backgrounds/animals__image_2.jpg",
            "web_backgrounds/animals__image_3.jpg",
            "web_backgrounds/animals__image_4.jpg",
            "web_backgrounds/animals__image_5.jpg",
            "web_backgrounds/animals__image_6.jpg",
            "web_backgrounds/animals__image_7.jpg",
            "web_backgrounds/animals__image_8.jpg",
            "web_backgrounds/animals__image_9.jpg",
        ]
    },
    {
        "topic": "books",
        "imagesUrl": [
            "web_backgrounds/books__image_1.jpg",
            "web_backgrounds/books__image_10.jpg",
            "web_backgrounds/books__image_11.jpg",
            "web_backgrounds/books__image_12.jpg",
            "web_backgrounds/books__image_13.jpg",
            "web_backgrounds/books__image_14.jpg",
            "web_backgrounds/books__image_15.jpg",
            "web_backgrounds/books__image_16.jpg",
            "web_backgrounds/books__image_17.jpg",
            "web_backgrounds/books__image_2.jpg",
            "web_backgrounds/books__image_3.jpg",
            "web_backgrounds/books__image_4.jpg",
            "web_backgrounds/books__image_5.jpg",
            "web_backgrounds/books__image_6.jpg",
            "web_backgrounds/books__image_7.jpg",
            "web_backgrounds/books__image_8.jpg",
            "web_backgrounds/books__image_9.jpg",
        ]
    },
    {
        "topic": "calm",
        "imagesUrl": [
            "web_backgrounds/calm__image_1.jpg",
            "web_backgrounds/calm__image_10.jpg",
            "web_backgrounds/calm__image_11.jpg",
            "web_backgrounds/calm__image_12.jpg",
            "web_backgrounds/calm__image_13.jpg",
            "web_backgrounds/calm__image_14.jpg",
            "web_backgrounds/calm__image_15.jpg",
            "web_backgrounds/calm__image_16.jpg",
            "web_backgrounds/calm__image_17.jpg",
            "web_backgrounds/calm__image_18.jpg",
            "web_backgrounds/calm__image_19.jpg",
            "web_backgrounds/calm__image_2.jpg",
            "web_backgrounds/calm__image_20.jpg",
            "web_backgrounds/calm__image_21.jpg",
            "web_backgrounds/calm__image_22.jpg",
            "web_backgrounds/calm__image_23.jpg",
            "web_backgrounds/calm__image_24.jpg",
            "web_backgrounds/calm__image_25.jpg",
            "web_backgrounds/calm__image_26.jpg",
            "web_backgrounds/calm__image_27.jpg",
            "web_backgrounds/calm__image_28.jpg",
            "web_backgrounds/calm__image_29.jpg",
            "web_backgrounds/calm__image_3.jpg",
            "web_backgrounds/calm__image_30.jpg",
            "web_backgrounds/calm__image_31.jpg",
            "web_backgrounds/calm__image_4.jpg",
            "web_backgrounds/calm__image_5.jpg",
            "web_backgrounds/calm__image_6.jpg",
            "web_backgrounds/calm__image_7.jpg",
            "web_backgrounds/calm__image_8.jpg",
            "web_backgrounds/calm__image_9.jpg",
        ]
    },
    {
        "topic": "christmas",
        "imagesUrl": [
            "web_backgrounds/christmas__image_1.jpg",
            "web_backgrounds/christmas__image_2.jpg",
            "web_backgrounds/christmas__image_3.jpg",
            "web_backgrounds/christmas__image_4.jpg",
            "web_backgrounds/christmas__image_5.jpg",
            "web_backgrounds/christmas__image_6.jpg",
            "web_backgrounds/christmas__image_7.jpg",
            "web_backgrounds/christmas__image_8.jpg",
        ]
    },
    {
        "topic": "flowers",
        "imagesUrl": [
            "web_backgrounds/flowers__image_1.png",
            "web_backgrounds/flowers__image_10.jpg",
            "web_backgrounds/flowers__image_11.jpg",
            "web_backgrounds/flowers__image_12.jpg",
            "web_backgrounds/flowers__image_13.jpg",
            "web_backgrounds/flowers__image_14.jpg",
            "web_backgrounds/flowers__image_15.jpg",
            "web_backgrounds/flowers__image_16.jpg",
            "web_backgrounds/flowers__image_17.jpg",
            "web_backgrounds/flowers__image_18.jpg",
            "web_backgrounds/flowers__image_19.jpg",
            "web_backgrounds/flowers__image_2.jpg",
            "web_backgrounds/flowers__image_20.jpg",
            "web_backgrounds/flowers__image_21.jpg",
            "web_backgrounds/flowers__image_22.jpg",
            "web_backgrounds/flowers__image_23.jpg",
            "web_backgrounds/flowers__image_24.jpg",
            "web_backgrounds/flowers__image_3.jpg",
            "web_backgrounds/flowers__image_4.jpg",
            "web_backgrounds/flowers__image_5.jpg",
            "web_backgrounds/flowers__image_6.jpg",
            "web_backgrounds/flowers__image_7.jpg",
            "web_backgrounds/flowers__image_8.jpg",
            "web_backgrounds/flowers__image_9.png",
        ]
    },
    {
        "topic": "home",
        "imagesUrl": [
            "web_backgrounds/home__image_1.jpg",
            "web_backgrounds/home__image_10.jpg",
            "web_backgrounds/home__image_2.jpg",
            "web_backgrounds/home__image_3.jpg",
            "web_backgrounds/home__image_4.jpg",
            "web_backgrounds/home__image_5.jpg",
            "web_backgrounds/home__image_6.jpg",
            "web_backgrounds/home__image_7.jpg",
            "web_backgrounds/home__image_8.jpg",
            "web_backgrounds/home__image_9.jpg",
        ]
    },
    {
        "topic": "lights",
        "imagesUrl": [
            "web_backgrounds/lights__image_1.jpg",
            "web_backgrounds/lights__image_10.jpg",
            "web_backgrounds/lights__image_11.jpg",
            "web_backgrounds/lights__image_12.jpg",
            "web_backgrounds/lights__image_2.jpg",
            "web_backgrounds/lights__image_3.jpg",
            "web_backgrounds/lights__image_4.jpg",
            "web_backgrounds/lights__image_5.jpg",
            "web_backgrounds/lights__image_6.jpg",
            "web_backgrounds/lights__image_7.jpg",
            "web_backgrounds/lights__image_8.jpg",
            "web_backgrounds/lights__image_9.jpg",
        ]
    },
    {
        "topic": "mountains",
        "imagesUrl": [
            "web_backgrounds/mountains__image_1.jpg",
            "web_backgrounds/mountains__image_10.jpg",
            "web_backgrounds/mountains__image_11.jpg",
            "web_backgrounds/mountains__image_12.jpg",
            "web_backgrounds/mountains__image_13.jpg",
            "web_backgrounds/mountains__image_14.jpg",
            "web_backgrounds/mountains__image_15.jpg",
            "web_backgrounds/mountains__image_16.jpg",
            "web_backgrounds/mountains__image_17.jpg",
            "web_backgrounds/mountains__image_18.jpg",
            "web_backgrounds/mountains__image_19.jpg",
            "web_backgrounds/mountains__image_2.jpg",
            "web_backgrounds/mountains__image_3.jpg",
            "web_backgrounds/mountains__image_4.jpg",
            "web_backgrounds/mountains__image_5.jpg",
            "web_backgrounds/mountains__image_6.jpg",
            "web_backgrounds/mountains__image_7.jpg",
            "web_backgrounds/mountains__image_8.jpg",
            "web_backgrounds/mountains__image_9.jpg",
        ]
    },
    {
        "topic": "music",
        "imagesUrl": [
            "web_backgrounds/music__image_1.jpg",
            "web_backgrounds/music__image_10.jpg",
            "web_backgrounds/music__image_2.jpg",
            "web_backgrounds/music__image_3.jpg",
            "web_backgrounds/music__image_4.jpg",
            "web_backgrounds/music__image_5.jpg",
            "web_backgrounds/music__image_6.jpg",
            "web_backgrounds/music__image_7.jpg",
            "web_backgrounds/music__image_8.jpg",
            "web_backgrounds/music__image_9.jpg",
        ]
    },
    {
        "topic": "nature",
        "imagesUrl": [
            "web_backgrounds/nature__image_1.jpg",
            "web_backgrounds/nature__image_10.jpg",
            "web_backgrounds/nature__image_11.jpg",
            "web_backgrounds/nature__image_12.jpg",
            "web_backgrounds/nature__image_13.jpg",
            "web_backgrounds/nature__image_14.jpg",
            "web_backgrounds/nature__image_15.jpg",
            "web_backgrounds/nature__image_16.jpg",
            "web_backgrounds/nature__image_17.jpg",
            "web_backgrounds/nature__image_18.jpg",
            "web_backgrounds/nature__image_19.jpg",
            "web_backgrounds/nature__image_2.jpg",
            "web_backgrounds/nature__image_20.jpg",
            "web_backgrounds/nature__image_21.jpg",
            "web_backgrounds/nature__image_22.jpg",
            "web_backgrounds/nature__image_3.jpg",
            "web_backgrounds/nature__image_4.jpg",
            "web_backgrounds/nature__image_5.jpg",
            "web_backgrounds/nature__image_6.jpg",
            "web_backgrounds/nature__image_7.jpg",
            "web_backgrounds/nature__image_8.jpg",
            "web_backgrounds/nature__image_9.jpg",
        ]
    },
    {
        "topic": "objects",
        "imagesUrl": [
            "web_backgrounds/objects__image_1.jpg",
            "web_backgrounds/objects__image_10.jpg",
            "web_backgrounds/objects__image_11.jpg",
            "web_backgrounds/objects__image_12.jpg",
            "web_backgrounds/objects__image_13.jpg",
            "web_backgrounds/objects__image_2.jpg",
            "web_backgrounds/objects__image_3.jpg",
            "web_backgrounds/objects__image_4.jpg",
            "web_backgrounds/objects__image_5.jpg",
            "web_backgrounds/objects__image_6.jpg",
            "web_backgrounds/objects__image_7.jpg",
            "web_backgrounds/objects__image_8.jpg",
            "web_backgrounds/objects__image_9.jpg",
        ]
    },
    {
        "topic": "seasonal",
        "imagesUrl": [
            "web_backgrounds/seasonal__image_1.jpg",
            "web_backgrounds/seasonal__image_10.jpg",
            "web_backgrounds/seasonal__image_11.jpg",
            "web_backgrounds/seasonal__image_12.jpg",
            "web_backgrounds/seasonal__image_13.jpg",
            "web_backgrounds/seasonal__image_14.jpg",
            "web_backgrounds/seasonal__image_15.jpg",
            "web_backgrounds/seasonal__image_16.jpg",
            "web_backgrounds/seasonal__image_17.jpg",
            "web_backgrounds/seasonal__image_18.jpg",
            "web_backgrounds/seasonal__image_2.jpg",
            "web_backgrounds/seasonal__image_3.jpg",
            "web_backgrounds/seasonal__image_4.jpg",
            "web_backgrounds/seasonal__image_5.jpg",
            "web_backgrounds/seasonal__image_6.jpg",
            "web_backgrounds/seasonal__image_7.jpg",
            "web_backgrounds/seasonal__image_8.jpg",
            "web_backgrounds/seasonal__image_9.jpg",
        ]
    },
]

export const FAMOUS_VERSES = [
    {
        text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.",
        reference: "Juan 3:16",
    },
    {
        text: "Porque para Dios nada hay imposible.",
        reference: "Lucas 1:37",
    },
    {
        text: "Todo lo puedo en Cristo que me fortalece.",
        reference: "Filipenses 4:13",
    },
    {
        text: "El Señor es mi pastor; nada me faltará.",
        reference: "Salmos 23:1",
    },
    {
        text: "Porque yo sé los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.",
        reference: "Jeremías 29:11",
    },
    {
        text: "Encomienda al Señor tus afanes, y él te sostendrá; no permitirá que el justo caiga y quede abatido para siempre.",
        reference: "Salmos 55:22",
    },
    {
        text: "Porque donde esté tu tesoro, allí estará también tu corazón.",
        reference: "Mateo 6:21",
    },
    {
        text: "Buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
        reference: "Mateo 6:33",
    },
    {
        text: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.",
        reference: "2 Timoteo 1:7",
    },
    {
        text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
        reference: "Romanos 8:28",
    },
    {
        text: "Porque la palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu, las coyunturas y los tuétanos, y discierne los pensamientos y las intenciones del corazón.",
        reference: "Hebreos 4:12",
    },
    {
        text: "Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.",
        reference: "Romanos 6:23",
    },
    {
        text: "Porque la gracia de Dios se ha manifestado para salvación a todos los hombres.",
        reference: "Tito 2:11",
    },
    {
        text: "Porque la fe viene por el oír, y el oír, por la palabra de Dios.",
        reference: "Romanos 10:17",
    },
    {
        text: "Porque la sabiduría de este mundo es insensatez para con Dios.",
        reference: "1 Corintios 3:19",
    },
];



