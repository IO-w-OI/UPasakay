import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

const StatusBarHeight = Constants.statusBarHeight;

// colors
export const Colors = {
    //Font Colors
    text_idle: '#8D8D8D',
    text_active: '#000000',
    golden_brown: '#7A4A00',

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
// Add (props) logic to the colors array
export const StyledContainer = styled(LinearGradient).attrs((props) => ({
    // It will look for a 'colors' prop first, otherwise use defaults
    colors: props.colors || [top_loginsignup, bottom_loginsignup],
}))`
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
    width: 95%;
`;


export const StyledInputLabel = styled.Text`
    color: ${Colors.white};
    font-size: 13px;
    text-align: left;
`;

export const LeftIcon = styled.View`
    position: absolute;
    left: 17px;
    z-index: 1;
`;

export const RightIcon = styled.TouchableOpacity`
    position: absolute;
    right: 17px;
    z-index: 1;
`;

// Make sure your Input doesn't have huge margins that push it away from the icons
export const StyledTextInput = styled.TextInput`
    background-color: ${Colors.base_page};
    padding: 15px;
    padding-left: 55px;
    padding-right: 55px;
    border-radius: 16px;
    font-size: 16px;
    height: 55px;
    color: ${Colors.text_active};
    margin-bottom: 1px;
`;

export const BasePage = styled.View`
    flex: 1;
    width: 100%;
    background-color: ${Colors.base_page};
    border-radius: 16px;
    padding: 20px;
    align-items: center;
`;

export const StyledButton = styled.TouchableOpacity`
    padding: 5px;
    background-color: ${Colors.button_loginsignup};
    justify-content: center;
    align-items: center;
    border-radius: 16px;  /* <--- ADD THIS (Adjust the number for more/less curve) */
    margin-vertical: 7px;
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

    /* iOS Shadow Properties */
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.25;
    shadow-radius: 4px;

    /* Android Shadow Property */
    elevation: 5;
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
    margin-vertical: 5px;
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
    width: 100%;
    align-items: center;
    justify-content: center;
    /* REDUCE THIS VALUE */
    margin-top: 10px;   /* Was probably 15px or 20px */
    padding-bottom: 10px; 
`;

export const ExtraText = styled.Text`
    justify-content: center;
    align-items: center;
    color: ${Colors.white};
    font-size: 16px;
    margin-top: 15px;
`;

export const TextLink = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
`;

export const TextLinkContent = styled.Text`
    color: ${Colors.button_loginsignup};
    font-size: 16px;
`;

export const ExtraSmallText = styled.Text`
    font-size: 12px;
    color: ${Colors.white};
    text-align: center; /* Standard centering for all platforms */
    line-height: 20px;
`;

export const SmallTextLink = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
`;

export const SmallTextLinkContent = styled.Text`
    color: ${Colors.brand};
    font-size: 13px;
    font-weight: regular;
    text-decoration-line: underline; 
    
    /* If you actually want a strike-through: */
    /* text-decoration-line: line-through; */

    /* If you want BOTH for some reason: */
    /* text-decoration-line: underline line-through; */
`;

export const Header = styled.Text`
    margin-top: 10px;
    font-size: 35px;
    color: ${Colors.text_active};
    text-align: left; 
    font-family: 'Nunito-Bold';
    
    /* ADD THESE TWO LINES */
    align-self: flex-start;
    width: 100%;
`;

export const SubHeader = styled.Text`
    margin-top: 10px;
    font-size: 20px;
    color: ${Colors.text_active};
    text-align: left; 
    font-family: 'Nunito-Bold';
    
    /* ADD THESE TWO LINES */
    align-self: flex-start;
    width: 120%;
`;