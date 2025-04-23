import { pb } from "@/globalConfig";
import { observable } from "@legendapp/state";
import { authState$ } from "./authState";

export interface FavoriteVerse {
  id: string;
  book_number: number;
  chapter: number;
  verse: number;
  uuid: string;
}

export interface FavoriteState {
  favorites: FavoriteVerse[];
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<FavoriteVerse[]>;
  addFavorite: (fav: FavoriteVerse) => Promise<FavoriteVerse | undefined>;
  removeFavorite: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const favoriteState$ = observable<FavoriteState>({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    try {
      favoriteState$.isLoading.set(true);
      favoriteState$.error.set(null);
      const user = authState$.user.get();
      if (!user) throw new Error("No hay usuario autenticado para obtener favoritos");
     
      const result = await pb.collection("favorite_verses").getList(1, 100, {
        filter: `user = \"${user.id}\"`,
      });
     
      const favorites = result.items.map((item: any) => ({
        id: item.id,
        book_number: item.book_number,
        chapter: item.chapter,
        verse: item.verse,
        uuid: item.uuid,
      }));
     
      favoriteState$.favorites.set(favorites);
      return favorites;
    } catch (error: any) {

      const errorMessage = error.message || "Error al obtener favoritos";
      favoriteState$.error.set(errorMessage);
      console.error("Error fetching favorites:", error.originalError);
      return [];
    } finally {
      favoriteState$.isLoading.set(false);
    }
  },

  addFavorite: async (fav: FavoriteVerse) => {
    try {
      favoriteState$.isLoading.set(true);
      favoriteState$.error.set(null);
      
      const user = authState$.user.get();

      if (!user) {
        throw new Error(
          "No hay usuario autenticado para crear favorito"
        );
      }
      
      try {
        const existing = await pb
          .collection("favorite_verses")
          .getFirstListItem(`uuid = \"${fav.uuid}\"`);
        if (existing) {
          // Already exists, return it
          return existing as any;
        }
        } catch (error: any) {
          if (error?.originalError?.response?.code === 404) {
            const favToAdd = {
              book_number: fav.book_number,
              chapter: fav.chapter,
              verse: fav.verse,
              uuid: fav.uuid,
            }
            // Not found, create new
            const newFav = await pb.collection("favorite_verses").create({
              ...favToAdd,
              user: user.id,
            });
            const createdFav: FavoriteVerse = {
              id: newFav.id,
              book_number: newFav.book_number,
              chapter: newFav.chapter,
              verse: newFav.verse,
              uuid: newFav.uuid,
            };
            const current = favoriteState$.favorites.get();
            favoriteState$.favorites.set([createdFav, ...current]);
            return createdFav;
          }
          throw error;
        }
    } catch (error: any) {
      const errorMessage = error.message || "Error al crear/actualizar favorito";
      favoriteState$.error.set(errorMessage);
      console.error("Error adding/updating favorite:", error);
      throw error;
    } finally {
      favoriteState$.isLoading.set(false);
    }
   
  },

  removeFavorite: async (id: string) => {
    try {
      favoriteState$.isLoading.set(true);
      favoriteState$.error.set(null);
      const user = authState$.user.get();
      if (!user) throw new Error("No hay usuario autenticado para eliminar favorito");
      await pb.collection("favorite_verses").delete(id);
      // Remove from local state
      const current = favoriteState$.favorites.get();
      const updated = current.filter((fav: FavoriteVerse) => fav.id !== id);
      favoriteState$.favorites.set(updated);
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Error al eliminar favorito";
      favoriteState$.error.set(errorMessage);
      console.error("Error deleting favorite:", error);
      return false;
    } finally {
      favoriteState$.isLoading.set(false);
    }
  },

  clearError: () => {
    favoriteState$.error.set(null);
  },
});
