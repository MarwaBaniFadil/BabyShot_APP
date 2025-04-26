import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // استيراد الأيقونات
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const decodedToken = jwt_decode(token);
                    const parentId = decodedToken.id;

                    const response = await axios.get(`${ipAdd}:8888/APIS/notifications/${parentId}`);
                    setNotifications(response.data);
                } else {
                    setError('لم يتم العثور على التوكن.');
                }
            } catch (err) {
                setError('حدث خطأ أثناء جلب الإشعارات.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>جاري تحميل الإشعارات...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="notifications" size={28} color="#4e54c8" style={styles.icon} />
                <Text style={styles.title}>الإشعارات</Text>
            </View>
            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.appointment_id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.notificationCard}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            <Text style={styles.notificationBody}>{item.body}</Text>
                            <Text style={styles.dateSent}>التاريخ: {item.date_sent}</Text>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.noNotificationsText}>لا توجد إشعارات حاليًا.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#e6f0ff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    icon: {
        marginRight: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4e54c8',
        marginBottom: 5,
        textAlign: 'right',
    },
    notificationBody: {
        fontSize: 16,
        color: 'black',
        marginBottom: 10,
        textAlign:"right"
    },
    dateSent: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'right',
    },
    noNotificationsText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default NotificationsScreen;
