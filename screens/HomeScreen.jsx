import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet ,Image,ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // للتعامل مع API
import ipAdd from 'C:/Users/ELIFE STORE/children_vaccination_clinic/scripts/helpers/ipAddress';
import Icon from 'react-native-vector-icons/FontAwesome'; // استخدام الأيقونات من مكتبة react-native-vector-icons
import { LinearGradient } from 'expo-linear-gradient';

const HomePage = ({ navigation }) => {
  const [email, setEmail] = useState(null); // لتخزين الإيميل من التوكن
  const [name, setName] = useState(null); // لتخزين اسم المستخدم
  const [husbandName, setHusbandName] = useState(null); // لتخزين اسم الزوج
  const [id, setId] = useState(null); // لتخزين الـ ID
  const [showModal, setShowModal] = useState(false); // للتحكم في ظهور المودال
  const [selectedInterests, setSelectedInterests] = useState([]); // لتخزين الاهتمامات المحددة
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [children, setChildren] = useState([]);  // لتخزين بيانات الأطفال
  const [selectedStage, setSelectedStage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMoreVisible, setIsMoreVisible] = useState(false); // حالة لإظهار/إخفاء الديف الجانبي


  const interests = [
    "تغذية",
    "رضاعة طبيعية",
    "نصائح حمل",
    "صحة نفسية",
    "تربية إيجابية",
    "التعامل مع النوم"
  ];

  const topics = [
    { icon: 'heartbeat', title: 'نصائح للحامل' }, // استخدام الأيقونات من FontAwesome
    { icon: 'medkit', title: 'التطعيمات' },
    { icon: 'child', title: 'الرضاعة الطبيعية' },
    { icon: 'stethoscope', title: 'العناية بالطفل المريض' }
  ];
  const maternalAdvice = {
    "تغذية": "تناولي الأطعمة الغنية بالحديد مثل السبانخ والبقوليات لدعم صحتك وصحة طفلك، واحرصي على شرب كمية كافية من الماء يوميًا.",
    "رضاعة طبيعية": "الرضاعة الطبيعية ليست فقط غذاءً متكاملًا لطفلك، بل تساهم أيضًا في تعزيز رابطك العاطفي معه وتحميه من الأمراض.",
    "نصائح حمل": "احرصي على زيارة الطبيب بانتظام لمتابعة نمو الجنين، وتناولي مكملات حمض الفوليك لتجنب أي مشاكل تطورية للجنين.",
    "صحة نفسية": "خصصي وقتًا يوميًا لممارسة الاسترخاء أو التأمل لتحسين صحتك النفسية وتقليل التوتر الناتج عن الأمومة أو الحمل.",
    "تربية إيجابية": "استخدمي العبارات الإيجابية عند التوجيه، مثل 'أنا فخورة بك'، لتعزيز ثقة طفلك بنفسه وتشجيعه على السلوك الجيد.",
    "التعامل مع النوم": "اجعلي وقت النوم روتينًا مريحًا مثل قراءة قصة أو تشغيل موسيقى هادئة لتساعدي طفلك على الاسترخاء والنوم بسهولة."
  };
  const homeAccidents = [
    {
      name: "الحروق",
      image: require('../images/burn.gif'), // صورة الحرق
      advice:
        "في حالة الحروق البسيطة، اغسلي المنطقة بالماء البارد لعدة دقائق ثم ضعي مرهم مهدئ. في حالات الحروق الشديدة، استشيري الطبيب فوراً.",
    },
    {
      name: "الاختناق",
      image: require('../images/choking.png'), // صورة الاختناق
      advice:
        "إذا كان الطفل يختنق، قومي بإعطائه بعض الضربات الخفيفة على الظهر أو استخدمي مناورة هيمليك في حالة الضرورة.",
    },
    {
      name: "السقوط",
      image: require('../images/fall.gif'), // صورة السقوط
      advice:
        "في حالة السقوط، تأكدي من عدم وجود جروح خطيرة، وإذا ظهرت أي أعراض غريبة مثل الدوار أو الألم الشديد، اتصلي بالطبيب.",
    },
    {
      name: "العضات",
      image: require('../images/bite.gif'), // صورة العضات
      advice:
        "اغسلي مكان العضة جيدًا بالماء والصابون، ثم ضعي مضاد حيوي إذا لزم الأمر. استشيري الطبيب إذا ظهرت علامات عدوى.",
    },
    {
      name: "التسمم",
      image: require('../images/poisoning.gif'), // صورة التسمم
      advice:
        "في حالة التسمم، اتصلي بأقرب مركز طبي فورًا. إذا كان الطفل قد ابتلع مادة سامة، لا تحاولي التسبب في التقيؤ دون استشارة الطبيب.",
    },
    {
      name: "الغرق",
      image: require('../images/drowning.gif'), // صورة الغرق
      advice:
        "في حالة الغرق، قومي بإجراء الإنعاش القلبي الرئوي فورًا حتى وصول الطوارئ.",
    },
  ];
const childStages = [
  {
    age: 'من 3 أشهر وحتى 6 أشهر',
    image: require('../images/3.jpg'),
    development: [
      'يبدأ الطفل بالتقلب من جانب إلى آخر.',
      'يحاول الجلوس بمساعدة.',
      'يصبح أكثر قدرة على إمساك الأشياء.',
    ],
  },
  {
    age: 'من 6 أسابيع وحتى 3 أشهر',
    image: require('../images/2.jpg'),
    development: [
      'يركز على الوجوه والأشياء القريبة.',
      'يبدأ في إصدار أصوات غير بكاء.',
      'يبدأ برفع رأسه أثناء الاستلقاء على البطن.',
    ],
  },
  {
    age: 'أقل من 6 أسابيع',
    image: require('../images/1.webp'),
    development: [
      'يستجيب للأصوات العالية بالبكاء.',
      'يبدأ بالنظر حوله.',
      'يقضي معظم الوقت في النوم.',
    ],
  },
  {
    age: 'من سنة ونصف وحتى سنتين',
    image: require('../images/6.jpeg'),
    development: [
      'يبدأ بتكوين جمل قصيرة.',
      'يحاول تقليد الكبار في أفعالهم.',
      'يحب اللعب بالألعاب التي تحفز الخيال.',
    ],
  },
  {
    age: 'من سنة وحتى سنة ونصف',
    image: require('../images/5.webp'),
    development: [
      'يبدأ بالمشي بمفرده.',
      'يستخدم كلمات بسيطة للتعبير.',
      'يفهم التعليمات البسيطة.',
    ],
  },
  {
    age: 'من 6 أشهر وحتى سنة',
    image: require('../images/4.jpg'),
    development: [
      'يحبو أو يزحف للوصول إلى الأشياء.',
      'يبدأ بنطق كلمات مثل "بابا" أو "ماما".',
      'يحب اللعب بالألعاب البسيطة.',
    ],
  },
  {
    age: 'من أربع سنوات وحتى خمس سنوات',
    image: require('../images/9.jpeg'),
    development: [
      'يصبح أكثر استقلالية.',
      'يحب اللعب الجماعي مع الأطفال.',
      'يبدأ بفهم القواعد وتطبيقها.',
    ],
  },
  {
    age: 'من ثلاث سنوات وحتى أربع سنوات',
    image: require('../images/8.jpeg'),
    development: [
      'يبدأ بطرح أسئلة كثيرة.',
      'يحب الرسم والتلوين.',
      'يتعلم استخدام الجمل الأطول.',
    ],
  },
  {
    age: 'من سنتين وحتى ثلاث سنوات',
    image: require('../images/7.webp'),
    development: [
      'يبدأ بتعلم الحروف والأرقام.',
      'يحب الألعاب التي تتطلب التركيز.',
      'يصبح أكثر قدرة على التعبير عن رغباته.',
    ],
  },
];

  // استخراج الإيميل من التوكن
  const extractEmailFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("Fetched token:", token); // تحقق من أن الـ token موجود
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // فك تشفير JWT
        const extractedEmail = decodedToken.email;
        setEmail(extractedEmail);
  
        console.log("Extracted email:", extractedEmail); // تحقق من البريد الإلكتروني
        
        // استدعاء fetchParentData للحصول على الـ id
        const parentId = await fetchParentData(extractedEmail);
        console.log("Parent ID from extractEmailFromToken:", parentId); // تحقق من الـ id المسترجع
        const storedInterests = await AsyncStorage.getItem(`interests_${extractedEmail}`);
        if (storedInterests) {
          setSelectedInterests(JSON.parse(storedInterests));
        } else {
          setShowModal(true);
        }
        return parentId; // إرجاع الـ id لاستخدامه لاحقًا
      }
    } catch (error) {
      console.error('Error extracting email from token:', error);
      return null; // في حالة الخطأ
    }
  };
  

  // جلب البيانات من API
  const fetchParentData = async (email) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/getnamePerantbyemail/${email}`);
      console.log('Parent data fetched:', response.data);
  
      // الوصول إلى الكائن داخل المصفوفة
      const { name, husbandName, id } = response.data.users[0];
  
      console.log("Fetched parent ID:", id); // تحقق من قيمة الـ id
      setName(name);
      setHusbandName(husbandName);
      setId(id);
  
      return id; // إرجاع id
    } catch (error) {
      console.error('Error fetching parent data:', error);
      return null; // في حالة الخطأ
    }
  };
  

  const fetchChildren = async (parentId) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/getChildrenByParentId/${parentId}`);
      const childrenData = response.data.users; // استجابة API تحتوي على قائمة الأطفال
      console.log('Fetched children data:', childrenData); // تحقق من البيانات المستلمة
      setChildren(childrenData); // تأكد من تعيين بيانات الأطفال في الحالة
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  // جلب معلومات الطفل بناءً على childId
  const fetchChildInfo = async (childId) => {
    try {
      const response = await axios.get(`${ipAdd}:8888/APIS/childinfo/${childId}`);
      const ageInMonths = response.data.child_info.Childs_age_in_months;  // العمر بالاشهر
      return ageInMonths;
    } catch (error) {
      console.error('Error fetching child info:', error);
    }
  };

  // الحصول على النصائح بناءً على عمر الطفل
  const getAdviceByAge = (ageInMonths) => {
    if (ageInMonths <= 4) {
      return "يُنصح بالرضاعة الطبيعية فقط خلال هذه الفترة.";
    } else if (ageInMonths >= 5 && ageInMonths <= 6) {
      return "يُفضل إدخال الطعام الصلب عند بلوغ الطفل عمر 6 أشهر.";
    } else if (ageInMonths >= 7 && ageInMonths <= 12) {
      return "تابعي حركة الطفل وتأكد من توفير بيئة آمنة له.";
    } else if (ageInMonths >= 13 && ageInMonths <= 18) {
      return "راقب تطور كلام الطفل وشجعه على النطق.";
    } else if (ageInMonths >= 19 && ageInMonths <= 36) {
      return "ساعدي الطفل على تكوين جمل بسيطة وتوسيع مفرداته.";
    } else if (ageInMonths >= 37 && ageInMonths <= 60) {
      return "يُنصح بالبدء في تعريف الطفل على الروضة وأنشطتها.";
    } else if (ageInMonths >= 61 && ageInMonths <= 120) {
      return "شجعي الطفل على الألعاب الجماعية لتعزيز مهاراته الاجتماعية.";
    } else if (ageInMonths > 120) {
      return "ركزي على التربية والنقاش المفتوح لتوجيه الطفل خلال فترة المراهقة.";
    }
  };
  // عرض نصائح بناءً على عمر الطفل
  const handleStagePress = (stage) => {
    setSelectedStage(stage);
    setModalVisible(true);
  };
  const goToProfile = () => {
    console.log("Navigating to Profile");
  };
useEffect(() => {
  const loadInterests = async () => {
    const savedInterests = await AsyncStorage.getItem(`interests_${email}`);
    if (savedInterests) {
      console.log('Loaded interests:', JSON.parse(savedInterests));
      setSelectedInterests(JSON.parse(savedInterests));
    }
  };
  loadInterests();
}, [email]);

useEffect(() => {
  const fetchData = async () => {
    const parentId = await extractEmailFromToken(); // استدعاء الدالة واستخدام الـ id
    if (parentId) {
      console.log("Parent ID in useEffect:", parentId); // تحقق من أن الـ id موجود
      setId(parentId); // تخزين الـ id في الحالة
      await fetchChildren(parentId); // استدعاء دالة جلب الأطفال باستخدام الـ id
    } else {
      console.error("Parent ID not found");
    }
  };

  fetchData();
}, []);


  // التعامل مع اختيار الاهتمامات
  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  // حفظ الاهتمامات المحددة
  const saveInterests = async () => {
    try {
      if (email) {
        await AsyncStorage.setItem(`interests_${email}`, JSON.stringify(selectedInterests));
        console.log('Selected Interests:', selectedInterests); // طباعة الاهتمامات
        setShowModal(false); // إغلاق المودال
      }
    } catch (error) {
      console.error('Error saving interests:', error);
    }
  };

  return (
    <LinearGradient
    colors={["#e2e2e2", "#c9d6ff"]}
    style={styles.container}
  >
    <ScrollView style={styles.container}>
      <View style={styles.greetingContainer}>
      <Image 
          source={require("../images/greeting.png")}
          style={styles.image}
        />
        {name && husbandName && (
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greeting}>مرحبًا {name} | {husbandName} في BabyShot</Text>
            <Text style={styles.subGreeting}>
               إن صحة طفلك هي أولويتنا ، احرص دائمًا على متابعة التطعيمات ليكبر طفلك بصحة وسعادة.💕
            </Text>
          </View>
        )}
      </View>

      <View style={styles.topicsContainer}>
        {topics.map((topic, index) => (
          <View key={index} style={styles.topicBox}>
            <Icon name={topic.icon} size={40} color="#7494ec" style={styles.icon} />
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <TouchableOpacity style={styles.showMoreButton} onPress={() => setSelectedTopic(topic.title)}            >
              <Text style={styles.showMoreText}>عرض</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>اختر اهتماماتك:</Text>
          {interests.map((interest, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.interestButton, selectedInterests.includes(interest) && styles.selectedInterest]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={styles.interestText}>{interest}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.saveButton} onPress={saveInterests}>
            <Text style={styles.saveButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {selectedTopic && (
  <Modal visible={true} animationType="slide" transparent={true}>
  <View style={styles.modalContainer1}>
    <View style={styles.modalContent1}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* المحتوى بناءً على `selectedTopic` */}
        {selectedTopic === 'نصائح للحامل' && (
  <View>
    <Text style={styles.title}>نصائح للحامل</Text>
    <Text style={styles.paragraph}>للعناية بصحتك وصحة جنينك، إليك مجموعة من النصائح الهامة:</Text>
    <View style={{ marginVertical: 10 }}>
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>تغذية الحامل :</Text> تناولي أطعمة متوازنة غنية بالبروتينات، الفيتامينات، والكالسيوم، مثل الألبان، الفواكه، والخضروات.
        </Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>المقويات والمغذيات :</Text> استشيري طبيبك بشأن المكملات الغذائية اللازمة مثل حمض الفوليك والحديد لدعم نمو الجنين.
        </Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>النظافة الشخصية :</Text> احرصي على نظافتك اليومية لتجنب العدوى، مع استخدام منتجات آمنة خلال الحمل.
        </Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>التمارين الرياضية :</Text> مارسي الرياضة الخفيفة مثل المشي أو اليوغا لتقوية جسمك وتحسين المزاج.
        </Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>راحة النفسية :</Text> احرصي على الابتعاد عن التوتر وممارسة التأمل أو الأنشطة التي تساعدك على الاسترخاء.
        </Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>زيارة الطبيب :</Text> تابعي مع طبيبك بشكل دوري للاطمئنان على صحتك وصحة الجنين.
        </Text>
      </View>
    </View>
  </View>
)}

       {selectedTopic === 'العناية بالطفل المريض' && (
  <View>
    <Text style={styles.title}>العناية بالطفل المريض</Text>
    <Text style={styles.paragraph}>
      الأطفال قد يعانون من مشاكل صحية شائعة، إليك نصائح للتعامل مع أبرزها:
    </Text>
    <View style={{ marginVertical: 10 }}>
      {/* الإسهالات */}
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>الإسهالات:</Text>
        </Text>
      </View>
      <View style={styles.subList}>
        <View style={styles.listItem}>
          <Text style={styles.listText}>قدمي لطفلك سوائل بكثرة لتعويض الترطيب المفقود.</Text>
          <Text style={styles.listBullet}> -</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            استشيري الطبيب إذا استمرت الحالة أو لاحظتِ علامات الجفاف.
          </Text>
          <Text style={styles.listBullet}> -</Text>

        </View>
      </View>

      {/* القحة */}
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>القحة:</Text>
        </Text>
      </View>
      <View style={styles.subList}>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            استخدمي مرطبات الهواء الدافئة لتخفيف الأعراض.
          </Text>
          <Text style={styles.listBullet}> -</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            تقديم مشروبات دافئة مثل اليانسون أو العسل (للأطفال فوق سن السنة).
          </Text>
          <Text style={styles.listBullet}> -</Text>

        </View>
      </View>

      {/* تسنين الأطفال */}
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>تسنين الأطفال:</Text>
        </Text>
      </View>
      <View style={styles.subList}>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            استخدمي جل مخصص للتسنين لتخفيف الألم.
          </Text>
          <Text style={styles.listBullet}> -</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            قدمي لطفلك ألعاب تسنين مبردة لتخفيف الانزعاج.
          </Text>
          <Text style={styles.listBullet}> -</Text>

        </View>
      </View>
    </View>
  </View>
)}


{selectedTopic === 'الرضاعة الطبيعية' && (
  <View>
    <Text style={styles.title}>الرضاعة الطبيعية</Text>
    <Text style={styles.paragraph}>
      الرضاعة الطبيعية تقدم فوائد صحية عديدة للأم والطفل:
    </Text>
    <View style={{ marginVertical: 10 }}>
      {/* للطفل */}
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>للطفل:</Text>
        </Text>
      </View>
      <View style={styles.subList}>
        <View style={styles.listItem}>
          <Text style={styles.listText}>تعزيز المناعة وحمايته من الأمراض.</Text>
          <Text style={styles.listBullet}>-</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>تحسين النمو العقلي والجسدي.</Text>
          <Text style={styles.listBullet}>-</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>تقليل مخاطر الحساسية.</Text>
          <Text style={styles.listBullet}>-</Text>

        </View>
      </View>

      {/* للأم */}
      <View style={styles.listItem}>
        <Text style={styles.listText}>
          <Text style={styles.bold}>للأم:</Text>
        </Text>
      </View>
      <View style={styles.subList}>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            تقليل خطر الإصابة بسرطان الثدي والمبيض.
          </Text>
          <Text style={styles.listBullet}>-</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            تعزيز الرابطة العاطفية مع الطفل.
          </Text>
          <Text style={styles.listBullet}>-</Text>

        </View>
        <View style={styles.listItem}>
          <Text style={styles.listText}>
            مساعدة الجسم على العودة إلى وضعه الطبيعي بعد الولادة.
          </Text>
          <Text style={styles.listBullet}>-</Text>

        </View>
      </View>
    </View>
    <Text style={styles.paragraph}>
      <Text style={styles.bold}>تغذية الطفل :</Text> بعد الستة أشهر الأولى، قدمي لطفلك الأطعمة المغذية المناسبة لعمره بجانب الرضاعة.
    </Text>
  </View>
)}
{selectedTopic === 'التطعيمات' && (
  <View>
    <Text style={styles.title}>التطعيمات</Text>
    <Text style={styles.paragraph}>
      التطعيمات أساسية لحماية طفلك من الأمراض المعدية والخطيرة. تقدم وزارة الصحة الفلسطينية برنامج تطعيم وطني شامل:
    </Text>
    <View style={{ marginVertical: 10 }}>
      <View style={styles.listItem}>
        <Text style={styles.listText}>السل</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>التهاب الكبد (ب)</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>شلل الأطفال</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>السعال الديكي</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>الكزاز</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>الدفتيريا</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>الحصبة</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>الحصبة الألمانية</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>التهاب المكورات الرئوية</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
      <View style={styles.listItem}>
        <Text style={styles.listText}>الإسهال الناتج عن فايروس روتا</Text>
        <Text style={styles.listBullet}>•</Text>

      </View>
    </View>
    <Text style={styles.paragraph}>
      تحديثات البرنامج الوطني للتطعيم تعتمد على اللجنة الوطنية للتطعيم ووزارة الصحة. يرجى مراجعة طبيبك أو المركز الصحي للتأكد من جدول التطعيمات المحدث.
    </Text>
  </View>
)}

      </ScrollView>
      <TouchableOpacity onPress={() => setSelectedTopic(null)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>إغلاق</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      )}
  <View style={styles.additionalContainer}>
  <Text style={styles.sectionTitle}>نصائح لكِ</Text>
  {selectedInterests.length > 0  ? (
    selectedInterests.map((interest, index) => (
      <View key={index} style={styles.adviceContainer}>
        <Text style={styles.paragraph1}>{maternalAdvice[interest]}</Text>
      </View>
    ))
  ) : (
    <Text style={styles.paragraph1}>لا توجد نصائح متاحة بناءً على اهتماماتك.</Text>
  )}

  <Image source={require("../images/advice.gif")} style={styles.image1} />

  <Text style={styles.sectionTitle}>نصائح لأطفالك</Text>
  {children.length > 0 ? (
    (() => {
      const shownCategories = new Set(); // لتتبع الفئات العمرية التي تم عرض النصائح لها
      return children.map((child, index) => {
        const { child_id } = child;

        return fetchChildInfo(child_id).then((ageInMonths) => {
          const advice = getAdviceByAge(ageInMonths);
          if (!shownCategories.has(advice)) {
            shownCategories.add(advice);
            return (
              <View key={index} style={styles.adviceContainer}>
                <Text style={styles.paragraph1}>{advice}</Text>
              </View>
            );
          }
          return null; // تجاهل النصيحة إذا كانت مكررة
        });
      });
    })()
  ) : (
    <Text style={styles.paragraph1}>لا توجد معلومات حول الأطفال.</Text>
  )}
</View>
   {/* تطور الطفل */}
   <View style={styles.childDevelopmentContainer}>
      <Text style={styles.sectionTitlee}>تطور الطفل</Text>
      <View style={styles.gridContainer}>
        {childStages.map((stage, index) => (
          <TouchableOpacity key={index} style={styles.childBox} onPress={() => handleStagePress(stage)}>
            <Image source={stage.image} style={styles.childImage} />
            <Text style={styles.childText}>{stage.age}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      {selectedStage && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer2}>
            <View style={styles.modalContent2}>
              <Image source={selectedStage.image} style={styles.modalImage} />
              <Text style={styles.modalAge}>{selectedStage.age}</Text>
              <ScrollView>
                {selectedStage.development.map((item, index) => (
                  <Text key={index} style={styles.modalDevelopment}>{`- ${item}`}</Text>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
     
    </View>
    <View style={styles.container1}>
      <Text style={styles.sectionTitle}>الحوادث المنزلية</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {homeAccidents.map((accident, index) => (
          <View key={index} style={styles.accidentBox}>
            <Image source={accident.image} style={styles.accidentImage} />
            <View style={styles.textContainer}>
              <Text style={styles.accidentName}>{accident.name}</Text>
              <Text style={styles.accidentAdvice}>{accident.advice}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>

    </ScrollView>
  {/* شريط التنقل السفلي */}
  <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("noti")} style={styles.navItem}>
          <Icon name="bell" size={24} color="#4e54c8" />
          <Text style={styles.navText}>الإشعارات</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("RegisterChildren")} style={styles.navItem}>
          <Icon name="child" size={24} color="#4e54c8" />
          <Text style={styles.navText}>الأطفال</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ParentProfile")} style={styles.floatingButton}>
          <Icon name="user" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Sch")} style={styles.navItem}>
          <Icon name="calendar" size={24} color="#4e54c8" />
          <Text style={styles.navText}>حجز موعد</Text>
        </TouchableOpacity>

        {/* أيقونة "المزيد" */}
        <TouchableOpacity
          onPress={() => setIsMoreVisible(!isMoreVisible)} // تغيير حالة الظهور
          style={styles.navItem}
        >
          <Icon name="ellipsis-h" size={24} color="#4e54c8" />
          <Text style={styles.navText}>المزيد</Text>
        </TouchableOpacity>
        
      </View>

      {/* ديف جانبي عند الضغط على "المزيد" */}
      {isMoreVisible && (
  <View style={styles.moreMenu}>
    {/* زر إغلاق الديف */}
    <TouchableOpacity onPress={() => setIsMoreVisible(false)} style={styles.closeButton1}>
      <Icon name="times" size={24} color="#aaa" />
    </TouchableOpacity>

    {/* زر اسأل الذكاء الاصطناعي */}
    <TouchableOpacity onPress={() => navigation.navigate("AI_Chat")} style={styles.menuItem}>
    <Icon name="comment" size={22} color="#4e54c8" />
      <Text style={styles.menuText}>اسأل الذكاء الاصطناعي</Text>
    </TouchableOpacity>

    {/* زر شات مع العيادة */}
    <TouchableOpacity onPress={() => navigation.navigate("momTOclinic")} style={styles.menuItem}>
    <Icon name="hospital-o" size={22} color="#4e54c8" />
      <Text style={styles.menuText}>تحدث مع الطبيب</Text>
    </TouchableOpacity>

    {/* زر مجموعات الأمهات */}
    <TouchableOpacity onPress={() => navigation.navigate("chatGroup")} style={styles.menuItem}>
    <Icon name="users" size={22} color="#4e54c8" />
      <Text style={styles.menuText}>مجموعات الأمهات</Text>
    </TouchableOpacity>
     {/* زر الجدولة */}
     <TouchableOpacity onPress={() => navigation.navigate("Map")} style={styles.menuItem}>
     <Icon name="map" size={22} color="#4e54c8" />
      <Text style={styles.menuText}>الخريطة</Text>
    </TouchableOpacity>

    {/* زر التقييم */}
    <TouchableOpacity onPress={() => navigation.navigate("rating")} style={styles.menuItem}>
    <Icon name="star" size={22} color="#4e54c8" />
      <Text style={styles.menuText}>تقييم العيادة</Text>
    </TouchableOpacity>

   
    <TouchableOpacity onPress={() => navigation.navigate("welcome")} style={styles.menuItem}>
    <Icon name="sign-out" size={22} color="#4e54c8" />
      <Text style={styles.menuText}>تسجيل الخروج</Text>
    </TouchableOpacity>
  </View>
)}

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  additionalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign:"center"
  },
  image1: {
    width: '60%',
    height: 200,
    borderRadius: 10,
    marginVertical: 15,
    alignSelf:"center",
  },
  container: {
    flex: 1,
   // backgroundColor: '#f5f5f5',
  },
  greetingContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    margin:10,
    borderRadius:8
  },
  greetingTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7494ec',
    textAlign:"right"
  },
  subGreeting: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
  },
  topicsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  topicBox: {
    width: '24%',
    height:150,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginBottom: 10,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  showMoreButton: {
    position: 'absolute', // يجعل الزر في مكان ثابت داخل البوكس
    bottom: 10,           // يضع الزر في أسفل البوكس
    backgroundColor: '#7494ec',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:"center",
    width:80,
    alignSelf:"center",
  },
  
  showMoreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7494ec',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  interestButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedInterest: {
    backgroundColor: '#4e54c8',
  },
  interestText: {
    color: '#000',
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#4e54c8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  modalContainer1: {
    flex: 1,
    justifyContent: 'center', // لمحاذاة المودال عموديًا
    alignItems: 'center', // لمحاذاة المودال أفقيًا
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // خلفية شفافة
    paddingHorizontal: 20, // لتجنب ملامسة الحواف
  },
  modalContent1: {
    width: '90%', // عرض المودال
    maxHeight: '70%', // تحديد أقصى ارتفاع
    backgroundColor: 'white', // لون الخلفية
    borderRadius: 10, // زوايا مدورة
    padding: 20, // مسافة داخلية
    elevation: 10, // تأثير الظل (للأندرويد)
    shadowColor: '#000', // لون الظل (للـ iOS)
    shadowOffset: { width: 0, height: 2 }, // اتجاه الظل
    shadowOpacity: 0.25, // شفافية الظل
    shadowRadius: 4, // مدى الظل
  },
  
  closeButton: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
    color: '#555',
    textAlign: 'right',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 20,
    marginRight: 6,
    marginLeft: 6,
    color: '#555',
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    color:"#4e54c8"
  },
 
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  openButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  paragraph1:{
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: '#555',
    textAlign: 'right',
  },
  childDevelopmentContainer: {
    marginTop: 24,
    margin:5,
    borderWidth:10,
    borderColor:"#7494ec",
    //backgroundColor:"red"
    borderRadius:8,
    backgroundColor:"white"
  },
  sectionTitlee: {
    top:10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign:"center"
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin:10,
  },
  childBox: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'white', // لون بنفسجي شفاف
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    borderWidth:1,
    borderColor:"black"
  },
  childImage: {
    width: '80%',
    height: '60%',
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius:20,
  },
  childText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalContainer2: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent2: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '90%',
    alignItems: 'center',
  },
  modalImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  modalAge: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDevelopment: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  accidentBox: {
    flexDirection: "row",
    backgroundColor: "#ffffff", // لون خلفية أكثر سطوعًا لإبراز المستطيل
    borderRadius: 15, // حواف دائرية أكثر ليونة
    padding: 15, // زيادة التباعد الداخلي
    marginRight: 15, // تباعد بين المستطيلات
    width: 300,
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // زيادة ارتفاع الظل
    shadowOpacity: 0.2, // زيادة شفافية الظل
    shadowRadius: 6, // توسيع الظل لجعله أكثر نعومة
    elevation: 6, // تأثير ارتفاع أكبر للظل (على Android)
    borderWidth: 1, // إضافة حدود خفيفة
    borderColor: "#e0e0e0", // لون الحدود لإبراز الحواف
    marginBottom:20
  },
  
  accidentImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  accidentName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign:"right"
  },
  accidentAdvice: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign:"right"

  },
  container1: {
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom:20
  },
 
  circleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4c669f",
  },
  barText: {
    color: "#fff",
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
    fontWeight:"bold"
  },
  floatingButton: {
    backgroundColor: "#7494ec",
    height: 70,
    width: 70,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    bottom: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  moreMenu: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: 195,
    height: "100%",
    zIndex: 999, // لجعل القائمة فوق باقي المحتوى
    borderBottomWidth: 1, // حافة سفلية
    borderBottomColor: "white",
  },
  menuItem: {
    marginTop:40,
    paddingVertical: 10,
    flexDirection: "row-reverse",
    alignItems: "right",
    textAlign:"right"
  },
  menuText: {
  marginRight:5,
    fontSize: 16,
    color: "#777777",
    textAlign:"right",
    fontWeight:"bold"
  },
  closeButton1: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 20,
    zIndex: 1000, // للتأكد من أن زر الإغلاق فوق باقي المحتويات
  },
});

export default HomePage;
