import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import { BarChart } from 'react-native-chart-kit';

const VaccinationStatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${ipAdd}:8888/APIS/vaccination-stats`);
        setStats(response.data);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات.');
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // أسماء الفترات العمرية
  const labels = [
    'حديث الولادة', 'الشهر الأول', 'الشهر الثاني', 'الشهر الرابع',
    'الشهر السادس', 'السنة', 'السنة ونصف', 'الست سنوات', 'الخمسة عشر سنة'
  ];

  const data = [];
  // التأكد من أن البيانات مرتبة حسب الفترات العمرية وملائمة للتسميات الجديدة
  for (const [key, value] of Object.entries(stats.months)) {
    data.push(value); // القيم المرتبطة بكل فترة عمرية
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>إحصائيات التطعيم في مدينة نابلس</Text>

      {stats && (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>عدد الأطفال الكلي : {stats.totalChildren}</Text>
          </View>

          {/* كونتينر الشارت */}
          <View style={styles.chartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{
                  labels,
                  datasets: [
                    {
                      data,
                    },
                  ],
                }}
                width={labels.length * 80} // عرض ديناميكي بناءً على عدد الأعمدة
                height={300}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                chartConfig={{
                  backgroundColor: '#1cc910',
                  backgroundGradientFrom: '#eff3ff',
                  backgroundGradientTo: '#efefef',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(78, 84, 200, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForVerticalLabels: {
                    rotation: 45, // تدوير النصوص على المحور الأفقي
                  },
                }}
                style={styles.chart}
                showBarTops={false}
                //verticalLabelRotation={45}
                barPercentage={0.5} // عرض الأعمدة
              />
            </ScrollView>

            {/* ليبل الإكس في منتصف الضلع السفلي */}
            <Text style={styles.xAxisLabel}>الطعم</Text>
            {/* ليبل الواي في منتصف الضلع الشمالي */}
            <Text style={styles.yAxisLabel}>عدد الأطفال</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default VaccinationStatsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f0ff',
    flex: 1, // تأكد من أن الكونتينر يشغل المساحة المتبقية
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#4e54c8',
  },
  totalContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#7494ec',
    borderRadius: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  chartContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5, // لإضافة ظل على أندرويد
    position: 'relative',
  },
  chart: {
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: -30,
    left: '50%',
    transform: [{ translateX: -15 }],  // إزالة النسبة المئوية
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  yAxisLabel: {
    position: 'absolute',
    left: -20,
    top: '50%',
    transform: [{ translateY: -15 }, { rotate: '-90deg' }],
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
