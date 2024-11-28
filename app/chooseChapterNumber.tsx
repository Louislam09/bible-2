import ChooseFromListScreen from 'components/chooseFromListScreen'
import { Stack } from 'expo-router'
import { Fragment } from 'react'
import { RootStackScreenProps } from 'types'

const chooseChapterNumber: React.FC<RootStackScreenProps<"chooseChapterNumber">> = (props) => {
    console.log("chooseChapterNumber", props)

    return (
        <Fragment>
            <Stack.Screen options={{ headerShown: true }} />
            <ChooseFromListScreen {...props} />
        </Fragment>
    )
}

export default chooseChapterNumber