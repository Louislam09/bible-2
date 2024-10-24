import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animation from './Animation'

type SplashPageProps = {
    onAnimationFinish?: ((isCancelled: boolean) => void) | undefined
}

const SplashPage = ({ onAnimationFinish }: SplashPageProps) => {
    const splashAnimation = require("../assets/lottie/splash.json");
    return (
        <View style={styles.splashContainer}>
            <Animation
                backgroundColor={'#0c3e3d'}
                source={splashAnimation}
                loop={false}
                size={{ height: 400, width: 400 }}
                onAnimationFinish={onAnimationFinish}
            />
            {/* <Text style={styles.splashTitle}>Santa Escritura</Text> */}
        </View>
    )
}

const styles = StyleSheet.create({
    splashContainer: {
        position: 'relative',
        flex: 1,
        backgroundColor: '#0c3e3d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashTitle: {
        ...StyleSheet.absoluteFillObject,
        fontSize: 50,
        color: 'white',
        fontWeight: 'bold',
        top: 500,
        left: 30
    }

})

export default SplashPage