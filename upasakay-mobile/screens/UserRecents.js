import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';

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
} from '../components/styles';

const TripItem = ({ status }) => {
  const isCompleted = status === 'Completed';
  
  return (
    <TripCard>
      <CardTop>
      <BusIconContainer>
          <Image 
              source={require('../assets/images/UPasakaySmall.png')} 
              style={{ width: 45, height: 45, resizeMode: 'contain' }} 
          />
      </BusIconContainer>
        
        <TripInfo>
          <TripTitle>Cebu City Bus Route</TripTitle>
          <TripTitle style={{ fontFamily: 'Nunito-Regular', fontSize: 15 }}>UP Cebu, Talamban</TripTitle>
          <TripDate>11 Dec 2026, 05:30 PM</TripDate>
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
  return (
    <StyledContainer style={{ flex: 1, paddingHorizontal: 0 }} colors={[Colors.base_page, Colors.base_page]}>
      <StatusBar style="dark" />
      
      <BasePage style={{ flex: 1, paddingHorizontal: 0 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <Header>Recent Bus Trips</Header>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', paddingTop: 20, paddingBottom: 40 }} // Reduced bottom padding
        >
          <TripItem status="Completed" />
          <TripItem status="Cancelled" />
          <TripItem status="Completed" />
          <TripItem status="Cancelled" />
        </ScrollView>
      </BasePage>

    </StyledContainer>
  );
}

export default UserRecents;