import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BasePage,
  BusIconContainer,
  CardBottom,
  CardTop,
  Colors,
  Header,
  ParaUlitText,
  StatusPill,
  StatusText,
  StyledContainer,
  TripCard,
  TripDate,
  TripInfo,
  TripTitle
} from '../../components/styles';
import { moderateScale, NAV_CLEARANCE } from '../../utils/responsive';

const TripItem = ({ status, route, destination, date }) => {
  const isCompleted = status === 'Completed';
  
  return (
    <TripCard>
      <CardTop>
        <BusIconContainer>
          <Image 
              source={require('../../assets/images/UPasakaySmall.png')} 
              style={{ width: 45, height: 45, resizeMode: 'contain' }} 
          />
        </BusIconContainer>
        
        <TripInfo>
          <TripTitle style={{ fontFamily: 'Nunito-Bold', fontSize: moderateScale(14) }}>{route}</TripTitle>
          <TripTitle style={{ fontFamily: 'Nunito-Bold', fontSize: moderateScale(14) }}>{destination}</TripTitle>
          <TripDate>{date}</TripDate>
        </TripInfo>

        <View style={{ alignItems: 'flex-end' }}>
           <StatusPill completed={isCompleted}>
              <StatusText>{status}</StatusText>
           </StatusPill>
        </View>
      </CardTop>

      <CardBottom activeOpacity={0.7}>
        <ParaUlitText>Para ulit?</ParaUlitText>
      </CardBottom>
    </TripCard>
  );
};

const UserRecents = () => {
  // 1. This is your "source of truth"
  // Later, this will come from: const [trips, setTrips] = useState([]);, use laravel here to fetch data and setTrips(response.data);
  const tripsData = [
      // --- Cebu City Bus Route ---
      { 
        id: 1, 
        status: 'Completed', 
        route: 'Cebu City Bus Route', 
        destination: 'UP Cebu, RD Talamban', 
        date: '10 Apr 2026, 06:05 PM' 
      },
      { 
        id: 2, 
        status: 'Completed', 
        route: 'Cebu City Bus Route', 
        destination: 'RD Talamban, UP Cebu', 
        date: '11 Apr 2026, 06:05 AM' 
      },

      // --- UP Cebu North Bus Route ---
      { 
        id: 3, 
        status: 'Completed', 
        route: 'UP Cebu North Bus Route', 
        destination: 'Pacific Mall, UP Cebu', 
        date: '12 Apr 2026, 06:05 AM' 
      },
      { 
        id: 4, 
        status: 'Cancelled', 
        route: 'UP Cebu North Bus Route', 
        destination: 'UP Cebu, SM Consolacion', 
        date: '13 Apr 2026, 06:05 PM' 
      },

      // --- UP Cebu South Bus Route ---
      { 
        id: 5, 
        status: 'Completed', 
        route: 'UP Cebu South Bus Route', 
        destination: 'UP Cebu, Winzen\'s Cafe', 
        date: '14 Apr 2026, 06:05 PM' 
      },
      { 
        id: 6, 
        status: 'Completed', 
        route: 'UP Cebu South Bus Route', 
        destination: 'Winzen\'s Cafe, UP Cebu', 
        date: '15 Apr 2026, 06:05 AM' 
      },

      // --- Extra Combinations for Scroll Testing ---
      { 
        id: 7, 
        status: 'Cancelled', 
        route: 'Cebu City Bus Route', 
        destination: 'UP Cebu, RD Talamban', 
        date: '16 Apr 2026, 06:05 PM' 
      },
      { 
        id: 8, 
        status: 'Completed', 
        route: 'UP Cebu North Bus Route', 
        destination: 'Pacific Mall, UP Cebu', 
        date: '17 Apr 2026, 06:05 AM' 
      },
      { 
        id: 9, 
        status: 'Completed', 
        route: 'UP Cebu South Bus Route', 
        destination: 'Winzen\'s Cafe, UP Cebu', 
        date: '18 Apr 2026, 06:05 AM' 
      }
    ];

  return (
    <StyledContainer style={{ padding: 0, paddingTop: 0 }} colors={[Colors.base_page, Colors.base_page]}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <BasePage style={{ flex: 1, paddingHorizontal: 0 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <Header>Recent Bus Trips</Header>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center', paddingTop: 20, paddingBottom: NAV_CLEARANCE }}
          >
            {tripsData.map((trip) => (
              <TripItem
                key={trip.id}
                status={trip.status}
                route={trip.route}
                destination={trip.destination}
                date={trip.date}
              />
            ))}

            {tripsData.length === 0 && (
              <TripDate style={{ marginTop: 20 }}>No recent trips found.</TripDate>
            )}
          </ScrollView>
        </BasePage>
      </SafeAreaView>
    </StyledContainer>
  );
}

export default UserRecents;