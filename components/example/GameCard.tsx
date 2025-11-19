import InfiniteCarousel, { CarouselItemRenderer } from '@/components/example/InfiniteCarousel';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { PropsWithChildren, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// import InfiniteCarousel, {
//     CarouselItemRenderer,
// } from '../components/carousel';

/* ---------- Types ---------- */
export type Game = {
  id: string | number;
  title: string;
  genre: string;
  price: string;
  rating: string;
  image: { uri: string };
};

/* ---------- Background image component ---------- */
function DynamicBackground({ uri }: { uri?: string }) {
  if (!uri) return null;

  return (
    <Animated.Image
      key={uri}
      source={{ uri }}
      resizeMode="cover"
      style={StyleSheet.absoluteFillObject}
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(800)}
    />
  );
}

/* ---------- Card shown inside the carousel ---------- */
export function GameCard({ game }: { game: Game }) {
  return (
    <View style={styles.card}>
      <Image
        source={game.image}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0, 0, 0, 0.55)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{game.title}</Text>
          <Text style={styles.cardGenre}>{game.genre}</Text>
          <Text style={styles.cardPrice}>{game.price}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ---------- Hero section ---------- */
export type GameStoreHeroProps = PropsWithChildren<{
  data?: Game[];
  ctaLabel?: string;
  onCTAPress?: () => void;
  carouselSpeed?: number;
}>;


// Default games data
const defaultGames: Game[] = [
  {
    id: 1,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.39200.14145291960194275.263e78bd-2ea0-43c6-8a5b-5578131f4b02.ba171ef6-2bab-4956-b9d7-e67e253520d1?q=90&w=177&h=265' },
    title: 'FC26',
    genre: 'Sports',
    price: '$59.99',
    rating: '4.5',
  },
  {
    id: 2,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.38555.70702278257994163.e6749f0b-a7f8-4ed1-b45c-4d7a2278d946.98964621-9b9e-4333-87e3-49e2ee6a7e59?q=90&w=177&h=265' },
    title: 'Fortnite',
    genre: 'FPS',
    price: '$69.99',
    rating: '4.7',
  },
  {
    id: 3,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.39619.65187692735347017.570b285d-e5b3-4030-9530-47243e7b82f8.e0f1eef8-e346-45d9-82ed-35600d3ade69?q=90&w=177&h=265' },
    title: 'Rocket League',
    genre: 'Sports',
    price: '$49.99',
    rating: '4.3',
  },
  {
    id: 4,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.53717.65858607118306853.39ed2a08-df0d-4ae1-aee0-c66ffb783a34.80ba72da-abfb-4af6-81f2-a443d12fb870?q=90&w=177&h=265' },
    title: 'The Witcher 3',
    genre: 'RPG',
    price: '$39.99',
    rating: '4.9',
  },
  {
    id: 5,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.42015.13966330883349940.e8d96f51-63dc-4377-8441-88d85afdd80a.d84cbd17-ae03-4537-8641-8c33c308de78?q=90&w=177&h=265' },
    title: 'Call of Duty',
    genre: 'FPS',
    price: '$29.99',
    rating: '4.8',
  },
  {
    id: 6,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.43685.13714795037479433.563e5346-29e4-492a-a767-4bdeeb012f4d.b72cca7f-d4ab-423a-b063-d785bc30c27b?q=90&w=177&h=265' },
    title: 'Grand Theft Auto V',
    genre: 'Action',
    price: '$19.99',
    rating: '4.6',
  },
  {
    id: 7,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.9688.70804610839547354.8da93c46-fd13-4b16-8ebe-e8e02c53d93e.09c2e91e-28bd-4f6f-bfd6-79d6b241667a?q=90&w=177&h=265' },
    title: 'Mortal Kombat 11',
    genre: 'FPS',
    price: 'Free',
    rating: '4.4',
  },
  {
    id: 8,
    image: { uri: 'https://store-images.s-microsoft.com/image/apps.30063.13589262686196899.16e3418a-cbf2-4748-9724-1c9dc9b7a0b9.672da915-9117-4230-960d-4f59f3d7beb5?q=90&w=177&h=265' },
    title: 'Among Us',
    genre: 'Party Game',
    price: '$4.99',
    rating: '4.2',
  },
];

export default function GameStoreHero({
  data = defaultGames,
  ctaLabel = 'Browse Games',
  onCTAPress = () => router.back(),
  carouselSpeed = 60,
}: GameStoreHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();

  const bgUri = useMemo(
    () => data?.[activeIndex]?.image?.uri,
    [activeIndex, data],
  );

  return (
    <View style={styles.root}>
      <DynamicBackground uri={bgUri} />

      {/* Dark overlay on top of the image */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
      />

      <View style={[StyleSheet.absoluteFill, {
        // blur effect on mobile devices
        backgroundColor: 'rgba(0,0,0,0.4)',
      }]}>
        <SafeAreaView edges={['bottom']} style={styles.safe}>
          {/* ------------ Carousel ------------ */}
          <Animated.View
            entering={FadeIn.springify().damping(28)}
            style={[styles.carousel, { height: width * 1 }]}
          >
            <InfiniteCarousel<Game>
              carouselItems={data}
              onIndexChange={setActiveIndex}
              itemWidthRatio={0.65}
              autoPlaySpeed={carouselSpeed}
              renderItem={(({ item }) =>
                <GameCard game={item} />) as CarouselItemRenderer<
                  Game
                >}
            />
          </Animated.View>

          {/* ------------ Text & CTA ------------ */}
          <View style={styles.content}>
            <Text style={styles.title}>
              GameStore
            </Text>

            <Text
              style={styles.subtitle}
            >
              Discover amazing games at great prices. Start your adventure now.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCTAPress}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  carousel: {
    width: '100%',
    marginTop: 80
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
  },
  welcome: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 17,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  cta: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 42,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937'
  },

  /* Card styles */
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end'
  },
  cardContent: {
    padding: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  },
  cardGenre: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8
  },
});

