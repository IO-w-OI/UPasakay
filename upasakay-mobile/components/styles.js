import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

import { moderateScale } from '../utils/responsive';

const StatusBarHeight = Constants.statusBarHeight;

// Card width shared by the Profile menu cards / section headers.
// Declared up here so SectionHeader can reference it (it used to crash:
// SectionHeader was defined before CARD_WIDTH was declared).
const CARD_WIDTH = '90%';

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
    margin-bottom: 0px;
`;

export const BasePage = styled.View`
    flex: 1;
    width: 100%;
    background-color: ${Colors.base_page};
    border-radius: 16px;
    /* Use specific horizontal padding for more control */
    padding-vertical: 10px;
    padding-horizontal: 10px; 
    align-items: flex-start;
`;

export const StyledButton = styled.TouchableOpacity`
    padding: 5px;
    background-color: ${Colors.button_loginsignup};
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    margin-vertical: 7px;
    height: ${moderateScale(52)}px;

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
    font-size: ${moderateScale(17)}px;
    font-family: 'Nunito-SemiBold';
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
    font-size: ${moderateScale(28)}px;
    color: ${Colors.text_active};
    font-family: 'Nunito-Bold';
    align-self: flex-start;
    text-align: left;
`;

export const SubHeader = styled.Text`
    margin-top: 8px;
    font-size: ${moderateScale(18)}px;
    color: ${Colors.text_active};
    text-align: left;
    font-family: 'Nunito-Bold';
    align-self: flex-start;
`;

//Recents Page Card Settings

export const TripCard = styled.View`
    width: 92%;
    min-height: ${moderateScale(143)}px;
    align-self: center;
    margin-bottom: 10px;
    
    /* 1. Add the radius to the parent too */
    background-color: #FEF3DC; 
    border-radius: 20px; 

    /* 2. Elevation for Android Shadow */
    elevation: 8; 

    /* 3. iOS Shadow */
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.15;
    shadow-radius: 8px;

    /* 4. DO NOT USE overflow: hidden here, it will kill the shadow! */
    overflow: visible; 
`;

export const CardTop = styled.View`
    width: 100%;
    min-height: ${moderateScale(95)}px;
    background-color: #FEF3DC;
    /* 5. Keep these to match the parent */
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 15px;
    flex-direction: row;
    align-items: flex-start;
`;

export const CardBottom = styled.TouchableOpacity`
    width: 100%;
    height: ${moderateScale(46)}px;
    background-color: #FEF3DC;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    /* --- THE EMPHASIZED LINE --- */
    /* 1. Remove any margin so they touch perfectly */
    margin-top: 0px; 
    
    /* 2. Make the line thicker (try 1px or 1.5px) */
    border-top-width: 1.5px; 
    
    /* 3. Darken the color so it's visible (Using a semi-transparent black) */
    border-top-color: rgba(0, 0, 0, 0.1); 
    /* ---------------------------- */

    justify-content: center;
    padding-left: 20px;
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
    font-size: ${moderateScale(16)}px;
    color: ${Colors.text_active};
    font-family: 'Nunito-Bold';
`;

export const TripDate = styled.Text`
    font-size: ${moderateScale(12)}px;
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
    font-size: ${moderateScale(10)}px;
    font-family: 'Nunito-Bold';
`;

export const ParaUlitText = styled.Text`
    color: ${Colors.para_ulit};
    font-family: 'Nunito-Bold';
    font-size: ${moderateScale(14)}px;
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

// Profile Specifics
export const AvatarContainer = styled.View`
    margin-bottom: 5px;
`;

export const UserName = styled.Text`
    font-family: 'Nunito-Bold';
    font-size: ${moderateScale(20)}px;
    color: #1A2E1A;
`;

export const UserEmail = styled.Text`
    font-family: 'Nunito-SemiBold';
    font-size: ${moderateScale(14)}px;
    color: #1A2E1A;
    text-decoration-line: underline;
`;

export const UserRole = styled.Text`
    font-family: 'Nunito-Regular';
    font-size: ${moderateScale(14)}px;
    color: #1A2E1A;
    margin-top: 4px;
    margin-bottom: 3px;
    text-transform: capitalize;
`;

export const SectionHeader = styled.Text`
    /* Match CARD_WIDTH so it starts exactly where the card starts */
    width: ${CARD_WIDTH};
    align-self: center;

    font-family: 'Nunito-Bold';
    font-size: ${moderateScale(19)}px;
    color: #1A2E1A;
    margin-bottom: 10px;
    padding-left: 5px;
`;

// Single Item Container (CARD_WIDTH is declared at the top of this file)
export const SingleMenuItem = styled.TouchableOpacity`
    width: ${CARD_WIDTH};
    height: ${moderateScale(68)}px;
    background-color: #FFFFFF;
    /* CHANGE THIS: 20px is too sharp, 35px matches Figma's roundness */
    border-radius: 20px; 
    
    flex-direction: row;
    align-items: center;
    padding-horizontal: 20px;
    margin-bottom: 20px;
    align-self: center;

    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.15;
    shadow-radius: 8px;
    elevation: 5;
`;

export const MenuGroup = styled.View`
    width: ${CARD_WIDTH}; 
    background-color: #FFFFFF;
    /* CHANGE THIS: Matches the top card */
    border-radius: 20px; 
    
    margin-bottom: 15px;
    align-self: center;
    overflow: hidden; /* This is vital to keep the inner items rounded */

    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.15;
    shadow-radius: 8px;
    elevation: 5;
`;

// Items inside General - Height 83px
export const MenuItem = styled.TouchableOpacity`
    width: 100%;
    flex-direction: row;
    align-items: center;
    
    height: ${moderateScale(68)}px;

    padding-horizontal: 20px;
    
    border-bottom-width: ${props => props.last ? '0px' : '1px'};
    border-bottom-color: #F3F3F3;
`;

// Icon Box - Exact Color #B4DEC0
export const IconBox = styled.View`
    width: 36px;
    height: 36px;
    background-color: #B4DEC0; 
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
`;

export const LogOutButton = styled.TouchableOpacity`
    /* 1. Force the width to match your cards */
    width: 88%;
    height: ${moderateScale(54)}px;
    background-color: #8D1436;
    border-radius: 20px;
    
    /* 2. This is the fix: it forces the button to center and respect the width */
    align-self: center; 

    justify-content: center;
    align-items: center;
    
    /* Space from the General group */
    margin-top: 20px;
    
    /* Shadow for consistent 'pop' */
    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 5px;
    elevation: 8;
`;

/*
--
export const StyledButton = styled.TouchableOpacity`
    padding: 5px;
    background-color: ${Colors.button_loginsignup};
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    margin-vertical: 7px;
    height: 49px;

    shadow-color: #000;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.25;
    shadow-radius: 4px;
    elevation: 5;
`;
--
*/

export const MenuLabel = styled.Text`
    flex: 1;
    font-family: 'Nunito-SemiBold';
    font-size: ${moderateScale(15)}px;
    color: #1A2E1A;
`;

export const LogOutText = styled.Text`
    color: ${Colors.base_page};
    font-size: ${moderateScale(17)}px;
    font-family: 'Nunito-Bold';
    text-align: center;
`;

