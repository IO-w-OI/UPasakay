import { StatusBar } from 'expo-status-bar';
import {
    BasePage,
    Colors,
    Header,
    StyledContainer
} from '../components/styles';

const UserRecents = () => {
  return (
    <StyledContainer style={{ flex: 1, paddingHorizontal: 0 }} colors={[Colors.base_page, Colors.base_page]}>
      <StatusBar style="dark" />
      
      <BasePage style={{ flex: 1, paddingHorizontal: 15, alignItems: 'flex-start' }}>
        
        <Header style={{ marginTop: 20 }}>
          Recent Bus Trips
        </Header>

      </BasePage>
    </StyledContainer>
  );
}

export default UserRecents;