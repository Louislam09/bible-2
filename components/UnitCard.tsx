import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type UnitCardProps = {
    title: string;
    subtitle: string;
};

const UnitCard: React.FC<UnitCardProps> = ({ title, subtitle }) => (
    <View style={styles.unitCard}>
        <View style={styles.unitCardContent}>
            <Text style={styles.unitTitle}>{title}</Text>
            <Text style={styles.unitSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.continueButtonContainer}>
            <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    unitCard: {
        backgroundColor: '#10b981',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        marginBottom: 16,
    },
    unitCardContent: {
        marginBottom: 16,
    },
    unitTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    unitSubtitle: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
    continueButtonContainer: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -16 }],
    },
    continueButton: {
        backgroundColor: '#34d399',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default UnitCard;
