import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { getUserLocation } from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/location';
import { getClinicsNearby } from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/clinics';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
const ClinicMap = () => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [clinicsFromGoogle, setClinicsFromGoogle] = useState([]);
  const [clinicsFromDB, setClinicsFromDB] = useState([]);
  const [clinicsSource, setClinicsSource] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [visibleMarkers, setVisibleMarkers] = useState([]);  // الحالة الجديدة لعرض العلامات

  useEffect(() => {
    getUserLocation(setUserLocation);
  }, []);

  const fetchClinicsFromGoogle = async () => {
    if (!userLocation) return;
    const clinicsData = await getClinicsNearby(userLocation.latitude, userLocation.longitude);
    const updatedClinics = clinicsData.map((clinic) => ({
      ...clinic,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        clinic.latitude,
        clinic.longitude
      ),
    }));
    setClinicsFromGoogle(updatedClinics.sort((a, b) => a.distance - b.distance));
    setClinicsSource('google');
    setClinicsFromDB([]);  // مسح العيادات من الداتا بيس عند تحميل العيادات من جوجل
    setVisibleMarkers(updatedClinics); // تعيين العلامات المعروضة
    zoomToClinics(updatedClinics);
  };

  const fetchClinicsFromDB = async () => {
    if (!userLocation) return;
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/DBclinics`);
      const updatedClinics = response.data.clinics.map((clinic) => ({
        ...clinic,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          clinic.latitude,
          clinic.longitude
        ),
      }));
      setClinicsFromDB(updatedClinics.sort((a, b) => a.distance - b.distance));
      setClinicsSource('db');
      setClinicsFromGoogle([]);  // مسح العيادات من جوجل عند تحميل العيادات من قاعدة البيانات
      setVisibleMarkers(updatedClinics); // تعيين العلامات المعروضة
      zoomToClinics(updatedClinics);
    } catch (error) {
      console.error('Error fetching clinics from DB:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const zoomToClinics = (clinics) => {
    if (!mapRef.current || clinics.length === 0) return;

    let minLat = clinics[0].latitude;
    let maxLat = clinics[0].latitude;
    let minLon = clinics[0].longitude;
    let maxLon = clinics[0].longitude;

    clinics.forEach((clinic) => {
      minLat = Math.min(minLat, clinic.latitude);
      maxLat = Math.max(maxLat, clinic.latitude);
      minLon = Math.min(minLon, clinic.longitude);
      maxLon = Math.max(maxLon, clinic.longitude);
    });

    const latitudeDelta = maxLat - minLat + 0.1;
    const longitudeDelta = maxLon - minLon + 0.1;

    mapRef.current.animateToRegion(
      {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta,
        longitudeDelta,
      },
      1000
    );
  };

  const zoomToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
    
    // تعيين نطاق الزووم على العيادة المختارة فقط
    const region = {
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }

    // تحديث العلامات المعروضة لتظهر العيادة المختارة فقط
    setVisibleMarkers([clinic]);
  };

  const renderClinicItem = ({ item, index }) => {
    const isFirstItem = index === 0;
    const label = clinicsSource === 'google' ? 'أقرب مستشفى' : 'أقرب عيادة';

    return (
      <TouchableOpacity
        style={styles.clinicItem}
        onPress={() => handleClinicSelect(item)}
      >
        <View style={styles.clinicInfoContainer}>
          <Text style={isFirstItem ? styles.firstClinicName : styles.clinicName}>
            {item.name}
          </Text>
          <Text style={isFirstItem ? styles.firstClinicDistance : styles.clinicDistance}>
            {item.distance ? item.distance.toFixed(2) + ' كم' : 'غير متوفرة'}
          </Text>
          {isFirstItem && (
            <View style={styles.closestLabelContainer}>
              <Text style={styles.closestLabel}>{label}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {userLocation ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="موقعي الحالي"
              description="أنت هنا"
              pinColor="blue"
            />
            {visibleMarkers.length > 0
              ? visibleMarkers.map((clinic, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: clinic.latitude,
                      longitude: clinic.longitude,
                    }}
                    title={clinic.name}
                    description={clinic.address}
                  />
                ))
              : clinicsSource === 'google'
              ? clinicsFromGoogle.map((clinic, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: clinic.latitude,
                      longitude: clinic.longitude,
                    }}
                    title={clinic.name}
                    description={clinic.address}
                  />
                ))
              : clinicsFromDB.map((clinic, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: clinic.latitude,
                      longitude: clinic.longitude,
                    }}
                    title={clinic.name}
                    description={clinic.address}
                  />
                ))}
          </MapView>
        ) : (
          <View style={styles.loading}>
            <Text>جاري الحصول على الموقع...</Text>
          </View>
        )}
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={clinicsSource === 'google' ? clinicsFromGoogle : clinicsFromDB}
          renderItem={renderClinicItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      {userLocation && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.circleButton]}
            onPress={fetchClinicsFromGoogle}
          >
            <Text style={styles.buttonText}>H</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.circleButton]}
            onPress={fetchClinicsFromDB}
          >
            <Text style={styles.buttonText}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.circleButton]}
            onPress={zoomToUserLocation}
          >
            <Text style={styles.buttonText}>📍</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapContainer: { flex: 2 },
  map: { flex: 1 },
  listContainer: { flex: 1, padding: 10 },
  clinicItem: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clinicInfoContainer: { padding: 10 },
  clinicName: { fontSize: 16, fontWeight: 'normal', marginBottom: 5 },
  clinicDistance: { fontSize: 14, color: '#888' },
  firstClinicName: { fontSize: 18, fontWeight: 'bold', color: '#007BFF', marginBottom: 5 },
  firstClinicDistance: { fontSize: 14, color: 'green' ,fontWeight: 'bold'},
  closestLabelContainer: {
    backgroundColor: '#FFCC00',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  closestLabel: { fontSize: 12, color: 'black', fontWeight: 'bold' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonsContainer: {
    position: 'absolute',
    top: '30%', // لضبط موضع الأزرار عمودياً
    right: 10, // لضمان ظهور الأزرار على يمين الشاشة
    flexDirection: 'column', // ترتيب الأزرار عمودياً
    alignItems: 'center', // محاذاة العناصر في المنتصف
  },
  button: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5, // مسافة عمودية بين الأزرار
  },
  circleButton: {
    borderRadius: 25, // لجعل الأزرار دائرية
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // لون خلفية الزر
  },
  buttonText: { color: '#fff', fontSize: 20 },
});

export default ClinicMap;
