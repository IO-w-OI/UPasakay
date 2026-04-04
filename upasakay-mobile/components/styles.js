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
    cream: '#FEF3DC',

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
export const StyledContainer = styled(LinearGradient).attrs((props) => ({
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
    /* Use specific horizontal padding for more control */
    padding-vertical: 20px;
    padding-horizontal: 10px; 
    align-items: flex-start;
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
    font-family: 'Nunito-Bold';

    /* 1. Change width to auto so it only takes up as much space as the text */
    width: auto;

    /* 2. Force the component itself to the start of the flex container */
    align-self: flex-start;

    /* 3. Explicitly set text-align to left */
    text-align: left;

    /* 4. Use a negative margin to 'cheat' past any parent padding */
    margin-left: -15px; 
`;

export const SubHeader = styled.Text`
    margin-top: 10px;
    margin-left: -15px; 
    font-size: 20px;
    color: ${Colors.text_active};
    text-align: left; 
    font-family: 'Nunito-Bold';
    
    /* ADD THESE TWO LINES */
    align-self: flex-start;
    width: 120%;
`;

//Recents Page Card Settings

export const TripCard = styled.View`
    width: 355px;
    height: 143px;
    align-self: center;
    margin-bottom: 20px;
    shadow-color: rgba(0, 0, 0, 0.25);
    shadow-offset: 0px 4px;
    shadow-opacity: 1;
    shadow-radius: 1px;
    elevation: 4;
`;

export const CardTop = styled.View`
    width: 355px;
    height: 95px;
    background-color: #FEF3DC;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 15px;
    flex-direction: row;
    align-items: flex-start;
`;

export const CardBottom = styled.TouchableOpacity`
    width: 355px;
    height: 46px;
    background-color: #FEF3DC;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border-top-width: 1px;
    border-top-color: rgba(0, 0, 0, 0.05);
    justify-content: center;
    padding-left: 20px;
    margin-top: 2px; /* <--- Adds a tiny physical gap between the sections */
`;

export const BusIconContainer = styled.View`
    width: 40px;
    height: 40px;
    justify-content: center;
    align-items: center;
`;

export const TripInfo = styled.View`
    flex: 1;
    margin-left: 10px;
`;

export const TripTitle = styled.Text`
    font-size: 16px;
    color: ${Colors.text_active};
    font-family: 'Nunito-Bold';
`;

export const TripDate = styled.Text`
    font-size: 13px;
    color: ${Colors.text_active};
    margin-top: 8px;
    font-family: 'Nunito-Regular';
`;

export const StatusPill = styled.View`
    padding-horizontal: 8px;
    padding-vertical: 4px;
    border-radius: 10px;
    background-color: ${props => props.completed ? '#55975C' : '#ADADAD'};
`;

export const StatusText = styled.Text`
    color: ${Colors.white};
    font-size: 10px;
    font-family: 'Nunito-Bold';
`;

export const ParaUlitText = styled.Text`
    color: ${Colors.para_ulit};
    font-family: 'Nunito-Bold';
    font-size: 14px;
`;

export const FloatingNavContainer = styled.View`
    position: absolute;
    bottom: 30px;
    left: 20px;
    right: 20px;
    height: 70px;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 35px;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    border-width: 1px;
    border-color: rgba(255, 255, 255, 0.5);
    overflow: hidden;
`;