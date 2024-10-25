import { useTheme } from "@react-navigation/native";
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { View } from 'react-native';

const SkeletonVerse = ({ index }: any) => {
    const theme = useTheme()
    const colorMode = theme.dark ? 'dark' : 'dark'

    return (
        <MotiView
            transition={{ type: 'timing', duration: 300 }}
            animate={{ backgroundColor: theme.colors.background }}
            style={{ paddingHorizontal: 10 }}
        >
            <View style={[{ display: index === 0 ? 'flex' : 'none', alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: 10 }]} >
                <Skeleton colorMode={colorMode} backgroundColor={theme.colors.text + 30} height={15} width={150} />
                <Spacer />
            </View>

            <View style={{ display: index === 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton colorMode={colorMode} backgroundColor={theme.colors.text + 30} height={15} width={250} />
                <Spacer />
            </View>

            <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                <Spacer height={8} />
                <Skeleton colorMode={colorMode} backgroundColor={theme.colors.text + 30} radius="round" height={20} width={20} />
                <Skeleton colorMode={colorMode} backgroundColor={theme.colors.text + 30} width={'93%'} height={20} />
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Spacer height={4} />
                <Skeleton colorMode={colorMode} backgroundColor={theme.colors.text + 30} width={'95%'} height={20} />
                <Skeleton colorMode={colorMode} backgroundColor={theme.colors.text + 30} width={'95%'} height={20} />
                <Spacer height={20} />
            </View>
        </MotiView>
    );
}

const Spacer = ({ height = 16 }) => <View style={{ height }} />;

export default SkeletonVerse
