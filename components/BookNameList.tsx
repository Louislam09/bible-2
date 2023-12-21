import { useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Themed';
import { FlashList } from "@shopify/flash-list";
import { HomeParams, IDBBookNames, Screens } from '../types';
import useStorage from '../hooks/useAsyncStorage';
import { StorageKeys } from '../constants/StorageKeys';

interface IBookNameList {
    bookList: IDBBookNames[] | any[]
}

const BookNameList = ({ bookList }: IBookNameList) => {
    // const { setLastReadBook } = useStorage(StorageKeys.LAST_READ_BOOK, {}, true)
    const navigation = useNavigation()
    const route = useRoute()
    const { book: selectedBook } = route?.params as HomeParams

    const handlePress = (item: string | number) => {
        if (selectedBook) {
            const data = { book: selectedBook, chapter: item, strongKey: bookList.length > 30 ? 'H' : 'G' }
            // setLastReadBook(data)
            navigation.navigate(Screens.Home, { ...data })
            return
        }
        navigation.navigate(Screens.ChooseChapterNumber, { book: item as string })
    }

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.listItem} onPress={() => handlePress(item)} >
            <Text style={styles.listTitle}>{item}</Text>
        </TouchableOpacity>
    )

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {selectedBook && <Text style={styles.listChapterTitle}>{selectedBook}</Text>}
            <FlashList
                contentContainerStyle={{ paddingVertical: 20, backgroundColor: '#000' }}
                data={bookList?.map((x) => x?.longName ? x?.longName : x)}
                renderItem={renderItem}
                estimatedItemSize={47}
                numColumns={selectedBook ? 6 : 2}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    listItem: {
        display: 'flex',
        alignItems: 'center',
        borderColor: '#ddd5',
        borderStyle: 'solid',
        borderWidth: 1,
        margin: 5,
        padding: 5,
        flex: 1
    },
    listTitle: {
        color: 'white',
        fontSize: 20
    },
    listChapterTitle: {
        color: 'white',
        padding: 20,
        paddingBottom: 0,
        fontSize: 20
    }
});

export default BookNameList