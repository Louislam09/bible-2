import ChooseFromListScreen from 'components/chooseFromListScreen'
import { Stack } from 'expo-router'
import { Fragment } from 'react'
import { RootStackScreenProps } from 'types'

const chooseVerseNumber: React.FC<RootStackScreenProps<"chooseVerseNumber">> = (props) => {
    return (
        <Fragment>
            <Stack.Screen options={{ headerShown: true }} />
            <ChooseFromListScreen {...props} />
        </Fragment>
    )
}

export default chooseVerseNumber