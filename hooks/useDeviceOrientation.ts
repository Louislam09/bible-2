import { Dimensions } from 'react-native';
import { OrientationType } from '@/types';

export const useDeviceOrientation = (): OrientationType => {
    const { height, width } = Dimensions.get("window");
    if (width > height) {
        return OrientationType.LANDSCAPE;
    } else {
        return OrientationType.PORTRAIT;
    }
};