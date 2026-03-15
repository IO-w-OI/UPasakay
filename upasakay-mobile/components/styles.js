import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

const StatusBarHeight = Constants.statusBarHeight;

// colors
export const Colors = {
    //Font Colors
    text_idle: '#8D8D8D',
    text_active: '#000000',

    // Background Stills
    white: '#FFFFFF',
    base_page: '#F2F9F3', 
    top_loginsignup: '#8D1436', 
    bottom_loginsignup: '#400A19', 

    // Buttons
    button_loginsignup: '#FFB61C',
    button_loginsignup_pressed: '#D48900', 
    navi_icons_idle: '#55975C', 
    navi_icons_active: '#004420',
    unavailable_idle: '#6B6B6B',
    unavailable_pressed: '#8B1A1A',

    // Status
    completed: '#3A9955',
    cancelled: '#ADADAD',
    para_ulit: '#6B0000',

    // Navigation Bar Liquid Glass
    nav_bar_left: '#004420',
    nav_bar_right: '#004420',
};

const { top_loginsignup, bottom_loginsignup } = Colors;

// We use .attrs to pass the 'colors' prop to LinearGradient
export const StyledContainer = styled(LinearGradient).attrs({
    colors: [top_loginsignup, bottom_loginsignup],
})`
    flex: 1;
    padding: 25px;
    padding-top: ${StatusBarHeight + 24.5}px;
`;

export const InnerContainer = styled.View`
    flex: 1;
    width: 100%;
    align-items: center;
`;

export const PageLogo = styled.Image`
    width: 192.03px;
    height: 181px;
    margin-bottom: 20px;
`;

export const StyledFormArea = styled.View`
    width: 90%;
`;

// Inside your components/styles.js
export const StyledTextInput = styled.TextInput`
  background-color: ${Colors.base_page};
  padding: 15px;
  padding-left: 55px;
  padding-right: 55px;
  border-radius: 16px;  /* <--- ADD THIS (Adjust the number for more/less curve) */
  font-size: 17px;
  font-family: 'Nunito-Regular'; 
  height: 49px;
  margin-vertical: 3px;
  margin-bottom: 10px;
  color: ${Colors.text_active};
`;

export const StyledInputLabel = styled.Text`
    color: ${Colors.base_page}; /* Changed to your light background for contrast */
    font-family: 'Nunito-Regular'; 
    font-size: 13px;
    text-align: left;
`;

export const LeftIcon = styled.View`
    left: 17px;
    top: 35px;
    position: absolute;
    z-index: 1;
`;

export const RightIcon = styled.TouchableOpacity`
    right: 17px;
    top: 32px;
    position: absolute;
    z-index: 1;
`;

export const StyledButton = styled.TouchableOpacity`
    padding: 5px;
    background-color: ${Colors.button_loginsignup};
    justify-content: center;
    align-items: center;
    border-radius: 16px;  /* <--- ADD THIS (Adjust the number for more/less curve) */
    margin-vertical: 7;
    height: 49px;

    ${(props) => props.google == true && `
            background-color: ${Colors.base_page};
            flex-direction: row;
            justify-content: center;
        `
    }

    ${(props) => props.apple == true && `
            background-color: ${Colors.text_active};
            flex-direction: row;
            justify-content: center;
        `
    }
`;

export const ButtonText = styled.Text`
    /* Default color for the standard Login button */
    color: ${Colors.base_page}; 
    font-size: 20px;
    font-family: 'Nunito-Regular';
    text-align: center;

    /* If the google prop is true, override the color and padding */
    ${(props) => props.google === true && `
        color: ${Colors.text_active}; 
        padding: 5px; 
    `}

    /* If the apple prop is true, override the color and padding */
    ${(props) => props.apple === true && `
        color: ${Colors.white}; 
        padding: 5px; 
    `}
`;
export const MsgBox = styled.Text`
    text-align: center;
    font-size: 13px;
    color: ${Colors.text_active};
`;

export const LineContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin-vertical: 20px;
`;

export const Line = styled.View`
    flex: 1;
    height: 1px;
    background-color: #FFFFFF; /* or your Colors.darkLight */
`;

export const OrText = styled.Text`
    color: #FFFFFF;
    padding-horizontal: 5px;
    font-size: 14px;
    text-align: center;
`;

export const GoogleLogo = styled.Image`
    width: 20px;
    height: 20px;
    margin-right: 10px;
`;

export const ExtraView = styled.View`
    justify-content: center;
    flex-direction: row;
    align-items: center;
    padding: 20px;
`;

export const ExtraText = styled.Text`
    justify-content: center;
    align-items: center;
    color: ${Colors.white};
    font-size: 16px;
`;

export const TextLink = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
`;

export const TextLinkContent = styled.Text`
    color: ${Colors.button_loginsignup};
    font-size: 16px;
`;      